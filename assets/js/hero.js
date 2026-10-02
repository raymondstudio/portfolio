/* Native scrolling drives a single staged composition; animation never traps scroll. */
(() => {
  const hero = document.querySelector(".hero-story");
  if (!hero) return;
  const stage = hero.querySelector(".hero-stage");
  const left = hero.querySelector(".hero-door--left");
  const right = hero.querySelector(".hero-door--right");
  const reveal = hero.querySelector(".hero-reveal");
  const openButton = hero.querySelector(".hero-open");
  const progressLine = hero.querySelector(".hero-progress");
  if (!stage || !left || !right || !reveal) return;

  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const smoothstep = (value) => value * value * (3 - 2 * value);
  let start = 0;
  let travel = 1;
  let current = 0;
  let target = 0;
  let frame = 0;
  let previousTime = 0;
  let accessible = null;
  let focusAfterOpen = false;

  function setAccessible(value) {
    if (accessible === value) return;
    accessible = value;
    reveal.inert = !value;
    if (value) reveal.removeAttribute("aria-hidden");
    else reveal.setAttribute("aria-hidden", "true");
    if (value && focusAfterOpen) {
      reveal
        .querySelector('a, button, [tabindex="0"]')
        ?.focus({ preventScroll: true });
      focusAfterOpen = false;
    }
  }

  function render() {
    const opened = smoothstep(clamp((current - 0.045) / 0.745));
    const arrive = smoothstep(clamp((current - 0.15) / 0.64));
    left.style.transform = `translate3d(${-101 * opened}%,0,0)`;
    right.style.transform = `translate3d(${101 * opened}%,0,0)`;
    reveal.style.transform = `translate3d(0,${34 * (1 - arrive)}px,0) scale(${0.925 + 0.075 * arrive})`;
    reveal.style.opacity = String(0.35 + 0.65 * arrive);
    if (progressLine)
      progressLine.style.transform = `scaleX(${clamp(current / 0.79)})`;
    if (openButton) {
      openButton.style.opacity = String(1 - clamp(current / 0.18));
      openButton.style.visibility = current >= 0.18 ? "hidden" : "visible";
    }
    setAccessible(current >= 0.69);
  }

  function tick(time) {
    const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
    previousTime = time;
    current += (target - current) * (1 - Math.exp(-elapsed / 85));
    if (Math.abs(target - current) < 0.0001) current = target;
    render();
    if (current !== target) frame = requestAnimationFrame(tick);
    else {
      frame = 0;
      previousTime = 0;
    }
  }

  function onScroll() {
    if (preference.matches) return;
    target = clamp((window.scrollY - start) / travel);
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function measure() {
    if (preference.matches) return;
    start = hero.getBoundingClientRect().top + window.scrollY;
    travel = Math.max(1, hero.offsetHeight - stage.offsetHeight);
    onScroll();
  }

  function configure() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    hero.classList.toggle("is-motion-ready", !preference.matches);
    if (preference.matches) {
      left.style.removeProperty("transform");
      right.style.removeProperty("transform");
      reveal.style.removeProperty("transform");
      reveal.style.removeProperty("opacity");
      setAccessible(true);
      return;
    }
    measure();
    current = target;
    render();
  }

  openButton?.addEventListener("click", () => {
    focusAfterOpen = true;
    window.scrollTo({
      top: start + travel * 0.86,
      behavior: preference.matches ? "instant" : "smooth",
    });
  });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("pageshow", configure);
  preference.addEventListener("change", configure);
  configure();
})();
