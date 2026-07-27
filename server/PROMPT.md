# Պրոմպտ (փոխարինում է նախկինում ուղարկվածին)

Ստեղծիր ամբողջական backend՝ Node.js + Express + MongoDB (Mongoose) + Playwright-ով, RedStore Monitoring անունով ֆրոնթենդ նախագծի համար։ Backend-ը պետք է լինի /api base path-ով, CORS միացված (frontend-ը աշխատում է Vite dev server-ի վրա, http://localhost:5173).

Համակարգի իմաստը՝ մենք ունենք մեր սեփական կայքը՝ **RedStore**, և ուզում ենք հետևել, թե մեր ապրանքների գները ինչպես են համեմատվում մրցակից խանութների գների հետ։ Ամեն ապրանք ունի՝ (ա) իր հասցեն RedStore-ի կայքում, (բ) մեկ կամ մի քանի հասցեներ մրցակից խանութների կայքերում։ Monitoring-ը Playwright-ով scrape է անում և° մեր, և° մրցակիցների գները, և ցույց է տալիս համեմատությունը։

### Տվյալների մոդելներ (Mongoose)

1. **Shop**
   - title: String, required
   - priceSelector: String, required (CSS սելեքթոր՝ ապրանքի էջում գինը կարդալու համար)
   - titleSelector: String, optional (հաստատման նպատակով՝ ապրանքի անվանումը կարդալու համար)
   - isOwn: Boolean, default false — նշում է, որ այս shop-ը հենց **RedStore-ն է** (մեր սեփական կայքը)։ Ցանկացած պահի կարող է լինել առավելագույնը մեկ shop՝ isOwn: true-ով։ Նոր isOwn=true shop ստեղծելիս կամ գոյություն ունեցող shop-ը isOwn=true դարձնելիս, ավտոմատ isOwn=false դարձրու մնացած բոլոր shop-երի վրա (controller-level enforcement, updateMany-ով, ոչ թե DB unique index)։
   - timestamps: true

2. **List**
   - title: String, required
   - products: [Product] (embedded subdocument array)
      Product:
        - title: String, required
        - model: String
        - redstoreUrl: String, **required** — ապրանքի հասցեն RedStore-ի կայքում (օգտագործվում է isOwn shop-ի selectors-ով մեր գինը scrape անելու համար)
        - links: [{ shopId: ObjectId (ref Shop), url: String required }] — մրցակից խանութների հասցեները
   - timestamps: true

ԿԱՐԵՎՈՐ. Բոլոր schema-ներում ավելացրու toJSON transform, որը `_id`-ը վերածում է `id`-ի (string) և հեռացնում `__v`-ն, որպեսզի frontend-ը ստանա `{ id, ... }` ոչ թե `{ _id, ... }`։ Նույնը՝ nested products և links-երի համար։

### REST endpoints

**Lists**
- GET /api/lists → վերադարձնում է բոլոր ցուցակները (title, products[])
- POST /api/lists  body: { title } → ստեղծում է նոր դատարկ ցուցակ
- DELETE /api/lists/:listId → ջնջում է ցուցակը
- POST /api/lists/:listId/products  body: { title, model, redstoreUrl, links: [{shopId, url}] } → ավելացնում է ապրանք ցուցակին։ `redstoreUrl` պարտադիր է (400 եթե բացակայում է)։ Վերադարձնում է ստեղծված product-ը
- PUT /api/lists/:listId/products/:productId  body: { title, model, redstoreUrl, links } → փոփոխում է ապրանքը, վերադարձնում է թարմացված product-ը
- DELETE /api/lists/:listId/products/:productId → հեռացնում է ապրանքը ցուցակից

**Shops**
- GET /api/shops → վերադարձնում է բոլոր խանութները (isOwn shop-ը սորտավորված առաջինը)
- POST /api/shops  body: { title, priceSelector, titleSelector, isOwn } → ստեղծում է խանութ. եթե isOwn=true, մյուս բոլոր shop-երինը դարձնում է false
- PUT /api/shops/:shopId  body: { title, priceSelector, titleSelector, isOwn } → փոփոխում է խանութը, նույն isOwn uniqueness տրամաբանությամբ
- DELETE /api/shops/:shopId → ջնջում է խանութը

**Monitoring (սա ամենակարևոր մասն է, այստեղ գործարկվում է Playwright-ը)**

- POST /api/monitoring/list/:listId

  Վերցնում է տվյալ listId-ի բոլոր products-ը։ Գտնում է isOwn=true shop-ը (եթե կա)։ Ամեն product-ի համար՝

  1. Playwright-ով բացում է `product.redstoreUrl`-ը, isOwn shop-ի `priceSelector`-ով կարդում է **մեր գինը** (`ourPrice`)։ Եթե isOwn shop չկա, redstoreUrl բացակայում է, կամ scraping-ը ձախողվում է → `ourPrice: null`։
  2. Ամեն product-ի ամեն links[]-ի համար (link.shopId, link.url), Playwright-ով բացում է link.url-ը, `shop.priceSelector`-ով կարդում է մրցակցի գինը (parse անելով թվի, հեռացնելով արժույթի նշաններ/բացատներ)։ Եթե սելեքթորը չի գտնվում կամ timeout է լինում, այդ shop-ի արդյունքը բաց ես թողնում `prices` զանգվածից։
  3. Ամեն գտնված մրցակցի գնի կողքին ավելացնում ես `status` դաշտ՝ ըստ `ourPrice`-ի հետ համեմատության.
     - `"cheaper"` — մրցակիցը ավելի էժան է քան մենք
     - `"more_expensive"` — մրցակիցը ավելի թանկ է քան մենք
     - `"equal"` — նույն գինը
     - `"unknown"` — եթե `ourPrice` հնարավոր չէր որոշել

  Կատարիր բոլոր link-երի (և սեփական redstoreUrl-ի) scraping-ը զուգահեռ (Promise.all), բայց սահմանափակիր միաժամանակյա browser context-երի քանակը (p-limit-ով, concurrency՝ 3-5)։

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

  (Ֆրոնթենդի աղյուսակի սյունակները սրանից կկառուցվեն այսպես՝ **Ապրանք | Մոդել | Գին (ourPrice) | Խանութներ (prices, գունավորված status-ով)**)

- POST /api/monitoring/shop/:shopId  body: { listId }

  Վերցնում է listId-ի products-ը։ Ամեն product-ի համար ստուգում է՝ կա արդյոք links[] մեջ այս shopId-ի հետ կապված link։
    - Եթե չկա՝ վերադարձնում է { id, productTitle, foundName: "—", status: "no_link", price: null, url: null, priceStatus: "unknown" }
    - Եթե կա՝ Playwright-ով բացում է url-ը, կարդում գինը shop.priceSelector-ով (և, եթե shop.titleSelector կա, նաև վերնագիրը՝ հաստատման համար)
      - Հաջողության դեպքում՝ { id, productTitle, foundName: productTitle, status: "found", price: <number>, url, priceStatus }
      - Ձախողման դեպքում (timeout/սելեքթոր չգտնվեց)՝ { id, productTitle, foundName: "Չգտնվեց", status: "not_found", price: null, url, priceStatus: "unknown" }

  `priceStatus` հաշվարկվում է այնպես, ինչպես վերևում (`cheaper`/`more_expensive`/`equal`/`unknown`), համեմատելով scrape արված գինը RedStore-ի սեփական գնի հետ (որը նույնպես scrape է արվում isOwn shop-ի selectors-ով + product.redstoreUrl-ով), **բացառությամբ** այն դեպքի, երբ ինքը `shopId`-ով shop-ը հենց isOwn shop-ն է. այդ դեպքում `priceStatus: "own"`։

### Playwright կարգավորումներ

- Օգտագործիր chromium headless-ով (playwright.chromium.launch({ headless: true }))
- Ամեն url-ի համար timeout՝ 15000ms, page.goto-ի waitUntil: "domcontentloaded"
- Գնի տեքստը parse անելիս հեռացրու ամեն ինչ բացի թվանշաններից և ստորակետ/կետից (regex), որպեսզի "12,500 դր" → 12500
- Browser instance-ը գործարկիր մեկ անգամ սերվերի start-ի ժամանակ և վերաօգտագործիր (singleton), context/page-երը ստեղծիր/փակիր ամեն հարցման համար, error handling-ը՝ try/catch/finally page.close()-ով
- Ավելացրու պարզ retry (1 կրկնություն) եթե navigation-ը ձախողվում է network error-ով
- Scraping-ի ընդհանուր concurrency-ը (և° սեփական redstoreUrl-ի, և° մրցակիցների) սահմանափակիր p-limit-ով (3-5), որպեսզի սերվերը/browser-ը չծանրաբեռնվի

### Ընդհանուր պահանջներ

- Express + mongoose, MongoDB connection string՝ .env-ից (MONGODB_URI), server port՝ PORT (default 5000)
- CORS middleware՝ թույլատրելով http://localhost:5173
- express.json() body parser
- Validation՝ required դաշտերի համար (title, priceSelector, redstoreUrl), վերադարձնել 400 սխալ հասկանալի message-ով
- Error handling middleware, որը վերադարձնում է { message: "..." } JSON format-ով (400/404/500)
- Structure՝ /src/models, /src/routes, /src/controllers, /src/services (playwright service առանձին ֆայլում), /src/config (db connection), /src/utils (price comparison logic), server.js entry point
- package.json scripts՝ "start" և "dev" (nodemon-ով)
- Ավելացրու .env.example ֆայլ MONGODB_URI և PORT-ով
- Գրիր կարճ README, թե ինչպես տեղադրել ու գործարկել (mongodb պետք է լինի տեղադրված/հասանելի, npm install, npx playwright install chromium, npm run dev), ներառյալ isOwn shop-ի և redstoreUrl-ի բացատրությունը
