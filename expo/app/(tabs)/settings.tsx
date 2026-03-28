import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Crown, Trash2, ExternalLink } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { restorePurchases } from '@/services/iap';
import Colors from '@/constants/colors';

export default function SettingsScreen() {
  const {
    proEntitled,
    entitlementSource,
    daily,
    settings,
    updateSettings,
    setEntitlement,
  } = useAppStore();



  const handleRestore = async () => {
    try {
      const result = await restorePurchases();
      if (result.success && result.source) {
        setEntitlement(true, result.source);
        Alert.alert('Success', 'Purchases restored successfully!');
      } else {
        Alert.alert('No Purchases', 'No previous purchases found.');
      }
    } catch (err) {
      console.error('[Settings] Restore error:', err);
      Alert.alert('Error', 'Failed to restore purchases.');
    }
  };

  const handleEraseMemory = () => {
    Alert.alert(
      'Erase Memory',
      'This will delete all stored conversation context. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Erase', style: 'destructive', onPress: () => {} },
      ]
    );
  };



  const resetTime = new Date(daily.resetAtISO).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <LinearGradient
      colors={[Colors.backgroundGradientStart, Colors.backgroundGradientEnd]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Settings',
        }}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Crown size={20} color={proEntitled ? Colors.success : Colors.mutedText} />
            <Text style={styles.statusText}>
              {proEntitled ? `Briefly Pro (${entitlementSource})` : 'Free Plan'}
            </Text>
          </View>

          {!proEntitled && (
            <View style={styles.benefitsList}>
              <Text style={styles.benefitTitle}>Upgrade to Pro for:</Text>
              <Text style={styles.benefit}>• Unlimited chat & prompts</Text>
              <Text style={styles.benefit}>• 20 file/URL summaries per day</Text>
              <Text style={styles.benefit}>• Voice replies & memory</Text>
              <Text style={styles.benefit}>• Faster responses</Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleRestore}>
            <Text style={styles.buttonText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Model</Text>
        
        <View style={styles.card}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Using OpenAI GPT-4o-mini</Text>
            <Text style={styles.infoSubtext}>Fast, reliable responses powered by our secure proxy</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Memory</Text>
              <Text style={styles.settingDescription}>
                {proEntitled ? 'Remember context across chats' : 'Pro only'}
              </Text>
            </View>
            <Switch
              value={settings.memoryEnabled}
              onValueChange={(value) => updateSettings({ memoryEnabled: value })}
              disabled={!proEntitled}
              trackColor={{ false: Colors.border, true: Colors.accent }}
            />
          </View>

          {settings.memoryEnabled && proEntitled && (
            <TouchableOpacity style={styles.dangerButton} onPress={handleEraseMemory}>
              <Trash2 size={16} color={Colors.error} />
              <Text style={styles.dangerButtonText}>Erase All Memory</Text>
            </TouchableOpacity>
          )}

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Voice Replies</Text>
              <Text style={styles.settingDescription}>
                {proEntitled ? 'Hear responses aloud' : 'Pro only'}
              </Text>
            </View>
            <Switch
              value={settings.voiceEnabled}
              onValueChange={(value) => updateSettings({ voiceEnabled: value })}
              disabled={!proEntitled}
              trackColor={{ false: Colors.border, true: Colors.accent }}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usage</Text>
        
        <View style={styles.card}>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Chat messages</Text>
            <Text style={styles.usageValue}>
              {proEntitled ? 'Unlimited' : `${daily.chatCount}/10`}
            </Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Prompts</Text>
            <Text style={styles.usageValue}>
              {proEntitled ? 'Unlimited' : `${daily.promptCount}/3`}
            </Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>File summaries</Text>
            <Text style={styles.usageValue}>
              {proEntitled ? `${daily.fileSummaryCount}/20` : `${daily.fileSummaryCount}/2`}
            </Text>
          </View>
          <Text style={styles.resetText}>Resets at {resetTime}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <ExternalLink size={16} color={Colors.mutedText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <ExternalLink size={16} color={Colors.mutedText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>Support</Text>
            <ExternalLink size={16} color={Colors.mutedText} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: Colors.mutedText,
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(20, 27, 32, 0.8)',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  benefitsList: {
    gap: 8,
  },
  benefitTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  benefit: {
    color: Colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  radioText: {
    color: Colors.text,
    fontSize: 15,
  },
  infoBox: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  infoText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  infoSubtext: {
    color: Colors.mutedText,
    fontSize: 12,
    lineHeight: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  settingDescription: {
    color: Colors.mutedText,
    fontSize: 13,
    marginTop: 2,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  dangerButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageLabel: {
    color: Colors.text,
    fontSize: 15,
  },
  usageValue: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  resetText: {
    color: Colors.mutedText,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkText: {
    color: Colors.text,
    fontSize: 15,
  },
  version: {
    color: Colors.mutedText,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
