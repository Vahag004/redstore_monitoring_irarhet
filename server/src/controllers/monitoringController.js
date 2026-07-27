const List = require("../models/List");
const Shop = require("../models/Shop");
const { ApiError, asyncHandler } = require("../middleware/errorHandler");
const { scrapePriceSafe } = require("../services/playwrightService");
const { computePriceStatus } = require("../utils/priceStatus");

/**
 * Scrapes RedStore's own price for a product using the "own" shop's selectors
 * against the product's redstoreUrl. Returns a number, or null if the own
 * shop isn't configured yet, the product has no redstoreUrl, or scraping fails.
 */
async function scrapeOwnPrice(product, ownShop) {
  if (!ownShop || !product.redstoreUrl) return null;

  const outcome = await scrapePriceSafe(product.redstoreUrl, ownShop.priceSelector, ownShop.titleSelector);
  return outcome.ok ? outcome.price : null;
}

// POST /api/monitoring/list/:listId
// For every product in the list:
//   1. Scrape RedStore's own price (via the "own" shop's selectors + product.redstoreUrl) -> ourPrice
//   2. Scrape every linked competitor shop's price in parallel (bounded concurrency inside playwrightService)
//   3. Attach a comparison status ("cheaper" | "more_expensive" | "equal" | "unknown") to each competitor
//      price so the frontend can color-code the "խանութներ" column against ourPrice.
const monitorList = asyncHandler(async (req, res) => {
  const { listId } = req.params;

  const list = await List.findById(listId);
  if (!list) {
    throw new ApiError(404, "List not found");
  }

  // Preload all shops once to avoid N+1 queries.
  const shops = await Shop.find();
  const shopsById = new Map(shops.map((s) => [s._id.toString(), s]));
  const ownShop = shops.find((s) => s.isOwn) || null;

  const results = await Promise.all(
    list.products.map(async (product) => {
      const [ourPrice, priceResults] = await Promise.all([
        scrapeOwnPrice(product, ownShop),
        Promise.all(
          product.links.map(async (link) => {
            const shop = shopsById.get(link.shopId?.toString());
            if (!shop || shop.isOwn) return null;

            const outcome = await scrapePriceSafe(link.url, shop.priceSelector, shop.titleSelector);
            console.log(outcome)
            if (!outcome.ok) {
              console.warn(
                `[monitoring] list=${listId} product=${product._id} shop=${shop.title} failed: ${outcome.error}`
              );
              return null;
            }

            return { shop: shop.title, price: outcome.price, url: link.url };
          })
        ),
      ]);

      // Now that we know ourPrice, attach a comparison status to each found competitor price.
      const prices = priceResults
        .filter(Boolean)
        .map((p) => ({ ...p, status: computePriceStatus(p.price, ourPrice) }));

      return {
        id: product._id.toString(),
        productTitle: product.title,
        model: product.model || "",
        ourPrice,
        prices,
      };
    })
  );

  res.json(results);
});

// POST /api/monitoring/shop/:shopId  { listId }
// For every product in the given list, checks whether it has a link pointing
// to this shop, scrapes its current price, and (unless this IS the own shop)
// attaches a priceStatus comparing it against RedStore's own price.
const monitorShop = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const { listId } = req.body;

  if (!listId) {
    throw new ApiError(400, "Field 'listId' is required in the request body");
  }

  const [shop, list, ownShop] = await Promise.all([
    Shop.findById(shopId),
    List.findById(listId),
    Shop.findOne({ isOwn: true }),
  ]);

  if (!shop) throw new ApiError(404, "Shop not found");
  if (!list) throw new ApiError(404, "List not found");

  const results = await Promise.all(
    list.products.map(async (product) => {
      const link = product.links.find((l) => l.shopId?.toString() === shopId);

      // Own price is only relevant when checking a competitor shop.
      const ourPrice = shop.isOwn ? null : await scrapeOwnPrice(product, ownShop);

      if (!link) {
        return {
          id: product._id.toString(),
          productTitle: product.title,
          foundName: "—",
          status: "no_link",
          price: null,
          url: null,
          priceStatus: "unknown",
        };
      }

      const outcome = await scrapePriceSafe(link.url, shop.priceSelector, shop.titleSelector);

      if (!outcome.ok) {
        return {
          id: product._id.toString(),
          productTitle: product.title,
          foundName: "Չգտնվեց",
          status: "not_found",
          price: null,
          url: link.url,
          priceStatus: "unknown",
        };
      }

      return {
        id: product._id.toString(),
        productTitle: product.title,
        foundName: product.title,
        status: "found",
        price: outcome.price,
        url: link.url,
        priceStatus: shop.isOwn ? "own" : computePriceStatus(outcome.price, ourPrice),
      };
    })
  );

  res.json(results);
});

module.exports = { monitorList, monitorShop };
