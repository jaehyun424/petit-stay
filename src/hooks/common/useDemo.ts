// ============================================
// Petit Stay - Demo Mode Detection
// Shared utility for all hooks
// ============================================

import { auth } from '../../services/firebase';

// Mirror the same logic used in AuthContext.tsx
const isMockAuth = !auth || !auth.app;
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || isMockAuth;
