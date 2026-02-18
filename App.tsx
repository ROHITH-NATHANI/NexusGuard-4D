import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Server, 
  BrainCircuit, 
  Settings, 
  Wifi, 
  Globe, 
  Shield, 
  ChevronRight,
  Activity,
  Zap,
  BarChart3,
  Cpu,
  Smartphone
} from 'lucide-react';
import NetworkGlobe from './components/NetworkGlobe.tsx';
import TrafficChart from './components/TrafficChart.tsx';
import { analyzeNetworkLogs } from './services/geminiService.ts';
import { NetworkDevice, TrafficData, NetworkMetrics, SecurityAlert, TopologyType } from './types.ts';

const INITIAL_DEVICES: NetworkDevice[] = [
  { id: '1', name: 'CORE_R1', ip: '10.0.0.1', status: 'online', type: 'router', traffic: 450 },
  { id: '2', name: 'SEC_NODE', ip: '10.0.0.2', status: 'alert', type: 'server', traffic: 1200 },
  { id: '3', name: 'HUB_01', ip: '10.0.0.15', status: 'online', type: 'server', traffic: 890 },
  { id: '4', name: 'WKS_72', ip: '10.0.0.102', status: 'online', type: 'workstation', traffic: 120 },
  { id: '5', name: 'IOT_CAM', ip: '10.0.0.20', status: 'offline', type: 'iot', traffic: 0 },
];

