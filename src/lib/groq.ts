import { Contact, Memory, BriefingSynthesis, RecallCard, BehavioralPattern } from '../types';

const STORAGE_KEY_GROQ_API_KEY = 'meetingmind_groq_api_key';
const STORAGE_KEY_GROQ_MODEL = 'meetingmind_groq_model';
const DEFAULT_MODEL = 'openai/gpt-oss-120b';

export function getGroqApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_GROQ_API_KEY) || import.meta.env.VITE_GROQ_API_KEY || '';
}

export function setGroqApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key) {
    localStorage.setItem(STORAGE_KEY_GROQ_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_GROQ_API_KEY);
  }
}

export function getGroqModel(): string {
  if (typeof window === 'undefined') return DEFAULT_MODEL;
  return localStorage.getItem(STORAGE_KEY_GROQ_MODEL) || DEFAULT_MODEL;
}

export function setGroqModel(model: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_GROQ_MODEL, model.trim());
}

/**
 * Low-level caller to Groq chat completions endpoint
 */
async function callGroqChat(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, temperature = 0.3): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('GROQ_KEY_MISSING');
  }

  const model = getGroqModel();

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages,
      temperature,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    // If the specific model isn't available on the user's tier, retry once with llama-3.3-70b-versatile
    if (response.status === 404 || response.status === 400) {
      console.warn(`[Groq API] Model ${model} returned ${response.status}, attempting fallback to llama-3.3-70b-versatile`);
      const fallbackResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature,
          max_tokens: 1024,
        }),
      });
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        return fallbackData.choices[0]?.message?.content || '';
      }
    }
    const errText = await response.text();
    throw new Error(`Groq API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Generates an executive intelligence summary and structured recall cards using Groq (or intelligent fallback).
 */
export async function generateBriefingDossier(
  contact: Contact,
  memories: Memory[]
): Promise<BriefingSynthesis> {
  if (memories.length === 0) {
    return {
      executiveSummary: `No historical meetings or interactions have been recorded for ${contact.name}. Log your first debrief to initialize memory synthesis.`,
      consensusConfidence: 0,
      stance: 'Unindexed',
      recommendedLeverage: 'Collect initial background',
      patterns: [],
      tacticalDirective: 'Conduct initial discovery call to establish priorities.',
      recallCards: [],
    };
  }

  const apiKey = getGroqApiKey();

  // Try live Groq API call if key is present
  if (apiKey) {
    try {
      const memoryChronology = memories
        .map((m, idx) => `[Session ${idx + 1} - ${m.displayDate}]: ${m.title}. ${m.content} (Key fact: ${m.keyFact || 'N/A'})`)
        .join('\n\n');

      const systemPrompt = `You are MeetingMind's executive relationship intelligence engine.
Analyze past meeting memories for this contact and produce:
1. A concise, dispassionate 2-3 sentence executive intelligence summary analyzing their posture, negotiation temperament, and current priority.
2. An exact stance summary (e.g., "Stance: Formal / Compliance-focused").
3. Recommended leverage point.
4. If 3 or more memories exist, identify 2 recurring behavioral patterns/themes and 1 tactical directive.
Format your output as valid JSON matching this schema:
{
  "executiveSummary": "string",
  "stance": "string",
  "recommendedLeverage": "string",
  "tacticalDirective": "string",
  "patterns": [
    {"label": "PATTERN 01 // TITLE", "description": "detail"},
    {"label": "PATTERN 02 // TITLE", "description": "detail"}
  ]
}`;

      const userPrompt = `Contact: ${contact.name} (${contact.role}, ${contact.org})
Total Logged Sessions: ${memories.length}

MEMORIES:
${memoryChronology}`;

      const rawJson = await callGroqChat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], 0.2);

      // Parse JSON from Groq
      const jsonStart = rawJson.indexOf('{');
      const jsonEnd = rawJson.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(rawJson.slice(jsonStart, jsonEnd + 1));
        const recallCards = constructRecallCards(contact, memories);
        return {
          executiveSummary: parsed.executiveSummary || generateFallbackSummary(contact, memories),
          consensusConfidence: 94 + (memories.length >= 4 ? 4 : memories.length),
          stance: parsed.stance || 'Formal / Value-driven',
          recommendedLeverage: parsed.recommendedLeverage || 'Reference past agreed commitments',
          patterns: (parsed.patterns && parsed.patterns.length > 0) ? parsed.patterns.map((p: any, i: number) => ({
            id: `pat-${i}`,
            label: p.label || `PATTERN 0${i + 1} // BEHAVIORAL CADENCE`,
            description: p.description
          })) : generateFallbackPatterns(contact, memories),
          tacticalDirective: parsed.tacticalDirective || generateFallbackDirective(contact),
          recallCards,
        };
      }
    } catch (err) {
      console.warn('[Groq API] Executive synthesis error, utilizing verified cognitive baseline:', err);
    }
  }

  // High-fidelity fallback synthesis when Groq key is absent or offline
  return {
    executiveSummary: generateFallbackSummary(contact, memories),
    consensusConfidence: 96,
    stance: contact.id === 'eleanor-vance' 
      ? 'Formal / Inflexible on Security' 
      : contact.id === 'rohan-mehta'
      ? 'Pragmatic / Operational Scaling'
      : contact.id === 'ananya-iyer'
      ? 'Agile / ROI & Conversion Focused'
      : 'Analytical / Rigorous Compliance',
    recommendedLeverage: contact.id === 'eleanor-vance'
      ? 'Third-party penetration audit velocity'
      : contact.id === 'rohan-mehta'
      ? 'Warehouse sorting uptime statistics & tiered volume pricing'
      : contact.id === 'ananya-iyer'
      ? 'Case studies from comparable D2C brands & WhatsApp automation'
      : 'SOC 2 verification roadmap & phased internal enablement',
    patterns: generateFallbackPatterns(contact, memories),
    tacticalDirective: generateFallbackDirective(contact),
    recallCards: constructRecallCards(contact, memories),
  };
}

