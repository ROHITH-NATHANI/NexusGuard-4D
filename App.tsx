import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Shield, 
  Cpu, 
  Globe, 
  Server, 
  Smartphone, 
  AlertTriangle, 
  Zap,
  RefreshCw,
  Search,
  LayoutDashboard,
  Terminal,
  Settings,
  BrainCircuit,
  MessageSquare,
  Layers,
  Circle,
  Network,
  Grid3X3,
  Dna,
  Wifi,
  Radio,
  BarChart3,
  Radar,
  ChevronRight,
  Database
} from 'lucide-react';
import NetworkGlobe from './components/NetworkGlobe';
import TrafficChart from './components/TrafficChart';
import { analyzeNetworkLogs, getSmartSuggestions } from './services/geminiService';
import { NetworkDevice, TrafficData, NetworkMetrics, SecurityAlert, TopologyType } from './types';

const INITIAL_DEVICES: NetworkDevice[] = [
  { id: '1', name: 'NEXUS_CORE', ip: '10.0.0.1', status: 'online', type: 'router', traffic: 450 },
  { id: '2', name: 'SENTINEL_WAF', ip: '10.0.0.2', status: 'alert', type: 'server', traffic: 1200 },
  { id: '3', name: 'ALPHA_WORK_1', ip: '10.0.0.15', status: 'online', type: 'workstation', traffic: 85 },
  { id: '4', name: 'IOT_CAM_01', ip: '10.0.0.102', status: 'offline', type: 'iot', traffic: 0 },
  { id: '5', name: 'K8S_PRIMARY', ip: '10.0.0.20', status: 'online', type: 'server', traffic: 890 },
  { id: '6', name: 'BETA_WORK_2', ip: '10.0.0.16', status: 'online', type: 'workstation', traffic: 120 },
  { id: '7', name: 'GATE_VALVE', ip: '10.0.0.5', status: 'online', type: 'server', traffic: 340 },
  { id: '8', name: 'VIS_SEC_UNIT', ip: '10.0.0.88', status: 'online', type: 'iot', traffic: 45 }
];

