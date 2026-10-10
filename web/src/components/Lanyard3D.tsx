import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF, useTexture } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import type { RapierRigidBody, RigidBodyProps } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'
import './Lanyard3D.css'

// Adapted from lanyardly/components/ui/lanyard.tsx with its original GLB and
// strap. The badge artwork is always supplied by the Aster page.
extend({ MeshLineGeometry, MeshLineMaterial })

export interface Lanyard3DProps {
  textureUrl: string
  fallbackUrl?: string
  paused?: boolean
  reducedMotion?: boolean
  className?: string
}

interface CardModel {
  nodes: Record<'card' | 'clip' | 'clamp', THREE.Mesh>
  materials: { metal: THREE.MeshStandardMaterial }
}

interface CaptureTarget {
  setPointerCapture: (pointerId: number) => void
  releasePointerCapture: (pointerId: number) => void
}

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error) {
    console.warn('[Aster lanyard] The 3D scene could not load:', error.message)
    this.props.onFailure()
  }
  render() { return this.state.failed ? null : this.props.children }
}

// HTMLImageElement decoding works in WebKit as well as Chromium, including
// environments without createImageBitmap. The request and image decode can
// both be cancelled; the object URL stays owned until its texture is released.
function decodeBadgeImage(blob: Blob, signal: AbortSignal): Promise<{ image: HTMLImageElement; release: () => void }> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException('Artwork request cancelled', 'AbortError')); return }
    const image = new Image()
    const url = URL.createObjectURL(blob)
    const removeListeners = () => {
      image.onload = null
      image.onerror = null
      signal.removeEventListener('abort', abort)
    }
    const release = () => { image.src = ''; URL.revokeObjectURL(url) }
    const abort = () => {
      removeListeners()
      release()
      reject(new DOMException('Artwork request cancelled', 'AbortError'))
    }
    image.onload = () => {
      removeListeners()
      if (!image.naturalWidth || !image.naturalHeight) {
        release()
        reject(new Error('Badge artwork has no image dimensions'))
        return
      }
      resolve({ image, release })
    }
    image.onerror = () => {
      removeListeners()
      release()
      reject(new Error('Badge artwork could not be decoded'))
    }
    signal.addEventListener('abort', abort, { once: true })
    image.src = url
  })
}

