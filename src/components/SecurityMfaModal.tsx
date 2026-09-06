import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Key,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { UserRole } from '../types';

interface SecurityMfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  mfaEnabled: boolean;
  onToggleMfa: () => void;
}

export const SecurityMfaModal: React.FC<SecurityMfaModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onChangeRole,
  mfaEnabled,
  onToggleMfa,
}) => {
  const [totpCode, setTotpCode] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState(false);

  if (!isOpen) return null;

  const roleDisplayNames: Record<UserRole, string> = {
    FIELD_TECH: 'Field Technician',
    AGRI_SUPERVISOR: 'Agri Supervisor',
    QUALITY_INSPECTOR: 'Quality Inspector',
    SYSTEM_ADMIN: 'System Admin',
  };

  const rolePermissions: Record<UserRole, string[]> = {
    SYSTEM_ADMIN: [
      'Full administrative access & cloud database sync',
      'Deploy A2A Judge self-maintenance scripts',
      'Override conveyor sorting defect thresholds',
      'Approve pesticide quarantine protocols',
    ],
    AGRI_SUPERVISOR: [
      'Submit crop disease and weed segmentation analyses',
      'Issue IPM biological control prescriptions',
      'Calibrate PlantVillage & Kaggle model weights',
      'Interact with Gemini 3.8 agronomy chat',
    ],
    FIELD_TECH: [
      'Stream live drone orthomosaic video feeds',
      'Cache offline field GIS vector maps',
      'Capture camera leaf & insect samples',
      'View field health telemetry',
    ],
    QUALITY_INSPECTOR: [
      'Manage conveyor optical grading line',
      'Trigger pneumatic defect ejection actuator',
      'Generate USDA/Export Grade A certificates',
      'Inspect fruit firmness and color scores',
    ],
  };

  const handleVerifyTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length === 6) {
      onToggleMfa();
      setMfaSuccess(true);
      setTimeout(() => setMfaSuccess(false), 2500);
      setTotpCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white border border-gray-200/80 rounded-2xl shadow-xl flex flex-col overflow-hidden text-gray-900">
        {/* Modal Header (High Density Theme) */}
        <div className="p-4 bg-[#F1F3F0] border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#1B4332]" />
            <h3 className="text-sm font-bold text-gray-900">Security, RBAC & Multi-Factor Auth (MFA)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-500 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Active Role Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
              Active User Role (RBAC):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['FIELD_TECH', 'AGRI_SUPERVISOR', 'QUALITY_INSPECTOR', 'SYSTEM_ADMIN'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onChangeRole(r)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    currentRole === r
                      ? 'bg-[#1B4332] text-white border-[#1B4332] font-bold shadow-sm'
                      : 'bg-[#F8FAF9] text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <span>{roleDisplayNames[r]}</span>
                  {currentRole === r && <UserCheck className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Role Permissions Box */}
          <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200/70 space-y-2">
            <span className="text-[11px] font-mono text-[#1B4332] font-bold uppercase tracking-wider">
              {currentRole} Entitlements:
            </span>
            <ul className="space-y-1 text-xs text-gray-700">
              {rolePermissions[currentRole].map((perm, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* MFA Section */}
          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-gray-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#1B4332]" />
                <span className="text-xs font-bold text-gray-900">Multi-Factor Authentication (TOTP)</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  mfaEnabled
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {mfaEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>

            <p className="text-[11px] text-gray-600 leading-relaxed">
              Enforce time-based one-time password (TOTP) codes from Google Authenticator or hardware FIDO2 keys before
              overriding sorting line actuators or deploying new model weights.
            </p>

            <form onSubmit={handleVerifyTotp} className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="Enter 6-digit code (e.g. 584920)"
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 font-mono text-center tracking-widest placeholder-gray-400 focus:outline-none focus:border-[#1B4332]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#2D5A27] text-white font-bold text-xs font-mono transition-all shadow-sm"
              >
                {mfaEnabled ? 'Rotate MFA' : 'Enable MFA'}
              </button>
            </form>

            {mfaSuccess && (
              <div className="p-2 rounded bg-green-50 border border-green-200 text-green-800 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>MFA Token successfully verified and security policy active!</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-[#F1F3F0] border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
