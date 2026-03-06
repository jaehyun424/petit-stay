/**
 * Centralized image URL mapping for the Petit Stay platform.
 * All image URLs used across the site are defined here for easy management.
 */

export const IMAGES = {
  landing: {
    hero: 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=1920&q=80',
    feature: {
      safety: 'https://images.unsplash.com/photo-1565843708714-52ecf69ab81f?w=800&q=80',
      monitoring: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=800&q=80',
      hotel: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
      nightCare: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    },
  },
  solutions: {
    families: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
    hotels: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
    specialists: 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=1200&q=80',
  },
  auth: {
    background: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=80',
    register: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
  },
  info: {
    about: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
    careers: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
    press: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=1200&q=80',
  },
  testimonials: {
    background: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1920&q=80',
  },
} as const;

export type ImageKey = keyof typeof IMAGES;