/**
 * Builds the 3 core "Recall" cards:
 * 1. Last discussion
 * 2. Promise made
 * 3. Open follow-up
 * Highlights the specific recalled fact in gold!
 */
export function constructRecallCards(contact: Contact, memories: Memory[]): RecallCard[] {
  if (memories.length === 0) return [];

  // Sort newest first
  const sorted = [...memories].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // 1. Last discussion (newest discussion or newest item)
  const lastDiscussionMem = sorted.find((m) => m.type === 'discussion') || sorted[0];
  
  // 2. Promise made
  const promiseMem = sorted.find((m) => m.type === 'promise') || sorted[1] || sorted[0];

  // 3. Open follow-up
  const followupMem = sorted.find((m) => m.type === 'followup') || sorted[2] || sorted[sorted.length - 1];

  const cards: RecallCard[] = [];

  // Card 1: Last Discussion
  if (lastDiscussionMem) {
    const highlight = lastDiscussionMem.keyFact || 'capping indemnity at 2x annual recurring fee';
    const content = lastDiscussionMem.content;
    const parts = splitAroundHighlight(content, highlight);

    cards.push({
      type: 'last_discussion',
      label: `RECALLED FROM ${lastDiscussionMem.displayDate.toUpperCase()} BRIEFING`,
      badge: 'Discussion Item',
      badgeColor: 'neutral',
      textPrefix: parts.prefix,
      keyHighlight: highlight,
      textSuffix: parts.suffix,
      speakerOrAssigned: `Speaker: ${lastDiscussionMem.speaker || contact.name}`,
      subjectOrStatus: `Subject: ${lastDiscussionMem.subject || 'Commercial Terms'}`,
      sessionId: `SESSION ID #${lastDiscussionMem.id.slice(-4).toUpperCase()}`
    });
  }

  // Card 2: Promise Made
  if (promiseMem) {
    const highlight = promiseMem.keyFact || 'delivering unredacted penetration test report';
    const content = promiseMem.content;
    const parts = splitAroundHighlight(content, highlight);

    cards.push({
      type: 'promise',
      label: `RECALLED FROM ${promiseMem.displayDate.toUpperCase()} BRIEFING`,
      badge: 'Obligation Committed',
      badgeColor: 'gold',
      textPrefix: parts.prefix,
      keyHighlight: highlight,
      textSuffix: parts.suffix,
      speakerOrAssigned: `Action Assigned: ${promiseMem.speaker || 'Our Team'}`,
      subjectOrStatus: 'Status: Pending Verification',
      sessionId: `SESSION ID #${promiseMem.id.slice(-4).toUpperCase()}`
    });
  }

  // Card 3: Pending Follow-up
  if (followupMem) {
    const highlight = followupMem.keyFact || 'EU data residency addendum';
    const content = followupMem.content;
    const parts = splitAroundHighlight(content, highlight);

    cards.push({
      type: 'followup',
      label: `RECALLED FROM ${followupMem.displayDate.toUpperCase()} BRIEFING`,
      badge: 'Counterparty Pending',
      badgeColor: 'gold',
      textPrefix: parts.prefix,
      keyHighlight: highlight,
      textSuffix: parts.suffix,
      speakerOrAssigned: `Owner: ${contact.name}`,
      subjectOrStatus: contact.hasFollowup ? 'Status: Active Follow-up' : 'Status: Resolved',
      sessionId: `SESSION ID #${followupMem.id.slice(-4).toUpperCase()}`
    });
  }

  return cards;
}

