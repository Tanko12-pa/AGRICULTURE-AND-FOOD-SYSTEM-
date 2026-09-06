import React, { useState, useRef, useEffect } from 'react';
import { Info, HelpCircle } from 'lucide-react';

export interface TelemetryFieldDefinition {
  name: string;
  label: string;
  category: 'crop' | 'pest' | 'quality' | 'general';
  dataType: string;
  description: string;
  benchmark?: string;
  unit?: string;
}

export const TELEMETRY_FIELD_DICTIONARY: Record<string, TelemetryFieldDefinition> = {
  // CROP TELEMETRY FIELDS
  cropType: {
    name: 'cropType',
    label: 'Crop Variety & Taxon',
    category: 'crop',
    dataType: 'string',
    description: 'Active botanical crop cultivar identified via high-resolution aerial and ground optical imaging (e.g., Soybean, Tomato, Maize).',
    benchmark: 'Calibrated per USDA botanical registry',
  },
  location: {
    name: 'location',
    label: 'Georeferenced Field Plot',
    category: 'crop',
    dataType: 'string',
    description: 'Designated agricultural zone and sub-plot coordinates mapping sensory telemetry to physical GPS field boundaries.',
    benchmark: 'Standardized GIS polygon plot designation',
  },
  healthStatus: {
    name: 'healthStatus',
    label: 'Health Classification Status',
    category: 'crop',
    dataType: 'enum ("Good" | "Moderate" | "Critical")',
    description: 'Triage tier based on multispectral chlorophyll absorption, necrotic tissue presence, and overall physiological vigor.',
    benchmark: '"Good" indicates > 80% photosynthetic capacity without pathogenic stress',
  },
  healthScore: {
    name: 'healthScore',
    label: 'Crop Health Index',
    category: 'crop',
    dataType: 'integer (0–100)',
    description: 'Holistic vitality index quantifying NDVI vegetative reflectance, canopy density, cellular turgidity, and leaf chlorosis.',
    benchmark: '85–100 = Optimal Vigor, 60–84 = Mild Stress, < 60 = Immediate Intervention Required',
    unit: 'points (0–100)',
  },
  diseaseDetected: {
    name: 'diseaseDetected',
    label: 'Pathological Diagnosis',
    category: 'crop',
    dataType: 'string',
    description: 'Specific fungal, bacterial, or viral disease classified using the PlantVillage and USDA Plant Pathology vision standards.',
    benchmark: 'Matched against 38 plant disease classes with Bayesian posterior verification',
  },
  confidence: {
    name: 'confidence',
    label: 'Classifier Confidence Score',
    category: 'crop',
    dataType: 'float (0.00–1.00)',
    description: 'Softmax probability score computed by the deep convolutional vision model representing statistical certainty of the diagnosis.',
    benchmark: 'Scores > 0.85 represent high-confidence automated field verdicts',
    unit: 'probability ratio (0.0–1.0)',
  },
  growthStage: {
    name: 'growthStage',
    label: 'Phenological Growth Stage',
    category: 'crop',
    dataType: 'string (BBCH scale / stage notation)',
    description: 'Current biological phase of crop maturation (e.g., V4 Vegetative, R1 Flowering, R3 Pod Fill, Breaker) governing irrigation and nutrient requirements.',
    benchmark: 'Follows standardized BBCH phenological scale',
  },
  weedPressurePercent: {
    name: 'weedPressurePercent',
    label: 'Weed Canopy Pressure',
    category: 'crop',
    dataType: 'percentage (0–100%)',
    description: 'Calculated proportion of competing non-crop invasive flora covering the soil bed within the analyzed sensor frame.',
    benchmark: '< 10% = Low Competition, 10–25% = Economic Threshold, > 25% = Spray Required',
    unit: '% canopy coverage',
  },
  weedSpecies: {
    name: 'weedSpecies',
    label: 'Identified Weed Taxa',
    category: 'crop',
    dataType: 'array of strings',
    description: 'Specific competing weed varieties (e.g., Pigweed, Foxtail, Palmer Amaranth) segmented through morphological edge analysis.',
    benchmark: 'Segmented with YOLO-Instance segmentation mask',
  },
  fungalRisk: {
    name: 'alertScores.fungalRisk',
    label: 'Fungal Sporulation Risk',
    category: 'crop',
    dataType: 'percentage (0–100%)',
    description: 'Probability of spore germination calculated by correlating leaf wetness duration, ambient humidity (>80%), and canopy temperature.',
    benchmark: '< 30% = Nominal, 30–65% = Moderate Preventive, > 65% = High Fungicide Window',
    unit: '% sporulation index',
  },
  weedCompetition: {
    name: 'alertScores.weedCompetition',
    label: 'Weed Nutrient Competition Index',
    category: 'crop',
    dataType: 'percentage (0–100%)',
    description: 'Estimated yield loss potential caused by weed root nutrient and solar light interception against target crop rows.',
    benchmark: '< 20% = Tolerable, > 40% = Mechanical or Targeted Herbicide Intervention',
    unit: '% competition index',
  },
  waterStress: {
    name: 'alertScores.waterStress',
    label: 'Evapotranspirative Water Stress',
    category: 'crop',
    dataType: 'percentage (0–100%)',
    description: 'Canopy temperature depression and thermal infrared variance indicating stomatal closure and root-zone soil moisture deficit.',
    benchmark: '< 25% = Field Capacity, > 50% = Drip Irrigation Trigger',
    unit: '% stress index',
  },
  treatmentPlan: {
    name: 'treatmentPlan',
    label: 'Integrated Treatment Protocol',
    category: 'crop',
    dataType: 'object { immediate, prevention, urgency }',
    description: 'Agronomic remedial roadmap comprising immediate curative actions and preventative cultural/environmental controls.',
    benchmark: 'Certified compliant with GlobalG.A.P. IPM standards',
  },

  // PEST TELEMETRY FIELDS
  pestDetected: {
    name: 'pestDetected',
    label: 'Pest Detection Trigger',
    category: 'pest',
    dataType: 'boolean',
    description: 'Binary flag indicating whether arthropod pests, larvae, pupae, or active foliar feeding damage were discovered by the optical pipeline.',
    benchmark: 'True triggers automated scouting alerts and severity indexing',
  },
  primaryPest: {
    name: 'primaryPest',
    label: 'Dominant Pest Species',
    category: 'pest',
    dataType: 'string (Common & Binomial)',
    description: 'Highest-threat insect pathogen detected on the foliage, including species classification (e.g., Pieris rapae, Spodoptera frugiperda).',
    benchmark: 'YOLOv8 multi-class object detection model verified',
  },
  severityIndex: {
    name: 'severityIndex',
    label: 'Pest Severity Index',
    category: 'pest',
    dataType: 'integer (0–100)',
    description: 'Composite Economic Injury Level (EIL) metric factoring pest count per plant, life cycle instar stage, and instantaneous feeding rate.',
    benchmark: '< 30 = Sub-Economic, 30–60 = Moderate Scouting, > 60 = Action Threshold Exceeded',
    unit: 'EIL index (0–100)',
  },
  severityCategory: {
    name: 'severityCategory',
    label: 'Severity Risk Tier',
    category: 'pest',
    dataType: 'enum ("Low" | "Moderate" | "Severe" | "Critical")',
    description: 'Standardized regulatory risk tier determining whether to deploy biological predators or escalate to targeted chemical intervention.',
    benchmark: 'Tiered according to agricultural extension service thresholds',
  },
  leafDamagePercentage: {
    name: 'leafDamagePercentage',
    label: 'Foliar Defoliation Area',
    category: 'pest',
    dataType: 'percentage (0–100%)',
    description: 'Exact percentage of leaf blade surface area destroyed or excised by piercing-sucking or chewing insect mouthparts.',
    benchmark: '< 5% = Cosmetic, 5–15% = Moderate, > 20% = Severe Yield Reduction',
    unit: '% leaf surface loss',
  },
  secondaryDiseases: {
    name: 'secondaryDiseases',
    label: 'Vector-Borne Pathogens',
    category: 'pest',
    dataType: 'array of { name, confidence }',
    description: 'Opportunistic bacterial and fungal infections entering the plant vascular system through pest puncture wounds and frass deposits.',
    benchmark: 'Identifies Cercospora, Sooty Mold, and Soft Rot secondary complexes',
  },
  recommendedAction: {
    name: 'recommendedAction',
    label: 'IPM Interventions (Bio vs Chem)',
    category: 'pest',
    dataType: 'object { biologicalControl, chemicalPesticide, quarantineRecommended }',
    description: 'Dual-track pest mitigation guidance balancing ecological biological control agents (beneficial insects) with emergency chemical thresholds.',
    benchmark: 'Aligned with EPA pollinator-safe application windows',
  },

  // QUALITY INSPECTION FIELDS
  batchId: {
    name: 'batchId',
    label: 'Traceability Batch ID',
    category: 'quality',
    dataType: 'string',
    description: 'Unique traceability lot identifier assigned to the harvested container or conveyor packing line run for farm-to-table provenance.',
    benchmark: 'Global Trade Item Number (GTIN) & GS1 compliant',
  },
  produceType: {
    name: 'produceType',
    label: 'Harvest Produce Specimen',
    category: 'quality',
    dataType: 'string',
    description: 'Commodity produce type undergoing high-speed optical conveyor grading and sorting.',
    benchmark: 'Specimen caliber standards loaded dynamically',
  },
  overallGrade: {
    name: 'overallGrade',
    label: 'Commercial Grade Rating',
    category: 'quality',
    dataType: 'enum ("Grade A" | "Grade B" | "Reject")',
    description: 'Commercial commodity grading tier determining market routing: Export Premium (Grade A), Domestic Retail (Grade B), or Non-Edible (Reject).',
    benchmark: 'Evaluated according to USDA Agricultural Marketing Service (AMS) produce grades',
  },
  decision: {
    name: 'decision',
    label: 'Pneumatic Sorting Decision',
    category: 'quality',
    dataType: 'enum ("ACCEPT" | "REJECT" | "DOWNGRADE")',
    description: 'Real-time actuation command transmitted to the conveyor pneumatic air-knife ejector gates for automated physical sorting.',
    benchmark: 'Sub-15ms line decision latency',
  },
  freshnessScore: {
    name: 'freshnessScore',
    label: 'Cellular Freshness Index',
    category: 'quality',
    dataType: 'percentage (0–100%)',
    description: 'Spectral reflectance measurement of cellular water content, cuticle sheen, and stem calyx turgidity indicating time elapsed since picking.',
    benchmark: '≥ 90% = Optimal Export Freshness, < 75% = Flagged for Quick Sale / Processing',
    unit: '% freshness index',
  },
  sizeShapeScore: {
    name: 'sizeShapeScore',
    label: 'Morphological Uniformity',
    category: 'quality',
    dataType: 'percentage (0–100%)',
    description: 'Geometric symmetry, aspect ratio, and caliber consistency compared to standard USDA diameter bell curves for the target fruit.',
    benchmark: '≥ 85% = High Uniformity required for automatic carton packing',
    unit: '% symmetry score',
  },
  colorScore: {
    name: 'colorScore',
    label: 'Color Chroma Uniformity',
    category: 'quality',
    dataType: 'percentage (0–100%)',
    description: 'CIE L*a*b* color space analysis measuring blush distribution, surface ripeness homogeneity, and absence of green shoulders or mottling.',
    benchmark: 'Matches calibrated color chart for premium market tier',
    unit: '% chroma uniformity',
  },
  defectsScore: {
    name: 'defectsScore',
    label: 'Blemish & Defect Ratio',
    category: 'quality',
    dataType: 'percentage (0–100%)',
    description: 'Quantification of skin fissures, mechanical bruising, blossom-end rot, insect punctures, and fungal spotting on produce surface.',
    benchmark: '< 5% = Premium Grade A, 5–15% = Domestic Grade B, > 15% = Reject',
    unit: '% surface defects',
  },
  exportQualityPercent: {
    name: 'batchStatistics.exportQualityPercent',
    label: 'Export Grade Yield',
    category: 'quality',
    dataType: 'percentage (0–100%)',
    description: 'Proportion of conveyor batch volume meeting international export phytosanitary and visual appearance specifications.',
    benchmark: 'High-margin target > 70% in premium orchards',
    unit: '% of batch volume',
  },
  domesticGradePercent: {
    name: 'batchStatistics.domesticGradePercent',
    label: 'Domestic Market Yield',
    category: 'quality',
    dataType: 'percentage (0–100%)',
    description: 'Proportion of produce meeting regional supermarket retail specifications with minor cosmetic variations.',
    benchmark: 'Typical packing line recovery buffer: 15–25%',
    unit: '% of batch volume',
  },
  rejectPercent: {
    name: 'batchStatistics.rejectPercent',
    label: 'Batch Reject Rate',
    category: 'quality',
    dataType: 'percentage (0–100%)',
    description: 'Fraction of produce diverted from food supply due to rot, severe cracking, or pathogen contamination.',
    benchmark: '< 5% is the benchmark standard for high-efficiency packing sheds',
    unit: '% of batch volume',
  },
  avgDiameterMm: {
    name: 'batchStatistics.avgDiameterMm',
    label: 'Mean Fruit Caliber',
    category: 'quality',
    dataType: 'float (mm)',
    description: 'Cross-sectional equatorial diameter averaged across all optical camera profiles in the active inspection batch.',
    benchmark: 'e.g., Tomatoes: 65–75mm for Grade A beefsteak; 50–60mm for Roma',
    unit: 'millimeters (mm)',
  },
  firmnessIndex: {
    name: 'batchStatistics.firmnessIndex',
    label: 'Non-Destructive Firmness',
    category: 'quality',
    dataType: 'float (0.0–10.0)',
    description: 'Acoustic impulse response and micro-deflection firmness rating estimating flesh density and shelf-life transit stability.',
    benchmark: '8.0–9.5 = Crisp / Long transit life, < 6.0 = Soft / Immediate consumption',
    unit: 'Durofel / Shore index',
  },
};

