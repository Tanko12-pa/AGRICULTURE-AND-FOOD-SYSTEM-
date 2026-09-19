import {
  HyperLocalWeather,
  HyperLocalHourlyPoint,
  DiseaseOutbreakRiskFactor,
  CropAnalysisResult,
  AlertNotification,
  DroneSprayAdvisory,
} from '../types';

const WEATHER_STORAGE_KEY = 'agri_hyperlocal_weather_cache_v1';

// Convert degrees (0 - 360) to 8-point compass bearing
export function degToCompass(deg: number): string {
  const val = Math.floor(deg / 45 + 0.5);
  const arr = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return arr[val % 8];
}

// Convert WMO Weather Code to human-readable agricultural description
export function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear Sky & Sun';
  if (code === 1 || code === 2) return 'Mostly Clear';
  if (code === 3) return 'Overcast Canopy';
  if (code === 45 || code === 48) return 'Ground Fog / Advection Fog';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 65) return 'Precipitation / Rain';
  if (code >= 71 && code <= 77) return 'Snow / Graupel';
  if (code >= 80 && code <= 82) return 'Heavy Showers';
  if (code >= 95) return 'Thunderstorm Front';
  return 'Partly Cloudy';
}

// Evaluate agricultural crop disease outbreak correlations based on hyper-local temperature, humidity, and precipitation chance
export function evaluateDiseaseOutbreakRisk(
  tempC: number,
  humidity: number,
  precipitationChance: number,
  precipitationMm: number,
  cropType = 'Tomato (Solanum lycopersicum)'
): {
  correlations: DiseaseOutbreakRiskFactor[];
  overallScore: number;
  overallLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  leafWetnessHours: number;
} {
  // Leaf wetness estimated duration from ambient humidity and precipitation probability
  const leafWetnessHours = Number(
    Math.max(
      0.5,
      (humidity - 55) * 0.22 +
        (precipitationChance > 50 ? 4.5 : precipitationChance > 20 ? 2.0 : 0.5) +
        precipitationMm * 1.8
    ).toFixed(1)
  );

  const correlations: DiseaseOutbreakRiskFactor[] = [];

  // 1. Alternaria Early Blight (Foliar Fungal Spore)
  // Optimal: 22-29°C, humidity > 70%, leaf wetness > 6 hrs, rain splash
  let earlyBlightScore = 20;
  if (tempC >= 20 && tempC <= 30) earlyBlightScore += 30;
  if (humidity >= 70) earlyBlightScore += Math.round((humidity - 70) * 1.5);
  if (precipitationChance >= 40) earlyBlightScore += 25;
  earlyBlightScore = Math.min(100, Math.max(10, Math.round(earlyBlightScore)));

  correlations.push({
    disease: 'Early Blight (Alternaria solani)',
    pathogen: 'Foliar Fungal Conidia',
    targetCrop: cropType,
    riskScore: earlyBlightScore,
    riskLevel: earlyBlightScore >= 80 ? 'Critical' : earlyBlightScore >= 60 ? 'High' : earlyBlightScore >= 40 ? 'Moderate' : 'Low',
    triggerMechanism: `${tempC}°C canopy warmth with ${humidity}% RH & ~${leafWetnessHours}h free moisture`,
    correlationExplanation: `Alternaria spores require continuous leaf wetness (>6h) and warm canopy conditions to penetrate foliar stomata and produce concentric necrotic lesions.`,
    recommendedAction: earlyBlightScore >= 60
      ? 'Deploy bio-fungicide (Bacillus subtilis / Copper hydroxide) immediately prior to rain event.'
      : 'Maintain preventive canopy scouting on lower, older leaves.',
    urgency: earlyBlightScore >= 80 ? 'Immediate Action' : earlyBlightScore >= 60 ? 'Within 24 Hours' : 'Routine',
  });

  // 2. Late Blight (Phytophthora infestans)
  // Water mold oomycete: cool & wet conditions (15-22°C, RH > 85%, rain)
  let lateBlightScore = 15;
  if (tempC >= 14 && tempC <= 23) lateBlightScore += 35;
  if (humidity >= 80) lateBlightScore += Math.round((humidity - 80) * 2.2);
  if (precipitationChance >= 50 || precipitationMm > 0.8) lateBlightScore += 30;
  lateBlightScore = Math.min(100, Math.max(8, Math.round(lateBlightScore)));

  correlations.push({
    disease: 'Late Blight (Phytophthora infestans)',
    pathogen: 'Oomycete Water Mold',
    targetCrop: cropType,
    riskScore: lateBlightScore,
    riskLevel: lateBlightScore >= 80 ? 'Critical' : lateBlightScore >= 60 ? 'High' : lateBlightScore >= 40 ? 'Moderate' : 'Low',
    triggerMechanism: `Cool canopy (${tempC}°C) + saturated moisture (${humidity}% RH, ${precipitationChance}% rain chance)`,
    correlationExplanation: `Zoospores swim in free water films across leaf surfaces; rapid stem collapse and foliar blighting occurs within 72 hours under sustained precipitation and high humidity.`,
    recommendedAction: lateBlightScore >= 60
      ? 'Restrict overhead irrigation. Apply protectant mandipropamid or cyazofamid barrier spray.'
      : 'Scout lowest canopy petioles for dark water-soaked lesions.',
    urgency: lateBlightScore >= 75 ? 'Immediate Action' : lateBlightScore >= 50 ? 'Within 24 Hours' : 'Routine',
  });

  // 3. Bacterial Spot & Speck (Xanthomonas / Pseudomonas)
  // Dispersed through rain splash and wind-driven moisture
  let bacterialScore = 10;
  if (precipitationChance >= 35 || precipitationMm > 0.4) bacterialScore += 38;
  if (tempC >= 23 && tempC <= 32) bacterialScore += 32;
  if (humidity > 72) bacterialScore += 20;
  bacterialScore = Math.min(100, Math.max(10, Math.round(bacterialScore)));

  correlations.push({
    disease: 'Bacterial Spot & Speck (Xanthomonas campestris)',
    pathogen: 'Gram-Negative Bacterium',
    targetCrop: cropType,
    riskScore: bacterialScore,
    riskLevel: bacterialScore >= 75 ? 'Critical' : bacterialScore >= 55 ? 'High' : bacterialScore >= 35 ? 'Moderate' : 'Low',
    triggerMechanism: `Rain splash dispersal (${precipitationChance}% rain prob, ${precipitationMm}mm) into stomata`,
    correlationExplanation: `Raindrops splash bacterial inocula across neighboring plant rows. Warm storm fronts accelerate exponential bacterial division in fruit parenchyma and foliage.`,
    recommendedAction: bacterialScore >= 55
      ? 'Apply preventive copper-mancozeb combination. Avoid machine pruning or cultivating while leaves are damp.'
      : 'Maintain preventive monitoring and sanitize pruning shears between row sectors.',
    urgency: bacterialScore >= 70 ? 'Within 24 Hours' : 'Routine',
  });

  // 4. Powdery Mildew (Leveillula taurica / Erysiphe)
  // Warm dry canopy with humid nights (22-30°C, RH 50-75%, low rain)
  let mildewScore = 20;
  if (tempC >= 22 && tempC <= 32) mildewScore += 35;
  if (humidity >= 50 && humidity <= 82) mildewScore += 25;
  if (precipitationChance < 30) mildewScore += 15; // Rain washes spores away
  mildewScore = Math.min(100, Math.max(10, Math.round(mildewScore)));

  correlations.push({
    disease: 'Powdery Mildew (Leveillula taurica)',
    pathogen: 'Obligate Biotrophic Fungus',
    targetCrop: cropType,
    riskScore: mildewScore,
    riskLevel: mildewScore >= 75 ? 'Critical' : mildewScore >= 55 ? 'High' : mildewScore >= 35 ? 'Moderate' : 'Low',
    triggerMechanism: `Warm canopy (${tempC}°C) under moderate RH (${humidity}%) without washing rains`,
    correlationExplanation: `Powdery mildew conidia germinate without free water films; warm daytime temperatures and high diurnal humidity swings accelerate powdery mycelial colonization.`,
    recommendedAction: mildewScore >= 60
      ? 'Apply potassium bicarbonate or micronized sulfur spray in early morning before high UV exposure.'
      : 'Inspect adaxial and abaxial surfaces of lower canopy leaves for white powdery lesions.',
    urgency: mildewScore >= 70 ? 'Within 24 Hours' : 'Routine',
  });

  const scores = correlations.map((c) => c.riskScore);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const maxScore = Math.max(...scores);
  const effectiveScore = Math.round(avgScore * 0.35 + maxScore * 0.65);

  const overallLevel: 'Low' | 'Moderate' | 'High' | 'Critical' =
    effectiveScore >= 75 ? 'Critical' : effectiveScore >= 55 ? 'High' : effectiveScore >= 35 ? 'Moderate' : 'Low';

  return {
    correlations,
    overallScore: effectiveScore,
    overallLevel,
    leafWetnessHours,
  };
}

