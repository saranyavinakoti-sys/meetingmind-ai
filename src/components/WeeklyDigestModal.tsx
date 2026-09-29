import React, { useState, useEffect } from 'react';
import { Contact, Memory, WeeklyDigestReport } from '../types';
import { generateWeeklyDigest, setFollowupResolution } from '../lib/weeklyDigest';
import { Avatar } from './Avatar';

interface WeeklyDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  memories: Memory[];
  onSelectContact?: (contact: Contact) => void;
}

export const WeeklyDigestModal: React.FC<WeeklyDigestModalProps> = ({
  isOpen,
  onClose,
  contacts,
  memories,
  onSelectContact,
}) => {
  const [report, setReport] = useState<WeeklyDigestReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'pending' | 'all'>('pending');
  const [copied, setCopied] = useState(false);

  // Generate digest report whenever opened
  useEffect(() => {
    if (isOpen) {
      loadDigest();
    }
  }, [isOpen, contacts, memories]);

  const loadDigest = async () => {
    setIsLoading(true);
    try {
      const data = await generateWeeklyDigest(contacts, memories);
      setReport(data);
    } catch (err) {
      console.error('Failed to generate weekly digest:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleToggleItem = (itemId: string, currentStatus: string) => {
    const isNowResolved = currentStatus !== 'resolved';
    setFollowupResolution(itemId, isNowResolved);

    // Update in-memory report state
    if (report) {
      const updatedItems = report.items.map((item) =>
        item.id === itemId
          ? { ...item, status: isNowResolved ? ('resolved' as const) : ('pending' as const) }
          : item
      );
      const activeCount = updatedItems.filter((i) => i.status !== 'resolved').length;
      const critCount = updatedItems.filter((i) => i.status !== 'resolved' && i.urgency === 'critical').length;

      setReport({
        ...report,
        items: updatedItems,
        totalFollowups: activeCount,
        criticalCount: critCount,
      });
    }
  };

  const handleCopyReport = () => {
    if (!report) return;
    const text = `MEETINGMIND // WEEKLY INTELLIGENCE DIGEST
${report.weekLabel}
Total Pending Follow-ups: ${report.totalFollowups} | Critical: ${report.criticalCount}

EXECUTIVE SUMMARY:
${report.executiveSummary}

STRATEGIC OUTLOOK:
${report.strategicOutlook}

UNRESOLVED COMMITMENTS:
${report.items
  .filter((i) => i.status !== 'resolved')
  .map((i) => `• [${i.duePeriod}] ${i.contactName} (${i.contactOrg}): ${i.title} - Assigned: ${i.actionOwner}`)
  .join('\n')}

RECOMMENDED SEQUENCING:
${report.recommendedSequencing.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayedItems = report?.items.filter((item) =>
    filterMode === 'pending' ? item.status !== 'resolved' : true
  ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#12151C]/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#FEF9EF] border border-[#DDD7CD] shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FFFFFF] border-b border-[#DDD7CD] flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C89B3C]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#7B5900] font-semibold">
                EXECUTIVE INTELLIGENCE DISPATCH
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#12151C] tracking-tight">
              Weekly Relationship Digest
            </h2>
            <p className="font-mono text-xs text-[#6B7280]">
              {report?.weekLabel || 'Current Weekly Aggregation'} • Synthesized via Hindsight Memory &amp; Groq
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 border border-[#DDD7CD] bg-[#F8F3E9] text-xs font-mono text-[#12151C] hover:bg-[#EFEAE0] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy formatted brief to clipboard"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied' : 'Copy Brief'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#6B7280] hover:text-[#12151C] hover:bg-[#F8F3E9] transition-colors"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <span className="material-symbols-outlined text-3xl animate-spin text-[#C89B3C]">
                progress_activity
              </span>
              <p className="font-serif text-lg text-[#12151C]">Aggregating active counterparty commitments...</p>
              <span className="font-mono text-xs text-[#6B7280]">Querying cross-session memory banks</span>
            </div>
          ) : report ? (
            <>
              {/* Executive Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8F3E9] p-4 border border-[#DDD7CD]">
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#6B7280]">
                    Pending Follow-ups
                  </span>
                  <span className="font-serif text-2xl text-[#12151C] font-semibold mt-0.5">
                    {report.totalFollowups}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#7B5900]">
                    Critical Due in 48h
                  </span>
                  <span className="font-serif text-2xl text-[#7B5900] font-semibold mt-0.5">
                    {report.criticalCount}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#6B7280]">
                    Risk Posture
                  </span>
                  <span className="font-serif text-xl text-[#12151C] font-semibold mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C89B3C]" />
                    {report.riskPosture.level}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#6B7280]">
                    Auto-Digest Sync
                  </span>
                  <span className="font-mono text-xs text-[#7A8B6F] font-semibold mt-1">
                    ✓ Hindsight Live
                  </span>
                </div>
              </div>

              {/* AI Executive Summary Box */}
              <div className="bg-[#FFFFFF] p-5 sm:p-6 border border-[#DDD7CD] shadow-xs relative overflow-hidden flex flex-col gap-3">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C89B3C]" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#7B5900] font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#C89B3C]">psychology</span>
                    WEEKLY EXECUTIVE DIGEST SUMMARY
                  </span>
                  <button
                    onClick={loadDigest}
                    className="text-xs font-mono text-[#6B7280] hover:text-[#12151C] flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    <span>Re-synthesize</span>
                  </button>
                </div>

                <p className="font-serif text-base sm:text-lg text-[#12151C] leading-relaxed">
                  {report.executiveSummary}
                </p>

                <p className="text-xs text-[#46464B] italic border-t border-[#DDD7CD]/60 pt-2">
                  <strong className="not-italic text-[#12151C] font-mono text-[11px] uppercase mr-1">
                    Outlook:
                  </strong>
                  {report.strategicOutlook}
                </p>
              </div>

              {/* Recommended Execution Sequencing */}
              <div className="bg-[#F2EDE3] p-4 sm:p-5 border border-[#DDD7CD]">
                <span className="font-mono text-xs uppercase tracking-widest text-[#12151C] font-semibold block mb-2.5">
                  RECOMMENDED ACTION SEQUENCING // CURRENT SPRINT
                </span>
                <div className="flex flex-col gap-2">
                  {report.recommendedSequencing.map((action, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#12151C]">
                      <span className="font-mono text-[11px] text-[#7B5900] font-bold mt-0.5">
                        0{i + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aggregated Follow-ups Checklist */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#12151C] font-semibold">
                    Unresolved Counterparty Commitments ({displayedItems.length})
                  </span>

                  <div className="flex items-center gap-1 text-xs font-mono">
                    <button
                      onClick={() => setFilterMode('pending')}
                      className={`px-2.5 py-1 border transition-colors ${
                        filterMode === 'pending'
                          ? 'bg-[#12151C] text-[#EFEAE0] border-[#12151C]'
                          : 'bg-[#FFFFFF] text-[#6B7280] border-[#DDD7CD]'
                      }`}
                    >
                      Pending Only
                    </button>
                    <button
                      onClick={() => setFilterMode('all')}
                      className={`px-2.5 py-1 border transition-colors ${
                        filterMode === 'all'
                          ? 'bg-[#12151C] text-[#EFEAE0] border-[#12151C]'
                          : 'bg-[#FFFFFF] text-[#6B7280] border-[#DDD7CD]'
                      }`}
                    >
                      All ({report.items.length})
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {displayedItems.length === 0 ? (
                    <div className="p-6 bg-[#FFFFFF] border border-[#DDD7CD] text-center text-xs font-mono text-[#6B7280]">
                      No unresolved follow-ups in this view.
                    </div>
                  ) : (
                    displayedItems.map((item) => {
                      const isResolved = item.status === 'resolved';
                      const targetContact = contacts.find((c) => c.id === item.contactId);

                      return (
                        <div
                          key={item.id}
                          className={`p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isResolved
                              ? 'bg-[#F8F3E9] border-[#DDD7CD] opacity-60'
                              : 'bg-[#FFFFFF] border-[#DDD7CD] hover:border-[#76777C]'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isResolved}
                              onChange={() => handleToggleItem(item.id, item.status)}
                              className="mt-1 h-4 w-4 rounded-none accent-[#12151C] cursor-pointer"
                              title="Toggle resolved status"
                            />

                            <div className="flex flex-col min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`font-serif text-base font-semibold ${
                                    isResolved ? 'line-through text-[#6B7280]' : 'text-[#12151C]'
                                  }`}
                                >
                                  {item.title}
                                </span>

                                <span
                                  className={`font-mono text-[10px] uppercase px-1.5 py-0.5 border ${
                                    item.urgency === 'critical'
                                      ? 'bg-[#FFDAD6] text-[#93000A] border-[#BA1A1A]/40'
                                      : 'bg-[#FCCA66]/30 text-[#755400] border-[#C89B3C]/40'
                                  }`}
                                >
                                  {item.duePeriod}
                                </span>
                              </div>

                              <p className="text-xs text-[#46464B] mt-1 leading-relaxed">
                                {item.detail}
                              </p>

                              {item.keyFact && (
                                <span className="text-[11px] font-mono text-[#7B5900] mt-1">
                                  Key Fact: <span className="font-semibold bg-[#FCCA66]/20 px-1">{item.keyFact}</span>
                                </span>
                              )}

                              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-[#6B7280]">
                                <span className="font-medium text-[#12151C]">{item.contactName} ({item.contactOrg})</span>
                                <span>•</span>
                                <span>Assigned: {item.actionOwner}</span>
                              </div>
                            </div>
                          </div>

                          {targetContact && onSelectContact && (
                            <button
                              onClick={() => {
                                onSelectContact(targetContact);
                                onClose();
                              }}
                              className="self-end sm:self-center px-3 py-1.5 border border-[#DDD7CD] bg-[#F8F3E9] hover:bg-[#EFEAE0] text-xs font-mono uppercase text-[#12151C] transition-colors shrink-0 cursor-pointer"
                            >
                              Dossier
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8F3E9] border-t border-[#DDD7CD] flex items-center justify-between text-xs font-mono">
          <span className="text-[#6B7280]">DISPATCH PROTOCOL // DIGEST-W44</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#12151C] text-[#EFEAE0] hover:bg-[#1A1D24] uppercase font-semibold transition-colors"
          >
            Close Digest
          </button>
        </div>
      </div>
    </div>
  );
};
