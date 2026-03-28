export type MessageRole = 'user' | 'assistant' | 'system';

export type Message = {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: number;
};

export type Attachment = {
  type: 'url' | 'file';
  uri: string;
  name?: string;
  mimeType?: string;
  size?: number;
};

export type ModelProvider = 'openai' | 'google';

export type EntitlementSource = 'weekly' | 'monthly' | 'lifetime' | null;

export type UsageMetrics = {
  chatCount: number;
  promptCount: number;
  fileSummaryCount: number;
  resetAtISO: string;
};

export type AppSettings = {
  provider: ModelProvider;
  memoryEnabled: boolean;
  voiceEnabled: boolean;
};
