import React, { useState } from 'react';
import { Contact, Memory } from '../types';
import { saveMemory } from '../lib/hindsight';

interface DataIngestionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddContact: () => void;
  onOpenLogMeeting: (contact: Contact) => void;
  contacts: Contact[];
  onMemoryAdded: (newMemory: Memory) => void;
}

export const DataIngestionGuideModal: React.FC<DataIngestionGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenAddContact,
  onOpenLogMeeting,
  contacts,
  onMemoryAdded,
}) => {
  const [ingestingIndex, setIngestingIndex] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleIngestionTemplates = [
    {
      contactId: 'rohan-mehta',
      contactName: 'Rohan Mehta (Kridha Logistics)',
      title: 'Warehouse 4 Pilot Signoff & Integration SLA',
      note: 'Met with Rohan over Google Meet. Confirmed Phase 1 rollout across 4 hubs. Accepted API throughput specs, but requested latency SLA guarantee of under 180ms by next Wednesday.',
      type: 'promise' as const,
      highlight: 'Latency SLA guarantee under 180ms by Wednesday',
    },
    {
      contactId: 'ananya-iyer',
      contactName: 'Ananya Iyer (Saffron & Co.)',
      title: 'WhatsApp Automation Trial Review',
      note: 'Reviewed preliminary WhatsApp bot analytics with Ananya. She agreed conversion rates are up 24%, but insisted on dedicated support channel before signing 12-month enterprise contract.',
      type: 'followup' as const,
      highlight: 'Dedicated support channel required for 12-month contract',
    },
    {
      contactId: 'julian-vance-croft',
      contactName: 'Julian Vance-Croft (Horizon Ventures)',
      title: 'Initial Introductory Strategy Sync',
      note: 'Initial meeting with Julian at Horizon VC. Discussed enterprise market traction and ARR milestones. Julian expressed strong interest in our Hindsight memory integration and requested a product roadmap overview deck by Friday.',
      type: 'discussion' as const,
      highlight: 'Product roadmap overview deck requested by Friday',
    },
  ];

  const handleQuickIngest = async (item: typeof sampleIngestionTemplates[0], index: number) => {
    setIngestingIndex(index);
    setSuccessMsg(null);
    try {
      const memory = await saveMemory(item.contactId, item.note, {
        speaker: item.contactName.split(' ')[0],
        subject: item.title,
      });
      onMemoryAdded(memory);
      setSuccessMsg(`Successfully ingested memory for ${item.contactName}! Hindsight has indexed the debrief.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setSuccessMsg(`Error: ${err?.message || 'Failed to ingest'}`);
    } finally {
      setIngestingIndex(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#12151C]/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#FEF9EF] border border-[#DDD7CD] shadow-2xl p-6 sm:p-8 flex flex-col gap-6 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DDD7CD] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C89B3C]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#7B5900] font-semibold">
                SYSTEM GUIDE // DATA INGESTION & MEMORY ARCHITECTURE
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#12151C] mt-1">
              How to Add Data to MeetingMind
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
              Everything in MeetingMind is powered by your contact directory, meeting links, and Hindsight conversational memories.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6B7280] hover:text-[#12151C] hover:bg-[#EFEAE0] transition-colors rounded"
            aria-label="Close guide"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Success toast notification */}
        {successMsg && (
          <div className="p-3 bg-[#EAF2E8] border border-[#7A8B6F] text-[#2D5A27] text-xs font-mono flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* 3 Core Ingestion Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Method 1: Add New Contact */}
          <div className="p-4 bg-[#FFFFFF] border border-[#DDD7CD] flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-[#7B5900] uppercase font-bold tracking-wider">
                  METHOD 01
                </span>
                <span className="material-symbols-outlined text-[20px] text-[#C89B3C]">
                  person_add
                </span>
              </div>
              <h3 className="font-serif text-lg text-[#12151C] font-semibold mb-1">
                Add a New Contact
              </h3>
              <p className="text-xs text-[#46464B] leading-relaxed mb-3">
                Click <strong>+ Add Contact</strong> to register any client, partner, or advisor. Specify their role, organization, corporate email, and their <strong>Google Meet or Zoom room link</strong>.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAddContact();
              }}
              className="w-full py-2 bg-[#12151C] hover:bg-[#1A1D24] text-[#EFEAE0] text-xs font-mono uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#C89B3C]">add</span>
              <span>Open Add Contact Form</span>
            </button>
          </div>

          {/* Method 2: Log Meeting Debrief */}
          <div className="p-4 bg-[#FFFFFF] border border-[#DDD7CD] flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-[#7B5900] uppercase font-bold tracking-wider">
                  METHOD 02
                </span>
                <span className="material-symbols-outlined text-[20px] text-[#C89B3C]">
                  history_edu
                </span>
              </div>
              <h3 className="font-serif text-lg text-[#12151C] font-semibold mb-1">
                Log Meeting &amp; Memories
              </h3>
              <p className="text-xs text-[#46464B] leading-relaxed mb-3">
                Click <strong>Log Meeting</strong> on any contact card or inside their dossier. Type notes or <strong>dictate by voice</strong> using your microphone. Hindsight saves and indexes every commitment.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                const target = contacts[0];
                if (target) onOpenLogMeeting(target);
              }}
              className="w-full py-2 bg-[#F8F3E9] hover:bg-[#EFEAE0] text-[#12151C] border border-[#DDD7CD] text-xs font-mono uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#C89B3C]">mic</span>
              <span>Open Log Meeting Panel</span>
            </button>
          </div>
        </div>

        {/* Method 3: 1-Click Sample Data Ingestion */}
        <div className="p-4 sm:p-5 bg-[#F8F3E9] border border-[#DDD7CD]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#C89B3C]">flash_on</span>
              <h3 className="font-serif text-base sm:text-lg text-[#12151C] font-semibold">
                Quick Sample Ingestion (1-Click Test)
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase text-[#7B5900] bg-[#FFFFFF] px-2 py-0.5 border border-[#DDD7CD]">
              INSTANT POPULATE
            </span>
          </div>
          <p className="text-xs text-[#46464B] mb-3">
            Want to test how MeetingMind generates recall cards and recurring patterns without typing? Ingest any of these realistic executive debriefs:
          </p>

          <div className="flex flex-col gap-2.5">
            {sampleIngestionTemplates.map((template, idx) => (
              <div
                key={template.contactId}
                className="bg-[#FFFFFF] border border-[#DDD7CD] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#12151C]">
                      {template.contactName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#F8F3E9] border border-[#DDD7CD] text-[#7B5900]">
                      {template.type}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] truncate mt-0.5">
                    {template.note}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={ingestingIndex === idx}
                  onClick={() => handleQuickIngest(template, idx)}
                  className="px-3 py-1.5 bg-[#FCCA66] hover:bg-[#F0BF5C] text-[#261900] font-mono text-[11px] uppercase tracking-wider font-bold border border-[#C89B3C] shrink-0 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {ingestingIndex === idx ? 'hourglass_top' : 'save'}
                  </span>
                  <span>{ingestingIndex === idx ? 'Ingesting...' : 'Ingest Debrief'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Video & Voice Conference Links (Google Meet / Zoom) Info */}
        <div className="p-4 bg-[#FFFFFF] border border-[#DDD7CD] flex items-start gap-3">
          <span className="material-symbols-outlined text-[24px] text-[#C89B3C] shrink-0 mt-0.5">
            video_camera_front
          </span>
          <div className="text-xs text-[#46464B] space-y-1">
            <h4 className="font-serif text-sm font-semibold text-[#12151C]">
              Meeting Link Integration (Google Meet &amp; Zoom)
            </h4>
            <p className="leading-relaxed">
              Every contact has a dedicated <code className="bg-[#F8F3E9] px-1 py-0.5 text-[#12151C] font-mono">meetingLink</code>. 
              Before your call, click <strong>"Prep me"</strong> for a voice or written briefing; when you're done, tap 
              <strong> "Join meeting"</strong> to immediately launch the call in a new browser tab.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#DDD7CD]">
          <span className="text-[11px] font-mono text-[#6B7280]">
            MeetingMind // Executive Relationship Intelligence
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#12151C] hover:bg-[#1A1D24] text-[#EFEAE0] text-xs font-mono uppercase tracking-wider font-semibold cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
