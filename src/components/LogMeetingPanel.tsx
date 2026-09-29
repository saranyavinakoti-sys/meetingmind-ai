import React, { useState, useEffect } from 'react';
import { Contact, Memory } from '../types';
import { saveMemory } from '../lib/hindsight';
import { Avatar } from './Avatar';
import { useVoice } from '../hooks/useVoice';

interface LogMeetingPanelProps {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onMemorySaved: (newMemory: Memory) => void;
}

export const LogMeetingPanel: React.FC<LogMeetingPanelProps> = ({
  isOpen,
  contact,
  onClose,
  onMemorySaved,
}) => {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveConfirmation, setSaveConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isListening, startListening, stopListening, transcript, clearTranscript } = useVoice();

  // Preset sample debrief if empty for quick testing
  useEffect(() => {
    if (isOpen && contact) {
      setSaveConfirmation(false);
      setErrorMessage(null);
      if (!note) {
        if (contact.id === 'rohan-mehta') {
          setNote('Rohan agreed to proceed with the pilot review. Raised query on freight rate volatility integration and promised to review SLA draft by Thursday.');
        } else if (contact.id === 'ananya-iyer') {
          setNote('Ananya reviewed the onboarding checklist. She confirmed testing WhatsApp bot responses and asked for a 3-month trial agreement before committing.');
        } else if (contact.id === 'arjun-nair') {
          setNote('Arjun confirmed legal sign-off on SOC 2 Type II report. Now focusing on engineering enablement workshops and internal rollout schedules.');
        } else {
          setNote(`${contact.name} confirmed budget alignment for Q4. However, requested formal confirmation of SLA latency guarantees and indemnification cap terms.`);
        }
      }
    }
  }, [isOpen, contact]);

  // Sync speech recognition into note textarea
  useEffect(() => {
    if (transcript) {
      setNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  if (!isOpen || !contact) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setErrorMessage('Please enter meeting notes to record.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      // 1. Dispatch to Hindsight API & Local Storage
      const newMemory = await saveMemory(contact.id, note.trim(), {
        speaker: contact.name,
        subject: note.slice(0, 45),
      });

      // 2. Show inline confirmation
      setSaveConfirmation(true);
      onMemorySaved(newMemory);

      // 3. Auto-close after 2s and refresh dossier
      setTimeout(() => {
        setIsSaving(false);
        setSaveConfirmation(false);
        setNote('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err?.message || 'Failed to save memory to Hindsight repository');
    }
  };

  const toggleDictation = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        setNote((prev) => (prev ? `${prev} ${text}` : text));
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#12151C]/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-lg bg-[#FEF9EF] border-l border-[#DDD7CD] shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-6 bg-[#FFFFFF] border-b border-[#DDD7CD] flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#7B5900]">
                <span className="w-2 h-2 rounded-full bg-[#C89B3C]" />
                <span className="font-mono text-xs uppercase tracking-widest font-semibold">
                  INTELLIGENCE INGESTION
                </span>
              </div>
              <h2 className="font-serif text-2xl text-[#12151C]">Log Meeting</h2>
              <div className="flex items-center gap-2 mt-1">
                <Avatar name={contact.name} size="sm" hasFollowup={contact.hasFollowup} />
                <span className="text-xs text-[#46464B]">
                  {contact.name} · {contact.role}, {contact.org}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Dismiss panel"
              className="p-1.5 text-[#6B7280] hover:text-[#12151C] hover:bg-[#F8F3E9] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSave} className="p-6 flex-1 flex flex-col gap-5">
            {/* Context Meta */}
            <div className="flex items-center justify-between bg-[#F8F3E9] border border-[#DDD7CD] px-3.5 py-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#6B7280]">
                <span className="material-symbols-outlined text-[16px] text-[#C89B3C]">calendar_today</span>
                <span>Today · Post-meeting debrief</span>
              </div>
              <span className="text-[11px] font-mono text-[#7A8B6F] bg-[#FFFFFF] px-2 py-0.5 border border-[#DDD7CD]">
                HINDSIGHT READY
              </span>
            </div>

            {/* Debrief Field Notes */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="meeting-notes-input"
                  className="font-mono text-xs text-[#12151C] uppercase tracking-wider font-medium"
                >
                  Executive Transcript &amp; Raw Debrief
                </label>
                <span className="font-mono text-xs text-[#6B7280]">
                  {note.length} characters
                </span>
              </div>

              <div className="relative bg-[#FFFFFF] border border-[#DDD7CD] p-3 focus-within:border-[#12151C] transition-colors shadow-xs">
                <textarea
                  id="meeting-notes-input"
                  rows={7}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What was discussed, promised, or left open? (e.g. Promised revised SLA schedule by Thursday...)"
                  className="w-full bg-transparent text-sm text-[#12151C] placeholder:text-[#A0A4B0] focus:outline-none resize-none leading-relaxed"
                />

                {/* Micro dictation strip */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#DDD7CD]/60 text-xs">
                  <div className="flex items-center gap-1.5 text-[#6B7280] font-mono text-[11px]">
                    <span className="material-symbols-outlined text-[15px] text-[#C89B3C]">mic</span>
                    <span>{isListening ? 'Listening to speech...' : 'Microphone ready'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleDictation}
                    className={`px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider font-semibold border transition-colors cursor-pointer ${
                      isListening
                        ? 'bg-[#BA1A1A] text-white border-[#BA1A1A] animate-pulse'
                        : 'bg-[#F8F3E9] text-[#7B5900] border-[#DDD7CD] hover:bg-[#EFEAE0]'
                    }`}
                  >
                    {isListening ? 'Stop Dictating' : 'Dictate'}
                  </button>
                </div>
              </div>
            </div>

            {/* Synthesized Intel Extract Preview */}
            <div className="bg-[#F8F3E9] border border-[#DDD7CD] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#7B5900]">
                  <span className="material-symbols-outlined text-[16px] text-[#C89B3C]">psychology</span>
                  <span className="font-mono text-xs uppercase tracking-widest font-semibold">
                    Synthesized Intel Extract
                  </span>
                </div>
                <span className="font-mono text-[11px] bg-[#FFFFFF] px-2 py-0.5 border border-[#DDD7CD] text-[#6B7280]">
                  SEMANTIC PARSER
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="bg-[#FFFFFF] p-2.5 border border-[#DDD7CD] flex items-start gap-2.5 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-[#C89B3C] mt-0.5">handshake</span>
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">Key Memory Trigger</span>
                    <span className="text-[#12151C]">Notes will be indexed into {contact.name}'s Hindsight bank</span>
                  </div>
                </div>

                <div className="bg-[#FFFFFF] p-2.5 border border-[#DDD7CD] flex items-start gap-2.5 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-[#6B7280] mt-0.5">schedule</span>
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280]">Timeline Sequencing</span>
                    <span className="text-[#12151C]">Briefing dossier &amp; patterns will update automatically</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-[#FFDAD6] border border-[#BA1A1A] text-[#93000A] text-xs font-mono">
                {errorMessage}
              </div>
            )}

            {/* Confirmation Banner */}
            {saveConfirmation && (
              <div className="p-3 bg-[#D6E8C8] border border-[#7A8B6F] text-[#111F0B] text-xs font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#7A8B6F]">check_circle</span>
                <span>Memory encrypted &amp; integrated into relationship timeline. Auto-closing in 2s...</span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-auto pt-4 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSaving || saveConfirmation}
                className="w-full py-3 px-4 bg-[#12151C] hover:bg-[#1A1D24] text-[#EFEAE0] font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#12151C] disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px] text-[#C89B3C]">verified</span>
                <span>{isSaving ? 'Encrypting & Storing...' : 'Save memory'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-center text-xs font-mono text-[#6B7280] hover:text-[#12151C] transition-colors"
              >
                Discard Draft
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
};
