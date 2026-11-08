'use client';

import { useEffect, useRef } from 'react';
import { isLowPowerDevice, prefersReducedMotion } from '@/lib/motion';

/**
 * WebGL Fluid Caustic & Ambient Light Distortion Canvas.
 *
 * Renders an interactive luxury caustic light field using pure WebGL shaders:
 * - Fluid undulating caustics with warm champagne & amber refractions
 * - Smooth pointer velocity displacement (interactive ripples as cursor moves)
 * - Zero external library dependencies (pure GLSL, runs at 60/120fps)
 * - Automatically pauses render loop when offscreen or on low-power devices
 */
export default function HeroCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (prefersReducedMotion() || isLowPowerDevice()) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    if (!gl) return;

    // Vertex Shader: full-screen quad
    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = (position + 1.0) * 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: fluid caustic refraction & warm champagne light drift
    const fsSource = `
      precision mediump float;
      uniform vec2 uResolution;
      uniform vec2 uPointer;
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;

      // Simplex-style noise helper
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 p = uv * aspect;
        vec2 ptr = (uPointer / uResolution) * aspect;

        float dist = distance(p, ptr);
        float ripple = sin(dist * 22.0 - uTime * 3.5) * exp(-dist * 4.0) * uIntensity;

        // Multi-octave organic caustic drift
        float t = uTime * 0.18;
        float n1 = snoise(p * 1.8 + vec2(t * 0.5, t * 0.3));
        float n2 = snoise(p * 3.4 - vec2(t * 0.4, -t * 0.2) + vec2(ripple));
        float caustic = pow(abs(n1 + n2 * 0.5), 2.2);

        // Quiet luxury palette: deep obsidian (#080808) + champagne gold (#c5a880) + subtle burgundy pulse (#6b1d28)
        vec3 deepInk = vec3(0.031, 0.031, 0.031);
        vec3 champagne = vec3(0.77, 0.66, 0.50);
        vec3 burgundy = vec3(0.38, 0.10, 0.14);

        // Blend caustics into dark atmosphere
        vec3 col = deepInk;
        col += champagne * caustic * 0.22;
        col += burgundy * (ripple * 0.45);

        // Edge vignette
        float vignette = smoothstep(1.2, 0.2, length(uv - 0.5));
        float alpha = (caustic * 0.45 + abs(ripple) * 0.35) * vignette;

        gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.65));
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    // Quad geometry
    const positionLocation = gl.getAttribLocation(program, 'position');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uPointer = gl.getUniformLocation(program, 'uPointer');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uIntensity = gl.getUniformLocation(program, 'uIntensity');

    let animationFrameId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let velocity = 0;

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (width !== w || height !== h) {
        width = w;
        height = h;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
        targetX = canvas.width * 0.5;
        targetY = canvas.height * 0.5;
        currentX = targetX;
        currentY = targetY;
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const handlePointerMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const px = (e.clientX - rect.left) * dpr;
      const py = (rect.height - (e.clientY - rect.top)) * dpr; // GL inverted Y

      const dx = px - targetX;
      const dy = py - targetY;
      velocity = Math.min(Math.sqrt(dx * dx + dy * dy) / 40, 1.0);

      targetX = px;
      targetY = py;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // Intersection Observer to stop loop when not visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    let startTime = performance.now();

    const render = (now: number) => {
      if (isVisible) {
        // Smooth cursor interpolation (inertia)
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        velocity *= 0.94;

        const elapsed = (now - startTime) * 0.001;

        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.uniform2f(uPointer, currentX, currentY);
        gl.uniform1f(uTime, elapsed);
        gl.uniform1f(uIntensity, Math.max(velocity, 0.15));

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handlePointerMove);
      observer.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-[1] h-full w-full mix-blend-screen opacity-90 ${className}`}
      aria-hidden="true"
    />
  );
}