function StaticBadge({ url }: { url: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  return (
    <div className="lanyard-3d__fallback">
      {failedUrl === url ? (
        <span className="lanyard-3d__fallback-label" role="img" aria-label="Aster connection badge">Aster<br />Connection badge</span>
      ) : (
        <img src={url} alt="Aster connection badge" onError={() => setFailedUrl(url)} />
      )}
    </div>
  )
}

export default function Lanyard3D({ textureUrl, fallbackUrl, paused = false, reducedMotion = false, className = '' }: Lanyard3DProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  const ownedResources = useRef(new Set<{ texture: THREE.Texture; releaseImage: () => void }>())
  const frozen = paused || reducedMotion
  const onFailure = useCallback(() => setFailed(true), [])
  const onReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(query.matches)
    query.addEventListener('change', update)
    update()
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    void (async () => {
      try {
        const response = await fetch(textureUrl, { signal: controller.signal })
        if (!response.ok) throw new Error('Badge artwork could not be loaded')
        const blob = await response.blob()
        const { image, release } = await decodeBadgeImage(blob, controller.signal)
        if (cancelled) { release(); return }
        const next = new THREE.Texture(image)
        next.flipY = false
        next.colorSpace = THREE.SRGBColorSpace
        next.anisotropy = 16
        next.needsUpdate = true
        ownedResources.current.add({ texture: next, releaseImage: release })
        setTexture(next)
      } catch (error) {
        if (!cancelled) {
          console.warn('[Aster lanyard] Badge artwork could not load:', error instanceof Error ? error.message : 'Unknown image error')
          onFailure()
        }
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [textureUrl, onFailure])

  // Keep the previous custom badge visible until its replacement is committed.
  // Every decoded image and GPU texture is released once no longer displayed.
  useEffect(() => {
    for (const resource of ownedResources.current) {
      if (resource.texture === texture && !failed) continue
      resource.texture.dispose()
      resource.releaseImage()
      ownedResources.current.delete(resource)
    }
  }, [texture, failed])
  useEffect(() => () => {
    for (const resource of ownedResources.current) {
      resource.texture.dispose()
      resource.releaseImage()
    }
    ownedResources.current.clear()
  }, [])

  useEffect(() => {
    if (!canvas) return
    const lost = (event: Event) => {
      event.preventDefault()
      console.warn('[Aster lanyard] WebGL context was lost. Showing the static badge.')
      onFailure()
    }
    canvas.addEventListener('webglcontextlost', lost)
    return () => canvas.removeEventListener('webglcontextlost', lost)
  }, [canvas, onFailure])

  return (
    <div className={`lanyard-3d ${className}`}>
      {!failed && texture && (
        <SceneBoundary onFailure={onFailure}>
          <Canvas
            className="lanyard-3d__canvas"
            role="img"
            aria-label={frozen ? 'Aster connection badge on a lanyard' : 'Aster connection badge on a lanyard. Drag the badge to move it.'}
            aria-hidden={!ready}
            camera={{ position: [0, 0, 20], fov: 20 }}
            dpr={[1, mobile ? 1 : 1.5]}
            frameloop={frozen ? 'demand' : 'always'}
            gl={{ alpha: true, antialias: true }}
            fallback={<span>Aster connection badge</span>}
            onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); setCanvas(gl.domElement) }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={Math.PI} />
              <Physics gravity={[0, -40, 0]} timeStep={mobile ? 1 / 30 : 1 / 60} paused={frozen} updateLoop="follow">
                <Band texture={texture} frozen={frozen} mobile={mobile} onReady={onReady} />
              </Physics>
              <Environment blur={0.75} frames={1} resolution={128}>
                <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
              </Environment>
            </Suspense>
          </Canvas>
        </SceneBoundary>
      )}
      {(!ready || failed) && <StaticBadge url={fallbackUrl ?? textureUrl} />}
    </div>
  )
}

function Band({ texture, frozen, mobile, onReady }: { texture: THREE.Texture; frozen: boolean; mobile: boolean; onReady: () => void }) {
  const band = useRef<THREE.Mesh<MeshLineGeometry, MeshLineMaterial>>(null)
  const fixed = useRef<RapierRigidBody>(null!)
  const j1 = useRef<RapierRigidBody>(null!)
  const j2 = useRef<RapierRigidBody>(null!)
  const j3 = useRef<RapierRigidBody>(null!)
  const card = useRef<RapierRigidBody>(null!)
  const capture = useRef<{ target: CaptureTarget; pointerId: number } | null>(null)
  const { nodes, materials } = useGLTF('/lanyard/card.glb') as unknown as CardModel
  const strap = useTexture('/lanyard/strap.png')
  const { gl, size, invalidate } = useThree()
  const [dragged, setDragged] = useState<THREE.Vector3 | null>(null)
  const [hovered, setHovered] = useState(false)
  const vectors = useMemo(() => ({ position: new THREE.Vector3(), direction: new THREE.Vector3(), angular: new THREE.Vector3(), lerp1: new THREE.Vector3(), lerp2: new THREE.Vector3(), initialized: false }), [])
  const curve = useMemo(() => {
    const line = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 1.75, 0), new THREE.Vector3(0.12, 2.5, 0), new THREE.Vector3(0.05, 3.25, 0), new THREE.Vector3(0, 4, 0),
    ])
    line.curveType = 'chordal'
    return line
  }, [])
  const resolution = useMemo(() => new THREE.Vector2(size.width, size.height), [size.width, size.height])
  const badgeMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    map: texture, clearcoat: mobile ? 0 : 1, clearcoatRoughness: 0.15, roughness: 0.9, metalness: 0.8,
  }), [texture, mobile])
  const segmentProps: RigidBodyProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 }

  useEffect(() => () => badgeMaterial.dispose(), [badgeMaterial])

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]])

  const releaseCapture = useCallback(() => {
    const active = capture.current
    capture.current = null
    if (active) {
      try { active.target.releasePointerCapture(active.pointerId) } catch { /* The browser may have released a cancelled pointer already. */ }
    }
  }, [])
  const finishDrag = useCallback(() => { releaseCapture(); setDragged(null) }, [releaseCapture])

  useEffect(() => {
    const element = gl.domElement
    element.addEventListener('pointercancel', finishDrag)
    element.addEventListener('lostpointercapture', finishDrag)
    return () => {
      element.removeEventListener('pointercancel', finishDrag)
      element.removeEventListener('lostpointercapture', finishDrag)
      releaseCapture()
    }
  }, [gl, finishDrag, releaseCapture])

  useEffect(() => { if (frozen) finishDrag() }, [frozen, finishDrag])
  useEffect(() => {
    const previous = gl.domElement.style.cursor
    gl.domElement.style.cursor = frozen ? 'auto' : dragged ? 'grabbing' : hovered ? 'grab' : 'auto'
    return () => { gl.domElement.style.cursor = previous }
  }, [gl, frozen, dragged, hovered])

  useLayoutEffect(() => {
    strap.wrapS = strap.wrapT = THREE.RepeatWrapping
    band.current?.geometry.setPoints(curve.getPoints(mobile ? 16 : 32))
    onReady()
    invalidate()
  }, [strap, curve, mobile, onReady, invalidate])
  useEffect(() => { invalidate() }, [texture, frozen, size.width, size.height, invalidate])

  useFrame((state, delta) => {
    if (frozen || !fixed.current || !j1.current || !j2.current || !j3.current || !card.current) return
    const { position, direction, angular, lerp1, lerp2 } = vectors
    if (dragged) {
      position.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      direction.copy(position).sub(state.camera.position).normalize()
      position.add(direction.multiplyScalar(state.camera.position.length()))
      for (const ref of [card, j1, j2, j3]) ref.current.wakeUp()
      card.current.setNextKinematicTranslation(position.sub(dragged))
    }
    if (!vectors.initialized) {
      lerp1.copy(j1.current.translation())
      lerp2.copy(j2.current.translation())
      vectors.initialized = true
    }
    for (const [body, lerp] of [[j1.current, lerp1], [j2.current, lerp2]] as const) {
      const distance = Math.max(0.1, Math.min(1, lerp.distanceTo(body.translation())))
      lerp.lerp(body.translation(), Math.min(1, delta * distance * 50))
    }
    curve.points[0].copy(j3.current.translation())
    curve.points[1].copy(lerp2)
    curve.points[2].copy(lerp1)
    curve.points[3].copy(fixed.current.translation())
    band.current?.geometry.setPoints(curve.getPoints(mobile ? 16 : 32))
    angular.copy(card.current.angvel())
    card.current.setAngvel({ x: angular.x, y: angular.y - card.current.rotation().y * 0.25, z: angular.z }, false)
  })

  const startDrag = (event: ThreeEvent<PointerEvent>) => {
    if (frozen || !card.current || (event.pointerType === 'mouse' && event.button !== 0)) return
    event.stopPropagation()
    const target = event.target as unknown as CaptureTarget
    target.setPointerCapture(event.pointerId)
    capture.current = { target, pointerId: event.pointerId }
    setDragged(new THREE.Vector3().copy(event.point).sub(vectors.position.copy(card.current.translation())))
  }

  return (
    <>
      <group position={[0, 4, 0]} dispose={null}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody ref={j1} {...segmentProps} position={[0.05, -0.75, 0]}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody ref={j2} {...segmentProps} position={[0.12, -1.5, 0]}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody ref={j3} {...segmentProps} position={[0.2, -2.25, 0]}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody ref={card} {...segmentProps} position={[0.2, -3.7, 0]} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group scale={2.25} position={[0, -1.2, -0.05]} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} onPointerDown={startDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}>
            <mesh geometry={nodes.card.geometry} material={badgeMaterial} />
            <mesh geometry={nodes.clip.geometry} material={materials.metal} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial args={[{ resolution }]} color="white" depthTest={false} resolution={resolution} useMap={1} map={strap} repeat={new THREE.Vector2(-4, 1)} lineWidth={1} />
      </mesh>
    </>
  )
}
