import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Points, 
  PointMaterial, 
  Line, 
  Text,
  Float,
  Center,
  OrbitControls,
  Stars,
  PerspectiveCamera
} from '@react-three/drei';
import * as THREE from 'three';
import { TopologyType, NetworkDevice } from '../types';

interface NodeMeshProps {
  position: [number, number, number];
  device: NetworkDevice;
}

const NodeMesh: React.FC<NodeMeshProps> = ({ position, device }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  
  const color = device.status === 'online' ? '#0ea5e9' : device.status === 'alert' ? '#f43f5e' : '#475569';
  
  useFrame((state) => {
    if (!meshRef.current || !glowRef.current || !ringRef.current) return;
    const t = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 4 + Number(device.id)) * 0.12;
    meshRef.current.scale.set(pulse, pulse, pulse);
    glowRef.current.scale.set(pulse * 1.6, pulse * 1.6, pulse * 1.6);
    ringRef.current.rotation.z += 0.02;
    ringRef.current.rotation.x += 0.01;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={5} 
          metalness={1} 
          roughness={0} 
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.5, 0.02, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.22}
        color="#ffffff"
        font="https://fonts.gstatic.com/s/orbitron/v25/yMJRMIPr_9zSaAd9nToO375aaA.woff"
        anchorX="center"
        outlineWidth={0.04}
        outlineColor="#000000"
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
    const speed = 0.6 + Math.random() * 0.4;
    const t = (state.clock.getElapsedTime() * speed) % 1;
    const pos = curve.getPoint(t);
    pulseRef.current.position.copy(pos);
  });

  return (
    <mesh ref={pulseRef}>
      <sphereGeometry args={[0.07, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
};

const TopologyVisualizer: React.FC<{ type: TopologyType; devices: NetworkDevice[] }> = ({ type, devices }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const laserRef = useRef<THREE.Mesh>(null!);

  const nodePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = devices.length;
    const radius = 6;

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
      case 'grid':
        const size = Math.ceil(Math.sqrt(count));
        const spacing = 4;
        for (let i = 0; i < count; i++) {
          const x = (i % size) - (size - 1) / 2;
          const y = Math.floor(i / size) - (size - 1) / 2;
          positions.push([x * spacing, y * spacing, 0]);
        }
        break;
      case 'mesh':
        for (let i = 0; i < count; i++) {
          const phi = Math.acos(-1 + (2 * i) / count);
          const theta = Math.sqrt(count * Math.PI) * phi;
          positions.push([
            radius * Math.cos(theta) * Math.sin(phi),
            radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(phi)
          ]);
        }
        break;
      case 'hybrid':
        positions.push([0, 0, 0]);
        for (let i = 1; i < 4; i++) {
          const angle = (i / 3) * Math.PI * 2;
          positions.push([Math.cos(angle) * 3, Math.sin(angle) * 3, 0]);
        }
        for (let i = 4; i < count; i++) {
          const angle = (i / (count - 4)) * Math.PI * 2;
          positions.push([Math.cos(angle) * 7, Math.sin(angle) * 7, Math.sin(i) * 4]);
        }
        break;
    }
    return positions;
  }, [type, devices.length]);

  const connections = useMemo(() => {
    const lines: React.ReactElement[] = [];
    const addLink = (i: number, j: number) => {
      if (!nodePositions[i] || !nodePositions[j]) return;
      const color = (devices[i]?.status === 'alert' || devices[j]?.status === 'alert') ? '#f43f5e' : '#0ea5e9';
      const start = new THREE.Vector3(...nodePositions[i]);
      const end = new THREE.Vector3(...nodePositions[j]);
      lines.push(
        <group key={`link-${i}-${j}-${type}`}>
          <Line points={[start, end]} color={color} lineWidth={2} transparent opacity={0.3} />
          <DataPulse start={start} end={end} color={color} />
        </group>
      );
    };

    switch (type) {
      case 'star':
        for (let i = 1; i < nodePositions.length; i++) addLink(0, i);
        break;
      case 'ring':
        for (let i = 0; i < nodePositions.length; i++) addLink(i, (i + 1) % nodePositions.length);
        break;
      case 'grid':
        const size = Math.ceil(Math.sqrt(nodePositions.length));
        for (let i = 0; i < nodePositions.length; i++) {
          if ((i + 1) % size !== 0 && i + 1 < nodePositions.length) addLink(i, i + 1);
          if (i + size < nodePositions.length) addLink(i, i + size);
        }
        break;
      case 'mesh':
        for (let i = 0; i < nodePositions.length; i++) {
          for (let j = i + 1; j < nodePositions.length; j++) {
            if (Math.random() > 0.6) addLink(i, j);
          }
        }
        break;
      case 'hybrid':
        for (let i = 1; i < 4; i++) addLink(0, i);
        for (let i = 4; i < nodePositions.length; i++) {
          addLink(i, (i + 1 >= nodePositions.length) ? 4 : i + 1);
          if (i % 2 === 0) addLink(i, 1 + (i % 3));
        }
        break;
    }
    return lines;
  }, [type, nodePositions, devices]);

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y += 0.003;
    if (laserRef.current) {
        const t = state.clock.getElapsedTime();
        laserRef.current.position.y = Math.sin(t * 1.5) * 8;
    }
  });

  return (
    <group ref={groupRef}>
      {nodePositions.map((pos, idx) => (
        <NodeMesh key={`node-${idx}-${type}`} position={pos} device={devices[idx]} />
      ))}
      {connections}
      <mesh ref={laserRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[12, 12, 0.05, 64]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.05} />
      </mesh>
    </group>
  );
};

const NetworkGlobe: React.FC<{ type: TopologyType, devices: NetworkDevice[] }> = ({ type, devices }) => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas 
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 20], fov: 45 }}
      >
        <color attach="background" args={['#020617']} />
        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 15, 10]} intensity={2} color="#0ea5e9" />
        <spotLight position={[-15, 20, 10]} angle={0.25} penumbra={1} intensity={1.5} color="#f472b6" />
        
        <Center>
          <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
            <TopologyVisualizer type={type} devices={devices} />
          </Float>
        </Center>
        
        <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} maxDistance={45} minDistance={12} />
        <fog attach="fog" args={['#020617', 20, 50]} />
      </Canvas>
    </div>
  );
};

export default NetworkGlobe;