import http from "./http";

export const getLists = () => http.get("/lists").then((res) => res.data);

export const createList = (title) =>
    http.post("/lists", { title }).then((res) => res.data);

export const deleteList = (listId) =>
    http.delete(`/lists/${listId}`).then(() => listId);

export const addProduct = (listId, product) =>
    http
        .post(`/lists/${listId}/products`, {
            title: product.title,
            model: product.model || "",
            redstoreUrl: product.redstoreUrl,
            links: (product.links || []).filter((l) => l.shopId && l.url),
        })
        .then((res) => res.data);

export const updateProduct = (listId, productId, product) =>
    http
        .put(`/lists/${listId}/products/${productId}`, {
            title: product.title,
            model: product.model || "",
            redstoreUrl: product.redstoreUrl,
            links: (product.links || []).filter((l) => l.shopId && l.url),
        })
        .then((res) => res.data);

export const removeProduct = (listId, productId) =>
    http
        .delete(`/lists/${listId}/products/${productId}`)
        .then(() => productId);