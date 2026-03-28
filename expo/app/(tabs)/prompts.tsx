import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import * as Icons from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { PROMPT_TILES } from '@/constants/prompts';
import { chat } from '@/services/providers';
import Colors from '@/constants/colors';
import type { PromptTile } from '@/constants/prompts';
import PaywallModal from '@/components/PaywallModal';

type IconName = keyof typeof Icons;

export default function PromptsScreen() {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTile | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { canUseFeature, proEntitled, incrementUsage, settings } = useAppStore();

  const handlePromptPress = (prompt: PromptTile) => {
    if (prompt.requiresPro && !proEntitled) {
      Alert.alert(
        'Pro Feature',
        'This prompt requires a Pro subscription. Upgrade to unlock all prompts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => setShowPaywall(true) }
        ]
      );
      return;
    }

    if (!canUseFeature('prompt')) {
      Alert.alert(
        'Daily Limit Reached',
        'You\'ve reached your daily limit of 3 prompts. Upgrade to Pro for unlimited prompts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => setShowPaywall(true) }
        ]
      );
      return;
    }

    setSelectedPrompt(prompt);
    setInputValue('');
  };

  const handleSubmit = async () => {
    const userText = inputValue.trim();
    if (!userText || !selectedPrompt) return;

    setIsProcessing(true);

    try {
      const promptMessage = `${selectedPrompt.systemPrompt}\n\nUser input: ${userText}`;
      
      console.log('[Prompts] Sending prompt:', selectedPrompt.title);
      console.log('[Prompts] Full message:', promptMessage);
      
      const response = await chat({
        provider: settings.provider,
        messages: [
          {
            id: Date.now().toString(),
            role: 'user',
            text: promptMessage,
            createdAt: Date.now(),
          },
        ],
      });
      
      console.log('[Prompts] Response received:', response.substring(0, 100));
      
      incrementUsage('prompt');

      Alert.alert(
        selectedPrompt.title,
        response,
        [
          { text: 'OK', onPress: () => {
            setSelectedPrompt(null);
            setInputValue('');
          }}
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error('[Prompts] Error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to process prompt. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPromptTile = ({ item }: { item: PromptTile }) => {
    const IconComponent = (Icons as any)[item.icon as IconName];

    return (
      <TouchableOpacity
        style={styles.tile}
        onPress={() => handlePromptPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.tileContent}>
          {IconComponent && (
            <IconComponent size={24} color={Colors.accent} strokeWidth={2} />
          )}
          <View style={styles.tileText}>
            <Text style={styles.tileTitle}>{item.title}</Text>
            <Text style={styles.tileSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          </View>
          {item.requiresPro && (
            <View style={styles.proBadge}>
              <Text style={styles.proText}>PRO</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getInputPlaceholder = () => {
    if (!selectedPrompt) return '';
    
    switch (selectedPrompt.inputType) {
      case 'url':
        return 'Paste URL here...';
      case 'email':
        return 'Paste email here...';
      case 'file':
        return 'File picker coming soon...';
      case 'text':
      default:
        return 'Enter your text here...';
    }
  };

  return (
    <LinearGradient
      colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd]}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          title: 'Prompts',
        }}
      />

      <FlatList
        data={PROMPT_TILES}
        renderItem={renderPromptTile}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <Text style={styles.header}>Pick a shortcut and get instant results</Text>
        }
      />

      <Modal
        visible={selectedPrompt !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedPrompt(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedPrompt?.title}</Text>
            <Text style={styles.modalSubtitle}>{selectedPrompt?.subtitle}</Text>

            <TextInput
              style={styles.modalInput}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={getInputPlaceholder()}
              placeholderTextColor={Colors.mutedText}
              multiline
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setSelectedPrompt(null)}
                disabled={isProcessing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  (!inputValue.trim() || isProcessing) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!inputValue.trim() || isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color={Colors.background} />
                ) : (
                  <Text style={styles.submitButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    padding: 16,
  },
  row: {
    gap: 12,
  },
  header: {
    color: Colors.mutedText,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  tile: {
    flex: 1,
    backgroundColor: 'rgba(20, 27, 32, 0.8)',
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },
  tileContent: {
    flex: 1,
    gap: 12,
  },
  tileText: {
    flex: 1,
    gap: 4,
  },
  tileTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  tileSubtitle: {
    color: Colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  proBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  modalSubtitle: {
    color: Colors.mutedText,
    fontSize: 14,
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: Colors.background,
    color: Colors.text,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  submitButton: {
    backgroundColor: Colors.accent,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
