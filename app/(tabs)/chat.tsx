import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack } from 'expo-router';
import { MessageCircle, Send, Paperclip, Mic } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import * as DocumentPicker from 'expo-document-picker';
import { useAppStore } from '@/store/useAppStore';
import { chat } from '@/services/providers';
import Colors from '@/constants/colors';
import type { Message } from '@/types';
import PaywallModal from '@/components/PaywallModal';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [composerHeight, setComposerHeight] = useState(80);
  const [showPaywall, setShowPaywall] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  const { 
    proEntitled, 
    daily, 
    settings, 
    incrementUsage, 
    canUseFeature,
    checkAndResetDaily 
  } = useAppStore();

  useEffect(() => {
    checkAndResetDaily();
  }, [checkAndResetDaily]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!canUseFeature('chat')) {
      setShowPaywall(true);
      return;
    }

    const userText = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      createdAt: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      text: '',
      createdAt: Date.now() + 1,
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      incrementUsage('chat');

      const response = await chat({
        provider: settings.provider,
        messages: [...messages, userMessage],
        onStream: (chunk) => {
          setStreamingText(prev => prev + chunk);
        },
      });

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessageId ? { ...m, text: response } : m
        )
      );
      setStreamingText('');
    } catch (error: any) {
      console.error('[Chat] Error:', error);
      
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessageId
            ? { ...m, text: `Error: ${error.message || 'Failed to get response. Please try again.'}` }
            : m
        )
      );
      setStreamingText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttach = async () => {
    if (!canUseFeature('fileSummary')) {
      setShowPaywall(true);
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const maxSize = proEntitled ? 25 * 1024 * 1024 : 5 * 1024 * 1024;

        if (file.size && file.size > maxSize) {
          Alert.alert(
            'File Too Large',
            proEntitled
              ? 'File must be under 25 MB.'
              : 'Upgrade to Pro to analyze files up to 25 MB.',
            [{ text: 'OK' }]
          );
          return;
        }

        setInput(`[Attached: ${file.name}]\n\nPlease summarize this document.`);
      }
    } catch (error) {
      console.error('[Chat] File picker error:', error);
    }
  };

  const handleVoice = () => {
    if (!canUseFeature('voice')) {
      setShowPaywall(true);
      return;
    }
    Alert.alert('Voice', 'Voice feature coming soon!');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const displayText = item.id === messages[messages.length - 1]?.id && streamingText
      ? streamingText
      : item.text;

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {isUser ? (
          <Text style={styles.messageText}>{displayText}</Text>
        ) : (
          <Markdown style={markdownStyles}>{displayText || '...'}</Markdown>
        )}
      </View>
    );
  };

  const usageText = proEntitled
    ? 'Pro'
    : `${daily.chatCount}/10 today`;

  return (
    <LinearGradient
      colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
      <Stack.Screen
        options={{
          title: 'Briefly',
          headerRight: () => (
            <View style={styles.headerRight}>
              <View style={styles.modelPill}>
                <Text style={styles.modelText}>
                  {settings.provider === 'openai' ? 'OpenAI' : 'Gemini'} · Fast
                </Text>
              </View>
              <View style={styles.usageDots}>
                <Text style={styles.usageText}>{usageText}</Text>
              </View>
            </View>
          ),
        }}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.messageList,
          { paddingBottom: composerHeight + insets.bottom + 8 }
        ]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={Colors.mutedText} />
            <Text style={styles.emptyTitle}>Start a conversation</Text>
            <Text style={styles.emptySubtitle}>
              Ask anything or use a prompt shortcut
            </Text>
          </View>
        }
      />

      <View
        onLayout={(e) => setComposerHeight(e.nativeEvent.layout.height)}
        style={[
          styles.composer,
          { paddingBottom: insets.bottom }
        ]}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Message Briefly..."
            placeholderTextColor={Colors.mutedText}
            multiline
            maxLength={2000}
          />
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAttach}
              disabled={isLoading}
            >
              <Paperclip size={20} color={Colors.mutedText} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleVoice}
              disabled={isLoading}
            >
              <Mic size={20} color={Colors.mutedText} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.background} />
              ) : (
                <Send size={20} color={Colors.background} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>

      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelPill: {
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modelText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  usageDots: {
    backgroundColor: Colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  usageText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600' as const,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '600' as const,
    marginTop: 16,
  },
  emptySubtitle: {
    color: Colors.mutedText,
    fontSize: 14,
    marginTop: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.accent,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.card,
  },
  messageText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 20,
  },
  composer: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    color: Colors.text,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  sendButton: {
    backgroundColor: Colors.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

const markdownStyles = {
  body: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  code_inline: {
    backgroundColor: Colors.background,
    color: Colors.accent,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
  },
  code_block: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
  },
  fence: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
  },
};
