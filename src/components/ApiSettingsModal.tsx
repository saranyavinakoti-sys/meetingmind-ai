import React, { useState } from 'react';
import { getHindsightApiKey, setHindsightApiKey, getHindsightBankId, setHindsightBankId } from '../lib/hindsight';
import { getGroqApiKey, setGroqApiKey, getGroqModel, setGroqModel } from '../lib/groq';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [hindsightKey, setHindsightKey] = useState(getHindsightApiKey());
  const [hindsightBank, setHindsightBank] = useState(getHindsightBankId());
  const [groqKey, setGroqKey] = useState(getGroqApiKey());
  const [groqModel, setModel] = useState(getGroqModel());
  const [savedStatus, setSavedStatus] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setHindsightApiKey(hindsightKey);
    setHindsightBankId(hindsightBank);
    setGroqApiKey(groqKey);
    setGroqModel(groqModel);
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      if (onSaved) onSaved();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12151C]/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#FEF9EF] border border-[#DDD7CD] shadow-2xl p-6 sm:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DDD7CD] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C89B3C]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#7B5900] font-semibold">
                INTELLIGENCE PROTOCOL // CONFIGURATION
              </span>
            </div>
            <h2 className="font-serif text-2xl text-[#12151C] mt-1">API Integrations</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6B7280] hover:text-[#12151C] hover:bg-[#EFEAE0] transition-colors"
            aria-label="Close settings"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5 text-sm">
          {/* Hindsight Section */}
          <div className="p-4 bg-[#F8F3E9] border border-[#DDD7CD] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-[#12151C] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#C89B3C]">history_edu</span>
                Hindsight Cloud Memory API
              </span>
              <span className="text-[11px] font-mono text-[#7A8B6F] font-medium bg-[#EFEAE0] px-2 py-0.5 border border-[#DDD7CD]">
                {hindsightKey ? 'LIVE CLOUD LINK' : 'BUILT-IN ENGINE ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Provides long-term semantic relationship memory. Use promo code <code className="bg-[#EFEAE0] text-[#7B5900] px-1 py-0.5 font-mono font-bold">MEMHACK99</code> for $50 free credits at <a href="https://ui.hindsight.vectorize.io" target="_blank" rel="noreferrer" className="text-[#C89B3C] underline">ui.hindsight.vectorize.io</a>.
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono uppercase text-[#46464B]" htmlFor="hindsight-key-input">
                Hindsight API Key
              </label>
              <input
                id="hindsight-key-input"
                type="password"
                placeholder="Optional (defaults to enclave memory bank if blank)"
                value={hindsightKey}
                onChange={(e) => setHindsightKey(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-xs font-mono focus:border-[#12151C] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono uppercase text-[#46464B]" htmlFor="hindsight-bank-input">
                Memory Bank Identifier
              </label>
              <input
                id="hindsight-bank-input"
                type="text"
                value={hindsightBank}
                onChange={(e) => setHindsightBank(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-xs font-mono focus:border-[#12151C] focus:outline-none"
              />
            </div>
          </div>

          {/* Groq Section */}
          <div className="p-4 bg-[#F8F3E9] border border-[#DDD7CD] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-[#12151C] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#C89B3C]">psychology</span>
                Groq Fast Inference API
              </span>
              <span className="text-[11px] font-mono text-[#7A8B6F] font-medium bg-[#EFEAE0] px-2 py-0.5 border border-[#DDD7CD]">
                {groqKey ? 'LIVE GROQ INFERENCE' : 'COGNITIVE ENGINE READY'}
              </span>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Ultra-low latency LLM inference for executive synthesis and spoken briefing audio.
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono uppercase text-[#46464B]" htmlFor="groq-key-input">
                Groq API Key
              </label>
              <input
                id="groq-key-input"
                type="password"
                placeholder="gsk_..."
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-xs font-mono focus:border-[#12151C] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono uppercase text-[#46464B]" htmlFor="groq-model-select">
                Target Model
              </label>
              <select
                id="groq-model-select"
                value={groqModel}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-xs font-mono focus:border-[#12151C] focus:outline-none"
              >
                <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Recommended)</option>
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
              </select>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-between pt-2 border-t border-[#DDD7CD]">
            <span className="text-xs font-mono text-[#6B7280]">
              {savedStatus ? '✓ Settings committed to local store' : 'Keys preserved securely in browser local enclave'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#DDD7CD] text-[#12151C] hover:bg-[#EFEAE0] text-xs font-mono uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#12151C] text-[#EFEAE0] hover:bg-[#1A1D24] text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-[#C89B3C]">verified</span>
                Save Protocol
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
