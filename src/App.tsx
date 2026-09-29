/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Contact, Memory, UserSession } from './types';
import { INITIAL_CONTACTS } from './lib/demoData';
import { getAllMemories, saveMemory } from './lib/hindsight';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { ContactList } from './components/ContactList';
import { BriefingDossier } from './components/BriefingDossier';
import { LogMeetingPanel } from './components/LogMeetingPanel';
import { VoiceOverlay } from './components/VoiceOverlay';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { WeeklyDigestModal } from './components/WeeklyDigestModal';
import { AddContactModal } from './components/AddContactModal';
import { DataIngestionGuideModal } from './components/DataIngestionGuideModal';

const STORAGE_KEY_USER = 'meetingmind_user_session';
const STORAGE_KEY_CONTACTS = 'meetingmind_contacts_v1';

export default function App() {
  // Authentication state (Mocked auth)
  const [user, setUser] = useState<UserSession | null>(() => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (_) {}
    }
    // Default logged in with demo user for instant frictionless experience
    return {
      email: 'alden.vane@meridian-sovereign.org',
      name: 'Alden Vane',
      role: 'Principal Partner',
      isLoggedIn: true,
    };
  });

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>(() => {
    if (typeof window === 'undefined') return INITIAL_CONTACTS;
    const raw = localStorage.getItem(STORAGE_KEY_CONTACTS);
    if (raw) {
      try {
        const parsed: Contact[] = JSON.parse(raw);
        return parsed.map((c) => {
          const seed = INITIAL_CONTACTS.find((s) => s.id === c.id);
          return {
            ...c,
            meetingLink: c.meetingLink || seed?.meetingLink || 'https://meet.google.com/new',
          };
        });
      } catch (_) {}
    }
    return INITIAL_CONTACTS;
  });

  // Memories state
  const [memories, setMemories] = useState<Memory[]>(() => getAllMemories());

  // Navigation & selection
  const [selectedContactId, setSelectedContactId] = useState<string>('eleanor-vance');
  const [currentView, setCurrentView] = useState<'directory' | 'briefing' | 'log-meeting'>('directory');

  // Modal & Drawer overlays
  const [isLogPanelOpen, setIsLogPanelOpen] = useState(false);
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isWeeklyDigestOpen, setIsWeeklyDigestOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isDataGuideOpen, setIsDataGuideOpen] = useState(false);

  // Unresolved follow-ups count
  const unresolvedCount = useMemo(() => {
    return contacts.filter((c) => c.hasFollowup).length;
  }, [contacts]);

  // Active contact object
  const activeContact = useMemo(() => {
    return contacts.find((c) => c.id === selectedContactId) || contacts[0];
  }, [contacts, selectedContactId]);

  // Active contact's memories
  const activeMemories = useMemo(() => {
    return memories.filter((m) => m.contactId === activeContact?.id);
  }, [memories, activeContact]);

  // Sync contacts to storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
    }
  }, [contacts]);

  // Handlers
  const handleLogin = (email: string, name: string) => {
    const session: UserSession = {
      email,
      name,
      role: 'Principal Partner',
      isLoggedIn: true,
    };
    setUser(session);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(session));
    setCurrentView('directory');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setCurrentView('briefing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickPrep = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setIsVoiceOverlayOpen(true);
  };

  const handleOpenLogMeeting = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setIsLogPanelOpen(true);
  };

  const handleMemorySaved = (newMemory: Memory) => {
    // 1. Refresh memories state
    const all = getAllMemories();
    setMemories(all);

    // 2. Update contact's last meeting timestamp
    setContacts((prev) =>
      prev.map((c) =>
        c.id === newMemory.contactId
          ? {
              ...c,
              lastMeeting: 'Just now',
              hasFollowup: newMemory.type === 'followup' ? true : c.hasFollowup,
              statusText: newMemory.title,
            }
          : c
      )
    );
  };

  const handleAddContact = async (newContact: Contact, initialNote?: string) => {
    setContacts((prev) => [newContact, ...prev]);
    if (initialNote && initialNote.trim()) {
      try {
        const mem = await saveMemory(newContact.id, initialNote.trim(), {
          speaker: newContact.name,
          subject: 'Initial Ingestion Debrief',
        });
        handleMemorySaved(mem);
      } catch (err) {
        console.error('Failed to save initial note for new contact:', err);
      }
    }
    setSelectedContactId(newContact.id);
    setCurrentView('briefing');
  };

  // If not authenticated, show Login Page
  if (!user || !user.isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#FEF9EF] text-[#1D1C16] flex flex-col font-sans">
      {/* Top App Header */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'log-meeting') {
            setIsLogPanelOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenWeeklyDigest={() => setIsWeeklyDigestOpen(true)}
        onOpenAddContact={() => setIsAddContactOpen(true)}
        onOpenDataGuide={() => setIsDataGuideOpen(true)}
        unresolvedCount={unresolvedCount}
        onSearchClick={() => {
          setCurrentView('directory');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-14 pb-20 md:pb-10">
        {currentView === 'directory' && (
          <ContactList
            contacts={contacts}
            memories={memories}
            selectedContactId={selectedContactId}
            onSelectContact={handleSelectContact}
            onQuickPrep={handleQuickPrep}
            onOpenLogMeeting={handleOpenLogMeeting}
            onOpenWeeklyDigest={() => setIsWeeklyDigestOpen(true)}
            onOpenAddContact={() => setIsAddContactOpen(true)}
            onOpenDataGuide={() => setIsDataGuideOpen(true)}
          />
        )}

        {currentView === 'briefing' && activeContact && (
          <BriefingDossier
            contact={activeContact}
            onOpenVoiceBriefing={() => setIsVoiceOverlayOpen(true)}
            onOpenLogMeeting={() => setIsLogPanelOpen(true)}
          />
        )}
      </main>

      {/* Log Meeting Side Panel / Drawer */}
      <LogMeetingPanel
        isOpen={isLogPanelOpen}
        contact={activeContact}
        onClose={() => setIsLogPanelOpen(false)}
        onMemorySaved={handleMemorySaved}
      />

      {/* Voice Briefing Mode Full-Screen Overlay */}
      <VoiceOverlay
        isOpen={isVoiceOverlayOpen}
        contact={activeContact}
        memories={activeMemories}
        onClose={() => setIsVoiceOverlayOpen(false)}
        onSwitchToDossier={() => {
          setIsVoiceOverlayOpen(false);
          setCurrentView('briefing');
        }}
      />

      {/* API Configuration & Key Settings Modal */}
      <ApiSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaved={() => {
          // Trigger reload of memories
          setMemories(getAllMemories());
        }}
      />

      {/* Weekly Intelligence Digest Report Modal */}
      <WeeklyDigestModal
        isOpen={isWeeklyDigestOpen}
        onClose={() => setIsWeeklyDigestOpen(false)}
        contacts={contacts}
        memories={memories}
        onSelectContact={handleSelectContact}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        onAddContact={handleAddContact}
      />

      {/* Data Ingestion & System Architecture Guide */}
      <DataIngestionGuideModal
        isOpen={isDataGuideOpen}
        onClose={() => setIsDataGuideOpen(false)}
        onOpenAddContact={() => setIsAddContactOpen(true)}
        onOpenLogMeeting={handleOpenLogMeeting}
        contacts={contacts}
        onMemoryAdded={handleMemorySaved}
      />
    </div>
  );
}
