import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, collection, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Dashboard() {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Load current user profile from db
  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUserProfile(snap.data());
          }
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        }
      }
    };
    fetchProfile();
  }, []);

  // Listen to /dashboard/statistics and conversations collection in real-time
  useEffect(() => {
    const statsRef = doc(db, 'dashboard', 'statistics');
    const unsubStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        setStatsData(docSnap.data());
      } else {
        setStatsData(null);
      }
    }, (error) => {
      console.error("Failed to sync statistics:", error);
    });

    const convsRef = collection(db, 'conversations');
    const unsubConvs = onSnapshot(convsRef, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data());
      });
      setConversations(list);
    }, (error) => {
      console.error("Failed to sync conversations:", error);
    });

    return () => {
      unsubStats();
      unsubConvs();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Progress Calculations
  const totalCount = conversations.length;
  const completedCount = conversations.filter(c => c.status === 'Consensus Reached').length;
  const round1Count = conversations.filter(c => c.status === 'Round 1 Active').length;
  const round2Count = conversations.filter(c => c.status === 'Round 2 Active').length;
  const round3Count = conversations.filter(c => c.status === 'Round 3 Active').length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const interpretKappa = (val) => {
    if (val === undefined || val === null) return 'No Data';
    if (val < 0) return 'Poor Agreement';
    if (val <= 0.20) return 'Slight Agreement';
    if (val <= 0.40) return 'Fair Agreement';
    if (val <= 0.60) return 'Moderate Agreement';
    if (val <= 0.80) return 'Substantial Agreement';
    return 'Almost Perfect Agreement';
  };

  // Fleiss Kappa Dial Circle Component
  const KappaRing = ({ value, label }) => {
    const displayVal = value !== undefined && value !== null ? Math.max(0, Math.min(1, value)) : 0;
    const radius = 46;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius; // ~289.02
    const strokeDashoffset = circumference - (displayVal * circumference);
    const interpretation = interpretKappa(value);

    let color = 'var(--text-muted)';
    if (value > 0.8) color = 'var(--color-toxic-absent)';
    else if (value > 0.6) color = 'var(--accent-color)';
    else if (value > 0.4) color = 'var(--color-risk-2)';
    else if (value > 0.2) color = 'var(--color-risk-1)';
    else if (value !== null) color = 'var(--color-toxic-present)';

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '24px',
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--border-radius-md)',
        flex: 1,
        minWidth: '200px'
      }}>
        <div style={{ position: 'relative', width: '110px', height: '110px' }}>
          <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="transparent"
              stroke="var(--border-color)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {value !== undefined && value !== null ? value.toFixed(2) : '--'}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</p>
          {value !== undefined && value !== null && (
            <span className="tag-absent" style={{
              display: 'inline-block',
              marginTop: '8px',
              fontSize: '11px',
              background: color + '22',
              borderColor: color + '55',
              color: color,
              padding: '2px 8px'
            }}>
              {interpretation}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Model F1 Accuracy Histogram Chart
  const F1AccuracyChart = ({ accuracy }) => {
    const models = [
      { key: 'gpt4', label: 'GPT-4', color: 'var(--accent-color)' },
      { key: 'gemini15', label: 'Gemini 1.5', color: 'var(--color-risk-2)' },
      { key: 'claude3', label: 'Claude 3', color: 'var(--color-risk-1)' }
    ];

    const svgWidth = 500;
    const svgHeight = 260;
    const chartTop = 30;
    const chartBottom = 210;
    const chartLeft = 50;
    const chartRight = 470;
    const chartWidth = chartRight - chartLeft;
    const chartHeight = chartBottom - chartTop;

    const levels = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

    return (
      <div style={{
        padding: '24px',
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--border-radius-md)',
        width: '100%',
        minHeight: '300px'
      }}>
        <h4 style={{ marginBottom: '16px', fontSize: '15px', color: 'var(--text-secondary)' }}>Model F1 Classification Accuracy</h4>
        <div style={{ position: 'relative', width: '100%' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%">
            {/* Grid lines */}
            {levels.map(level => {
              const y = chartBottom - (level * chartHeight);
              return (
                <g key={level}>
                  <line
                    x1={chartLeft}
                    y1={y}
                    x2={chartRight}
                    y2={y}
                    stroke="var(--border-color)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={chartLeft - 10}
                    y={y + 4}
                    fill="var(--text-muted)"
                    fontSize="11"
                    textAnchor="end"
                  >
                    {level.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {models.map((model, index) => {
              const val = accuracy?.[model.key] || 0;
              const barWidth = 50;
              const gap = (chartWidth - (models.length * barWidth)) / (models.length + 1);
              const x = chartLeft + gap + index * (barWidth + gap);
              const barHeight = val * chartHeight;
              const y = chartBottom - barHeight;

              return (
                <g key={model.key} className="chart-bar-group">
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={model.color}
                    rx="4"
                    opacity="0.8"
                    style={{
                      transition: 'all var(--transition-normal)',
                      transformOrigin: `${x + barWidth / 2}px ${chartBottom}px`,
                      cursor: 'pointer'
                    }}
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    fill="var(--text-primary)"
                    fontSize="12"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {val.toFixed(2)}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={chartBottom + 22}
                    fill="var(--text-secondary)"
                    fontSize="12"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {model.label}
                  </text>
                </g>
              );
            })}

            {/* X Axis */}
            <line
              x1={chartLeft}
              y1={chartBottom}
              x2={chartRight}
              y2={chartBottom}
              stroke="var(--border-color)"
              strokeWidth="1.5"
            />
            {/* Y Axis */}
            <line
              x1={chartLeft}
              y1={chartTop}
              x2={chartLeft}
              y2={chartBottom}
              stroke="var(--border-color)"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', background: 'var(--bg-primary)', minHeight: '100vh', boxSizing: 'border-box' }}>
      <style>{`
        .chart-bar-group rect:hover {
          opacity: 1 !important;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.15));
        }
      `}</style>

      {/* Navigation Header */}
      <header className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        marginBottom: '24px'
      }}>
        <h2>Analytics Dashboard</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={() => navigate('/workspace')} style={{ padding: '8px 16px', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            Workspace
          </button>
          {userProfile?.role === 'Admin' && (
            <button onClick={() => navigate('/admin')} style={{ padding: '8px 16px', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
              Admin Panel
            </button>
          )}
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            Log Out
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Row 1: Dataset Consensus Completion Gauge */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>Evaluation Progress Gauge</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '-8px' }}>
            Real-time consensus ratio: percentage of dataset conversations that have successfully reached a finalized verdict.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Horizontal Glass Progress Bar */}
            <div style={{
              flex: 1,
              height: '24px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
              minWidth: '280px'
            }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, var(--accent-color), hsl(270, 90%, 65%))',
                borderRadius: '12px',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 12px var(--accent-color)'
              }} />
            </div>
            
            {/* Big Percent Indicator */}
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {progressPercent}%
            </div>
          </div>

          {/* Counts Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            marginTop: '8px'
          }}>
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>TOTAL DATASET</p>
              <h4 id="metric-total-dataset" style={{ fontSize: '22px', marginTop: '4px' }}>{totalCount}</h4>
            </div>
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>ROUND 1 ACTIVE</p>
              <h4 id="metric-round1-count" style={{ fontSize: '22px', marginTop: '4px' }}>{round1Count}</h4>
            </div>
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>ROUND 2 ACTIVE</p>
              <h4 id="metric-round2-count" style={{ fontSize: '22px', marginTop: '4px' }}>{round2Count}</h4>
            </div>
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', borderRadius: 'var(--border-radius-sm)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>ROUND 3 ACTIVE</p>
              <h4 id="metric-round3-count" style={{ fontSize: '22px', marginTop: '4px' }}>{round3Count}</h4>
            </div>
            <div style={{ padding: '16px', background: 'var(--color-toxic-absent-bg)', border: '1px solid var(--color-toxic-absent-border)', borderRadius: 'var(--border-radius-sm)' }}>
              <p style={{ color: 'var(--color-toxic-absent)', fontSize: '12px', fontWeight: 600 }}>CONSENSUS REACHED</p>
              <h4 id="metric-consensus-count" style={{ fontSize: '22px', marginTop: '4px', color: 'var(--color-toxic-absent)' }}>{completedCount}</h4>
            </div>
          </div>
        </div>

        {/* Row 2: Ingested Comparative Statistics */}
        {!statsData ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '12px' }}>Comparative Agreement Charts</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
              No precalculated model agreement statistics loaded. An administrator can upload a statistics JSON file in the Admin Panel to populate Fleiss' Kappa and F1 charts.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px'
          }}>
            {/* Chart Card A: Fleiss' Kappa Agreement Rings */}
            <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3>Inter-annotator Agreement (Fleiss' Kappa)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '-8px' }}>
                Fleiss' Kappa metric values representing agreement quality between language models vs human experts.
              </p>
              
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '8px' }}>
                <KappaRing
                  value={statsData.kappa_statistics?.fleiss_kappa?.model_agreement}
                  label="Model-to-Model Agreement"
                />
                <KappaRing
                  value={statsData.kappa_statistics?.fleiss_kappa?.evaluator_agreement}
                  label="Human Evaluators Agreement"
                />
              </div>
            </div>

            {/* Chart Card B: Model F1 Histogram */}
            <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3>Model Classification Performance</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '-8px' }}>
                Weighted F1 performance scores comparing target LLM classification verdicts with the expert gold standard dataset.
              </p>
              
              <div style={{ marginTop: '8px' }}>
                <F1AccuracyChart accuracy={statsData.kappa_statistics?.model_accuracy} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
