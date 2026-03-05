/**
 * Centralized image URL mapping for the Petit Stay platform.
 * All image URLs used across the site are defined here for easy management.
 */

export const IMAGES = {
  landing: {
    hero: 'https://images.unsplash.com/photo-1606868306217-dbf5046868d2?w=1920&q=80',
    feature: {
      safety: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      monitoring: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&q=80',
      hotel: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      nightCare: 'https://images.unsplash.com/photo-1590650046871-92c5da7d4e45?w=800&q=80',
    },
  },
  solutions: {
    families: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    hotels: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
    specialists: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=1200&q=80',
  },
  auth: {
    background: 'https://images.unsplash.com/photo-1606868306217-dbf5046868d2?w=1920&q=80',
    register: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  },
  info: {
    about: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
    careers: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
    press: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=1200&q=80',
  },
  testimonials: {
    background: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1920&q=80',
  },
} as const;

export type ImageKey = keyof typeof IMAGES;
