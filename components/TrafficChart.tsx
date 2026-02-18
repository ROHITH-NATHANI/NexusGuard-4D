
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrafficData } from '../types';

interface Props {
  data: TrafficData[];
}

const TrafficChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 mt-4 flex items-center justify-center border border-slate-800 rounded-2xl bg-slate-900/20">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Stream...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-64 mt-4 overflow-hidden" style={{ minHeight: '256px' }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.5} />
          <XAxis 
            dataKey="time" 
            stroke="#475569" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false} 
            minTickGap={30}
          />
          <YAxis 
            stroke="#475569" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(val) => `${val}Mb`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '8px' }}
            itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
            labelStyle={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}
          />
          <Area 
            isAnimationActive={false}
            type="monotone" 
            dataKey="inbound" 
            stroke="#0ea5e9" 
            fillOpacity={1} 
            fill="url(#colorIn)" 
            strokeWidth={2}
          />
          <Area 
            isAnimationActive={false}
            type="monotone" 
            dataKey="outbound" 
            stroke="#f472b6" 
            fillOpacity={1} 
            fill="url(#colorOut)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrafficChart;