const App: React.FC = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>(INITIAL_DEVICES);
  const [topology, setTopology] = useState<TopologyType>('mesh');
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    latency: 12.4,
    bandwidth: 985,
    packetLoss: 0.008,
    uptime: '32d 08h 22m'
  });
  const [trafficHistory, setTrafficHistory] = useState<TrafficData[]>([]);
  const [alerts] = useState<SecurityAlert[]>([
    { id: 'a1', severity: 'high', message: 'DDoS VECTOR IDENTIFIED: PORT 443 UNDER PRESSURE', timestamp: '2m ago' },
    { id: 'a2', severity: 'medium', message: 'LATENCY DEVIATION IN ZONE B-12', timestamp: '14m ago' },
    { id: 'a3', severity: 'low', message: 'SYSTEM CORE TEMPERATURE STABILIZED', timestamp: '45m ago' }
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
        latency: Math.max(5, prev.latency + (Math.random() - 0.5) * 3),
        bandwidth: Math.max(600, prev.bandwidth + (Math.random() - 0.5) * 50)
      }));

      setTrafficHistory(prev => {
        const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const updated = [...prev, {
          time,
          inbound: Math.floor(Math.random() * 400) + 300,
          outbound: Math.floor(Math.random() * 200) + 150
        }];
        return updated.length > 40 ? updated.slice(1) : updated;
      });

      setDevices(prev => prev.map(d => ({
        ...d,
        traffic: d.status === 'online' ? Math.max(0, d.traffic + (Math.random() - 0.5) * 40) : d.traffic
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
      setAnalysis("CRITICAL: AI SUBSYSTEM UNAVAILABLE.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAlertStyle = (sev: SecurityAlert['severity']) => {
    switch(sev) {
      case 'critical': return 'border-red-500/60 bg-red-500/10 text-red-400';
      case 'high': return 'border-orange-500/60 bg-orange-500/10 text-orange-400';
      case 'medium': return 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400';
      default: return 'border-sky-500/60 bg-sky-500/10 text-sky-400';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-mono selection:bg-sky-500/40">
      <div className="scanline"></div>
      
      {/* SIDEBAR NAVIGATION */}
      <nav className="w-24 border-r border-sky-500/10 bg-slate-950/90 backdrop-blur-3xl flex flex-col items-center py-10 gap-14 shrink-0 z-50">
        <div className="w-14 h-14 bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/40 relative group cursor-pointer shadow-[0_0_20px_rgba(14,165,233,0.3)]">
          <Radar className="text-sky-400 animate-pulse" size={32} />
          <div className="absolute -inset-3 bg-sky-400/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="flex flex-col gap-10">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'HUB' },
            { id: 'devices', icon: Server, label: 'NODES' },
            { id: 'ai', icon: BrainCircuit, label: 'NEURAL' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 group ${
                activeTab === tab.id ? 'text-sky-400 bg-sky-400/10 ring-1 ring-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.2)]' : 'text-slate-600 hover:text-slate-300'
              }`}
            >
              <tab.icon size={28} />
              <span className="text-[8px] font-black tracking-[0.2em]">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-10">
          <button className="text-slate-600 hover:text-sky-400 transition-colors"><Terminal size={24} /></button>
          <button className="text-slate-600 hover:text-sky-400 transition-colors"><Settings size={24} /></button>
        </div>
      </nav>

      {/* PRIMARY WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 border-b border-sky-500/10 flex items-center justify-between px-10 bg-slate-950/60 backdrop-blur-xl z-40 shrink-0">
          <div className="flex items-center gap-8">
            <h1 className="font-orbitron text-2xl font-black tracking-widest text-sky-400 glitch-text uppercase">
              NexusGuard <span className="text-white">4D</span>
            </h1>
            <div className="hidden md:flex items-center gap-4 px-5 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Quantum Encryption: Active</span>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="hidden xl:flex flex-col items-end gap-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Neural Sync Load</span>
              <div className="w-48 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div className="h-full bg-sky-500 shadow-[0_0_15px_#0ea5e9] rounded-full" style={{ width: '58%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-6 border-l border-slate-800 pl-8">
               <div className="text-right">
                  <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Session Data</div>
                  <div className="text-xs font-black text-sky-400">442.8 TB / SEC</div>
               </div>
               <div className="w-12 h-12 rounded-xl border border-sky-500/20 bg-sky-500/5 flex items-center justify-center text-sky-400 shadow-inner">
                 <Wifi size={24} />
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scroll p-10">
          <div className="max-w-[1800px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            {/* MAIN HUB MODULES */}
            <div className="xl:col-span-8 space-y-10">
              {activeTab === 'dashboard' && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { label: 'Latency Pulse', val: `${metrics.latency.toFixed(2)}ms`, icon: Activity, color: 'text-sky-400', desc: '+1.2% dev' },
                      { label: 'Bitstream Rate', val: `${(metrics.bandwidth / 1000).toFixed(2)}Gbps`, icon: Zap, color: 'text-pink-400', desc: 'Peak Load' },
                      { label: 'Packet Integrity', val: `${(100 - metrics.packetLoss * 100).toFixed(3)}%`, icon: AlertTriangle, color: 'text-orange-400', desc: 'Nominal' },
                      { label: 'Node Entropy', val: 'Low-Zero', icon: Radio, color: 'text-emerald-400', desc: 'Stable' }
                    ].map((m, i) => (
                      <div key={i} className="glass p-8 rounded-3xl hud-border relative group hover:border-sky-500/30 transition-all active:scale-95 cursor-crosshair">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.25em]">{m.label}</span>
                          <m.icon size={20} className={m.color} />
                        </div>
                        <div className="text-3xl font-orbitron font-black text-white mb-2">{m.val}</div>
                        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{m.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* 3D TOPOLOGY UNIT */}
                  <div className="glass rounded-[3rem] h-[650px] border-sky-500/10 relative overflow-hidden flex flex-col shadow-2xl group">
                    <div className="flex flex-col md:flex-row items-center justify-between p-10 z-20">
                      <div>
                        <h3 className="text-white font-black tracking-[0.3em] text-sm flex items-center gap-4 uppercase font-orbitron">
                          <Radar size={22} className="text-sky-400" /> Matrix Projection Module
                        </h3>
                        <p className="text-[11px] text-slate-500 font-bold uppercase mt-2 tracking-widest">Environment: 4D_QUANTUM // Sector: ROOT_GATEWAY</p>
                      </div>
                      <div className="flex flex-wrap gap-3 bg-slate-950/80 p-3 rounded-2xl border border-sky-500/10 mt-6 md:mt-0 backdrop-blur-3xl shadow-2xl">
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
                            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl border text-[11px] font-black uppercase transition-all duration-300 ${
                              topology === t.id ? 'bg-sky-500/20 border-sky-400 text-sky-400 shadow-[0_0_25px_#0ea5e966] scale-105' : 'border-slate-800 text-slate-600 hover:text-slate-300 hover:bg-slate-900'
                            }`}
                          >
                            <t.icon size={16} />
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 relative w-full h-full overflow-hidden">
                      {/* WRAPPING IN A DIV WITH FIXED SIZE TO ENSURE CANVAS CALCULATIONS WORK */}
                      <div className="absolute inset-0 w-full h-full">
                        <NetworkGlobe type={topology} devices={devices} />
                      </div>
                    </div>

                    {/* HUD OVERLAYS */}
                    <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between z-20 pointer-events-none">
                      <div className="glass px-8 py-6 rounded-3xl border-sky-500/20 pointer-events-auto shadow-2xl">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_12px_#0ea5e9] animate-pulse"></div>
                          <span className="text-[11px] font-black text-slate-200 uppercase tracking-[0.2em]">Neural Peering Vectors: ACTIVE</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-2.5 h-2.5 rounded-full bg-pink-400 opacity-60"></div>
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Protocol: NEXUS_V5_STABLE</span>
                        </div>
                      </div>
                      <div className="text-right pointer-events-auto">
                        <div className="font-orbitron text-8xl font-black text-white/5 opacity-10 select-none uppercase -mb-6 tracking-tighter">PROJECT_NEO</div>
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-3 inline-flex items-center gap-4 shadow-xl">
                          <Database size={18} className="text-sky-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Locked Vector:</span>
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">{topology}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TELEMETRY ANALYTICS */}
                  <div className="glass rounded-[3rem] p-10 space-y-10 relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                      <h3 className="text-white font-black tracking-[0.3em] text-sm flex items-center gap-4 uppercase font-orbitron">
                        <BarChart3 size={22} className="text-sky-400" /> Real-time Telemetry Stream
                      </h3>
                      <div className="flex gap-8">
                        <div className="flex items-center gap-3">
                           <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_#0ea5e9]"></div>
                           <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Inbound Vector</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-3 h-3 rounded-full bg-pink-400 shadow-[0_0_10px_#f472b6]"></div>
                           <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Outbound Vector</span>
                        </div>
                      </div>
                    </div>
                    <TrafficChart data={trafficHistory} />
                  </div>
                </>
              )}

              {activeTab === 'devices' && (
                <div className="glass rounded-[3rem] p-12 min-h-screen">
                  <div className="flex justify-between items-center mb-14">
                    <div>
                      <h2 className="text-4xl font-orbitron font-black text-white uppercase tracking-wider">Node Registry</h2>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.3em] mt-3">Verified Peer Entities: {devices.length}</p>
                    </div>
                    <button className="bg-sky-500 hover:bg-sky-400 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.25em] transition-all shadow-2xl shadow-sky-500/30 active:scale-95 flex items-center gap-4">
                      <RefreshCw size={18} /> Rescan Subnet
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {devices.map(d => (
                      <div key={d.id} className="glass p-8 rounded-[2rem] border-sky-500/10 hover:border-sky-500/40 transition-all duration-500 flex items-center justify-between group cursor-pointer hover:bg-sky-500/5">
                        <div className="flex items-center gap-8">
                          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-700 group-hover:rotate-12 ${
                            d.status === 'online' ? 'bg-sky-500/10 text-sky-400 shadow-[inset_0_0_20px_rgba(14,165,233,0.1)]' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {d.type === 'router' && <Globe size={36} />}
                            {d.type === 'server' && <Server size={36} />}
                            {d.type === 'workstation' && <Smartphone size={36} />}
                            {d.type === 'iot' && <Zap size={36} />}
                          </div>
                          <div>
                            <div className="font-orbitron font-black text-xl text-white mb-2 uppercase tracking-widest group-hover:text-sky-400 transition-colors">{d.name}</div>
                            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.2em]">{d.ip} // {d.type} // {d.traffic.toFixed(0)} MB/s</div>
                          </div>
                        </div>
                        <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                          d.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {d.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="glass rounded-[3rem] p-12 min-h-[800px] flex flex-col relative overflow-hidden">
                  <div className="flex items-center gap-8 mb-16 relative z-10">
                    <div className="w-20 h-20 bg-purple-500/20 rounded-[2rem] flex items-center justify-center border border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                      <BrainCircuit className="text-purple-400" size={42} />
                    </div>
                    <div>
                      <h2 className="text-4xl font-orbitron font-black text-white uppercase tracking-widest">Neural Intel Core</h2>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.3em] mt-3">Advanced Threat Synthesis Engine // Gemini v3.0</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-12 relative z-10">
                    <div className="space-y-6">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Entropy Data Buffer Injection</label>
                      <textarea 
                        value={logInput}
                        onChange={(e) => setLogInput(e.target.value)}
                        placeholder="Feed the neural core with raw system telemetry..."
                        className="w-full h-56 bg-slate-900/30 border border-slate-800 rounded-[2rem] p-10 text-sm font-mono text-slate-300 focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-800 resize-none custom-scroll shadow-inner"
                      />
                    </div>

                    <button 
                      onClick={handleAiAnalysis}
                      disabled={isAnalyzing}
                      className="w-full py-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 rounded-[2rem] font-black text-sm uppercase tracking-[0.5em] text-white shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-8 disabled:opacity-50"
                    >
                      {isAnalyzing ? <RefreshCw className="animate-spin" size={24} /> : <Shield size={24} />}
                      {isAnalyzing ? "SYNTHESIZING MATRIX..." : "EXECUTE DEEP AUDIT"}
                    </button>

                    {analysis && (
                      <div className="bg-slate-950/80 border border-purple-500/30 rounded-[3rem] p-12 animate-in slide-in-from-bottom-12 duration-1000 shadow-2xl backdrop-blur-3xl">
                        <h4 className="text-purple-400 font-black text-xs uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                          <MessageSquare size={20} /> SYNTHESIS LOG: STABLE_V3
                        </h4>
                        <div className="text-slate-300 text-base leading-[2.2] whitespace-pre-wrap font-medium">
                          {analysis}
                        </div>
                        
                        {suggestions.length > 0 && (
                          <div className="mt-16 pt-12 border-t border-slate-800">
                            <h4 className="text-emerald-400 font-black text-xs uppercase tracking-[0.4em] mb-10">Neural Remediation Vectors</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              {suggestions.map((s, i) => (
                                <div key={i} className="bg-slate-900 border border-emerald-500/15 p-8 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-loose shadow-xl">
                                   <div className="text-emerald-500 mb-4 font-black">VECTOR_{i+1}</div>
                                   {s}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECONDARY MONITORING STACK */}
            <div className="xl:col-span-4 space-y-10">
              
              <div className="glass rounded-[3rem] p-12 text-center relative overflow-hidden group perspective-hud">
                 <h3 className="text-slate-500 text-[10px] uppercase font-black tracking-[0.5em] mb-16 underline decoration-sky-500/20 underline-offset-8">Neural Integrity</h3>
                 <div className="relative w-72 h-72 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-[10px] border-slate-900 rounded-full"></div>
                    <div className="absolute inset-0 border-[10px] border-sky-500 rounded-full clip-path-half animate-[spin_8s_linear_infinite] opacity-30 shadow-[0_0_30px_rgba(14,165,233,0.3)]"></div>
                    <svg className="w-full h-full transform -rotate-90 relative z-10 filter drop-shadow-[0_0_15px_rgba(14,165,233,0.6)]">
                      <circle cx="144" cy="144" r="125" fill="transparent" stroke="#0ea5e9" strokeWidth="10" strokeDasharray="785" strokeDashoffset="45" strokeLinecap="round" className="animate-pulse" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-8xl font-orbitron font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(0,0,0,1)]">98</span>
                      <span className="text-[11px] text-sky-400 font-black uppercase tracking-[0.4em] mt-5 animate-pulse">OPTIMAL PEAK</span>
                    </div>
                 </div>
                 <div className="mt-16 grid grid-cols-2 gap-6">
                    <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-inner">
                       <div className="text-[10px] text-slate-600 font-black uppercase mb-2 tracking-widest">Encrypt Path</div>
                       <div className="text-[11px] text-sky-400 font-black">XTS-SHA-512</div>
                    </div>
                    <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-inner">
                       <div className="text-[10px] text-slate-600 font-black uppercase mb-2 tracking-widest">Neural Sync</div>
                       <div className="text-[11px] text-emerald-400 font-black">0.02ms Jitter</div>
                    </div>
                 </div>
              </div>

              <div className="glass rounded-[3rem] flex flex-col h-[750px] overflow-hidden">
                <div className="p-10 border-b border-sky-500/10 flex justify-between items-center bg-slate-950/40">
                  <h3 className="text-white font-black text-xs uppercase tracking-[0.4em] flex items-center gap-4">
                    <Shield size={22} className="text-orange-500" /> Adaptive Threat Intel
                  </h3>
                  <div className="px-5 py-2 bg-red-500/10 text-red-500 text-[10px] font-black rounded-full border border-red-500/30 uppercase animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">Watching</div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scroll p-10 space-y-8">
                  {alerts.map(a => (
                    <div key={a.id} className={`p-8 rounded-[2rem] border transition-all cursor-crosshair hover:scale-[1.03] hover:shadow-2xl flex flex-col gap-4 ${getAlertStyle(a.severity)}`}>
                      <div className="flex justify-between items-start">
                        <Shield size={22} />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{a.timestamp}</span>
                      </div>
                      <p className="text-[12px] font-black leading-relaxed tracking-[0.1em] uppercase">{a.message}</p>
                      <div className="mt-2 flex items-center gap-3">
                         <span className="text-[8px] font-black uppercase bg-white/10 px-2 py-0.5 rounded-md">Sector_{a.id}</span>
                         <ChevronRight size={14} className="opacity-40" />
                      </div>
                    </div>
                  ))}

                  <div className="pt-12 mt-10 border-t border-slate-800">
                    <h4 className="text-[11px] text-slate-600 font-black uppercase tracking-[0.4em] mb-8">Quantum Event Log // Nexus_01</h4>
                    <div className="bg-slate-950/80 p-8 rounded-3xl border border-slate-900 font-mono text-[10px] space-y-4 shadow-2xl">
                      <p className="text-emerald-500 flex gap-4"><span>[VERIFIED]</span> Secure handshaked with peer_node_99</p>
                      <p className="text-sky-500 flex gap-4"><span>[ROUTING]</span> Optimized path to NEXUS_CORE via zone_C</p>
                      <p className="text-orange-500 flex gap-4"><span>[SUSPICION]</span> Abnormal traffic burst on Node_X (WAF ALERT)</p>
                      <p className="text-slate-600 flex gap-4"><span>[SYSTEM]</span> Background entropy cleanup: 844 MB flushed</p>
                      <div className="flex items-center gap-3 animate-pulse mt-6">
                        <div className="w-2 h-4 bg-sky-500 shadow-[0_0_10px_#0ea5e9]"></div>
                        <span className="text-slate-700 tracking-[0.2em] font-black uppercase">Core listening for stimuli...</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="p-10 text-center text-[11px] font-black text-slate-600 hover:text-sky-400 border-t border-slate-800 transition-all uppercase tracking-[0.4em] hover:bg-sky-500/5">
                  Access Neural Archive Hub
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE MINI HUD */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-slate-950/95 backdrop-blur-3xl border-t border-sky-500/20 flex items-center justify-around z-50 px-10 shadow-2xl">
        <div className="flex flex-col items-center gap-2">
          <Activity size={24} className="text-sky-400" />
          <span className="text-[9px] font-black text-slate-400">{metrics.latency.toFixed(1)}MS Pulse</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Cpu size={24} className="text-purple-400" />
          <span className="text-[9px] font-black text-slate-400">SYNC: 58%</span>
        </div>
        <div className="flex flex-col items-center gap-2">
           <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
           <span className="text-[9px] font-black text-emerald-400">LINK_UP</span>
        </div>
      </div>
    </div>
  );
}

export default App;