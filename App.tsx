import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Shield, 
  Cpu, 
  Globe, 
  Server, 
  Smartphone, 
  Zap,
  RefreshCw,
  LayoutDashboard,
  Terminal,
  Settings,
  BrainCircuit,
  Circle,
  Network,
  Grid3X3,
  Dna,
  Wifi,
  Radio,
  BarChart3,
  Radar,
  Database
} from 'lucide-react';
import NetworkGlobe from './components/NetworkGlobe.tsx';
import TrafficChart from './components/TrafficChart.tsx';
import { analyzeNetworkLogs, getSmartSuggestions } from './services/geminiService.ts';
import { NetworkDevice, TrafficData, NetworkMetrics, SecurityAlert, TopologyType } from './types.ts';

const INITIAL_DEVICES: NetworkDevice[] = [
  { id: '1', name: 'GW_01', ip: '10.0.0.1', status: 'online', type: 'router', traffic: 450 },
  { id: '2', name: 'SENTINEL', ip: '10.0.0.2', status: 'alert', type: 'server', traffic: 1200 },
  { id: '3', name: 'WKS_A', ip: '10.0.0.15', status: 'online', type: 'workstation', traffic: 85 },
  { id: '4', name: 'IOT_S1', ip: '10.0.0.102', status: 'offline', type: 'iot', traffic: 0 },
  { id: '5', name: 'K8S_M', ip: '10.0.0.20', status: 'online', type: 'server', traffic: 890 },
  { id: '6', name: 'WKS_B', ip: '10.0.0.16', status: 'online', type: 'workstation', traffic: 120 },
  { id: '7', name: 'AUTH', ip: '10.0.0.5', status: 'online', type: 'server', traffic: 340 },
  { id: '8', name: 'CAM_01', ip: '10.0.0.88', status: 'online', type: 'iot', traffic: 45 }
];

