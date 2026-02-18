import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Line, 
  Text,
  Float,
  Center,
  OrbitControls,
  Stars
} from '@react-three/drei';
import * as THREE from 'three';
import { TopologyType, NetworkDevice } from '../types.ts';

interface NodeMeshProps {
  position: [number, number, number];
  device: NetworkDevice;
}

const NodeMesh: React.FC<NodeMeshProps> = ({ position, device }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  
  const color = device.status === 'online' ? '#0ea5e9' : device.status === 'alert' ? '#f43f5e' : '#475569';
  
  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return;
    const t = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 4 + Number(device.id)) * 0.1;
    meshRef.current.scale.set(pulse, pulse, pulse);
    glowRef.current.scale.set(pulse * 1.4, pulse * 1.4, pulse * 1.4);
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
      {/* 
          Using default Text parameters to minimize dynamic code evaluation 
          that often triggers CSP 'unsafe-eval' warnings in certain environments.
      */}
      <Text
        position={[0, 0.55, 0]}
        fontSize={0.18}
        color="#ffffff"
        font="https://fonts.gstatic.com/s/orbitron/v25/yMJRMIPr_9zSaAd9nToO375aaA.woff"
        anchorX="center"
        maxWidth={1}
        textAlign="center"
        // Force SDF rendering mode which is more CSP-friendly
        sdfGlyphSize={64}
      >
        {device.name}
      </Text>
    </group>
  );
};

const DataPulse: React.FC<{ start: THREE.Vector3, end: THREE.Vector3, color: string }> = ({ start, end, color }) => {
  const pulseRef = useRef<THREE.Mesh>(null!);
  const curve = useMemo(() => new THREE.LineCurve3(start, end), [start, end]);
  
  useFrame((state) => {
    if (!pulseRef.current) return;
    const t = (state.clock.getElapsedTime() * 0.6) % 1;
    pulseRef.current.position.copy(curve.getPoint(t));
  });

  return (
    <mesh ref={pulseRef}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

const TopologyVisualizer: React.FC<{ type: TopologyType; devices: NetworkDevice[] }> = ({ type, devices }) => {
  const groupRef = useRef<THREE.Group>(null!);

  const nodePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = devices.length;
    const isSmall = window.innerWidth < 768;
    const radius = isSmall ? 3.5 : 5.5;

    switch (type) {
      case 'star':
        positions.push([0, 0, 0]);
        for (let i = 1; i < count; i++) {
          const angle = (i / (count - 1)) * Math.PI * 2;
          positions.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0]);
        }
        break;
      case 'ring':
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          positions.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0]);
        }
        break;
      default: // mesh
        for (let i = 0; i < count; i++) {
          const phi = Math.acos(-1 + (2 * i) / count);
          const theta = Math.sqrt(count * Math.PI) * phi;
          positions.push([
            radius * Math.cos(theta) * Math.sin(phi),
            radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(phi)
          ]);
        }
    }
    return positions;
  }, [type, devices.length]);

  const connections = useMemo(() => {
    const lines: React.ReactElement[] = [];
    const addLink = (i: number, j: number) => {
      if (!nodePositions[i] || !nodePositions[j]) return;
      const start = new THREE.Vector3(...nodePositions[i]);
      const end = new THREE.Vector3(...nodePositions[j]);
      const color = devices[i]?.status === 'alert' ? '#f43f5e' : '#0ea5e9';
      lines.push(
        <group key={`l-${i}-${j}`}>
          <Line points={[start, end]} color={color} lineWidth={0.5} transparent opacity={0.15} />
          <DataPulse start={start} end={end} color={color} />
        </group>
      );
    };

    if (type === 'star') for (let i = 1; i < nodePositions.length; i++) addLink(0, i);
    else if (type === 'ring') for (let i = 0; i < nodePositions.length; i++) addLink(i, (i + 1) % nodePositions.length);
    else {
      for (let i = 0; i < nodePositions.length; i++) {
         for (let j = i + 1; j < nodePositions.length; j++) {
            if (Math.random() > 0.6) addLink(i, j);
         }
      }
    }

    return lines;
  }, [type, nodePositions, devices]);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.0015;
  });

  return (
    <group ref={groupRef}>
      {nodePositions.map((pos, idx) => (
        <NodeMesh key={idx} position={pos} device={devices[idx]} />
      ))}
      {connections}
    </group>
  );
};

const NetworkGlobe: React.FC<{ type: TopologyType, devices: NetworkDevice[] }> = ({ type, devices }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas 
        camera={{ position: [0, 0, isMobile ? 10 : 16], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#020617']} />
        <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#0ea5e9" />
        
        <Center>
          <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
            <TopologyVisualizer type={type} devices={devices} />
          </Float>
        </Center>
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          maxDistance={25} 
          minDistance={6}
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
        />
      </Canvas>
    </div>
  );
};

export default NetworkGlobe;