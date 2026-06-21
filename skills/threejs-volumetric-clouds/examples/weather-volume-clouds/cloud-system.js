import * as THREE from "three";

function random2(x, y) {
  let value = Math.imul(x ^ 0x9e3779b9, 0x85ebca6b);
  value ^= Math.imul(y ^ (value >>> 13), 0xc2b2ae35);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967295;
}

function valueNoise(x, y, scale, offset) {
  const px = x / scale + offset * 17.31;
  const py = y / scale + offset * 29.17;
  const ix = Math.floor(px);
  const iy = Math.floor(py);
  const fx = px - ix;
  const fy = py - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = random2(ix, iy);
  const b = random2(ix + 1, iy);
  const c = random2(ix, iy + 1);
  const d = random2(ix + 1, iy + 1);
  return (
    a * (1 - ux) * (1 - uy) +
    b * ux * (1 - uy) +
    c * (1 - ux) * uy +
    d * ux * uy
  );
}

function fbm(x, y, baseScale, offset) {
  let sum = 0;
  let amplitude = 0.5;
  let scale = baseScale;
  for (let octave = 0; octave < 5; octave += 1) {
    sum += valueNoise(x, y, scale, offset + octave * 7.1) * amplitude;
    amplitude *= 0.5;
    scale *= 0.52;
  }
  return sum / 0.96875;
}

function smoothstep01(edge0, edge1, value) {
  const t = THREE.MathUtils.clamp(
    (value - edge0) / Math.max(edge1 - edge0, 1e-6),
    0,
    1,
  );
  return t * t * (3 - 2 * t);
}

function worleyNoise(u, v, frequency, offset = 0) {
  const px = u * frequency + offset;
  const py = v * frequency + offset * 0.731;
  const cellX = Math.floor(px);
  const cellY = Math.floor(py);
  let nearest = 2;

  for (let y = -1; y <= 1; y += 1) {
    for (let x = -1; x <= 1; x += 1) {
      const candidateX = cellX + x;
      const candidateY = cellY + y;
      const wrappedX =
        ((candidateX % frequency) + frequency) % frequency;
      const wrappedY =
        ((candidateY % frequency) + frequency) % frequency;
      const featureX =
        candidateX + random2(wrappedX, wrappedY);
      const featureY =
        candidateY + random2(wrappedX + 173, wrappedY + 911);
      nearest = Math.min(
        nearest,
        Math.hypot(featureX - px, featureY - py),
      );
    }
  }

  return 1 - THREE.MathUtils.clamp(nearest / Math.SQRT2, 0, 1);
}

function worleyFbm(u, v, frequency, offset = 0) {
  let result = 0;
  let amplitude = 0.4;
  let octaveFrequency = frequency;
  for (let octave = 0; octave < 4; octave += 1) {
    result +=
      worleyNoise(u, v, octaveFrequency, offset + octave * 19.7) *
      amplitude;
    octaveFrequency *= 2;
    amplitude *= 0.95;
  }
  return result;
}

