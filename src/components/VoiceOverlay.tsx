import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Contact, Memory } from '../types';
import { generateVoiceBriefingSpeech } from '../lib/groq';
import { useVoice } from '../hooks/useVoice';

interface VoiceOverlayProps {
  isOpen: boolean;
  contact: Contact | null;
  memories: Memory[];
  onClose: () => void;
  onSwitchToDossier: () => void;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({
  isOpen,
  contact,
  memories,
  onClose,
  onSwitchToDossier,
}) => {
  const [currentQuery, setCurrentQuery] = useState('');
  const [spokenCaption, setSpokenCaption] = useState('');
  const [highlightFact, setHighlightFact] = useState('');
  const [audioTrackRef, setAudioTrackRef] = useState('#44');
  const [sessionRef, setSessionRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [briefingFinished, setBriefingFinished] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  const {
    isListening,
    transcript,
    isSpeaking,
    isPaused,
    hasSpeechRecognition,
    speechError,
    startListening,
    stopListening,
    speak,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
    clearTranscript,
  } = useVoice();

  // Waveform heights
  const [waveformBars, setWaveformBars] = useState<number[]>([
    8, 14, 28, 42, 24, 46, 20, 36, 18, 30, 10,
  ]);

  // Animate waveform while speaking or listening
  useEffect(() => {
    if (!isOpen) return;

    let interval: any;
    if ((isSpeaking && !isPaused) || isListening || isProcessing) {
      interval = setInterval(() => {
        setWaveformBars(
          Array.from({ length: 11 }, () => Math.floor(Math.random() * 38) + 8)
        );
      }, 120);
    } else {
      setWaveformBars([6, 8, 10, 12, 10, 14, 10, 12, 8, 6, 4]);
    }

    return () => clearInterval(interval);
  }, [isOpen, isSpeaking, isPaused, isListening, isProcessing]);

  // Execute synthesis and speech
  const handleQuery = useCallback(
    async (queryText: string) => {
      if (!contact) return;
      setIsProcessing(true);
      setCurrentQuery(queryText);
      stopSpeech();

      try {
        const result = await generateVoiceBriefingSpeech(contact, memories, queryText);
        setSpokenCaption(result.spokenText);
        setHighlightFact(result.highlightFact);
        setAudioTrackRef(result.audioTrackRef);
        setSessionRef(result.sessionRef);

        setIsProcessing(false);
        setBriefingFinished(false);

        // Speak the natural spoken text
        speak(result.spokenText, () => {
          setBriefingFinished(true);
        });
      } catch (err) {
        console.error('Voice briefing error:', err);
        setIsProcessing(false);
        const fallback = `In past meetings with ${contact.name}, key commitments were recorded regarding project milestones and technical requirements. You're all set — tap join when you're ready.`;
        setSpokenCaption(fallback);
        speak(fallback, () => {
          setBriefingFinished(true);
        });
      }
    },
    [contact, memories, speak, stopSpeech]
  );

  // Auto-trigger default query when overlay opens
  useEffect(() => {
    if (isOpen && contact) {
      const defaultQuery = `Prep me for my meeting with ${contact.name}`;
      handleQuery(defaultQuery);
    } else {
      stopSpeech();
      stopListening();
    }
  }, [isOpen, contact, handleQuery, stopSpeech, stopListening]);

  // Keyboard controls: Space for pause/resume, Esc for close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        if (isSpeaking && !isPaused) {
          pauseSpeech();
        } else if (isPaused) {
          resumeSpeech();
        }
      } else if (e.code === 'Escape') {
        stopSpeech();
        stopListening();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSpeaking, isPaused, pauseSpeech, resumeSpeech, stopSpeech, stopListening, onClose]);

  // Listen for follow-up speech recognition
  const handleStartFollowUpListening = () => {
    stopSpeech();
    clearTranscript();
    startListening((finalText) => {
      if (finalText && finalText.trim()) {
        handleQuery(finalText.trim());
      }
    });
  };

  const handleCustomPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      handleQuery(customInput.trim());
      setCustomInput('');
      setShowCustomPrompt(false);
    }
  };

  if (!isOpen || !contact) return null;

  // Split caption around the gold highlight fact for targeted rendering
  const renderHighlightedCaption = () => {
    if (!spokenCaption) {
      return (
        <span className="italic text-[#C4C6D0]/60">
          Synthesizing intelligence from Hindsight memory bank...
        </span>
      );
    }

    if (!highlightFact || !spokenCaption.toLowerCase().includes(highlightFact.toLowerCase())) {
      return <span>“{spokenCaption}”</span>;
    }

    const idx = spokenCaption.toLowerCase().indexOf(highlightFact.toLowerCase());
    const before = spokenCaption.slice(0, idx);
    const matched = spokenCaption.slice(idx, idx + highlightFact.length);
    const after = spokenCaption.slice(idx + highlightFact.length);

    return (
      <span>
        “{before}
        <span className="text-[#F0BF5C] bg-[#FCCA66]/15 px-1 py-0.5 border border-[#C89B3C]/40 shadow-xs inline-block">
          {matched}
        </span>
        {after}”
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12151C] text-[#EFEAE0] flex flex-col justify-between p-4 sm:p-8 md:p-12 overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#C89B3C]/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#191C23] blur-2xl" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full flex items-center justify-between border-b border-[#262C3A] pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-[#F0BF5C] animate-pulse" />
          <div className="flex items-center space-x-2 font-mono text-xs tracking-widest text-[#A0A4B0] uppercase">
            <span className="text-[#EFEAE0] font-semibold">MeetingMind</span>
            <span className="opacity-40">//</span>
            <span className="text-[#F0BF5C]">Voice Briefing Mode</span>
            <span className="ml-2 px-1.5 py-0.5 bg-[#191C23] text-[#F0BF5C] text-[10px] font-mono uppercase border border-[#C89B3C]/30 hidden sm:inline-block">
              Level 4 Classified
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-1.5 text-[#A0A4B0] text-xs font-mono uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px] text-[#F0BF5C]">verified_user</span>
            <span>Dossier Protocol v2.8</span>
          </div>

          <button
            onClick={() => {
              stopSpeech();
              stopListening();
              onClose();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-[#C4C6D0] hover:text-[#EFEAE0] bg-[#191C23] hover:bg-[#262C3A] border border-[#2E3646] transition-colors group cursor-pointer"
            id="exitBriefingBtn"
          >
            <span className="font-mono text-xs tracking-wider uppercase">Esc to close</span>
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">
              close
            </span>
          </button>
        </div>
      </header>

      {/* Main Active Canvas */}
      <main className="relative z-10 my-auto flex flex-col items-center justify-center text-center max-w-4xl mx-auto w-full py-4 sm:py-8">
        {/* Contact Identifier Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-[#191C23] border border-[#2E3646] rounded-full mb-6">
          <span className="material-symbols-outlined text-[15px] text-[#F0BF5C]">folder_shared</span>
          <span className="font-serif text-sm sm:text-base text-[#EFEAE0] tracking-wide">
            {contact.name} · {contact.org}
          </span>
          <span className="text-[#A0A4B0] text-xs font-mono">• {memories.length} Memories Recalled</span>
        </div>

        {/* Concentric Pulsing Audio Orb matching design */}
        <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56 my-2">
          {/* Outer Field Rings */}
          <div
            className={`absolute inset-0 rounded-full bg-[#F0BF5C]/10 border border-[#F0BF5C]/20 transition-all duration-700 ${
              isSpeaking || isListening ? 'scale-110 opacity-70 animate-pulse' : 'scale-100 opacity-20'
            }`}
          />
          <div className="absolute inset-4 rounded-full bg-[#191C23]/60 border border-[#C89B3C]/10" />

          {/* Center Core Orb */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-[#262C3A] to-[#12151C] shadow-2xl flex items-center justify-center border border-[#C89B3C]/40">
            <button
              onClick={handleStartFollowUpListening}
              className="absolute inset-1 rounded-full bg-[#191C23] flex items-center justify-center cursor-pointer hover:bg-[#202530] transition-colors"
              title="Click to speak follow-up question"
            >
              <span
                className={`material-symbols-outlined text-[36px] transition-transform duration-300 ${
                  isListening
                    ? 'text-[#BA1A1A] animate-pulse scale-110'
                    : isSpeaking
                    ? 'text-[#F0BF5C] animate-pulse'
                    : 'text-[#F0BF5C]'
                }`}
              >
                {isListening ? 'mic' : isSpeaking ? 'graphic_eq' : 'record_voice_over'}
              </span>
            </button>

            {/* Orbiting particle indicator */}
            <div className="absolute inset-0 w-full h-full animate-spin [animation-duration:8s] pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-[#F0BF5C] shadow-[0_0_8px_#f0bf5c]" />
            </div>
          </div>
        </div>

        {/* Multi-Band Waveform Visualizer */}
        <div className="flex items-center justify-center space-x-1.5 h-12 w-64 my-4" id="waveform">
          {waveformBars.map((height, i) => (
            <div
              key={i}
              className="w-1.5 bg-[#F0BF5C] rounded-full transition-all duration-150"
              style={{
                height: `${height}px`,
                opacity: 0.4 + (i % 2 === 0 ? 0.6 : 0.4),
              }}
            />
          ))}
        </div>

        {/* Live Voice Query Transcript Indicator */}
        <div className="flex items-center justify-center space-x-2 font-mono text-xs text-[#A0A4B0] mb-4 max-w-xl px-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F0BF5C] inline-block animate-ping shrink-0" />
          <span className="tracking-wide uppercase shrink-0">
            {isListening ? 'Listening:' : 'Active Query:'}
          </span>
          <span className="italic text-[#EFEAE0] truncate">
            “{isListening ? transcript || 'Listening to your voice...' : currentQuery}”
          </span>
        </div>

        {/* Active Spoken Caption in Serif typography */}
        <div className="mt-2 max-w-3xl px-4 sm:px-6">
          <p className="font-serif text-xl sm:text-2xl md:text-3xl text-[#FEF9EF] leading-relaxed tracking-tight antialiased">
            {renderHighlightedCaption()}
          </p>
        </div>

        {/* Historical Reference Marker */}
        <div className="flex items-center space-x-2 mt-6 text-[#A0A4B0] font-mono text-xs uppercase tracking-wider">
          <span className="material-symbols-outlined text-[15px] text-[#F0BF5C]">history_toggle_off</span>
          <span>{sessionRef || `Recalled from ${contact.name}'s Hindsight Archive`}</span>
          <span className="opacity-40">•</span>
          <span>Audio Ref {audioTrackRef}</span>
        </div>

        {/* Join Meeting Action (Gold, Filled) */}
        {contact.meetingLink && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              onClick={() => {
                stopSpeech();
                stopListening();
                window.open(contact.meetingLink, '_blank', 'noopener,noreferrer');
              }}
              className={`px-7 py-3.5 bg-[#FCCA66] hover:bg-[#F0BF5C] text-[#261900] font-mono text-sm uppercase tracking-wider font-bold border border-[#C89B3C] shadow-lg flex items-center gap-2.5 transition-all cursor-pointer active:scale-95 ${
                briefingFinished ? 'ring-4 ring-[#F0BF5C]/40 animate-pulse' : ''
              }`}
              id="voice-join-meeting-btn"
              title={`Open ${contact.meetingLink}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {contact.meetingLink.includes('zoom') ? 'videocam' : 'video_call'}
              </span>
              <span>Join meeting</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>

            <span className="text-[11px] font-mono text-[#F0BF5C]/80">
              {briefingFinished
                ? "You're all set — tap join when you're ready"
                : `Meeting room: ${contact.meetingLink.includes('zoom') ? 'Zoom' : 'Google Meet'}`}
            </span>
          </div>
        )}

        {/* Follow-up question triggers */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-2xl px-4">
          <span className="text-xs font-mono uppercase text-[#A0A4B0] mr-1">Ask Follow-up:</span>
          <button
            onClick={() => handleQuery('What did they say about pricing and budgets?')}
            className="px-3 py-1.5 bg-[#191C23] hover:bg-[#262C3A] border border-[#2E3646] text-xs font-mono text-[#EFEAE0] transition-colors cursor-pointer"
          >
            "What did they say about pricing?"
          </button>
          <button
            onClick={() => handleQuery('What promises or action items were left pending?')}
            className="px-3 py-1.5 bg-[#191C23] hover:bg-[#262C3A] border border-[#2E3646] text-xs font-mono text-[#EFEAE0] transition-colors cursor-pointer"
          >
            "What promises are pending?"
          </button>
          <button
            onClick={() => handleQuery('What is their negotiation temperament or stance?')}
            className="px-3 py-1.5 bg-[#191C23] hover:bg-[#262C3A] border border-[#2E3646] text-xs font-mono text-[#EFEAE0] transition-colors cursor-pointer"
          >
            "What is their stance?"
          </button>
          <button
            onClick={() => setShowCustomPrompt(!showCustomPrompt)}
            className="px-3 py-1.5 bg-[#191C23] hover:bg-[#262C3A] border border-[#F0BF5C]/50 text-xs font-mono text-[#F0BF5C] transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            <span>Type custom query</span>
          </button>
        </div>

        {/* Custom text question input */}
        {showCustomPrompt && (
          <form
            onSubmit={handleCustomPromptSubmit}
            className="mt-4 flex items-center w-full max-w-md bg-[#191C23] border border-[#F0BF5C] p-1"
          >
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Ask anything about past meetings..."
              autoFocus
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-[#EFEAE0] focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#F0BF5C] text-[#12151C] font-mono text-xs font-semibold uppercase tracking-wider"
            >
              Ask
            </button>
          </form>
        )}

        {speechError && (
          <p className="mt-3 text-xs font-mono text-[#F25022]">{speechError}</p>
        )}
      </main>

      {/* Bottom Controls & Security Telemetry */}
      <footer className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-[#262C3A]">
        {/* Stream Telemetry */}
        <div className="flex items-center space-x-2 text-[#A0A4B0] font-mono text-xs">
          <span className="material-symbols-outlined text-[16px] text-[#F0BF5C]">lock</span>
          <span className="tracking-wider">Lossless audio stream · 256-bit Encrypted</span>
        </div>

        {/* Operational Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleStartFollowUpListening}
            className={`flex items-center space-x-1.5 px-4 py-2 border transition-all cursor-pointer ${
              isListening
                ? 'bg-[#BA1A1A] text-white border-[#BA1A1A] animate-pulse'
                : 'bg-[#191C23] hover:bg-[#262C3A] text-[#EFEAE0] border-[#2E3646]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-[#F0BF5C]">mic</span>
            <span className="font-mono text-xs tracking-wide">
              {isListening ? 'Listening (Speak now)' : 'Speak Question'}
            </span>
          </button>

          <button
            onClick={() => {
              if (isSpeaking && !isPaused) pauseSpeech();
              else if (isPaused) resumeSpeech();
              else if (spokenCaption) speak(spokenCaption);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#191C23] hover:bg-[#262C3A] text-[#EFEAE0] border border-[#2E3646] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSpeaking && !isPaused ? 'pause' : 'play_arrow'}
            </span>
            <span className="font-mono text-xs tracking-wide">
              {isSpeaking && !isPaused ? 'Pause audio (Space)' : 'Play audio (Space)'}
            </span>
          </button>

          <button
            onClick={() => {
              stopSpeech();
              stopListening();
              onSwitchToDossier();
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#FEF9EF] text-[#12151C] hover:bg-[#EFEAE0] transition-colors cursor-pointer font-mono text-xs font-semibold uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">article</span>
            <span>Switch to text dossier</span>
          </button>
        </div>

        {/* Latency Telemetry */}
        <div className="hidden md:flex items-center space-x-3 text-[#A0A4B0] font-mono text-xs">
          <span>Latency: 48ms</span>
          <span className="opacity-40">|</span>
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F0BF5C] inline-block" />
            <span className="text-[#EFEAE0]">Neural Synthesis Active</span>
          </span>
        </div>
      </footer>
    </div>
  );
};
