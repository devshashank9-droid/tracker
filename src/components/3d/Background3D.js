"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";

export default function Background3D() {
  const mountRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // Group for 3D elements
    const mainGroup = new THREE.Group();
    // Position slightly towards top-right in background
    mainGroup.position.set(1.5, 0.5, 0);
    scene.add(mainGroup);

    // 1. Elegant Central Torus Knot
    const knotGeometry = new THREE.TorusKnotGeometry(1.2, 0.35, 100, 24);
    const knotMaterial = new THREE.MeshStandardMaterial({
      color: isDark ? 0x8b5cf6 : 0x7c3aed,
      roughness: 0.2,
      metalness: 0.85,
      transparent: true,
      opacity: isDark ? 0.48 : 0.28,
    });
    const knotMesh = new THREE.Mesh(knotGeometry, knotMaterial);
    mainGroup.add(knotMesh);

    // 2. Wireframe Inner Core
    const coreGeometry = new THREE.IcosahedronGeometry(0.75, 1);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: isDark ? 0x06b6d4 : 0x0891b2,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.4 : 0.25,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    mainGroup.add(coreMesh);

    // 3. Orbiting Habit Spheres
    const sphereCount = 5;
    const orbiters = [];
    const sphereColors = [0x06b6d4, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xf43f5e];

    for (let i = 0; i < sphereCount; i++) {
      const geo = new THREE.SphereGeometry(0.18, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: sphereColors[i % sphereColors.length],
        roughness: 0.2,
        metalness: 0.65,
        transparent: true,
        opacity: isDark ? 0.65 : 0.38,
      });
      const orb = new THREE.Mesh(geo, mat);
      const angle = (i / sphereCount) * Math.PI * 2;
      const radius = 2.6;
      orb.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.7, Math.sin(angle) * 0.8);
      mainGroup.add(orb);
      orbiters.push({ mesh: orb, angle, radius, speed: 0.008 + i * 0.003 });
    }

    // 4. Subtle Star Particles Floating in Space
    const particleCount = 75;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 14;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: isDark ? 0xc4b5fd : 0xa78bfa,
      size: 0.05,
      transparent: true,
      opacity: isDark ? 0.55 : 0.35,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.75 : 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x8b5cf6, isDark ? 2.4 : 2.6);
    dirLight1.position.set(4, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, isDark ? 2.0 : 1.8);
    dirLight2.position.set(-4, -3, 3);
    scene.add(dirLight2);

    // Smooth Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetX = mouseX * 0.35;
      targetY = mouseY * 0.25;
    };

    window.addEventListener("mousemove", onMouseMove);

    // Resize Handler
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle continuous rotation
      knotMesh.rotation.x = elapsedTime * 0.18;
      knotMesh.rotation.y = elapsedTime * 0.24;

      coreMesh.rotation.x = -elapsedTime * 0.25;
      coreMesh.rotation.y = -elapsedTime * 0.3;

      // Orbiters
      orbiters.forEach((item, index) => {
        item.angle += item.speed;
        item.mesh.position.x = Math.cos(item.angle) * item.radius;
        item.mesh.position.y =
          Math.sin(item.angle) * (item.radius * 0.6) + Math.sin(elapsedTime * 1.5 + index) * 0.15;
        item.mesh.position.z = Math.sin(item.angle) * 1.0;
      });

      // Subtle particle drift
      particles.rotation.y = elapsedTime * 0.02;

      // Gentle mouse parallax damping
      mainGroup.rotation.y += (targetX - mainGroup.rotation.y) * 0.03;
      mainGroup.rotation.x += (-targetY - mainGroup.rotation.x) * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      knotGeometry.dispose();
      knotMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [isDark]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}