export function createWeatherTexture(size = 256) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;
      const middle = smoothstep01(
        1,
        1.4,
        worleyFbm(u + 0.5, v + 0.5, 8, 0.5),
      );
      const low = THREE.MathUtils.clamp(
        smoothstep01(0.8, 1.4, worleyFbm(u, v, 16)) - middle,
        0,
        1,
      );
      const high = smoothstep01(
        0.38,
        0.67,
        fbm(x * 0.9, y * 0.34, 42, 41),
      );
      const offset = (y * size + x) * 4;
      data[offset] = Math.round(low * 255);
      data[offset + 1] = Math.round(middle * 255);
      data[offset + 2] = Math.round(high * 255);
      data[offset + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export function createCloudMaterial(weatherTexture) {
  const uniforms = {
    uWeather: { value: weatherTexture },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uCameraPosition: { value: new THREE.Vector3() },
    uInverseProjection: { value: new THREE.Matrix4() },
    uCameraWorld: { value: new THREE.Matrix4() },
    uSunDirection: {
      value: new THREE.Vector3(-0.58, 0.25, -0.77).normalize(),
    },
    uDebugMode: { value: 0 },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    depthTest: false,
    depthWrite: false,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uWeather;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec3 uCameraPosition;
      uniform mat4 uInverseProjection;
      uniform mat4 uCameraWorld;
      uniform vec3 uSunDirection;
      uniform int uDebugMode;
      varying vec2 vUv;

      const float LOW_MIN = 7.5;
      const float LOW_MAX = 14.0;
      const float MIDDLE_MIN = 10.0;
      const float MIDDLE_MAX = 22.0;
      const float HIGH_MIN = 75.0;
      const float HIGH_MAX = 80.0;
      const int PRIMARY_STEPS = 160;
      const int LIGHT_STEPS = 8;

      float saturate(float value) {
        return clamp(value, 0.0, 1.0);
      }

      vec4 saturate4(vec4 value) {
        return clamp(value, vec4(0.0), vec4(1.0));
      }

      vec3 saturate3(vec3 value) {
        return clamp(value, vec3(0.0), vec3(1.0));
      }

      float remap01(float value, float low, float high) {
        return saturate((value - low) / max(high - low, 0.0001));
      }

      float hash31(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }

      float noise3(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        vec3 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(
            mix(hash31(i), hash31(i + vec3(1, 0, 0)), u.x),
            mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), u.x),
            u.y
          ),
          mix(
            mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), u.x),
            mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), u.x),
            u.y
          ),
          u.z
        );
      }

      float fbm3(vec3 p) {
        float result = 0.0;
        result += noise3(p) * 0.625;
        result += noise3(p * 2.03 + 11.7) * 0.25;
        result += noise3(p * 4.11 + 29.3) * 0.125;
        return result;
      }

      vec2 layerInterval(
        vec3 origin,
        vec3 direction,
        float minimumHeight,
        float maximumHeight
      ) {
        if (abs(direction.y) < 0.00001) return vec2(1e8, -1e8);
        float a = (minimumHeight - origin.y) / direction.y;
        float b = (maximumHeight - origin.y) / direction.y;
        return vec2(min(a, b), max(a, b));
      }

      float hg(float cosine, float g) {
        float g2 = g * g;
        return (1.0 - g2) /
          (12.5663706 * pow(max(1.0 + g2 - 2.0 * g * cosine, 0.001), 1.5));
      }

      vec3 skyColor(vec3 direction) {
        float height = saturate(direction.y * 0.5 + 0.5);
        vec3 horizon = vec3(0.42, 0.52, 0.67);
        vec3 upper = vec3(0.25, 0.39, 0.58);
        vec3 zenith = vec3(0.10, 0.22, 0.42);
        vec3 color = mix(horizon, upper, smoothstep(0.48, 0.72, height));
        color = mix(color, zenith, smoothstep(0.72, 1.0, height));
        float sun = saturate(dot(direction, uSunDirection));
        color += vec3(1.0, 0.94, 0.82) * pow(sun, 128.0) * 0.035;
        color += vec3(1.0, 0.98, 0.9) * pow(sun, 3000.0) * 3.2;
        return color;
      }

      vec4 sampleWeather(vec3 position) {
        vec2 uv = position.xz * 0.0025;
        vec2 lowOffset = vec2(0.008, -0.003) * uTime;
        vec2 middleOffset = vec2(-0.004, 0.006) * uTime;
        vec4 weather = texture2D(uWeather, uv + lowOffset);
        vec4 shifted = texture2D(uWeather, uv * 0.73 + middleOffset + 0.19);
        return vec4(weather.r, shifted.g, weather.b, shifted.a);
      }

      vec4 densityLayers(
        vec3 position,
        out float baseShape,
        out float detailModifier
      ) {
        float height = position.y;
        float lowHeight = remap01(height, LOW_MIN, LOW_MAX);
        float middleHeight = remap01(height, MIDDLE_MIN, MIDDLE_MAX);
          float highHeight = remap01(height, HIGH_MIN, HIGH_MAX);
        vec4 weather = sampleWeather(position);
        vec4 layer = vec4(0.0);

        if (height >= LOW_MIN && height <= MIDDLE_MAX) {
          float lowBias = pow(lowHeight, 0.35);
          float middleBias = pow(middleHeight, 0.35);
          float lowScale = max(0.0, 1.0 - pow(2.0 * lowBias - 1.0, 2.0));
          float middleScale = max(0.0, 1.0 - pow(2.0 * middleBias - 1.0, 2.0));
          float coverage = 0.30;
          float lowWeather = remap01(
            mix(weather.r, 1.0, 0.60),
            1.0 - coverage * lowScale,
            1.0 - coverage * lowScale + 0.60
          );
          float middleWeather = remap01(
            mix(pow(weather.g, 1.25), 1.0, 0.60),
            1.0 - coverage * middleScale,
            1.0 - coverage * middleScale + 0.60
          );
          layer.r = lowWeather;
          layer.g = middleWeather;
          if (height < MIDDLE_MIN || height > MIDDLE_MAX) layer.g = 0.0;
          if (height > LOW_MAX) layer.r = 0.0;
        }

        if (height >= HIGH_MIN && height <= HIGH_MAX) {
          float highScale = max(0.0, 1.0 - pow(2.0 * highHeight - 1.0, 2.0));
          layer.b = remap01(
            mix(pow(weather.b, 1.4), 1.0, 0.50),
            1.0 - 0.28 * highScale,
            1.0 - 0.28 * highScale + 0.50
          );
        }

        vec3 evolution = vec3(0.0, -uTime * 0.035, 0.0);
        vec3 shapePosition = position * 0.03 + evolution;
        float perlin = fbm3(shapePosition);
        float worley0 =
          1.0 - abs(noise3(shapePosition * 1.73 + 7.1) * 2.0 - 1.0);
        float worley1 =
          1.0 - abs(noise3(shapePosition * 3.41 + 17.3) * 2.0 - 1.0);
        float worley2 =
          1.0 - abs(noise3(shapePosition * 6.83 + 31.9) * 2.0 - 1.0);
        float worleyFbm =
          worley0 * 0.625 + worley1 * 0.25 + worley2 * 0.125;
        float perlinWorley = mix(worleyFbm, 1.0, perlin);
        baseShape = remap01(perlinWorley, worleyFbm - 1.0, 1.0);
        vec4 shapeAmount = vec4(1.0, 1.0, 0.4, 0.0);
        layer = vec4(
          remap01(layer.r, (1.0 - baseShape) * shapeAmount.r, 1.0),
          remap01(layer.g, (1.0 - baseShape) * shapeAmount.g, 1.0),
          remap01(layer.b, (1.0 - baseShape) * shapeAmount.b, 1.0),
          0.0
        );

        float detail = fbm3(position * 0.68 + vec3(4.0, 1.0, -3.0));
        float heightFraction = height < MIDDLE_MIN
          ? lowHeight
          : (height < 40.0 ? middleHeight : highHeight);
        float topModifier = pow(detail, 6.0);
        float bottomModifier = 1.0 - detail;
        detailModifier = mix(
          topModifier,
          bottomModifier,
          remap01(heightFraction, 0.2, 0.4)
        );
        vec4 detailAmount = vec4(0.82, 0.68, 0.0, 0.0);
        vec4 detailThreshold =
          vec4(detailModifier) * detailAmount * 0.5;
        layer = vec4(
          remap01(layer.r * 2.0, detailThreshold.r, 1.0),
          remap01(layer.g * 2.0, detailThreshold.g, 1.0),
          remap01(layer.b * 2.0, detailThreshold.b, 1.0),
          0.0
        );

        vec4 profile = vec4(
          0.75 * lowHeight + 0.25,
          0.75 * middleHeight + 0.25,
          0.75 * highHeight + 0.25,
          0.0
        );
        // Preserve optical thickness when one world unit represents 100 m.
        return saturate4(layer * profile * vec4(0.60, 0.60, 0.010, 0.0));
      }

      float totalDensity(vec3 position) {
        float shape;
        float detail;
        vec4 layers = densityLayers(position, shape, detail);
        return dot(layers, vec4(1.0));
      }

      float sunOpticalDepth(vec3 position) {
        float opticalDepth = 0.0;
        float stepLength = 0.58;
        vec3 samplePosition = position;
        for (int stepIndex = 0; stepIndex < LIGHT_STEPS; stepIndex += 1) {
          samplePosition += uSunDirection * stepLength;
          opticalDepth += totalDensity(samplePosition) * stepLength;
          stepLength *= 1.28;
        }
        return opticalDepth;
      }

      void main() {
        vec2 ndc = vUv * 2.0 - 1.0;
        vec4 view = uInverseProjection * vec4(ndc, 1.0, 1.0);
        view.xyz /= view.w;
        vec3 rayDirection = normalize((uCameraWorld * vec4(view.xyz, 0.0)).xyz);
        vec3 rayOrigin = uCameraPosition;

        vec2 outer = layerInterval(
          rayOrigin,
          rayDirection,
          LOW_MIN,
          HIGH_MAX
        );
        if (outer.y <= max(outer.x, 0.0)) {
          vec3 clearColor = skyColor(rayDirection);
          if (rayDirection.y < -0.00001) {
            float clearGroundDistance = -rayOrigin.y / rayDirection.y;
            vec3 clearGround =
              rayOrigin + rayDirection * clearGroundDistance;
            clearColor = mix(
              vec3(0.035, 0.055, 0.09),
              vec3(0.12, 0.18, 0.28),
              smoothstep(0.0, 0.12, -rayDirection.y)
            );
          }
          gl_FragColor = vec4(clearColor, 1.0);
          return;
        }
        float nearDistance = max(outer.x, 0.0);
        float farDistance = min(outer.y, nearDistance + 180.0);
        float groundDistance = rayDirection.y < -0.00001
          ? -rayOrigin.y / rayDirection.y
          : 1e8;
        bool hitsGround =
          groundDistance > 0.0 && groundDistance < 1e7;
        if (hitsGround) farDistance = min(farDistance, groundDistance);

        float segmentLength = max(farDistance - nearDistance, 0.0);
        float stepLength = segmentLength / float(PRIMARY_STEPS);
        float jitterNoise = fract(
          sin(
            dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) +
            floor(uTime * 60.0) * 0.6180339
          ) * 43758.5453
        );
        float jitter = mix(0.325, 0.675, jitterNoise);
        float distanceAlongRay = nearDistance + stepLength * jitter;
        vec3 radiance = vec3(0.0);
        float transmittance = 1.0;
        vec3 densityAccumulation = vec3(0.0);
        float debugBase = 0.0;
        float debugDetail = 0.0;
        float lightingAccumulation = 0.0;
        float cosine = dot(rayDirection, uSunDirection);
        float phase =
          hg(cosine, 0.58) * 0.78 +
          hg(cosine, -0.2) * 0.22;

        for (int stepIndex = 0; stepIndex < PRIMARY_STEPS; stepIndex += 1) {
          if (distanceAlongRay >= farDistance || transmittance < 0.012) break;
          vec3 position = rayOrigin + rayDirection * distanceAlongRay;
          float height = position.y;
          bool insideLow =
            height >= LOW_MIN && height <= MIDDLE_MAX;
          bool insideHigh = height >= HIGH_MIN && height <= HIGH_MAX;
          if (!insideLow && !insideHigh) {
            distanceAlongRay += max(stepLength, 0.22);
            continue;
          }

          float baseShape;
          float detailModifier;
          vec4 layers = densityLayers(position, baseShape, detailModifier);
          float density = dot(layers, vec4(1.0));
          if (density > 0.001) {
            float opticalDepth = sunOpticalDepth(position);
            float sunTransmittance = exp(-opticalDepth * 1.8);
            vec3 sunLight =
              vec3(1.0, 0.96, 0.88)
              * sunTransmittance
              * phase
              * 1.65;
            vec3 skyLight =
              mix(
                vec3(0.18, 0.22, 0.31),
                vec3(0.46, 0.55, 0.68),
                saturate(
                  (position.y - LOW_MIN) /
                  (HIGH_MAX - LOW_MIN)
                )
              ) * 0.26;
            float powder = 1.0 - 0.65 * exp(-density * 3.2);
            vec3 sampleLight = (sunLight + skyLight) * powder;
            float extinction = density * 1.10;
            float stepTransmittance = exp(-extinction * stepLength);
            vec3 stepScatter =
              sampleLight * density *
              (1.0 - stepTransmittance) /
              max(extinction, 0.0001);
            radiance += transmittance * stepScatter;
            transmittance *= stepTransmittance;
            densityAccumulation += layers.rgb * stepLength * 0.12;
            debugBase += baseShape * density * stepLength;
            debugDetail += detailModifier * density * stepLength;
            lightingAccumulation +=
              dot(sampleLight, vec3(0.2126, 0.7152, 0.0722))
              * density
              * stepLength;
          }
          distanceAlongRay += stepLength;
        }

        vec3 background = skyColor(rayDirection);
        if (hitsGround) {
          vec3 groundPosition =
            rayOrigin + rayDirection * groundDistance;
          float direct = max(uSunDirection.y, 0.0);
          float waterVariation =
            noise3(vec3(groundPosition.xz * 0.025, 1.0));
          background = mix(
            vec3(0.025, 0.045, 0.08),
            vec3(0.09, 0.14, 0.23),
            waterVariation
          ) * (0.55 + direct * 0.45);
        }
        float cloudAlpha = 1.0 - transmittance;
        vec3 cloudRadiance =
          radiance * vec3(0.92, 0.95, 1.0);
        float silver =
          pow(cloudAlpha * (1.0 - cloudAlpha) * 4.0, 2.0)
          * pow(max(cosine, 0.0), 5.0);
        vec3 color =
          cloudRadiance
          + background * transmittance
          + vec3(1.0, 0.95, 0.86) * silver * 0.42;

        if (uDebugMode == 1) {
          vec4 weather = sampleWeather(
            rayOrigin + rayDirection * (nearDistance + segmentLength * 0.4)
          );
          color = weather.rgb;
        } else if (uDebugMode == 2) {
          color = vec3(saturate(debugBase * 0.18));
        } else if (uDebugMode == 3) {
          color = vec3(saturate(debugDetail * 0.24));
        } else if (uDebugMode == 4) {
          color = saturate3(densityAccumulation);
        } else if (uDebugMode == 5) {
          color = vec3(transmittance);
        } else if (uDebugMode == 6) {
          color = vec3(saturate(lightingAccumulation * 0.08));
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

export function createResolveMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uCurrent: { value: null },
      uHistory: { value: null },
      uHistoryValid: { value: 0 },
      uCurrentTexel: { value: new THREE.Vector2(1, 1) },
    },
    vertexShader,
    depthTest: false,
    depthWrite: false,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uCurrent;
      uniform sampler2D uHistory;
      uniform int uHistoryValid;
      uniform vec2 uCurrentTexel;
      varying vec2 vUv;

      void main() {
        vec3 current = texture2D(uCurrent, vUv).rgb;
        vec3 minimumColor = current;
        vec3 maximumColor = current;
        for (int x = -1; x <= 1; x += 1) {
          for (int y = -1; y <= 1; y += 1) {
            vec3 neighbor = texture2D(
              uCurrent,
              vUv + vec2(float(x), float(y)) * uCurrentTexel
            ).rgb;
            minimumColor = min(minimumColor, neighbor);
            maximumColor = max(maximumColor, neighbor);
          }
        }
        vec3 history = texture2D(uHistory, vUv).rgb;
        vec3 clipped = clamp(history, minimumColor, maximumColor);
        float rejection = length(history - clipped);
        vec3 resolved = uHistoryValid == 1
          ? mix(current, clipped, 0.45)
          : current;
        gl_FragColor = vec4(resolved, 1.0);
      }
    `,
  });
}

export function createCopyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: null },
      uCurrent: { value: null },
      uDebugHistory: { value: 0 },
    },
    vertexShader,
    depthTest: false,
    depthWrite: false,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uTexture;
      uniform sampler2D uCurrent;
      uniform int uDebugHistory;
      varying vec2 vUv;
      void main() {
        vec3 resolved = texture2D(uTexture, vUv).rgb;
        vec3 color = resolved;
        if (uDebugHistory == 1) {
          vec3 current = texture2D(uCurrent, vUv).rgb;
          float difference = length(current - resolved);
          float rejected = smoothstep(0.001, 0.03, difference);
          float luma = dot(resolved, vec3(0.2126, 0.7152, 0.0722));
          color = mix(vec3(luma * 0.55), vec3(1.0, 0.035, 0.01), rejected);
        }
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
