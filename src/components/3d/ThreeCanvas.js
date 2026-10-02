"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeCanvas({ className = "w-full h-full", interactive = true }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    let width = container.clientWidth || 300;
    let height = container.clientHeight || 300;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Group to hold all 3D objects
    const group = new THREE.Group();
    scene.add(group);

    // 1. Centerpiece: 3D Torus Knot with metallic glossy glass look
    const knotGeometry = new THREE.TorusKnotGeometry(1.1, 0.35, 128, 32);
    const knotMaterial = new THREE.MeshStandardMaterial({
      color: 0x6366f1, // Indigo
      roughness: 0.15,
      metalness: 0.85,
      flatShading: false,
    });
    const knotMesh = new THREE.Mesh(knotGeometry, knotMaterial);
    group.add(knotMesh);

    // 2. Inner Glowing Core: Icosahedron
    const coreGeometry = new THREE.IcosahedronGeometry(0.65, 1);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0xec4899, // Pink / Magenta
      roughness: 0.2,
      metalness: 0.9,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(coreMesh);

    // 3. Orbiting 3D Spheres representing Daily Activities & Habits
    const sphereCount = 5;
    const orbiters = [];
    const sphereColors = [0x38bdf8, 0x10b981, 0xf59e0b, 0xa855f7, 0xf43f5e];

    for (let i = 0; i < sphereCount; i++) {
      const geo = new THREE.SphereGeometry(0.22, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: sphereColors[i % sphereColors.length],
        roughness: 0.1,
        metalness: 0.7,
      });
      const orb = new THREE.Mesh(geo, mat);
      const angle = (i / sphereCount) * Math.PI * 2;
      const radius = 2.4;
      orb.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.7, Math.sin(angle) * 0.8);
      group.add(orb);
      orbiters.push({ mesh: orb, angle, radius, speed: 0.012 + i * 0.004 });
    }

    // 4. Subtle Ambient Floating Star / Sparkle Particles
    const particleCount = 60;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 8;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xc7d2fe,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x818cf8, 2.8);
    dirLight1.position.set(4, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf472b6, 2.2);
    dirLight2.position.set(-4, -3, 3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x38bdf8, 3, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // Mouse Interaction
    let targetX = 0;
    let targetY = 0;
    let isHovered = false;

    const onMouseMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.6;
      targetY = y * 0.6;
      pointLight.position.x = x * 3;
      pointLight.position.y = y * 3;
    };

    const onMouseEnter = () => {
      isHovered = true;
    };

    const onMouseLeave = () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
    };

    window.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    // Handle Resize
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || 300;
      height = container.clientHeight || 300;
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

      // Rotate group smoothly
      knotMesh.rotation.x = elapsedTime * 0.35;
      knotMesh.rotation.y = elapsedTime * 0.45;

      coreMesh.rotation.x = -elapsedTime * 0.5;
      coreMesh.rotation.y = -elapsedTime * 0.6;

      // Orbiters
      orbiters.forEach((item, index) => {
        item.angle += item.speed;
        item.mesh.position.x = Math.cos(item.angle) * item.radius;
        item.mesh.position.y = Math.sin(item.angle) * (item.radius * 0.6) + Math.sin(elapsedTime * 2 + index) * 0.2;
        item.mesh.position.z = Math.sin(item.angle) * 1.2;
      });

      // Subtle float particles
      particles.rotation.y = elapsedTime * 0.05;

      // Mouse follow interpolation
      group.rotation.y += (targetX - group.rotation.y) * 0.05;
      group.rotation.x += (-targetY - group.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
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
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      className={`relative cursor-grab active:cursor-grabbing select-none ${className}`}
    />
  );
}
