# Product Requirements Document — Demoblaze "PRODUCT STORE"

| | |
|---|---|
| **Application URL** | https://www.demoblaze.com/ |
| **Backend API base** | https://api.demoblaze.com |
| **Document date** | 2026-11-25 |
| **SpurQuality project** | Demoblaze-04-SR (`DMSR`), org `BootCamp1` |
| **Purpose** | Baseline requirements reverse-engineered from the live app, to drive epics, user stories and test cases |

## 0. How this document was produced and how far to trust it

Each requirement carries a confidence tag so that test design can account for it.

| Tag | Meaning |
|---|---|
| **[OBSERVED]** | Seen directly in the live app via Playwright (UI, DOM, API responses). |
| **[SOURCE]** | Taken from the site's own front-end scripts (`/js/cart.js`, `/js/index.js`) — messages and endpoints exist in code, but the path was not executed during exploration. |
| **[UNVERIFIED]** | Not exercised and not confirmed in source. Must be verified before writing expected results. |

**Exploration limits (important).** Actions that write data to the shared public demo backend were deliberately **not executed**: sending the contact message, sign-up, log-in, add-to-cart, and purchase. The attempt to submit the contact form was blocked by the session's permission control and was not retried. Therefore the happy-path outcomes of those flows are tagged [SOURCE] or [UNVERIFIED], not [OBSERVED]. Section 11 lists what to confirm.

---

## 1. Product overview

Demoblaze is a demo e-commerce storefront (title "STORE", brand "PRODUCT STORE") selling consumer electronics in three categories. A shopper can browse and filter the catalog, view product details, add items to a cart, and place an order by entering name and card details. Optional account registration and login are supported. There is no payment gateway; "Purchase" only produces a confirmation dialog.

**Technology notes (for test automation).** Single-page style pages built with jQuery/Bootstrap 4; catalog is fetched asynchronously from the API, so tests must wait for cards to render. System messages are native browser `alert()` dialogs; the purchase confirmation is a SweetAlert modal. Console shows 0 errors and 1 warning on load.

## 2. Goals and non-goals

**Goals**
- Let any visitor browse the catalog without signing in.
- Let a visitor add products to a cart and complete a purchase.
- Let a visitor optionally register and log in.
- Provide informational content (About us video, Contact form, footer details).

**Non-goals / out of scope**
- Real payment processing, order history, order tracking, inventory, product search, sorting, reviews, wishlist, profile management, password reset. None of these exist in the UI. [OBSERVED]

## 3. Personas

| Persona | Description |
|---|---|
| **Guest shopper** | Not logged in. Can browse, add to cart and purchase. Cart is tied to a browser cookie. [SOURCE] |
| **Registered shopper** | Has an account and is logged in. Header shows "Welcome <username>". Cart is tied to the login token. [SOURCE] |
| **Visitor / enquirer** | Uses the Contact form or About us video. |

## 4. Site map and navigation

| Page | URL | Notes |
|---|---|---|
| Home | `/index.html` | Carousel, categories, product grid, pagination. [OBSERVED] |
| Product detail | `/prod.html?idp_=<id>` | One product. [OBSERVED] |
| Cart | `/cart.html` | Cart table, total, Place Order. [OBSERVED] |

**Global header (all pages)** [OBSERVED]: brand link "PRODUCT STORE" → `index.html`; **Home**; **Contact** (opens modal); **About us** (opens modal); **Cart** → `cart.html`; **Log in** (modal); **Sign up** (modal). When logged in, "Log in"/"Sign up" are hidden and "Welcome <username>" and **Log out** are shown. [SOURCE]

**Global footer** [OBSERVED]: About Us text, "Get in Touch" (Address: 2390 El Camino Real; Phone: +440 123456; Email: demo@blazemeter.com), "PRODUCT STORE", "Copyright © Product Store".

## 5. Epics, features and detailed requirements

Requirement IDs (`FR-xx`) are stable references for user stories and test cases.

### EPIC-01 — Catalog browsing

**FR-01 Home page layout** [OBSERVED]
- Home shows a 3-slide image carousel with Previous/Next controls and 3 indicators ("First slide", "Second slide", …).
- Left panel lists **CATEGORIES** (a label), then **Phones**, **Laptops**, **Monitors**.
- Product grid renders as cards; each card has an image link, title link, price, and a description paragraph.

**FR-02 Product catalog data** [OBSERVED — API `entries` and `bycat`]

Total 15 products.