// Assess spray window drift risk based on current hyper-local weather
export function evaluateSprayConditions(
  windSpeedKmh: number,
  humidity: number,
  precipitationMm: number,
  precipitationChance = 0
): { condition: 'Optimal' | 'Caution' | 'Warning' | 'Unfavorable'; summary: string } {
  if (precipitationMm > 0.4 || precipitationChance > 65) {
    return {
      condition: 'Unfavorable',
      summary: `High precipitation risk (${precipitationChance}%, ${precipitationMm}mm); chemical applications will wash off foliage before systemic absorption.`,
    };
  }
  if (windSpeedKmh > 20) {
    return {
      condition: 'Warning',
      summary: 'High wind speed (>20 km/h) creates severe off-target drift hazard.',
    };
  }
  if (windSpeedKmh > 12) {
    return {
      condition: 'Caution',
      summary: 'Moderate wind (12-20 km/h); utilize drift-reduction air-induction nozzles.',
    };
  }
  if (windSpeedKmh < 3) {
    return {
      condition: 'Caution',
      summary: 'Dead calm (<3 km/h); beware of atmospheric thermal inversion traps.',
    };
  }
  if (humidity < 38) {
    return {
      condition: 'Caution',
      summary: 'Low ambient humidity (<38%); fine droplets risk rapid evaporative loss.',
    };
  }
  if (humidity > 85) {
    return {
      condition: 'Caution',
      summary: 'Elevated humidity (>85%); extended droplet dry-down period; potential droplet coalescence.',
    };
  }
  return {
    condition: 'Optimal',
    summary: 'Ideal microclimate window: gentle breeze (3-12 km/h) & balanced humidity for canopy deposition.',
  };
}

