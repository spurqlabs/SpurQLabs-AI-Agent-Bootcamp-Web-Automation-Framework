# Product Requirements Document — Demoblaze "Product Store"

| Item | Detail |
|---|---|
| Application | Demoblaze Product Store — https://www.demoblaze.com/ |
| Document type | Product Requirements Document (reverse-engineered from the live application) |
| Version | 1.0 |
| Date | 2026-11-24 |
| Method | Hands-on exploration with Playwright MCP (UI flows, DOM inspection, network/API calls, client-side source review) |
| Intended use | Source for SpurQuality epics → user stories → test cases, and for the Playwright + Cucumber automation framework in this repository |

> **How to read this document.** Section 4 describes *what the product does today* (observed behaviour). Each requirement has an ID (`FR-xxx`, `NFR-xxx`, `BR-xxx`) so epics, stories and test cases can trace back to it. Where the live behaviour is a defect rather than intended behaviour, it is called out in **Section 9 – Known defects** (`DEF-xx`), and the requirement states the *expected* behaviour. Section 10 proposes ready-to-use epics and user stories with acceptance criteria.

---

## Table of contents

1. [Product overview](#1-product-overview)
2. [Scope](#2-scope)
3. [Users and personas](#3-users-and-personas)
4. [Functional requirements](#4-functional-requirements)
5. [Business rules](#5-business-rules)
6. [System messages catalogue](#6-system-messages-catalogue)
7. [Data: product catalogue](#7-data-product-catalogue)
8. [Technical reference (architecture, API, state)](#8-technical-reference)
9. [Known defects and gaps observed](#9-known-defects-and-gaps-observed)
10. [Proposed epics and user stories](#10-proposed-epics-and-user-stories)
11. [Non-functional requirements](#11-non-functional-requirements)
12. [Test strategy guidance](#12-test-strategy-guidance)
13. [Traceability matrix](#13-traceability-matrix)
14. [Assumptions and open questions](#14-assumptions-and-open-questions)
15. [Appendix: element locators](#15-appendix-element-locators)

---

## 1. Product overview

Demoblaze "Product Store" is a demo e-commerce web shop that sells consumer electronics in three categories: **Phones, Laptops and Monitors**. Visitors can browse and filter the catalogue, view product details, add products to a cart (as a guest or as a registered user), remove items, and place an order by entering name and card details. The site also offers sign up, log in / log out, a "Contact" message form and an "About us" video.

It is a static front end (HTML + jQuery + Bootstrap 4) that talks to a JSON REST API at `https://api.demoblaze.com`. There is no real payment processing; "purchase" only shows a confirmation and empties the cart.

### 1.1 Goals
- Let a shopper find a product quickly by browsing or category.
- Let a shopper build a cart, with or without an account.
- Let a shopper complete a (simulated) checkout and receive an order confirmation.
- Let a shopper create an account so their cart persists across sessions.

### 1.2 Site map

```
index.html  (Home / catalogue)
 ├─ Navbar: PRODUCT STORE logo · Home · Contact⧉ · About us⧉ · Cart · Log in⧉ · Sign up⧉
 │          (logged in: Welcome <username> · Log out  replace Log in / Sign up)
 ├─ Carousel (3 slides)
 ├─ Categories sidebar: CATEGORIES · Phones · Laptops · Monitors
 ├─ Product grid (9 cards per page) + Previous / Next
 └─ Footer: About Us · Get in Touch · PRODUCT STORE · copyright
prod.html?idp_=<id>  (Product detail)
cart.html            (Cart + Place Order⧉)
⧉ = Bootstrap modal dialog on the same page
```

---

## 2. Scope

### 2.1 In scope (features present today)
| # | Feature area |
|---|---|
| 1 | Global navigation, header and footer |
| 2 | Home page: hero carousel, product grid, pagination |
| 3 | Category filtering (Phones / Laptops / Monitors) |
| 4 | Product detail page |
| 5 | Add to cart (guest and logged-in) |
| 6 | Cart: view, line items, total, delete item |
| 7 | Checkout: Place Order form, purchase confirmation |
| 8 | User registration (Sign up) |
| 9 | Authentication (Log in / Log out, session token) |
| 10 | Contact form |
| 11 | About us video |

### 2.2 Out of scope (not present in the product)
Search, sorting, product reviews/ratings, wishlist, quantity editing, coupons, shipping options, tax calculation (price is labelled "*includes tax"), real payment gateway, order history, password reset, profile management, email notifications, multi-currency (USD only), localisation.

---

## 3. Users and personas

| Persona | Description | Key capabilities |
|---|---|---|
| **Guest shopper** | Not logged in. Identified only by a browser cookie `user=<GUID>` created on first visit. | Browse, filter, view details, add to cart, view/delete cart, place order, contact, watch video, sign up, log in. |
| **Registered shopper** | Has an account and is logged in (cookie `tokenp_`). | Everything a guest can do; cart is tied to the account and persists across browsers/sessions; sees "Welcome <username>". |
| **New visitor** | Wants an account. | Sign up, then log in. |

---

## 4. Functional requirements

Priority key: **M** = Must, **S** = Should, **C** = Could.

### 4.1 Global navigation and layout (NAV)

| ID | Requirement | Pri |
|---|---|---|
| FR-NAV-01 | Every page shows a top navigation bar with: **PRODUCT STORE** logo (links to `index.html`), **Home**, **Contact**, **About us**, **Cart**, **Log in**, **Sign up**. | M |
| FR-NAV-02 | When a user is logged in, **Log in** and **Sign up** are hidden and **Welcome &lt;username&gt;** and **Log out** are shown. | M |
| FR-NAV-03 | **Home** and the logo navigate to the home page; **Cart** navigates to `cart.html`. | M |
| FR-NAV-04 | **Contact**, **About us**, **Log in** and **Sign up** open modal dialogs without leaving the current page. | M |
| FR-NAV-05 | Every page shows a footer with: *About Us* text, *Get in Touch* (Address: 2390 El Camino Real · Phone: +440 123456 · Email: demo@blazemeter.com), *PRODUCT STORE* heading and "Copyright © Product Store". | S |
| FR-NAV-06 | On narrow screens the nav collapses behind a hamburger toggle (Bootstrap `navbar-toggler`). | S |
| FR-NAV-07 | Every modal can be dismissed with **×** or **Close**. | M |
| FR-NAV-08 | The page title (browser tab) is "STORE" on all pages. | C |

### 4.2 Home page and catalogue browsing (HOME)

| ID | Requirement | Pri |
|---|---|---|
| FR-HOME-01 | The home page shows a carousel of 3 slides (First slide `Samsung1.jpg`, Second slide `nexus1.jpg`, Third slide `iphone1.jpg`) with Previous/Next arrows and 3 slide indicators; it auto-rotates. | S |
| FR-HOME-02 | The home page shows a product grid loaded from the API; the first page shows **9 products** (IDs 1–9). | M |
| FR-HOME-03 | Each product card shows: image, title (link), price as `$<amount>`, and a short description. | M |
| FR-HOME-04 | Clicking a card's **title** or **image** opens `prod.html?idp_=<id>` for that product. | M |
| FR-HOME-05 | **Next** loads the next page of products (page 2 = IDs 10–15, 6 products) and hides itself when there is no further page. | M |
| FR-HOME-06 | **Previous** returns to the previous page of products and re-shows **Next**. Expected: page 1 shows exactly the same 9 products (IDs 1–9) as on first load. *(See DEF-01.)* | M |
| FR-HOME-07 | Products are loaded asynchronously after the page renders; the grid must be fully populated before user interaction is expected (≈ 1–2 s). | S |

### 4.3 Category filter (CAT)

| ID | Requirement | Pri |
|---|---|---|
| FR-CAT-01 | The sidebar lists **CATEGORIES** (heading link) and three filters: **Phones**, **Laptops**, **Monitors**. | M |
| FR-CAT-02 | **Phones** shows only phones (7 products: IDs 1–7). | M |
| FR-CAT-03 | **Laptops** shows only laptops (6 products: IDs 8, 9, 11, 12, 13, 15). Internal category key: `notebook`. | M |
| FR-CAT-04 | **Monitors** shows only monitors (2 products: IDs 10, 14). | M |
| FR-CAT-05 | Filtering replaces the grid in place (no page navigation; URL becomes `…/#`). | S |
| FR-CAT-06 | Expected: pagination controls should be hidden or scoped to the filtered results while a category is active. *(See DEF-03.)* | S |
| FR-CAT-07 | Clicking **CATEGORIES** (or Home) returns to the unfiltered catalogue. | S |

### 4.4 Product detail page (PDP)

| ID | Requirement | Pri |
|---|---|---|
| FR-PDP-01 | `prod.html?idp_=<id>` shows the product's **name** (H2), **price** as `$<amount>` followed by "*includes tax", a **Product description** section and the product **image**. | M |
| FR-PDP-02 | The page shows an **Add to cart** button (green). | M |
| FR-PDP-03 | Clicking **Add to cart** adds exactly one unit of the product to the current cart and shows a browser alert: guest → "Product added", logged-in → "Product added." | M |
| FR-PDP-04 | Adding the same product again adds another separate cart line (no quantity merging). | M |
| FR-PDP-05 | Expected: an unknown or invalid product ID shows a "Product not found" state and no Add to cart button. *(Today it shows "undefined" — see DEF-05.)* | S |
| FR-PDP-06 | The page has no quantity selector, breadcrumb or "back to list" link; navigation back is via the navbar or browser Back. | C |

### 4.5 Cart (CART)

| ID | Requirement | Pri |
|---|---|---|
| FR-CART-01 | `cart.html` shows a **Products** table with columns **Pic**, **Title**, **Price**, **x**, and a **Total** panel with a **Place Order** button. | M |
| FR-CART-02 | Each cart line shows the product image (100×100), title, price (number without `$`) and a **Delete** link. | M |
| FR-CART-03 | **Total** equals the sum of all line prices (integers, USD). | M |
| FR-CART-04 | Lines are loaded one by one (one API call per item); the table and total may update for several seconds and line order is not guaranteed. | S |
| FR-CART-05 | **Delete** removes that single line immediately (no confirmation), reloads the page and recalculates the total. | M |
| FR-CART-06 | A guest cart is tied to the browser's `user` cookie; it persists across page reloads in the same browser. | M |
| FR-CART-07 | A logged-in user's cart is tied to the account, persists after log out and is restored on next log in. | M |
| FR-CART-08 | Guest cart and account cart are separate; logging in does **not** merge the guest cart into the account cart (and vice versa). | S |
| FR-CART-09 | An empty cart shows the table headers, an empty Total and the Place Order button. Expected: Place Order should be disabled or blocked for an empty cart. *(See DEF-06.)* | S |

### 4.6 Checkout / Place Order (ORD)

| ID | Requirement | Pri |
|---|---|---|
| FR-ORD-01 | **Place Order** opens the "Place order" modal showing `Total: <amount>` and fields: **Name**, **Country**, **City**, **Credit card**, **Month**, **Year**, with **Close** and **Purchase** buttons. | M |
| FR-ORD-02 | **Name** and **Credit card** are mandatory. If either is empty, **Purchase** shows the alert "Please fill out Name and Creditcard." and the modal stays open. | M |
| FR-ORD-03 | Country, City, Month and Year are optional. | M |
| FR-ORD-04 | On a valid purchase, a confirmation dialog shows a green check, the title **"Thank you for your purchase!"** and: `Id: <random number 1–10,000,000>`, `Amount: <total> USD`, `Card Number: <as entered>`, `Name: <as entered>`, `Date: <D/M/YYYY>`, with an **OK** button. | M |
| FR-ORD-05 | Expected: the confirmation date is today's date. *(Today the month is one behind — see DEF-02.)* | M |
| FR-ORD-06 | On purchase, the cart is emptied (guest: by cookie; logged-in: by username). | M |
| FR-ORD-07 | Clicking **OK** returns the user to `index.html`. | M |
| FR-ORD-08 | Expected: card number accepts only digits of a valid length; month 1–12; year current or future. *(Today no format validation exists — see DEF-04.)* | S |
| FR-ORD-09 | The order is not stored server-side; the order Id is generated in the browser. There is no order history. | C |

### 4.7 Sign up (REG)

| ID | Requirement | Pri |
|---|---|---|
| FR-REG-01 | **Sign up** opens a modal titled "Sign up" with **Username** and **Password** (masked) fields and **Close** / **Sign up** buttons. | M |
| FR-REG-02 | If username or password is empty → alert "Please fill out Username and Password." | M |
| FR-REG-03 | If the username already exists → alert "This user already exist." | M |
| FR-REG-04 | On success → alert "Sign up successful.", modal closes, user is **not** logged in automatically. | M |
| FR-REG-05 | Usernames are case-sensitive: `alice` and `ALICE` are different accounts. | S |
| FR-REG-06 | There is no password policy (a 1-character password is accepted) and no confirm-password field. | S |
| FR-REG-07 | Fields are not cleared after a successful sign-up (values remain if the modal is reopened before a reload). | C |

### 4.8 Log in / Log out (AUTH)

| ID | Requirement | Pri |
|---|---|---|
| FR-AUTH-01 | **Log in** opens a modal titled "Log in" with **Username** and **Password** (masked) fields and **Close** / **Log in** buttons. | M |
| FR-AUTH-02 | Empty username or password → alert "Please fill out Username and Password." | M |
| FR-AUTH-03 | Unknown username → alert "User does not exist." | M |
| FR-AUTH-04 | Wrong password → alert "Wrong password." | M |
| FR-AUTH-05 | Valid credentials → modal closes, page reloads, navbar shows **Welcome &lt;username&gt;** and **Log out** (FR-NAV-02). A session cookie `tokenp_` is set. | M |
| FR-AUTH-06 | The logged-in state persists across pages (home, product, cart) and reloads until log out. | M |
| FR-AUTH-07 | If the stored token is expired or malformed, the page shows an alert ("Your token has expired, please login again." / "Bad parameter, token malformed.") and behaves as logged out. | S |
| FR-AUTH-08 | **Log out** deletes the `tokenp_` cookie and redirects to `index.html`; navbar returns to the guest state. The guest `user` cookie is kept. | M |

### 4.9 Contact (CON)

| ID | Requirement | Pri |
|---|---|---|
| FR-CON-01 | **Contact** opens a modal titled "New message" with **Contact Email**, **Contact Name** and **Message** fields and **Close** / **Send message** buttons. | M |
| FR-CON-02 | **Send message** clears the fields, shows the alert "Thanks for the message!!", closes the modal and reloads the page. | M |
| FR-CON-03 | Expected: email format and required fields are validated and the message is sent to a backend. *(Today none of this happens — see DEF-07.)* | S |

### 4.10 About us (ABT)

| ID | Requirement | Pri |
|---|---|---|
| FR-ABT-01 | **About us** opens a modal titled "About us" containing a Video.js player (poster `imgs/front.jpg`) streaming HLS from `https://hls.demoblaze.com/index.m3u8`. | S |
| FR-ABT-02 | The player supports play/pause, mute/volume, playback rate, captions/audio-track menus, picture-in-picture and fullscreen. | C |
| FR-ABT-03 | Closing the modal pauses the video. | S |

---

## 5. Business rules

| ID | Rule |
|---|---|
| BR-01 | Prices are whole numbers in USD and are shown as `$<n>` on the catalogue and product page, and as plain `<n>` in the cart. |
| BR-02 | Cart total = Σ line prices. Order Amount = cart total at the time the modal is opened. |
| BR-03 | One click on **Add to cart** = one cart line of quantity 1. Duplicates are separate lines. |
| BR-04 | Cart ownership: guest → `user=<GUID>` cookie; logged-in → account token/username. The two carts never merge. |
| BR-05 | A guest `user` cookie is created on first visit if absent and is never cleared by the app. |
| BR-06 | Name and Credit card are the only mandatory checkout fields. |
| BR-07 | Purchase always empties the cart that placed the order. |
| BR-08 | Username uniqueness is case-sensitive; any non-empty password is valid. |
| BR-09 | A new account is not logged in automatically. |
| BR-10 | Catalogue page size is 9; pagination stops when a page returns fewer than 9 items. |
| BR-11 | Category keys: `phone` → Phones, `notebook` → Laptops, `monitor` → Monitors. |

---

## 6. System messages catalogue

All messages are native browser `alert()` dialogs unless stated otherwise. Text is shown exactly as it appears in the application (including typos), so test cases can assert it.

| ID | Trigger | Exact message |
|---|---|---|
| MSG-01 | Sign up / Log in with empty username or password | `Please fill out Username and Password.` |
| MSG-02 | Sign up with existing username | `This user already exist.` |
| MSG-03 | Sign up success | `Sign up successful.` |
| MSG-04 | Log in with unknown username | `User does not exist.` |
| MSG-05 | Log in with wrong password | `Wrong password.` |
| MSG-06 | Add to cart as guest | `Product added` *(no period)* |
| MSG-07 | Add to cart while logged in | `Product added.` |
| MSG-08 | Purchase with empty Name or Credit card | `Please fill out Name and Creditcard.` |
| MSG-09 | Purchase success (SweetAlert modal, not a native alert) | Title `Thank you for your purchase!` + `Id / Amount / Card Number / Name / Date` lines, button `OK` |
| MSG-10 | Contact → Send message | `Thanks for the message!!` |
| MSG-11 | Token expired on page load / add to cart / cart load | `Your token has expired, please login again.` |
| MSG-12 | Token malformed | `Bad parameter, token malformed.` |
| MSG-13 | Bad cart flag (API) | `Bad parameter, flag is incorrect.` |

---

## 7. Data: product catalogue

15 products as of 2026-11-24 (source: `GET /entries`, `POST /pagination`, `POST /bycat`).

| ID | Title | Category | Price (USD) | Image | Page |
|---|---|---|---|---|---|
| 1 | Samsung galaxy s6 | Phones | 360 | imgs/galaxy_s6.jpg | 1 |
| 2 | Nokia lumia 1520 | Phones | 820 | imgs/Lumia_1520.jpg | 1 |
| 3 | Nexus 6 | Phones | 650 | imgs/Nexus_6.jpg | 1 |
| 4 | Samsung galaxy s7 | Phones | 800 | imgs/galaxy_s6.jpg ⚠ | 1 |
| 5 | Iphone 6 32gb | Phones | 790 | imgs/iphone_6.jpg | 1 |
| 6 | Sony xperia z5 | Phones | 320 | imgs/xperia_z5.jpg | 1 |
| 7 | HTC One M9 | Phones | 700 | imgs/HTC_M9.jpg | 1 |
| 8 | Sony vaio i5 | Laptops | 790 | imgs/sony_vaio_5.jpg | 1 |
| 9 | Sony vaio i7 ⚠ | Laptops | 790 | imgs/sony_vaio_5.jpg ⚠ | 1 |
| 10 | Apple monitor 24 | Monitors | 400 | imgs/apple_cinema.jpg | 2 |
| 11 | MacBook air | Laptops | 700 | imgs/macbook_air.jpg | 2 |
| 12 | Dell i7 8gb | Laptops | 700 | imgs/dell.jpg | 2 |
| 13 | 2017 Dell 15.6 Inch | Laptops | 700 | imgs/dell.jpg ⚠ | 2 |
| 14 | ASUS Full HD | Monitors | 230 | imgs/asusm.jpg | 2 |
| 15 | MacBook Pro | Laptops | 1100 | imgs/macbook_air.jpg ⚠ | 2 |

**Counts:** Phones 7 · Laptops 6 · Monitors 2 · Total 15. **Price range:** $230 (ASUS Full HD) – $1100 (MacBook Pro).

⚠ Data-quality notes: product 9's stored title contains a trailing newline (`"Sony vaio i7\n"`); IDs 4, 9, 13, 15 reuse another product's image; product 9's description starts with "REVIEW"; product 14's description is only 32 characters. The catalogue is shared live data and may change; tests should not hard-code it without a data check.

**Suggested test data for checkout:** Name `John Doe`, Country `India`, City `Pune`, Credit card `4111111111111111`, Month `12`, Year `2030`.

---

## 8. Technical reference

### 8.1 Architecture
- **Front end:** static HTML pages `index.html`, `prod.html`, `cart.html`; scripts `js/index.js`, `js/prod.js`, `js/cart.js`; jQuery, Bootstrap 4 (modals, carousel), Tether, Video.js + videojs-contrib-hls, SweetAlert (purchase confirmation).
- **Config:** `config.json` → `{ "API_URL": "https://api.demoblaze.com", "HLS_URL": "https://hls.demoblaze.com" }`.
- **Back end:** JSON REST API (DynamoDB-style responses: `Items`, `LastEvaluatedKey`, `ScannedCount`). All business errors return **HTTP 200** with `{"errorMessage": "..."}`.

### 8.2 API endpoints (observed)

| Endpoint | Method | Request body | Response / notes |
|---|---|---|---|
| `/entries` | GET | – | `{Items:[9 products], LastEvaluatedKey:{id:"9"}}` |
| `/pagination` | POST | `{"id":"<lastId>"}` | Next items after id; `ScannedCount` < 9 ⇒ last page |
| `/bycat` | POST | `{"cat":"phone"\|"notebook"\|"monitor"}` | `{Items:[…]}` |
| `/view` | POST | `{"id":<productId>}` | `{id,title,price,desc,img,cat}`; unknown → `{"errorMessage":"Not found."}` |
| `/signup` | POST | `{"username","password":<base64>}` | `""` success · `This user already exist.` |
| `/login` | POST | `{"username","password":<base64>}` | `"Auth_token: <token>"` · `Wrong password.` · `User does not exist.` |
| `/check` | POST | `{"token"}` | `{Item:{username}}` · token errors |
| `/addtocart` | POST | `{"id":<guid>,"cookie":<token or "user=<guid>">,"prod_id":<id>,"flag":<true if logged in>}` | – |
| `/viewcart` | POST | `{"cookie":<token or "user=<guid>">,"flag":bool}` | `{Items:[{id,cookie,prod_id}]}` |
| `/deleteitem` | POST | `{"id":<cartLineId>}` | `"Item deleted."` |
| `/deletecart` | POST | `{"cookie":<username or "user=<guid>">}` | Empties cart |

The Contact form makes **no** API call.

### 8.3 Client state

| Cookie | Set when | Value | Cleared when |
|---|---|---|---|
| `user` | First visit (if absent) | Random GUID | Never by the app |
| `tokenp_` | Successful log in | Base64 token (encodes username + numeric suffix) | Log out |

Both cookies are set by JavaScript (not HttpOnly, not Secure, session-scoped).

---

## 9. Known defects and gaps observed

Each item was reproduced during exploration on 2026-11-24. These should become **bug** items in SpurQuality and/or negative test cases.

| ID | Area | Severity | Observation | Expected |
|---|---|---|---|---|
| DEF-01 | Pagination | Medium | After **Next → Previous**, the grid shows products **2–10** (Nokia … Apple monitor 24); *Samsung galaxy s6* is missing. | Previous restores products 1–9. |
| DEF-02 | Checkout | Medium | Confirmation date shows the **previous month** (on 24 Nov 2026 it shows `24/10/2026`) because the JS month index is 0-based. | Today's date. |
| DEF-03 | Category filter | Low | Next/Previous stay visible while a category is filtered; clicking them leaves the filter and shows the unfiltered catalogue. | Pagination hidden or scoped to the filter. |
| DEF-04 | Checkout | High | Credit card accepts any text (e.g. `abc`); Month/Year accept anything; no Luhn/length/expiry check. | Card/expiry validation. |
| DEF-05 | Product page | Low | `prod.html?idp_=999` shows `undefined`, `$undefined *includes tax`, and an **Add to cart** button calling `addToCart(undefined)`. | "Product not found" state. |
| DEF-06 | Checkout | Medium | An **empty cart** can be purchased; confirmation shows `Amount: 0 USD`. | Block purchase when the cart is empty. |
| DEF-07 | Contact | Medium | Send message with all fields empty still shows "Thanks for the message!!"; no email validation; no data is sent to any server. | Validate and submit. |
| DEF-08 | Pagination | Low | On page 2, product **images** link to `#` instead of the product page (titles still work). | Image opens product page. |
| DEF-09 | Accessibility | Low | Contact modal: the "Contact Email" label has `for="recipient-name"`, so both labels point to the Name field and the email input has no label. | Correct label association. |
| DEF-10 | Messages | Low | Inconsistent text: "Product added" (guest) vs "Product added." (logged in); "This user already exist." (grammar); "Creditcard" (one word). | Consistent, correct copy. |
| DEF-11 | Security | High | Password is only Base64-encoded in the request; token is Base64 of username + number (predictable); cookies lack HttpOnly/Secure; no password policy; full card number echoed on screen. | Hashing over TLS, opaque signed tokens, secure cookies, password rules, masked card. |
| DEF-12 | Sign up | Low | Whitespace-only username (`"   "`) is treated as a valid username (an account already exists with it). | Trim and reject blank usernames. |
| DEF-13 | API | Low | Business errors return HTTP 200 with `errorMessage`. | 4xx status codes. |
| DEF-14 | UX | Low | Cart lines load sequentially, so order and total change for several seconds after load. | Single cart response with a stable total. |
| DEF-15 | Data | Low | Trailing newline in "Sony vaio i7" title; several products share images (see §7). | Clean catalogue data. |
| DEF-16 | HTML validity | Low | Duplicate element IDs: `id="itemc"` on all 3 category links and `id="next2"` twice; every product card description uses `id="article"`. | Unique IDs (helps a11y and stable locators). |

---

## 10. Proposed epics and user stories

Story format: *As a … I want … so that …*. Acceptance criteria (AC) are written as Given/When/Then and reference the requirement IDs above.

### EPIC-01 — Store navigation and layout
*Goal:* a consistent shell (header, footer, modals) on every page.

**US-01.1 Navigate using the header** (FR-NAV-01, 03, 04)
- AC1: Given I am on any page, Then I see PRODUCT STORE, Home, Contact, About us, Cart, Log in, Sign up.
- AC2: When I click Cart, Then I am on `cart.html`.
- AC3: When I click Home or the logo, Then I am on the home page.
- AC4: When I click Contact / About us / Log in / Sign up, Then the matching modal opens and the URL does not change page.

**US-01.2 See store contact information in the footer** (FR-NAV-05)
- AC1: Given any page, Then the footer shows the address, phone and email listed in FR-NAV-05 and the copyright line.

**US-01.3 Dismiss dialogs** (FR-NAV-07)
- AC1: Given any modal is open, When I click × or Close, Then the modal closes and the page is usable.

### EPIC-02 — Product discovery (home, pagination, categories)
*Goal:* shoppers can find products.

**US-02.1 Browse featured products on the home page** (FR-HOME-01..04, 07)
- AC1: Given I open the home page, Then a 3-slide carousel is shown with prev/next controls.
- AC2: Then 9 product cards are shown, each with image, title, `$price`, description.
- AC3: When I click a product title, Then its product page opens.

**US-02.2 Page through the catalogue** (FR-HOME-05, 06; DEF-01, DEF-08)
- AC1: Given page 1, When I click Next, Then 6 products (IDs 10–15) are shown and Next is hidden.
- AC2: Given page 2, When I click Previous, Then products 1–9 are shown and Next is visible.
- AC3: Given page 2, When I click a product image, Then its product page opens.

**US-02.3 Filter by category** (FR-CAT-01..07; DEF-03)
- AC1: When I click Phones, Then exactly the 7 phones are shown.
- AC2: When I click Laptops, Then exactly the 6 laptops are shown.
- AC3: When I click Monitors, Then exactly the 2 monitors are shown.
- AC4: Given a category is active, Then pagination does not show products from other categories.
- AC5: When I click CATEGORIES or Home, Then the full catalogue is shown.

### EPIC-03 — Product details
**US-03.1 View product details** (FR-PDP-01, 02)
- AC1: Given I open a product, Then I see its name, `$price *includes tax`, "Product description" + text, image and an Add to cart button.
- AC2: The name and price match the card I clicked.

**US-03.2 Handle an invalid product link** (FR-PDP-05; DEF-05)
- AC1: Given `prod.html?idp_=999`, Then a not-found message is shown and Add to cart is not offered.

### EPIC-04 — Shopping cart
**US-04.1 Add a product to the cart** (FR-PDP-03, 04; BR-03)
- AC1: Given I am a guest on a product page, When I click Add to cart, Then the alert "Product added" is shown and the product appears in my cart.
- AC2: Given I am logged in, Then the alert is "Product added." and the item is saved to my account cart.
- AC3: When I add the same product twice, Then the cart shows two lines.

**US-04.2 Review my cart** (FR-CART-01..04; BR-01, 02)
- AC1: Given my cart has items, When I open Cart, Then each line shows image, title, price and Delete.
- AC2: Then Total equals the sum of line prices (e.g. 360 + 1100 + 360 = 1820).

**US-04.3 Remove an item** (FR-CART-05)
- AC1: Given my cart has a line, When I click Delete, Then that line disappears and Total decreases by its price.
- AC2: Deleting one of two duplicate lines leaves the other line.

**US-04.4 Keep my cart across sessions** (FR-CART-06..08; BR-04)
- AC1: Given I am a guest with items, When I reload or come back in the same browser, Then my items are still there.
- AC2: Given I add items while logged in, log out and log in again, Then my items are restored.
- AC3: Given a guest cart and an account cart, Then logging in shows only the account cart.

### EPIC-05 — Checkout
**US-05.1 Place an order** (FR-ORD-01, 03, 04, 06, 07; BR-06, 07)
- AC1: Given a non-empty cart, When I click Place Order, Then the modal shows `Total: <cart total>` and fields Name, Country, City, Credit card, Month, Year.
- AC2: When I enter Name and Credit card and click Purchase, Then "Thank you for your purchase!" is shown with Id, Amount = total USD, Card Number, Name and Date.
- AC3: When I click OK, Then I am on the home page and my cart is empty.

**US-05.2 Mandatory field validation** (FR-ORD-02)
- AC1: Name empty → alert "Please fill out Name and Creditcard.", no order.
- AC2: Credit card empty → same alert, no order.
- AC3: Both empty → same alert, no order.

**US-05.3 Correct order confirmation date** (FR-ORD-05; DEF-02)
- AC1: Given today is D/M/YYYY, Then the confirmation Date shows D/M/YYYY.

**US-05.4 Payment detail validation** (FR-ORD-08; DEF-04)
- AC1: Non-numeric or wrong-length card → error, no order.
- AC2: Month outside 1–12 or past expiry → error.

**US-05.5 Prevent ordering an empty cart** (FR-CART-09; DEF-06)
- AC1: Given an empty cart, Then Place Order is disabled or Purchase shows an error.

### EPIC-06 — User accounts (registration and authentication)
**US-06.1 Sign up** (FR-REG-01..07; BR-08, 09)
- AC1: Given a new unique username and a password, When I click Sign up, Then "Sign up successful." is shown and the modal closes.
- AC2: Given an existing username, Then "This user already exist." is shown.
- AC3: Given an empty username or password, Then "Please fill out Username and Password." is shown.
- AC4: After sign up, I am still logged out.

**US-06.2 Log in** (FR-AUTH-01..06)
- AC1: Valid credentials → navbar shows "Welcome <username>" and Log out; Log in and Sign up are hidden.
- AC2: Wrong password → "Wrong password."
- AC3: Unknown user → "User does not exist."
- AC4: Empty field(s) → "Please fill out Username and Password."
- AC5: The logged-in state persists on product and cart pages and after reload.

**US-06.3 Log out** (FR-AUTH-08)
- AC1: Given I am logged in, When I click Log out, Then I am on the home page in guest state, and my account cart is not shown.

**US-06.4 Session expiry** (FR-AUTH-07)
- AC1: Given my token is invalid, When I load any page, Then I see the token message and am treated as logged out.

**US-06.5 Account security hardening** (DEF-11, DEF-12) — *improvement*
- AC1: Passwords must meet a minimum policy; blank/whitespace usernames are rejected; session cookies are Secure/HttpOnly; card number is masked in the confirmation.

### EPIC-07 — Customer engagement (Contact, About us)
**US-07.1 Send a message to the store** (FR-CON-01..03; DEF-07, DEF-09)
- AC1: When I open Contact, Then I see Contact Email, Contact Name and Message fields.
- AC2: When I click Send message, Then "Thanks for the message!!" is shown and the modal closes.
- AC3 (expected): Empty fields or an invalid email are rejected.

**US-07.2 Watch the About us video** (FR-ABT-01..03)
- AC1: When I open About us, Then a video player with a poster image is shown.
- AC2: When I press play, Then the video plays; when I close the modal, Then it pauses.

### EPIC-08 — Quality, accessibility and performance (non-functional)
**US-08.1** Pages load and the product grid is populated within the NFR targets (NFR-PERF-01..03).
**US-08.2** All form fields have correct labels and are keyboard-operable (NFR-A11Y-01..04; DEF-09).
**US-08.3** The site is usable on desktop, tablet and mobile widths (NFR-RESP-01).
**US-08.4** User-facing copy is consistent and grammatical (DEF-10).

---

## 11. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-PERF-01 | Performance | Home page product grid is populated within 3 s on a broadband connection (observed ≈ 1–2 s). |
| NFR-PERF-02 | Performance | Product page shows name/price within 2 s. |
| NFR-PERF-03 | Performance | Cart with ≤ 5 items shows the final total within 5 s. |
| NFR-COMP-01 | Compatibility | Latest Chrome, Edge, Firefox and Safari (desktop). |
| NFR-RESP-01 | Responsiveness | Layout adapts at Bootstrap breakpoints (product grid 3 → 2 → 1 columns: `col-lg-4 col-md-6`); nav collapses to a hamburger. |
| NFR-A11Y-01 | Accessibility | Every input has a correctly associated `<label>` (see DEF-09). |
| NFR-A11Y-02 | Accessibility | Product images have meaningful `alt` text (today `alt=""`). |
| NFR-A11Y-03 | Accessibility | All modals are keyboard-reachable, trap focus and close with Esc. |
| NFR-A11Y-04 | Accessibility | Inputs have `autocomplete` attributes (browser console warns about the password fields). |
| NFR-SEC-01 | Security | All traffic over HTTPS (met). |
| NFR-SEC-02 | Security | See DEF-11 for credential/token/cookie/card-handling gaps. |
| NFR-REL-01 | Reliability | No JavaScript console errors during normal flows (observed: only a Video.js plugin warning). |
| NFR-USE-01 | Usability | Feedback for every action (alerts today; non-blocking toasts recommended). |

---

## 12. Test strategy guidance

### 12.1 Suggested test-case groups (per epic)
| Epic | Positive | Negative / edge | Approx. # TCs |
|---|---|---|---|
| EPIC-01 Navigation | links, modals open/close, logged-in nav | — | 8 |
| EPIC-02 Discovery | grid content, Next/Prev, 3 filters | DEF-01, DEF-03, DEF-08 | 12 |
| EPIC-03 Product details | each category sample, price/name match | invalid ID (DEF-05) | 6 |
| EPIC-04 Cart | add guest/user, duplicates, delete, totals, persistence | separate carts, delete one of duplicates | 12 |
| EPIC-05 Checkout | full form, mandatory-only form, confirmation content, cart emptied, redirect | empty name/card/both, invalid card (DEF-04), empty cart (DEF-06), date (DEF-02) | 12 |
| EPIC-06 Accounts | sign up, log in, log out, persistence | duplicate, case-sensitivity, empty fields, wrong password, unknown user, whitespace username, bad token | 14 |
| EPIC-07 Contact / About | send message, video play/pause on close | empty contact form (DEF-07) | 5 |
| EPIC-08 NFR | load times, responsive, a11y scan | label mismatch (DEF-09) | 6 |

### 12.2 Automation notes (for this Playwright + Cucumber framework)
- **Alerts:** most feedback uses native `alert()`. Register `page.on('dialog')` *before* the click and assert `dialog.message()`; the purchase confirmation is a SweetAlert DOM element (`.sweet-alert`), not a dialog.
- **Async loading:** wait for product cards (`#tbodyid .card-title a`) rather than fixed sleeps. On the cart page, wait until the number of rows equals the expected count and `#totalp` is stable.
- **Pagination / filters:** after clicking Next/Previous/category, wait for the grid content to change (e.g. wait for a known title) — the container is emptied and refilled.
- **Unique test users:** generate usernames with a timestamp/UUID; the backend is shared and accounts can't be deleted. Remember usernames are case-sensitive.
- **Cart isolation:** use a fresh browser context per scenario (new `user` cookie ⇒ empty guest cart); for logged-in scenarios, empty the cart in setup (delete all rows, or call `/deletecart`).
- **API shortcuts:** use the API (§8.2) for setup/teardown (create user, seed cart) to keep UI tests focused and fast.
- **Date assertion:** build the expected date as `D/M/YYYY`, without zero-padding.
- **Shared data:** verify catalogue assumptions (counts/prices) with `GET /entries` or `/bycat` at the start of the run instead of hard-coding them.

### 12.3 Test data
| Purpose | Value |
|---|---|
| New user | `user_<timestamp>` / `Pass@123` |
| Existing user | created in setup |
| Unknown user | `nouser_<uuid>` |
| Checkout | see §7 |
| Invalid card | `abc`, `1234` |
| Products | Phone: Samsung galaxy s6 (360) · Laptop: MacBook Pro (1100) · Monitor: ASUS Full HD (230) |

---

## 13. Traceability matrix

| Epic | Stories | Functional reqs | Business rules | Messages | Defects |
|---|---|---|---|---|---|
| EPIC-01 | US-01.1–01.3 | FR-NAV-01..08 | — | — | — |
| EPIC-02 | US-02.1–02.3 | FR-HOME-01..07, FR-CAT-01..07 | BR-10, BR-11 | — | DEF-01, 03, 08 |
| EPIC-03 | US-03.1–03.2 | FR-PDP-01..06 | BR-01 | — | DEF-05, 15 |
| EPIC-04 | US-04.1–04.4 | FR-PDP-03..04, FR-CART-01..09 | BR-01..05 | MSG-06, 07 | DEF-14 |
| EPIC-05 | US-05.1–05.5 | FR-ORD-01..09 | BR-02, 06, 07 | MSG-08, 09 | DEF-02, 04, 06 |
| EPIC-06 | US-06.1–06.5 | FR-REG-01..07, FR-AUTH-01..08 | BR-08, 09 | MSG-01..05, 11..13 | DEF-11, 12, 13 |
| EPIC-07 | US-07.1–07.2 | FR-CON-01..03, FR-ABT-01..03 | — | MSG-10 | DEF-07, 09 |
| EPIC-08 | US-08.1–08.4 | — | — | — | DEF-09, 10, 11, 16 |

---

## 14. Assumptions and open questions

| # | Item | Type |
|---|---|---|
| 1 | The "expected" behaviour stated for DEF items is a reasonable assumption; the product owner should confirm which defects are in scope to fix versus document as known behaviour. | Question |
| 2 | Should a guest cart merge into the account cart on log in? (Today: no.) | Question |
| 3 | Token lifetime was not measured; FR-AUTH-07 is based on the client code. | Assumption |
| 4 | Order data is not persisted; is an order-history feature planned? | Question |
| 5 | The catalogue is shared, live demo data and may change without notice. | Assumption |
| 6 | Mobile layout was inferred from Bootstrap classes, not tested on real devices. | Assumption |
| 7 | Exploration created test accounts `prdexplore_1124a` and `PRDEXPLORE_1124A` (password `1`) on the public demo backend. | Note |

---

## 15. Appendix: element locators

Stable IDs/selectors observed in the DOM, for page objects in `src/locators/*.json`.

| Page / area | Element | Selector |
|---|---|---|
| Nav | Logo | `#nava` |
| Nav | Home | `.nav-link[href="index.html"]` |
| Nav | Contact | `a[data-target="#exampleModal"]` |
| Nav | About us | `a[data-target="#videoModal"]` |
| Nav | Cart | `#cartur` |
| Nav | Log in | `#login2` |
| Nav | Sign up | `#signin2` |
| Nav | Log out | `#logout2` |
| Nav | Welcome text | `#nameofuser` |
| Home | Carousel | `#carouselExampleIndicators` |
| Home | CATEGORIES (reset) | `#cat` |
| Home | Category links | `a#itemc` is shared by all three (DEF-16), so select by text: `a.list-group-item:has-text("Phones")` / `"Laptops"` / `"Monitors"` |
| Home | Product grid | `#tbodyid` |
| Home | Product card titles | `#tbodyid .card-title a` |
| Home | Product price | `#tbodyid .card h5` |
| Home | Next / Previous | `#next2` / `#prev2` |
| Sign up modal | Container / username / password / submit | `#signInModal` / `#sign-username` / `#sign-password` / `#signInModal .btn-primary` |
| Log in modal | Container / username / password / submit | `#logInModal` / `#loginusername` / `#loginpassword` / `#logInModal .btn-primary` |
| Contact modal | Container / email / name / message / send | `#exampleModal` / `#recipient-email` / `#recipient-name` / `#message-text` / `#exampleModal .btn-primary` |
| About modal | Container / video | `#videoModal` / `#example-video` |
| Product page | Name / price / description / image / add | `.name` / `.price-container` / `#more-information` / `#imgp img` / `a.btn-success` (text "Add to cart") |
| Cart | Rows / title cell / delete | `#tbodyid tr` / `#tbodyid tr td:nth-child(2)` / `#tbodyid tr a` (text "Delete") |
| Cart | Total | `#totalp` |
| Cart | Place Order | `button[data-target="#orderModal"]` |
| Order modal | Total / name / country / city / card / month / year / purchase | `#totalm` / `#name` / `#country` / `#city` / `#card` / `#month` / `#year` / `#orderModal .btn-primary` |
| Confirmation | Dialog / title / details / OK | `.sweet-alert` / `.sweet-alert h2` / `.sweet-alert p.lead` / `.sweet-alert button.confirm` |