const App: React.FC = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>(INITIAL_DEVICES);
  const [topology, setTopology] = useState<TopologyType>('mesh');
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    latency: 14.2,
    bandwidth: 980,
    packetLoss: 0.004,
    uptime: '45d 12h'
  });
  const [trafficHistory, setTrafficHistory] = useState<TrafficData[]>([]);
  const [alerts] = useState<SecurityAlert[]>([
    { id: 'a1', severity: 'high', message: 'Unauthorized scan detected', timestamp: '1m ago' },
    { id: 'a2', severity: 'medium', message: 'Bandwidth anomaly sector C', timestamp: '10m ago' },
    { id: 'a3', severity: 'low', message: 'Backup sequence complete', timestamp: '55m ago' }
  ]);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logInput, setLogInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'devices' | 'ai'>('dashboard');

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        latency: Math.max(8, prev.latency + (Math.random() - 0.5) * 4),
        bandwidth: Math.max(500, prev.bandwidth + (Math.random() - 0.5) * 40)
      }));

      setTrafficHistory(prev => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const updated = [...prev, {
          time,
          inbound: Math.floor(Math.random() * 450) + 250,
          outbound: Math.floor(Math.random() * 250) + 100
        }];
        return updated.length > 20 ? updated.slice(1) : updated;
      });

      setDevices(prev => prev.map(d => ({
        ...d,
        traffic: d.status === 'online' ? Math.max(0, d.traffic + (Math.random() - 0.5) * 50) : d.traffic
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeNetworkLogs(logInput || JSON.stringify({ devices, metrics, topology }));
      setAnalysis(result);
    } catch (e) {
      setAnalysis("NEURAL CORE OFFLINE.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAlertClass = (sev: SecurityAlert['severity']) => {
    switch(sev) {
      case 'critical':
      case 'high': return 'alert-high';
      case 'medium': return 'alert-medium';
      default: return 'alert-low';
    }
  };

  return (
    <div className="app-container">
      <div className="scanline"></div>
      
      <nav className="sidebar">
        <div className="logo-container">
          <Radar style={{ color: '#0ea5e9' }} size={28} />
        </div>

        <div className="nav-links">
          <button onClick={() => setActiveTab('dashboard')} className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={24} />
            <span>HUB</span>
          </button>
          <button onClick={() => setActiveTab('devices')} className={`nav-item ${activeTab === 'devices' ? 'active' : ''}`}>
            <Server size={24} />
            <span>ENTITIES</span>
          </button>
          <button onClick={() => setActiveTab('ai')} className={`nav-item ${activeTab === 'ai' ? 'active' : ''}`}>
            <BrainCircuit size={24} />
            <span>NEURAL</span>
          </button>
        </div>

        <div className="logo-container" style={{ marginTop: 'auto', background: 'transparent', boxShadow: 'none' }}>
          <Settings style={{ color: '#475569' }} size={20} />
        </div>
      </nav>

      <main className="main-workspace">
        <header className="app-header">
          <div className="header-left">
            <h1 className="app-title">Nexus<span>Guard</span></h1>
            <div className="status-badge">
              <span className="status-dot"></span>
              SYNC: OK
            </div>
          </div>

          <div className="header-right-stats" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 900, letterSpacing: '0.2em' }}>UPLINK</div>
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#0ea5e9', fontFamily: 'Orbitron' }}>{(metrics.bandwidth / 10).toFixed(1)} GB/S</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.05)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
              <Wifi size={20} />
            </div>
          </div>
        </header>

        <div className="content-area custom-scroll">
          <div className="dashboard-grid">
            
            <div className="main-column">
              {activeTab === 'dashboard' && (
                <>
                  <div className="metric-row">
                    <div className="glass-card hud-border">
                      <span className="metric-label">Latency</span>
                      <div className="metric-value">{metrics.latency.toFixed(1)}ms</div>
                    </div>
                    <div className="glass-card hud-border">
                      <span className="metric-label">Nodes</span>
                      <div className="metric-value">{devices.length}</div>
                    </div>
                    <div className="glass-card hud-border">
                      <span className="metric-label">Alerts</span>
                      <div className="metric-value" style={{ color: '#f43f5e' }}>{alerts.length}</div>
                    </div>
                    <div className="glass-card hud-border">
                      <span className="metric-label">Uptime</span>
                      <div className="metric-value" style={{ fontSize: '18px' }}>{metrics.uptime}</div>
                    </div>
                  </div>

                  <div className="glass-card topology-container">
                    <div className="topology-header">
                      <div>
                        <h3 style={{ margin: 0, fontFamily: 'Orbitron', fontWeight: 900, letterSpacing: '0.2em', fontSize: '13px' }}>NEURAL TOPOLOGY</h3>
                      </div>
                      <div className="topology-controls">
                        {['star', 'ring', 'grid', 'mesh', 'hybrid'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setTopology(t as any)}
                            className={`control-btn ${topology === t ? 'active' : ''}`}
                          >
                            {t.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <NetworkGlobe type={topology} devices={devices} />
                    </div>
                  </div>

                  <div className="glass-card">
                    <h3 style={{ margin: '0 0 24px', fontFamily: 'Orbitron', fontWeight: 900, fontSize: '12px', letterSpacing: '0.2em' }}>BITSTREAM TELEMETRY</h3>
                    <TrafficChart data={trafficHistory} />
                  </div>
                </>
              )}

              {activeTab === 'devices' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h2 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '24px', margin: '0 0 16px' }}>ENTITIES</h2>
                  {devices.map(d => (
                    <div key={d.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ color: d.status === 'online' ? '#0ea5e9' : '#f43f5e' }}>
                          {d.type === 'router' ? <Globe size={24} /> : <Server size={24} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: '14px' }}>{d.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{d.ip}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 900, color: d.status === 'online' ? '#10b981' : '#f43f5e' }}>{d.status.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <h2 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '24px' }}>NEURAL AUDIT</h2>
                  <textarea 
                    className="ai-buffer custom-scroll"
                    value={logInput}
                    onChange={(e) => setLogInput(e.target.value)}
                    placeholder="Capture packets..."
                    style={{ height: '180px' }}
                  />
                  <button onClick={handleAiAnalysis} disabled={isAnalyzing} className="action-btn">
                    {isAnalyzing ? "Processing..." : "Initiate Audit"}
                  </button>
                  {analysis && (
                    <div className="glass-card" style={{ background: 'rgba(147, 51, 234, 0.05)', borderColor: 'rgba(147, 51, 234, 0.2)' }}>
                      <p style={{ fontSize: '13px', lineHeight: '1.6' }}>{analysis}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="side-column">
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <span className="metric-label">Grid Health</span>
                <div style={{ position: 'relative', width: '160px', height: '160px', margin: '24px auto' }}>
                  <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(14, 165, 233, 0.1)" strokeWidth="8" />
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="#0ea5e9" strokeWidth="8" strokeDasharray="440" strokeDashoffset="44" strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '32px', fontWeight: 900, fontFamily: 'Orbitron' }}>90%</div>
                </div>
              </div>

              <div className="glass-card">
                <span className="metric-label" style={{ marginBottom: '24px' }}>Active Threats</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {alerts.map(a => (
                    <div key={a.id} className={`alert-item ${getAlertClass(a.severity)}`} style={{ padding: '16px', borderRadius: '16px', marginBottom: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: 900, marginBottom: '4px' }}>{a.timestamp}</div>
                      <div style={{ fontSize: '12px' }}>{a.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;