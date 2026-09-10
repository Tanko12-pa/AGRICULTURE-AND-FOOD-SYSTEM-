import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Compass,
  MessageSquareText,
  FileDown,
  Play,
  CloudSun,
  Eye,
  ShieldCheck,
} from 'lucide-react';

export const ONBOARDING_STORAGE_KEY = 'agri_onboarding_tour_completed_v1';

export interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position?: 'bottom' | 'top' | 'right' | 'left' | 'center';
  actionHint?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    targetSelector: '#main-header-banner',
    title: 'Welcome to Agri-Vision OS',
    description:
      'A precision edge computer vision & agronomic intelligence system designed for field technicians, inspectors, and commercial growers.',
    icon: <Sparkles className="w-5 h-5 text-[#D4A373]" />,
    position: 'bottom',
    actionHint: 'Let us take a quick 45-second tour of your core mission controls.',
  },
  {
    id: 'vision-pipeline',
    targetSelector: '#btn-tab-overview',
    title: 'The 3-in-1 Vision Pipeline',
    description:
      'Your centralized operations HUD fusing Crop Health segmentation (ViT/U-Net), Pest & Disease detection (YOLOv8), and Conveyor Produce grading into one synchronized telemetry stream.',
    icon: <Eye className="w-5 h-5 text-emerald-400" />,
    position: 'right',
    actionHint: 'Click to return to the real-time pipeline overview at any time.',
  },
  {
    id: 'run-inference',
    targetSelector: '#btn-run-pipeline',
    title: 'Execute Vision Inference',
    description:
      'Trigger high-throughput computer vision models directly on device. Supports live optical cameras, drones, and offline multispectral imagery with deep thinking reasoning.',
    icon: <Play className="w-5 h-5 text-[#D4A373]" />,
    position: 'right',
    actionHint: 'Run inference to evaluate crop stress, detect larvae, and inspect fruit defects.',
  },
  {
    id: 'weather-telemetry',
    targetSelector: '#overview-weather-widget',
    title: 'Real-Time Hyper-Local Weather',
    description:
      'GPS-anchored microclimate telemetry reporting temperature, humidity, rainfall rate, leaf wetness risk, and dynamic chemical spray / drone drift flight windows.',
    icon: <CloudSun className="w-5 h-5 text-sky-400" />,
    position: 'bottom',
    actionHint: 'Automatically synchronizes with your device GPS coordinates.',
  },
  {
    id: 'agronomist-chat',
    targetSelector: '#btn-tab-chat',
    title: 'Agronomist AI Consult',
    description:
      'Direct multimodal dialog with Gemini. Ask questions about crop pathology, bio-fungicides, tank-mixing compatibility, and harvest timelines anytime.',
    icon: <MessageSquareText className="w-5 h-5 text-[#D4A373]" />,
    position: 'right',
    actionHint: 'Tap to consult your AI agronomist with custom field prompts.',
  },
  {
    id: 'export-features',
    targetSelector: '#btn-export-pdf',
    title: 'Export Audit & Compliance Reports',
    description:
      'Generate formatted offline PDF dossiers and JSON telemetry exports verified against USDA and GlobalG.A.P. food safety standards for field audits.',
    icon: <FileDown className="w-5 h-5 text-emerald-400" />,
    position: 'right',
    actionHint: 'Full client-side PDF generation works even in remote offline fields.',
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = TOUR_STEPS[currentStepIdx];
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === TOUR_STEPS.length - 1;

  // Measure target DOM element positioning
  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      // If element is not in view, scroll gently
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) return;

    // If on a step that relates to overview, switch to overview tab so elements are present
    if (currentStep?.id === 'weather-telemetry' && onNavigateTab) {
      onNavigateTab('overview');
    }

    const timer = setTimeout(updateTargetPosition, 100);
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [isOpen, currentStepIdx, updateTargetPosition, currentStep?.id, onNavigateTab]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' && !isLastStep) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIdx, isFirstStep, isLastStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn(e);
    }
    onClose();
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn(e);
    }
    onClose();
  };

  if (!isOpen) return null;

  // Calculate card positioning based on target element
  let cardStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
  };

  if (targetRect) {
    const margin = 16;
    const cardWidth = Math.min(380, window.innerWidth - 32);

    if (currentStep.position === 'right' && targetRect.right + cardWidth + margin < window.innerWidth) {
      cardStyle = {
        ...cardStyle,
        top: Math.max(16, Math.min(window.innerHeight - 320, targetRect.top)),
        left: targetRect.right + margin,
        width: `${cardWidth}px`,
      };
    } else if (currentStep.position === 'bottom' && targetRect.bottom + 260 < window.innerHeight) {
      cardStyle = {
        ...cardStyle,
        top: targetRect.bottom + margin,
        left: Math.max(16, Math.min(window.innerWidth - cardWidth - 16, targetRect.left)),
        width: `${cardWidth}px`,
      };
    } else {
      // Default / fallback center placement
      cardStyle = {
        ...cardStyle,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${cardWidth}px`,
      };
    }
  } else {
    cardStyle = {
      ...cardStyle,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '380px',
      maxWidth: 'calc(100vw - 32px)',
    };
  }

  return (
    <AnimatePresence>
      <div id="onboarding-tour-portal" className="fixed inset-0 z-9990 select-none">
        {/* Semi-transparent Backdrop with Cutout Spotlight */}
        <div
          className="fixed inset-0 bg-black/65 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto"
          onClick={handleSkip}
        />

        {/* Highlight ring around target element */}
        {targetRect && (
          <motion.div
            layoutId="tour-spotlight"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed pointer-events-none rounded-xl border-2 border-[#D4A373] shadow-[0_0_0_9999px_rgba(0,0,0,0.5),0_0_20px_rgba(212,163,115,0.8)] z-9995"
            style={{
              top: Math.max(0, targetRect.top - 4),
              left: Math.max(0, targetRect.left - 4),
              width: targetRect.width + 8,
              height: targetRect.height + 8,
            }}
          />
        )}

        {/* Guided Tooltip Dialog Card */}
        <motion.div
          id="onboarding-tour-card"
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ duration: 0.25 }}
          style={cardStyle}
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-gray-900 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="bg-[#1B4332] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2D5A27] border border-[#447A3C] flex items-center justify-center">
                {currentStep.icon}
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#D4A373] block">
                  Quick Tour • Step {currentStepIdx + 1} of {TOUR_STEPS.length}
                </span>
                <h3 className="text-sm font-bold text-white font-display">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            <button
              id="btn-skip-tour-x"
              onClick={handleSkip}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Skip Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-1">
            <div
              className="bg-[#D4A373] h-full transition-all duration-300"
              style={{
                width: `${((currentStepIdx + 1) / TOUR_STEPS.length) * 100}%`,
              }}
            />
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-700 leading-relaxed font-sans">
              {currentStep.description}
            </p>

            {currentStep.actionHint && (
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] font-mono text-emerald-900 flex items-start gap-2">
                <Compass className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>{currentStep.actionHint}</span>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
            <button
              id="btn-tour-skip-text"
              onClick={handleSkip}
              className="text-xs text-gray-400 hover:text-gray-700 font-medium px-2 py-1 transition-colors"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-1.5">
              {!isFirstStep && (
                <button
                  id="btn-tour-prev"
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back</span>
                </button>
              )}

              <button
                id="btn-tour-next"
                onClick={handleNext}
                className="px-4 py-1.5 rounded-lg bg-[#1B4332] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>{isLastStep ? 'Get Started' : 'Next'}</span>
                {isLastStep ? <Check className="w-3.5 h-3.5 text-[#D4A373]" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
