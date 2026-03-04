
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';

interface SignaturePadProps {
    className?: string;
    onEnd?: () => void;
}

export interface SignaturePadRef {
    clear: () => void;
    isEmpty: () => boolean;
    toDataURL: () => string;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(({
    className = '',
    onEnd
}, ref) => {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useImperativeHandle(ref, () => ({
        clear: () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    setHasSignature(false);
                }
            }
        },
        isEmpty: () => !hasSignature,
        toDataURL: () => {
            return canvasRef.current?.toDataURL() || '';
        }
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size to match display size
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#1C1C1C'; // Charcoal
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        if (onEnd) onEnd();
    };

    return (
        <div className={`signature-pad-wrapper ${className}`}>
            <canvas
                ref={canvasRef}
                className="signature-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <div className="signature-line" />
            <div className="signature-label">{t('common.signHere')}</div>
            <style>{`
                .signature-pad-wrapper {
                    position: relative;
                    width: 100%;
                    height: 200px;
                    background: #F9F9F7; /* Cream */
                    border: 1px solid #E5E5E5;
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .signature-canvas {
                    width: 100%;
                    height: 100%;
                    touch-action: none;
                }

                .signature-line {
                    position: absolute;
                    bottom: 40px;
                    left: 20px;
                    right: 20px;
                    height: 1px;
                    background-color: #C5A059; /* Gold */
                    opacity: 0.5;
                    pointer-events: none;
                }

                .signature-label {
                    position: absolute;
                    bottom: 10px;
                    left: 0;
                    right: 0;
                    text-align: center;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: #9CA3AF;
                    pointer-events: none;
                    letter-spacing: 0.1em;
                }
            `}</style>
        </div>
    );
});

SignaturePad.displayName = 'SignaturePad';
