const List = require("../models/List");
const { ApiError, asyncHandler } = require("../middleware/errorHandler");

// GET /api/lists
const getLists = asyncHandler(async (req, res) => {
    const lists = await List.find().sort({ createdAt: -1 });
    res.json(lists);
});

// POST /api/lists  { title }
const createList = asyncHandler(async (req, res) => {
    const { title } = req.body;

    if (!title || !title.trim()) {
        throw new ApiError(400, "Field 'title' is required");
    }

    const list = await List.create({ title: title.trim(), products: [] });
    res.status(201).json(list);
});

// DELETE /api/lists/:listId
const deleteList = asyncHandler(async (req, res) => {
    const { listId } = req.params;

    const deleted = await List.findByIdAndDelete(listId);
    if (!deleted) {
        throw new ApiError(404, "List not found");
    }

    res.json({ message: "List deleted", id: listId });
});

// POST /api/lists/:listId/products  { title, model, redstoreUrl, links: [{shopId, url}] }
const addProduct = asyncHandler(async (req, res) => {
    const { listId } = req.params;
    const { title, model, redstoreUrl, links } = req.body;

    if (!title || !title.trim()) {
        throw new ApiError(400, "Field 'title' is required");
    }
    if (!redstoreUrl || !redstoreUrl.trim()) {
        throw new ApiError(
            400,
            "Field 'redstoreUrl' is required (RedStore-ի էջի հասցեն)",
        );
    }
    console.log(redstoreUrl);

    const list = await List.findById(listId);
    if (!list) {
        throw new ApiError(404, "List not found");
    }

    const normalizedLinks = normalizeLinks(links);

    list.products.push({
        title: title.trim(),
        model: model || "",
        redstoreUrl: redstoreUrl.trim(),
        links: normalizedLinks,
    });
    await list.save();

    const createdProduct = list.products[list.products.length - 1];
    res.status(201).json(createdProduct);
});

// PUT /api/lists/:listId/products/:productId  { title, model, redstoreUrl, links }
const updateProduct = asyncHandler(async (req, res) => {
    const { listId, productId } = req.params;
    const { title, model, redstoreUrl, links } = req.body;
    console.log(redstoreUrl);

    const list = await List.findById(listId);
    if (!list) {
        throw new ApiError(404, "List not found");
    }

    const product = list.products.id(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (title !== undefined) {
        if (!title.trim()) {
            throw new ApiError(400, "Field 'title' cannot be empty");
        }
        product.title = title.trim();
    }
    if (model !== undefined) product.model = model;
    if (redstoreUrl !== undefined) {
        if (!redstoreUrl.trim()) {
            throw new ApiError(400, "Field 'redstoreUrl' cannot be empty");
        }
        product.redstoreUrl = redstoreUrl.trim();
    }
    if (links !== undefined) product.links = normalizeLinks(links);

    await list.save();
    res.json(product);
});

// DELETE /api/lists/:listId/products/:productId
const deleteProduct = asyncHandler(async (req, res) => {
    const { listId, productId } = req.params;

    const list = await List.findById(listId);
    if (!list) {
        throw new ApiError(404, "List not found");
    }

    const product = list.products.id(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    product.deleteOne();
    await list.save();

    res.json({ message: "Product deleted", id: productId });
});

function normalizeLinks(links) {
    if (!Array.isArray(links)) return [];
    return links
        .filter((link) => link && link.shopId && link.url)
        .map((link) => ({ shopId: link.shopId, url: link.url }));
}

module.exports = {
    getLists,
    createList,
    deleteList,
    addProduct,
    updateProduct,
    deleteProduct,
};
