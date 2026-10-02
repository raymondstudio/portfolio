import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const sizes = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 700 },
  { width: 768, height: 1024 },
];

async function load(page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

for (const viewport of sizes) {
  test(`layout and accessible content ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await load(page);
    await expect(page.locator("h1")).toContainText("Raymond Iorliam");
    await expect
      .poll(() =>
        page
          .locator(".intro-portrait img")
          .evaluate((el) => el.complete && el.naturalWidth > 0),
      )
      .toBe(true);
    await expect(page.locator(".floating-book")).toHaveAttribute(
      "href",
      "https://calendly.com/raymondstudio",
    );
    await page.screenshot({ path: `artifacts/qa/hero-${viewport.width}.png` });
    await page.locator(".hero-open").click();
    await expect(page.locator(".hero-reveal")).not.toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(page.locator(".hero-reveal a").first()).toBeFocused();
    await page.screenshot({
      path: `artifacts/qa/reveal-${viewport.width}.png`,
    });
    for (const id of ["about", "projects", "education", "contact"]) {
      await page
        .locator(`#${id}`)
        .evaluate((el) => el.scrollIntoView({ behavior: "instant" }));
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        )
        .toBe(true);
    }
    await expect(page.locator("#contact-rail")).toHaveAttribute(
      "data-position",
      "docked",
    );
    await expect(page.locator("#contact-rail")).not.toHaveClass(
      /is-travelling/,
    );
    await page.screenshot({
      path: `artifacts/qa/contact-${viewport.width}.png`,
    });
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      accessibility.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("all project images load without cropping and destinations remain intact", async ({
  page,
}) => {
  await load(page);
  await page.locator(".more-work").evaluate((el) => {
    el.open = true;
  });
  const images = page.locator(".project-visual img");
  await expect(images).toHaveCount(9);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((el) => el.complete && el.naturalWidth > 0))
      .toBe(true);
    expect(await image.evaluate((el) => getComputedStyle(el).objectFit)).toBe(
      "contain",
    );
  }
  for (const href of [
    "https://uselerna.app",
    "https://atrixia.vercel.app",
    "https://adonisoftware.tech",
    "https://sendoatelier.netlify.app",
    "https://newworldscience.netlify.app",
    "https://github.com/raymondstudio/SCAM-GUARD-AI",
    "https://moodpixai.netlify.app",
    "https://masteryourtasks.netlify.app",
    "./pages/more.html",
  ]) {
    await expect(page.locator(`.project-visual[href="${href}"]`)).toHaveCount(
      1,
    );
  }
  await expect(page.locator("#skills")).toContainText("AWS");
  await expect(page.locator("#skills")).toContainText("Google Cloud");
  await expect(page.locator("#skills")).not.toContainText("Framer");
  await expect(page.locator("#skills")).not.toContainText("CSS3");
  const invalidAnchors = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .filter((link) => !document.getElementById(link.hash.slice(1)))
        .map((link) => link.hash),
    );
  expect(invalidAnchors).toEqual([]);
});

test("contact rail docks, releases and exposes keyboard hints", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await load(page);
  const rail = page.locator("#contact-rail");
  await expect(rail).toHaveAttribute("data-position", "floating");
  await rail.locator("a").first().focus();
  await expect(rail.locator(".contact-method__hint").first()).toBeVisible();
  await page
    .locator("#contact-dock")
    .evaluate((el) =>
      el.scrollIntoView({ behavior: "instant", block: "center" }),
    );
  await expect(rail).toHaveAttribute("data-position", "docked");
  await page
    .locator(".site-footer")
    .evaluate((el) => el.scrollIntoView({ behavior: "instant", block: "end" }));
  await expect(rail).toHaveAttribute("data-position", "floating");
  await page
    .locator("#contact-dock")
    .evaluate((el) =>
      el.scrollIntoView({ behavior: "instant", block: "center" }),
    );
  await expect(rail).toHaveAttribute("data-position", "docked");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(rail).toHaveAttribute("data-position", "floating");
});

for (const responseStatus of [200, 500]) {
  test(`contact form handles mocked ${responseStatus}`, async ({ page }) => {
    let requests = 0;
    await page.route("https://formspree.io/**", async (route) => {
      requests++;
      expect(route.request().method()).toBe("POST");
      await route.fulfill({
        status: responseStatus,
        contentType: "application/json",
        body: JSON.stringify(
          responseStatus === 200 ? { ok: true } : { error: "Test error" },
        ),
      });
    });
    await load(page);
    await page.getByLabel("Your name", { exact: true }).fill("Portfolio QA");
    await page
      .getByLabel("Email address", { exact: true })
      .fill("qa@example.com");
    await page
      .getByLabel("Tell me a little more", { exact: true })
      .fill("Mocked regression test; never delivered.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("status")).toContainText(
      responseStatus === 200 ? "Message sent" : "could not be sent",
    );
    await expect(
      page.getByRole("button", { name: "Send message" }),
    ).toBeEnabled();
    expect(requests).toBe(1);
    await expect(page.getByLabel("Your name", { exact: true })).toHaveValue(
      responseStatus === 200 ? "" : "Portfolio QA",
    );
  });
}

for (const mode of ["reduced-motion", "no-js"]) {
  test(`${mode} keeps the introduction and contact usable`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: mode === "reduced-motion" ? "reduce" : "no-preference",
      javaScriptEnabled: mode !== "no-js",
    });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4173/");
    await expect(page.locator(".hero-reveal")).not.toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(page.locator(".hero-reveal")).not.toHaveAttribute("inert", "");
    await expect(page.locator(".hero-open")).toBeHidden();
    await expect(page.locator(".intro-description")).toBeVisible();
    await expect(page.locator(".contact-method")).toHaveCount(5);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await context.close();
  });
}
