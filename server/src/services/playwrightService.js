const { chromium } = require("playwright");
const pLimit = require("p-limit");

const NAVIGATION_TIMEOUT_MS = 15000;
const CONCURRENCY = 5;
const MAX_NAV_ATTEMPTS = 2; // 1 original try + 1 retry on network error

let browserInstance = null;
const limit = pLimit(CONCURRENCY);

/**
 * Lazily launches (once) and returns the shared Chromium browser instance.
 */
async function getBrowser() {
    if (!browserInstance) {
        browserInstance = await chromium.launch({ headless: true });
        console.log("[playwright] Chromium browser launched");

        browserInstance.on("disconnected", () => {
            console.warn(
                "[playwright] Browser disconnected, will relaunch on next use",
            );
            browserInstance = null;
        });
    }
    return browserInstance;
}

/**
 * Explicitly launches the browser at server start-up (singleton, reused across requests).
 */
async function initBrowser() {
    await getBrowser();
}

/**
 * Gracefully closes the shared browser instance (used on server shutdown).
 */
async function closeBrowser() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}

/**
 * Parses a raw price string into a number.
 * Keeps only digits, comma, and dot, then normalizes to a JS float.
 * e.g. "12,500 դր" -> 12500 ; "9.990,50 EUR" -> 9990.50 (best-effort)
 */
function parsePrice(rawText) {
    if (!rawText) return null;

    let cleaned = rawText.replace(/[^\d.,]/g, "").trim();
    if (!cleaned) return null;

    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");

    if (lastComma !== -1 && lastDot !== -1) {
        // վերջին separator-ը decimal է
        if (lastComma > lastDot) {
            cleaned = cleaned.replace(/\./g, "");
            cleaned = cleaned.replace(",", ".");
        } else {
            cleaned = cleaned.replace(/,/g, "");
        }
    } else if (lastComma !== -1) {
        const decimals = cleaned.length - lastComma - 1;

        if (decimals === 2) {
            // 130000,50
            cleaned = cleaned.replace(",", ".");
        } else {
            // 130,000
            cleaned = cleaned.replace(/,/g, "");
        }
    } else if (lastDot !== -1) {
        const decimals = cleaned.length - lastDot - 1;

        if (decimals === 3) {
            // 130.000 -> հազարների բաժանարար
            cleaned = cleaned.replace(/\./g, "");
        }
        // եթե 1 կամ 2 նիշ է՝ թողնում ենք որպես decimal
    }

    const value = Number(cleaned);

    return Number.isFinite(value) ? value : null;
}

/**
 * Navigates to `url` with one retry on network-level failure.
 */
async function gotoWithRetry(page, url) {
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_NAV_ATTEMPTS; attempt += 1) {
        try {
            await page.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: NAVIGATION_TIMEOUT_MS,
            });
            return;
        } catch (err) {
            lastError = err;
            console.warn(
                `[playwright] navigation attempt ${attempt}/${MAX_NAV_ATTEMPTS} failed for ${url}: ${err.message}`,
            );
        }
    }

    throw lastError;
}

/**
 * Scrapes a single URL for a price (and optionally a confirmation title).
 * Returns { price, title } or throws on failure (selector not found / timeout / navigation error).
 */
async function scrapePrice(url, priceSelector, titleSelector) {
    const browser = await getBrowser();
    const context = await browser.newContext({
        userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        locale: "hy-AM",
    });
    const page = await context.newPage();
    try {
        await gotoWithRetry(page, url);

        const priceLocator = page.locator(priceSelector).first();
        const priceText = await priceLocator.textContent({
            timeout: NAVIGATION_TIMEOUT_MS,
        });
        const price = parsePrice(priceText);

        if (price === null) {
            throw new Error(
                `Price selector "${priceSelector}" produced no parsable value`,
            );
        }

        let title = null;
        if (titleSelector) {
            try {
                const titleLocator = page.locator(titleSelector).first();
                title =
                    (
                        await titleLocator.textContent({
                            timeout: NAVIGATION_TIMEOUT_MS,
                        })
                    )?.trim() || null;
            } catch (err) {
                // Title confirmation is best-effort only; don't fail the whole scrape for it.
                console.warn(
                    `[playwright] titleSelector lookup failed for ${url}: ${err.message}`,
                );
            }
        }

        return { price, title };
    } finally {
        await page.close().catch(() => {});
        await context.close().catch(() => {});
    }
}

/**
 * Runs `scrapePrice` bounded by the shared concurrency limiter.
 * Never throws: resolves to { ok: true, price, title } or { ok: false, error }.
 */
async function scrapePriceSafe(url, priceSelector, titleSelector) {
    return limit(async () => {
        try {
            const { price, title } = await scrapePrice(
                url,
                priceSelector,
                titleSelector,
            );
            return { ok: true, price, title };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    });
}

module.exports = {
    initBrowser,
    closeBrowser,
    scrapePriceSafe,
    parsePrice, // exported for unit testing
};
