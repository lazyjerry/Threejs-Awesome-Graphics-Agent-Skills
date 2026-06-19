# CSS3D panels and limitations

Use `CSS3DRenderer` when a real DOM element needs hierarchical 3D transforms. It does not use Three.js geometry or materials and does not participate in WebGL lighting.

## Constraints

- CSS and WebGL are separate compositing systems.
- WebGL depth cannot automatically occlude CSS3D content.
- blending, post-processing, clipping, and shadows do not behave like one material pipeline;
- browser/display zoom support is documented at 100%;
- transformed text can become difficult to read or operate.

## Guidance

- Prototype overlap, occlusion, scrolling, focus, and mobile behavior before committing.
- Keep controls close to front-facing and large enough for pointer/touch use.
- Do not use CSS3D solely to imitate a WebGL mesh panel.
- Provide a screen-space alternative for essential workflows when the transformed panel becomes inaccessible.
- Keep iframe or embedded-content security and focus behavior explicit.

If depth-correct integration is a hard requirement, use in-scene geometry/text or a screen-space DOM interface instead.
