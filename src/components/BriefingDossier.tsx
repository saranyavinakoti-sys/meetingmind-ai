import React, { useState, useEffect } from 'react';
import { Contact, Memory, BriefingSynthesis } from '../types';
import { queryMemories } from '../lib/hindsight';
import { generateBriefingDossier } from '../lib/groq';
import { Avatar } from './Avatar';
import { EmptyState } from './EmptyState';

interface BriefingDossierProps {
  contact: Contact;
  onOpenVoiceBriefing: (contact: Contact) => void;
  onOpenLogMeeting: (contact: Contact) => void;
}

export const BriefingDossier: React.FC<BriefingDossierProps> = ({
  contact,
  onOpenVoiceBriefing,
  onOpenLogMeeting,
}) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [synthesis, setSynthesis] = useState<BriefingSynthesis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedMemoryId, setExpandedMemoryId] = useState<string | null>(null);
  const [showSimulatedLockScreen, setShowSimulatedLockScreen] = useState<boolean>(false);

  // Load memories and generate Groq synthesis
  useEffect(() => {
    let isCancelled = false;

    async function loadDossierData() {
      setIsLoading(true);
      try {
        // 1. Query Hindsight for memories for this contact
        const mems = await queryMemories(contact.id);
        if (isCancelled) return;
        setMemories(mems);

        if (mems.length > 0) {
          // 2. Query Groq to generate executive synthesis, recall highlights, and patterns (if 3+ memories)
          const result = await generateBriefingDossier(contact, mems);
          if (isCancelled) return;
          setSynthesis(result);
        } else {
          setSynthesis(null);
        }
      } catch (err) {
        console.error('Failed to load briefing dossier:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDossierData();

    return () => {
      isCancelled = true;
    };
  }, [contact]);

  // If 0 memories logged for this contact, show Empty State
  if (!isLoading && memories.length === 0) {
    return (
      <EmptyState
        contact={contact}
        onLogMeeting={() => onOpenLogMeeting(contact)}
        onQuickImport={() => onOpenLogMeeting(contact)}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Dossier Meta Stamp Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#EDE8DE]/60 p-3 sm:p-4 border border-[#DDD7CD]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
          <span className="uppercase tracking-widest text-[#7B5900] font-semibold flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C89B3C]" />
            CONFIDENTIAL // DOSSIER FILE #{contact.id.toUpperCase().slice(0, 8)}
          </span>
          <span className="text-[#DDD7CD] hidden sm:inline">/</span>
          <span className="text-[#6B7280]">LEVEL 4 CLEARANCE</span>
          <span className="text-[#DDD7CD] hidden sm:inline">/</span>
          <span className="text-[#6B7280]">
            ENGAGEMENT FREQ: {memories.length} SESSIONS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimulatedLockScreen(!showSimulatedLockScreen)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFFFFF] border border-[#DDD7CD] hover:bg-[#F8F3E9] text-[#7B5900] font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
            title="Toggle OS 18 simulated lock-screen notification preview"
          >
            <span className="material-symbols-outlined text-[14px]">notifications_active</span>
            <span>{showSimulatedLockScreen ? 'Hide Lock Alert' : 'Lock Screen Alert'}</span>
          </button>

          <span className="inline-flex items-center px-2 py-0.5 border border-[#C89B3C]/40 text-[#7B5900] bg-[#FCCA66]/20 font-mono text-[11px] font-semibold">
            NEXT BRIEFING: T-45 MIN
          </span>
        </div>
      </div>

      {/* Simulated Lock Screen Push Notification Preview Modal / Dropdown */}
      {showSimulatedLockScreen && (
        <div className="p-4 bg-[#12151C] text-[#EFEAE0] border border-[#2E3646] shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#A0A4B0] border-b border-[#262C3A] pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0BF5C]" />
              <span>SIMULATED OS 18.2 EXECUTIVE DISPATCH</span>
            </div>
            <button
              onClick={() => setShowSimulatedLockScreen(false)}
              className="text-[#A0A4B0] hover:text-[#EFEAE0]"
            >
              ✕
            </button>
          </div>
          <div className="bg-[#FEF9EF] text-[#12151C] p-4 border border-[#DDD7CD] shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#12151C] text-[#EFEAE0] flex items-center justify-center font-serif text-xs font-bold">
                  M
                </div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#12151C]">
                  MeetingMind · 15m Alert
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#6B7280]">14:45</span>
            </div>
            <h4 className="font-serif text-lg font-semibold text-[#12151C]">
              Executive Briefing in 15m: {contact.name}
            </h4>
            <p className="text-xs text-[#46464B]">
              {contact.role} · {contact.org} · Next agenda: review SLA caps &amp; compliance milestones.
            </p>
            <div className="p-2.5 bg-[#F8F3E9] border-l-2 border-[#C89B3C] text-xs">
              <span className="font-mono uppercase text-[#7B5900] text-[10px] font-bold block mb-0.5">
                Recalled Key Directive
              </span>
              <p className="text-[#12151C]">
                “{synthesis?.recallCards[0]?.keyHighlight || 'Review agreed SLA parameters and liability limits'}.”
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setShowSimulatedLockScreen(false);
                  onOpenVoiceBriefing(contact);
                }}
                className="flex-1 py-1.5 bg-[#12151C] text-[#EFEAE0] text-xs font-mono uppercase font-semibold flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px] text-[#C89B3C]">graphic_eq</span>
                <span>Audio Brief (45s)</span>
              </button>
              <button
                onClick={() => setShowSimulatedLockScreen(false)}
                className="px-3 py-1.5 border border-[#DDD7CD] text-xs font-mono uppercase"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Dossier Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-[#F8F3E9] p-6 lg:p-8 border border-[#DDD7CD] shadow-xs">
        <div className="flex items-start gap-4 sm:gap-6">
          <Avatar
            name={contact.name}
            hasFollowup={contact.hasFollowup}
            size="xl"
            className="shadow-sm"
          />

          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h1 className="font-serif text-3xl sm:text-4xl text-[#12151C] tracking-tight font-medium">
                {contact.name}
              </h1>
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#7B5900] font-semibold">
                (RECORD VALIDATED)
              </span>
            </div>

            <p className="text-sm sm:text-base text-[#46464B] flex items-center flex-wrap gap-x-2">
              <span className="text-[#12151C] font-semibold">{contact.role}</span>
              <span className="text-[#DDD7CD]">·</span>
              <span>{contact.org}</span>
              <span className="text-[#DDD7CD]">·</span>
              <span className="text-[#7B5900] font-medium">Next briefing in 45m</span>
              <span className="text-[#DDD7CD]">·</span>
              <span>{contact.location || 'In-person / Executive HQ'}</span>
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 font-mono text-xs text-[#6B7280]">
              <span>Direct Reports: {contact.directReports || 18}</span>
              <span>•</span>
              <span>Cadence: {contact.cadence || 'Bi-weekly'}</span>
              <span>•</span>
              <span className="text-[#7A8B6F] font-semibold">Engagement Score: {contact.engagementScore || 92}/100</span>
              {contact.meetingLink && (
                <>
                  <span>•</span>
                  <a
                    href={contact.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7B5900] hover:underline flex items-center gap-1 font-semibold"
                    title="Open meeting room"
                  >
                    <span className="material-symbols-outlined text-[14px] text-[#C89B3C]">
                      {contact.meetingLink.includes('zoom') ? 'videocam' : 'video_call'}
                    </span>
                    <span>{contact.meetingLink.includes('zoom') ? 'Zoom Room' : 'Google Meet'}</span>
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {contact.meetingLink && (
            <button
              onClick={() => window.open(contact.meetingLink, '_blank', 'noopener,noreferrer')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#FCCA66] hover:bg-[#F0BF5C] text-[#261900] border border-[#C89B3C] transition-all font-mono text-xs uppercase tracking-wider font-semibold cursor-pointer active:scale-[0.99] shadow-xs"
              id="join-meeting-btn"
              title={`Join meeting (${contact.meetingLink})`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {contact.meetingLink.includes('zoom') ? 'videocam' : 'video_call'}
              </span>
              <span>JOIN MEETING</span>
            </button>
          )}

          <button
            onClick={() => onOpenVoiceBriefing(contact)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#EDE8DE] hover:bg-[#E0DACE] text-[#12151C] border border-[#DDD7CD] transition-all font-mono text-xs uppercase tracking-wider font-semibold cursor-pointer active:scale-[0.99]"
            id="prep-me-btn"
          >
            <span className="material-symbols-outlined text-[18px] text-[#C89B3C]">mic</span>
            <span>PREP ME (AUDIO)</span>
          </button>

          <button
            onClick={() => onOpenLogMeeting(contact)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#12151C] hover:bg-[#1A1D24] text-[#EFEAE0] border border-[#12151C] transition-all font-mono text-xs uppercase tracking-wider font-semibold cursor-pointer active:scale-[0.99] shadow-sm"
            id="open-log-drawer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#C89B3C]">edit_note</span>
            <span>LOG BRIEFING</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Primary Column (8 cols) & Right Intelligence Column (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* 1. AI Executive Synthesis // Behavioral Profile */}
          <section className="bg-[#FFFFFF] p-6 border border-[#DDD7CD] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#DDD7CD]/60">
              <div className="flex items-center gap-2 text-[#12151C]">
                <span className="material-symbols-outlined text-[#C89B3C] text-[20px]">psychology</span>
                <h2 className="font-mono text-xs uppercase tracking-widest font-semibold">
                  AI Executive Synthesis // Behavioral Profile
                </h2>
              </div>
              <span className="font-mono text-xs text-[#6B7280]">
                CONFIDENCE INDEX {synthesis?.consensusConfidence || 98.4}%
              </span>
            </div>

            <div className="p-4 sm:p-5 bg-[#F8F3E9] border-l-3 border-[#C89B3C]">
              {isLoading ? (
                <div className="flex items-center gap-3 py-3 text-xs font-mono text-[#6B7280]">
                  <span className="material-symbols-outlined animate-spin text-[#C89B3C]">progress_activity</span>
                  <span>Synthesizing relationship memory via Groq &amp; Hindsight...</span>
                </div>
              ) : (
                <p className="font-serif text-lg sm:text-xl text-[#12151C] leading-relaxed">
                  {synthesis?.executiveSummary}
                </p>
              )}
            </div>

            {synthesis && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[#46464B] font-mono text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C89B3C]" />
                  <span>Stance: {synthesis.stance}</span>
                </span>
                <span className="text-[#DDD7CD]">·</span>
                <span className="text-[#7B5900]">
                  Recommended Leverage: {synthesis.recommendedLeverage}
                </span>
              </div>
            )}
          </section>

          {/* 2. Recalled Intelligence: The 3 Recall Cards */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#C89B3C] text-[20px]">history_edu</span>
                <h2 className="font-mono text-xs uppercase tracking-widest text-[#12151C] font-semibold">
                  Critical Memory Recall // Unresolved Cognizance
                </h2>
              </div>
              <span className="font-mono text-xs text-[#7B5900] font-semibold">
                {synthesis?.recallCards.length || 0} CRITICAL NODES DETECTED
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {synthesis?.recallCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-[#FFFFFF] p-5 sm:p-6 border border-[#DDD7CD] relative overflow-hidden shadow-xs flex flex-col gap-2"
                >
                  {/* Left edge accent strictly in #C89B3C */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C89B3C]" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#7B5900] font-semibold">
                      {card.label}
                    </span>
                    <span className="font-mono text-[11px] text-[#6B7280]">
                      {card.sessionId}
                    </span>
                  </div>

                  {/* Body with specific gold highlight */}
                  <p className="text-sm sm:text-base text-[#1D1C16] leading-relaxed pt-1">
                    {card.textPrefix}
                    <span className="font-semibold text-[#755400] bg-[#FCCA66]/30 px-1.5 py-0.5 border border-[#C89B3C]/30 mx-1 inline-block">
                      {card.keyHighlight}
                    </span>
                    {card.textSuffix}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 border-t border-[#DDD7CD]/50 text-xs font-mono text-[#6B7280]">
                    <span>{card.speakerOrAssigned}</span>
                    <span className="text-[#DDD7CD]">·</span>
                    <span className="text-[#7B5900] font-medium">{card.subjectOrStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Chronological Meeting Timeline // Archive */}
          <section className="bg-[#FFFFFF] p-6 border border-[#DDD7CD] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DDD7CD]/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#C89B3C] text-[20px]">calendar_view_day</span>
                <h2 className="font-mono text-xs uppercase tracking-widest text-[#12151C] font-semibold">
                  Chronological Meeting Timeline // Archive
                </h2>
              </div>
              <span className="font-mono text-xs text-[#6B7280]">
                {memories.length} VERIFIED DEBRIEFS
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {memories.map((mem) => {
                const isExpanded = expandedMemoryId === mem.id;
                return (
                  <div
                    key={mem.id}
                    onClick={() => setExpandedMemoryId(isExpanded ? null : mem.id)}
                    className="p-3.5 sm:p-4 bg-[#F8F3E9] hover:bg-[#F2EDE3] border border-[#DDD7CD] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
                        <span className="font-mono text-xs text-[#12151C] font-semibold shrink-0 w-28">
                          {mem.displayDate}
                        </span>
                        <span className="font-serif text-sm sm:text-base text-[#12151C] font-medium truncate">
                          {mem.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs text-[#6B7280]">
                          {mem.durationMinutes || 45} MIN
                        </span>
                        <span className="material-symbols-outlined text-[#6B7280] text-[18px]">
                          {isExpanded ? 'expand_less' : 'chevron_right'}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-[#DDD7CD] text-xs text-[#46464B] flex flex-col gap-2">
                        <p className="leading-relaxed">{mem.content}</p>
                        {mem.keyFact && (
                          <div className="p-2 bg-[#FFFFFF] border border-[#DDD7CD] flex items-center gap-2 text-[11px] font-mono text-[#7B5900]">
                            <span className="material-symbols-outlined text-[14px] text-[#C89B3C]">verified</span>
                            <span>Recalled Key Fact: {mem.keyFact}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-mono text-[10px] text-[#76777C]">
                          <span>Speaker: {mem.speaker || contact.name}</span>
                          <span>Subject: {mem.subject || 'Meeting debrief'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Patterns & Counterparty Intel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Identified Patterns Section (Shown when 3+ meetings exist) */}
          <section className="bg-[#FFFFFF] p-6 border border-[#DDD7CD] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#DDD7CD]/60">
              <span className="font-mono text-xs uppercase tracking-widest text-[#12151C] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#C89B3C] text-[18px]">query_stats</span>
                IDENTIFIED PATTERNS
              </span>
              <span className="font-mono text-[11px] text-[#7B5900] bg-[#FCCA66]/20 border border-[#C89B3C]/30 px-2 py-0.5">
                {memories.length >= 3 ? `${memories.length}+ SESSIONS` : 'LOCKED'}
              </span>
            </div>

            {memories.length >= 3 && synthesis?.patterns && synthesis.patterns.length > 0 ? (
              <div className="flex flex-col gap-3.5">
                {synthesis.patterns.map((pat, i) => (
                  <div key={i} className="p-4 bg-[#F8F3E9] border border-[#DDD7CD] flex flex-col gap-1">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#7B5900] font-semibold">
                      {pat.label}
                    </span>
                    <p className="text-xs sm:text-sm text-[#1D1C16] leading-relaxed">
                      {pat.description}
                    </p>
                  </div>
                ))}

                {synthesis.tacticalDirective && (
                  <div className="p-4 bg-[#F2EDE3] border-l-2 border-[#12151C] flex flex-col gap-1 mt-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280] font-semibold">
                      TACTICAL DIRECTIVE
                    </span>
                    <p className="font-serif text-sm text-[#12151C] italic">
                      {synthesis.tacticalDirective}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-[#F8F3E9] border border-[#DDD7CD] text-xs text-[#6B7280] flex flex-col gap-2">
                <div className="flex items-center gap-1 text-[#7B5900] font-mono font-semibold">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Requires 3+ Logged Meetings</span>
                </div>
                <p>
                  MeetingMind unlocks cross-session behavioral tendency extraction and negotiation pattern recognition once 3 debriefs are indexed for this contact.
                </p>
                <button
                  onClick={() => onOpenLogMeeting(contact)}
                  className="mt-2 py-1.5 px-3 bg-[#12151C] text-[#EFEAE0] font-mono text-[11px] uppercase self-start"
                >
                  Log Another Meeting
                </button>
              </div>
            )}
          </section>

          {/* Counterparty Delegation / Connected Circle */}
          <section className="bg-[#FFFFFF] p-6 border border-[#DDD7CD] shadow-xs flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#12151C] font-semibold">
              COUNTERPARTY DELEGATION
            </span>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-3 bg-[#F8F3E9] border border-[#DDD7CD]">
                <Avatar name={contact.name} size="sm" hasFollowup={contact.hasFollowup} />
                <div className="flex flex-col min-w-0">
                  <span className="font-serif text-sm text-[#12151C] font-semibold truncate">
                    {contact.name}
                  </span>
                  <span className="font-mono text-[11px] text-[#6B7280]">
                    {contact.role} · Decision Maker
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#F8F3E9] border border-[#DDD7CD]">
                <Avatar name="Thomas Cole" size="sm" />
                <div className="flex flex-col min-w-0">
                  <span className="font-serif text-sm text-[#12151C] font-semibold truncate">
                    Thomas Cole
                  </span>
                  <span className="font-mono text-[11px] text-[#6B7280]">
                    Director InfoSec · Gatekeeper
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#F8F3E9] border border-[#DDD7CD]">
                <Avatar name="Sarah Al-Mansoor" size="sm" />
                <div className="flex flex-col min-w-0">
                  <span className="font-serif text-sm text-[#12151C] font-semibold truncate">
                    Sarah Al-Mansoor
                  </span>
                  <span className="font-mono text-[11px] text-[#6B7280]">
                    Commercial Legal Counsel
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Attached Exhibits & Audits */}
          <section className="bg-[#FFFFFF] p-6 border border-[#DDD7CD] shadow-xs flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#12151C] font-semibold">
              ATTACHED EXHIBITS &amp; AUDITS
            </span>

            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 bg-[#F8F3E9] border border-[#DDD7CD] hover:bg-[#F2EDE3] transition-colors cursor-pointer">
                <span className="truncate text-[#1D1C16]">SOC2_TYPE_II_FINAL_2024.pdf</span>
                <span className="text-[#7B5900] font-semibold shrink-0 ml-2">8.4 MB</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#F8F3E9] border border-[#DDD7CD] hover:bg-[#F2EDE3] transition-colors cursor-pointer">
                <span className="truncate text-[#1D1C16]">EU_ADDENDUM_REDLINE_V3.docx</span>
                <span className="text-[#7B5900] font-semibold shrink-0 ml-2">1.1 MB</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#F8F3E9] border border-[#DDD7CD] hover:bg-[#F2EDE3] transition-colors cursor-pointer">
                <span className="truncate text-[#1D1C16]">SLA_SCHEDULE_ANNEX_B.pdf</span>
                <span className="text-[#7B5900] font-semibold shrink-0 ml-2">420 KB</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
