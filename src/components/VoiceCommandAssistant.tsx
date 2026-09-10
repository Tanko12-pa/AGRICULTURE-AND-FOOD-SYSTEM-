import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Command,
  ChevronUp,
  ChevronDown,
  Play,
  FileText,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface VoiceCommandAssistantProps {
  activeTab: ActiveTab;
  onNavigateTab: (tab: ActiveTab) => void;
  onRunPipeline: () => void;
  onExportPdf: () => void;
  onExportJson?: () => void;
  onResetData?: () => void;
  onOpenChat?: (prompt?: string) => void;
  isOpenExternal?: boolean;
  onToggleExternal?: (open: boolean) => void;
}

export const VoiceCommandAssistant: React.FC<VoiceCommandAssistantProps> = ({
  activeTab,
  onNavigateTab,
  onRunPipeline,
  onExportPdf,
  onExportJson,
  onResetData,
  onOpenChat,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastRecognizedCommand, setLastRecognizedCommand] = useState<{
    text: string;
    action: string;
    timestamp: number;
    success: boolean;
  } | null>(null);
  const [isVoiceFeedbackEnabled, setIsVoiceFeedbackEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  // Text-to-Speech feedback helper
  const speakFeedback = useCallback(
    (text: string) => {
      if (!isVoiceFeedbackEnabled) return;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          window.speechSynthesis.speak(utterance);
        } catch {
          // Ignore speech synthesis errors gracefully
        }
      }
    },
    [isVoiceFeedbackEnabled]
  );

  // Command Execution Hub
  const executeCommand = useCallback(
    (spokenText: string) => {
      const lower = spokenText.toLowerCase().trim();
      let matched = false;
      let actionLabel = '';

      // 1. Run Pipeline command
      if (
        lower.includes('run pipeline') ||
        lower.includes('start pipeline') ||
        lower.includes('run analysis') ||
        lower.includes('analyze crop') ||
        lower.includes('run scan') ||
        lower.includes('start analysis') ||
        lower.includes('execute pipeline') ||
        lower === 'analyze' ||
        lower === 'run'
      ) {
        matched = true;
        actionLabel = 'Running Vision Pipeline...';
        speakFeedback('Executing computer vision inference pipeline');
        onRunPipeline();
      }
      // 2. Export PDF Report command
      else if (
        lower.includes('export pdf') ||
        lower.includes('export report') ||
        lower.includes('download pdf') ||
        lower.includes('generate pdf') ||
        lower.includes('download report') ||
        lower.includes('audit report')
      ) {
        matched = true;
        actionLabel = 'Exporting Formatted PDF Report...';
        speakFeedback('Generating and downloading formatted PDF audit report');
        onExportPdf();
      }
      // 3. Export JSON Telemetry
      else if (lower.includes('export json') || lower.includes('download json') || lower.includes('export data')) {
        matched = true;
        actionLabel = 'Exporting Telemetry JSON...';
        speakFeedback('Exporting system telemetry JSON');
        if (onExportJson) onExportJson();
      }
      // 4. Tab Navigation Commands
      else if (
        lower.includes('crop') ||
        lower.includes('crop monitoring') ||
        lower.includes('foliage') ||
        lower.includes('plants')
      ) {
        matched = true;
        actionLabel = 'Navigating to Crop Monitoring';
        speakFeedback('Switching to Crop Monitoring');
        onNavigateTab('crop');
      } else if (
        lower.includes('pest') ||
        lower.includes('pest detection') ||
        lower.includes('bugs') ||
        lower.includes('insects')
      ) {
        matched = true;
        actionLabel = 'Navigating to Pest Detection';
        speakFeedback('Switching to Pest Detection');
        onNavigateTab('pest');
      } else if (
        lower.includes('quality') ||
        lower.includes('food quality') ||
        lower.includes('conveyor') ||
        lower.includes('grading') ||
        lower.includes('produce')
      ) {
        matched = true;
        actionLabel = 'Navigating to Food Quality & Sorting';
        speakFeedback('Switching to Food Quality Inspection');
        onNavigateTab('quality');
      } else if (
        lower.includes('overview') ||
        lower.includes('pipeline overview') ||
        lower.includes('dashboard') ||
        lower.includes('home')
      ) {
        matched = true;
        actionLabel = 'Navigating to Pipeline Overview';
        speakFeedback('Switching to Pipeline Overview');
        onNavigateTab('overview');
      } else if (
        lower.includes('scout') ||
        lower.includes('mobile') ||
        lower.includes('field scout') ||
        lower.includes('mobile dashboard')
      ) {
        matched = true;
        actionLabel = 'Navigating to Field Scout View';
        speakFeedback('Switching to Mobile Field Scout Dashboard');
        onNavigateTab('mobile-dash');
      } else if (
        lower.includes('judge') ||
        lower.includes('a2a') ||
        lower.includes('agent judge') ||
        lower.includes('adjudication')
      ) {
        matched = true;
        actionLabel = 'Navigating to A2A Judge View';
        speakFeedback('Switching to Agent-to-Agent Judge View');
        onNavigateTab('a2a');
      } else if (
        lower.includes('dataset') ||
        lower.includes('datasets') ||
        lower.includes('ground truth') ||
        lower.includes('training')
      ) {
        matched = true;
        actionLabel = 'Navigating to Datasets';
        speakFeedback('Switching to Ground Truth Datasets');
        onNavigateTab('datasets');
      } else if (
        lower.includes('map') ||
        lower.includes('gis') ||
        lower.includes('satellite') ||
        lower.includes('offline map')
      ) {
        matched = true;
        actionLabel = 'Navigating to Offline GIS Map';
        speakFeedback('Switching to GIS Offline Map');
        onNavigateTab('map');
      } else if (
        lower.includes('billing') ||
        lower.includes('subscription') ||
        lower.includes('pricing') ||
        lower.includes('plans')
      ) {
        matched = true;
        actionLabel = 'Navigating to Subscription & Billing';
        speakFeedback('Switching to Subscription and Billing portal');
        onNavigateTab('billing');
      } else if (
        lower.includes('chat') ||
        lower.includes('agronomist') ||
        lower.includes('ask agronomist') ||
        lower.includes('ask ai')
      ) {
        matched = true;
        actionLabel = 'Opening Agronomist AI Chat';
        speakFeedback('Opening Gemini Agronomist AI Advisor');
        if (onOpenChat) onOpenChat();
      } else if (lower.includes('reset demo') || lower.includes('reset baseline') || lower.includes('reset data')) {
        matched = true;
        actionLabel = 'Resetting Demo Telemetry';
        speakFeedback('Resetting system telemetry to baseline');
        if (onResetData) onResetData();
      }

      setLastRecognizedCommand({
        text: spokenText,
        action: actionLabel || 'Command not recognized. Say "Run pipeline" or "Go to Crop Monitoring".',
        timestamp: Date.now(),
        success: matched,
      });

      if (!matched) {
        speakFeedback("Command not recognized. Try saying 'Run pipeline' or 'Go to Crop Monitoring'.");
      }
    },
    [onRunPipeline, onExportPdf, onExportJson, onNavigateTab, onOpenChat, onResetData, speakFeedback]
  );

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setPermissionError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalPhrase = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalPhrase += trans;
          } else {
            currentInterim += trans;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalPhrase) {
          const cleaned = finalPhrase.trim();
          setTranscript(cleaned);
          setInterimTranscript('');
          executeCommand(cleaned);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setPermissionError('Microphone permission denied. Please allow microphone access in browser settings.');
          setIsListening(false);
          isListeningRef.current = false;
        } else if (event.error === 'no-speech') {
          // Benign timeout when silent
        } else {
          console.warn('Speech recognition event error:', event.error);
        }
      };

      recognition.onend = () => {
        // Auto-restart if user still wants listening active
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
            isListeningRef.current = false;
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [executeCommand]);

  // Toggle listening
  const handleToggleListening = () => {
    if (!isSupported) {
      setPermissionError('Web Speech API is not supported in this browser environment. You can use the Quick Command buttons below.');
      setIsExpanded(true);
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    } else {
      setPermissionError(null);
      isListeningRef.current = true;
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setIsExpanded(true);
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
        setIsListening(false);
        isListeningRef.current = false;
      }
    }
  };

  // Quick Simulation Click handler for testing voice triggers without speaking
  const handleSimulateVoiceCommand = (commandText: string) => {
    setTranscript(commandText);
    setInterimTranscript('');
    executeCommand(commandText);
  };

  return (
    <div
      id="voice-command-assistant"
      className="fixed bottom-5 right-5 z-40 max-w-sm w-full sm:w-80 font-sans pointer-events-auto select-none"
    >
      {/* Floating Main Pill / Trigger Widget */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-xl overflow-hidden transition-all">
        {/* Top Header Pill Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-[#1B4332] to-[#2D5A27] text-white">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleListening}
              title={isListening ? 'Stop Voice Recognition' : 'Start Voice Commands (Web Speech API)'}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-tight">Voice Command AI</span>
                {isListening && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-white/70 block leading-tight">
                {isListening ? 'Listening for speech...' : 'Web Speech API ready'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsVoiceFeedbackEnabled((prev) => !prev)}
              title={isVoiceFeedbackEnabled ? 'Mute Speech Voice Feedback' : 'Enable Speech Voice Feedback'}
              className="p-1 text-white/70 hover:text-white rounded-md transition-all cursor-pointer"
            >
              {isVoiceFeedbackEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1 text-white/70 hover:text-white rounded-md transition-all cursor-pointer"
              title={isExpanded ? 'Collapse Assistant' : 'Expand Assistant'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Real-Time Listening Indicator Waveform */}
        {isListening && (
          <div className="bg-emerald-50/80 px-3.5 py-1.5 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold">Live Input:</span>
              <span className="italic text-emerald-700 truncate max-w-[180px]">
                {interimTranscript || transcript || 'Say a command...'}
              </span>
            </div>
            {/* Animated audio equalizer bars */}
            <div className="flex items-center gap-0.5">
              <span className="w-0.5 h-2 bg-emerald-600 animate-pulse"></span>
              <span className="w-0.5 h-3.5 bg-emerald-600 animate-bounce"></span>
              <span className="w-0.5 h-2.5 bg-emerald-600 animate-pulse"></span>
              <span className="w-0.5 h-4 bg-emerald-600 animate-bounce"></span>
              <span className="w-0.5 h-2 bg-emerald-600 animate-pulse"></span>
            </div>
          </div>
        )}

        {/* Last Recognized Action Pill */}
        {lastRecognizedCommand && (
          <div
            className={`px-3.5 py-2 border-b text-xs flex items-center justify-between gap-2 ${
              lastRecognizedCommand.success
                ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                : 'bg-amber-50 text-amber-950 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              {lastRecognizedCommand.success ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              <span className="truncate font-medium">{lastRecognizedCommand.action}</span>
            </div>
            <span className="text-[9px] text-gray-400 font-mono shrink-0">Just now</span>
          </div>
        )}

        {/* Permission Warning (if any) */}
        {permissionError && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Microphone Notice:</span>
              <p className="text-[11px] leading-tight text-rose-700">{permissionError}</p>
            </div>
            <button onClick={() => setPermissionError(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Expanded Drawer: Quick Test Buttons & Command Reference */}
        {isExpanded && (
          <div className="p-3.5 bg-white space-y-3 max-h-72 overflow-y-auto text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Test Voice Commands (Click to simulate)
                </span>
                <span className="text-[9px] text-gray-400">or speak into mic</span>
              </div>

              {/* Action Triggers */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleSimulateVoiceCommand('Run pipeline')}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#1B4332] hover:bg-black text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 text-[#D4A373]" />
                  <span>"Run pipeline"</span>
                </button>

                <button
                  onClick={() => handleSimulateVoiceCommand('Export PDF')}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#1B4332] border border-emerald-200 font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                >
                  <FileText className="w-3 h-3 text-emerald-700" />
                  <span>"Export PDF"</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs Voice Shortcuts */}
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1.5">
                Tab Voice Navigation
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: 'Crop Monitoring', tab: 'crop' },
                  { label: 'Pest Detection', tab: 'pest' },
                  { label: 'Food Quality', tab: 'quality' },
                  { label: 'Overview', tab: 'overview' },
                  { label: 'Mobile Scout', tab: 'mobile-dash' },
                  { label: 'A2A Judge', tab: 'a2a' },
                  { label: 'Billing Portal', tab: 'billing' },
                ].map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => handleSimulateVoiceCommand(`Go to ${item.label}`)}
                    className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-all cursor-pointer ${
                      activeTab === item.tab
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    "{item.label}"
                  </button>
                ))}
              </div>
            </div>

            {/* Cheat Sheet Tips */}
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200/80 text-[11px] text-gray-600 space-y-1">
              <span className="font-bold text-gray-900 block flex items-center gap-1">
                <Command className="w-3 h-3 text-[#1B4332]" />
                Supported Voice Phrases:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-gray-500">
                <li>
                  <strong className="text-gray-700">"Run pipeline"</strong> or <strong>"Analyze crop"</strong>
                </li>
                <li>
                  <strong className="text-gray-700">"Go to crop monitoring"</strong> or <strong>"Open pests"</strong>
                </li>
                <li>
                  <strong className="text-gray-700">"Export PDF"</strong> or <strong>"Download report"</strong>
                </li>
                <li>
                  <strong className="text-gray-700">"Ask agronomist"</strong> or <strong>"Reset demo"</strong>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
