#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if grep -q '^This is a Three.js agent skills pack' README.md; then
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: README.md
@@
-***Example gallery to visually inspect included examples***
+***範例圖庫，可直觀檢視內含的範例***
 
-This is a Three.js agent skills pack for producing awesome graphics.
+這是一套用於製作出色視覺效果的 Three.js Agent Skills 套件。
 
-It includes mesh design, lighting, PBR materials, textures, shaders, TSL/WebGPU, GLSL, post-processing, realism, stylization, particles, procedural visuals, color management, tone mapping, etc. Graphics excellence is the **main focus** of this skill pack, with sophisticated design aesthetics, philosophy, ergonomics, sensibility, taste. It brings the sophistication of good graphics and eliminates cheap hacks.
+內容涵蓋網格設計、光照、PBR 材質、紋理、Shader、TSL/WebGPU、GLSL、後製、寫實風格、風格化、粒子、程序式視覺效果、色彩管理、色調映射等。本 Skill 套件的**核心重點**是打造卓越的視覺效果，兼顧成熟的設計美學、理念、人體工學、感知與品味，讓畫面呈現應有的精緻度，擺脫廉價的取巧手法。
 
-This is NOT a three.js API cheat sheet, it skips basic 3D production fundamentals and concepts (any decent LLM already has that internal knowledge) as well as three.js API technicalities (just look up docs or use existing API oriented agent skills). Fundamentally, you cannot just prompt the agent for "good graphics" and expect the agent to produce it. The agent needs to see the exact implementation of said good graphics. That's what this skill pack aims to provide, the **vocabulary** of sophisticated graphics implementations. It's a skill pack with an attached example library to teach the agent not just what to do but also exactly how to do it.
+這不是 three.js API 速查表。本套件略過 3D 製作的基礎知識與概念（任何具備基本能力的 LLM 都已有相關內部知識），也不處理 three.js API 的技術細節（可直接查閱文件，或使用現有的 API 導向 Agent Skills）。只提示 Agent 製作「出色的視覺效果」，無法期待它直接產出理想成果；Agent 必須看到這類視覺效果的確切實作。本 Skill 套件要提供的正是精緻圖像實作的**語彙**，並搭配範例庫，讓 Agent 不只知道該做什麼，也清楚知道如何實作。
 
-This skill pack will be continuously updated as more three.js projects with awesome graphics emerge. I hope it can help everyone build awesome scenes and games with out-of-the-box sophisticated graphics, so you can focus on things like game logic and story.
+隨著更多具備出色視覺效果的 three.js 專案出現，本 Skill 套件也會持續更新。期望它能協助大家快速打造精緻的場景與遊戲，把心力放在遊戲邏輯、故事等內容上。
@@
-***E.g., A realistic ocean such as this would have taken hours if not days to create and finetune, now it's out of the box***
+***例如，過去製作並微調這類寫實海洋效果需要數小時，甚至數天；現在可以直接使用***
 
-## Operating model
+## 運作模式
 
-Every graphics system is expected to expose:
+每個圖像系統都應公開：
 
-- deterministic or reproducible inputs;
-- named controlling fields and perceptual parameters;
-- diagnostic outputs;
-- scale, distance, and temporal stability rules;
-- an intentional mechanism-backed quality or resolution tier when the system defines one;
-- a no-post baseline that still reads.
+- 可確定或可重現的輸入；
+- 具名控制欄位與感知參數；
+- 診斷輸出；
+- 尺度、距離與時間穩定性規則；
+- 系統有定義時，由明確機制支撐的品質或解析度層級；
+- 未套用後製仍具可讀性的基準效果。
 
-## Skills
+## Skills
 
-| Skill | Expertise |
+| Skill | 專業領域 |
 | --- | --- |
