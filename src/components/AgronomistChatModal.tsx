import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquareText,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sprout,
  Bug,
  Apple,
  ShieldCheck,
  Compass,
  FileSpreadsheet,
  HelpCircle,
  Radio,
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { CropAnalysisResult, PestDetectionResult, QualityInspectionResult, ActiveTab } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  source?: string;
}

interface AgronomistChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropData?: CropAnalysisResult;
  pestData?: PestDetectionResult;
  qualityData?: QualityInspectionResult;
  initialQuery?: string;
  onNavigateToModule?: (tab: ActiveTab) => void;
}

export const AgronomistChatModal: React.FC<AgronomistChatModalProps> = ({
  isOpen,
  onClose,
  cropData,
  pestData,
  qualityData,
  initialQuery,
  onNavigateToModule,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hello! I am your **Gemini AI Agronomist, IPM Entomologist & Food Safety Specialist**.

I actively monitor your computer vision outputs to help you:
1. **Interpret vision scan results**: Deep pathology of leaf lesions, weed pressure, pest life stages, and conveyor defect rates.
2. **Biological & Chemical IPM**: Detailed lifecycle breakdown (egg, larva instars, pupa, adult), bio-insecticides (*Bt*, parasitic wasps), and low-toxicity chemical thresholds with safe Pre-Harvest Intervals (PHI).
3. **Farm Management Planning**: Multi-year crop rotation schedules, cover cropping, and sensor-driven irrigation.
4. **App Feature Walkthrough**: Guidance on running vision inference, edge deployment, A2A Judge maintenance, and offline GIS mapping.

Ask me anything or select one of the contextual actions below!`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [attachVisionContext, setAttachVisionContext] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // If initialQuery is passed when opening modal, trigger or prepopulate
  useEffect(() => {
    if (isOpen && initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isSending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsSending(true);

    try {
      const visionPayload = attachVisionContext
        ? {
            cropData,
            pestData,
            qualityData,
          }
        : undefined;

      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await sendChatMessage(query, {
        conversationHistory: historyPayload,
        visionContext: visionPayload,
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.reply || 'Agronomic telemetry interpreted.',
        source: res.source,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `[Offline Agronomic Advisory]: For "${query.slice(0, 50)}", ensure early morning foliar application with Bacillus thuringiensis (Bt) or copper octanoate. Keep row humidity under 75% to prevent sporulation.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const cleanText = text.replace(/[*#_`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 400));
        utterance.rate = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Chat history cleared. Contextual computer vision telemetry is still attached. What can I evaluate for you?',
        time: 'Just now',
      },
    ]);
  };

  // Render markdown text cleanly
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="text-xs font-bold text-gray-900 mt-2 mb-1 flex items-center gap-1.5 font-display">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332]" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={index} className="font-bold text-gray-900 my-1">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const itemText = line.replace(/^[-•]\s+/, '');
        // format bold parts inside
        const parts = itemText.split(/(\*\*.*?\*\*)/g);
        return (
          <li key={index} className="ml-4 list-disc text-[11.5px] text-gray-700 leading-relaxed my-0.5">
            {parts.map((p, pi) =>
              p.startsWith('**') && p.endsWith('**') ? (
                <strong key={pi} className="font-semibold text-gray-900">
                  {p.replace(/\*\*/g, '')}
                </strong>
              ) : (
                <span key={pi}>{p}</span>
              )
            )}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line.trim())) {
        const parts = line.replace(/^\d+\.\s/, '').split(/(\*\*.*?\*\*)/g);
        return (
          <div key={index} className="flex gap-1.5 text-[11.5px] text-gray-700 leading-relaxed my-1 pl-1">
            <span className="font-mono font-bold text-[#1B4332] shrink-0">
              {line.match(/^\d+\./)?.[0]}
            </span>
            <div>
              {parts.map((p, pi) =>
                p.startsWith('**') && p.endsWith('**') ? (
                  <strong key={pi} className="font-semibold text-gray-900">
                    {p.replace(/\*\*/g, '')}
                  </strong>
                ) : (
                  <span key={pi}>{p}</span>
                )
              )}
            </div>
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={index} className="h-1.5" />;
      }
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="text-[11.5px] text-gray-800 leading-relaxed my-0.5">
          {parts.map((p, pi) =>
            p.startsWith('**') && p.endsWith('**') ? (
              <strong key={pi} className="font-semibold text-gray-900">
                {p.replace(/\*\*/g, '')}
              </strong>
            ) : (
              <span key={pi}>{p}</span>
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col h-[90vh] max-h-[720px] overflow-hidden text-gray-900">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 bg-[#F1F3F0] border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-[#D4A373]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 font-display">
                  Gemini Agronomist & Food Safety AI
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#1B4332] font-mono border border-gray-200 font-semibold flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-green-500 animate-pulse" />
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-gray-600 font-mono">
                Computer Vision Interpretation • IPM Biologicals • Farm Planning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={resetChat}
              title="Reset conversation"
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vision Context Status Bar */}
        <div className="px-4 py-2 bg-[#F8FAF9] border-b border-gray-200 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase text-gray-500 font-bold">Active Telemetry:</span>
            {cropData && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-800 text-[10px] font-mono font-medium">
                <Sprout className="w-3 h-3 text-green-700" />
                {cropData.cropType}: {cropData.diseaseDetected} ({cropData.healthScore}%)
              </span>
            )}
            {pestData && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-medium">
                <Bug className="w-3 h-3 text-amber-700" />
                {pestData.primaryPest} ({pestData.severityCategory})
              </span>
            )}
            {qualityData && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-800 text-[10px] font-mono font-medium">
                <Apple className="w-3 h-3 text-red-700" />
                {qualityData.produceType}: {qualityData.overallGrade}
              </span>
            )}
          </div>

          <label className="flex items-center gap-1.5 text-[11px] text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={attachVisionContext}
              onChange={(e) => setAttachVisionContext(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#1B4332] rounded"
            />
            <span className="font-mono text-[10px]">Attach CV Context</span>
          </label>
        </div>

        {/* Quick Action Chips Bar */}
        <div className="px-3 py-2 bg-white border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() =>
              handleSend(
                `Explain the lifecycle of ${pestData?.primaryPest || 'Cabbage Looper (Pieris rapae)'}, its vulnerability stages, organic biological control (Bt & parasitoids), and targeted chemical options.`
              )
            }
            className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-medium shrink-0 flex items-center gap-1 transition-all"
          >
            <Bug className="w-3 h-3 text-amber-700" />
            Pest Lifecycle & IPM
          </button>

          <button
            onClick={() =>
              handleSend(
                `Analyze the detected crop disease "${cropData?.diseaseDetected || 'Early Blight'}" on ${cropData?.cropType || 'Tomato'}. Provide organic bio-fungicides, chemical protectants, and spray schedules.`
              )
            }
            className="px-2.5 py-1 rounded-full bg-green-50 hover:bg-green-100 text-green-900 border border-green-200 text-[11px] font-medium shrink-0 flex items-center gap-1 transition-all"
          >
            <Sprout className="w-3 h-3 text-green-700" />
            Crop Disease Treatment
          </button>

          <button
            onClick={() =>
              handleSend(
                `Review the food quality inspection results for ${qualityData?.produceType || 'Tomatoes'}. Explain why items were graded as ${qualityData?.overallGrade || 'Grade A'} and how to adjust conveyor sorting parameters.`
              )
            }
            className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-[11px] font-medium shrink-0 flex items-center gap-1 transition-all"
          >
            <Apple className="w-3 h-3 text-rose-700" />
            Food Quality Sorting
          </button>

          <button
            onClick={() =>
              handleSend(
                'Generate a 4-year crop rotation and regenerative soil management plan following high-density solanaceous and brassica crops.'
              )
            }
            className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-medium shrink-0 flex items-center gap-1 transition-all"
          >
            <FileSpreadsheet className="w-3 h-3 text-slate-700" />
            Farm Planning
          </button>

          <button
            onClick={() =>
              handleSend(
                'Give me a complete walkthrough of this AGRICULTURE & FOOD SYSTEM application: how to use Crop Monitoring, Pest Detection, Food Quality Conveyor, A2A Judge, and Offline GIS Field Map.'
              )
            }
            className="px-2.5 py-1 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 text-[11px] font-medium shrink-0 flex items-center gap-1 transition-all"
          >
            <HelpCircle className="w-3 h-3 text-cyan-700" />
            App Guide & Features
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F8FAF9]/60">
          {messages.map((m) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isBot ? 'items-start' : 'items-end flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                    isBot
                      ? 'bg-[#1B4332] text-white shadow-sm'
                      : 'bg-[#2D5A27] text-white shadow-sm'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4 text-[#D4A373]" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed transition-all ${
                    isBot
                      ? 'bg-white border border-gray-200/90 text-gray-900 shadow-sm'
                      : 'bg-[#1B4332] text-white shadow-sm font-medium'
                  }`}
                >
                  {isBot ? renderFormattedContent(m.text) : <p className="whitespace-pre-wrap">{m.text}</p>}

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 text-[10px] font-mono text-gray-400">
                    <span className={isBot ? 'text-gray-400' : 'text-green-200'}>
                      {m.time} {m.source ? `• via ${m.source}` : ''}
                    </span>

                    {isBot && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSpeech(m.text)}
                          title="Read advisory aloud"
                          className="hover:text-[#1B4332] transition-colors p-1"
                        >
                          {isSpeaking ? <VolumeX className="w-3 h-3 text-red-500" /> : <Volume2 className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => handleCopy(m.id, m.text)}
                          title="Copy to clipboard"
                          className="hover:text-[#1B4332] transition-colors p-1"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 items-center text-xs text-[#1B4332] font-mono font-semibold pl-2">
              <Bot className="w-4 h-4 animate-spin text-[#1B4332]" />
              <span>Analyzing pathology, pest lifecycle, and farm management data...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask agronomist about crop diseases, pest controls, batch grading, or farm planning..."
            className="flex-1 bg-[#F8FAF9] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1B4332] transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={isSending || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-black disabled:opacity-50 text-white font-medium text-xs transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
