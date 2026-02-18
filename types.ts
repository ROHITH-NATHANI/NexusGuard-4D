
export type TopologyType = 'mesh' | 'grid' | 'ring' | 'hybrid' | 'star';

export interface NetworkDevice {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'alert';
  type: 'router' | 'server' | 'workstation' | 'iot';
  traffic: number;
  position?: [number, number, number];
}

export interface TrafficData {
  time: string;
  inbound: number;
  outbound: number;
}

export interface NetworkMetrics {
  latency: number;
  bandwidth: number;
  packetLoss: number;
  uptime: string;
}

export interface SecurityAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
}
