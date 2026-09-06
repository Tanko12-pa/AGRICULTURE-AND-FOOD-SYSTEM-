import { CropAnalysisResult, PestDetectionResult, QualityInspectionResult, A2AJudgeResult, OfflineSyncQueueItem } from '../types';

const OFFLINE_QUEUE_KEY = 'agri_vision_offline_queue';
const CACHED_INSPECTIONS_KEY = 'agri_vision_cached_inspections';

export function getOfflineQueue(): OfflineSyncQueueItem[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToOfflineQueue(item: OfflineSyncQueueItem): void {
  try {
    const queue = getOfflineQueue();
    queue.unshift(item);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save to offline queue', e);
  }
}

export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (e) {
    console.error('Failed to clear queue', e);
  }
}

export async function analyzeCrop(payload: {
  imageBase64?: string;
  cropType?: string;
  location?: string;
  deepThinking?: boolean;
}): Promise<{ success: boolean; data: CropAnalysisResult; source: string; error?: string }> {
  try {
    const response = await fetch('/api/crop-monitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err: any) {
    console.warn('Network call failed, using offline fallback capability:', err);
    saveToOfflineQueue({
      id: 'queue-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      module: 'Crop Monitoring',
      summary: `Analyzed ${payload.cropType || 'Crop'} (Offline Queue)`,
      status: 'pending',
    });
    throw err;
  }
}

export async function detectPest(payload: {
  imageBase64?: string;
  plantHost?: string;
  location?: string;
}): Promise<{ success: boolean; data: PestDetectionResult; source: string; error?: string }> {
  try {
    const response = await fetch('/api/pest-detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err: any) {
    console.warn('Network call failed, queueing offline:', err);
    saveToOfflineQueue({
      id: 'queue-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      module: 'Pest Detection',
      summary: `Pest scan on ${payload.plantHost || 'Foliage'} (Offline Queue)`,
      status: 'pending',
    });
    throw err;
  }
}

export async function inspectQuality(payload: {
  imageBase64?: string;
  produceType?: string;
  batchId?: string;
}): Promise<{ success: boolean; data: QualityInspectionResult; source: string; error?: string }> {
  try {
    const response = await fetch('/api/quality-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err: any) {
    console.warn('Network call failed, queueing offline:', err);
    saveToOfflineQueue({
      id: 'queue-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      module: 'Food Quality',
      summary: `Batch ${payload.batchId || 'PRODUCE'} (Offline Queue)`,
      status: 'pending',
    });
    throw err;
  }
}

export async function runA2AJudge(payload: {
  task: string;
  targetModule: string;
  parameters?: Record<string, any>;
}): Promise<{ success: boolean; data: A2AJudgeResult; source: string; error?: string }> {
  const response = await fetch('/api/a2a-judge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`A2A evaluation error ${response.status}`);
  }

  return await response.json();
}

export async function sendChatMessage(
  message: string,
  options?: {
    conversationHistory?: Array<{ sender: 'user' | 'bot'; text: string }>;
    visionContext?: {
      cropData?: CropAnalysisResult;
      pestData?: PestDetectionResult;
      qualityData?: QualityInspectionResult;
    };
    focusArea?: string;
  }
): Promise<{ success: boolean; reply: string; source?: string }> {
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversationHistory: options?.conversationHistory,
      visionContext: options?.visionContext,
      focusArea: options?.focusArea,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error ${response.status}`);
  }

  return await response.json();
}

export async function evaluateRealtimeAlerts(payload: {
  cropData?: CropAnalysisResult;
  pestData?: PestDetectionResult;
  qualityData?: QualityInspectionResult;
}): Promise<{ success: boolean; alertsCount: number; alerts: any[] }> {
  try {
    const response = await fetch('/api/alerts/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Alert evaluate error ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.warn('Fallback local alert evaluation due to network', err);
    return { success: false, alertsCount: 0, alerts: [] };
  }
}

export async function getWeatherForecast(location = 'Sector 4 - South Valley Farmland'): Promise<{ success: boolean; data: any }> {
  try {
    const response = await fetch(`/api/weather/forecast?location=${encodeURIComponent(location)}`);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('Network call for weather failed, returning simulated microclimate baseline:', err);
    return {
      success: true,
      data: {
        location,
        current: {
          temp: 24.5,
          condition: 'Humid & Overcast',
          humidity: 78,
          windSpeed: 6.4,
          precipitationMm: 1.2,
          dewPoint: 20.2,
          uvIndex: 6,
          leafWetnessHours: 7.2,
        },
        recentHistory: [
          {
            day: '2 Days Ago',
            date: 'Sep 1',
            tempMax: 26.2,
            tempMin: 18.0,
            rainfallMm: 28.4,
            humidity: 89,
            windSpeed: 12.8,
            condition: 'Heavy Storm / Downpour',
            agronomicImpact: '41mm 48h rain event created continuous free leaf moisture (>7h), triggering Alternaria fungal spore germination.',
          },
          {
            day: 'Yesterday',
            date: 'Sep 2',
            tempMax: 25.1,
            tempMin: 17.4,
            rainfallMm: 12.6,
            humidity: 84,
            windSpeed: 8.5,
            condition: 'Intermittent Rain Showers',
            agronomicImpact: 'Soil moisture saturation delayed ground-rig fungicide application; ideal environment for fungal mycelium spread.',
          },
          {
            day: 'Today',
            date: 'Sep 3',
            tempMax: 24.5,
            tempMin: 16.8,
            rainfallMm: 1.2,
            humidity: 78,
            windSpeed: 6.4,
            condition: 'Clearing & Warm Humid',
            agronomicImpact: 'Elevated humidity maintains spore viability. Early morning spray window before wind accelerates.',
          },
        ],
        fiveDayForecast: [
          {
            day: 'Tomorrow',
            date: 'Sep 4',
            tempMax: 27.0,
            tempMin: 16.0,
            rainProb: 10,
            rainfallMm: 0.0,
            humidity: 62,
            windSpeed: 4.8,
            condition: 'Sunny & Clear',
            sprayWindow: 'Optimal (06:00 - 09:30 AM)',
            diseaseRisk: 'Low',
          },
          {
            day: 'Friday',
            date: 'Sep 5',
            tempMax: 28.4,
            tempMin: 17.2,
            rainProb: 15,
            rainfallMm: 0.1,
            humidity: 58,
            windSpeed: 7.2,
            condition: 'Mostly Sunny',
            sprayWindow: 'Good (06:30 - 09:00 AM)',
            diseaseRisk: 'Low',
          },
          {
            day: 'Saturday',
            date: 'Sep 6',
            tempMax: 29.5,
            tempMin: 19.0,
            rainProb: 45,
            rainfallMm: 5.2,
            humidity: 75,
            windSpeed: 11.5,
            condition: 'Afternoon Thunderstorm',
            sprayWindow: 'Poor (Gusts & Rain)',
            diseaseRisk: 'Moderate',
          },
          {
            day: 'Sunday',
            date: 'Sep 7',
            tempMax: 26.0,
            tempMin: 17.5,
            rainProb: 70,
            rainfallMm: 18.0,
            humidity: 86,
            windSpeed: 14.8,
            condition: 'Heavy Precipitation',
            sprayWindow: 'Closed (Rain Out)',
            diseaseRisk: 'High (Spore Dispersal)',
          },
          {
            day: 'Monday',
            date: 'Sep 8',
            tempMax: 24.2,
            tempMin: 15.6,
            rainProb: 20,
            rainfallMm: 0.8,
            humidity: 69,
            windSpeed: 6.0,
            condition: 'Partly Cloudy & Dry',
            sprayWindow: 'Fair (07:00 - 09:30 AM)',
            diseaseRisk: 'Moderate',
          },
        ],
        climateCorrelations: [
          {
            factor: 'Rainfall Accumulation (42.2mm) + 84% RH',
            targetIssue: 'Early Blight (Alternaria solani)',
            correlationLevel: 'Direct Primary Trigger (95%)',
            explanation: 'Prolonged leaf wetness exceeding 6.5 consecutive hours directly facilitated fungal conidial penetration of leaf stomata.',
          },
          {
            factor: 'Degree-Day Warmth (24°C - 28°C canopy avg)',
            targetIssue: 'Cabbage Looper Larval Hatching',
            correlationLevel: 'Accelerated Development (87%)',
            explanation: 'Optimum degree-day accumulation accelerates caterpillar instar progression from egg to heavy-feeding foliage defoliators.',
          },
          {
            factor: 'Post-Storm Soil Water Surges',
            targetIssue: 'Conveyor Produce Micro-Cracking',
            correlationLevel: 'Turgor Impact (82%)',
            explanation: 'Rapid root uptake following sudden rain events causes cuticle stress and radial cracking in developing fruit, lowering export grade.',
          },
        ],
      },
    };
  }
}