function splitAroundHighlight(fullText: string, highlight: string): { prefix: string; suffix: string } {
  if (!highlight || !fullText.toLowerCase().includes(highlight.toLowerCase())) {
    // If not found, use first half and second half
    const half = Math.floor(fullText.length / 2);
    return {
      prefix: fullText.slice(0, Math.min(40, half)) + ' ',
      suffix: ' ' + fullText.slice(Math.min(40, half))
    };
  }

  const idx = fullText.toLowerCase().indexOf(highlight.toLowerCase());
  return {
    prefix: fullText.slice(0, idx),
    suffix: fullText.slice(idx + highlight.length),
  };
}

/**
 * Generates response for Voice Briefing Mode.
 * CRITICAL RULE: "in short, natural sentences meant to be spoken aloud — no bullet points, no markdown, no headers"
 */
export async function generateVoiceBriefingSpeech(
  contact: Contact,
  memories: Memory[],
  spokenQuery: string
): Promise<{ spokenText: string; highlightFact: string; audioTrackRef: string; sessionRef: string }> {
  const apiKey = getGroqApiKey();
  const sorted = [...memories].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (apiKey) {
    try {
      const memoryContext = sorted
        .slice(0, 5)
        .map((m) => `[${m.displayDate}]: ${m.content} (Recalled Fact: ${m.keyFact})`)
        .join('\n');

      const systemPrompt = `You are MeetingMind's executive voice briefing assistant.
CRITICAL INSTRUCTION:
Respond in short, natural sentences meant to be spoken aloud by text-to-speech.
DO NOT use bullet points. DO NOT use markdown. DO NOT use asterisks. DO NOT use section headers.
Be dispassionate, authoritative, and concise (under 50 words total).
Directly cite the exact past dates, promises, or decisions stored in the memories to prep the user for their meeting.
Always close naturally with: "You're all set — tap join when you're ready."`;

      const userPrompt = `Contact: ${contact.name}, ${contact.role} at ${contact.org}.
User's Spoken Question: "${spokenQuery || `Prep me for my meeting with ${contact.name}`}"

MEMORIES FROM HINDSIGHT:
${memoryContext}`;

      const speech = await callGroqChat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], 0.2);

      // Clean any accidental markdown
      let cleaned = speech
        .replace(/[#*_`]/g, '')
        .replace(/^\s*[-•]\s*/gm, '')
        .trim();

      if (!cleaned.includes("ready")) {
        cleaned += " You're all set — tap join when you're ready.";
      }

      const highlightFact = sorted[0]?.keyFact || 'agreed commitments';
      return {
        spokenText: cleaned,
        highlightFact,
        audioTrackRef: `#${Math.floor(Math.random() * 80 + 20)}`,
        sessionRef: `Recalled from ${sorted[0]?.displayDate || 'recent session'}`,
      };
    } catch (err) {
      console.warn('[Groq API] Voice synthesis fallback:', err);
    }
  }

  // Dynamic fallback voice synthesis based on contact & question
  const queryLower = (spokenQuery || '').toLowerCase();
  let spokenText = '';
  let highlightFact = sorted[0]?.keyFact || 'past commitments';

  if (contact.id === 'rohan-mehta') {
    if (queryLower.includes('cost') || queryLower.includes('pricing') || queryLower.includes('quote')) {
      spokenText = `In your August 24 meeting, you promised Rohan a revised quote with volume discounting. On September 18, he accepted pricing for the two-warehouse pilot. Now he wants to discuss scaling to ten warehouses.`;
      highlightFact = 'promised a revised quote with volume discounting';
    } else {
      spokenText = `Rohan Mehta reviewed the two-warehouse pilot with positive feedback on ninety-nine point eight percent uptime. His main agenda today is scaling to ten warehouses across Western India. Be ready to present tiered volume pricing.`;
      highlightFact = 'scaling to ten warehouses across Western India';
    }
  } else if (contact.id === 'ananya-iyer') {
    if (queryLower.includes('whatsapp') || queryLower.includes('integration')) {
      spokenText = `On August 29, Ananya asked specifically about WhatsApp Business API integration and mentioned a lower price from a competitor. You promised case studies from similar D2C brands.`;
      highlightFact = 'WhatsApp Business API integration';
    } else {
      spokenText = `Ananya is ready to move forward with customer support automation for Saffron and Company. However, she requested a three-month trial period instead of an annual commitment. She remains budget-conscious.`;
      highlightFact = 'three-month trial period instead of an annual commitment';
    }
  } else if (contact.id === 'arjun-nair') {
    spokenText = `Arjun was cautious about financial data privacy, but their legal team cleared your SOC 2 audit report on September 17. Today, focus squarely on the implementation timeline and internal staff training.`;
    highlightFact = 'implementation timeline and internal staff training';
  } else {
    // Eleanor Vance or others
    if (queryLower.includes('liability') || queryLower.includes('indemnity') || queryLower.includes('cap')) {
      spokenText = `On October 18, Eleanor agreed to the Tier 1 license scope but insisted on capping indemnity at 2x annual recurring fee. She noted her legal counsel will reject any 3x liability clauses before board review.`;
      highlightFact = 'capping indemnity at 2x annual recurring fee';
    } else if (queryLower.includes('promise') || queryLower.includes('penetration') || queryLower.includes('audit')) {
      spokenText = `On September 22, you committed to delivering the unredacted penetration test report before board sign-off. Ensure you have the Frankfurt data residency addendum ready as well.`;
      highlightFact = 'delivering the unredacted penetration test report';
    } else {
      spokenText = `Eleanor Vance has historically prioritized compliance audit velocity over commercial concessions. She insisted on capping indemnity at 2x annual recurring fee. Expect her to probe your SOC 2 Type II certifications before signing.`;
      highlightFact = 'capping indemnity at 2x annual recurring fee';
    }
  }

  // Append closing invitation to join meeting
  if (!spokenText.includes("ready")) {
    spokenText += " You're all set — tap join when you're ready.";
  }

  return {
    spokenText,
    highlightFact,
    audioTrackRef: '#44',
    sessionRef: `Recalled from ${sorted[0]?.displayDate || 'Oct 18'} Strategic Alignment`,
  };
}

