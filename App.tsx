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
import NetworkGlobe from './components/NetworkGlobe';
import TrafficChart from './components/TrafficChart';
import { analyzeNetworkLogs, getSmartSuggestions } from './services/geminiService';
import { NetworkDevice, TrafficData, NetworkMetrics, SecurityAlert, TopologyType } from './types';

const INITIAL_DEVICES: NetworkDevice[] = [
  { id: '1', name: 'CORE_GW_01', ip: '10.0.0.1', status: 'online', type: 'router', traffic: 450 },
  { id: '2', name: 'SENTINEL_X', ip: '10.0.0.2', status: 'alert', type: 'server', traffic: 1200 },
  { id: '3', name: 'WKS_ALPHA', ip: '10.0.0.15', status: 'online', type: 'workstation', traffic: 85 },
  { id: '4', name: 'SENSOR_01', ip: '10.0.0.102', status: 'offline', type: 'iot', traffic: 0 },
  { id: '5', name: 'K8S_MASTER', ip: '10.0.0.20', status: 'online', type: 'server', traffic: 890 },
  { id: '6', name: 'WKS_BETA', ip: '10.0.0.16', status: 'online', type: 'workstation', traffic: 120 },
  { id: '7', name: 'AUTH_HUB', ip: '10.0.0.5', status: 'online', type: 'server', traffic: 340 },
  { id: '8', name: 'CAM_SEC_01', ip: '10.0.0.88', status: 'online', type: 'iot', traffic: 45 }
];

