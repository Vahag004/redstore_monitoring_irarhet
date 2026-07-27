import http from "./http";

/**
 * Triggers a full monitoring run for every product in a list, across every
 * shop link stored on each product. The backend does the actual Playwright
 * scraping; the frontend just gets rows back, ready for <DataTable /> and
 * the Excel export.
 *
 * Expected response shape:
 *   [{ id, productTitle, ourPrice, prices: [{ shop, price, url }] }, ...]
 */
export const runListMonitoring = (listId) =>
    http.post(`/monitoring/list/${listId}`).then((res) => res.data);

/**
 * Triggers a monitoring run for a single shop against every product in a
 * list that has a stored link for that shop.
 *
 * Expected response shape:
 *   [{ id, productTitle, foundName, status, price, url }, ...]
 *   status is one of: "found" | "not_found" | "no_link"
 */
export const runShopMonitoring = (shopId, listId) =>
    http
        .post(`/monitoring/shop/${shopId}`, { listId })
        .then((res) => res.data);
