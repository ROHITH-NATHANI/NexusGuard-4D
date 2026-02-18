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
  { id: '1', name: 'VX_GATEWAY_01', ip: '10.0.0.1', status: 'online', type: 'router', traffic: 450 },
  { id: '2', name: 'NEURAL_UNIT_X', ip: '10.0.0.2', status: 'alert', type: 'server', traffic: 1200 },
  { id: '3', name: 'STORAGE_NODE_A', ip: '10.0.0.15', status: 'online', type: 'server', traffic: 890 },
  { id: '4', name: 'QUANTUM_WKS_1', ip: '10.0.0.102', status: 'online', type: 'workstation', traffic: 120 },
  { id: '5', name: 'EDGE_SENSOR_04', ip: '10.0.0.20', status: 'offline', type: 'iot', traffic: 0 },
  { id: '6', name: 'FIREWALL_VX_0', ip: '10.0.0.5', status: 'online', type: 'router', traffic: 300 },
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
    try {
        const res = await analyzeNetworkLogs(data);
        setAuditReport(res);
    } catch (err) {
        setAuditReport("CRITICAL: NEURAL LINK TIMEOUT. RETRYING...");
    } finally {
        setIsAuditing(false);
    }
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="nav-links">
          <button onClick={() => setActiveTab('monitor')} className={`nav-item ${activeTab === 'monitor' ? 'active' : ''}`}>
            <Activity size={24} />
            <span>FLUX</span>
          </button>
          <button onClick={() => setActiveTab('nodes')} className={`nav-item ${activeTab === 'nodes' ? 'active' : ''}`}>
            <Server size={24} />
            <span>NODES</span>
          </button>
          <button onClick={() => setActiveTab('audit')} className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}>
            <Brain size={24} />
            <span>AUDIT</span>
          </button>
        </div>
        <div style={{ marginTop: 'auto', opacity: 0.2 }} className="desktop-only">
          <Settings size={22} />
        </div>
      </nav>

      <main className="main-workspace">
        <header className="header">
          <div>
            <h1 className="header-title">NEXUS<span>GUARD</span></h1>
            <div className="status-badge" style={{ marginTop: 6 }}>
              <div className="status-dot"></div>
              4D PERSISTENT LINK
            </div>
          </div>
          <div className="desktop-only" style={{ display: 'flex', gap: '32px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 900, fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>THROUGHPUT</div>
              <div style={{ color: 'var(--neon-cyan)', fontWeight: 900, fontFamily: 'JetBrains Mono', fontSize: '15px' }}>{metrics.bandwidth.toFixed(2)} GB/s</div>
            </div>
          </div>
        </header>

        <div className="content custom-scroll">
          <div className="grid-system">
            
            <div className="main-col">
              {activeTab === 'monitor' && (
                <>
                  <div className="card topology-box">
                    <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 5, pointerEvents: 'none' }}>
                      <span className="metric-label" style={{ color: '#fff', fontSize: '10px' }}>Quantum Topology</span>
                    </div>
                    <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 5, display: 'flex', gap: 8 }}>
                      {['mesh', 'ring', 'star'].map(t => (
                        <button 
                          key={t}
                          onClick={() => setTopology(t as any)}
                          style={{
                            background: topology === t ? 'var(--neon-cyan)' : 'rgba(0,0,0,0.6)',
                            color: topology === t ? '#000' : '#fff',
                            border: '1px solid var(--glass-border)',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '9px',
                            fontWeight: 900,
                            fontFamily: 'Orbitron',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
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
                      <div className="metric-value">{metrics.latency.toFixed(1)}<span style={{ fontSize: '12px', opacity: 0.5 }}>ms</span></div>
                    </div>
                    <div className="metric-tile">
                      <span className="metric-label">Integrity</span>
                      <div className="metric-value" style={{ color: 'var(--neon-green)' }}>99.9%</div>
                    </div>
                    <div className="metric-tile">
                      <span className="metric-label">Nodes</span>
                      <div className="metric-value">{devices.length}</div>
                    </div>
                    <div className="metric-tile">
                      <span className="metric-label">Session</span>
                      <div className="metric-value" style={{ fontSize: '14px' }}>{metrics.uptime}</div>
                    </div>
                  </div>

                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className="metric-label">Traffic Telemetry Stream</span>
                      <Zap size={14} color="var(--neon-cyan)" />
                    </div>
                    <TrafficChart data={traffic} />
                  </div>
                </>
              )}

              {activeTab === 'nodes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <span className="metric-label">Grid Entities</span>
                  {devices.map(d => (
                    <div key={d.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                        <div style={{ background: 'rgba(0, 242, 255, 0.08)', padding: 12, borderRadius: 14, border: '1px solid var(--glass-border)' }}>
                          {d.type === 'router' ? <Globe size={24} color="var(--neon-cyan)" /> : <Cpu size={24} color="var(--neon-cyan)" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: '16px', color: '#fff', fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>{d.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{d.ip}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ 
                            fontSize: '10px', 
                            fontWeight: 900, 
                            fontFamily: 'Orbitron', 
                            color: d.status === 'online' ? 'var(--neon-green)' : d.status === 'alert' ? 'var(--critical-red)' : '#475569',
                            background: d.status === 'online' ? 'rgba(57, 255, 20, 0.05)' : 'transparent',
                            padding: '4px 10px',
                            borderRadius: 6
                        }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ background: 'rgba(255, 0, 234, 0.1)', padding: 12, borderRadius: 12 }}>
                        <Brain size={28} color="var(--neon-magenta)" />
                    </div>
                    <span className="metric-label" style={{ margin: 0, fontSize: '12px', color: '#fff' }}>Neural Diagnostic Portal</span>
                  </div>
                  <div className="custom-scroll" style={{ 
                      background: 'rgba(0,0,0,0.45)', 
                      padding: '24px', 
                      borderRadius: '20px', 
                      border: '1px solid var(--glass-border)', 
                      minHeight: '340px',
                      maxHeight: '500px',
                      overflowY: 'auto'
                    }}>
                    {auditReport ? (
                      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono' }}>
                        <div style={{ color: 'var(--neon-cyan)', marginBottom: 12 }}>[ AUDIT_LOG_SUCCESS_STREAM ]</div>
                        {auditReport}
                      </div>
                    ) : (
                      <div style={{ color: '#475569', textAlign: 'center', marginTop: '140px', fontFamily: 'JetBrains Mono', fontSize: '13px', opacity: 0.6 }}>
                        // STANDBY FOR PACKET INSPECTION...
                        <br/>
                        // INITIALIZING NEURAL BUFFER...
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={triggerAudit}
                    disabled={isAuditing}
                    style={{
                      background: isAuditing ? 'rgba(0, 242, 255, 0.2)' : 'var(--neon-cyan)',
                      color: '#000',
                      border: 'none',
                      padding: '18px',
                      borderRadius: '16px',
                      fontWeight: 900,
                      fontFamily: 'Orbitron',
                      fontSize: '12px',
                      letterSpacing: '0.2em',
                      cursor: isAuditing ? 'default' : 'pointer',
                      boxShadow: isAuditing ? 'none' : '0 0 25px rgba(0, 242, 255, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isAuditing ? 'INSPECTING DATA PACKETS...' : 'EXECUTE NEURAL AUDIT'}
                  </button>
                </div>
              )}
            </div>

            <div className="side-col">
              <div className="card" style={{ textAlign: 'center' }}>
                <span className="metric-label">Network Integrity</span>
                <div style={{ position: 'relative', width: 170, height: 170, margin: '24px auto' }}>
                  <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="85" cy="85" r="75" fill="transparent" stroke="rgba(0, 242, 255, 0.05)" strokeWidth="12" />
                    <circle cx="85" cy="85" r="75" fill="transparent" stroke="var(--neon-cyan)" strokeWidth="12" strokeDasharray="471" strokeDashoffset="47" strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '32px', fontWeight: 900, fontFamily: 'Orbitron', color: '#fff' }}>90%</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                  <Lock size={12} color="var(--neon-cyan)" />
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 900, fontFamily: 'Orbitron' }}>TLS 1.3 QUANTUM</span>
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span className="metric-label">Security Incident Log</span>
                  <Shield size={16} color="var(--critical-red)" />
                </div>
                {[
                  { id: 1, type: 'CRIT', msg: 'Anomalous Data Burst on Node_X', time: '45s ago' },
                  { id: 2, type: 'WARN', msg: 'Packet Fragmentation Detected', time: '14m ago' },
                  { id: 3, type: 'INFO', msg: 'System Entropy Normalized', time: '52m ago' }
                ].map(item => (
                  <div key={item.id} style={{ 
                      padding: '14px', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: 14, 
                      marginBottom: 12, 
                      borderLeft: `4px solid ${item.type === 'CRIT' ? 'var(--critical-red)' : 'var(--neon-cyan)'}`,
                      border: '1px solid rgba(255,255,255,0.04)'
                    }}>
                    <div style={{ fontSize: '9px', fontWeight: 900, color: '#475569', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.type} // LOG_ID_{item.id}</span>
                        <span>{item.time}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>{item.msg}</div>
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