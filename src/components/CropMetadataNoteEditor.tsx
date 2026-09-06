import React, { useState } from 'react';
import {
  FileText,
  Bold,
  Italic,
  List,
  AlertCircle,
  Tag,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  Sparkles,
  Heading,
  Code,
  Highlighter,
  User,
  Clock,
  Send,
} from 'lucide-react';
import { CropAnalysisResult, CropObservationalLog } from '../types';

interface CropMetadataNoteEditorProps {
  cropData: CropAnalysisResult;
  onUpdateCropData?: (updated: CropAnalysisResult) => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

const COMMON_AGRONOMY_TAGS = [
  '#canopy_closure',
  '#chlorosis',
  '#foliar_blight',
  '#weed_pressure',
  '#irrigation_deficit',
  '#stomata_opened',
  '#beneficial_fauna',
  '#spray_scheduled',
  '#drone_ortho_match',
];

export const CropMetadataNoteEditor: React.FC<CropMetadataNoteEditorProps> = ({
  cropData,
  onUpdateCropData,
  onOpenChatWithPrompt,
}) => {
  const [selectedField, setSelectedField] = useState<string>('growthStage');
  const [noteContent, setNoteContent] = useState<string>('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [technicianId, setTechnicianId] = useState<string>('TECH-412');
  const [isSavedBanner, setIsSavedBanner] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const observationalLogs = cropData.observationalLogs || [];

  const metadataFieldOptions = [
    { key: 'growthStage', label: `Growth Stage (${cropData.growthStage || 'Current'})` },
    { key: 'diseaseDetected', label: `Pathology (${cropData.diseaseDetected || 'No Pathogen'})` },
    { key: 'healthScore', label: `Vitality Score (${cropData.healthScore}% Optimal)` },
    { key: 'weedPressurePercent', label: `Weed Infiltration (${cropData.weedPressurePercent}% Pressure)` },
    { key: 'location', label: `Plot Sector (${cropData.location || 'Sector 4'})` },
    { key: 'treatmentPlan', label: `Prescription Protocol (${cropData.treatmentPlan?.urgency || 'Routine'})` },
    { key: 'general', label: `General Field Scouting Log` },
  ];

  // Helper to insert formatting tags into textarea
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('field-technician-note-input') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = noteContent.substring(start, end);
    const replacement = prefix + (selectedText || 'text') + suffix;

    const updated = noteContent.substring(0, start) + replacement + noteContent.substring(end);
    setNoteContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 10);
  };

  const handleToggleTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter((t) => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };

  const handleAppendLog = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!noteContent.trim()) return;

    const newLog: CropObservationalLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      technicianId: technicianId.trim() || 'TECH-FIELD',
      targetMetadataField: selectedField,
      content: noteContent.trim(),
      tags: [...activeTags],
    };

    const updatedLogs = [newLog, ...observationalLogs];
    const updatedCrop: CropAnalysisResult = {
      ...cropData,
      observationalLogs: updatedLogs,
    };

    if (onUpdateCropData) {
      onUpdateCropData(updatedCrop);
    }

    setNoteContent('');
    setActiveTags([]);
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  const handleDeleteLog = (id: string) => {
    const updatedLogs = observationalLogs.filter((l) => l.id !== id);
    const updatedCrop: CropAnalysisResult = {
      ...cropData,
      observationalLogs: updatedLogs,
    };
    if (onUpdateCropData) {
      onUpdateCropData(updatedCrop);
    }
  };

  // Export JSON Report with all metadata and appended logs
  const handleExportJsonWithNotes = () => {
    const exportPayload = {
      reportType: 'Field Observational Crop Metadata Audit',
      exportedAt: new Date().toISOString(),
      cropMetadata: {
        cropType: cropData.cropType,
        location: cropData.location,
        healthStatus: cropData.healthStatus,
        healthScore: cropData.healthScore,
        growthStage: cropData.growthStage,
        diseaseDetected: cropData.diseaseDetected,
        weedPressurePercent: cropData.weedPressurePercent,
        alertScores: cropData.alertScores,
        treatmentPlan: cropData.treatmentPlan,
      },
      observationalLogsCount: observationalLogs.length,
      observationalLogs: observationalLogs,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crop_observational_metadata_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Simple rich text renderer (supports **bold**, *italic*, ==highlight==, • bullet)
  const renderRichText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formatted: React.ReactNode = line;

      // Check if bullet line
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const cleanLine = isBullet ? line.replace(/^[•-]\s*/, '') : line;

      // Replace bold
      const parts = cleanLine.split(/(\*\*.*?\*\*|\*.*?\*|==.*?==)/g);
      const elements = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx} className="italic text-gray-800">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('==') && part.endsWith('==')) {
          return (
            <mark key={pIdx} className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-medium">
              {part.slice(2, -2)}
            </mark>
          );
        }
        return part;
      });

      return (
        <div key={idx} className={isBullet ? 'flex items-start gap-1.5 ml-2 mt-0.5' : 'mt-0.5'}>
          {isBullet && <span className="text-emerald-700 font-bold">•</span>}
          <span>{elements}</span>
        </div>
      );
    });
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm space-y-4 text-gray-900">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-[#1B4332] border border-emerald-200">
              <FileText className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-gray-900 font-display">
              Technician Observational Field Log (Rich Text Metadata)
            </h3>
          </div>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Append qualitative ground observations to crop telemetry entries • Preserved in exported JSON audit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-export-crop-notes-json"
            onClick={handleExportJsonWithNotes}
            className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-mono font-bold transition-all shadow-xs flex items-center gap-1.5 min-h-[38px]"
            title="Download JSON telemetry report with attached observational notes"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export JSON + Notes ({observationalLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {isSavedBanner && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Observational log appended to metadata entry & synchronized locally!</span>
        </div>
      )}

      {/* Target Metadata Entry Selector & Technician Identity */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
        <div className="sm:col-span-8 space-y-1">
          <label className="text-[11px] font-mono text-gray-600 uppercase font-bold flex items-center gap-1">
            <span>Target Crop Metadata Field</span>
          </label>
          <select
            id="target-metadata-selector"
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full bg-[#F8FAF9] border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            {metadataFieldOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4 space-y-1">
          <label className="text-[11px] font-mono text-gray-600 uppercase font-bold flex items-center gap-1">
            <User className="w-3 h-3 text-emerald-700" />
            <span>Technician ID</span>
          </label>
          <input
            type="text"
            value={technicianId}
            onChange={(e) => setTechnicianId(e.target.value)}
            placeholder="TECH-412"
            className="w-full bg-[#F8FAF9] border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Rich Text Editor Toolbar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg text-xs font-mono">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition-colors"
              title="Bold (**text**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition-colors"
              title="Italic (*text*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('==', '==')}
              className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition-colors"
              title="Highlight (==alert==)"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-700" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('• ')}
              className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition-colors"
              title="Bullet Item (• item)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('### ')}
              className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition-colors"
              title="Heading (### Title)"
            >
              <Heading className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-gray-300 mx-0.5" />

            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                previewMode ? 'bg-[#1B4332] text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              {previewMode ? 'Edit Mode' : 'Live Preview'}
            </button>
          </div>

          <span className="text-[11px] font-mono text-gray-400">
            {noteContent.length} chars
          </span>
        </div>

        {/* Editor Body or Live Preview */}
        {previewMode ? (
          <div className="w-full min-h-[110px] p-3 rounded-xl bg-[#F8FAF9] border border-gray-200 text-xs font-sans text-gray-800 space-y-1">
            {noteContent ? (
              renderRichText(noteContent)
            ) : (
              <span className="text-gray-400 italic">Preview empty. Type observation notes below...</span>
            )}
          </div>
        ) : (
          <textarea
            id="field-technician-note-input"
            rows={3}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Type field technician observational note... e.g. **Canopy Closure**: Leaf layer expanding rapidly. Mild ==chlorosis== observed along furrow 3. Soil moisture steady."
            className="w-full bg-[#F8FAF9] border border-gray-200 rounded-xl p-3 text-xs font-sans text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none leading-relaxed resize-y"
          />
        )}

        {/* Quick Agronomical Tag Pills */}
        <div className="space-y-1 pt-1">
          <div className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
            <Tag className="w-3 h-3 text-emerald-700" />
            <span>Append Agronomical Tags:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_AGRONOMY_TAGS.map((tag) => {
              const isSelected = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Append Button */}
        <div className="flex items-center justify-between pt-2">
          {onOpenChatWithPrompt && (
            <button
              type="button"
              onClick={() =>
                onOpenChatWithPrompt(
                  `Technician Field Note regarding ${cropData.cropType} (${selectedField}): "${noteContent || 'General scouting assessment'}". What actions or corrective measures do you recommend?`
                )
              }
              className="text-xs font-mono text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Ask AI Agronomist About This Note</span>
            </button>
          )}

          <button
            id="btn-append-field-note"
            type="button"
            onClick={() => handleAppendLog()}
            disabled={!noteContent.trim()}
            className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-black text-white text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ml-auto min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Append Note to Metadata</span>
          </button>
        </div>
      </div>

      {/* Existing Appended Notes History List */}
      <div className="pt-3 border-t border-gray-100 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-gray-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            <span>Appended Metadata Observational Logs ({observationalLogs.length})</span>
          </span>
          <span className="text-[11px] text-gray-400">Included in Exported JSON</span>
        </div>

        {observationalLogs.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs font-mono text-gray-400">
            No observational notes appended yet. Select a field and type above to attach a note.
          </div>
        ) : (
          <div className="space-y-2">
            {observationalLogs.map((log) => {
              return (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-gray-200 bg-[#F8FAF9] text-xs space-y-1.5 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold uppercase">
                        {log.targetMetadataField}
                      </span>
                      <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • Tech {log.technicianId}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete this observational log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="font-sans text-gray-800 leading-relaxed pt-0.5">
                    {renderRichText(log.content)}
                  </div>

                  {log.tags && log.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {log.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