-| `threejs-skill-router` | Decompose a visual target into the smallest relevant expert systems. |
-| `threejs-camera-direction` | Authored lenses and shots, chase/side/orbit rigs, body-relative frames, handoffs, pointer look, floating origins. |
-| `threejs-procedural-animation` | Analytic timelines, gravity turns, staging, rotating-frame docking, springs, quaternion alignment, debris motion. |
-| `threejs-procedural-fields` | Shared scalar/vector fields, frequency bands, domain warping, causal masks, procedural normals. |
-| `threejs-procedural-materials` | Hybrid texture-backed PBR soil/moss with procedural fields, atlas filtering, specular AA, planetary materials, terrain wetness, lava/emissive surfaces, frame PBR, per-instance dissolve. |
-| `threejs-parallax-occlusion-mapping` | TSL height marching, clipped flat and curved silhouettes, inflated relief shells, self-shadowing, relief-aware shadow depth. |
-| `threejs-procedural-geometry` | Sculpted frame rails, branch rings, semantic mesh writers, UV density, material groups. |
-| `threejs-procedural-vegetation` | Growth hierarchies, surface-following ivy, stylized and GPU-computed grass, branch-ring geometry, foliage normals, rooted wind. |
-| `threejs-procedural-architecture` | Massing and façade grammars, exposed-edge analysis, modules, material-slot compilation. |
-| `threejs-procedural-planets` | Spherical terrain, ridges, craters, biomes, procedural normals, altitude filtering. |
-| `threejs-spectral-ocean` | Validated FFT synthesis, hybrid FFT/Gerstner water, stylized above/below optics, submerged Snell windows, total internal reflection, aquatic perspective, caustic god rays, spectral cascades, choppy derivatives, Jacobian foam, ocean shading. |
-| `threejs-water-optics` | Shared analytic waves/normals, bounded pool heightfields, object ripples, caustics, refraction, absorption, reflection. |
-| `threejs-precipitation-surfaces` | Falling snow and rain coupled to accumulation, snow caps, wet puddles, ripple normals, splashes, and shared weather envelopes. |
-| `threejs-atmosphere-aerial-perspective` | Shared Rayleigh/Mie atmosphere, sky, shell/post handoff, depth-based scattering. |
-| `threejs-volumetric-clouds` | Weather-shaped density, bounded raymarching, cloud lighting, history, cloud shadows. |
-| `threejs-raymarched-space-effects` | Curved-ray integration, black holes, accretion disks, wormholes, bounded quality. |
-| `threejs-procedural-vfx` | Reentry shells/wakes, instanced sparks, dissolving debris, dense pools, HDR hierarchy. |
-| `threejs-temporal-surfaces` | Persistent touch history, frost composite, wet-window droplets, background refraction, and blur. |
-| `threejs-shadow-systems` | Stable cascades and cached clipmap shadows with update budgets and invalidation. |
-| `threejs-screen-space-ambient-occlusion` | GTAO-style horizon sampling, bent normals, bilateral and temporal reconstruction. |
-| `threejs-bloom` | HDR extraction, multi-scale filtering, selective contribution, exposure coupling. |
-| `threejs-exposure-color-grading` | Encoded luminance metering, asymmetric adaptation, tone mapping, generated 3D LUT. |
-| `threejs-image-pipeline` | Shared render-signal ownership and ordering across multiple image-space systems. |
-| `threejs-visual-validation` | Fixed-view captures, diagnostic mosaics, seed/scale sweeps, temporal and GPU evidence. |
+| `threejs-skill-router` | 將視覺目標拆解成最精簡且相關的專業系統。 |
+| `threejs-camera-direction` | 鏡頭與分鏡設計、追逐／側向／環繞 Rig、物體相對座標框架、鏡頭交接、指標注視、浮動原點。 |
+| `threejs-procedural-animation` | 解析式時間軸、重力轉向、場面調度、旋轉座標框架對接、彈簧、四元數對齊、碎片運動。 |
+| `threejs-procedural-fields` | 共用純量／向量場、頻帶、域扭曲、因果遮罩、程序式法線。 |
+| `threejs-procedural-materials` | 結合紋理與程序場的 PBR 土壤／苔蘚、圖集過濾、鏡面反射抗鋸齒、行星材質、地形濕潤、熔岩／自發光表面、框架 PBR、逐實例溶解。 |
+| `threejs-parallax-occlusion-mapping` | TSL 高度步進、裁切的平面與曲面輪廓、膨脹式浮雕殼層、自陰影、感知浮雕的陰影深度。 |
+| `threejs-procedural-geometry` | 雕塑式框架導軌、枝條環、語意網格寫入器、UV 密度、材質群組。 |
+| `threejs-procedural-vegetation` | 生長階層、貼合表面的常春藤、風格化與 GPU 運算草地、枝條環幾何、葉片法線、根部固定的風動效果。 |
+| `threejs-procedural-architecture` | 量體與立面文法、外露邊緣分析、模組、材質槽編譯。 |
+| `threejs-procedural-planets` | 球形地形、山脊、隕石坑、生物群系、程序式法線、高度過濾。 |
+| `threejs-spectral-ocean` | 經驗證的 FFT 合成、FFT/Gerstner 混合水面、風格化水上／水下光學、水下 Snell 視窗、全反射、水體透視、焦散體積光、頻譜級聯、波峰陡峭度導數、Jacobian 泡沫、海洋著色。 |
+| `threejs-water-optics` | 共用解析式波浪／法線、有限邊界泳池高度場、物體漣漪、焦散、折射、吸收、反射。 |
+| `threejs-precipitation-surfaces` | 與積雪／積水耦合的降雪與降雨、積雪頂層、濕潤水窪、漣漪法線、飛濺效果及共用天氣包絡。 |
+| `threejs-atmosphere-aerial-perspective` | 共用 Rayleigh/Mie 大氣、天空、大氣殼層／後製交接、深度式散射。 |
+| `threejs-volumetric-clouds` | 由天氣塑形的密度、有限邊界光線步進、雲層光照、歷史資料、雲影。 |
+| `threejs-raymarched-space-effects` | 曲線光線積分、黑洞、吸積盤、蟲洞、有限品質層級。 |
+| `threejs-procedural-vfx` | 重返大氣層外殼／尾流、實例化火花、溶解碎片、密集粒子池、HDR 階層。 |
+| `threejs-temporal-surfaces` | 持久觸碰歷史、霜凍合成、濕窗水滴、背景折射與模糊。 |
+| `threejs-shadow-systems` | 具更新預算與失效機制的穩定級聯陰影及快取 Clipmap 陰影。 |
+| `threejs-screen-space-ambient-occlusion` | GTAO 風格地平線取樣、彎曲法線、雙邊與時間重建。 |
+| `threejs-bloom` | HDR 擷取、多尺度過濾、選擇性貢獻、曝光耦合。 |
+| `threejs-exposure-color-grading` | 編碼亮度測光、非對稱曝光適應、色調映射、產生式 3D LUT。 |
+| `threejs-image-pipeline` | 多個影像空間系統之間共用的渲染訊號所有權與排序。 |
+| `threejs-visual-validation` | 固定視角擷取、診斷拼圖、種子／尺度掃描、時間與 GPU 證據。 |
@@
-## Install
+## 安裝
@@
-# global installation
+# 全域安裝
@@
-# Project installation
+# 專案安裝
@@
-# Any custom-built agent
+# 任意自訂 Agent
@@
-# Force a reinstall of the exact currently installed version
+# 強制重新安裝目前已安裝的相同版本
@@
-# To uninstall it
+# 解除安裝
@@
-Supported targets:
+支援的目標：
 
