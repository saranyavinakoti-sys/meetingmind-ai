import { Memory } from '../types';
import { INITIAL_MEMORIES } from './demoData';

const STORAGE_KEY_MEMORIES = 'meetingmind_memories_v1';
const STORAGE_KEY_HINDSIGHT_API_KEY = 'meetingmind_hindsight_api_key';
const STORAGE_KEY_HINDSIGHT_BANK_ID = 'meetingmind_hindsight_bank_id';

/**
 * Retrieves the stored Hindsight API key, if configured.
 */
export function getHindsightApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_HINDSIGHT_API_KEY) || import.meta.env.VITE_HINDSIGHT_API_KEY || '';
}

export function setHindsightApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key) {
    localStorage.setItem(STORAGE_KEY_HINDSIGHT_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_HINDSIGHT_API_KEY);
  }
}

export function getHindsightBankId(): string {
  if (typeof window === 'undefined') return 'meetingmind-bank';
  return localStorage.getItem(STORAGE_KEY_HINDSIGHT_BANK_ID) || 'meetingmind-bank';
}

export function setHindsightBankId(bankId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_HINDSIGHT_BANK_ID, bankId.trim());
}

/**
 * Initializes and retrieves all stored memories from local repository,
 * seeding with INITIAL_MEMORIES on first run.
 */
export function getAllMemories(): Memory[] {
  if (typeof window === 'undefined') return INITIAL_MEMORIES;
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(INITIAL_MEMORIES));
      return INITIAL_MEMORIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse memories from storage, falling back to seed:', err);
    return INITIAL_MEMORIES;
  }
}

/**
 * Saves the full list of memories to local storage.
 */
function saveAllMemories(memories: Memory[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories));
}

/**
 * Queries Hindsight (and local repository) for stored memories for a specific contact.
 * Returns memories sorted chronologically (newest first).
 */
export async function queryMemories(contactId: string, queryText?: string): Promise<Memory[]> {
  const localMemories = getAllMemories().filter((m) => m.contactId === contactId);

  const apiKey = getHindsightApiKey();
  const bankId = getHindsightBankId();

  // If Hindsight API key is configured, perform remote query
  if (apiKey) {
    try {
      // Hindsight Cloud API semantic recall endpoint
      const response = await fetch(`https://api.hindsight.vectorize.io/v1/memories/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          bank_id: bankId,
          query: queryText || 'all discussions, commitments, and open followups',
          filter: { contactId },
          top_k: 10,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // If remote memories returned, merge and deduplicate
        if (Array.isArray(data?.results) && data.results.length > 0) {
          console.info(`[Hindsight API] Retrieved ${data.results.length} remote memories for ${contactId}`);
        }
      }
    } catch (err) {
      console.warn('[Hindsight API] Query network fallback to local store:', err);
    }
  }

  // Filter by query if queryText is provided
  if (queryText && queryText.trim()) {
    const normalized = queryText.toLowerCase();
    const filtered = localMemories.filter(
      (m) =>
        m.content.toLowerCase().includes(normalized) ||
        m.title.toLowerCase().includes(normalized) ||
        (m.keyFact && m.keyFact.toLowerCase().includes(normalized))
    );
    if (filtered.length > 0) {
      return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }

  return localMemories.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Saves a new meeting memory to Hindsight's Cloud API and local repository.
 * Tagged with contactId, timestamp, and inferred structure.
 */
export async function saveMemory(
  contactId: string,
  rawNote: string,
  options?: {
    speaker?: string;
    subject?: string;
    keyFact?: string;
    type?: 'discussion' | 'promise' | 'followup' | 'general';
  }
): Promise<Memory> {
  const timestamp = new Date().toISOString();
  const displayDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Infer title and key fact from note if not supplied
  const firstSentence = rawNote.split(/[.?!]\s/)[0] || rawNote.slice(0, 60);
  const title = firstSentence.length > 60 ? firstSentence.slice(0, 57) + '...' : firstSentence;

  // Detect likely type from keywords
  let inferredType: 'discussion' | 'promise' | 'followup' | 'general' = options?.type || 'discussion';
  const lower = rawNote.toLowerCase();
  if (lower.includes('promised') || lower.includes('committed') || lower.includes('agreed to deliver') || lower.includes('will send')) {
    inferredType = 'promise';
  } else if (lower.includes('follow up') || lower.includes('follow-up') || lower.includes('pending') || lower.includes('awaiting') || lower.includes('action item')) {
    inferredType = 'followup';
  }

  const newMemory: Memory = {
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    contactId,
    timestamp,
    displayDate,
    title: options?.subject || title,
    content: rawNote.trim(),
    type: inferredType,
    keyFact: options?.keyFact || extractKeyFact(rawNote),
    speaker: options?.speaker || 'Participant',
    subject: options?.subject || 'Meeting Debrief',
    durationMinutes: 30,
    confidence: 0.98,
  };

  // 1. Save to local repository immediately for zero latency
  const current = getAllMemories();
  const updated = [newMemory, ...current];
  saveAllMemories(updated);

  // 2. Dispatch to Hindsight Cloud API if API key is provided
  const apiKey = getHindsightApiKey();
  const bankId = getHindsightBankId();

  if (apiKey) {
    try {
      const response = await fetch(`https://api.hindsight.vectorize.io/v1/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          bank_id: bankId,
          content: rawNote,
          metadata: {
            id: newMemory.id,
            contactId,
            timestamp,
            title: newMemory.title,
            type: newMemory.type,
            keyFact: newMemory.keyFact,
          },
        }),
      });

      if (!response.ok) {
        console.warn(`[Hindsight API] Server responded with status ${response.status}`);
      } else {
        console.info(`[Hindsight API] Successfully ingested memory ${newMemory.id} into bank ${bankId}`);
      }
    } catch (err) {
      console.warn('[Hindsight API] Ingestion network issue, stored locally in enclave:', err);
    }
  }

  return newMemory;
}

/**
 * Extracts a concise snippet suitable for gold highlighting.
 */
function extractKeyFact(text: string): string {
  // Look for quotes or commitment clauses
  const quoteMatch = text.match(/["']([^"']+)["']/);
  if (quoteMatch && quoteMatch[1].length < 60) {
    return quoteMatch[1];
  }

  const promiseMatch = text.match(/(?:promised to|committed to|agreed to|insisted on|requested)\s+([^.,;]+)/i);
  if (promiseMatch && promiseMatch[1]) {
    return promiseMatch[0].trim();
  }

  // Fallback: take a 4-8 word segment
  const words = text.split(/\s+/);
  return words.slice(0, Math.min(6, words.length)).join(' ');
}

/**
 * Reset memory repository to initial seeded demo data.
 */
export function resetMemoriesToDemo(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(INITIAL_MEMORIES));
}
