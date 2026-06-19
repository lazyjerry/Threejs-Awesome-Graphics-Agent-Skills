# Reduced motion and accessibility

Respect `prefers-reduced-motion` and provide controls when motion is central to the experience.

## Reduce

- camera shake, rapid zoom, parallax, oscillation, and full-screen transitions;
- motion blur and strong temporal trails;
- auto-rotation and nonessential ambient movement;
- flashing or repeated high-contrast changes.

Reduced motion should preserve state communication. Replace movement with opacity, scale restraint, static emphasis, text, or sound plus a visual equivalent.

## Multimodal access

- Do not encode state by color alone.
- Do not make essential information audio-only.
- Provide captions/text equivalents where speech or audio conveys content.
- Support high-contrast/readability modes where scene variability makes fixed styling insufficient.
- Keep pause, restart, settings, volume, and control help reachable.
- Test keyboard-only operation and visible focus.

Accessibility is a product requirement, not a post-processing pass. Validate it during interaction design and browser testing.
