import React from 'react';
import { Contact } from '../types';
import { Avatar } from './Avatar';

interface EmptyStateProps {
  contact: Contact;
  onLogMeeting: () => void;
  onQuickImport?: (type: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  contact,
  onLogMeeting,
  onQuickImport,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-6 px-4 sm:px-6">
      {/* Top Dossier Header Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD7CD] pb-4">
        <div className="flex items-center gap-2 font-mono text-xs text-[#6B7280]">
          <span>FILE REF: MM-2026-{contact.id.toUpperCase().slice(0, 8)}</span>
          <span>/</span>
          <span>SEC_LEVEL: 0 (UNLOGGED)</span>
          <span>/</span>
          <span className="text-[#7B5900] font-medium">DISPOSITION: UNINDEXED</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] px-2.5 py-0.5 border border-[#DDD7CD] bg-[#EDE8DE] text-[#46464B] uppercase tracking-wider font-semibold">
            NO HISTORY
          </span>
          <span className="font-mono text-[11px] px-2.5 py-0.5 bg-[#FCCA66] text-[#755400] uppercase tracking-wider font-semibold">
            NEW CONTACT
          </span>
        </div>
      </div>

      {/* Contact Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F3E9] p-6 border border-[#DDD7CD]">
        <div className="flex items-center gap-4">
          <Avatar name={contact.name} hasFollowup={false} size="lg" />
          <div className="flex flex-col">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#12151C] tracking-tight">
              {contact.name}
            </h1>
            <p className="text-sm text-[#6B7280] mt-0.5">
              {contact.role}, {contact.org} <span className="mx-1 text-[#DDD7CD]">•</span> Initial contact intake
            </p>
          </div>
        </div>

        <button
          onClick={onLogMeeting}
          className="px-5 py-2.5 bg-[#12151C] text-[#EFEAE0] hover:bg-[#1A1D24] text-xs font-mono uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#12151C]"
        >
          <span className="material-symbols-outlined text-[18px] text-[#C89B3C]">add</span>
          <span>Log First Meeting</span>
        </button>
      </div>

      {/* Main Empty State Dossier Card */}
      <div className="bg-[#FFFFFF] border border-[#DDD7CD] p-6 sm:p-8 relative overflow-hidden shadow-sm">
        {/* Architectural Left Edge Gold Indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C89B3C]" />

        <div className="max-w-3xl pl-2 sm:pl-3">
          {/* Overline Label */}
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#7B5900] font-semibold mb-2">
            <span className="material-symbols-outlined text-[18px] text-[#C89B3C]">folder_off</span>
            <span>INTELLIGENCE PIPELINE INACTIVE</span>
          </div>

          {/* Editorial Heading */}
          <h2 className="font-serif text-2xl sm:text-3xl text-[#12151C] mb-3 leading-snug">
            No historical intelligence indexed yet
          </h2>

          {/* Authoritative Description */}
          <p className="text-sm sm:text-base text-[#46464B] leading-relaxed mb-6">
            You haven’t logged any meetings or interactions with {contact.name} yet. MeetingMind requires at least one meeting debrief to extract recalled commitments, identify behavioral tendencies, and generate predictive briefings.
          </p>

          {/* Direct CTA & Quick Ingestion Paths */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
            <button
              onClick={onLogMeeting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#12151C] text-[#EFEAE0] hover:bg-[#1A1D24] font-mono text-xs tracking-wider uppercase font-semibold transition-all cursor-pointer border border-[#12151C] shadow-sm active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[18px] text-[#C89B3C]">edit_note</span>
              <span>LOG FIRST MEETING</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-[#6B7280]">
              <span>OR QUICK CAPTURE:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onQuickImport?.('email')}
                className="px-3 py-1.5 bg-[#F8F3E9] border border-[#DDD7CD] text-xs text-[#1D1C16] hover:bg-[#EFEAE0] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#6B7280]">mail</span>
                <span>Paste past email thread</span>
              </button>
              <button
                onClick={() => onQuickImport?.('calendar')}
                className="px-3 py-1.5 bg-[#F8F3E9] border border-[#DDD7CD] text-xs text-[#1D1C16] hover:bg-[#EFEAE0] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#6B7280]">calendar_today</span>
                <span>Sync calendar invite</span>
              </button>
              <button
                onClick={() => onQuickImport?.('voice')}
                className="px-3 py-1.5 bg-[#F8F3E9] border border-[#DDD7CD] text-xs text-[#1D1C16] hover:bg-[#EFEAE0] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#6B7280]">mic</span>
                <span>Dictate initial background</span>
              </button>
            </div>
          </div>

          {/* Capabilities Locked Preview Grid */}
          <div className="pt-6 border-t border-[#DDD7CD]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#6B7280] font-medium">
                CAPABILITIES LOCKED UNTIL DEBRIEF
              </span>
              <span className="font-mono text-xs text-[#6B7280]">
                AUTOMATIC SYNTHESIS ENGINE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Preview Card 1: Commitments & Facts */}
              <div className="p-4 bg-[#F8F3E9] border border-[#DDD7CD] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] text-[#7B5900] font-semibold">STAGE 01</span>
                    <span className="material-symbols-outlined text-[18px] text-[#6B7280]">task_alt</span>
                  </div>
                  <h3 className="font-serif text-lg text-[#12151C] mb-1">
                    Recalled Commitments &amp; Facts
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    AI synthesizes explicit promises, follow-ups, and agreed deadlines extracted automatically from notes or voice transcripts.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#DDD7CD]/60 font-mono text-[11px] text-[#6B7280] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C89B3C]" />
                  <span>Unlocks on 1st debrief</span>
                </div>
              </div>

              {/* Preview Card 2: Behavioral Tendencies */}
              <div className="p-4 bg-[#F8F3E9] border border-[#DDD7CD] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] text-[#7B5900] font-semibold">STAGE 02</span>
                    <span className="material-symbols-outlined text-[18px] text-[#6B7280]">psychology</span>
                  </div>
                  <h3 className="font-serif text-lg text-[#12151C] mb-1">
                    Executive Behavioral Tendencies
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    Identifies negotiation posture, conversational cadence, recurring objections, and executive decision-making criteria over time.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#DDD7CD]/60 font-mono text-[11px] text-[#6B7280] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6C6CB]" />
                  <span>Requires 3+ logged interactions</span>
                </div>
              </div>

              {/* Preview Card 3: Chronological Ledger */}
              <div className="p-4 bg-[#F8F3E9] border border-[#DDD7CD] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] text-[#7B5900] font-semibold">STAGE 01</span>
                    <span className="material-symbols-outlined text-[18px] text-[#6B7280]">history_edu</span>
                  </div>
                  <h3 className="font-serif text-lg text-[#12151C] mb-1">
                    Chronological Interaction Ledger
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    Permanent audit log detailing discussion nodes, referenced commitments, sentiment trajectories, and key attendees.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#DDD7CD]/60 font-mono text-[11px] text-[#6B7280] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C89B3C]" />
                  <span>Unlocks on 1st debrief</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
