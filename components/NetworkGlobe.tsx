import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Line, 
  Html,
  Float,
  OrbitControls,
  Stars,
  PerspectiveCamera,
  PointMaterial,
  Points,
  Sphere
} from '@react-three/drei';
import * as THREE from 'three';
import { TopologyType, NetworkDevice } from '../types.ts';

interface NodeProps {
  position: [number, number, number];
  device: NetworkDevice;
}

const NodeEntity: React.FC<NodeProps> = ({ position, device }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const color = device.status === 'online' ? '#00f2ff' : device.status === 'alert' ? '#ff3131' : '#475569';
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const s = 1 + Math.sin(t * 4 + Number(device.id)) * 0.15;
    meshRef.current.scale.set(s, s, s);
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={2.5} 
          roughness={0} 
          metalness={1}
        />
      </mesh>
      <Html distanceFactor={10} center>
        <div className={`three-label ${device.status}`}>
          {device.name}
        </div>
      </Html>
    </group>
  );
};

const DataPulse: React.FC<{ start: THREE.Vector3; end: THREE.Vector3; color: string }> = ({ start, end, color }) => {
  const pulseRef = useRef<THREE.Mesh>(null!);
  const curve = useMemo(() => new THREE.LineCurve3(start, end), [start, end]);
  
  useFrame((state) => {
    if (!pulseRef.current) return;
    const t = (state.clock.getElapsedTime() * 0.8) % 1;
    pulseRef.current.position.copy(curve.getPoint(t));
    pulseRef.current.scale.setScalar(Math.sin(t * Math.PI) * 1.5);
  });

  return (
    <mesh ref={pulseRef}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
};

const NeuralLattice = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[8.5, 1]} />
      <meshBasicMaterial color="#00f2ff" wireframe transparent opacity={0.03} />
    </mesh>
  );
};

const TopologyEngine: React.FC<{ type: TopologyType; devices: NetworkDevice[] }> = ({ type, devices }) => {
  const groupRef = useRef<THREE.Group>(null!);

  const nodePositions = useMemo(() => {
    const pos: [number, number, number][] = [];
    const count = devices.length;
    const isMobile = window.innerWidth < 768;
    const radius = isMobile ? 4.5 : 7;

    switch (type) {
      case 'star':
        pos.push([0, 0, 0]);
        for (let i = 1; i < count; i++) {
          const a = (i / (count - 1)) * Math.PI * 2;
          pos.push([Math.cos(a) * radius, Math.sin(a) * radius, (Math.random() - 0.5) * 2]);
        }
        break;
      case 'ring':
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2;
          pos.push([Math.cos(a) * radius, Math.sin(a) * radius, 0]);
        }
        break;
      default: // mesh
        for (let i = 0; i < count; i++) {
          const phi = Math.acos(-1 + (2 * i) / count);
          const theta = Math.sqrt(count * Math.PI) * phi;
          pos.push([
            radius * Math.cos(theta) * Math.sin(phi),
            radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(phi)
          ]);
        }
    }
    return pos;
  }, [type, devices]);

  const links = useMemo(() => {
    const arr: React.ReactElement[] = [];
    const connect = (i: number, j: number) => {
      if (!nodePositions[i] || !nodePositions[j]) return;
      const s = new THREE.Vector3(...nodePositions[i]);
      const e = new THREE.Vector3(...nodePositions[j]);
      const color = devices[i].status === 'alert' || devices[j].status === 'alert' ? '#ff3131' : '#00f2ff';
      arr.push(
        <group key={`link-${i}-${j}`}>
          <Line points={[s, e]} color={color} lineWidth={1.5} transparent opacity={0.2} />
          <DataPulse start={s} end={e} color={color} />
        </group>
      );
    };

    if (type === 'star') for (let i = 1; i < nodePositions.length; i++) connect(0, i);
    else if (type === 'ring') for (let i = 0; i < nodePositions.length; i++) connect(i, (i + 1) % nodePositions.length);
    else {
      for (let i = 0; i < nodePositions.length; i++) {
        for (let j = i + 1; j < nodePositions.length; j++) {
          const d = new THREE.Vector3(...nodePositions[i]).distanceTo(new THREE.Vector3(...nodePositions[j]));
          if (d < 10) connect(i, j);
        }
      }
    }
    return arr;
  }, [type, nodePositions, devices]);

  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <group ref={groupRef}>
      {nodePositions.map((p, i) => (
        <NodeEntity key={i} position={p} device={devices[i]} />
      ))}
      {links}
    </group>
  );
};

const NetworkGlobe: React.FC<{ type: TopologyType; devices: NetworkDevice[] }> = ({ type, devices }) => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={40} />
        <color attach="background" args={['#020617']} />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1.5} />
        <NeuralLattice />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[20, 20, 20]} intensity={3} color="#00f2ff" />
        <pointLight position={[-20, -20, -20]} intensity={1.5} color="#ff00ea" />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <TopologyEngine type={type} devices={devices} />
        </Float>
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          maxDistance={30} 
          minDistance={8}
          enableDamping={true}
        />
      </Canvas>
    </div>
  );
};

export default NetworkGlobe;