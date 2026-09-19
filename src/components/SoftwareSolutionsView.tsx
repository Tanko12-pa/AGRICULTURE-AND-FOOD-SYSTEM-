import React, { useState, useMemo } from 'react';
import {
  Code2,
  BrainCircuit,
  Building2,
  Briefcase,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Database,
  Layers,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Download,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Lock,
  Cpu,
  BarChart3,
  SlidersHorizontal,
  Bot,
  Globe,
  Radio,
  FileText,
  Activity,
  ShoppingBag,
  Factory,
  Sprout,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { ActiveTab, AiDecisionTransformationResult } from '../types';
import {
  SOFTWARE_PILLARS,
  INDUSTRY_SECTOR_PRESETS,
  SoftwarePillarInfo,
  IndustrySectorPreset,
} from '../data/softwareSolutionsData';
import { transformDataToDecisions } from '../services/api';

interface SoftwareSolutionsViewProps {
  onNavigateTab?: (tab: ActiveTab) => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const SoftwareSolutionsView: React.FC<SoftwareSolutionsViewProps> = ({
  onNavigateTab,
  onOpenChatWithPrompt,
}) => {
  // Navigation within the Solutions Suite
  const [activeSubView, setActiveSubView] = useState<'pillars' | 'ai-engine' | 'architecture'>('pillars');
  const [selectedPillarId, setSelectedPillarId] = useState<string>('industry-specific');
  const [selectedSectorPreset, setSelectedSectorPreset] = useState<IndustrySectorPreset>(INDUSTRY_SECTOR_PRESETS[0]);

  // AI "Data to Decisions" Engine Form State
  const [industryInput, setIndustryInput] = useState<string>(INDUSTRY_SECTOR_PRESETS[0].name);
  const [businessGoalInput, setBusinessGoalInput] = useState<string>(INDUSTRY_SECTOR_PRESETS[0].primaryGoal);
  const [dataSummaryInput, setDataSummaryInput] = useState<string>(INDUSTRY_SECTOR_PRESETS[0].sampleDataDescription);
  const [challengesInput, setChallengesInput] = useState<string>(INDUSTRY_SECTOR_PRESETS[0].challenges);

  // Live Transformation State
  const [isTransforming, setIsTransforming] = useState<boolean>(false);
  const [activeTransformationResult, setActiveTransformationResult] = useState<AiDecisionTransformationResult>(
    INDUSTRY_SECTOR_PRESETS[0].defaultResult
  );
  const [resultSource, setResultSource] = useState<string>('RESEARCH_BENCHMARK');
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [interactiveMobilePlatform, setInteractiveMobilePlatform] = useState<'cross-platform' | 'native'>('cross-platform');

  // Selected Pillar Object
  const currentPillar = useMemo(() => {
    return SOFTWARE_PILLARS.find((p) => p.id === selectedPillarId) || SOFTWARE_PILLARS[0];
  }, [selectedPillarId]);

  // Handle Preset Switching
  const handleSelectSectorPreset = (preset: IndustrySectorPreset) => {
    setSelectedSectorPreset(preset);
    setIndustryInput(preset.name);
    setBusinessGoalInput(preset.primaryGoal);
    setDataSummaryInput(preset.sampleDataDescription);
    setChallengesInput(preset.challenges);
    setActiveTransformationResult(preset.defaultResult);
    setResultSource('RESEARCH_BENCHMARK');
  };

  // Run Real-Time AI Transformation
  const handleRunAiTransformation = async () => {
    setIsTransforming(true);
    try {
      const response = await transformDataToDecisions({
        industry: industryInput,
        businessGoal: businessGoalInput,
        dataSummary: dataSummaryInput,
        currentChallenges: challengesInput,
      });

      if (response && response.data) {
        setActiveTransformationResult(response.data);
        setResultSource(response.source || 'GEMINI_AI_RESEARCH_ENGINE');
      }
    } catch (err) {
      console.warn('Using local sector preset following server failure:', err);
      setActiveTransformationResult(selectedSectorPreset.defaultResult);
      setResultSource('ENTERPRISE_RESEARCH_BENCHMARK');
    } finally {
      setIsTransforming(false);
    }
  };

  // Copy Blueprint JSON to Clipboard
  const handleCopyBlueprintJson = () => {
    navigator.clipboard.writeText(JSON.stringify(activeTransformationResult, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Download Blueprint as File
  const handleDownloadBlueprint = () => {
    const blob = new Blob([JSON.stringify(activeTransformationResult, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enterprise-software-blueprint-${activeTransformationResult.industry.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format Recharts data from Predictive Analytics Foresight
  const foresightChartData = useMemo(() => {
    return (activeTransformationResult.predictiveAnalyticsForesight || []).map((item) => {
      // Extract numeric components for chart visualization
      const baselineNum = parseFloat(item.baselineValue.replace(/[^0-9.]/g, '')) || 50;
      const projectedNum = parseFloat(item.projectedValue.replace(/[^0-9.]/g, '')) || 85;
      return {
        kpi: item.kpi.length > 22 ? item.kpi.substring(0, 20) + '…' : item.kpi,
        fullKpi: item.kpi,
        Baseline: baselineNum,
        'Projected with AI': projectedNum,
        confidence: item.confidencePercent,
        horizon: item.foresightHorizon,
      };
    });
  }, [activeTransformationResult]);

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. HERO HEADER BANNER */}
      {/* ========================================================================= */}
      <section
        id="software-solutions-hero"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B4332] via-[#245640] to-[#122F23] text-white p-6 sm:p-8 border border-[#2D5A27] shadow-lg"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#2D5A27] text-[#D4A373] text-[11px] font-mono font-bold tracking-wider uppercase border border-[#3E7A38]">
              Enterprise Suite
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-[11px] font-mono font-bold tracking-wider uppercase border border-cyan-800/60 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Machine Learning & AI Research
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 text-[11px] font-mono font-bold tracking-wider uppercase border border-emerald-800/60">
              4 Core Pillars
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-display">
            AI-Powered Software Development & Enterprise Solutions
          </h1>

          <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-sans max-w-3xl">
            Transforming operational data into decisive action — engineered with the latest in machine learning
            and AI research. Build secure, scalable vertical solutions for Healthcare, Insurance, Retail,
            Manufacturing, and Agriculture with personalized CRM, robust e-commerce, and high-retention mobile apps.
          </p>

          {/* Quick Navigation Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveSubView('pillars')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                activeSubView === 'pillars'
                  ? 'bg-[#D4A373] text-[#1B4332] shadow-sm'
                  : 'bg-[#153427] text-white hover:bg-[#204a37] border border-[#2D5A27]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Explore 4 Core Pillars</span>
            </button>

            <button
              onClick={() => setActiveSubView('ai-engine')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                activeSubView === 'ai-engine'
                  ? 'bg-cyan-400 text-cyan-950 shadow-sm'
                  : 'bg-cyan-950/60 text-cyan-200 hover:bg-cyan-900/80 border border-cyan-700/50'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-300" />
              <span>Data-to-Decisions AI Engine</span>
              <span className="px-1.5 py-0.2 bg-cyan-400 text-cyan-950 text-[9px] font-mono font-bold rounded">
                LIVE
              </span>
            </button>

            <button
              onClick={() => setActiveSubView('architecture')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                activeSubView === 'architecture'
                  ? 'bg-emerald-400 text-emerald-950 shadow-sm'
                  : 'bg-[#153427] text-emerald-200 hover:bg-[#204a37] border border-[#2D5A27]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Architectural Blueprint</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SUB-VIEW 1: THE 4 CORE PILLARS (DETAILED BREAKDOWN) */}
      {/* ========================================================================= */}
      {activeSubView === 'pillars' && (
        <section className="space-y-6">
          {/* Pillar Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SOFTWARE_PILLARS.map((pillar) => {
              const isSelected = pillar.id === selectedPillarId;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setSelectedPillarId(pillar.id)}
                  className={`text-left p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-[#1B4332] shadow-md ring-2 ring-[#1B4332]/20'
                      : 'bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                          isSelected ? 'bg-[#1B4332] text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {pillar.id === 'industry-specific' && <Building2 className="w-5 h-5" />}
                        {pillar.id === 'custom-business' && <Briefcase className="w-5 h-5" />}
                        {pillar.id === 'ai-integration' && <BrainCircuit className="w-5 h-5" />}
                        {pillar.id === 'mobile-apps' && <Smartphone className="w-5 h-5" />}
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                        {pillar.badge}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-gray-900 leading-snug font-display">
                        {pillar.title}
                      </h2>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 font-sans">
                        {pillar.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between text-[11px] font-semibold text-[#1B4332]">
                    <span>{isSelected ? 'Active Details' : 'View Specifications'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Pillar Full Detail Panel */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#1B4332] text-white">
                    Pillar Specification
                  </span>
                  <span className="text-xs text-gray-400 font-mono">Enterprise Ready</span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 font-display">
                  {currentPillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-2xl font-sans">
                  {currentPillar.tagline}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setActiveSubView('ai-engine');
                    setBusinessGoalInput(currentPillar.title);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#204a37] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Run Data-to-Decisions Engine</span>
                </button>
              </div>
            </div>

            {/* Core User Requirements Bullets (Verbatim from User Prompt) */}
            <div className="bg-[#F8FAF8] rounded-xl p-4.5 border border-[#E2E8E2] space-y-2">
              <div className="text-xs font-mono font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />
                <span>Core Functional Mandates</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {currentPillar.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-gray-200/80 text-xs text-gray-800 flex items-start gap-2.5 shadow-2xs font-sans leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center font-mono font-bold shrink-0 text-[11px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics & Benchmarks Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currentPillar.metrics.map((metric, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
                  <div className="text-[11px] font-medium text-gray-500 font-sans">{metric.label}</div>
                  <div className="text-xl font-black text-gray-900 font-mono tracking-tight">{metric.value}</div>
                  <div className="text-[11px] text-gray-500 font-sans">{metric.subtext}</div>
                </div>
              ))}
            </div>

            {/* Deliverables & Technology Stack Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-900 font-display flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#D4A373]" />
                  <span>Production Deliverables & Modules</span>
                </div>
                <div className="space-y-2">
                  {currentPillar.deliverables.map((d, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-800 flex items-center gap-2 font-sans"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1B4332] shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-900 font-display flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#1B4332]" />
                  <span>Recommended Technology Stack</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentPillar.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-xs font-mono font-medium text-gray-800 flex items-center gap-1.5 shadow-2xs"
                    >
                      <Code2 className="w-3 h-3 text-gray-500" />
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1 mt-4">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Architectural Guarantee</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
                    Zero lock-in, full ownership of generated source code, containerized deployments for Cloud Run
                    or Kubernetes, and comprehensive compliance auditing built in.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Sectors Matrix */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 font-display">
                  Vertical Sector Mastery (Healthcare, Insurance, Retail, Manufacturing, AgTech)
                </h3>
                <p className="text-xs text-gray-500 font-sans">
                  Select a sector to view regulatory frameworks, operational targets, and preset data blueprints:
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#1B4332] font-semibold">
                5 Enterprise Profiles Loaded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {INDUSTRY_SECTOR_PRESETS.map((sector) => {
                const isSelected = selectedSectorPreset.id === sector.id;
                return (
                  <button
                    key={sector.id}
                    onClick={() => handleSelectSectorPreset(sector)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1B4332] text-white border-[#153427] shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base">
                          {sector.id === 'healthcare' && '🏥'}
                          {sector.id === 'insurance' && '🛡️'}
                          {sector.id === 'retail' && '🛍️'}
                          {sector.id === 'manufacturing' && '🏭'}
                          {sector.id === 'agriculture' && '🌾'}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                        )}
                      </div>
                      <div className="text-xs font-bold leading-tight font-display">{sector.name}</div>
                    </div>
                    <div className="text-[10px] font-mono opacity-80 mt-2">
                      {sector.regulations[0]}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Sector Snapshot */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1 max-w-2xl">
                <div className="font-bold text-gray-900 font-display flex items-center gap-2">
                  <span>Selected Sector: {selectedSectorPreset.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                    Audit-Ready
                  </span>
                </div>
                <p className="text-gray-600 font-sans">{selectedSectorPreset.tagline}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedSectorPreset.regulations.map((reg, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-white border border-gray-200 font-mono text-[10px] text-gray-700"
                    >
                      {reg}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveSubView('ai-engine');
                  handleRunAiTransformation();
                }}
                className="px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#204a37] text-white font-bold flex items-center gap-2 shadow-xs transition-all shrink-0 cursor-pointer"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-300" />
                <span>Transform {selectedSectorPreset.name} Data</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-VIEW 2: DATA-TO-DECISIONS AI ENGINE (INTERACTIVE TOOL) */}
      {/* ========================================================================= */}
      {activeSubView === 'ai-engine' && (
        <section className="space-y-6">
          {/* AI Transformation Engine Control Panel */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    AI Decision Transformer
                  </span>
                  <span className="text-xs text-gray-500 font-mono">Gemini 2.5 / 1.5 Research Model</span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 font-display">
                  Transform Enterprise Data into Automated Decisions
                </h3>
                <p className="text-xs text-gray-600 font-sans">
                  Configure your industry parameters or select a sector preset to execute an AI synthesis of
                  modern data foundations, automated decision workflows, and predictive analytics foresight.
                </p>
              </div>

              {/* Sector Quick Loaders */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-gray-500 font-medium">Quick Presets:</span>
                {INDUSTRY_SECTOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectSectorPreset(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                      selectedSectorPreset.id === preset.id
                        ? 'bg-[#1B4332] text-white font-bold'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {preset.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>Target Industry / Sector</span>
                </label>
                <input
                  type="text"
                  value={industryInput}
                  onChange={(e) => setIndustryInput(e.target.value)}
                  placeholder="e.g. Healthcare, Insurance, Retail, Manufacturing, Agriculture"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none font-medium text-gray-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>Primary Business Objective</span>
                </label>
                <input
                  type="text"
                  value={businessGoalInput}
                  onChange={(e) => setBusinessGoalInput(e.target.value)}
                  placeholder="e.g. Boost customer retention with CRM, automate claims, or eliminate defect escapes"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none font-medium text-gray-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span>Existing Operational Data Foundation & Sources</span>
                </label>
                <textarea
                  rows={2}
                  value={dataSummaryInput}
                  onChange={(e) => setDataSummaryInput(e.target.value)}
                  placeholder="e.g. POS transactions, IoT sensor streams, EHR records, mobile telemetry, or drone images"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none font-medium text-gray-900 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Current Bottlenecks & Regulatory Constraints</span>
                </label>
                <textarea
                  rows={2}
                  value={challengesInput}
                  onChange={(e) => setChallengesInput(e.target.value)}
                  placeholder="e.g. HIPAA audit burdens, manual triage delay, 71% cart abandonment, or unplanned downtime"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-none font-medium text-gray-900 resize-none"
                />
              </div>
            </div>

            {/* Run Button & Source Indicator */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                <span>Active Engine:</span>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-bold border border-gray-200">
                  {resultSource}
                </span>
                {activeTransformationResult.modelUsed && (
                  <span className="text-gray-400">({activeTransformationResult.modelUsed})</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAiTransformation}
                  disabled={isTransforming}
                  className="px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#204a37] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isTransforming ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4A373]" />
                      <span>Synthesizing Decisions with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>Execute Transformation Engine</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RESULTS DASHBOARD */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            {/* Executive Strategy Card */}
            <div className="bg-gradient-to-r from-[#1B4332] to-[#2D5A27] text-white p-6 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4A373] text-[#1B4332] font-mono font-bold text-[10px]">
                    Transformation Blueprint
                  </span>
                  <span className="text-xs font-mono text-gray-200">
                    Generated: {new Date(activeTransformationResult.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyBlueprintJson}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownloadBlueprint}
                    className="px-3 py-1 rounded-lg bg-[#D4A373] hover:bg-[#c39263] text-[#1B4332] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Blueprint</span>
                  </button>
                </div>
              </div>

              <h4 className="text-lg font-bold font-display text-white">
                Executive Strategy: {activeTransformationResult.industry}
              </h4>
              <p className="text-xs sm:text-sm text-gray-100 font-sans leading-relaxed">
                {activeTransformationResult.executiveSummary}
              </p>
            </div>

            {/* Pillar 1: Modern Data Foundation Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 font-display">
                    1. Modern Data Foundation Architecture
                  </h4>
                  <p className="text-xs text-gray-500 font-sans">
                    Establishing a reliable, compliant data foundation that breaks down silos and powers machine learning.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="font-bold text-gray-900 font-mono flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-700" />
                    <span>Lakehouse & Ingestion Pipelines</span>
                  </div>
                  <p className="text-gray-700 font-sans leading-relaxed">
                    {activeTransformationResult.modernDataFoundation.lakehouseArchitecture}
                  </p>
                  <div className="pt-2 text-[11px] text-gray-500 font-sans">
                    <span className="font-bold text-gray-700">Stream Processing:</span>{' '}
                    {activeTransformationResult.modernDataFoundation.ingestionPipelines}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="font-bold text-gray-900 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Storage Engines & Compliance Controls</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTransformationResult.modernDataFoundation.storageEngines.map((engine, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white border border-gray-300 font-mono text-[10px] text-gray-800"
                      >
                        {engine}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 space-y-1">
                    <span className="text-[11px] font-bold text-gray-700 block">Governance Standards:</span>
                    {activeTransformationResult.modernDataFoundation.governanceAndCompliance.map((gov, i) => (
                      <div key={i} className="text-[11px] text-gray-600 flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{gov}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 2: Automated Decision Workflows */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 font-display">
                    2. Automated Process & Decision-Making Workflows
                  </h4>
                  <p className="text-xs text-gray-500 font-sans">
                    Turning operational event streams into autonomous decisions with safety guardrails and human oversight.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {activeTransformationResult.automatedDecisions.map((decision, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gray-200 bg-[#FBFDFB] space-y-2 text-xs font-sans"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-gray-100">
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-[10px] font-mono">
                          {idx + 1}
                        </span>
                        <span>Trigger: {decision.triggerEvent}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold self-start sm:self-auto">
                        Oversight: {decision.humanOversightLevel}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="text-gray-700">
                        <span className="font-bold text-gray-900 block mb-0.5">AI Evaluation Logic:</span>
                        {decision.aiEvaluationEngine}
                      </div>
                      <div className="text-[#1B4332] font-medium bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200/60">
                        <span className="font-bold text-emerald-950 block mb-0.5">Automated System Action:</span>
                        {decision.automatedAction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar 3: Predictive Analytics Foresight & Recharts Visualizer */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 font-display">
                      3. Predictive Analytics Foresight (Data to Decisions)
                    </h4>
                    <p className="text-xs text-gray-500 font-sans">
                      Turning historical and real-time data into high-confidence foresight trajectories.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-mono text-[11px] font-bold self-start sm:self-auto border border-blue-200">
                  90%+ Statistical Confidence
                </span>
              </div>

              {/* Foresight Trajectory Bar Chart */}
              {foresightChartData.length > 0 && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="text-xs font-bold text-gray-800 font-display flex items-center justify-between">
                    <span>Baseline vs Projected Trajectory Comparison</span>
                    <span className="text-[10px] font-mono text-gray-500">Indexed Normalization (0-100 Scale)</span>
                  </div>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={foresightChartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                          dataKey="kpi"
                          stroke="#64748B"
                          tick={{ fontSize: 10, fill: '#475569' }}
                          interval={0}
                        />
                        <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#475569' }} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#E2E8F0',
                            borderRadius: '12px',
                            fontSize: '11px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                        <Bar dataKey="Baseline" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Projected with AI" fill="#1B4332" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Foresight Detailed Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {activeTransformationResult.predictiveAnalyticsForesight.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs font-sans"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-[13px] font-display">{item.kpi}</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-gray-200 text-blue-700 font-mono text-[10px] font-bold">
                        {item.confidencePercent}% Conf.
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-y border-gray-200/60 font-mono">
                      <div>
                        <div className="text-[10px] text-gray-400">Baseline</div>
                        <div className="font-semibold text-gray-700">{item.baselineValue}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                      <div>
                        <div className="text-[10px] text-emerald-600">AI Target</div>
                        <div className="font-bold text-emerald-700">{item.projectedValue}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-500 font-sans">
                      <span className="font-bold text-gray-700">Mitigation Plan:</span> {item.riskMitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar 4: Custom Business Software & Mobile Application Blueprint */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custom Business Software (CRM & E-Commerce) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 font-display">
                      Custom CRM & Enterprise E-Commerce
                    </h4>
                    <p className="text-xs text-gray-500 font-sans">
                      Customer retention workflows and high-conversion commerce infrastructure.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div>
                    <span className="font-bold text-gray-800 block mb-1">Personalized CRM Modules:</span>
                    <div className="space-y-1.5">
                      {activeTransformationResult.customSoftwareArchitecture.crmModules.map((crm, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                          <span>{crm}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-gray-800 block mb-1">E-Commerce & Online Revenue:</span>
                    <div className="space-y-1.5">
                      {activeTransformationResult.customSoftwareArchitecture.ecommerceCapabilities.map((ecom, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                          <span>{ecom}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Application Development Blueprint */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 font-display">
                        Mobile Application Architecture
                      </h4>
                      <p className="text-xs text-gray-500 font-sans">
                        Native iOS/Android and Cross-Platform (Flutter / React Native).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center rounded-lg bg-gray-100 p-0.5 text-[10px] font-mono">
                    <button
                      onClick={() => setInteractiveMobilePlatform('cross-platform')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                        interactiveMobilePlatform === 'cross-platform' ? 'bg-white text-gray-900 font-bold shadow-2xs' : 'text-gray-600'
                      }`}
                    >
                      Cross-Platform
                    </button>
                    <button
                      onClick={() => setInteractiveMobilePlatform('native')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                        interactiveMobilePlatform === 'native' ? 'bg-white text-gray-900 font-bold shadow-2xs' : 'text-gray-600'
                      }`}
                    >
                      Native Swift/Kotlin
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                    <span className="font-bold block mb-0.5">Recommended Framework:</span>
                    {activeTransformationResult.mobileDevelopmentBlueprint.recommendedFramework}
                  </div>

                  <div>
                    <span className="font-bold text-gray-800 block mb-1">Native Hardware Integrations:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeTransformationResult.mobileDevelopmentBlueprint.nativeFeatures.map((feat, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-[11px] text-gray-800 font-mono"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-gray-800 block mb-1">Offline-First Capabilities:</span>
                    <div className="space-y-1">
                      {activeTransformationResult.mobileDevelopmentBlueprint.offlineCapabilities.map((off, i) => (
                        <div key={i} className="text-[11px] text-gray-600 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{off}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consult Agronomist / Enterprise AI Architect CTA */}
            <div className="p-5 rounded-2xl bg-gray-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-bold text-sm text-white font-display flex items-center justify-center sm:justify-start gap-2">
                  <Bot className="w-4 h-4 text-[#D4A373]" />
                  <span>Interactive Enterprise AI Architectural Consultation</span>
                </div>
                <p className="text-xs text-gray-300 font-sans">
                  Have questions about implementing these decision pipelines, regulatory audits, or custom CRM integrations?
                </p>
              </div>

              <button
                onClick={() => {
                  const prompt = `I am reviewing the ${activeTransformationResult.industry} AI Software Architecture Blueprint. Can you provide a detailed technical implementation roadmap for the modern data foundation and automated decision workflows?`;
                  if (onOpenChatWithPrompt) {
                    onOpenChatWithPrompt(prompt);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-[#D4A373] hover:bg-[#c39263] text-[#1B4332] text-xs font-bold flex items-center gap-2 shadow-xs transition-all shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Discuss with Enterprise AI Consultant</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. SUB-VIEW 3: ARCHITECTURAL BLUEPRINT & COMPLIANCE MATRIX */}
      {/* ========================================================================= */}
      {activeSubView === 'architecture' && (
        <section className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#1B4332] text-white">
                    System Architecture
                  </span>
                  <span className="text-xs text-gray-400 font-mono">Microservices & Multi-Cloud</span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 font-display mt-1">
                  Full-Stack Enterprise Software Reference Architecture
                </h3>
                <p className="text-xs text-gray-600 font-sans">
                  A high-velocity, regulatory-compliant topology connecting mobile devices, web clients, AI decision engines, and data lakes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadBlueprint}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Export Architecture Schema</span>
                </button>
              </div>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
              {/* Stage 1: Clients */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 font-display">1. Client Layer</span>
                  <Smartphone className="w-4 h-4 text-amber-600" />
                </div>
                <div className="space-y-1.5 text-[11px] text-gray-600">
                  <div className="p-2 rounded bg-white border border-gray-200">
                    <span className="font-bold text-gray-800 block">Mobile App</span>
                    iOS & Android (Flutter / React Native) with offline SQLite cache.
                  </div>
                  <div className="p-2 rounded bg-white border border-gray-200">
                    <span className="font-bold text-gray-800 block">Enterprise Web</span>
                    Next.js / Vite React responsive portal with role-based access.
                  </div>
                  <div className="p-2 rounded bg-white border border-gray-200">
                    <span className="font-bold text-gray-800 block">Desktop Workstation</span>
                    Electron app for continuous telemetry monitoring & dispatch.
                  </div>
                </div>
              </div>

              {/* Stage 2: Ingress & API */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 font-display">2. Ingress & Security</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="space-y-1.5 text-[11px] text-gray-600">
                  <div className="p-2 rounded bg-white border border-gray-200">
                    <span className="font-bold text-gray-800 block">API Gateway</span>
                    Reverse proxy with token rate limiting and mTLS verification.
                  </div>
                  <div className="p-2 rounded bg-white border border-gray-200">
                    <span className="font-bold text-gray-800 block">Zero-Trust Identity</span>
                    OAuth2 / OIDC + MFA biometric verification.
                  </div>
                  <div className="p-2 rounded bg-white border border-gray-200">
                    <span className="font-bold text-gray-800 block">Audit Ledger</span>
                    Immutable compliance logging for SOC 2, HIPAA, and ISO standards.
                  </div>
                </div>
              </div>

              {/* Stage 3: AI Decision & Microservices */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 font-display">3. Decision & Microservices</span>
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                </div>
                <div className="space-y-1.5 text-[11px] text-gray-600">
                  <div className="p-2 rounded bg-white border border-gray-200">
                    <span className="font-bold text-gray-800 block">Gemini AI Engine</span>
                    RAG agentic reasoning, computer vision, and NLP parsing.
                  </div>
                  <div className="p-2 rounded bg-white border border-gray-200">
                    <span className="font-bold text-gray-800 block">Personalized CRM Hub</span>
                    Customer retention scoring, cohort journeys, automated push.
                  </div>
                  <div className="p-2 rounded bg-white border border-gray-200">
                    <span className="font-bold text-gray-800 block">E-Commerce Engine</span>
                    Sub-second catalog search, checkout, and inventory sync.
                  </div>
                </div>
              </div>

              {/* Stage 4: Modern Data Foundation */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 font-display">4. Data Foundation</span>
                  <Database className="w-4 h-4 text-blue-600" />
                </div>
                <div className="space-y-1.5 text-[11px] text-gray-600">
                  <div className="p-2 rounded bg-white border border-gray-200">
                    <span className="font-bold text-gray-800 block">Medallion Lakehouse</span>
                    Bronze raw event streams to Gold curated business metrics.
                  </div>
                  <div className="p-2 rounded bg-white border border-gray-200">
                    <span className="font-bold text-gray-800 block">Vector & Feature Store</span>
                    Sub-millisecond embedding lookup for real-time inference.
                  </div>
                  <div className="p-2 rounded bg-white border border-gray-200">
                    <span className="font-bold text-gray-800 block">PostgreSQL / Timescale</span>
                    ACID transactional ledger with time-series sensor tracking.
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Matrix */}
            <div className="pt-2 space-y-3">
              <h4 className="text-sm font-bold text-gray-900 font-display flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
                <span>Industry Regulatory Compliance Matrix</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-sans">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="font-bold text-gray-900 font-display">Healthcare</div>
                  <div className="text-[11px] text-gray-600">HIPAA Security & Privacy, HITECH, FDA 21 CFR Part 11, HL7/FHIR interoperability.</div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="font-bold text-gray-900 font-display">Insurance & Finance</div>
                  <div className="text-[11px] text-gray-600">NAIC Model Laws, GLBA privacy, PCI-DSS Level 1, SOC 2 Type II controls.</div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="font-bold text-gray-900 font-display">Retail & Commerce</div>
                  <div className="text-[11px] text-gray-600">PCI-DSS 4.0 tokenization, CCPA/CPRA, GDPR consent, ADA Title III accessibility.</div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="font-bold text-gray-900 font-display">Manufacturing & AgTech</div>
                  <div className="text-[11px] text-gray-600">ISO 9001 quality audits, ISO 27001 info sec, ISA-95, FSMA Section 204 traceability.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