// Evaluate drone-specific aerial spray drift risk and flight suitability
export function evaluateDroneSprayConditions(
  windSpeedKmh: number,
  windGustKmh?: number,
  windDirectionCompass = 'SW',
  humidity = 60
): DroneSprayAdvisory {
  const gusts = windGustKmh ?? Math.round(windSpeedKmh * 1.35 * 10) / 10;
  const windSpeedMph = Math.round(windSpeedKmh * 0.621371 * 10) / 10;
  const windSpeedMps = Math.round((windSpeedKmh / 3.6) * 10) / 10;

  // Severe / Restricted drone spray conditions:
  // Wind > 18 km/h (5 m/s or ~11.2 mph) or gusts > 24 km/h
  if (windSpeedKmh > 18 || gusts > 24) {
    return {
      status: 'RESTRICTED',
      windSpeedKmh,
      windSpeedMph,
      windSpeedMps,
      windGustKmh: gusts,
      windDirectionCompass,
      driftRiskLevel: 'Severe',
      title: 'RESTRICTED: High Wind Drift Hazard for Drone Sprays',
      warningNotice: `Wind speed (${windSpeedKmh} km/h, gusts ${gusts} km/h) exceeds safe UAV application threshold (18 km/h). Severe off-target droplet drift and rotor turbulence will occur.`,
      recommendation: 'Ground all drone spraying operations. Wait for evening twilight or early morning calm window (<12 km/h).',
      maxRecommendedSpeedKmh: 18,
      isImpacted: true,
      flightSafetyScore: Math.max(15, Math.round(100 - (windSpeedKmh - 18) * 6)),
      nozzleSuggestion: 'Air-Induction Ultra Coarse (XC / UC) - Operations Paused',
      maxFlightAltitudeMeters: 1.2,
    };
  }

  // Caution condition:
  // Wind 12 - 18 km/h or gusts 18 - 24 km/h, OR dead calm < 3 km/h (thermal inversion risk)
  if (windSpeedKmh > 12 || gusts > 18) {
    return {
      status: 'CAUTION',
      windSpeedKmh,
      windSpeedMph,
      windSpeedMps,
      windGustKmh: gusts,
      windDirectionCompass,
      driftRiskLevel: 'High',
      title: 'CAUTION: Elevated Crosswind Drift Risk for Drone Sprays',
      warningNotice: `Wind speed (${windSpeedKmh} km/h, gusts ${gusts} km/h) approaches upper threshold. Rotor downwash envelope is compressed, increasing downwind drift.`,
      recommendation: 'Reduce UAV flight altitude to ≤1.5m above canopy, lower flight speed to ≤3.5 m/s, calibrate to coarse droplets (>350 µm), and verify downwind buffer zone (30m).',
      maxRecommendedSpeedKmh: 18,
      isImpacted: true,
      flightSafetyScore: 55,
      nozzleSuggestion: 'Air-Induction Coarse (C / VC) with Drift Retardant Adjuvant',
      maxFlightAltitudeMeters: 1.5,
    };
  }

  if (windSpeedKmh < 3) {
    return {
      status: 'CAUTION',
      windSpeedKmh,
      windSpeedMph,
      windSpeedMps,
      windGustKmh: gusts,
      windDirectionCompass,
      driftRiskLevel: 'Moderate',
      title: 'CAUTION: Dead Calm / Potential Thermal Inversion',
      warningNotice: `Near-zero wind speed (${windSpeedKmh} km/h) during clear sky may indicate surface temperature inversion. Fine droplets may remain suspended and drift unpredictably.`,
      recommendation: 'Check vertical temperature gradient. Switch to medium-coarse droplets to ensure downward gravitational settling into lower canopy.',
      maxRecommendedSpeedKmh: 18,
      isImpacted: true,
      flightSafetyScore: 72,
      nozzleSuggestion: 'Medium-Coarse Flat Fan (M / C)',
      maxFlightAltitudeMeters: 2.0,
    };
  }

  // Optimal condition:
  // Wind 3 - 12 km/h
  return {
    status: 'OPTIMAL',
    windSpeedKmh,
    windSpeedMph,
    windSpeedMps,
    windGustKmh: gusts,
    windDirectionCompass,
    driftRiskLevel: 'Low',
    title: 'OPTIMAL: Ideal Drone Spray Window',
    recommendation: 'Consistent gentle breeze (3-12 km/h). Rotor downwash drives droplets deeply into under-canopy foliage with minimal drift.',
    maxRecommendedSpeedKmh: 18,
    isImpacted: false,
    flightSafetyScore: 96,
    nozzleSuggestion: 'Standard Extended Range or Low-Drift (M / C)',
    maxFlightAltitudeMeters: 2.5,
  };
}