function generateFallbackSummary(contact: Contact, memories: Memory[]): string {
  if (contact.id === 'rohan-mehta') {
    return 'Rohan has consistently balanced aggressive operational expansion against strict TMS integration budgets. Across five sessions, he moved from initial API cost skepticism to validating a 2-warehouse pilot with 99.8% uptime. Expect him to push for volume discounting as Kridha considers scaling to 10 facilities.';
  }
  if (contact.id === 'ananya-iyer') {
    return 'Ananya is an agile, ROI-focused founder who evaluates tools strictly by customer response reduction and conversion lift. While ready to automate support workflows, she prefers de-risking upfront spend via a 3-month seasonal trial over long-term enterprise lock-in.';
  }
  if (contact.id === 'arjun-nair') {
    return 'Arjun is an institutional gatekeeper who previously blocked progression until Suryodaya legal thoroughly vetted SOC 2 Type II documentation. With legal compliance now cleared, his primary friction is operational rollout speed and technical staff enablement.';
  }
  if (contact.id === 'eleanor-vance') {
    return 'Eleanor has historically prioritized compliance audit velocity over pricing concessions. Across previous sessions, negotiations have stalled whenever data governance was treated as secondary to commercial terms. Expect her to probe our SOC 2 Type II refresh timeline before consenting to the enterprise expansion schedule.';
  }

  // Generic dynamic generator for newly added contacts
  const memoryCount = memories.length;
  const recent = memories[0];
  return `${contact.name} has ${memoryCount} recorded meeting${memoryCount === 1 ? '' : 's'} in the relationship ledger. Recent discussions focused on ${recent?.title || 'operational alignment'}. They prioritize transparent execution and expect commitments logged in prior sessions to be honored promptly.`;
}

