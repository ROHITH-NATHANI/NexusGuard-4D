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
  Database,
  Lock
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

  const getAlertStyle = (sev: SecurityAlert['severity']) => {
    switch(sev) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'high': return 'border-orange-500 bg-orange-500/10 text-orange-400';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      default: return 'border-sky-500 bg-sky-500/10 text-sky-400';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-mono selection:bg-sky-500/40">
      <div className="scanline"></div>
      
      {/* SIDEBAR NAVIGATION */}
      <nav className="w-24 border-r border-sky-500/10 bg-slate-950/80 backdrop-blur-3xl flex flex-col items-center py-10 gap-16 shrink-0 z-50">
        <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-500/30 relative group cursor-pointer shadow-[0_0_30px_rgba(14,165,233,0.2)]">
          <Radar className="text-sky-400 animate-spin-slow" size={36} />
          <div className="absolute -inset-4 bg-sky-400/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="flex flex-col gap-12">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'HUB' },
            { id: 'devices', icon: Server, label: 'ENTITIES' },
            { id: 'ai', icon: BrainCircuit, label: 'NEURAL' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-3 p-3 transition-all duration-300 group ${
                activeTab === tab.id ? 'text-sky-400 scale-110' : 'text-slate-600 hover:text-slate-300'
              }`}
            >
              <tab.icon size={32} />
              <span className="text-[9px] font-black tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-10">
          <button className="text-slate-700 hover:text-sky-400 transition-colors"><Terminal size={24} /></button>
          <button className="text-slate-700 hover:text-sky-400 transition-colors"><Settings size={24} /></button>
        </div>
      </nav>

      {/* PRIMARY WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-24 border-b border-sky-500/10 flex items-center justify-between px-12 bg-slate-950/60 backdrop-blur-2xl z-40 shrink-0">
          <div className="flex items-center gap-10">
            <h1 className="font-orbitron text-3xl font-black tracking-tighter text-sky-400 glitch-text uppercase">
              NexusGuard <span className="text-white">4D</span>
            </h1>
            <div className="hidden lg:flex items-center gap-5 px-6 py-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]"></span>
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em]">Quantum Sync Status: Nominal</span>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <div className="hidden xl:flex flex-col items-end gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Synapse Load</span>
              <div className="w-64 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div className="h-full bg-sky-500 shadow-[0_0_15px_#0ea5e9] rounded-full" style={{ width: '64%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-8 border-l border-slate-800 pl-10">
               <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Grid Uplink</div>
                  <div className="text-sm font-black text-sky-400">984.2 GB / SEC</div>
               </div>
               <div className="w-14 h-14 rounded-2xl border border-sky-500/20 bg-sky-500/5 flex items-center justify-center text-sky-400 shadow-[inset_0_0_15px_rgba(14,165,233,0.1)]">
                 <Wifi size={28} />
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scroll p-12">
          <div className="max-w-[1920px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-12">
            
            {/* MAIN HUB MODULES */}
            <div className="xl:col-span-8 space-y-12">
              {activeTab === 'dashboard' && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                    {[
                      { label: 'Latency', val: `${metrics.latency.toFixed(2)}ms`, icon: Activity, color: 'text-sky-400' },
                      { label: 'Throughput', val: `${(metrics.bandwidth / 1000).toFixed(2)}Gbps`, icon: Zap, color: 'text-pink-400' },
                      { label: 'Uptime', val: metrics.uptime, icon: Radio, color: 'text-emerald-400' },
                      { label: 'Entropy', val: 'Minimal', icon: Shield, color: 'text-orange-400' }
                    ].map((m, i) => (
                      <div key={i} className="glass p-10 rounded-[2.5rem] hud-border group cursor-crosshair hover:bg-sky-500/5 transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">{m.label}</span>
                          <m.icon size={24} className={m.color} />
                        </div>
                        <div className="text-4xl font-orbitron font-black text-white">{m.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* 3D TOPOLOGY UNIT */}
                  <div className="glass rounded-[3.5rem] h-[750px] border-sky-500/10 relative overflow-hidden flex flex-col shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center justify-between p-12 z-20">
                      <div>
                        <h3 className="text-white font-black tracking-[0.4em] text-base flex items-center gap-5 uppercase font-orbitron">
                          <Radar size={28} className="text-sky-400" /> Neural Topology Matrix
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase mt-3 tracking-widest">Projection: 4D_VIRTUAL // Node Count: {devices.length}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 bg-slate-950/90 p-3 rounded-2xl border border-sky-500/20 mt-8 md:mt-0 backdrop-blur-3xl shadow-2xl">
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
                            className={`flex items-center gap-3 px-7 py-3 rounded-xl border text-xs font-black uppercase transition-all duration-300 ${
                              topology === t.id ? 'bg-sky-500/20 border-sky-400 text-sky-400 shadow-[0_0_25px_rgba(14,165,233,0.4)] scale-105' : 'border-slate-800 text-slate-600 hover:text-slate-300'
                            }`}
                          >
                            <t.icon size={18} />
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 relative w-full h-full overflow-hidden">
                      <NetworkGlobe type={topology} devices={devices} />
                    </div>

                    {/* HUD OVERLAYS */}
                    <div className="absolute bottom-12 left-12 right-12 flex items-end justify-between z-20 pointer-events-none">
                      <div className="glass px-10 py-8 rounded-[2rem] border-sky-500/30 pointer-events-auto shadow-2xl backdrop-blur-3xl">
                        <div className="flex items-center gap-5 mb-5">
                          <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_15px_#0ea5e9] animate-pulse"></div>
                          <span className="text-xs font-black text-slate-100 uppercase tracking-[0.3em]">Peering State: SYNCED</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-3 h-3 rounded-full bg-pink-400 opacity-60"></div>
                          <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Channel: CRYPT_X_99</span>
                        </div>
                      </div>
                      <div className="text-right pointer-events-auto">
                        <div className="font-orbitron text-9xl font-black text-white/5 opacity-10 select-none uppercase -mb-8 tracking-tighter">GRID_NULL</div>
                        <div className="bg-slate-900/90 border border-slate-700 rounded-2xl px-8 py-4 inline-flex items-center gap-5 shadow-2xl">
                          <Database size={22} className="text-sky-500" />
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Locked Vector:</span>
                          <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">{topology}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TELEMETRY ANALYTICS */}
                  <div className="glass rounded-[3.5rem] p-12 space-y-12 relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                      <h3 className="text-white font-black tracking-[0.4em] text-base flex items-center gap-5 uppercase font-orbitron">
                        <BarChart3 size={28} className="text-sky-400" /> Real-time Bitstream Telemetry
                      </h3>
                      <div className="flex gap-10">
                        <div className="flex items-center gap-4">
                           <div className="w-4 h-4 rounded-full bg-sky-400 shadow-[0_0_15px_#0ea5e9]"></div>
                           <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Inbound Vector</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-4 h-4 rounded-full bg-pink-400 shadow-[0_0_15px_#f472b6]"></div>
                           <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Outbound Vector</span>
                        </div>
                      </div>
                    </div>
                    <TrafficChart data={trafficHistory} />
                  </div>
                </>
              )}

              {activeTab === 'devices' && (
                <div className="glass rounded-[3.5rem] p-14 min-h-screen">
                  <div className="flex justify-between items-center mb-16">
                    <div>
                      <h2 className="text-5xl font-orbitron font-black text-white uppercase tracking-tight">Grid Entities</h2>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.4em] mt-5">Verified Node Count: {devices.length}</p>
                    </div>
                    <button className="bg-sky-500 hover:bg-sky-400 text-white px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.3em] transition-all shadow-3xl shadow-sky-500/40 active:scale-95 flex items-center gap-5">
                      <RefreshCw size={20} /> Force Re-peering
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {devices.map(d => (
                      <div key={d.id} className="glass p-10 rounded-[2.5rem] border-sky-500/10 hover:border-sky-500/50 transition-all duration-500 flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-10">
                          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-1000 group-hover:rotate-12 ${
                            d.status === 'online' ? 'bg-sky-500/10 text-sky-400 shadow-[inset_0_0_30px_rgba(14,165,233,0.15)]' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {d.type === 'router' && <Globe size={42} />}
                            {d.type === 'server' && <Server size={42} />}
                            {d.type === 'workstation' && <Smartphone size={42} />}
                            {d.type === 'iot' && <Zap size={42} />}
                          </div>
                          <div>
                            <div className="font-orbitron font-black text-2xl text-white mb-2 uppercase tracking-widest">{d.name}</div>
                            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">{d.ip} // {d.type}</div>
                          </div>
                        </div>
                        <div className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.3em] border shadow-2xl ${
                          d.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          {d.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="glass rounded-[3.5rem] p-16 min-h-[900px] flex flex-col relative overflow-hidden">
                  <div className="flex items-center gap-10 mb-20 relative z-10">
                    <div className="w-24 h-24 bg-purple-500/20 rounded-[2.5rem] flex items-center justify-center border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.4)]">
                      <BrainCircuit className="text-purple-400" size={56} />
                    </div>
                    <div>
                      <h2 className="text-5xl font-orbitron font-black text-white uppercase tracking-tight">Neural Core X1</h2>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.4em] mt-5">Autonomous Threat Synthesis Subsystem // Gemini AI</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-16 relative z-10">
                    <div className="space-y-8">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-[0.5em]">Input Telemetry Stream</label>
                      <textarea 
                        value={logInput}
                        onChange={(e) => setLogInput(e.target.value)}
                        placeholder="Feed raw packet logs into the neural buffer..."
                        className="w-full h-64 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-12 text-sm font-mono text-slate-200 focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-800 resize-none custom-scroll"
                      />
                    </div>

                    <button 
                      onClick={handleAiAnalysis}
                      disabled={isAnalyzing}
                      className="w-full py-10 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 rounded-[2.5rem] font-black text-base uppercase tracking-[0.6em] text-white shadow-3xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-10 disabled:opacity-50"
                    >
                      {isAnalyzing ? <RefreshCw className="animate-spin" size={32} /> : <Shield size={32} />}
                      {isAnalyzing ? "SYNTHESIZING MATRIX..." : "INITIATE DEEP NEURAL AUDIT"}
                    </button>

                    {analysis && (
                      <div className="bg-slate-950/90 border border-purple-500/40 rounded-[3.5rem] p-16 animate-in slide-in-from-bottom-16 duration-1000 shadow-3xl backdrop-blur-3xl">
                        <h4 className="text-purple-400 font-black text-sm uppercase tracking-[0.5em] mb-12 flex items-center gap-5">
                          <MessageSquare size={24} /> SYNTHESIS LOG // STABLE
                        </h4>
                        <div className="text-slate-200 text-lg leading-[2.5] whitespace-pre-wrap font-medium">
                          {analysis}
                        </div>
                        
                        {suggestions.length > 0 && (
                          <div className="mt-20 pt-16 border-t border-slate-800">
                            <h4 className="text-emerald-400 font-black text-sm uppercase tracking-[0.5em] mb-12">Remediation Vectors</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                              {suggestions.map((s, i) => (
                                <div key={i} className="bg-slate-900/50 border border-emerald-500/20 p-10 rounded-3xl text-xs font-black text-slate-300 uppercase tracking-[0.2em] leading-loose shadow-2xl">
                                   <div className="text-emerald-500 mb-5 font-black flex items-center gap-3"><Lock size={14}/> VECTOR_{i+1}</div>
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
            <div className="xl:col-span-4 space-y-12">
              
              <div className="glass rounded-[3.5rem] p-16 text-center relative overflow-hidden group">
                 <h3 className="text-slate-500 text-xs uppercase font-black tracking-[0.6em] mb-20 underline decoration-sky-500/30 underline-offset-8">Grid Integrity</h3>
                 <div className="relative w-80 h-80 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-[12px] border-slate-900 rounded-full shadow-inner"></div>
                    <div className="absolute inset-0 border-[12px] border-sky-500 rounded-full clip-path-half animate-[spin_10s_linear_infinite] opacity-40 shadow-[0_0_50px_rgba(14,165,233,0.4)]"></div>
                    <svg className="w-full h-full transform -rotate-90 relative z-10 filter drop-shadow-[0_0_20px_rgba(14,165,233,0.7)]">
                      <circle cx="160" cy="160" r="140" fill="transparent" stroke="#0ea5e9" strokeWidth="12" strokeDasharray="880" strokeDashoffset="55" strokeLinecap="round" className="animate-pulse" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-9xl font-orbitron font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(0,0,0,1)]">98</span>
                      <span className="text-xs text-sky-400 font-black uppercase tracking-[0.5em] mt-7 animate-pulse">OPTIMAL FLOW</span>
                    </div>
                 </div>
                 <div className="mt-20 grid grid-cols-2 gap-8">
                    <div className="bg-slate-900/80 p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
                       <div className="text-[11px] text-slate-600 font-black uppercase mb-3 tracking-widest">Protocol</div>
                       <div className="text-xs text-sky-400 font-black">X-PATH-714</div>
                    </div>
                    <div className="bg-slate-900/80 p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
                       <div className="text-[11px] text-slate-600 font-black uppercase mb-3 tracking-widest">Sync Rate</div>
                       <div className="text-xs text-emerald-400 font-black">0.002ms</div>
                    </div>
                 </div>
              </div>

              <div className="glass rounded-[3.5rem] flex flex-col h-[850px] overflow-hidden">
                <div className="p-12 border-b border-sky-500/10 flex justify-between items-center bg-slate-950/50">
                  <h3 className="text-white font-black text-sm uppercase tracking-[0.5em] flex items-center gap-5">
                    <Shield size={26} className="text-orange-500" /> Active Threat Stream
                  </h3>
                  <div className="px-6 py-2.5 bg-red-500/10 text-red-500 text-xs font-black rounded-full border border-red-500/40 uppercase animate-pulse shadow-3xl shadow-red-500/20">Active Scan</div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scroll p-12 space-y-10">
                  {alerts.map(a => (
                    <div key={a.id} className={`p-10 rounded-[2.5rem] border transition-all cursor-pointer hover:scale-[1.04] shadow-2xl flex flex-col gap-5 ${getAlertStyle(a.severity)}`}>
                      <div className="flex justify-between items-start">
                        <Shield size={26} />
                        <span className="text-[11px] font-black uppercase tracking-widest opacity-60">{a.timestamp}</span>
                      </div>
                      <p className="text-sm font-black leading-relaxed tracking-wider uppercase">{a.message}</p>
                      <div className="mt-3 flex items-center gap-4">
                         <span className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded-lg">Sector_Alpha</span>
                         <ChevronRight size={18} className="opacity-40" />
                      </div>
                    </div>
                  ))}

                  <div className="pt-16 mt-12 border-t border-slate-800">
                    <h4 className="text-xs text-slate-600 font-black uppercase tracking-[0.5em] mb-10">Neural Event Matrix // Nexus</h4>
                    <div className="bg-slate-950/90 p-10 rounded-[2.5rem] border border-slate-900 font-mono text-[11px] space-y-5 shadow-inner">
                      <p className="text-emerald-500 flex gap-5"><span>[OK]</span> Peer authentication with NODE_SEC_X verified</p>
                      <p className="text-sky-500 flex gap-5"><span>[OPTIMIZE]</span> Re-routing traffic through low-latency zone C</p>
                      <p className="text-orange-500 flex gap-5"><span>[ANOMALY]</span> Non-standard handshake on Port 8080</p>
                      <p className="text-slate-600 flex gap-5"><span>[LOG]</span> Background entropy flushing... 92% complete</p>
                      <div className="flex items-center gap-4 animate-pulse mt-8">
                        <div className="w-2.5 h-5 bg-sky-500 shadow-[0_0_15px_#0ea5e9]"></div>
                        <span className="text-slate-700 tracking-[0.3em] font-black uppercase">Grid listening for stimuli...</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="p-12 text-center text-xs font-black text-slate-700 hover:text-sky-400 border-t border-slate-800 transition-all uppercase tracking-[0.5em] hover:bg-sky-500/5">
                  Access Secure Archive Buffer
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE HUD */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-slate-950/95 backdrop-blur-3xl border-t border-sky-500/20 flex items-center justify-around z-50 px-12 shadow-3xl">
        <div className="flex flex-col items-center gap-3">
          <Activity size={28} className="text-sky-400" />
          <span className="text-[10px] font-black text-slate-500">{metrics.latency.toFixed(1)}MS Pulse</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Cpu size={28} className="text-purple-400" />
          <span className="text-[10px] font-black text-slate-500">GRID: 64%</span>
        </div>
        <div className="flex flex-col items-center gap-3">
           <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping shadow-[0_0_20px_#10b981]"></div>
           <span className="text-[10px] font-black text-emerald-400 uppercase">UPLINK</span>
        </div>
      </div>
    </div>
  );
}

export default App;