import http from "./http";

export const getShops = () => http.get("/shops").then((res) => res.data);

export const createShop = (shop) =>
    http
        .post("/shops", {
            title: shop.title,
            priceSelector: shop.priceSelector,
            titleSelector: shop.titleSelector || "",
            isOwn: Boolean(shop.isOwn),
        })
        .then((res) => res.data);

export const updateShop = (shopId, shop) =>
    http
        .put(`/shops/${shopId}`, {
            title: shop.title,
            priceSelector: shop.priceSelector,
            titleSelector: shop.titleSelector || "",
            isOwn: Boolean(shop.isOwn),
        })
        .then(() => shopId);

export const deleteShop = (shopId) =>
    http.delete(`/shops/${shopId}`).then(() => shopId);