# RedStore Monitoring (Frontend)

React + **Redux Toolkit** (state management) + **Axios** (HTTP requests) +
MUI. Մոնիթորինգն աշխատում է ուղիղ ապրանքի էջի հղումներով, ոչ թե որոնումով։

## Ինչ փոխվեց այս տարբերակում

- Բոլոր տվյալների կանչերն այժմ իրական **Axios** հարցումներ են, ոչ թե
  localStorage մոկ (`src/api/mockApi.js` ջնջվեց)։
- API-ն բաժանված է 3 ֆայլում.
  - `src/api/http.js` — ընդհանուր axios instance (baseURL, error normalizing)
  - `src/api/listsApi.js` — ցուցակներ/ապրանքներ
  - `src/api/shopsApi.js` — խանութներ
  - `src/api/monitoringApi.js` — մոնիթորինգի գործարկում (backend-ի Playwright)
- **Redux Toolkit**-ի slice-երը (`listsSlice.js`, `shopsSlice.js`)
  շարունակում են լինել single source of truth-ը UI-ի համար. thunks-ը պարզապես
  կանչում են axios ֆունկցիաները։

## Կարգավորում

1. Ստեղծեք `.env` ֆայլ (`.env.example`-ի հիման վրա).

   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

2. `npm install && npm run dev`

Առանց իրական backend-ի աշխատացնելու, հարցումները կձախողվեն (404/ECONNREFUSED),
քանի որ մոկ տվյալների շերտն այլևս չկա։ Ներքևում կցված է պրոմպտ, որով
կարող եք գեներացնել համապատասխան backend-ը։

## Ակնկալվող Backend API Contract

Base URL՝ `VITE_API_BASE_URL` (օր.՝ `http://localhost:5000/api`)

### Lists
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/lists` | — | `List[]` |
| POST | `/lists` | `{ title }` | `List` |
| DELETE | `/lists/:listId` | — | `204` |
| POST | `/lists/:listId/products` | `{ title, model, links }` | `Product` |
| PUT | `/lists/:listId/products/:productId` | `{ title, model, links }` | `Product` |
| DELETE | `/lists/:listId/products/:productId` | — | `204` |

`List = { id, title, products: Product[] }`
`Product = { id, title, model, links: [{ id, shopId, url }] }`

### Shops
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/shops` | — | `Shop[]` |
| POST | `/shops` | `{ title, priceSelector, titleSelector }` | `Shop` |
| PUT | `/shops/:shopId` | `{ title, priceSelector, titleSelector }` | `204` |
| DELETE | `/shops/:shopId` | — | `204` |

`Shop = { id, title, priceSelector, titleSelector }`

### Monitoring (server runs Playwright here)
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/monitoring/list/:listId` | — | `[{ id, productTitle, ourPrice, prices: [{shop, price, url}] }]` |
| POST | `/monitoring/shop/:shopId` | `{ listId }` | `[{ id, productTitle, foundName, status, price, url }]` (`status`: `found`\|`not_found`\|`no_link`) |

**Important:** all `id` fields must be plain `id` (string), not Mongo's
`_id` — see the backend prompt below, which asks for a `toJSON` transform
that does this mapping.
