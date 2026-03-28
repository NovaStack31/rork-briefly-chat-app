import axios from 'axios';
import { RUNTIME } from '@/config/runtime';
import type { Message, ModelProvider, Attachment } from '@/types';

export type ChatOptions = {
  provider: ModelProvider;
  messages: Message[];
  attachments?: Attachment[];
  onStream?: (chunk: string) => void;
};

const BASE_SYSTEM_PROMPT = 'You are Briefly, a concise and helpful assistant. Keep answers short by default. When asked to summarize, provide a 5-bullet TL;DR and a one-line takeaway. When asked to write, deliver clean structure with headings and short paragraphs. If a URL is provided, attempt to infer the topic from visible text; if uncertain, ask for clarification briefly.';

async function chatWithAI(options: ChatOptions): Promise<string> {
  const messages: { role: 'user' | 'assistant'; text: string }[] = [
    { role: 'user' as const, text: BASE_SYSTEM_PROMPT },
    { role: 'assistant' as const, text: 'Understood. I\'ll be concise and helpful.' },
    ...options.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      text: m.text,
    })),
  ];

  try {
    console.log('[AI] Calling Cloudflare Worker with', messages.length, 'messages');
    console.log('[AI] Last user message:', messages[messages.length - 1]?.text);
    
    const { data } = await axios.post(
      `${RUNTIME.BASE_URL}/v1/chat`,
      {
        provider: options.provider || RUNTIME.PROVIDER,
        model: RUNTIME.MODEL,
        messages: messages.map(m => ({ role: m.role, text: m.text })),
        temperature: 0.5,
        max_tokens: 800,
      },
      {
        timeout: 25000,
        headers: {
          'Content-Type': 'application/json',
          'x-briefly-app-key': RUNTIME.APP_KEY,
        },
      }
    );
    
    console.log('[AI] Response received successfully');
    
    if (!data || !data.text) {
      throw new Error('Empty response from AI');
    }
    
    const responseText = data.text;
    
    if (options.onStream) {
      await simulateStreaming(responseText, options.onStream);
    }
    
    return responseText;
  } catch (error: any) {
    console.error('[AI] Error occurred:', error?.message || 'Unknown error');
    
    if (error?.message?.includes('JSON') || error?.message?.includes('parse')) {
      throw new Error('AI service is temporarily unavailable. Please try again in a moment.');
    }
    
    throw new Error(error?.message || 'Failed to get response from AI. Please try again.');
  }
}

async function simulateStreaming(text: string, onStream: (chunk: string) => void): Promise<void> {
  const chunkSize = 3;
  const words = text.split(' ');
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ') + (i + chunkSize < words.length ? ' ' : '');
    onStream(chunk);
    await new Promise(resolve => setTimeout(resolve, 30));
  }
}

export async function chat(options: ChatOptions): Promise<string> {
  console.log(`[AI] Sending message...`);
  return chatWithAI(options);
}
