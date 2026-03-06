// ============================================
// Petit Stay - Document Uploader Component
// ============================================

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';
import { DEMO_MODE } from '../../hooks/common/useDemo';
import { storageService } from '../../services/storage';

export interface UploadedDocument {
    id: string;
    name: string;
    url: string;
    uploadedAt: Date;
    size: number;
}

interface DocumentUploaderProps {
    sitterId: string;
    documents: UploadedDocument[];
    onDocumentsChange: (docs: UploadedDocument[]) => void;
}

export function DocumentUploader({ sitterId, documents, onDocumentsChange }: DocumentUploaderProps) {
    const { t } = useTranslation();
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return;
        }

        // Validate type
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowed.includes(file.type)) {
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            let url = '';
            if (DEMO_MODE) {
                // Simulate upload
                for (let i = 0; i <= 100; i += 20) {
                    setProgress(i);
                    await new Promise((r) => setTimeout(r, 200));
                }
                url = `https://demo.petitstay.com/docs/${file.name}`;
            } else {
                url = await storageService.uploadSitterDocument(sitterId, file);
            }

            const newDoc: UploadedDocument = {
                id: `doc_${Date.now()}`,
                name: file.name,
                url,
                uploadedAt: new Date(),
                size: file.size,
            };
            onDocumentsChange([...documents, newDoc]);
        } catch {
            // upload error handled by UI state
        } finally {
            setUploading(false);
            setProgress(0);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleDelete = async (docId: string) => {
        onDocumentsChange(documents.filter((d) => d.id !== docId));
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="document-uploader">
            <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            <Button
                variant="secondary"
                fullWidth
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
            >
                {uploading ? `${progress}%` : t('profile.uploadDocument')}
            </Button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'center' }}>
                {t('profile.supportedFormats')}
            </p>

            {uploading && (
                <div style={{ marginTop: '0.5rem', height: 4, background: 'var(--border)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gold-500)', borderRadius: 2, transition: 'width 0.3s' }} />
                </div>
            )}

            {documents.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        {t('profile.documentsList')}
                    </h4>
                    {documents.map((doc) => (
                        <div key={doc.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                            marginBottom: '0.5rem', background: 'var(--surface)',
                        }}>
                            <div>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {doc.name}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                    {formatSize(doc.size)}
                                </span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                                {t('common.delete')}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
