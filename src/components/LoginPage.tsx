import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (email: string, name: string) => void;
}

const PRESET_PERSONAS = [
  {
    name: 'Alden Vane',
    email: 'alden.vane@meridian-sovereign.org',
    role: 'Principal Partner',
    token: '••••••••••••••••',
  },
  {
    name: 'Eleanor Vance',
    email: 'e.vance@meridiancapital.ch',
    role: 'VP Procurement',
    token: '••••••••••••••••',
  },
  {
    name: 'Rohan Mehta',
    email: 'rohan.mehta@kridhalogistics.com',
    role: 'VP Operations',
    token: '••••••••••••••••',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('alden.vane@meridian-sovereign.org');
  const [password, setPassword] = useState('••••••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState<'standard' | 'azure'>('standard');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals for secondary actions
  const [isRecoverModalOpen, setIsRecoverModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState<string | null>(null);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOrg, setRegOrg] = useState('');

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Invalid corporate identification. Please provide a valid organizational address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Security token / passkey required to negotiate enclave handshake.');
      return;
    }

    setIsSubmitting(true);
    setAuthMethod('standard');

    setTimeout(() => {
      const displayName = email.split('@')[0].replace(/[._-]/g, ' ') || 'Executive Leader';
      const formattedName = displayName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      onLogin(email, formattedName);
    }, 600);
  };

  // Azure AD SSO Simulation
  const handleAzureSSO = () => {
    setIsSubmitting(true);
    setAuthMethod('azure');
    setErrorMessage(null);
    setTimeout(() => {
      onLogin('alden.vane@meridian-sovereign.org', 'Alden Vane');
    }, 1000);
  };

  // Persona quick select
  const handleSelectPersona = (persona: typeof PRESET_PERSONAS[0]) => {
    setEmail(persona.email);
    setPassword(persona.token);
    setErrorMessage(null);
  };

  // Registration submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regName) return;
    setIsRegisterModalOpen(false);
    setIsSubmitting(true);
    setTimeout(() => {
      onLogin(regEmail, regName);
    }, 500);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#12151C] text-[#EFEAE0] flex flex-col justify-between items-center px-4 sm:px-6 py-8 sm:py-12 overflow-x-hidden selection:bg-[#FCCA66] selection:text-[#261900]">
      {/* Background vector watermark matching reference graphic spec */}
      <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center select-none overflow-hidden">
        <svg className="w-full h-full max-w-4xl" fill="none" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="400" r="380" stroke="currentColor" strokeDasharray="4 8" strokeWidth="0.75" />
          <circle cx="400" cy="400" r="280" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="140" stroke="currentColor" strokeDasharray="2 6" strokeWidth="0.75" />
          <path d="M400 20 V780 M20 400 H780" stroke="currentColor" strokeDasharray="3 9" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Editorial Dossier Meta Header */}
      <header className="w-full max-w-md flex justify-between items-baseline z-10 pt-2">
        <div className="flex items-center gap-2 text-[#C4C6D0] font-mono text-xs tracking-widest uppercase">
          <span className="inline-block w-1.5 h-1.5 bg-[#FCCA66]" />
          <span>AUTH://PORTAL.01</span>
        </div>
        <div className="font-mono text-xs text-[#76777C] tracking-wider">
          SECURE NODE • ENCRYPTED 4096-BIT
        </div>
      </header>

      {/* Main Authentication Dossier Card */}
      <section className="w-full max-w-md my-auto z-10 py-6">
        <div className="bg-[#FEF9EF] shadow-2xl border border-[#DDD7CD] p-6 sm:p-8 text-[#1D1C16] relative transition-all">
          {/* Brand Identity */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-3">
              <div className="w-12 h-12 rounded border border-[#C89B3C]/50 bg-[#12151C] flex items-center justify-center text-[#C89B3C] shadow-sm">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield_person
                </span>
              </div>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#12151C] tracking-tight mb-1">
              MeetingMind
            </h1>
            <p className="text-xs text-[#6B7280] max-w-xs mx-auto">
              Precision relationship intelligence for executive leaders.
            </p>
          </div>

          {/* Quick Persona Selector Chips */}
          <div className="mb-5 p-2.5 bg-[#F8F3E9] border border-[#DDD7CD]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">
                Select Demo Identity:
              </span>
              <span className="font-mono text-[10px] text-[#7B5900] font-medium">1-Click Autofill</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PERSONAS.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleSelectPersona(p)}
                  className={`px-2 py-1 text-[11px] font-mono border transition-all cursor-pointer ${
                    email === p.email
                      ? 'bg-[#12151C] text-[#EFEAE0] border-[#12151C] font-semibold'
                      : 'bg-[#FFFFFF] text-[#46464B] border-[#DDD7CD] hover:border-[#12151C]'
                  }`}
                >
                  {p.name.split(' ')[0]} ({p.role.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Form Context */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Corporate Identifier Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <label className="font-mono text-xs text-[#12151C] uppercase tracking-wider" htmlFor="corporate-identity">
                  Corporate Identification
                </label>
                <span className="font-mono text-[10px] text-[#76777C]">RESTRICTED</span>
              </div>
              <div className="relative bg-[#FFFFFF] border border-[#DDD7CD] focus-within:border-[#12151C] transition-colors">
                <input
                  id="corporate-identity"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full bg-transparent px-3 py-2 text-sm text-[#12151C] placeholder:text-[#A0A4B0] focus:outline-none"
                />
              </div>
            </div>

            {/* Cryptographic Passkey Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <label className="font-mono text-xs text-[#12151C] uppercase tracking-wider" htmlFor="security-token">
                  Access Token / Passkey
                </label>
                <button
                  type="button"
                  onClick={() => setIsRecoverModalOpen(true)}
                  className="font-mono text-[11px] text-[#7B5900] hover:text-[#5D4200] transition-colors cursor-pointer underline decoration-[#C89B3C]/50"
                >
                  Recover Key
                </button>
              </div>
              <div className="relative bg-[#FFFFFF] border border-[#DDD7CD] flex items-center focus-within:border-[#12151C] transition-colors">
                <input
                  id="security-token"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent px-3 py-2 text-sm text-[#12151C] placeholder:text-[#A0A4B0] focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle passkey visibility"
                  className="px-2 text-[#76777C] hover:text-[#12151C] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Inline Error State (Exact layout matching Image 7 / 14 / 23) */}
              {errorMessage && (
                <div className="bg-[#FFDAD6]/70 border border-[#BA1A1A]/40 px-3 py-2 flex items-start gap-2 mt-2">
                  <span
                    className="material-symbols-outlined text-[#BA1A1A] text-base leading-tight mt-0.5 shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    error
                  </span>
                  <p className="font-mono text-xs text-[#93000A] leading-tight">
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Primary Sign-In Action (Warm Gold Pill matching Reference) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FCCA66] hover:bg-[#F0BF5C] text-[#261900] font-mono text-xs py-3.5 px-4 flex items-center justify-center gap-2 transition-all uppercase tracking-wider font-semibold cursor-pointer border border-[#C89B3C] shadow-sm active:scale-[0.99] disabled:opacity-60"
              >
                <span>{isSubmitting && authMethod === 'standard' ? 'Authenticating Session...' : 'Authenticate Session'}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>

            {/* Editorial Partition Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="w-full h-px bg-[#DDD7CD]" />
              <span className="absolute bg-[#FEF9EF] px-2 font-mono text-[10px] text-[#76777C] uppercase tracking-widest">
                Protocol Option
              </span>
            </div>

            {/* Enterprise SSO (Microsoft Identity spec) */}
            <button
              type="button"
              onClick={handleAzureSSO}
              disabled={isSubmitting}
              className="w-full bg-[#F8F3E9] hover:bg-[#EFEAE0] border border-[#DDD7CD] text-[#1D1C16] font-mono text-xs py-3 px-4 flex items-center justify-center gap-2.5 transition-colors cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting && authMethod === 'azure' ? (
                <span className="material-symbols-outlined text-[18px] animate-spin text-[#7B5900]">
                  progress_activity
                </span>
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                  <rect fill="#F25022" height="10" width="10" />
                  <rect fill="#7FBA00" height="10" width="10" x="11" />
                  <rect fill="#00A4EF" height="10" width="10" y="11" />
                  <rect fill="#FFB900" height="10" width="10" x="11" y="11" />
                </svg>
              )}
              <span>
                {isSubmitting && authMethod === 'azure'
                  ? 'Federating Azure AD Enclave...'
                  : 'Continue with Corporate Azure AD'}
              </span>
            </button>

            {/* Cryptographic Memory Trace Status Panel */}
            <div className="bg-[#F8F3E9] border border-[#DDD7CD] p-2 flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7A8B6F]" />
                <span className="text-[#46464B]">HSM Hardware Enclave: Active</span>
              </div>
              <span className="text-[#76777C]">LOC://US-EAST-VA</span>
            </div>
          </form>

          {/* Secondary Enrollment Flow */}
          <footer className="mt-6 pt-3 text-center border-t border-[#DDD7CD] -mx-6 -mb-6 p-4 bg-[#FFFFFF]">
            <p className="text-xs text-[#46464B]">
              Unregistered institutional entity?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(true)}
                className="font-semibold text-[#7B5900] hover:text-[#5D4200] transition-colors underline decoration-[#C89B3C]/50 cursor-pointer"
              >
                Create an account
              </button>
            </p>
          </footer>
        </div>
      </section>

      {/* Global Compliance & Security Footnote */}
      <footer className="w-full max-w-md flex flex-col sm:flex-row items-center justify-between text-[#C4C6D0] font-mono text-[11px] tracking-wider gap-2 z-10 pb-2">
        <span>CLASS-IV CLASSIFIED REPOSITORIES</span>
        <div className="flex gap-3 text-[#76777C]">
          <button
            onClick={() => setIsComplianceModalOpen('Audit Charter')}
            className="hover:text-[#EFEAE0] transition-colors cursor-pointer"
          >
            Audit Charter
          </button>
          <span>•</span>
          <button
            onClick={() => setIsComplianceModalOpen('Legal Briefing')}
            className="hover:text-[#EFEAE0] transition-colors cursor-pointer"
          >
            Legal Briefing
          </button>
          <span>•</span>
          <button
            onClick={() => setIsComplianceModalOpen('Telemetry')}
            className="hover:text-[#EFEAE0] transition-colors cursor-pointer"
          >
            Telemetry
          </button>
        </div>
      </footer>

      {/* Recover Key Modal */}
      {isRecoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12151C]/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FEF9EF] border border-[#DDD7CD] p-6 shadow-2xl text-[#1D1C16]">
            <div className="flex items-center justify-between border-b border-[#DDD7CD] pb-3 mb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#7B5900] font-semibold">
                KEY RECOVERY PROTOCOL
              </span>
              <button
                onClick={() => setIsRecoverModalOpen(false)}
                className="text-[#6B7280] hover:text-[#12151C]"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#46464B] leading-relaxed mb-4">
              Enter your registered corporate email to reconstruct your ephemeral session passkey.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-xs font-mono"
                placeholder="name@organization.com"
              />
              <button
                type="button"
                onClick={() => {
                  setPassword('PASSKEY-MM-8842-SEC');
                  setIsRecoverModalOpen(false);
                }}
                className="w-full py-2 bg-[#12151C] text-[#EFEAE0] font-mono text-xs uppercase tracking-wider font-semibold"
              >
                Inject Regenerated Passkey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12151C]/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FEF9EF] border border-[#DDD7CD] p-6 shadow-2xl text-[#1D1C16]">
            <div className="flex items-center justify-between border-b border-[#DDD7CD] pb-3 mb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#7B5900] font-semibold">
                INSTITUTIONAL ENROLLMENT
              </span>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-[#6B7280] hover:text-[#12151C]"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[#6B7280] block mb-1">Executive Full Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-xs text-[#12151C]"
                />
              </div>
              <div>
                <label className="text-[#6B7280] block mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="marcus.vance@org.com"
                  className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-xs text-[#12151C]"
                />
              </div>
              <div>
                <label className="text-[#6B7280] block mb-1">Organization / Entity</label>
                <input
                  type="text"
                  value={regOrg}
                  onChange={(e) => setRegOrg(e.target.value)}
                  placeholder="G7 Energy Delegation"
                  className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-xs text-[#12151C]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#12151C] text-[#EFEAE0] font-mono text-xs uppercase tracking-wider font-semibold mt-2"
              >
                Initialize Executive Dossier &amp; Enter
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Compliance / Security Info Modal */}
      {isComplianceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12151C]/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FEF9EF] border border-[#DDD7CD] p-6 shadow-2xl text-[#1D1C16]">
            <div className="flex items-center justify-between border-b border-[#DDD7CD] pb-3 mb-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#7B5900] font-semibold">
                SPECIFICATION // {isComplianceModalOpen.toUpperCase()}
              </span>
              <button
                onClick={() => setIsComplianceModalOpen(null)}
                className="text-[#6B7280] hover:text-[#12151C]"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#46464B] leading-relaxed mb-4">
              MeetingMind operates in accordance with Class-IV institutional relationship intelligence protocols. All stored Hindsight memory vectors are encrypted using AES-256 GCM ephemeral enclave keys with zero telemetry tracking.
            </p>
            <div className="p-3 bg-[#F8F3E9] border border-[#DDD7CD] text-[11px] font-mono text-[#6B7280] space-y-1">
              <div>• Protocol: Ephemeral HSM Handshake</div>
              <div>• Inference Engine: Groq Ultra-Low Latency (openai/gpt-oss-120b)</div>
              <div>• Memory Layer: Hindsight Cloud Isolated Bank</div>
              <div>• Audio Synthesis: Native Web Speech API Enclave</div>
            </div>
            <button
              type="button"
              onClick={() => setIsComplianceModalOpen(null)}
              className="mt-4 px-4 py-1.5 border border-[#DDD7CD] text-xs font-mono uppercase bg-[#FFFFFF] hover:bg-[#EFEAE0]"
            >
              Acknowledge &amp; Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
