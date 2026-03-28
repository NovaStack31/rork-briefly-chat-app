import type { EntitlementSource } from '@/types';

export type Product = {
  productId: string;
  title: string;
  description: string;
  price: string;
  type: 'subscription' | 'iap';
  trial?: string;
};

export const PRODUCTS: Product[] = [
  {
    productId: 'com.briefly.pro.weekly',
    title: 'Weekly Pro',
    description: 'Unlimited access, billed weekly',
    price: '$7.99',
    type: 'subscription',
    trial: '3 days',
  },
  {
    productId: 'com.briefly.pro.monthly',
    title: 'Monthly Pro',
    description: 'Unlimited access, billed monthly',
    price: '$21.99',
    type: 'subscription',
    trial: '3 days',
  },
  {
    productId: 'com.briefly.pro.lifetime',
    title: 'Lifetime Pro',
    description: 'One-time purchase, unlimited forever',
    price: '$79.99',
    type: 'iap',
  },
];

export async function initializeIAP(): Promise<void> {
  console.log('[IAP] Initializing (mock for Expo Go)...');
}

export async function getProducts(): Promise<Product[]> {
  console.log('[IAP] Fetching products (mock)...');
  return PRODUCTS;
}

export async function purchaseProduct(productId: string): Promise<{ success: boolean; source: EntitlementSource }> {
  console.log(`[IAP] Purchasing ${productId} (mock)...`);
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  let source: EntitlementSource = null;
  if (productId === 'com.briefly.pro.weekly') source = 'weekly';
  else if (productId === 'com.briefly.pro.monthly') source = 'monthly';
  else if (productId === 'com.briefly.pro.lifetime') source = 'lifetime';
  
  return { success: true, source };
}

export async function restorePurchases(): Promise<{ success: boolean; source: EntitlementSource }> {
  console.log('[IAP] Restoring purchases (mock)...');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { success: false, source: null };
}