const App: React.FC = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>(INITIAL_DEVICES);
  const [topology, setTopology] = useState<TopologyType>('mesh');
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    latency: 12.4,
    bandwidth: 1.2,
    packetLoss: 0.001,
    uptime: '12d 4h'
  });
  const [trafficHistory, setTrafficHistory] = useState<TrafficData[]>([]);
  const [alerts] = useState<SecurityAlert[]>([
    { id: 'a1', severity: 'high', message: 'Inbound port 22 scan detected', timestamp: '2m ago' },
    { id: 'a2', severity: 'medium', message: 'Node latency spike (Region 4)', timestamp: '15m ago' }
  ]);
  const [activeTab, setActiveTab] = useState<'hub' | 'entities' | 'neural'>('hub');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    const tick = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        latency: Math.max(5, prev.latency + (Math.random() - 0.5) * 2),
        bandwidth: Math.max(0.5, prev.bandwidth + (Math.random() - 0.5) * 0.2)
      }));

      setTrafficHistory(prev => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const entry = {
          time,
          inbound: Math.floor(Math.random() * 400) + 100,
          outbound: Math.floor(Math.random() * 200) + 50
        };
        return [...prev.slice(-14), entry];
      });
    }, 4000);
    return () => clearInterval(tick);
  }, []);

  const handleAudit = async () => {
    setIsAnalyzing(true);
    try {
      const log = `DUMP: ${JSON.stringify({ devices, metrics })}`;
      const result = await analyzeNetworkLogs(log);
      setAnalysis(result);
    } catch {
      setAnalysis("FAILED TO LINK NEURAL CORE.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      <div className="scanline"></div>
      
      <nav className="sidebar">
        <div className="nav-links">
          <button onClick={() => setActiveTab('hub')} className={`nav-item ${activeTab === 'hub' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>HUB</span>
          </button>
          <button onClick={() => setActiveTab('entities')} className={`nav-item ${activeTab === 'entities' ? 'active' : ''}`}>
            <Server size={20} />
            <span>CORE</span>
          </button>
          <button onClick={() => setActiveTab('neural')} className={`nav-item ${activeTab === 'neural' ? 'active' : ''}`}>
            <BrainCircuit size={20} />
            <span>AI</span>
          </button>
        </div>
        <div style={{ marginTop: 'auto' }}>
           <button className="nav-item"><Settings size={20} /></button>
        </div>
      </nav>

      <main className="main-workspace">
        <header className="app-header">
          <div>
            <h1 className="app-title">Nexus<span>Guard</span></h1>
            <div className="status-badge">
              <span className="status-dot"></span>
              NETWORK ACTIVE
            </div>
          </div>
          <div className="header-right-stats">
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ textAlign: 'right' }}>
                <span className="metric-label" style={{ marginBottom: 2 }}>Throughput</span>
                <span style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'Orbitron', color: '#0ea5e9' }}>{metrics.bandwidth.toFixed(2)} GB/s</span>
              </div>
              <div className="glass-card" style={{ padding: '8px', borderRadius: '10px' }}>
                <Wifi size={18} color="#0ea5e9" />
              </div>
            </div>
          </div>
        </header>

        <div className="content-area custom-scroll">
          <div className="dashboard-grid">
            
            <div className="main-column">
              {activeTab === 'hub' && (
                <>
                  <div className="metric-row">
                    <div className="glass-card">
                      <span className="metric-label">Latency</span>
                      <div className="metric-value">{metrics.latency.toFixed(1)}<span style={{ fontSize: 10, color: '#64748b', marginLeft: 4 }}>ms</span></div>
                    </div>
                    <div className="glass-card">
                      <span className="metric-label">Packets</span>
                      <div className="metric-value" style={{ color: '#10b981' }}>99.9%</div>
                    </div>
                    <div className="glass-card">
                      <span className="metric-label">Active Nodes</span>
                      <div className="metric-value">{devices.filter(d => d.status === 'online').length}</div>
                    </div>
                    <div className="glass-card">
                      <span className="metric-label">Alerts</span>
                      <div className="metric-value" style={{ color: '#f43f5e' }}>{alerts.length}</div>
                    </div>
                  </div>

                  <div className="glass-card topology-container">
                    <div className="topology-header">
                      <span className="metric-label" style={{ color: '#fff' }}>Neural Topology</span>
                      <div className="topology-controls">
                        {['star', 'ring', 'mesh'].map(t => (
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
                    <NetworkGlobe type={topology} devices={devices} />
                  </div>

                  <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className="metric-label">Telemetry Stream</span>
                      <Activity size={14} color="#0ea5e9" />
                    </div>
                    <TrafficChart data={trafficHistory} />
                  </div>
                </>
              )}

              {activeTab === 'entities' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span className="metric-label">Network Entities</span>
                  {devices.map(d => (
                    <div key={d.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                         <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {d.type === 'router' ? <Globe size={20} color="#0ea5e9" /> : <Server size={20} color="#0ea5e9" />}
                         </div>
                         <div>
                            <div style={{ fontWeight: 800, fontSize: '13px' }}>{d.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{d.ip}</div>
                         </div>
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: d.status === 'online' ? '#10b981' : '#f43f5e' }}>{d.status.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'neural' && (
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <span className="metric-label">Neural Audit Interface</span>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
                    [SYSTEM_LOG] INITIATING PACKET CAPTURE... <br/>
                    [SYSTEM_LOG] BUFFERING STREAM 0x1A2B3C...
                  </div>
                  <button className="action-btn" onClick={handleAudit} disabled={isAnalyzing}>
                    {isAnalyzing ? "Processing..." : "Initiate Audit"}
                  </button>
                  {analysis && (
                    <div className="glass-card" style={{ background: 'rgba(14, 165, 233, 0.03)' }}>
                      <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#e2e8f0' }}>{analysis}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="side-column">
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <span className="metric-label">Grid Health</span>
                <div style={{ position: 'relative', width: 140, height: 140, margin: '20px auto' }}>
                  <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="70" cy="70" r="60" fill="transparent" stroke="rgba(14, 165, 233, 0.05)" strokeWidth="8" />
                    <circle cx="70" cy="70" r="60" fill="transparent" stroke="#0ea5e9" strokeWidth="8" strokeDasharray="377" strokeDashoffset="37.7" strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '24px', fontWeight: 900, fontFamily: 'Orbitron' }}>90%</div>
                </div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span className="metric-label">Active Threats</span>
                  <Shield size={14} color="#f43f5e" />
                </div>
                {alerts.map(a => (
                  <div key={a.id} className={`alert-item ${a.severity === 'high' ? 'alert-high' : 'alert-medium'}`}>
                    <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.6, marginBottom: 4 }}>{a.timestamp}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{a.message}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;