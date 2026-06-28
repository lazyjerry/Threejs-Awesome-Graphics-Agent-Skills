import * as THREE from "three";

export const poolWaterDebugModes = new Map([
  ["final", 0],
  ["height", 1],
  ["normals", 2],
  ["velocity", 3],
  ["caustics", 4],
]);

const passVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

function createSimulationTarget(resolution) {
  const target = new THREE.WebGLRenderTarget(resolution, resolution, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });
  target.texture.generateMipmaps = false;
  return target;
}

function createPassMaterial(fragmentShader, uniforms = {}) {
  return new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms,
    vertexShader: passVertexShader,
    fragmentShader,
  });
}

export class InteractiveWaterHeightfield {
  constructor(renderer, {
    resolution = 256,
    damping = 0.995,
    waveSpeed = 2,
  } = {}) {
    this.renderer = renderer;
    this.resolution = resolution;
    this.textureA = createSimulationTarget(resolution);
    this.textureB = createSimulationTarget(resolution);
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.scene.add(this.quad);

    this.dropMaterial = createPassMaterial(
      `
        precision highp float;
        uniform sampler2D tInput;
        uniform vec2 center;
        uniform float radius;
        uniform float strength;
        varying vec2 vUv;

        void main() {
          vec4 info = texture2D(tInput, vUv);
          float d = distance(vUv, center);
          float pulse =
            (1.0 - smoothstep(radius * 0.18, radius, d)) *
            (0.5 + 0.5 * cos(3.14159265 * d / max(radius, 1e-4)));
          info.r += pulse * strength;
          info.g += pulse * strength * 0.35;
          gl_FragColor = info;
        }
      `,
      {
        tInput: { value: null },
        center: { value: new THREE.Vector2() },
        radius: { value: 0.05 },
        strength: { value: 0.1 },
      },
    );

    this.sphereMaterial = createPassMaterial(
      `
        precision highp float;
        uniform sampler2D tInput;
        uniform vec3 oldCenter;
        uniform vec3 newCenter;
        uniform float radius;
        uniform float displacementScale;
        varying vec2 vUv;

        float volumeInSphere(vec3 center) {
          vec3 toCenter = vec3(vUv.x * 2.0 - 1.0, 0.0, vUv.y * 2.0 - 1.0) - center;
          float t = length(toCenter) / radius;
          float dy = exp(-pow(t * 1.5, 6.0));
          float ymin = min(0.0, center.y - dy);
          float ymax = min(max(0.0, center.y + dy), ymin + 2.0 * dy);
          return (ymax - ymin) * 0.1 * displacementScale;
        }

        void main() {
          vec4 info = texture2D(tInput, vUv);
          info.r += volumeInSphere(oldCenter);
          info.r -= volumeInSphere(newCenter);
          gl_FragColor = info;
        }
      `,
      {
        tInput: { value: null },
        oldCenter: { value: new THREE.Vector3() },
        newCenter: { value: new THREE.Vector3() },
        radius: { value: 0.07 },
        displacementScale: { value: 0.6 },
      },
    );

    this.stepMaterial = createPassMaterial(
      `
        precision highp float;
        uniform sampler2D tInput;
        uniform vec2 delta;
        uniform float damping;
        uniform float waveSpeed;
        varying vec2 vUv;

        void main() {
          vec4 info = texture2D(tInput, vUv);
          vec2 dx = vec2(delta.x, 0.0);
          vec2 dy = vec2(0.0, delta.y);
          float average = (
            texture2D(tInput, vUv - dx).r +
            texture2D(tInput, vUv + dx).r +
            texture2D(tInput, vUv - dy).r +
            texture2D(tInput, vUv + dy).r
          ) * 0.25;
          info.g += (average - info.r) * waveSpeed;
          info.g *= damping;
          info.r += info.g;
          gl_FragColor = info;
        }
      `,
      {
        tInput: { value: null },
        delta: { value: new THREE.Vector2(1 / resolution, 1 / resolution) },
        damping: { value: damping },
        waveSpeed: { value: waveSpeed },
      },
    );

    this.normalMaterial = createPassMaterial(
      `
        precision highp float;
        uniform sampler2D tInput;
        uniform vec2 delta;
        varying vec2 vUv;

        void main() {
          vec4 info = texture2D(tInput, vUv);
          vec3 dx = vec3(
            delta.x,
            texture2D(tInput, vec2(vUv.x + delta.x, vUv.y)).r - info.r,
            0.0
          );
          vec3 dy = vec3(
            0.0,
            texture2D(tInput, vec2(vUv.x, vUv.y + delta.y)).r - info.r,
            delta.y
          );
          info.ba = normalize(cross(dy, dx)).xz;
          gl_FragColor = info;
        }
      `,
      {
        tInput: { value: null },
        delta: { value: new THREE.Vector2(1 / resolution, 1 / resolution) },
      },
    );

    this.clear();
  }

