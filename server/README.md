# RedStore Monitoring — Backend

Node.js + Express + MongoDB (Mongoose) + Playwright backend՝ RedStore Monitoring ֆրոնթենդ նախագծի համար։

## Կառուցվածք

```
server.js                 — entry point
src/config/db.js          — MongoDB կապ
src/models/               — Shop, List (embedded Product/Link)
src/routes/               — lists, shops, monitoring
src/controllers/          — route handler-ների տրամաբանությունը
src/services/             — playwrightService.js (browser singleton, scraping)
src/middleware/           — error handling
```

## Պահանջներ

- Node.js 18+
- Տեղադրված/հասանելի MongoDB instance (լոկալ կամ MongoDB Atlas)

## Տեղադրում

```bash
npm install
npx playwright install chromium
```

Ստեղծիր `.env` ֆայլը `.env.example`-ի հիման վրա.

```bash
cp .env.example .env
```

և լրացրու `MONGODB_URI` ու `PORT` արժեքները (default՝ `PORT=5000`)։

## Գործարկում

Dev ռեժիմ (nodemon, auto-reload).

```bash
npm run dev
```

Production ռեժիմ.

```bash
npm start
```

Սերվերը կմեկնարկի `http://localhost:5000`-ի վրա (կամ `.env`-ում նշված PORT-ով), CORS-ը թույլատրված է `http://localhost:5173` (Vite dev server) համար։

Ստուգում՝

```bash
curl http://localhost:5000/api/health
```

## API endpoints

### Lists
- `GET    /api/lists`
- `POST   /api/lists`                              — body: `{ title }`
- `DELETE /api/lists/:listId`
- `POST   /api/lists/:listId/products`             — body: `{ title, model, redstoreUrl, links: [{ shopId, url }] }`
- `PUT    /api/lists/:listId/products/:productId`  — body: `{ title, model, redstoreUrl, links }`
- `DELETE /api/lists/:listId/products/:productId`

`redstoreUrl` **պարտադիր** է ապրանք ավելացնելիս — սա տվյալ ապրանքի էջի հասցեն է RedStore-ի կայքում, որով Playwright-ը գտնում է մեր սեփական գինը՝ համեմատության համար։

### Shops
- `GET    /api/shops`
- `POST   /api/shops`          — body: `{ title, priceSelector, titleSelector, isOwn }`
- `PUT    /api/shops/:shopId`  — body: `{ title, priceSelector, titleSelector, isOwn }`
- `DELETE /api/shops/:shopId`

`isOwn: true` նշանակում է, որ այս խանութը հենց **RedStore-ն է** (մեր սեփական կայքը)։ Timezone-ի, selectors-ի իմաստով այն նույն `priceSelector`/`titleSelector` դաշտերն է օգտագործում, ինչ մյուս խանութները։ Ցանկացած պահի կարող է լինել առավելագույնը **մեկ** shop՝ `isOwn: true`-ով. նոր isOwn=true shop ստեղծելիս/թարմացնելիս մյուսներինը ավտոմատ դառնում է `false`։

### Monitoring (Playwright)
- `POST /api/monitoring/list/:listId`
  Ամեն ապրանքի համար՝
  1. Scrape է անում **RedStore-ի սեփական գինը** (`isOwn` shop-ի selectors-ով + `product.redstoreUrl`) → `ourPrice`
  2. Scrape է անում ամեն կապված մրցակից խանութի գինը (միաժամանակ, concurrency՝ 5)
  3. Ամեն մրցակցի գնի կողքին ավելացնում է `status` դաշտ՝ `"cheaper" | "more_expensive" | "equal" | "unknown"` (համեմատած `ourPrice`-ի հետ), որով frontend-ը կարող է գունավորել «խանութներ» սյունակը

  Response format՝
  ```json
  [
    {
      "id": "<productId>",
      "productTitle": "...",
      "model": "...",
      "ourPrice": 12500,
      "prices": [
        { "shop": "Shop A", "price": 12000, "url": "...", "status": "cheaper" },
        { "shop": "Shop B", "price": 13000, "url": "...", "status": "more_expensive" }
      ]
    }
  ]
  ```

- `POST /api/monitoring/shop/:shopId` — body: `{ listId }`
  Տվյալ խանութում ցուցակի յուրաքանչյուր ապրանքի գնի ստուգում։ Եթե shop-ը մրցակից է (ոչ `isOwn`), նաև scrape է անում RedStore-ի սեփական գինը և ավելացնում `priceStatus` դաշտը (`"cheaper" | "more_expensive" | "equal" | "unknown"`, կամ `"own"` եթե ինքը RedStore-ն է)։

## Playwright կարգավորումներ

- Chromium, headless
- Browser instance-ը գործարկվում է սերվերի start-ի ժամանակ և կիսվում է բոլոր հարցումների միջև (singleton); ամեն հարցման համար ստեղծվում/փակվում է առանձին `context`/`page`
- Navigation timeout՝ 15000ms, `waitUntil: "domcontentloaded"`
- 1 retry navigation-ի ձախողման դեպքում
- Scraping-ը կատարվում է `Promise.all`-ով, բայց սահմանափակված է `p-limit`-ով (concurrency՝ 5), որպեսզի չբացվեն չափազանց շատ browser context-եր միաժամանակ
- Գնի string-ը parse է արվում regex-ով (պահվում են միայն թվանշաններ, ստորակետ և կետ), որպեսզի օր.՝ `"12,500 դր"` → `12500`

## Նշումներ

- Բոլոր Mongoose schema-ները ունեն `toJSON` transform, որը `_id`-ը վերածում է `id`-ի (string) և հեռացնում `__v`-ն. սա կիրառվում է նաև embedded `products` և `links` subdocument-ների վրա, այնպես որ frontend-ը միշտ ստանում է `{ id, ... }`։
- Եթե որևէ shop-ի scraping-ը ձախողվում է (timeout կամ սելեքթորը չի գտնվում), այն պարզապես բացակայում է `prices` զանգվածից՝ առանց ամբողջ հարցումը ձախողելու։
- Եթե `isOwn` shop դեռ կարգավորված չէ (կամ `product.redstoreUrl` բացակայում է), `ourPrice` կլինի `null`, և բոլոր մրցակիցների `status`-ը կլինի `"unknown"` (frontend-ը կարող է սա ցույց տալ մոխրագույնով)։
- `isOwn` shop-ը uniqueness-ը enforce է արվում controller-ի մակարդակում (`Shop.updateMany`), ոչ թե DB-level unique index-ով, քանի որ պահանջվում է "առավելագույնը մեկ true" տրամաբանություն, ոչ թե "միշտ unique արժեք"։
