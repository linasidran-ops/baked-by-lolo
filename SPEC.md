# Technical Specification · baked by Lolo.

## 1. Overview

A single-page web store for a home cookie business, with a customer journey and a separate owner dashboard. One self-contained `index.html` (HTML, CSS, vanilla JavaScript, no libraries). Arabic, right to left, mobile first.

## 2. Runtime modes

| Mode | When | Data |
| --- | --- | --- |
| Online | Opened inside its Claude artifact link | Claude Artifacts `db` capability (shared, realtime) and `user` capability (viewer id, role, names) |
| Offline | Opened directly in a browser or from any static host | Built-in menu (`DEMO_PRODUCTS`, `DEMO_SETTINGS`); orders saved in `localStorage` and sent to the owner as a WhatsApp message |

The page detects the mode at load: if `window.claude.use` is missing, or `db` does not resolve within 10 seconds, it switches to offline mode.

## 3. Routing

Hash routes: `#home`, `#menu`, `#checkout`, `#done`, `#track`, `#special`, `#lolo-admin`.
`#lolo-admin` renders only when the `user` capability reports `canEdit()`; anyone else is sent to `#home`. Admin mode hides the customer header, footer and cart.

## 4. Data model (online mode)

| Path | Contents | Read | Write |
| --- | --- | --- | --- |
| `products/{id}` | name, desc, price, icon, order, active, soldOut, featured, badge | everyone | admin |
| `config/settings` | storeOpen, pickupEnabled, deliveryEnabled, deliveryFee, areas, payCash, payTransfer, bankInfo, whatsapp, dailyLimit, daysAhead, slots, offDays | everyone | admin |
| `config/coupons` | `items: {CODE: {type, value, expires, active}}` | everyone | admin |
| `private/costs` | doughKg, chocKg, `items: {productId: {dough, choc, extra}}` | admin | admin |
| `private/auth` | user, SHA-256 hash of `user:password` | admin | admin |
| `orders/{uid}` | `orders: {orderId: order}` | that customer, admin | that customer, admin |
| `load/{uid}` | `dates: {YYYY-MM-DD: count}` (no personal data) | everyone | that customer, admin |
| `carts/{uid}` | items, updatedAt, ordered | that customer, admin | that customer, admin |
| `visits/{uid}` | `days: {date: {v, adds, co}}`, first, last | that customer, admin | that customer, admin |
| `reviews/{uid}` | `items: {orderId: {stars, text, name, approved, at}}` | everyone | that customer, admin |
| `specials/{uid}` | `items: {id: {name, phone, occ, date, text, status, at}}` | that customer, admin | that customer, admin |

Per-customer documents use `{self}` access rules, so a customer can only read and write their own documents. Customers need Contributor access to write.

**Order object:** id, num, name, phone, method, area, address, date, slot, pay, notes, coupon, items (id, name, price, qty), subtotal, discount, delivery, total, status, createdAt.

**Statuses:** `await` (awaiting transfer), `confirmed`, `baking`, `ready`, `done`, `cancel`.

## 5. Business rules

- Phone must match `^05\d{8}$`.
- A day is full when the sum of `load/*/dates[day]` reaches `dailyLimit`; full days are disabled at checkout and re-checked on submit. Cancelling an order frees its slot.
- Bookable days: the next `daysAhead` days, skipping `offDays`.
- Product cost = dough g × doughKg / 1000 + chocolate g × chocKg / 1000 + extra. Missing cost is flagged, not treated as zero.
- Net profit for a month = revenue − product cost − delivery fees, over non-cancelled orders dated in that month.
- Abandoned cart = cart with items, not ordered, last updated more than 30 minutes ago.

## 6. Security and privacy

- Real protection is the database access rules: orders, phone numbers, carts, visits and costs are readable only by the owner (and each customer for their own).
- The dashboard password is a second layer for a shared device; only its SHA-256 hash is stored.
- All stored values are escaped before rendering.
- No card numbers or customer bank details are collected.

## 7. UI

- Palette: `#fffabf`, `#ffe7ff`, `#b2f9e7`, `#f4adcf`, `#bfc4ff`; ink `#4A2E3A`.
- Fonts: Baloo Bhaijaan 2 (headings), Tajawal (body).
- Line-art SVG icons per product; cat-cookie tray illustration on the home page.
- Star and pearl pointer trail on devices with a fine pointer, disabled under reduced motion.

## 8. Acceptance tests

1. Order with phone `5532` and no day → error shown, nothing saved.
2. Set daily limit to 1, place one order → that day shows as full.
3. Open `#lolo-admin` from a non-owner account → redirected to home.
4. Open `index.html` directly in Chrome → 5 products shown, checkout produces a WhatsApp message.
5. Mark one order cancelled → it disappears from that month's revenue.

## 9. Next version

Move online mode to a public host (Netlify) with Supabase for the database and owner login.
