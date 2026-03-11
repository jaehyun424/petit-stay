import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Inbox, CheckCircle2, XCircle } from 'lucide-react';
import { SitterV2Layout } from '../../../components/layout/SitterV2Layout';

interface BookingRequest {
  id: string;
  parentName: string;
  date: string;
  time: string;
  childAge: string;
  location: string;
  estimatedEarning: number;
  status: 'pending' | 'confirmed' | 'declined';
  receivedAt: string;
}

const demoRequests: BookingRequest[] = [
  {
    id: 'REQ-001',
    parentName: 'Emily Richardson',
    date: '2026-03-14',
    time: '18:00 – 22:00',
    childAge: '4',
    location: 'Four Seasons Seoul, Room 801',
    estimatedEarning: 140000,
    status: 'pending',
    receivedAt: '2h ago',
  },
  {
    id: 'REQ-002',
    parentName: 'Kenji Tanaka',
    date: '2026-03-15',
    time: '19:00 – 23:00',
    childAge: '6',
    location: 'JW Marriott Dongdaemun, 1502',
    estimatedEarning: 140000,
    status: 'pending',
    receivedAt: '5h ago',
  },
  {
    id: 'REQ-003',
    parentName: 'Sarah Mitchell',
    date: '2026-03-12',
    time: '18:00 – 22:00',
    childAge: '5',
    location: 'Grand Hyatt Seoul, 1204',
    estimatedEarning: 140000,
    status: 'confirmed',
    receivedAt: '1d ago',
  },
  {
    id: 'REQ-004',
    parentName: 'Lin Wei',
    date: '2026-03-10',
    time: '18:00 – 21:00',
    childAge: '3',
    location: 'Lotte Hotel Seoul, 912',
    estimatedEarning: 105000,
    status: 'declined',
    receivedAt: '3d ago',
  },
];

export default function SitterRequests() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const [requests, setRequests] = useState(demoRequests);
  const pending = requests.filter((r) => r.status === 'pending');
  const handled = requests.filter((r) => r.status !== 'pending');

  const handleAction = (id: string, action: 'confirmed' | 'declined') => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r))
    );
  };

  return (
    <SitterV2Layout
      title="Booking Requests"
      titleKo="예약 요청함"
      pendingRequests={pending.length}
    >
      {/* Pending */}
      {pending.length > 0 && (
        <>
          <h3 className="st-card-title" style={{ margin: 0 }}>
            {isKo ? `새로운 예약 요청이 있어요 (${pending.length})` : `New Requests (${pending.length})`}
          </h3>
          {pending.map((req) => (
            <div key={req.id} className="st-request-card">
              <div className="st-request-header">
                <span className="st-request-parent">{req.parentName}</span>
                <span className="st-request-time">{req.receivedAt}</span>
              </div>
              <div className="st-request-details">
                <div className="st-request-row">
                  <span className="st-request-label">{isKo ? '날짜' : 'Date'}</span>
                  <span className="st-request-value">{req.date}</span>
                </div>
                <div className="st-request-row">
                  <span className="st-request-label">{isKo ? '시간' : 'Time'}</span>
                  <span className="st-request-value">{req.time}</span>
                </div>
                <div className="st-request-row">
                  <span className="st-request-label">{isKo ? '아이 나이' : 'Child age'}</span>
                  <span className="st-request-value">{req.childAge}{isKo ? '세' : 'y'}</span>
                </div>
                <div className="st-request-row">
                  <span className="st-request-label">{isKo ? '숙소' : 'Location'}</span>
                  <span className="st-request-value">{req.location}</span>
                </div>
                <div className="st-request-row">
                  <span className="st-request-label">{isKo ? '예상 수입' : 'Est. earnings'}</span>
                  <span className="st-request-earning">₩{req.estimatedEarning.toLocaleString()}</span>
                </div>
              </div>
              <div className="st-request-actions">
                <button
                  className="st-request-btn st-btn-decline"
                  onClick={() => handleAction(req.id, 'declined')}
                >
                  <XCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                  {isKo ? '거절' : 'Decline'}
                </button>
                <button
                  className="st-request-btn st-btn-accept"
                  onClick={() => handleAction(req.id, 'confirmed')}
                >
                  <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                  {isKo ? '수락' : 'Accept'}
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Empty pending */}
      {pending.length === 0 && (
        <div className="st-empty">
          <Inbox size={40} />
          <p>{isKo ? '대기 중인 요청이 없어요' : 'No pending requests'}</p>
        </div>
      )}

      {/* Handled requests */}
      {handled.length > 0 && (
        <>
          <h3 className="st-card-title" style={{ margin: '0.5rem 0 0' }}>
            {isKo ? '처리된 요청' : 'Handled'}
          </h3>
          {handled.map((req) => (
            <div key={req.id} className="st-request-card" style={{ opacity: 0.75 }}>
              <div className="st-request-header">
                <span className="st-request-parent">{req.parentName}</span>
                <span className={`st-request-status ${req.status}`}>
                  {req.status === 'confirmed'
                    ? (isKo ? '수락됨' : 'Confirmed')
                    : (isKo ? '거절됨' : 'Declined')}
                </span>
              </div>
              <div className="st-request-details">
                <div className="st-request-row">
                  <span className="st-request-label">{isKo ? '날짜' : 'Date'}</span>
                  <span className="st-request-value">{req.date}</span>
                </div>
                <div className="st-request-row">
                  <span className="st-request-label">{isKo ? '시간' : 'Time'}</span>
                  <span className="st-request-value">{req.time}</span>
                </div>
                <div className="st-request-row">
                  <span className="st-request-label">{isKo ? '예상 수입' : 'Est. earnings'}</span>
                  <span className="st-request-value">₩{req.estimatedEarning.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </SitterV2Layout>
  );
}
