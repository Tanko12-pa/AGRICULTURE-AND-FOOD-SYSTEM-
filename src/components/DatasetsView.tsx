import React, { useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  Github,
  Database,
  Terminal,
  Copy,
  Check,
  Star,
  Layers,
  Sparkles,
} from 'lucide-react';
import { REFERENCE_DATASETS_AND_REPOS } from '../data/sampleData';

export const DatasetsView: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCommand = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (High Density Theme) */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm text-gray-900">
        <h2 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#1B4332]" />
          Agricultural Computer Vision Reference Repositories & Datasets
        </h2>
        <p className="text-xs text-gray-500 font-mono mt-1">
          Curated open-source starting points, PlantVillage benchmarks, 82-dataset collections, and state-of-the-art papers
        </p>
      </div>

      {/* Dataset & Repo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {REFERENCE_DATASETS_AND_REPOS.map((item, idx) => {
          const cloneCmd = `git clone ${item.url}.git`;

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-gray-300 transition-all flex flex-col justify-between space-y-4 group shadow-sm text-gray-900"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-[#1B4332]">
                      <Github className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#1B4332] transition-colors">
                        {item.name}
                      </h3>
                      <div className="text-[11px] text-gray-500 font-mono">{item.repo}</div>
                    </div>
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#F1F3F0] hover:bg-gray-200 text-gray-700 hover:text-[#1B4332] transition-all border border-gray-200"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-green-50 text-[#1B4332] border border-green-200 font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Terminal Clone Command Bar */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between bg-[#F8FAF9] p-2.5 rounded-xl border border-gray-200/70 text-xs font-mono">
                <span className="text-gray-600 truncate mr-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#1B4332] shrink-0" />
                  {cloneCmd}
                </span>
                <button
                  onClick={() => handleCopyCommand(cloneCmd, idx)}
                  className="px-2.5 py-1 rounded-md bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shrink-0 flex items-center gap-1 text-[11px] transition-all font-semibold shadow-2xs"
                >
                  {copiedIndex === idx ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  {copiedIndex === idx ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dataset Training Specifications Table */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4 text-gray-900">
        <h3 className="text-sm font-bold text-gray-900 font-display flex items-center gap-2">
          <Database className="w-4 h-4 text-[#1B4332]" />
          Model Training Architecture & Target Schemas
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-gray-700">
            <thead className="bg-[#F1F3F0] text-[#1B4332] border-b border-gray-200 font-bold">
              <tr>
                <th className="p-3">Vision Module</th>
                <th className="p-3">Primary Architecture</th>
                <th className="p-3">Training Dataset</th>
                <th className="p-3">Input Resolution</th>
                <th className="p-3">Deployment Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-[#F8FAF9]">
                <td className="p-3 font-semibold text-gray-900">Crop Disease</td>
                <td className="p-3">ViT-Base / ResNet-50</td>
                <td className="p-3">PlantVillage (54,306 images)</td>
                <td className="p-3">512 x 512 px</td>
                <td className="p-3 text-[#1B4332] font-semibold">FastAPI Cloud / Edge</td>
              </tr>
              <tr className="hover:bg-[#F8FAF9]">
                <td className="p-3 font-semibold text-gray-900">Weed Segmentation</td>
                <td className="p-3">DeepLabv3+ / Mask R-CNN</td>
                <td className="p-3">Digital Agriculture Weed Collection</td>
                <td className="p-3">1024 x 1024 px</td>
                <td className="p-3 text-[#1B4332] font-semibold">Drone Jetson Orin</td>
              </tr>
              <tr className="hover:bg-[#F8FAF9]">
                <td className="p-3 font-semibold text-gray-900">Pest Detection</td>
                <td className="p-3">YOLOv8x / Faster R-CNN</td>
                <td className="p-3">Dangerous Insects Dataset (Kaggle)</td>
                <td className="p-3">640 x 640 px</td>
                <td className="p-3 text-[#1B4332] font-semibold">RPi 5 Camera Module 3</td>
              </tr>
              <tr className="hover:bg-[#F8FAF9]">
                <td className="p-3 font-semibold text-gray-900">Food Quality Sorting</td>
                <td className="p-3">EfficientNet-B4 + YOLOv8</td>
                <td className="p-3">AI Agriculture Fruit Collections (82 sets)</td>
                <td className="p-3">1280 x 720 px</td>
                <td className="p-3 text-[#1B4332] font-semibold">GigE Industrial Conveyor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