export type MockWeatherScenario =
  | 'auto'
  | 'high_disease_risk'
  | 'optimal_spray'
  | 'storm_soaking'
  | 'arid_heat'
  | 'high_wind_drift';

// Mock Weather Service: provides hyper-local climate data and disease outbreak correlations for given GPS coordinates
export function getMockHyperLocalClimateData(
  latitude: number,
  longitude: number,
  options?: {
    cropType?: string;
    scenario?: MockWeatherScenario;
    note?: string;
  }
): HyperLocalWeather {
  const cropType = options?.cropType || 'Tomato (Solanum lycopersicum)';
  const scenario = options?.scenario || 'auto';
  const now = new Date();

  let tempC = 24.5;
  let humidity = 74;
  let precipitationChance = 35;
  let precipitationMm = 0.2;
  let windSpeedKmh = 7.5;
  let windDirectionDeg = 215;
  let weatherCode = 2;
  let weatherDescription = 'Scattered Clouds & Warm Canopy';

  if (scenario === 'high_disease_risk') {
    // High disease outbreak condition (warm, humid, high rain prob)
    tempC = 25.8;
    humidity = 88;
    precipitationChance = 78;
    precipitationMm = 3.6;
    windSpeedKmh = 14.2;
    windDirectionDeg = 195;
    weatherCode = 80;
    weatherDescription = 'Humid Pre-Storm Overcast • Heavy Disease Spore Pressure';
  } else if (scenario === 'optimal_spray') {
    tempC = 19.4;
    humidity = 58;
    precipitationChance = 10;
    precipitationMm = 0.0;
    windSpeedKmh = 6.2;
    windDirectionDeg = 310;
    weatherCode = 1;
    weatherDescription = 'Clear & Calm Morning • Optimal Spray Window';
  } else if (scenario === 'storm_soaking') {
    tempC = 20.8;
    humidity = 94;
    precipitationChance = 92;
    precipitationMm = 14.8;
    windSpeedKmh = 24.5;
    windDirectionDeg = 160;
    weatherCode = 95;
    weatherDescription = 'Thunderstorm Front • Saturated Soil & Foliage';
  } else if (scenario === 'arid_heat') {
    tempC = 33.5;
    humidity = 28;
    precipitationChance = 5;
    precipitationMm = 0.0;
    windSpeedKmh = 11.0;
    windDirectionDeg = 45;
    weatherCode = 0;
    weatherDescription = 'Intense Sunlight & Heat Stress';
  } else if (scenario === 'high_wind_drift') {
    tempC = 23.4;
    humidity = 48;
    precipitationChance = 12;
    precipitationMm = 0.0;
    windSpeedKmh = 22.8;
    windDirectionDeg = 295;
    weatherCode = 2;
    weatherDescription = 'Brisk Gusty Wind Front • UAV Drone Sprays Grounded';
  } else {
    // 'auto' scenario: deterministic microclimate based on GPS coordinates and diurnal hour
    const hour = now.getHours() + now.getMinutes() / 60;
    const solarFactor = Math.sin(((hour - 8) / 24) * 2 * Math.PI);
    const baseTemp = 23.0 + solarFactor * 5.5 - (Math.abs(latitude) - 38.5) * 0.35;
    tempC = Math.round(baseTemp * 10) / 10;

    // Humidity varies inversely with temperature plus longitudinal microclimate offset
    const lngOffset = (Math.abs(longitude) * 10) % 5;
    humidity = Math.min(96, Math.max(32, Math.round(76 - solarFactor * 24 + lngOffset)));

    // Precipitation chance calculated from humidity and coordinate factors
    const rainSeed = Math.abs(Math.sin(latitude * 12.3 + longitude * 4.5));
    if (humidity > 80) {
      precipitationChance = Math.min(95, Math.round(50 + rainSeed * 45));
      precipitationMm = Math.round((rainSeed * 4.5) * 10) / 10;
    } else if (humidity > 65) {
      precipitationChance = Math.min(70, Math.round(20 + rainSeed * 35));
      precipitationMm = precipitationChance > 45 ? 0.8 : 0.1;
    } else {
      precipitationChance = Math.max(5, Math.round(rainSeed * 25));
      precipitationMm = 0.0;
    }

    windSpeedKmh = Math.round((6.5 + Math.max(0, solarFactor) * 4.2 + (Math.abs(latitude * 8) % 4)) * 10) / 10;
    windDirectionDeg = Math.round((200 + (latitude * 18 + longitude * 12) % 120) % 360);
    weatherCode = precipitationChance > 60 ? 61 : humidity > 75 ? 3 : solarFactor > 0 ? 1 : 2;
    weatherDescription =
      precipitationChance > 60
        ? 'Rain Showers & Humid Foliage'
        : humidity > 75
        ? 'Overcast Canopy & Dew Formation'
        : solarFactor > 0
        ? 'Clear Sky & Sun'
        : 'Partly Cloudy Night';
  }

  const tempF = Math.round(((tempC * 9) / 5 + 32) * 10) / 10;
  const windSpeedMps = Math.round((windSpeedKmh / 3.6) * 10) / 10;
  const windSpeedMph = Math.round((windSpeedKmh * 0.621371) * 10) / 10;
  const windGustKmh = Math.round((windSpeedKmh * 1.38 + (Math.abs(latitude * 5) % 2) * 0.5) * 10) / 10;
  const windGustMph = Math.round((windGustKmh * 0.621371) * 10) / 10;
  const windDirectionCompass = degToCompass(windDirectionDeg);
  const apparentTemperatureC = Math.round((tempC + (humidity / 100) * 2.1 - (windSpeedKmh / 22) * 0.9) * 10) / 10;
  const dewPointC = Math.round((tempC - (100 - humidity) / 5) * 10) / 10;
  const soilTemperatureC = Math.round((tempC * 0.85 + 4.2) * 10) / 10;

  const spray = evaluateSprayConditions(windSpeedKmh, humidity, precipitationMm, precipitationChance);
  const droneSprayAdvisory = evaluateDroneSprayConditions(windSpeedKmh, windGustKmh, windDirectionCompass, humidity);
  const leafWetnessRisk: 'Low' | 'Moderate' | 'High' =
    precipitationChance > 50 || humidity > 80 ? 'High' : humidity > 62 ? 'Moderate' : 'Low';

  const outbreakEvaluation = evaluateDiseaseOutbreakRisk(
    tempC,
    humidity,
    precipitationChance,
    precipitationMm,
    cropType
  );

  // 6-hour projection
  const hourlyForecast: HyperLocalHourlyPoint[] = [];
  for (let i = 1; i <= 6; i++) {
    const projHour = (now.getHours() + i) % 24;
    const projSolar = Math.sin(((projHour - 8) / 24) * 2 * Math.PI);
    const projTemp = Math.round((tempC + (projSolar - Math.sin(((now.getHours() - 8) / 24) * 2 * Math.PI)) * 3.5) * 10) / 10;
    const projHum = Math.min(98, Math.max(30, Math.round(humidity - (projTemp - tempC) * 2.8)));
    const projRain = Math.min(95, Math.max(5, Math.round(precipitationChance + (i % 2 === 0 ? 5 : -5))));
    const projWind = Math.round((windSpeedKmh + (i % 3 === 0 ? 1.5 : -1.0)) * 10) / 10;

    hourlyForecast.push({
      time: `${projHour.toString().padStart(2, '0')}:00`,
      temperatureC: projTemp,
      humidity: projHum,
      windSpeedKmh: Math.max(2, projWind),
      precipitationChance: projRain,
    });
  }

  const result: HyperLocalWeather = {
    latitude: Math.round(latitude * 10000) / 10000,
    longitude: Math.round(longitude * 10000) / 10000,
    temperatureC: tempC,
    temperatureF: tempF,
    humidity,
    precipitationChance,
    windSpeedKmh,
    windSpeedMps,
    windSpeedMph,
    windGustKmh,
    windGustMph,
    windDirectionDeg,
    windDirectionCompass,
    apparentTemperatureC,
    weatherCode,
    weatherDescription,
    dewPointC,
    precipitationMm,
    sprayCondition: spray.condition,
    sprayConditionSummary: spray.summary,
    droneSprayAdvisory,
    leafWetnessRisk,
    lastUpdated: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    source: options?.note || 'Mock Hyper-Local Geolocation Weather Service (Agri-Vision RTK Engine)',
    isOfflineCached: true,
    hourlyForecast,
    diseaseCorrelations: outbreakEvaluation.correlations,
    overallOutbreakRiskScore: outbreakEvaluation.overallScore,
    overallOutbreakRiskLevel: outbreakEvaluation.overallLevel,
    leafWetnessHours: outbreakEvaluation.leafWetnessHours,
    soilTemperatureC,
  };

  saveStoredHyperLocalWeather(result);
  return result;
}

