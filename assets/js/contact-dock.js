/* Contact choreography: measure only at state changes, animate with transforms. */
(() => {
  "use strict";

  const rail = document.querySelector("#contact-rail");
  const dock = document.querySelector("#contact-dock");
  if (!rail || !dock) return;
  const section = dock.closest("#contact") || dock;

  const links = [...rail.querySelectorAll(".contact-method")];
  const motionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  const compactLayout = window.matchMedia(
    "(max-width: 767px), (max-height: 550px)",
  );
  let floating = null;
  let dockObserver;
  let sectionObserver;
  let animations = [];
  let revision = 0;
  let resizeFrame = 0;

  // Hints describe the action, while the concise labels remain accessible in
  // compact mode. There is always only one focusable instance of each link.
  links.forEach((link) => {
    const label = link
      .querySelector(".contact-method__label")
      ?.textContent.trim();
    const hint = link
      .querySelector(".contact-method__hint")
      ?.textContent.trim();
    if (!link.hasAttribute("aria-label") && label) {
      link.setAttribute("aria-label", hint ? `${label}: ${hint}` : label);
    }
  });

  function setFloating(next, animate = true) {
    if (floating === next) return;
    const focused = rail.contains(document.activeElement)
      ? document.activeElement
      : null;
    const before = animate
      ? links.map((link) => link.getBoundingClientRect())
      : [];
    const currentRevision = ++revision;
    animations.forEach((animation) => animation.cancel());
    animations = [];
    floating = next;

    // The destination reserves its height, so this reparenting cannot shift
    // other page content. Fixed mode lives at body level, outside transforms.
    (next ? document.body : dock).appendChild(rail);
    rail.classList.toggle("is-floating", next);
    rail.classList.toggle("is-docked", !next);
    rail.dataset.position = next ? "floating" : "docked";
    rail.classList.remove("is-travelling");
    if (focused) focused.focus({ preventScroll: true });

    if (!animate || motionPreference.matches || !Element.prototype.animate)
      return;

    const after = links.map((link) => link.getBoundingClientRect());
    rail.classList.add("is-travelling");
    animations = links.map((link, index) => {
      // Anchor to each icon rather than stretching the text during the flight.
      const from = before[index];
      const to = after[index];
      const fromIconOffset = next
        ? compactLayout.matches
          ? 29
          : 31
        : from.width / 2;
      const toIconOffset = next
        ? to.width / 2
        : compactLayout.matches
          ? 29
          : 31;
      const x = from.left + fromIconOffset - to.left - toIconOffset;
      const y = from.top + from.height / 2 - to.top - to.height / 2;
      return link.animate(
        [
          { transform: `translate3d(${x}px, ${y}px, 0)`, opacity: 0.65 },
          { transform: "translate3d(0, 0, 0)", opacity: 1 },
        ],
        {
          duration: next ? 620 : 780,
          delay: index * 28,
          easing: "cubic-bezier(.22, 1, .36, 1)",
          fill: "both",
        },
      );
    });

    Promise.allSettled(animations.map((animation) => animation.finished)).then(
      () => {
        if (revision !== currentRevision) return;
        animations.forEach((animation) => animation.cancel());
        animations = [];
        rail.classList.remove("is-travelling");
      },
    );
  }

  function observeDock(animate = false) {
    dockObserver?.disconnect();
    sectionObserver?.disconnect();
    const entryMargin = Math.round(window.innerHeight * 0.13);
    const exitMargin = Math.round(window.innerHeight * 0.36);
    const updatePosition = (shouldAnimate = true) => {
      const dockBounds = dock.getBoundingClientRect();
      const sectionBounds = section.getBoundingClientRect();
      // Arrive as the actual destination becomes visible. Stay attached while
      // the reader continues through the form, even after the links move above
      // the viewport. Depart once the footer becomes the dominant section.
      const inContact =
        dockBounds.top < window.innerHeight - entryMargin &&
        sectionBounds.bottom > exitMargin;
      setFloating(!inContact, shouldAnimate);
    };
    updatePosition(animate);

    dockObserver = new IntersectionObserver(() => updatePosition(), {
      rootMargin: `-${entryMargin}px 0px -${entryMargin}px 0px`,
      threshold: 0,
    });
    sectionObserver = new IntersectionObserver(() => updatePosition(), {
      rootMargin: `-${exitMargin}px 0px -${entryMargin}px 0px`,
      threshold: 0,
    });
    dockObserver.observe(dock);
    sectionObserver.observe(section);
  }

  // Resize callbacks rebuild observer bounds once; there is no scroll listener
  // or perpetual animation loop performing layout reads.
  window.addEventListener(
    "resize",
    () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => observeDock(false));
    },
    { passive: true },
  );

  motionPreference.addEventListener("change", () => {
    if (!motionPreference.matches) return;
    revision += 1;
    animations.forEach((animation) => animation.cancel());
    animations = [];
    rail.classList.remove("is-travelling");
  });

  observeDock(false);
})();
