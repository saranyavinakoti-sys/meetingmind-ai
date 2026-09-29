import React from 'react';
import { UserSession } from '../types';

interface NavbarProps {
  currentView: 'directory' | 'briefing' | 'log-meeting';
  onNavigate: (view: 'directory' | 'briefing' | 'log-meeting') => void;
  user: UserSession;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenWeeklyDigest: () => void;
  onOpenAddContact?: () => void;
  onOpenDataGuide?: () => void;
  onSearchClick?: () => void;
  unresolvedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onLogout,
  onOpenSettings,
  onOpenWeeklyDigest,
  onOpenAddContact,
  onOpenDataGuide,
  onSearchClick,
  unresolvedCount,
}) => {
  const getCrumb = () => {
    switch (currentView) {
      case 'directory':
        return '// DIRECTORY';
      case 'briefing':
        return '// DOSSIER BRIEFING';
      case 'log-meeting':
        return '// LOG MEETING';
      default:
        return '// DIRECTORY';
    }
  };

  return (
    <>
      {/* Top Fixed Header */}
      <header className="fixed top-0 left-0 w-full z-40 bg-[#12151C] text-[#EFEAE0] shadow-md border-b border-[#262C3A]">
        <div className="h-14 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Mark and Crumb */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('directory')}
              className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
            >
              {/* Minimal geometric ledger icon matching reference */}
              <div className="w-7 h-7 rounded border border-[#C89B3C]/50 bg-[#191C23] flex items-center justify-center text-[#C89B3C] font-serif font-bold text-sm">
                M
              </div>
              <span className="font-serif text-lg tracking-tight text-[#EFEAE0] group-hover:text-[#F0BF5C] transition-colors">
                MeetingMind
              </span>
            </button>

            <span className="h-4 w-px bg-[#2E3646]" />

            <span className="font-mono text-xs uppercase tracking-wider text-[#F0BF5C] font-medium hidden sm:inline-block">
              {getCrumb()}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
            <button
              onClick={() => onNavigate('directory')}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${
                currentView === 'directory'
                  ? 'bg-[#EFEAE0] text-[#12151C] font-semibold'
                  : 'text-[#C4C6D0] hover:text-[#EFEAE0] hover:bg-[#1A1D24]'
              }`}
            >
              Directory
            </button>
            <button
              onClick={() => onNavigate('briefing')}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${
                currentView === 'briefing'
                  ? 'bg-[#EFEAE0] text-[#12151C] font-semibold'
                  : 'text-[#C4C6D0] hover:text-[#EFEAE0] hover:bg-[#1A1D24]'
              }`}
            >
              Dossier
            </button>
            <button
              onClick={() => onNavigate('log-meeting')}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${
                currentView === 'log-meeting'
                  ? 'bg-[#EFEAE0] text-[#12151C] font-semibold'
                  : 'text-[#C4C6D0] hover:text-[#EFEAE0] hover:bg-[#1A1D24]'
              }`}
            >
              Log Meeting
            </button>
          </nav>

          {/* Right Action Icons: Add Contact, Data Guide, Weekly Digest, Search, Settings, User */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Quick Add Contact */}
            {onOpenAddContact && (
              <button
                onClick={onOpenAddContact}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-[#191C23] hover:bg-[#202530] border border-[#2E3646] hover:border-[#C89B3C] text-[#EFEAE0] transition-colors font-mono text-xs cursor-pointer"
                title="Add new counterparty or client"
              >
                <span className="material-symbols-outlined text-[15px] text-[#C89B3C]">add</span>
                <span className="uppercase tracking-wider">Contact</span>
              </button>
            )}

            {/* How to Add Data Guide */}
            {onOpenDataGuide && (
              <button
                onClick={onOpenDataGuide}
                className="p-1.5 text-[#C4C6D0] hover:text-[#F0BF5C] hover:bg-[#1A1D24] transition-colors rounded cursor-pointer flex items-center gap-1 font-mono text-xs"
                title="How to add data, memories, and meeting links"
                aria-label="How to Add Data Guide"
              >
                <span className="material-symbols-outlined text-[18px] text-[#C89B3C]">help</span>
                <span className="hidden xl:inline text-[11px] uppercase tracking-wider text-[#A0A4B0]">Data Guide</span>
              </button>
            )}

            {/* Weekly Digest Trigger */}
            <button
              onClick={onOpenWeeklyDigest}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#191C23] hover:bg-[#202530] border border-[#C89B3C]/50 text-[#F0BF5C] transition-colors font-mono text-xs cursor-pointer"
              title="Weekly Relationship Intelligence Digest"
            >
              <span className="material-symbols-outlined text-[16px]">summarize</span>
              <span className="uppercase tracking-wider font-semibold hidden sm:inline">Weekly Digest</span>
              {typeof unresolvedCount === 'number' && unresolvedCount > 0 && (
                <span className="bg-[#C89B3C] text-[#12151C] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {unresolvedCount}
                </span>
              )}
            </button>

            <button
              onClick={onSearchClick}
              className="p-2 text-[#C4C6D0] hover:text-[#EFEAE0] hover:bg-[#1A1D24] transition-colors rounded cursor-pointer"
              title="Search Directory"
              aria-label="Search contacts"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 text-[#C4C6D0] hover:text-[#F0BF5C] hover:bg-[#1A1D24] transition-colors rounded cursor-pointer relative"
              title="API Configuration (Hindsight & Groq)"
              aria-label="API Settings"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C89B3C]" />
            </button>

            {/* User Profile / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#2E3646]">
              <div
                className="w-8 h-8 rounded-full bg-[#191C23] border border-[#C89B3C]/40 text-[#EFEAE0] flex items-center justify-center font-serif text-xs font-semibold select-none cursor-pointer"
                title={`${user.name} (${user.email})`}
                onClick={onLogout}
              >
                {user.name.slice(0, 2).toUpperCase()}
              </div>

              <button
                onClick={onLogout}
                className="hidden lg:inline-block text-[11px] font-mono uppercase tracking-wider text-[#A0A4B0] hover:text-[#EFEAE0] transition-colors"
                title="Sign out of demo session"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar matching design */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-[#FEF9EF]/95 backdrop-blur-md border-t border-[#DDD7CD] shadow-lg">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            onClick={() => onNavigate('briefing')}
            className={`flex flex-col items-center justify-center min-w-[64px] py-1 cursor-pointer transition-colors ${
              currentView === 'briefing' ? 'text-[#12151C] font-semibold' : 'text-[#6B7280] hover:text-[#12151C]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">description</span>
            <span className="font-mono text-[10px] uppercase tracking-wider mt-0.5">Briefing</span>
          </button>

          <button
            onClick={() => onNavigate('directory')}
            className={`flex flex-col items-center justify-center min-w-[64px] py-1 cursor-pointer transition-colors ${
              currentView === 'directory' ? 'text-[#12151C] font-semibold' : 'text-[#6B7280] hover:text-[#12151C]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">contacts</span>
            <span className="font-mono text-[10px] uppercase tracking-wider mt-0.5">Directory</span>
          </button>

          <button
            onClick={() => onNavigate('log-meeting')}
            className={`flex flex-col items-center justify-center min-w-[64px] py-1 cursor-pointer transition-colors ${
              currentView === 'log-meeting' ? 'text-[#12151C] font-semibold' : 'text-[#6B7280] hover:text-[#12151C]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">mic</span>
            <span className="font-mono text-[10px] uppercase tracking-wider mt-0.5">Log Meeting</span>
          </button>
        </div>
      </nav>
    </>
  );
};