// Generate deterministic microclimate model based on GPS coordinates and solar hour
export function generateSyntheticMicroclimate(
  latitude: number,
  longitude: number,
  note = 'Offline Microclimate Mesh'
): HyperLocalWeather {
  return getMockHyperLocalClimateData(latitude, longitude, { note });
}

/**
 * Fetch real-time hyper-local weather based on live GPS coordinates (latitude, longitude).
 * Queries Open-Meteo high-resolution meteorological API with automatic timeout
 * and falls back to persistent offline cache / deterministic RTK microclimate model.
 */
export async function fetchHyperLocalWeather(
  latitude: number,
  longitude: number,
  cropType = 'Tomato (Solanum lycopersicum)'
): Promise<HyperLocalWeather> {
  // If browser is explicitly offline, immediately serve from offline cache or synthetic model
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const cached = getStoredHyperLocalWeather();
    if (cached) return { ...cached, isOfflineCached: true, source: 'Offline Local Storage Cache' };
    return getMockHyperLocalClimateData(latitude, longitude, { cropType, note: 'Offline Edge Microclimate Model' });
  }

  const roundedLat = Math.round(latitude * 10000) / 10000;
  const roundedLng = Math.round(longitude * 10000) / 10000;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${roundedLat}&longitude=${roundedLng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability&forecast_days=1&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6500);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    const tempC = Math.round(Number(current.temperature_2m) * 10) / 10;
    const tempF = Math.round(((tempC * 9) / 5 + 32) * 10) / 10;
    const humidity = Math.round(Number(current.relative_humidity_2m));
    const windSpeedKmh = Math.round(Number(current.wind_speed_10m) * 10) / 10;
    const windSpeedMps = Math.round((windSpeedKmh / 3.6) * 10) / 10;
    const windSpeedMph = Math.round((windSpeedKmh * 0.621371) * 10) / 10;
    const windGustKmh = Math.round((Number(current.wind_gusts_10m ?? (windSpeedKmh * 1.35))) * 10) / 10;
    const windGustMph = Math.round((windGustKmh * 0.621371) * 10) / 10;
    const windDirectionDeg = Math.round(Number(current.wind_direction_10m || 0));
    const windDirectionCompass = degToCompass(windDirectionDeg);
    const apparentTemperatureC = Math.round(Number(current.apparent_temperature ?? tempC) * 10) / 10;
    const weatherCode = Number(current.weather_code ?? 1);
    const precipitationMm = Math.round(Number(current.precipitation ?? 0) * 10) / 10;
    const dewPointC = Math.round((tempC - (100 - humidity) / 5) * 10) / 10;

    // Precipitation probability
    let precipitationChance = 0;
    if (data.hourly?.precipitation_probability && Array.isArray(data.hourly.precipitation_probability)) {
      precipitationChance = Number(data.hourly.precipitation_probability[0] || 0);
    } else {
      precipitationChance = precipitationMm > 0 ? 80 : humidity > 80 ? 45 : humidity > 65 ? 20 : 5;
    }

    const spray = evaluateSprayConditions(windSpeedKmh, humidity, precipitationMm, precipitationChance);
    const droneSprayAdvisory = evaluateDroneSprayConditions(windSpeedKmh, windGustKmh, windDirectionCompass, humidity);
    const leafWetnessRisk: 'Low' | 'Moderate' | 'High' =
      precipitationChance > 50 || precipitationMm > 0.2 || humidity > 82 ? 'High' : humidity > 64 ? 'Moderate' : 'Low';

    const outbreakEvaluation = evaluateDiseaseOutbreakRisk(
      tempC,
      humidity,
      precipitationChance,
      precipitationMm,
      cropType
    );

    // Parse hourly forecast (next 6 hours)
    const hourlyForecast: HyperLocalHourlyPoint[] = [];
    if (data.hourly && Array.isArray(data.hourly.time)) {
      const currentIsoHour = current.time ? current.time.slice(0, 13) : '';
      const startIndex = data.hourly.time.findIndex((t: string) => t.startsWith(currentIsoHour));
      const effectiveStart = startIndex >= 0 ? startIndex : 0;

      for (let i = effectiveStart; i < Math.min(effectiveStart + 6, data.hourly.time.length); i++) {
        const rawTime = data.hourly.time[i];
        const timePart = rawTime ? rawTime.split('T')[1]?.slice(0, 5) || `${i}:00` : `${i}:00`;
        hourlyForecast.push({
          time: timePart,
          temperatureC: Math.round(Number(data.hourly.temperature_2m?.[i] ?? tempC) * 10) / 10,
          humidity: Math.round(Number(data.hourly.relative_humidity_2m?.[i] ?? humidity)),
          windSpeedKmh: Math.round(Number(data.hourly.wind_speed_10m?.[i] ?? windSpeedKmh) * 10) / 10,
          precipitationChance: Number(data.hourly.precipitation_probability?.[i] ?? precipitationChance),
        });
      }
    }

    const weatherResult: HyperLocalWeather = {
      latitude: roundedLat,
      longitude: roundedLng,
      temperatureC: tempC,
      temperatureF: tempF,
      humidity,
      precipitationChance,
      windSpeedKmh,
      windSpeedMps,
      windSpeedMph,
      windGustKmh,
      windGustMph,
      windDirectionDeg,
      windDirectionCompass,
      apparentTemperatureC,
      weatherCode,
      weatherDescription: getWeatherDescription(weatherCode),
      dewPointC,
      precipitationMm,
      sprayCondition: spray.condition,
      sprayConditionSummary: spray.summary,
      droneSprayAdvisory,
      leafWetnessRisk,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source: 'Live Open-Meteo High-Res GPS Satellite Fix',
      isOfflineCached: false,
      hourlyForecast: hourlyForecast.length > 0 ? hourlyForecast : undefined,
      diseaseCorrelations: outbreakEvaluation.correlations,
      overallOutbreakRiskScore: outbreakEvaluation.overallScore,
      overallOutbreakRiskLevel: outbreakEvaluation.overallLevel,
      leafWetnessHours: outbreakEvaluation.leafWetnessHours,
      soilTemperatureC: Math.round((tempC * 0.85 + 4.2) * 10) / 10,
    };

    // Cache locally for offline resilience
    saveStoredHyperLocalWeather(weatherResult);
    return weatherResult;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Real-time weather API fetch failed or timed out; falling back to mock hyper-local service:', err);

    return getMockHyperLocalClimateData(latitude, longitude, { cropType, note: 'Mock Hyper-Local Weather Model (Fallback)' });
  }
}