const App: React.FC = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>(INITIAL_DEVICES);
  const [topology, setTopology] = useState<TopologyType>('mesh');
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    latency: 14.2,
    bandwidth: 980,
    packetLoss: 0.004,
    uptime: '45d 12h 08m'
  });
  const [trafficHistory, setTrafficHistory] = useState<TrafficData[]>([]);
  const [alerts] = useState<SecurityAlert[]>([
    { id: 'a1', severity: 'high', message: 'UNAUTHORIZED SCAN DETECTED ON PORT 22', timestamp: '1m ago' },
    { id: 'a2', severity: 'medium', message: 'BANDWIDTH ANOMALY IN SECTOR C', timestamp: '10m ago' },
    { id: 'a3', severity: 'low', message: 'BACKUP SEQUENCE COMPLETED', timestamp: '55m ago' }
  ]);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
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
        const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const updated = [...prev, {
          time,
          inbound: Math.floor(Math.random() * 450) + 250,
          outbound: Math.floor(Math.random() * 250) + 100
        }];
        return updated.length > 30 ? updated.slice(1) : updated;
      });

      setDevices(prev => prev.map(d => ({
        ...d,
        traffic: d.status === 'online' ? Math.max(0, d.traffic + (Math.random() - 0.5) * 50) : d.traffic
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeNetworkLogs(logInput || JSON.stringify({ devices, metrics, activeTopology: topology }));
      setAnalysis(result);
      const sug = await getSmartSuggestions(metrics);
      setSuggestions(sug);
    } catch (e) {
      console.error(e);
      setAnalysis("NEURAL CORE OFFLINE. RESTORE POWER TO AI MODULE.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAlertClass = (sev: SecurityAlert['severity']) => {
    switch(sev) {
      case 'critical': return 'alert-high';
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
          <Radar style={{ color: '#0ea5e9' }} size={32} />
        </div>

        <div className="nav-links">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'HUB' },
            { id: 'devices', icon: Server, label: 'ENTITIES' },
            { id: 'ai', icon: BrainCircuit, label: 'NEURAL' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={28} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <button className="nav-item"><Terminal size={24} /></button>
          <button className="nav-item"><Settings size={24} /></button>
        </div>
      </nav>

      <main className="main-workspace">
        <header className="app-header">
          <div className="header-left">
            <h1 className="app-title">NexusGuard <span>4D</span></h1>
            <div className="status-badge">
              <span className="status-dot"></span>
              Quantum Sync: Nominal
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 900, letterSpacing: '0.3em', marginBottom: '4px' }}>Grid Uplink</div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#0ea5e9', fontFamily: 'Orbitron' }}>984.2 GB / SEC</div>
            </div>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(14, 165, 233, 0.05)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
              <Wifi size={24} />
            </div>
          </div>
        </header>

        <div className="content-area custom-scroll">
          <div className="dashboard-grid">
            
            <div className="main-column">
              {activeTab === 'dashboard' && (
                <>
                  <div className="metric-row">
                    {[
                      { label: 'Latency', val: `${metrics.latency.toFixed(2)}ms`, icon: Activity, color: '#0ea5e9' },
                      { label: 'Throughput', val: `${(metrics.bandwidth / 1000).toFixed(2)}Gbps`, icon: Zap, color: '#f472b6' },
                      { label: 'Uptime', val: metrics.uptime, icon: Radio, color: '#10b981' },
                      { label: 'Entropy', val: 'Minimal', icon: Shield, color: '#f59e0b' }
                    ].map((m, i) => (
                      <div key={i} className="glass-card hud-border">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                          <span className="metric-label">{m.label}</span>
                          <m.icon size={20} style={{ color: m.color }} />
                        </div>
                        <div className="metric-value">{m.val}</div>
                      </div>
                    ))}
                  </div>

                  <div className="glass-card topology-container">
                    <div className="topology-header">
                      <div>
                        <h3 style={{ margin: 0, fontFamily: 'Orbitron', fontWeight: 900, letterSpacing: '0.4em', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <Radar size={24} style={{ color: '#0ea5e9' }} /> Neural Topology Matrix
                        </h3>
                        <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Projection: 4D_VIRTUAL // Nodes: {devices.length}</p>
                      </div>
                      <div className="topology-controls">
                        {[
                          { id: 'star', icon: Circle, label: 'STAR' },
                          { id: 'ring', icon: RefreshCw, label: 'RING' },
                          { id: 'grid', icon: Grid3X3, label: 'GRID' },
                          { id: 'mesh', icon: Network, label: 'MESH' },
                          { id: 'hybrid', icon: Dna, label: 'HYBRID' }
                        ].map(t => (
                          <button 
                            key={t.id}
                            onClick={() => setTopology(t.id as any)}
                            className={`control-btn ${topology === t.id ? 'active' : ''}`}
                          >
                            <t.icon size={16} />
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative' }}>
                      <NetworkGlobe type={topology} devices={devices} />
                    </div>
                  </div>

                  <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontFamily: 'Orbitron', fontWeight: 900, letterSpacing: '0.3em', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <BarChart3 size={20} style={{ color: '#0ea5e9' }} /> Bitstream Telemetry
                      </h3>
                    </div>
                    <TrafficChart data={trafficHistory} />
                  </div>
                </>
              )}

              {activeTab === 'devices' && (
                <div className="glass-card" style={{ minHeight: '80vh' }}>
                  <h2 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '32px', margin: '0 0 40px' }}>GRID ENTITIES</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    {devices.map(d => (
                      <div key={d.id} className="glass-card" style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {d.type === 'router' && <Globe size={32} />}
                            {d.type === 'server' && <Server size={32} />}
                            {d.type === 'workstation' && <Smartphone size={32} />}
                            {d.type === 'iot' && <Zap size={32} />}
                          </div>
                          <div>
                            <div style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '18px' }}>{d.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{d.ip}</div>
                          </div>
                        </div>
                        <div style={{ padding: '8px 24px', borderRadius: '99px', fontSize: '10px', fontWeight: 900, border: '1px solid', color: d.status === 'online' ? '#10b981' : '#f43f5e' }}>
                          {d.status.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="glass-card" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <BrainCircuit size={48} style={{ color: '#9333ea' }} />
                    <h2 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '32px', margin: 0 }}>NEURAL CORE X1</h2>
                  </div>
                  <textarea 
                    className="ai-buffer custom-scroll"
                    value={logInput}
                    onChange={(e) => setLogInput(e.target.value)}
                    placeholder="Feed raw packet logs into the neural buffer..."
                  />
                  <button onClick={handleAiAnalysis} disabled={isAnalyzing} className="action-btn">
                    {isAnalyzing ? <RefreshCw className="animate-spin" /> : "Initiate Neural Audit"}
                  </button>
                  {analysis && (
                    <div className="glass-card" style={{ borderLeft: '4px solid #9333ea' }}>
                      <p style={{ lineHeight: '1.8', fontSize: '15px' }}>{analysis}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="side-column">
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <span className="metric-label">Grid Integrity</span>
                <div style={{ position: 'relative', width: '250px', height: '250px', margin: '40px auto' }}>
                  <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="125" cy="125" r="110" fill="transparent" stroke="rgba(14, 165, 233, 0.1)" strokeWidth="12" />
                    <circle cx="125" cy="125" r="110" fill="transparent" stroke="#0ea5e9" strokeWidth="12" strokeDasharray="691" strokeDashoffset="20" strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ fontSize: '64px', fontWeight: 900, fontFamily: 'Orbitron' }}>98</div>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#0ea5e9', marginTop: '10px' }}>OPTIMAL</div>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between' }}>
                   <span className="metric-label">Active Threats</span>
                   <Shield size={20} style={{ color: '#f43f5e' }} />
                </div>
                <div className="custom-scroll" style={{ overflowY: 'auto' }}>
                  {alerts.map(a => (
                    <div key={a.id} className={`alert-item ${getAlertClass(a.severity)}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900 }}>
                        <Shield size={16} />
                        <span>{a.timestamp}</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>{a.message}</div>
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