  get texture() {
    return this.textureA.texture;
  }

  clear() {
    const previousTarget = this.renderer.getRenderTarget();
    const previousColor = new THREE.Color();
    this.renderer.getClearColor(previousColor);
    const previousAlpha = this.renderer.getClearAlpha();
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setRenderTarget(this.textureA);
    this.renderer.clear();
    this.renderer.setRenderTarget(this.textureB);
    this.renderer.clear();
    this.renderer.setRenderTarget(previousTarget);
    this.renderer.setClearColor(previousColor, previousAlpha);
  }

  swap() {
    const next = this.textureA;
    this.textureA = this.textureB;
    this.textureB = next;
  }

  renderPass(material) {
    this.quad.material = material;
    material.uniforms.tInput.value = this.textureA.texture;
    this.renderer.setRenderTarget(this.textureB);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.swap();
  }

  addDrop(x, z, radius = 0.06, strength = 0.12) {
    this.dropMaterial.uniforms.center.value.set(x, z);
    this.dropMaterial.uniforms.radius.value = radius;
    this.dropMaterial.uniforms.strength.value = strength;
    this.renderPass(this.dropMaterial);
  }

  moveSphere(oldCenter, newCenter, radius, {
    width = 1,
    depth = 1,
    displacementScale = 0.6,
  } = {}) {
    const halfWidth = width * 0.5;
    const halfDepth = depth * 0.5;
    const verticalScale = Math.max(halfWidth, halfDepth);
    const normalizeCenter = (source, target) => {
      target.set(
        source.x / halfWidth,
        source.y / verticalScale,
        source.z / halfDepth,
      );
    };
    normalizeCenter(oldCenter, this.sphereMaterial.uniforms.oldCenter.value);
    normalizeCenter(newCenter, this.sphereMaterial.uniforms.newCenter.value);
    this.sphereMaterial.uniforms.radius.value =
      radius / verticalScale;
    this.sphereMaterial.uniforms.displacementScale.value = displacementScale;
    this.renderPass(this.sphereMaterial);
  }

  stepSimulation(iterations = 1) {
    for (let index = 0; index < iterations; index += 1) {
      this.renderPass(this.stepMaterial);
    }
  }

  updateNormals() {
    this.renderPass(this.normalMaterial);
  }

  dispose() {
    this.textureA.dispose();
    this.textureB.dispose();
    this.quad.geometry.dispose();
    this.dropMaterial.dispose();
    this.sphereMaterial.dispose();
    this.stepMaterial.dispose();
    this.normalMaterial.dispose();
  }
}