| ID | Title | Category (API `cat`) | Price (USD) |
|---|---|---|---|
| 1 | Samsung galaxy s6 | phone | 360 |
| 2 | Nokia lumia 1520 | phone | 820 |
| 3 | Nexus 6 | phone | 650 |
| 4 | Samsung galaxy s7 | phone | 800 |
| 5 | Iphone 6 32gb | phone | 790 |
| 6 | Sony xperia z5 | phone | 320 |
| 7 | HTC One M9 | phone | 700 |
| 8 | Sony vaio i5 | notebook | 790 |
| 9 | Sony vaio i7 | notebook | 790 |
| 10 | Apple monitor 24 | monitor | 400 |
| 11 | MacBook air | notebook | 700 |
| 12 | Dell i7 8gb | notebook | 700 |
| 13 | 2017 Dell 15.6 Inch | notebook | 700 |
| 14 | ASUS Full HD | monitor | 230 |
| 15 | MacBook Pro | notebook | 1100 |

Category counts: Phones 7, Laptops 6, Monitors 2. Note: ID 9's raw title contains a trailing newline (`"Sony vaio i7\n"`) — a data-quality defect; UI tests should trim titles.

**FR-03 Category filtering** [OBSERVED via API; UI clicks not executed]
- Clicking **Phones** shows phone products only; **Laptops** shows notebooks; **Monitors** shows monitors (backed by `POST /bycat {cat}`).
- With no category selected, all products are shown (paginated, FR-04).
- Category names in UI differ from API values (Laptops ↔ `notebook`, Phones ↔ `phone`, Monitors ↔ `monitor`).

**FR-04 Pagination** [OBSERVED]
- Unfiltered home shows **9 products on page 1** (IDs 1–9) with a **Next** button; **Previous** is present.
- Clicking Next shows **page 2 with 6 products** (IDs 10–15 in the order: Apple monitor 24, MacBook air, Dell i7 8gb, 2017 Dell 15.6 Inch, ASUS Full HD, MacBook Pro); **Next** is then hidden and Previous remains visible.
- Note: when page 1 loads, Previous is shown as present in the DOM (disabled-looking); exact enabled/disabled state on page 1 is [UNVERIFIED].

**FR-05 Carousel** [OBSERVED partial]
- Slides advance via Next/Previous and indicators. Auto-rotation and number of slides beyond 3 indicators are [UNVERIFIED].

**FR-06 Product detail page** [OBSERVED]
- Opened by clicking a product title (`prod.html?idp_=<id>`).
- Shows: title, price with the text "**$360 *includes tax**" (format `$<price> *includes tax`), "Product description" heading, description text, image, and an **Add to cart** button (`onclick=addToCart(<id>)`).
- Example (ID 1): Samsung galaxy s6, $360, "…1.5GHz octa-core Samsung Exynos 7420 processor… 3GB of RAM… 32GB of internal storage cannot be expanded."
- Behaviour for an invalid/missing `idp_` is [UNVERIFIED].

### EPIC-02 — Shopping cart

**FR-07 Add to cart** [SOURCE / UNVERIFIED]
- Clicking **Add to cart** on the product page sends the item to the backend, associated with the logged-in token (if any) or the browser cookie (guest). A confirmation `alert` ("Product added") is expected on success — [UNVERIFIED], not executed.
- Adding the same product twice creates two cart rows (no quantity field exists). [UNVERIFIED]

**FR-08 View cart** [OBSERVED structure]
- `cart.html` loads items via `POST /viewcart`, then fetches each product via `POST /view {id}`.
- Table columns: **Pic, Title, Price, x** (delete link). Below: **Total** and **Place Order** button.
- Empty cart shows an empty table and blank/zero total. [UNVERIFIED display]
- Total is the sum of item prices. [SOURCE]

**FR-09 Remove from cart** [SOURCE]
- The "Delete" link in a row calls `POST /deleteitem {id}` and the row is removed and total recalculated. [UNVERIFIED]

**FR-10 Cart session errors** [SOURCE]
Native alerts: "Your token has expired, please login again.", "Bad parameter, token malformed.", "Bad parameter, flag is incorrect."

### EPIC-03 — Checkout / purchase

**FR-11 Place Order form** [OBSERVED]
- **Place Order** opens modal "Place order" with fields: **Name** (`#name`), **Country** (`#country`), **City** (`#city`), **Credit card** (`#card`), **Month** (`#month`), **Year** (`#year`); buttons **Close** and **Purchase**. All fields are free-text inputs (no type/format constraints in the DOM).

**FR-12 Purchase validation** [SOURCE]
- If **Name** or **Credit card** is empty, alert: "**Please fill out Name and Creditcard.**" Country, City, Month, Year are **not** validated as required. No format, length, Luhn or expiry validation is evident. [UNVERIFIED by execution]

