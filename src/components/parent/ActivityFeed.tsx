
import { useTranslation } from 'react-i18next';
import { Palette, Utensils, Moon, FileText, Camera } from 'lucide-react';
import { Card, CardBody } from '../common/Card';

export interface ActivityLog {
    id: string;
    timestamp: Date;
    type: 'photo' | 'status' | 'meal' | 'nap' | 'incident' | 'checkin';
    content: string;
    metadata?: {
        mood?: string;
        photoUrl?: string;
        subtext?: string;
    };
}

const TYPE_ICON: Record<string, typeof Palette> = {
    status: Palette,
    meal: Utensils,
    nap: Moon,
    checkin: FileText,
    photo: Camera,
};

interface ActivityFeedProps {
    logs: ActivityLog[];
    className?: string;
}

export function ActivityFeed({ logs, className = '' }: ActivityFeedProps) {
    const { t } = useTranslation();

    if (logs.length === 0) {
        return (
            <div className={`text-center py-8 text-charcoal-400 ${className}`}>
                <p>{t('activityFeed.noUpdates')}</p>
            </div>
        );
    }

    return (
        <div className={`activity-feed ${className}`}>
            {logs.map((log, index) => {
                const Icon = TYPE_ICON[log.type] || FileText;
                return (
                    <div key={log.id} className="feed-item">
                        {/* Time Column */}
                        <div className="feed-time">
                            <span className="time-text">
                                {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {/* Timeline Line/Node */}
                        <div className="feed-timeline">
                            <div className={`timeline-node node-${log.type}`}>
                                <Icon size={10} strokeWidth={2} />
                            </div>
                            {index !== logs.length - 1 && <div className="timeline-line" />}
                        </div>

                        {/* Content Card */}
                        <div className="feed-content">
                            {log.type === 'photo' && log.metadata?.photoUrl ? (
                                <Card className="mb-4 overflow-hidden" padding="none">
                                    <img
                                        src={log.metadata.photoUrl}
                                        alt={t('activityFeed.activityUpdate')}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-3 bg-white">
                                        <p className="text-charcoal-900 font-medium text-sm">{log.content}</p>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="mb-4" padding="sm">
                                    <CardBody>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-charcoal-900 font-medium text-sm">{log.content}</p>
                                                {log.metadata?.subtext && (
                                                    <p className="text-charcoal-500 text-xs mt-1">{log.metadata.subtext}</p>
                                                )}
                                            </div>
                                            {log.metadata?.mood && (
                                                <span className="text-xl" role="img" aria-label="mood">
                                                    {log.metadata.mood}
                                                </span>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            )}
                        </div>
                    </div>
                );
            })}

            <style>{`
                .activity-feed {
                    position: relative;
                    padding-left: 1rem;
                }

                .feed-item {
                    display: flex;
                    gap: 1rem;
                    min-height: 4rem;
                }

                .feed-time {
                    width: 3rem;
                    padding-top: 0.25rem;
                    text-align: right;
                    flex-shrink: 0;
                }

                .time-text {
                    font-size: 0.75rem;
                    color: var(--charcoal-400);
                    font-weight: 500;
                }

                .feed-timeline {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 1.5rem;
                    flex-shrink: 0;
                }

                .timeline-node {
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid var(--charcoal-300);
                    z-index: 2;
                    margin-top: 0.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--charcoal-500);
                }

                .node-photo { border-color: var(--gold-500); background: var(--gold-500); color: white; }
                .node-meal { border-color: #10B981; color: #10B981; }
                .node-nap { border-color: #8B5CF6; color: #8B5CF6; }
                .node-incident { border-color: #EF4444; color: #EF4444; }
                .node-checkin { border-color: var(--charcoal-900); background: var(--charcoal-900); color: white; }
                .node-status { border-color: var(--gold-400); color: var(--gold-500); }

                .timeline-line {
                    position: absolute;
                    top: 1.5rem;
                    bottom: -1rem; /* Connect to next node */
                    width: 1px;
                    background: var(--cream-300);
                    z-index: 1;
                }

                .feed-content {
                    flex: 1;
                    padding-bottom: 1rem;
                }
            `}</style>
        </div>
    );
}
