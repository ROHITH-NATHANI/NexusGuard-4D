import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrafficData } from '../types';

interface Props {
  data: TrafficData[];
}

const TrafficChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        width: '100%', 
        height: '256px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        border: '1px solid rgba(14, 165, 233, 0.1)', 
        borderRadius: '24px', 
        background: 'rgba(15, 23, 42, 0.2)',
        color: '#475569',
        fontSize: '11px',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.2em'
      }}>
        Initializing Stream...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '256px', marginTop: '32px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
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
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(14, 165, 233, 0.2)', borderRadius: '12px', color: '#fff' }}
            itemStyle={{ fontSize: '10px' }}
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