**FR-13 Purchase confirmation** [SOURCE]
- On valid submit, the cart is deleted (`/deletecart`) and a SweetAlert shows title "**Thank you for your purchase!**" with text lines: `Id: <order id>`, `Amount: <total> USD`, `Card Number: <entered>`, `Name: <entered>`, `Date: <d>/<m>/<yyyy>`. Button **OK** redirects to `index.html`.
- Known defect candidate: the date uses `getMonth()` without +1, so the month is displayed one lower than the real month (e.g. November shown as 10). [SOURCE — verify by execution]
- Entered full card number is echoed back in clear text (security/PII concern).
- Purchasing with an empty cart is [UNVERIFIED].

### EPIC-04 — User account

**FR-14 Sign up** [OBSERVED UI, SOURCE behaviour]
- **Sign up** opens modal "Sign up" with **Username** (`#sign-username`, text) and **Password** (`#sign-password`, password); buttons **Close**, **Sign up**.
- Empty username or password → alert "**Please fill out Username and Password.**"
- Username already taken → alert "**This user already exist.**"
- Success → alert "**Sign up successful.**" (via `POST /signup`). No auto-login. No email field, no password rules, no confirmation field visible. Duplicate-username comparison case-sensitivity is [UNVERIFIED].

**FR-15 Log in** [OBSERVED UI, SOURCE behaviour]
- **Log in** opens modal "Log in" with **Username** (`#loginusername`), **Password** (`#loginpassword`, masked); buttons **Close**, **Log in**.
- Empty fields → "**Please fill out Username and Password.**"
- Wrong password → "**Wrong password.**"
- Unknown user → "**User does not exist.**"
- Success → modal closes, header shows "**Welcome <username>**" and **Log out**; "Log in" and "Sign up" are hidden; session stored in a token cookie (`tokenp_`). Token expiry produces the message in FR-10.

**FR-16 Log out** [SOURCE]
- **Log out** clears the session and restores "Log in"/"Sign up" links. [UNVERIFIED]

**FR-17 Session persistence** [SOURCE]
- Login state and cart survive page navigation (cookie-based). Persistence across browser restart is [UNVERIFIED].

### EPIC-05 — Informational content and contact

**FR-18 Contact modal** [OBSERVED UI, SOURCE behaviour — re-checked 2026-11-25]
- **Contact** opens modal "New message" (`#exampleModal`) with **Contact Email** (`#recipient-email`, input type=text), **Contact Name** (`#recipient-name`, input type=text), **Message** (`#message-text`, textarea); buttons **×**, **Close** (dismiss) and **Send message** (`onclick=send()`). No field is `required` and none has a `maxlength`. [OBSERVED DOM]
- **Send message** runs `send()` in `/js/index.js`: it clears the three fields, shows the native alert "**Thanks for the message!!**", hides the dialog and reloads the page (`location.reload()`). [SOURCE]
- **No message is transmitted:** `send()` makes **no API call**, so nothing reaches the store (defect candidate D-11). [SOURCE]
- **No validation:** `send()` checks nothing, so an empty form or an invalid email also shows "Thanks for the message!!". [SOURCE — resolves open question Q-04]
- **Label defect:** the "Contact Email:" label is attached to `#recipient-name`; `#recipient-email` has no label (defect candidate D-12). [OBSERVED DOM]
- Stories: DMSR-ST-029 (send message), DMSR-ST-036 (validation), DMSR-ST-031 (accessibility).

**FR-19 About us modal** [OBSERVED]
- **About us** opens modal titled "About us" containing a video.js player (play, mute, seek, playback rate, chapters, captions, audio track, picture-in-picture, fullscreen) and Close buttons. The video source is HLS-based; playback was not verified.

**FR-20 Footer content** [OBSERVED] — see Section 4.

---

## 6. Business rules

| ID | Rule |
|---|---|
| BR-01 | Prices are shown in USD with a `$` prefix, whole numbers, and the note "*includes tax" on the product page. |
| BR-02 | No quantity selection: each add-to-cart adds one unit. |
| BR-03 | Guests can purchase without an account. |
| BR-04 | Only Name and Credit card are mandatory at checkout. |
| BR-05 | A successful purchase empties the cart. |
| BR-06 | Usernames must be unique. |
| BR-07 | Product titles are unique within the catalog. |

## 7. API surface observed

All `POST` with JSON unless stated; base `https://api.demoblaze.com`.

