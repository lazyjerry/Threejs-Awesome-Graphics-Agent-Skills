export function createLabRuntime({ host, renderer, camera, scene }) {
  const cleanups = [];
  let frame = 0;
  let disposed = false;

  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  }

  function resize() {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(host);
  cleanups.push(() => observer.disconnect());
  resize();

  function start(update) {
    renderer.setAnimationLoop((time) => {
      if (!disposed) update(time * 0.001, frame++);
    });
  }

  function destroy() {
    if (disposed) return;
    disposed = true;
    renderer.setAnimationLoop(null);
    for (const cleanup of cleanups.splice(0).reverse()) cleanup();
    scene.traverse((object) => {
      object.geometry?.dispose?.();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (!material) continue;
        for (const value of Object.values(material)) value?.isTexture && value.dispose();
        material.dispose?.();
      }
    });
    renderer.dispose();
  }

  listen(window, "pagehide", destroy, { once: true });
  return { listen, start, resize, destroy };
}
