(() => {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("is-pending");
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08 },
  );
  if (!preference.matches)
    reveals.forEach((element) => {
      if (element.getBoundingClientRect().top > innerHeight * 0.95)
        element.classList.add("is-pending");
      observer.observe(element);
    });
  preference.addEventListener("change", () => {
    if (preference.matches)
      reveals.forEach((element) => element.classList.remove("is-pending"));
  });

  const links = [...document.querySelectorAll(".main-nav a")];
  const sections = links.map((link) => document.querySelector(link.hash));
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          if (link.hash === "#" + entry.target.id)
            link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-15% 0px -55% 0px" },
  );
  sections.forEach((section) => section && navObserver.observe(section));

  const form = document.querySelector(".contact-form");
  const status = document.querySelector("#form-status");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    if (button.disabled) return;
    const original = button.innerHTML;
    button.disabled = true;
    button.textContent = "Sending your message…";
    form.setAttribute("aria-busy", "true");
    status.removeAttribute("data-error");
    status.textContent = "";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Unable to send");
      status.textContent =
        "Message sent. Thanks for reaching out; I'll be in touch.";
      form.reset();
    } catch {
      status.setAttribute("data-error", "");
      status.textContent =
        "Your message could not be sent. Please try again or email contact@raymondstudio.dev.";
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
      button.innerHTML = original;
      form.removeAttribute("aria-busy");
    }
  });
})();
