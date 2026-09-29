import React, { useState } from 'react';
import { Contact } from '../types';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: (contact: Contact, initialNote?: string) => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onAddContact,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [org, setOrg] = useState('');
  const [category, setCategory] = useState<'clients' | 'advisory'>('clients');
  const [meetingLink, setMeetingLink] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [initialNote, setInitialNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !org.trim()) return;

    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `contact-${Date.now()}`;

    const newContact: Contact = {
      id,
      name: name.trim(),
      role: role.trim() || 'Principal Stakeholder',
      org: org.trim(),
      category,
      lastMeeting: initialNote.trim() ? 'Today' : 'Never',
      hasFollowup: Boolean(initialNote.trim()),
      followupSummary: initialNote.trim() ? 'Initial debrief intake' : undefined,
      location: location.trim() || 'Global HQ',
      email: email.trim() || `${id}@${org.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      directReports: 10,
      engagementScore: initialNote.trim() ? 75 : 0,
      cadence: 'Bi-weekly',
      statusText: initialNote.trim() ? 'First meeting debrief indexed' : 'Pending initial sync',
      isPriority: false,
      meetingLink: meetingLink.trim() || 'https://meet.google.com/new',
    };

    onAddContact(newContact, initialNote.trim());
    onClose();

    // Reset form
    setName('');
    setRole('');
    setOrg('');
    setMeetingLink('');
    setEmail('');
    setLocation('');
    setInitialNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#12151C]/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-[#FEF9EF] border border-[#DDD7CD] shadow-2xl p-6 sm:p-8 flex flex-col gap-5 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DDD7CD] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C89B3C]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#7B5900] font-semibold">
                REGISTRY INGESTION // NEW DOSSIER
              </span>
            </div>
            <h2 className="font-serif text-2xl text-[#12151C] mt-1">Add New Contact</h2>
            <p className="text-xs text-[#6B7280]">
              Create an executive relationship profile to begin tracking memories and briefings.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6B7280] hover:text-[#12151C] hover:bg-[#EFEAE0] transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#46464B] uppercase block mb-1">
                Full Name <span className="text-[#BA1A1A]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Malhotra"
                className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-sm text-[#12151C] focus:border-[#12151C] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#46464B] uppercase block mb-1">
                Organization / Company <span className="text-[#BA1A1A]">*</span>
              </label>
              <input
                type="text"
                required
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="e.g. Nexus Energy Corp"
                className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-sm text-[#12151C] focus:border-[#12151C] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#46464B] uppercase block mb-1">Role / Job Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Chief Technology Officer"
                className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-sm text-[#12151C] focus:border-[#12151C] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#46464B] uppercase block mb-1">Classification</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'clients' | 'advisory')}
                className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-sm text-[#12151C] focus:border-[#12151C] focus:outline-none"
              >
                <option value="clients">Client / Commercial Partner</option>
                <option value="advisory">Advisory / Institutional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#46464B] uppercase block mb-1">Corporate Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikram@nexusenergy.com"
                className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-sm text-[#12151C] focus:border-[#12151C] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#46464B] uppercase block mb-1">Location / Office</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Singapore / Delhi"
                className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-sm text-[#12151C] focus:border-[#12151C] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[#46464B] uppercase block mb-1">
              Meeting Room URL (Google Meet / Zoom)
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/..."
              className="w-full bg-[#FFFFFF] border border-[#DDD7CD] px-3 py-2 text-sm text-[#12151C] focus:border-[#12151C] focus:outline-none"
            />
          </div>

          {/* Optional First Meeting Debrief */}
          <div className="pt-2 border-t border-[#DDD7CD]">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[#7B5900] uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#C89B3C]">history_edu</span>
                Initial Meeting Debrief / Context (Optional)
              </label>
              <span className="text-[10px] text-[#6B7280]">Saved to Hindsight</span>
            </div>
            <textarea
              rows={3}
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              placeholder="e.g. Introductory call. Discussed Q1 deployment schedule and promised technical architecture documentation by Friday..."
              className="w-full bg-[#FFFFFF] border border-[#DDD7CD] p-2.5 text-xs text-[#12151C] placeholder:text-[#A0A4B0] focus:border-[#12151C] focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DDD7CD]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#DDD7CD] text-[#12151C] hover:bg-[#EFEAE0] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#12151C] hover:bg-[#1A1D24] text-[#EFEAE0] uppercase tracking-wider font-semibold border border-[#12151C] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#C89B3C]">add</span>
              <span>Initialize Dossier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