// Local storage caching helpers
export function getStoredHyperLocalWeather(): HyperLocalWeather | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem(WEATHER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveStoredHyperLocalWeather(weather: HyperLocalWeather): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(weather));
  } catch (e) {
    console.warn('Failed to store hyperlocal weather cache', e);
  }
}

export interface DiseaseThresholdFosterItem {
  disease: string;
  pathogen: string;
  humidityThreshold: number;
  fosterReason: string;
  recommendedAction: string;
}

export interface WeatherCropThresholdEvaluation {
  isCautionTriggered: boolean;
  severity: 'normal' | 'caution' | 'critical';
  humidityLevel: number;
  humidityThreshold: number;
  triggeredDiseases: DiseaseThresholdFosterItem[];
  overallReason: string;
  cautionNotification: AlertNotification | null;
  cropHealthStatus: string;
  leafWetnessDurationHours: number;
}

/**
 * Cross-references real-time hyper-local weather data with crop health thresholds,
 * triggering an automatic 'Caution' notification if humidity levels reach a point
 * known to foster specific crop diseases (e.g. Late Blight, Early Blight, Bacterial Spot).
 */
export function crossReferenceWeatherWithCropThresholds(
  weather: HyperLocalWeather,
  crop?: CropAnalysisResult
): WeatherCropThresholdEvaluation {
  const humidity = weather.humidity;
  const tempC = weather.temperatureC;
  const precipChance = weather.precipitationChance ?? 0;
  const leafWetnessHours = weather.leafWetnessHours ?? (humidity > 80 ? 7.2 : humidity > 65 ? 4.5 : 1.5);
  const targetCrop = crop?.cropType || 'Tomato (Solanum lycopersicum)';
  const cropHealthScore = crop?.healthScore ?? 85;
  const existingFungalRisk = crop?.alertScores?.fungalRisk ?? 30;

  // Base threshold: 75% relative humidity is the standard agronomic boundary where foliar pathogens thrive.
  // If crop vigor is compromised (health score < 80 or existing fungal risk > 40), lower threshold to 68% for heightened sensitivity.
  const baselineThreshold = cropHealthScore < 80 || existingFungalRisk > 40 ? 68 : 75;

  const triggeredDiseases: DiseaseThresholdFosterItem[] = [];

  // Pathogen 1: Late Blight (Phytophthora infestans) - requires high RH >= 78% or saturated microclimate
  if (humidity >= 78 && tempC >= 13 && tempC <= 24) {
    triggeredDiseases.push({
      disease: 'Late Blight (Phytophthora infestans)',
      pathogen: 'Oomycete Water Mold',
      humidityThreshold: 78,
      fosterReason: `Relative humidity at ${humidity}% combined with ~${leafWetnessHours}h canopy wetness fosters zoospore release and penetration within 2 to 4 hours.`,
      recommendedAction: 'Apply protective systemic fungicide (e.g., mandipropamid or cymoxanil) immediately before storm rain events.',
    });
  }

  // Pathogen 2: Early Blight (Alternaria solani) - requires RH >= 72% in warm canopies
  if (humidity >= 72 && tempC >= 18 && tempC <= 30) {
    triggeredDiseases.push({
      disease: 'Early Blight (Alternaria solani)',
      pathogen: 'Foliar Ascomycete Fungus',
      humidityThreshold: 72,
      fosterReason: `High humidity (${humidity}%) and warm canopy (${tempC}°C) trigger rapid conidial germination on lower senescent leaves.`,
      recommendedAction: 'Apply preventive bio-fungicide (Bacillus subtilis) or copper hydroxide; prune lower damp leaves to improve airflow.',
    });
  }

  // Pathogen 3: Bacterial Spot / Speck (Xanthomonas / Pseudomonas) - requires RH >= 76% + rain splash
  if (humidity >= 76 && (precipChance >= 35 || weather.precipitationMm > 0)) {
    triggeredDiseases.push({
      disease: 'Bacterial Spot (Xanthomonas perforans)',
      pathogen: 'Gram-Negative Phytopathogenic Bacterium',
      humidityThreshold: 76,
      fosterReason: `High humidity (${humidity}%) with ${precipChance}% precipitation probability fosters droplet splash dispersal through stomata and hydathodes.`,
      recommendedAction: 'Avoid machine harvesting or field scouting while canopy foliage is wet. Apply preventive copper-mancozeb barrier.',
    });
  }

  // Pathogen 4: Powdery Mildew (Leveillula taurica) - thrives in RH >= 68% under warm ambient temps
  if (humidity >= 68 && tempC >= 20 && tempC <= 32 && precipChance < 40) {
    triggeredDiseases.push({
      disease: 'Powdery Mildew (Leveillula taurica)',
      pathogen: 'Obligate Biotrophic Fungus',
      humidityThreshold: 68,
      fosterReason: `Diurnal humidity levels (${humidity}%) under warm canopy (${tempC}°C) promote rapid conidiophore elongation without foliar wash-off.`,
      recommendedAction: 'Apply micronized sulfur or potassium bicarbonate spray during early morning calm window.',
    });
  }

  // Pathogen 5: Gray Mold (Botrytis cinerea) - fosters under extreme humidity >= 82%
  if (humidity >= 82) {
    triggeredDiseases.push({
      disease: 'Gray Mold (Botrytis cinerea)',
      pathogen: 'Necrotrophic Filamentous Fungus',
      humidityThreshold: 82,
      fosterReason: `Sustained relative humidity of ${humidity}% produces free condensed water film, allowing conidia to colonize blossoms and stem junctions.`,
      recommendedAction: 'Ventilate high tunnels; withhold overhead irrigation and apply fenhexamid or fludioxonil protectant.',
    });
  }

  const isCautionTriggered = humidity >= baselineThreshold || triggeredDiseases.length > 0;
  const severity: 'normal' | 'caution' | 'critical' = humidity >= 85 ? 'critical' : isCautionTriggered ? 'caution' : 'normal';

  let cautionNotification: AlertNotification | null = null;

  if (isCautionTriggered) {
    const diseaseNames = triggeredDiseases.map((d) => d.disease.split('(')[0].trim());
    const diseaseListStr = diseaseNames.length > 0 ? diseaseNames.join(', ') : 'Foliar Fungal Pathogens';

    cautionNotification = {
      id: `caution-humidity-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `⚠️ CAUTION: High Humidity Pathogen Threat (${humidity}%)`,
      message: `Canopy humidity (${humidity}%) has breached the safe threshold (${baselineThreshold}%) for ${targetCrop}. Current environmental conditions foster spore germination of ${diseaseListStr} (~${leafWetnessHours}h leaf wetness).`,
      severity: severity === 'critical' ? 'critical' : 'warning',
      priority: severity === 'critical' ? 'CRITICAL' : 'WARNING',
      category: 'disease_outbreak',
      urgency: 'Caution: Within 12-24 Hours',
      recommendedAction:
        triggeredDiseases[0]?.recommendedAction ||
        'Apply protective bio-fungicide barrier (e.g. Bacillus subtilis / copper hydroxide). Withhold overhead irrigation and inspect lower canopy.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      module: 'Crop Monitoring',
      read: false,
    };
  }

  const overallReason = isCautionTriggered
    ? `Canopy humidity of ${humidity}% exceeds the ${baselineThreshold}% critical threshold for ${targetCrop} (Health: ${cropHealthScore}%), fostering ${triggeredDiseases.length} known foliar pathogen(s).`
    : `Canopy humidity of ${humidity}% is currently within the safe agronomic range (<${baselineThreshold}%) with low spore germination pressure.`;

  return {
    isCautionTriggered,
    severity,
    humidityLevel: humidity,
    humidityThreshold: baselineThreshold,
    triggeredDiseases,
    overallReason,
    cautionNotification,
    cropHealthStatus: crop?.healthStatus || 'Good',
    leafWetnessDurationHours: leafWetnessHours,
  };
}


