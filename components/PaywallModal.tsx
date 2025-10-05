import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Sparkles, Zap, Infinity, Ban } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { getProducts, purchaseProduct, restorePurchases, type Product } from '@/services/iap';
import Colors from '@/constants/colors';

type PaywallModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('com.briefly.pro.weekly');
  const [isLoading, setIsLoading] = useState(false);
  const { setEntitlement } = useAppStore();

  useEffect(() => {
    if (visible) {
      loadProducts();
    }
  }, [visible]);

  const loadProducts = async () => {
    try {
      const prods = await getProducts();
      setProducts(prods);
    } catch (error) {
      console.error('[Paywall] Failed to load products:', error);
    }
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const result = await purchaseProduct(selectedProductId);
      if (result.success && result.source) {
        setEntitlement(true, result.source);
        Alert.alert('Success!', 'Welcome to Briefly Pro!', [
          { text: 'OK', onPress: onClose },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Purchase Failed', error.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const result = await restorePurchases();
      if (result.success && result.source) {
        setEntitlement(true, result.source);
        Alert.alert('Success', 'Purchases restored!', [
          { text: 'OK', onPress: onClose },
        ]);
      } else {
        Alert.alert('No Purchases', 'No previous purchases found.');
      }
    } catch (err) {
      console.error('[Paywall] Restore error:', err);
      Alert.alert('Error', 'Failed to restore purchases.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#0A0E13', '#0D1B1E', '#0A1612']}
          style={styles.gradientBg}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={Colors.mutedText} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[Colors.accent, Colors.accentDark]}
                  style={styles.iconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Sparkles size={40} color="#FFF" strokeWidth={2.5} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>GET <Text style={styles.titlePro}>PRO</Text> ACCESS</Text>
              <Text style={styles.subtitle}>
                Unlock unlimited AI conversations and advanced features
              </Text>
            </View>

            <View style={styles.benefits}>
              <BenefitRow icon={Infinity} text="Unlimited Chat Messages" subtitle="Never hit a limit again" />
              <BenefitRow icon={Zap} text="Answers From GPT-4" subtitle="More accurate & detailed answers" />
              <BenefitRow icon={Sparkles} text="Advanced AI Tools" subtitle="Access to elite features" />
              <BenefitRow icon={Ban} text="No Ads" subtitle="Enjoy distraction-free experience" />
            </View>

            <View style={styles.products}>
              {products.map(product => {
                const isSelected = selectedProductId === product.productId;
                const isMonthly = product.productId === 'com.briefly.pro.monthly';
                
                return (
                  <TouchableOpacity
                    key={product.productId}
                    style={[
                      styles.productCard,
                      isSelected && styles.productCardSelected,
                    ]}
                    onPress={() => setSelectedProductId(product.productId)}
                    activeOpacity={0.8}
                  >
                    {isMonthly && (
                      <View style={styles.saveBadgeTop}>
                        <Text style={styles.saveTextTop}>Save 40%</Text>
                      </View>
                    )}
                    <View style={styles.productContent}>
                      <View style={styles.productLeft}>
                        <View style={styles.radioOuter}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <View style={styles.productInfo}>
                          <Text style={styles.productTitle}>{product.title}</Text>
                          {product.trial && (
                            <Text style={styles.productTrial}>7 days Free Trial, Auto Renewal</Text>
                          )}
                        </View>
                      </View>
                      <Text style={styles.priceText}>{product.price}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.ctaButton, isLoading && styles.ctaButtonDisabled]}
              onPress={handlePurchase}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.accent, Colors.accentDark]}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.ctaText}>Try For Free</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.cancelText}>CANCEL ANYTIME</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <TouchableOpacity onPress={handleRestore}>
                <Text style={styles.footerLink}>Restore</Text>
              </TouchableOpacity>
              <Text style={styles.footerDivider}>|</Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Terms of Use</Text>
              </TouchableOpacity>
              <Text style={styles.footerDivider}>|</Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

function BenefitRow({ icon: Icon, text, subtitle }: { icon: any; text: string; subtitle: string }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitIcon}>
        <Icon size={24} color={Colors.text} strokeWidth={2} />
      </View>
      <View style={styles.benefitTextContainer}>
        <Text style={styles.benefitText}>{text}</Text>
        <Text style={styles.benefitSubtext}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  gradientBg: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  titlePro: {
    color: Colors.accent,
  },
  subtitle: {
    color: Colors.mutedText,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  benefits: {
    gap: 20,
    marginBottom: 40,
    backgroundColor: 'rgba(20, 27, 32, 0.6)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.1)',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTextContainer: {
    flex: 1,
    gap: 2,
  },
  benefitText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  benefitSubtext: {
    color: Colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  products: {
    gap: 12,
    marginBottom: 24,
  },
  productCard: {
    backgroundColor: 'rgba(20, 27, 32, 0.8)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: 'rgba(139, 149, 165, 0.2)',
    position: 'relative',
  },
  productCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  saveBadgeTop: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveTextTop: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  productContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent,
  },
  productInfo: {
    gap: 4,
  },
  productTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  productTrial: {
    color: Colors.mutedText,
    fontSize: 12,
  },
  priceText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700' as const,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  cancelText: {
    color: Colors.mutedText,
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  footerLink: {
    color: Colors.mutedText,
    fontSize: 12,
  },
  footerDivider: {
    color: Colors.mutedText,
    fontSize: 12,
  },
});