-| Target | User scope | Project scope |
+| 目標 | 使用者範圍 | 專案範圍 |
@@
-## Development
+## 開發
@@
-Generate deterministic captures and a contact sheet:
+產生可重現的畫面擷取與縮圖索引表：
@@
-Inspect every included graphics example from one development surface:
+透過單一開發介面檢視所有內含的圖像範例：
@@
-The gallery is meant for visual inspection of each example included in the 
-skill pack. The skills only include the implementation and assets for the example itself 
-respectively, while scene setup, camera rig, supporting implementation, supporting assets are owned 
-by the gallery dev shim only.
+圖庫用於直觀檢視 Skill 套件中的各個範例。每個 Skill 僅包含該範例本身的實作與資產；場景設定、Camera Rig、輔助實作與輔助資產則僅由圖庫的開發 Shim 管理。
 
-This split is intentional:
+這項拆分是刻意設計的：
 
-- The agent using this skill only needs the implementation and the assets for the example itself
-- The gallery is for viewing purpose, the agent doesn't need to know that scene setup
+- 使用此 Skill 的 Agent 只需要範例本身的實作與資產
+- 圖庫僅供檢視，Agent 不需要了解其場景設定
 
-The gallery contract is documented in
+圖庫介面契約記錄於
 [`dev/example-gallery/README.md`](dev/example-gallery/README.md).
*** End Patch
PATCH
fi

if grep -q '| `custom` | exact `--path` | exact `--path` |' README.md; then
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: README.md
@@
-| `custom` | exact `--path` | exact `--path` |
+| `custom` | 指定的 `--path` | 指定的 `--path` |
*** End Patch
PATCH
fi