interface TelemetryTooltipProps {
  fieldKey: string;
  currentValue?: string | number | boolean;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  showIcon?: boolean;
}

export const TelemetryTooltip: React.FC<TelemetryTooltipProps> = ({
  fieldKey,
  currentValue,
  children,
  position = 'top',
  className = '',
  showIcon = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const def: TelemetryFieldDefinition = TELEMETRY_FIELD_DICTIONARY[fieldKey] || {
    name: fieldKey,
    label: fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
    category: 'general',
    dataType: 'telemetry metric',
    description: 'Real-time telemetry parameter generated by the Computer Vision and Sensor Fusion pipeline.',
  };

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let x = rect.left + scrollX + rect.width / 2;
    let y = rect.top + scrollY;

    if (position === 'top') {
      y = rect.top + scrollY - 10;
    } else if (position === 'bottom') {
      y = rect.bottom + scrollY + 10;
    } else if (position === 'left') {
      x = rect.left + scrollX - 10;
      y = rect.top + scrollY + rect.height / 2;
    } else if (position === 'right') {
      x = rect.right + scrollX + 10;
      y = rect.top + scrollY + rect.height / 2;
    }

    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible]);

  // Color theme based on category
  const categoryBadge =
    def.category === 'crop'
      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
      : def.category === 'pest'
      ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
      : def.category === 'quality'
      ? 'bg-blue-950/80 text-blue-300 border-blue-700/60'
      : 'bg-slate-900 text-slate-300 border-slate-700';

  return (
    <span
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className={`inline-flex items-center gap-1 cursor-help group/tip relative ${className}`}
      tabIndex={0}
      role="button"
      aria-label={`Telemetry info for ${def.label}`}
    >
      {children}
      {showIcon && (
        <span className="text-gray-400 group-hover/tip:text-[#1B4332] transition-colors inline-flex items-center">
          <Info className="w-3.5 h-3.5 opacity-60 group-hover/tip:opacity-100 transition-opacity" />
        </span>
      )}

      {/* Floating Tooltip Card */}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="fixed z-50 w-72 sm:w-80 p-3.5 rounded-xl bg-[#0f172a] text-slate-100 border border-slate-700/80 shadow-2xl backdrop-blur-md pointer-events-none text-left text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${Math.max(16, Math.min(window.innerWidth - 330, coords.x - 160))}px`,
            top:
              position === 'bottom'
                ? `${coords.y}px`
                : `${Math.max(16, coords.y - 12)}px`,
            transform: position === 'top' ? 'translateY(-100%)' : 'none',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-slate-100 text-xs font-display">{def.label}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-semibold ${categoryBadge}`}>
                  {def.category}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                payload key: {def.name}
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
              {def.dataType}
            </span>
          </div>

          {/* Description */}
          <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
            {def.description}
          </p>

          {/* Benchmark or live value */}
          <div className="pt-1.5 border-t border-slate-800/80 flex flex-col gap-1 text-[10px] font-mono">
            {def.benchmark && (
              <div className="flex items-start gap-1 text-slate-400">
                <span className="text-emerald-400 font-bold shrink-0">Benchmark:</span>
                <span className="text-slate-300">{def.benchmark}</span>
              </div>
            )}
            {currentValue !== undefined && (
              <div className="flex items-center justify-between text-slate-300 bg-slate-800/60 px-2 py-1 rounded">
                <span className="text-slate-400">Current Payload Value:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {typeof currentValue === 'boolean'
                    ? currentValue
                      ? 'true'
                      : 'false'
                    : String(currentValue)}
                  {def.unit && !String(currentValue).includes(def.unit.split(' ')[0]) ? ` ${def.unit}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
};
