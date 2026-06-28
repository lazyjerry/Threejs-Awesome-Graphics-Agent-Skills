import { chromium } from "playwright";
import { startExampleGallery } from "../dev/example-gallery/server.mjs";

const { server, url } = await startExampleGallery({
  host: "127.0.0.1",
  port: 0,
  includeFixtures: true,
});

let browser;
try {
  const response = await fetch(new URL("/api/examples", url));
  if (!response.ok) throw new Error("Example discovery endpoint failed.");
  const payload = await response.json();
  const fixture = payload.examples.find(
    (example) => example.id === "fixture/runtime-contract",
  );
  const realExamples = payload.examples.filter(
    (example) => example.origin === "skill",
  );
  if (!fixture || realExamples.length < 2) {
    throw new Error("Gallery fixture was not discovered correctly.");
  }

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  const fixtureUrl = new URL(url);
  fixtureUrl.searchParams.set("example", fixture.id);
  await page.goto(fixtureUrl.href, { waitUntil: "networkidle" });
  const selectedLink = page.locator(
    "#example-list .example-link[aria-current='true']",
  );
  await selectedLink.waitFor();
  if ((await selectedLink.textContent())?.trim() !== "Gallery Runtime Contract") {
    throw new Error("Single-example inspection view did not load.");
  }
  if (
    (await page.locator(
      "#example-kicker, #example-title, #example-description, #technique-tags",
    ).count()) !== 0
  ) {
    throw new Error("Inspection metadata text should not be rendered.");
  }
  await page
    .locator("#frame-status[data-state='ready']")
    .waitFor({ timeout: 5000 });

  const layout = await page.evaluate(() => {
    const toolbar = document.querySelector(".toolbar");
    const stage = document.querySelector(".stage");
    const iframe = document.querySelector(".stage iframe");
    const viewport = document.querySelector("#viewport");
    const dpr = document.querySelector("#dpr");
    const rect = (element) => {
      if (!element) return null;
      const bounds = element.getBoundingClientRect();
      return {
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
      };
    };
    const stageRect = rect(stage);
    const iframeRect = rect(iframe);
    return {
      toolbarHidden:
        toolbar?.hidden === true && getComputedStyle(toolbar).display === "none",
      viewportValue: viewport?.value,
      dprValue: dpr?.value,
      frameDpr: new URL(iframe?.src ?? window.location.href).searchParams.get(
        "galleryDpr",
      ),
      noDocumentScroll:
        document.documentElement.scrollHeight <=
          document.documentElement.clientHeight &&
        document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      iframeFillsStage:
        stageRect &&
        iframeRect &&
        Math.abs(stageRect.width - iframeRect.width) <= 1 &&
        Math.abs(stageRect.height - iframeRect.height) <= 1,
    };
  });
  if (!layout.toolbarHidden) {
    throw new Error("Inspection toolbar should be hidden.");
  }
  if (layout.viewportValue !== "responsive") {
    throw new Error("Inspection frame should default to responsive sizing.");
  }
  if (layout.dprValue !== "1.5" || layout.frameDpr !== "1.5") {
    throw new Error("Inspection frame should default to DPR 1.5.");
  }
  if (!layout.noDocumentScroll || !layout.iframeFillsStage) {
    throw new Error("Inspection frame should fill the viewport without page scroll.");
  }

  await page.locator("#toggle-view").click();
  await page
    .locator(".overview-frame")
    .first()
    .waitFor({ state: "visible", timeout: 5000 });
  await page.waitForFunction(
    () =>
      (document.querySelector(".overview-frame")?.getBoundingClientRect()
        .height ?? 0) > 100,
    { timeout: 5000 },
  );
  if ((await page.locator(".overview-card").count()) !== payload.count) {
    throw new Error("Overview did not render all discovered examples.");
  }
  const overviewLayout = await page.evaluate(() => {
    const overview = document.querySelector("#overview");
    const firstCard = document.querySelector(".overview-card");
    const firstFrame = document.querySelector(".overview-frame");
    return {
      scrollable: overview.scrollHeight > overview.clientHeight,
      cardRole: firstCard?.getAttribute("role"),
      cardTabIndex: firstCard?.getAttribute("tabindex"),
      framePointerEvents: getComputedStyle(firstFrame).pointerEvents,
      frameHidden: firstFrame?.getAttribute("aria-hidden"),
    };
  });
  if (!overviewLayout.scrollable) {
    throw new Error("Overview should scroll when cards exceed the viewport.");
  }
  if (
    overviewLayout.cardRole !== "button" ||
    overviewLayout.cardTabIndex !== "0"
  ) {
    throw new Error("Overview cards should expose whole-card button semantics.");
  }
  if (
    overviewLayout.framePointerEvents !== "none" ||
    overviewLayout.frameHidden !== "true"
  ) {
    throw new Error("Overview preview iframes should be inert.");
  }
  const targetCard = page
    .locator(".overview-card")
    .filter({ hasText: realExamples[0].title });
  if ((await targetCard.count()) !== 1) {
    throw new Error("Could not identify a unique overview card.");
  }
  await targetCard.click();
  await page
    .locator("#frame-status[data-state='ready']")
    .waitFor({ timeout: 5000 });
  const selectedAfterCardClick = await page
    .locator("#example-list .example-link[aria-current='true']")
    .textContent();
  if (selectedAfterCardClick?.trim() !== realExamples[0].title) {
    throw new Error("Clicking an overview card should open that example.");
  }

  if (errors.length > 0) {
    throw new Error(`Gallery emitted browser errors: ${errors.join("; ")}`);
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}

console.log("Example gallery smoke test passed.");
