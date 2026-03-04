// ============================================
// Petit Stay - Brand Preview Component
// ============================================

import { useTranslation } from 'react-i18next';
import { Calendar, Bell, User } from 'lucide-react';
import type { HotelBranding } from '../../services/whiteLabel';

interface BrandPreviewProps {
  branding: HotelBranding;
}

export function BrandPreview({ branding }: BrandPreviewProps) {
  const { t } = useTranslation();

  return (
    <div
      className="brand-preview"
      style={{
        fontFamily: branding.fontFamily ? `"${branding.fontFamily}", sans-serif` : undefined,
        background: branding.secondaryColor,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Mini header */}
      <div
        className="brand-preview-header"
        style={{
          background: branding.primaryColor,
          color: '#fff',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.hotelName}
              style={{ width: 24, height: 24, borderRadius: '4px', objectFit: 'cover' }}
            />
          ) : null}
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{branding.hotelName}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', opacity: 0.7 }}>
          <Bell size={14} />
          <User size={14} />
        </div>
      </div>

      {/* Mini content area */}
      <div style={{ padding: '0.75rem 1rem' }}>
        {branding.tagline && (
          <p style={{ fontSize: '0.7rem', color: branding.primaryColor, opacity: 0.6, marginBottom: '0.5rem' }}>
            {branding.tagline}
          </p>
        )}

        {/* Mini stat cards */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {[
            { label: t('branding.previewBookings'), value: '12' },
            { label: t('branding.previewActive'), value: '3' },
            { label: t('branding.previewRating'), value: '4.8' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                background: '#fff',
                borderRadius: '6px',
                padding: '0.5rem',
                textAlign: 'center',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: branding.primaryColor }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#999' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mini button */}
        <button
          type="button"
          style={{
            width: '100%',
            padding: '0.5rem',
            background: branding.accentColor,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
          }}
        >
          <Calendar size={12} />
          {t('branding.previewNewBooking')}
        </button>
      </div>
    </div>
  );
}