| Endpoint | Purpose | Evidence |
|---|---|---|
| `/entries` | First page of products (9 items) | [OBSERVED] |
| `/bycat` `{cat}` | Products by category | [OBSERVED] |
| `/view` `{id}` | Single product | [OBSERVED/SOURCE] |
| `/viewcart` `{cookie, flag}` | Cart contents | [OBSERVED] |
| `/check` `{token}` | Validate login token | [SOURCE] |
| `/login`, `/signup` `{username, password}` | Auth | [SOURCE] |
| `/addtocart` | Add item | [UNVERIFIED name] |
| `/deleteitem` `{id}`, `/deletecart` `{cookie}` | Remove item / clear cart | [SOURCE] |

Product record fields: `id, title, price, cat, desc, img`.

## 8. Non-functional requirements

| Area | Requirement / observation |
|---|---|
| Performance | Catalog loads asynchronously after page load; tests need explicit waits. No measured SLAs. |
| Compatibility | Bootstrap 4 responsive layout; browsers/viewports [UNVERIFIED]. |
| Accessibility | [OBSERVED 2026-11-25, DOM inspection] Gaps: product image links have no accessible name; carousel alt text is positional ("First slide"); brand logo has no alt; carousel indicators unnamed and not focusable; About us dialog (#videoModal) has no aria-labelledby; Contact Email and Log in username/password inputs have no label; no h1 and no skip link. Passing: Contact/Log in/Sign up dialogs have role=dialog and a title link, carousel Previous/Next are named, close buttons are named, html lang="en". Screen-reader/axe audit [UNVERIFIED]. See story DMSR-ST-031. |
| Security (observations) | Card number echoed in plain text; credentials posted to API; no visible rate-limiting; messages are `alert()`-based. HTTPS is used. |
| Data | Shared public demo backend — data created by testers is visible/removable by others; use unique usernames. |
| Console | 0 errors, 1 warning on home, product and cart pages. |

## 9. Risks and known defect candidates

1. Month in purchase date appears off by one (FR-13).
2. Trailing newline in product title ID 9 (FR-02).
3. Full card number echoed in confirmation (FR-13).
4. No validation on card, month, year, country, city (FR-12).
5. Duplicate cart rows / no quantity (FR-07).
6. Shared backend: tests are not isolated; flaky by nature.
7. Native `alert()` dialogs require explicit dialog handling in automation.
8. Contact form never transmits the message (no API call in `send()`), yet confirms "Thanks for the message!!" (FR-18, D-11).
9. Contact Email input has no label; its label is attached to Contact Name (FR-18, D-12).

## 10. Suggested epics → user-story seeds

| Epic | Story seeds (As a … I want … so that …) | Requirements |
|---|---|---|
| EPIC-01 Catalog | Browse all products; filter by Phones/Laptops/Monitors; page through results; view product details; use carousel | FR-01–06 |
| EPIC-02 Cart | Add product; view cart with total; remove product; cart persists while navigating | FR-07–10 |
| EPIC-03 Checkout | Open order form; see validation when Name/Card missing; complete purchase and see confirmation; cart cleared afterwards | FR-11–13 |
| EPIC-04 Account | Register; reject duplicate user; log in; wrong password / unknown user messages; see welcome; log out | FR-14–17 |
| EPIC-05 Info & contact | Send contact message; watch About us video; see footer contact details | FR-18–20 |
| EPIC-06 Cross-cutting | Header/footer consistent on all pages; error handling; accessibility; basic security checks | Sections 4, 8 |

## 11. Test-design starting points (for later test-case creation)

**Positive:** each category shows the expected counts (7/6/2); page 1 = 9 items and page 2 = 6; product page shows correct title/price/description for all 15; sign up with a unique username; log in shows "Welcome <user>"; add one item → cart total equals price; multiple items → total = sum; delete item; purchase with Name + Card → confirmation with correct amount.

**Negative:** empty sign-up/log-in fields; duplicate username; wrong password; unknown user; purchase with empty Name, empty Card, both; invalid `idp_`; expired/malformed token; empty cart purchase.

**Boundary / data:** very long strings and special characters in all text inputs; non-numeric card, month, year; past expiry; SQL/script characters in username and message; whitespace-only values.

**UI / cross-cutting:** modal open/close via × and Close; Next/Previous states at the first and last page; carousel controls; navigation links from every page; responsive layouts.

**To verify by execution before finalizing expected results** (not run in this exploration):
1. Alert text on add-to-cart, and cart contents afterwards.
2. ~~Contact form success text and validation.~~ Resolved from source 2026-11-25 (FR-18): no validation, no transmission; confirm by clicking Send if required.
3. Purchase confirmation exact format and date/month defect.
4. Log out behavior and token expiry.
5. Previous button state on page 1.
6. Behavior for invalid product id and empty-cart purchase.
