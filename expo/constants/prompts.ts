export type PromptTile = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  systemPrompt: string;
  inputType: 'url' | 'file' | 'text' | 'email';
  requiresPro?: boolean;
};

export const PROMPT_TILES: PromptTile[] = [
  {
    id: 'summarize-url',
    title: 'Summarize this URL',
    subtitle: 'Get a quick TL;DR from any link',
    icon: 'Link',
    systemPrompt: 'Summarize the following web content. Output: 5 bullets, 1 one-line takeaway, and 3 suggested follow-up actions. If the URL is paywalled or inaccessible, say so in one line.',
    inputType: 'url',
  },
  {
    id: 'youtube-tldr',
    title: 'YouTube TL;DR',
    subtitle: 'Extract key points from videos',
    icon: 'Youtube',
    systemPrompt: 'Provide a concise summary of this YouTube video. Include: main topic, 5 key points, and one-line conclusion.',
    inputType: 'url',
  },
  {
    id: 'email-reply',
    title: 'Email reply',
    subtitle: 'Draft professional responses',
    icon: 'Mail',
    systemPrompt: 'Draft a reply to the pasted email. Tone: {{tone}}. Output structure: Greeting, 1–2 concise paragraphs, bullet list if needed, closing and signature placeholder.',
    inputType: 'email',
  },
  {
    id: 'polish-writing',
    title: 'Polish my writing',
    subtitle: 'Improve clarity and flow',
    icon: 'Sparkles',
    systemPrompt: 'Polish the following text. Improve clarity, grammar, and flow while maintaining the original voice and intent. Keep it concise.',
    inputType: 'text',
  },
  {
    id: 'job-pitch',
    title: 'Job pitch',
    subtitle: 'Resume snippet → 150 words',
    icon: 'Briefcase',
    systemPrompt: 'Transform this resume snippet into a compelling 150-word job pitch. Focus on achievements, skills, and value proposition.',
    inputType: 'text',
  },
  {
    id: 'translate',
    title: 'Translate to English',
    subtitle: 'Quick translation from any language',
    icon: 'Languages',
    systemPrompt: 'Translate the following text to English. Maintain the original tone and nuance. If already in English, confirm and suggest improvements.',
    inputType: 'text',
  },
  {
    id: 'meeting-notes',
    title: 'Meeting notes → action items',
    subtitle: 'Extract tasks from notes',
    icon: 'ClipboardList',
    systemPrompt: 'Extract action items from these meeting notes. Format: bullet list with owner (if mentioned), task, and deadline (if mentioned).',
    inputType: 'text',
  },
  {
    id: 'explain-pdf',
    title: 'Explain a PDF',
    subtitle: 'Summarize documents',
    icon: 'FileText',
    systemPrompt: 'Summarize this document. Provide: main topic, key sections (3-5 bullets each), and practical takeaways.',
    inputType: 'file',
  },
  {
    id: 'study-notes',
    title: 'Study notes',
    subtitle: 'Socratic Q&A for learning',
    icon: 'GraduationCap',
    systemPrompt: 'Create study notes from this content. Include: key concepts, 5 practice questions with answers, and memory aids.',
    inputType: 'text',
    requiresPro: true,
  },
  {
    id: 'create-outline',
    title: 'Create outline',
    subtitle: 'Structure ideas from topic',
    icon: 'List',
    systemPrompt: 'Create a detailed outline for this topic. Include: introduction, 3-5 main sections with subsections, and conclusion.',
    inputType: 'text',
  },
  {
    id: 'bullet-tldr',
    title: 'Bullet TL;DR',
    subtitle: 'Condense to key points',
    icon: 'ListChecks',
    systemPrompt: 'Provide a bullet-point TL;DR. Maximum 7 bullets. Each bullet should be one clear, actionable insight.',
    inputType: 'text',
  },
  {
    id: 'faq-generator',
    title: 'FAQ generator',
    subtitle: 'Create FAQs from docs',
    icon: 'HelpCircle',
    systemPrompt: 'Generate 8-10 FAQs from this document. Format: Question (bold) followed by concise answer. Cover common user questions.',
    inputType: 'file',
  },
];
