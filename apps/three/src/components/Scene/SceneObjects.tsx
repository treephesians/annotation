import { Grid } from "@react-three/drei";

export function SceneObjects() {
  return (
    <>
      {/* Grid */}
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#4a4a4a"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#6a6a6a"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        position={[0, -0.01, 0]}
      />

      {/* Box - Orange */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {/* Sphere - Cyan */}
      <mesh position={[3, 1, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="cyan" />
      </mesh>

      {/* Cylinder - Lime */}
      <mesh position={[-3, 1.5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 3, 32]} />
        <meshStandardMaterial color="lime" />
      </mesh>

      {/* Cone - Magenta */}
      <mesh position={[0, 1, -3]}>
        <coneGeometry args={[1, 2, 32]} />
        <meshStandardMaterial color="magenta" />
      </mesh>

      {/* Torus - Gold */}
      <mesh position={[0, 1, 3]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.3, 16, 48]} />
        <meshStandardMaterial color="gold" />
      </mesh>
    </>
  );
}
