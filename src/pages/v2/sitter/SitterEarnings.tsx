import { useTranslation } from 'react-i18next';
import { SitterV2Layout } from '../../../components/layout/SitterV2Layout';

const FEE_RATE = 0.18; // 18% platform fee

const monthlyData = [
  { month: 'Oct', monthKo: '10월', amount: 320000 },
  { month: 'Nov', monthKo: '11월', amount: 480000 },
  { month: 'Dec', monthKo: '12월', amount: 560000 },
  { month: 'Jan', monthKo: '1월', amount: 420000 },
  { month: 'Feb', monthKo: '2월', amount: 640000 },
  { month: 'Mar', monthKo: '3월', amount: 480000 },
];

const earningItems = [
  { date: '2026-03-10', parent: 'Lin Wei', hours: 3, gross: 105000 },
  { date: '2026-03-08', parent: 'Sarah Mitchell', hours: 4, gross: 140000 },
  { date: '2026-03-05', parent: 'Yuki Suzuki', hours: 4, gross: 140000 },
  { date: '2026-03-01', parent: 'Robert Harris', hours: 3, gross: 105000 },
];

export default function SitterEarnings() {
  const { i18n } = useTranslation();
  const isKo = i18n.language === 'ko';

  const maxAmount = Math.max(...monthlyData.map((m) => m.amount));
  const totalNet = earningItems.reduce((sum, e) => sum + Math.round(e.gross * (1 - FEE_RATE)), 0);

  return (
    <SitterV2Layout
      title="Earnings"
      titleKo="수입"
      pendingRequests={2}
    >
      {/* Total */}
      <div className="st-card">
        <div className="st-earnings-total">
          <div className="st-earnings-amount">₩{totalNet.toLocaleString()}</div>
          <div className="st-earnings-period">
            {isKo ? '이번 달 순수입' : 'Net earnings this month'}
          </div>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="st-card">
        <h3 className="st-card-title">{isKo ? '월별 수입' : 'Monthly Earnings'}</h3>
        <div className="st-chart">
          {monthlyData.map((m, i) => {
            const height = maxAmount > 0 ? (m.amount / maxAmount) * 100 : 0;
            const isCurrent = i === monthlyData.length - 1;
            return (
              <div key={m.month} className="st-chart-bar-wrapper">
                <div
                  className={`st-chart-bar ${isCurrent ? 'current' : ''}`}
                  style={{ height: `${height}%` }}
                />
                <span className="st-chart-label">{isKo ? m.monthKo : m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Itemized earnings */}
      <div className="st-card">
        <h3 className="st-card-title">{isKo ? '건별 내역' : 'Transactions'}</h3>
        {earningItems.map((item, i) => {
          const fee = Math.round(item.gross * FEE_RATE);
          const net = item.gross - fee;
          return (
            <div key={i} className="st-earning-item">
              <div className="st-earning-left">
                <span className="st-earning-parent">{item.parent}</span>
                <span className="st-earning-date">
                  {item.date} · {item.hours}{isKo ? '시간' : 'h'}
                </span>
              </div>
              <div className="st-earning-right">
                <span className="st-earning-gross">₩{item.gross.toLocaleString()}</span>
                <span className="st-earning-fee">
                  {isKo ? '수수료' : 'Fee'} -₩{fee.toLocaleString()}
                </span>
                <span className="st-earning-net">₩{net.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </SitterV2Layout>
  );
}