export function createInteractiveWaterSurfaceMaterial({
  waterTexture,
  sceneColor,
  width = 8,
  depth = 8,
  heightScale = 1.6,
  sunDirection = new THREE.Vector3(-0.35, 0.78, 0.52).normalize(),
} = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uWater: { value: waterTexture },
      uSceneColor: { value: sceneColor },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPoolSize: { value: new THREE.Vector2(width, depth) },
      uHeightScale: { value: heightScale },
      uSunDirection: { value: sunDirection },
      uDebugMode: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      precision highp float;
      uniform sampler2D uWater;
      uniform float uHeightScale;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying float vHeight;

      void main() {
        vUv = uv;
        vec4 state = texture2D(uWater, uv);
        vHeight = state.r;
        vec3 displaced = position;
        displaced.y += state.r * uHeightScale;
        vec4 world = modelMatrix * vec4(displaced, 1.0);
        vWorldPosition = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uWater;
      uniform sampler2D uSceneColor;
      uniform vec2 uResolution;
      uniform vec3 uSunDirection;
      uniform int uDebugMode;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying float vHeight;

      vec3 skyColor(vec3 direction) {
        float y = clamp(direction.y, -0.2, 1.0);
        vec3 horizon = vec3(0.62, 0.78, 0.92);
        vec3 zenith = vec3(0.06, 0.20, 0.42);
        float sun = max(dot(direction, uSunDirection), 0.0);
        return mix(horizon, zenith, smoothstep(-0.02, 0.85, y)) +
          vec3(1.0, 0.86, 0.58) * pow(sun, 80.0) * 2.4;
      }

      void main() {
        vec4 state = texture2D(uWater, vUv);
        vec3 normal = normalize(vec3(-state.b * 12.0, 1.0, -state.a * 12.0));
        if (!gl_FrontFacing) normal = -normal;
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        float noV = abs(dot(normal, viewDirection));
        float fresnel = 0.02 + 0.98 * pow(1.0 - noV, 5.0);
        vec3 reflection = skyColor(reflect(-viewDirection, normal));
        vec2 screenUv = gl_FragCoord.xy / uResolution;
        vec2 refractOffset = normal.xz * (0.018 + 0.025 * (1.0 - fresnel));
        vec3 refraction = texture2D(
          uSceneColor,
          clamp(screenUv + refractOffset, vec2(0.002), vec2(0.998))
        ).rgb;
        float path = 2.2 / max(0.08, abs(viewDirection.y));
        vec3 transmittance = exp(-vec3(0.18, 0.055, 0.025) * path);
        vec3 body = mix(vec3(0.00, 0.12, 0.18), refraction, 0.82) * transmittance;
        float highlight =
          pow(max(dot(reflect(-uSunDirection, normal), viewDirection), 0.0), 220.0) *
          2.8;
        vec3 color = mix(body, reflection, fresnel * 0.85) +
          vec3(1.0, 0.94, 0.75) * highlight;

        if (uDebugMode == 1) {
          color = mix(vec3(0.03, 0.08, 0.14), vec3(0.8, 0.25, 0.08), state.r * 5.0 + 0.5);
        } else if (uDebugMode == 2) {
          color = normal * 0.5 + 0.5;
        } else if (uDebugMode == 3) {
          color = vec3(abs(state.g) * 12.0);
        }

        gl_FragColor = vec4(color, 0.72);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

export function createCausticLightMaterial({
  waterTexture,
  lightColor = 0xbfefff,
  texelSize = new THREE.Vector2(1 / 256, 1 / 256),
} = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uWater: { value: waterTexture },
      uLightColor: { value: new THREE.Color(lightColor) },
      uTexel: { value: texelSize },
      uDebugMode: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uWater;
      uniform vec3 uLightColor;
      uniform vec2 uTexel;
      uniform int uDebugMode;
      varying vec2 vUv;

      void main() {
        vec4 center = texture2D(uWater, vUv);
        vec2 n0 = center.ba;
        vec2 nx = texture2D(uWater, vUv + vec2(uTexel.x, 0.0)).ba;
        vec2 ny = texture2D(uWater, vUv + vec2(0.0, uTexel.y)).ba;
        float convergence =
          1.0 - clamp(length(nx - n0) * 18.0 + length(ny - n0) * 18.0, 0.0, 1.0);
        float ripple = smoothstep(0.25, 0.95, convergence) *
          (0.65 + clamp(abs(center.r) * 9.0, 0.0, 0.7));
        vec3 color = uDebugMode == 4
          ? vec3(ripple)
          : uLightColor * ripple * 0.38;
        gl_FragColor = vec4(color, ripple * 0.52);
      }
    `,
  });
}

export function createInteractiveWaterSurfaceMesh({
  width = 8,
  depth = 8,
  segments = 180,
  material,
} = {}) {
  const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
  geometry.rotateX(-Math.PI * 0.5);
  return new THREE.Mesh(geometry, material);
}
