// ============================================
// Petit Stay - White Label Branding Service
// ============================================

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// ----------------------------------------
// Types
// ----------------------------------------
export interface HotelBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  logoUrl: string;
  fontFamily: string;
  hotelName: string;
  tagline: string;
}

// ----------------------------------------
// Default Branding (Petit Stay defaults)
// ----------------------------------------
export const DEFAULT_BRANDING: HotelBranding = {
  primaryColor: '#1C1C1C',
  secondaryColor: '#F9F9F7',
  accentColor: '#C5A059',
  logo: '',
  logoUrl: '',
  fontFamily: 'Playfair Display',
  hotelName: 'Petit Stay',
  tagline: 'Premium Hotel Childcare',
};

// ----------------------------------------
// Approved Font Families
// ----------------------------------------
export const APPROVED_FONTS = [
  'Playfair Display',
  'Lato',
  'Montserrat',
  'Inter',
  'Noto Sans',
  'Noto Serif',
  'Roboto',
  'Open Sans',
  'Poppins',
  'Raleway',
];

// ----------------------------------------
// Fetch hotel branding from Firestore
// ----------------------------------------
export async function getHotelBranding(hotelId: string): Promise<HotelBranding> {
  try {
    const hotelDoc = await getDoc(doc(db, 'hotels', hotelId));
    if (!hotelDoc.exists()) return { ...DEFAULT_BRANDING };

    const data = hotelDoc.data();
    const branding = data.branding;
    if (!branding) return { ...DEFAULT_BRANDING, hotelName: data.name || DEFAULT_BRANDING.hotelName };

    return {
      primaryColor: branding.primaryColor || DEFAULT_BRANDING.primaryColor,
      secondaryColor: branding.secondaryColor || DEFAULT_BRANDING.secondaryColor,
      accentColor: branding.accentColor || DEFAULT_BRANDING.accentColor,
      logo: branding.logo || '',
      logoUrl: branding.logoUrl || '',
      fontFamily: branding.fontFamily || DEFAULT_BRANDING.fontFamily,
      hotelName: data.name || DEFAULT_BRANDING.hotelName,
      tagline: branding.tagline || DEFAULT_BRANDING.tagline,
    };
  } catch {
    return { ...DEFAULT_BRANDING };
  }
}

// ----------------------------------------
// Apply branding CSS custom properties
// ----------------------------------------
export function applyBranding(branding: HotelBranding): void {
  const root = document.documentElement;

  root.style.setProperty('--brand-primary', branding.primaryColor);
  root.style.setProperty('--brand-secondary', branding.secondaryColor);
  root.style.setProperty('--brand-accent', branding.accentColor);
  root.style.setProperty('--brand-font', branding.fontFamily);
}

// ----------------------------------------
// Clear branding (restore defaults)
// ----------------------------------------
export function clearBranding(): void {
  const root = document.documentElement;
  root.style.removeProperty('--brand-primary');
  root.style.removeProperty('--brand-secondary');
  root.style.removeProperty('--brand-accent');
  root.style.removeProperty('--brand-font');
}

// ----------------------------------------
// Upload brand logo to Firebase Storage
// ----------------------------------------
export async function uploadBrandLogo(hotelId: string, file: File): Promise<string> {
  const storageRef = ref(storage, `hotels/${hotelId}/brand-logo/${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);

  // Update hotel document with logo URL
  await updateDoc(doc(db, 'hotels', hotelId), {
    'branding.logo': file.name,
    'branding.logoUrl': downloadUrl,
    updatedAt: serverTimestamp(),
  });

  return downloadUrl;
}

// ----------------------------------------
// Save branding to Firestore
// ----------------------------------------
export async function saveBranding(hotelId: string, branding: Partial<HotelBranding>): Promise<void> {
  const updateData: Record<string, unknown> = { updatedAt: serverTimestamp() };

  if (branding.primaryColor !== undefined) updateData['branding.primaryColor'] = branding.primaryColor;
  if (branding.secondaryColor !== undefined) updateData['branding.secondaryColor'] = branding.secondaryColor;
  if (branding.accentColor !== undefined) updateData['branding.accentColor'] = branding.accentColor;
  if (branding.fontFamily !== undefined) updateData['branding.fontFamily'] = branding.fontFamily;
  if (branding.tagline !== undefined) updateData['branding.tagline'] = branding.tagline;

  await updateDoc(doc(db, 'hotels', hotelId), updateData);
}
