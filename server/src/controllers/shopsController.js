const Shop = require("../models/Shop");
const { ApiError, asyncHandler } = require("../middleware/errorHandler");

// GET /api/shops
const getShops = asyncHandler(async (req, res) => {
  const shops = await Shop.find().sort({ isOwn: -1, createdAt: -1 });
  res.json(shops);
});

// POST /api/shops  { title, priceSelector, titleSelector, isOwn }
const createShop = asyncHandler(async (req, res) => {
  const { title, priceSelector, titleSelector, isOwn } = req.body;

  if (!title || !title.trim()) {
    throw new ApiError(400, "Field 'title' is required");
  }
  if (!priceSelector || !priceSelector.trim()) {
    throw new ApiError(400, "Field 'priceSelector' is required");
  }

  // Only one shop can be marked as "own" (RedStore itself) at a time.
  if (isOwn) {
    await Shop.updateMany({ isOwn: true }, { isOwn: false });
  }

  const shop = await Shop.create({
    title: title.trim(),
    priceSelector: priceSelector.trim(),
    titleSelector: titleSelector ? titleSelector.trim() : undefined,
    isOwn: Boolean(isOwn),
  });

  res.status(201).json(shop);
});

// PUT /api/shops/:shopId  { title, priceSelector, titleSelector, isOwn }
const updateShop = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const { title, priceSelector, titleSelector, isOwn } = req.body;

  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new ApiError(404, "Shop not found");
  }

  if (title !== undefined) {
    if (!title.trim()) throw new ApiError(400, "Field 'title' cannot be empty");
    shop.title = title.trim();
  }
  if (priceSelector !== undefined) {
    if (!priceSelector.trim()) throw new ApiError(400, "Field 'priceSelector' cannot be empty");
    shop.priceSelector = priceSelector.trim();
  }
  if (titleSelector !== undefined) {
    shop.titleSelector = titleSelector;
  }
  if (isOwn !== undefined) {
    if (isOwn) {
      // Unset isOwn on every other shop so there's always at most one "own" shop.
      await Shop.updateMany({ _id: { $ne: shop._id }, isOwn: true }, { isOwn: false });
    }
    shop.isOwn = Boolean(isOwn);
  }

  await shop.save();
  res.json(shop);
});

// DELETE /api/shops/:shopId
const deleteShop = asyncHandler(async (req, res) => {
  const { shopId } = req.params;

  const deleted = await Shop.findByIdAndDelete(shopId);
  if (!deleted) {
    throw new ApiError(404, "Shop not found");
  }

  res.json({ message: "Shop deleted", id: shopId });
});

module.exports = { getShops, createShop, updateShop, deleteShop };