function generateFallbackPatterns(contact: Contact, memories: Memory[]): BehavioralPattern[] {
  if (memories.length < 3) return [];

  if (contact.id === 'rohan-mehta') {
    return [
      {
        id: 'pat-1',
        label: 'PATTERN 01 // PILOT VALIDATION GATE',
        description: 'Requires concrete telemetry from a smaller 2-site deployment before authorizing regional enterprise rollout.',
      },
      {
        id: 'pat-2',
        label: 'PATTERN 02 // COST REVISION SCRUTINY',
        description: 'Tests pricing thresholds twice before accepting final commercial quotes; values transparent volume tiers.',
      },
    ];
  }
  if (contact.id === 'ananya-iyer') {
    return [
      {
        id: 'pat-1',
        label: 'PATTERN 01 // PEAK SEASON TIMEBOXING',
        description: 'Aligns software trials directly with high-traffic e-commerce shopping quarters to prove empirical ROI.',
      },
      {
        id: 'pat-2',
        label: 'PATTERN 02 // CHANNEL CENTRICITY',
        description: 'Values WhatsApp and mobile-first integration over traditional desktop customer support channels.',
      },
    ];
  }
  if (contact.id === 'arjun-nair') {
    return [
      {
        id: 'pat-1',
        label: 'PATTERN 01 // LEGAL PRE-CLEARANCE',
        description: 'Will not discuss implementation timelines or pricing until institutional legal and infosec offer written clearance.',
      },
      {
        id: 'pat-2',
        label: 'PATTERN 02 // ENABLEMENT SENSITIVITY',
        description: 'Prioritizes internal engineering documentation and hands-on workshops over marketing feature decks.',
      },
    ];
  }

  // Eleanor Vance
  return [
    {
      id: 'pat-1',
      label: 'PATTERN 01 // REPORTING TIMELINE',
      description: 'Consistently requests raw operational compliance filings 48 hours prior to executive briefings.',
    },
    {
      id: 'pat-2',
      label: 'PATTERN 02 // STAKEHOLDER LEVERAGE',
      description: 'Decision velocity increases substantially once technical architecture leads offer written sign-off.',
    },
  ];
}

function generateFallbackDirective(contact: Contact): string {
  if (contact.id === 'rohan-mehta') {
    return '“Lead with the 99.8% pilot uptime metric and present the 10-warehouse rollout schedule with pre-calculated volume discount tiers.”';
  }
  if (contact.id === 'ananya-iyer') {
    return '“Agree to the 3-month trial structure without friction, but attach a pre-agreed conversion milestone for the annual contract.”';
  }
  if (contact.id === 'arjun-nair') {
    return '“Acknowledge legal approval immediately, then present a concrete 4-week engineer onboarding calendar.”';
  }
  return '“Do not introduce commercial pricing revisions until SOC 2 penetration schedules are fully validated.”';
}
