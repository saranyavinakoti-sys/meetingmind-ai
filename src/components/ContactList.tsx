import React, { useState, useMemo } from 'react';
import { Contact, Memory } from '../types';
import { Avatar } from './Avatar';

interface ContactListProps {
  contacts: Contact[];
  memories: Memory[];
  selectedContactId: string | null;
  onSelectContact: (contact: Contact) => void;
  onQuickPrep: (contact: Contact) => void;
  onOpenLogMeeting: (contact: Contact) => void;
  onOpenWeeklyDigest?: () => void;
  onOpenAddContact?: () => void;
  onOpenDataGuide?: () => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  memories,
  selectedContactId,
  onSelectContact,
  onQuickPrep,
  onOpenLogMeeting,
  onOpenWeeklyDigest,
  onOpenAddContact,
  onOpenDataGuide,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'followups' | 'clients' | 'advisory'>('all');

  // Count memories per contact
  const memoryCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    memories.forEach((m) => {
      map[m.contactId] = (map[m.contactId] || 0) + 1;
    });
    return map;
  }, [memories]);

  // Priority contact
  const priorityContact = useMemo(() => {
    return contacts.find((c) => c.isPriority) || contacts[0];
  }, [contacts]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.org.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'followups') return c.hasFollowup;
      if (activeFilter === 'clients') return c.category === 'clients';
      if (activeFilter === 'advisory') return c.category === 'advisory';
      return true;
    });
  }, [contacts, searchQuery, activeFilter]);

  const followupsCount = contacts.filter((c) => c.hasFollowup).length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-6 px-4 sm:px-6">
      {/* Registry Meta Bar */}
      <div className="flex items-baseline justify-between border-b border-[#DDD7CD] pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[#7B5900] font-semibold">
            REGISTRY
          </span>
          <span className="font-mono text-xs text-[#6B7280]">
            • {contacts.length} Records Indexed
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-[#6B7280]">
          {onOpenWeeklyDigest && (
            <button
              onClick={onOpenWeeklyDigest}
              className="text-[#7B5900] hover:text-[#12151C] flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-[#C89B3C]">summarize</span>
              <span className="uppercase tracking-wider">Weekly Digest</span>
              {followupsCount > 0 && (
                <span className="bg-[#C89B3C] text-[#12151C] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {followupsCount}
                </span>
              )}
            </button>
          )}
          <span className="text-[#DDD7CD]">|</span>
          <div className="flex items-center gap-1.5">
            <span>Auto-Sync</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7A8B6F] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Search Input Bar & Add Contact CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <div className="flex items-center w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3.5 py-2.5 shadow-xs focus-within:border-[#12151C] transition-colors">
            <span className="material-symbols-outlined text-[18px] text-[#6B7280] mr-2">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts, organizations, or notes..."
              aria-label="Search contacts or organizations"
              className="w-full bg-transparent text-sm text-[#1D1C16] placeholder:text-[#76777C] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#6B7280] hover:text-[#12151C] p-1 transition-colors"
                aria-label="Clear search input"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenDataGuide && (
            <button
              onClick={onOpenDataGuide}
              className="px-3 py-2.5 bg-[#FFFFFF] hover:bg-[#F8F3E9] text-[#7B5900] border border-[#C89B3C]/50 font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs"
              title="Learn how to add contacts, meeting memories, and custom links"
            >
              <span className="material-symbols-outlined text-[17px] text-[#C89B3C]">help_outline</span>
              <span className="hidden sm:inline">How to Add Data</span>
            </button>
          )}

          {onOpenAddContact && (
            <button
              onClick={onOpenAddContact}
              className="px-4 py-2.5 bg-[#12151C] hover:bg-[#1A1D24] text-[#EFEAE0] border border-[#12151C] font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs shrink-0 active:scale-[0.99]"
              id="add-contact-btn"
            >
              <span className="material-symbols-outlined text-[18px] text-[#C89B3C]">person_add</span>
              <span>Add Contact</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar" role="tablist">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
            activeFilter === 'all'
              ? 'bg-[#12151C] text-[#EFEAE0] border-[#12151C] font-semibold'
              : 'bg-[#FFFFFF] text-[#6B7280] border-[#DDD7CD] hover:text-[#12151C] hover:bg-[#F8F3E9]'
          }`}
        >
          All ({contacts.length})
        </button>

        <button
          onClick={() => setActiveFilter('followups')}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border flex items-center gap-1.5 ${
            activeFilter === 'followups'
              ? 'bg-[#12151C] text-[#EFEAE0] border-[#12151C] font-semibold'
              : 'bg-[#FFFFFF] text-[#6B7280] border-[#DDD7CD] hover:text-[#12151C] hover:bg-[#F8F3E9]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C89B3C]" />
          Active follow-ups ({followupsCount})
        </button>

        <button
          onClick={() => setActiveFilter('clients')}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
            activeFilter === 'clients'
              ? 'bg-[#12151C] text-[#EFEAE0] border-[#12151C] font-semibold'
              : 'bg-[#FFFFFF] text-[#6B7280] border-[#DDD7CD] hover:text-[#12151C] hover:bg-[#F8F3E9]'
          }`}
        >
          Clients
        </button>

        <button
          onClick={() => setActiveFilter('advisory')}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
            activeFilter === 'advisory'
              ? 'bg-[#12151C] text-[#EFEAE0] border-[#12151C] font-semibold'
              : 'bg-[#FFFFFF] text-[#6B7280] border-[#DDD7CD] hover:text-[#12151C] hover:bg-[#F8F3E9]'
          }`}
        >
          Advisory
        </button>
      </div>

      {/* Editorial Spotlight: Pinned Priority Advisory Context */}
      {priorityContact && activeFilter === 'all' && !searchQuery && (
        <div className="p-4 sm:p-5 bg-[#F2EDE3] border border-[#DDD7CD] relative overflow-hidden shadow-xs">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-1.5 text-[#7B5900]">
              <span className="material-symbols-outlined text-[16px] text-[#C89B3C]">verified_user</span>
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">Priority Advisory</span>
            </div>
            <span className="font-mono text-xs text-[#6B7280]">Confidential File MM-88A</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3.5 min-w-0">
              <Avatar name={priorityContact.name} hasFollowup={priorityContact.hasFollowup} size="lg" />
              <div className="min-w-0">
                <p className="font-serif text-xl sm:text-2xl text-[#12151C] truncate font-semibold">
                  {priorityContact.name}
                </p>
                <p className="text-xs sm:text-sm text-[#46464B] truncate">
                  {priorityContact.role}, {priorityContact.org}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[#7B5900]">
                  <span>Last session: {priorityContact.lastMeeting}</span>
                  <span>•</span>
                  <span>{memoryCountMap[priorityContact.id] || 0} debriefs stored</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onQuickPrep(priorityContact)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#12151C] text-[#EFEAE0] hover:bg-[#1A1D24] font-mono text-xs uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#12151C]"
              >
                <span>Prep me</span>
                <span className="material-symbols-outlined text-[16px] text-[#C89B3C]">arrow_forward</span>
              </button>

              <button
                onClick={() => onSelectContact(priorityContact)}
                className="px-3.5 py-2 bg-[#FFFFFF] border border-[#DDD7CD] text-[#12151C] hover:bg-[#EFEAE0] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                title="View full dossier"
              >
                Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between pt-2 border-b border-[#DDD7CD] pb-2">
        <span className="font-mono text-xs uppercase tracking-wider text-[#6B7280]">
          Indexed Relationships
        </span>
        <span className="font-mono text-xs text-[#6B7280]">Sort: Recency</span>
      </div>

      {/* Registry Contacts List */}
      <div className="flex flex-col gap-2.5">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[#FFFFFF] border border-[#DDD7CD] p-8">
            <span className="material-symbols-outlined text-4xl text-[#6B7280] mb-2">folder_off</span>
            <p className="font-serif text-lg text-[#12151C]">No records match your criteria</p>
            <p className="text-xs text-[#6B7280] mt-1">Try refining search terms or clearing taxonomy filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-4 px-3 py-1.5 border border-[#DDD7CD] bg-[#F8F3E9] text-xs font-mono uppercase"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const memCount = memoryCountMap[contact.id] || 0;
            const isSelected = selectedContactId === contact.id;

            return (
              <div
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                className={`group relative p-4 sm:p-5 border transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-[#FFFFFF] border-[#C89B3C] ring-1 ring-[#C89B3C]'
                    : 'bg-[#FFFFFF] border-[#DDD7CD] hover:border-[#76777C] hover:bg-[#FDFBF7]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <Avatar name={contact.name} hasFollowup={contact.hasFollowup} size="md" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg sm:text-xl text-[#12151C] group-hover:text-[#7B5900] transition-colors font-semibold">
                          {contact.name}
                        </span>
                        {memCount === 0 && (
                          <span className="font-mono text-[10px] uppercase px-1.5 py-0.2 bg-[#EDE8DE] text-[#6B7280] border border-[#DDD7CD]">
                            0 Debriefs
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#46464B] truncate mt-0.5">
                        {contact.role}, {contact.org}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 font-mono text-[11px] text-[#6B7280]">
                        <span>Last meeting: {contact.lastMeeting}</span>
                        <span>•</span>
                        {contact.hasFollowup ? (
                          <span className="text-[#7B5900] font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C89B3C]" />
                            {contact.followupSummary || 'Action item pending'}
                          </span>
                        ) : (
                          <span className="text-[#7A8B6F]">All directives ratified</span>
                        )}
                        <span>•</span>
                        <span>{memCount} memory nodes</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions on card */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {contact.meetingLink && (
                      <button
                        onClick={() => window.open(contact.meetingLink, '_blank', 'noopener,noreferrer')}
                        className="p-2 border border-[#C89B3C]/60 bg-[#FCCA66]/20 hover:bg-[#FCCA66] text-[#261900] transition-colors cursor-pointer"
                        title={`Join meeting (${contact.meetingLink})`}
                        aria-label={`Join meeting with ${contact.name}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {contact.meetingLink.includes('zoom') ? 'videocam' : 'video_call'}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => onQuickPrep(contact)}
                      className="p-2 border border-[#DDD7CD] bg-[#F8F3E9] text-[#12151C] hover:bg-[#12151C] hover:text-[#EFEAE0] transition-colors cursor-pointer"
                      title="Quick Voice Prep"
                      aria-label={`Voice prep for ${contact.name}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
                    </button>
                    <button
                      onClick={() => onOpenLogMeeting(contact)}
                      className="p-2 border border-[#DDD7CD] bg-[#F8F3E9] text-[#12151C] hover:bg-[#12151C] hover:text-[#EFEAE0] transition-colors cursor-pointer"
                      title="Log Meeting Debrief"
                      aria-label={`Log meeting for ${contact.name}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
