import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  Volume2,
  Trash2,
  Send,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Tag,
} from 'lucide-react';
import { VoiceObservation } from '../types';

interface FieldVoiceNotesRecorderProps {
  cropPreset: string;
  location: string;
  onOpenChatWithPrompt?: (prompt: string) => void;
  className?: string;
}

export const FieldVoiceNotesRecorder: React.FC<FieldVoiceNotesRecorderProps> = ({
  cropPreset,
  location,
  onOpenChatWithPrompt,
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [activeTab, setActiveTab] = useState<'record' | 'notes'>('record');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [audioLevel, setAudioLevel] = useState<number[]>([15, 30, 60, 45, 80, 50, 25, 70, 90, 40, 20]);

  // Initial realistic sample observations attached to the inspection
  const [observations, setObservations] = useState<VoiceObservation[]>([
    {
      id: 'voice-obs-1',
      timestamp: 'Today, 08:34 AM',
      transcription:
        'Inspected row 14-B on eastern perimeter. Yellow halos with concentric target-board lesions visible on lower 3 leaf nodes. Suspected Early Blight (Alternaria). Inter-row weed canopy spreading rapidly near drip emitters.',
      technicianRole: 'Field Scout (Unit 02)',
      cropPreset,
      durationSeconds: 16,
      tags: ['Canopy Lesion', 'Alternaria', 'Drip Emitter Check'],
    },
    {
      id: 'voice-obs-2',
      timestamp: 'Yesterday, 04:15 PM',
      transcription:
        'Post-rain scout check. Soil moisture saturation high; leaf wetness persisted over 7 hours. Recommended delaying heavy sprayer rig to avoid soil compaction. Drone spray candidate.',
      technicianRole: 'Senior Agronomy Tech',
      cropPreset,
      durationSeconds: 12,
      tags: ['Rain Aftermath', 'Leaf Wetness', 'Drone Spray Candidate'],
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Check Web Speech API availability on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Audio wave animation while recording
  useEffect(() => {
    let animInterval: any;
    if (isRecording) {
      animInterval = setInterval(() => {
        setAudioLevel(Array.from({ length: 11 }, () => Math.floor(Math.random() * 75) + 15));
      }, 120);
    }
    return () => clearInterval(animInterval);
  }, [isRecording]);

  // Handle timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Start voice recording
  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setTranscript((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition warning or permission denied:', err);
        };

        recognition.onend = () => {
          // If still marked as recording, keep listening or finish
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Recognition init failed, fallback active', err);
      }
    }

    setIsRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.debug('Recognition stop notice', e);
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  // Save transcription as an attached observation
  const handleSaveObservation = () => {
    if (!transcript.trim()) return;

    const newObservation: VoiceObservation = {
      id: 'voice-obs-' + Date.now(),
      timestamp: 'Just now',
      transcription: transcript.trim(),
      technicianRole: 'Field Technician (Active Scout)',
      cropPreset,
      durationSeconds: Math.max(5, recordingSeconds),
      tags: ['Field Observation', cropPreset.split(' ')[0]],
    };

    setObservations((prev) => [newObservation, ...prev]);
    setTranscript('');
    setActiveTab('notes');
  };

  const handleDeleteObservation = (id: string) => {
    setObservations((prev) => prev.filter((o) => o.id !== id));
  };

  // Insert standard agronomist observation templates
  const handleInsertTemplate = (text: string) => {
    setTranscript((prev) => (prev ? `${prev} ${text}` : text));
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div
      id="field-technician-voice-recorder"
      className={`rounded-2xl bg-white border border-gray-200 p-4 shadow-sm space-y-3 text-gray-900 ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 font-display flex items-center gap-1.5">
              Field Technician Voice-to-Text Observations
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-mono font-bold border border-green-200">
                SAMPLE ATTACHMENT
              </span>
            </h4>
            <p className="text-[10px] text-gray-500 font-mono">
              Dictate real-time crop inspection notes for {cropPreset} • {location}
            </p>
          </div>
        </div>

        {/* View Switcher: Record vs Attached Notes */}
        <div className="flex items-center gap-1 bg-[#F1F3F0] p-0.5 rounded-xl border border-gray-200 text-xs">
          <button
            onClick={() => setActiveTab('record')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'record'
                ? 'bg-[#1B4332] text-white font-bold shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Record Audio
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'notes'
                ? 'bg-[#1B4332] text-white font-bold shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Attached Notes</span>
            <span className="text-[10px] px-1.5 rounded-full bg-white/20">
              {observations.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'record' ? (
        <div className="space-y-3">
          {/* Recording Canvas & Waveform Visualizer */}
          <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md shrink-0 min-h-[44px] min-w-[44px] ${
                  isRecording
                    ? 'bg-rose-600 text-white hover:bg-rose-700 ring-4 ring-rose-200 animate-pulse'
                    : 'bg-[#1B4332] text-white hover:bg-black'
                }`}
                aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
              >
                {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900 font-mono">
                    {isRecording ? 'RECORDING IN PROGRESS' : 'READY TO RECORD'}
                  </span>
                  {isRecording && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono font-bold animate-ping">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-gray-500 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{formatSeconds(recordingSeconds)} elapsed</span>
                  <span>•</span>
                  <span>Scout Voice Channel</span>
                </div>
              </div>
            </div>

            {/* Visualizer Waveform Bars */}
            <div className="flex items-center gap-1 h-8 px-3 py-1 bg-white rounded-lg border border-gray-200 w-full sm:w-auto justify-center">
              {audioLevel.map((height, idx) => (
                <div
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    isRecording ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                  style={{ height: isRecording ? `${height}%` : '25%' }}
                />
              ))}
            </div>
          </div>

          {/* Live Transcript / Observation Input Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-600">
              <span className="font-semibold text-gray-700">Verbal Transcript / Field Notes:</span>
              <span className="text-gray-400">{transcript.length} chars</span>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Press the red microphone to speak or dictate inspection observations (e.g. 'Concentric brown target lesions found on row 12 lower leaves with slight yellow chlorosis...')"
              className="w-full h-24 p-3 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332] font-mono resize-none leading-relaxed"
            />
          </div>

          {/* Quick Observation Preset Chips */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-500 block">
              Quick Observation Dictation Templates:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() =>
                  handleInsertTemplate(
                    'Observed concentric brown rings with chlorotic halo on lower canopy. Early Blight suspected.'
                  )
                }
                className="px-2 py-1 rounded-lg bg-[#F1F3F0] hover:bg-gray-200 text-gray-700 text-[10px] font-mono transition-colors"
              >
                + Early Blight Lesions
              </button>
              <button
                onClick={() =>
                  handleInsertTemplate(
                    'Inter-row redroot pigweed emergence is choking drip tape. High weed density in Sector 4.'
                  )
                }
                className="px-2 py-1 rounded-lg bg-[#F1F3F0] hover:bg-gray-200 text-gray-700 text-[10px] font-mono transition-colors"
              >
                + High Weed Pressure
              </button>
              <button
                onClick={() =>
                  handleInsertTemplate(
                    'Canopy turgor healthy. Upper foliage clear of fungal mycelium. Safe for irrigation.'
                  )
                }
                className="px-2 py-1 rounded-lg bg-[#F1F3F0] hover:bg-gray-200 text-gray-700 text-[10px] font-mono transition-colors"
              >
                + Clean Canopy Check
              </button>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
            <button
              onClick={() => setTranscript('')}
              disabled={!transcript}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-semibold disabled:opacity-40"
            >
              Clear
            </button>

            <div className="flex items-center gap-2">
              {onOpenChatWithPrompt && transcript && (
                <button
                  onClick={() =>
                    onOpenChatWithPrompt(
                      `Field Technician inspection voice note for ${cropPreset} at ${location}:\n"${transcript}"\nWhat is your diagnostic evaluation and prescribed agronomic action?`
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Analyze with Gemini</span>
                </button>
              )}

              <button
                onClick={handleSaveObservation}
                disabled={!transcript.trim()}
                className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-40 min-h-[40px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Attach to Plant Health Sample</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: ATTACHED VOICE NOTES LIST */
        <div className="space-y-2.5">
          {observations.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-xs font-mono">
              No verbal observations attached to this sample yet.
            </div>
          ) : (
            observations.map((obs) => (
              <div
                key={obs.id}
                className="p-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between flex-wrap gap-1 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-[11px]">{obs.technicianRole}</span>
                    <span className="text-[10px] text-gray-500">{obs.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold">
                      {obs.durationSeconds}s audio
                    </span>
                    <button
                      onClick={() => handleDeleteObservation(obs.id)}
                      className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-800 font-mono text-[11px] leading-relaxed bg-white p-2.5 rounded-lg border border-gray-200/70">
                  "{obs.transcription}"
                </p>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    {obs.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {onOpenChatWithPrompt && (
                    <button
                      onClick={() =>
                        onOpenChatWithPrompt(
                          `Review field technician observation:\n"${obs.transcription}"\nContext: ${obs.cropPreset}. Provide pathology confirmation, economic injury threshold assessment, and biological intervention.`
                        )
                      }
                      className="text-[11px] font-bold text-[#1B4332] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#D4A373]" />
                      <span>Review with AI Agronomist</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
