
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Activity, 
  Server, 
  Brain, 
  Settings, 
  Cpu, 
  Zap,
  Globe,
  Lock,
  ChevronRight
} from 'lucide-react';
import NetworkGlobe from './components/NetworkGlobe.tsx';
import TrafficChart from './components/TrafficChart.tsx';
import { analyzeNetworkLogs } from './services/geminiService.ts';
import { NetworkDevice, TrafficData, NetworkMetrics, SecurityAlert, TopologyType } from './types.ts';

const INITIAL_DEVICES: NetworkDevice[] = [
  { id: '1', name: 'VX_CORE_01', ip: '10.0.0.1', status: 'online', type: 'router', traffic: 450 },
  { id: '2', name: 'NEURAL_UNIT_X', ip: '10.0.0.2', status: 'alert', type: 'server', traffic: 1200 },
  { id: '3', name: 'STORAGE_CLD', ip: '10.0.0.15', status: 'online', type: 'server', traffic: 890 },
  { id: '4', name: 'WKS_QUANTUM', ip: '10.0.0.102', status: 'online', type: 'workstation', traffic: 120 },
  { id: '5', name: 'IoT_EDGE_S4', ip: '10.0.0.20', status: 'offline', type: 'iot', traffic: 0 },
  { id: '6', name: 'FIREWALL_VX', ip: '10.0.0.5', status: 'online', type: 'router', traffic: 300 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'nodes' | 'audit'>('monitor');
  const [topology, setTopology] = useState<TopologyType>('mesh');
  const [devices] = useState<NetworkDevice[]>(INITIAL_DEVICES);
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    latency: 11.2,
    bandwidth: 1.45,
    packetLoss: 0.0008,
    uptime: '18d 6h'
  });
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState('');

  useEffect(() => {
    const ticker = setInterval(() => {
      setMetrics(m => ({
        ...m,
        latency: Math.max(2, m.latency + (Math.random() - 0.5) * 1.5),
        bandwidth: Math.max(0.5, m.bandwidth + (Math.random() - 0.5) * 0.12)
      }));

      setTraffic(prev => {
        const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = {
          time: now,
          inbound: Math.floor(Math.random() * 800) + 100,
          outbound: Math.floor(Math.random() * 500) + 50
        };
        return [...prev.slice(-14), entry];
      });
    }, 2000);
    return () => clearInterval(ticker);
  }, []);

  const triggerAudit = async () => {
    setIsAuditing(true);
    const data = `Metrics: ${JSON.stringify(metrics)}, ActiveNodes: ${devices.length}`;
    const res = await analyzeNetworkLogs(data);
    setAuditReport(res);
    setIsAuditing(false);
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="nav-links">
          <button onClick={() => setActiveTab('monitor')} className={`nav-item ${activeTab === 'monitor' ? 'active' : ''}`}>
            <Activity size={24} />
            <span>Flux</span>
          </button>
          <button onClick={() => setActiveTab('nodes')} className={`nav-item ${activeTab === 'nodes' ? 'active' : ''}`}>
            <Server size={24} />
            <span>Grid</span>
          </button>
          <button onClick={() => setActiveTab('audit')} className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}>
            <Brain size={24} />
            <span>AI</span>
          </button>
        </div>
        <div style={{ marginTop: 'auto', opacity: 0.3 }} className="desktop-only">
          <Settings size={22} />
        </div>
      </nav>

      <main className="main-workspace">
        <header className="header">
          <div>
            <h1 className="header-title">NEXUS<span>GUARD</span> 4D</h1>
            <div className="status-badge" style={{ marginTop: 6 }}>
              <div className="status-dot"></div>
              QUANTUM LINK ESTABLISHED
            </div>
          </div>
          <div className="desktop-only" style={{ display: 'flex', gap: '32px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 900, fontFamily: 'Orbitron' }}>THROUGHPUT</div>
              <div style={{ color: 'var(--neon-cyan)', fontWeight: 900, fontFamily: 'JetBrains Mono' }}>{metrics.bandwidth.toFixed(2)} GB/s</div>
            </div>
          </div>
        </header>

        <div className="content custom-scroll">
          <div className="grid-system">
            
            <div className="main-col">
              {activeTab === 'monitor' && (
                <>
                  <div className="card topology-box">
                    {/* Fix: changed z-index to zIndex in inline style to resolve arithmetic operation error */}
                    <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 10, pointerEvents: 'none' }}>
                      <span className="metric-label" style={{ color: '#fff' }}>Topology Stream</span>
                    </div>
                    {/* Fix: changed z-index to zIndex in inline style to resolve arithmetic operation error */}
                    <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 10, display: 'flex', gap: 8 }}>
                      {['mesh', 'ring', 'star'].map(t => (
                        <button 
                          key={t}
                          onClick={() => setTopology(t as any)}
                          style={{
                            background: topology === t ? 'var(--neon-cyan)' : 'rgba(0,0,0,0.5)',
                            color: topology === t ? '#000' : '#fff',
                            border: '1px solid var(--glass-border)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '9px',
                            fontWeight: 900,
                            fontFamily: 'Orbitron',
                            cursor: 'pointer'
                          }}
                        >
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <NetworkGlobe type={topology} devices={devices} />
                  </div>

                  <div className="metric-tile-row">
                    <div className="metric-tile">
                      <span className="metric-label">Latency</span>
                      <div className="metric-value">{metrics.latency.toFixed(1)}ms</div>
                    </div>
                    <div className="metric-tile">
                      <span className="metric-label">Nodes</span>
                      <div className="metric-value">{devices.length}</div>
                    </div>
                    <div className="metric-tile">
                      <span className="metric-label">Flux</span>
                      <div className="metric-value" style={{ color: 'var(--neon-cyan)' }}>{metrics.bandwidth.toFixed(1)}G</div>
                    </div>
                    <div className="metric-tile">
                      <span className="metric-label">Uptime</span>
                      <div className="metric-value" style={{ fontSize: '14px' }}>{metrics.uptime}</div>
                    </div>
                  </div>

                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="metric-label">Traffic Telemetry</span>
                      <Zap size={14} color="var(--neon-cyan)" />
                    </div>
                    <TrafficChart data={traffic} />
                  </div>
                </>
              )}

              {activeTab === 'nodes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <span className="metric-label">Infrastructure Nodes</span>
                  {devices.map(d => (
                    <div key={d.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                        <div style={{ background: 'rgba(0, 242, 255, 0.1)', padding: 12, borderRadius: 12 }}>
                          {d.type === 'router' ? <Globe size={24} color="var(--neon-cyan)" /> : <Cpu size={24} color="var(--neon-cyan)" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: '16px', color: '#fff', fontFamily: 'Orbitron' }}>{d.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'JetBrains Mono' }}>{d.ip}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'Orbitron', color: d.status === 'online' ? 'var(--neon-green)' : d.status === 'alert' ? 'var(--critical-red)' : '#475569' }}>
                          {d.status.toUpperCase()}
                        </div>
                        <ChevronRight size={18} color="#475569" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Brain size={28} color="var(--neon-magenta)" />
                    <span className="metric-label" style={{ margin: 0 }}>Gemini Deep-Audit</span>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: 24, borderRadius: 20, border: '1px solid var(--glass-border)', minHeight: '300px' }}>
                    {auditReport ? (
                      <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>{auditReport}</p>
                    ) : (
                      <div style={{ color: '#475569', textAlign: 'center', marginTop: '120px', fontFamily: 'JetBrains Mono', fontSize: '13px' }}>
                        [ SYSTEM READY FOR PACKET INSPECTION ]
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={triggerAudit}
                    disabled={isAuditing}
                    style={{
                      background: 'var(--neon-cyan)',
                      color: '#000',
                      border: 'none',
                      padding: 16,
                      borderRadius: 14,
                      fontWeight: 900,
                      fontFamily: 'Orbitron',
                      fontSize: '12px',
                      letterSpacing: '0.2em',
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(0, 242, 255, 0.4)'
                    }}
                  >
                    {isAuditing ? 'PROCESSING DATA STREAM...' : 'EXECUTE NEURAL AUDIT'}
                  </button>
                </div>
              )}
            </div>

            <div className="side-col">
              <div className="card" style={{ textAlign: 'center' }}>
                <span className="metric-label">System Integrity</span>
                <div style={{ position: 'relative', width: 160, height: 160, margin: '24px auto' }}>
                  <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(0, 242, 255, 0.05)" strokeWidth="10" />
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="var(--neon-cyan)" strokeWidth="10" strokeDasharray="440" strokeDashoffset="44" strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '28px', fontWeight: 900, fontFamily: 'Orbitron' }}>90%</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <Lock size={12} color="var(--neon-cyan)" />
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 900 }}>ENCRYPTED STACK</span>
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span className="metric-label">Threat Log</span>
                  <Shield size={16} color="var(--critical-red)" />
                </div>
                {[
                  { id: 1, type: 'CRITICAL', msg: 'Core Node Infiltration Alert', time: '1m ago' },
                  { id: 2, type: 'WARN', msg: 'Packet Fragmentation on Port 80', time: '12m ago' },
                  { id: 3, type: 'INFO', msg: 'New Handshake from VX_EDGE', time: '45m ago' }
                ].map(item => (
                  <div key={item.id} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, marginBottom: 12, borderLeft: `3px solid ${item.type === 'CRITICAL' ? 'var(--critical-red)' : 'var(--neon-cyan)'}` }}>
                    <div style={{ fontSize: '9px', fontWeight: 900, color: '#475569', marginBottom: 4 }}>{item.time} // {item.type}</div>
                    <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>{item.msg}</div>
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
