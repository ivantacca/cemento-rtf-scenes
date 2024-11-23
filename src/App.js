import * as THREE from 'three'
import { useRef, useReducer, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { BallCollider, Physics, RigidBody } from '@react-three/rapier'
import { easing } from 'maath'
import { Effects } from './Effects'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'

const accents = ['#ff4060', '#ffcc00', '#20ffa0', '#4060ff']
const shuffle = (accent = 0) => [
  { color: '#444', roughness: 0.1, metalness: 0.1 },
  { color: '#444', roughness: 0.1, metalness: 0.1 },
  { color: '#444', roughness: 0.1, metalness: 0.1 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: 'white', roughness: 0.1, metalness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: '#444', roughness: 0.1 },
  { color: '#444', roughness: 0.3 },
  { color: '#444', roughness: 0.3 },
  { color: 'white', roughness: 0.1 },
  { color: 'white', roughness: 0.2 },
  { color: 'white', roughness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true, transparent: true, opacity: 0.5 },
  { color: accents[accent], roughness: 0.3, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true }
]

export default function App(props) {
  const [accent, click] = useReducer((state) => ++state % accents.length, 0)
  const connectors = useMemo(() => shuffle(accent), [accent])
  return (
    <Canvas flat shadows onClick={click} dpr={[1, 1.5]} gl={{ antialias: false }} camera={{ position: [0, 0, 30], fov: 17.5, near: 10, far: 40 }} {...props}>
      <color attach="background" args={['#141622']} />
      <Physics /*debug*/ timeStep="vary" gravity={[0, 0, 0]}>
        <Pointer />
        {connectors.map((props, i) => (
          <Sphere key={i} {...props} />
        ))}
      </Physics>
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={100} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
          <Lightformer form="ring" color="#4060ff" intensity={80} onUpdate={(self) => self.lookAt(0, 0, 0)} position={[10, 10, 0]} scale={10} />
        </group>
      </Environment>
      <Effects />
    </Canvas>
  )
}

function Block({ position, children, vec = new THREE.Vector3(), scale, r = THREE.MathUtils.randFloatSpread, accent, color = 'white', ...props }) {
  const api = useRef()
  const ref = useRef()
  const pos = useMemo(() => position || [r(10), r(10), r(10)], [])
  useFrame((state, delta) => {
    delta = Math.min(0.1, delta)
    api.current?.applyImpulse(vec.copy(api.current.translation()).negate().multiplyScalar(0.2))
    easing.dampC(ref.current.material.color, color, 0.2, delta)
  })
  return (
    <RigidBody linearDamping={4} angularDamping={1} friction={0.1} position={pos} ref={api} colliders={false}>
      <BallCollider args={[1]} />
      <mesh ref={ref} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial {...props} />
        {children}
      </mesh>
    </RigidBody>
  )
}

function Sphere({ position, children, vec = new THREE.Vector3(), scale, r = THREE.MathUtils.randFloatSpread, accent, color = 'white', ...props }) {
  const api = useRef()
  const ref = useRef()
  const pos = useMemo(() => position || [r(10), r(10), r(10)], [])
  useFrame((state, delta) => {
    delta = Math.min(0.1, delta)
    api.current?.applyImpulse(vec.copy(api.current.translation()).negate().multiplyScalar(0.2))
    easing.dampC(ref.current.material.color, color, 0.2, delta)
  })

  const [geometry, setGeometry] = useState(null)
  const scaleDelta = 0.008
  useEffect(() => {
    // Define the SVG path
    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 304 141">
        <path d="M303.008 23.226H304V0H0V23.226H0.991715C5.3137 23.296 9.43222 25.0637 12.448 28.1433C15.4637 31.2229 17.1317 35.3641 17.0874 39.6626V101.337C17.1317 105.636 15.4637 109.777 12.448 112.857C9.43222 115.936 5.3137 117.704 0.991715 117.774H0V141H304V117.774H303.008C298.684 117.707 294.562 115.941 291.544 112.861C288.525 109.781 286.856 105.638 286.9 101.337V39.6626C286.856 35.362 288.525 31.2189 291.544 28.139C294.562 25.059 298.684 23.2927 303.008 23.226ZM264.168 70.5127C264.168 96.6088 243.431 117.837 217.94 117.837H209.536C184.109 117.837 163.309 96.6088 163.309 70.5127C163.309 44.4165 184.071 23.226 209.575 23.226H217.978C243.47 23.226 264.168 44.4292 264.168 70.5127ZM140.615 70.5127C140.615 96.6088 119.866 117.837 94.3746 117.837H85.9835C60.4923 117.837 39.7561 96.6088 39.7561 70.5127C39.7561 44.4165 60.4923 23.2007 85.9835 23.2007H94.3746C119.904 23.226 140.653 44.4292 140.653 70.5127H140.615Z" fill="white"/>
      </svg>
    `

    // Use SVGLoader to parse the SVG path
    const loader = new SVGLoader()
    const svg = loader.parse(svgData)

    // Extract shapes from the SVG path, inverting the fill rule
    const shapes = svg.paths.flatMap((path) => path.toShapes(false)) // Using 'false' to make the holes transparent

    // Create 3D objects from the shapes with more polygons
    const geometry = new THREE.ExtrudeGeometry(shapes, { depth: 100, bevelEnabled: false, steps: 2 })
    geometry.center() // Center the geometry
    geometry.scale(scaleDelta, scaleDelta, scaleDelta) // Scale down by a factor of 3
    setGeometry(geometry)
  }, [])

  return (
    <RigidBody linearDamping={4} angularDamping={1} friction={0.1} position={pos} ref={api} colliders={false}>
      <BallCollider args={[1]} />
      {geometry ? (
        <mesh ref={ref} geometry={geometry}>
          <meshPhongMaterial color={0xffffff} />
        </mesh>
      ) : (
        <mesh ref={ref} castShadow receiveShadow>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial {...props} />
          {children}
        </mesh>
      )}
    </RigidBody>
  )
}

function Pointer({ vec = new THREE.Vector3() }) {
  const ref = useRef()
  useFrame(({ mouse, viewport }) => ref.current?.setNextKinematicTranslation(vec.set((mouse.x * viewport.width) / 2, (mouse.y * viewport.height) / 2, 0)))
  return (
    <RigidBody position={[0, 0, 0]} type="kinematicPosition" colliders={false} ref={ref}>
      <BallCollider args={[1]} />
    </RigidBody>
  )
}
