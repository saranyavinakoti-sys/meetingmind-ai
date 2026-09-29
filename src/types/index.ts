export interface Contact {
  id: string;
  name: string;
  role: string;
  org: string;
  category: 'clients' | 'advisory';
  lastMeeting: string;
  hasFollowup: boolean;
  followupSummary?: string;
  location?: string;
  email?: string;
  directReports?: number;
  engagementScore?: number;
  cadence?: string;
  statusText?: string;
  isPriority?: boolean;
  meetingLink?: string;
}

export interface Memory {
  id: string;
  contactId: string;
  timestamp: string;
  displayDate: string;
  title: string;
  content: string;
  type: 'discussion' | 'promise' | 'followup' | 'general';
  keyFact?: string; // The specific fact to highlight in gold
  speaker?: string;
  subject?: string;
  durationMinutes?: number;
  confidence?: number;
}

export interface RecallCard {
  type: 'last_discussion' | 'promise' | 'followup';
  label: string;
  badge: string;
  badgeColor?: 'gold' | 'red' | 'neutral';
  textPrefix: string;
  keyHighlight: string;
  textSuffix: string;
  speakerOrAssigned?: string;
  subjectOrStatus?: string;
  sessionId?: string;
}

export interface BehavioralPattern {
  id: string;
  label: string;
  description: string;
}

export interface BriefingSynthesis {
  executiveSummary: string;
  consensusConfidence: number;
  stance: string;
  recommendedLeverage: string;
  patterns: BehavioralPattern[];
  tacticalDirective: string;
  recallCards: RecallCard[];
}

export interface UserSession {
  email: string;
  name: string;
  role: string;
  isLoggedIn: boolean;
}

export interface WeeklyFollowupItem {
  id: string;
  contactId: string;
  contactName: string;
  contactOrg: string;
  contactRole: string;
  title: string;
  detail: string;
  keyFact?: string;
  type: 'promise' | 'followup' | 'obligation';
  dueDate: string;
  duePeriod: 'Today' | 'In 48h' | 'This Week' | 'Pending Verification';
  urgency: 'critical' | 'high' | 'medium';
  actionOwner: string;
  status: 'pending' | 'in_progress' | 'resolved';
}

export interface WeeklyDigestReport {
  generatedAt: string;
  weekLabel: string;
  totalFollowups: number;
  criticalCount: number;
  executiveSummary: string;
  strategicOutlook: string;
  items: WeeklyFollowupItem[];
  riskPosture: {
    level: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
    dominantRisk: string;
  };
  recommendedSequencing: string[];
}

