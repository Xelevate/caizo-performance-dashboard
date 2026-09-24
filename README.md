# Caizo × Xelevate — Performance Studio

A meeting-ready English/Arabic dashboard demo with an owner overview and left-sidebar pages for agent, branch and menu performance. No build tools or paid services required. Open `index.html` directly, or serve this directory with any static web server. All data is fictional. Language preference is saved on the device only.

## Included

- 30 days of reproducible sample calls and itemized orders, ending 24 September 2026.
- 15 placeholder branches and eight fictional agents. The actual branch count is **not verified**.
- Daily/hourly call and order charts; order type, period and branch filters.
- Agent conversion, handling time and recorded correction rate; branch completion and cancellation metrics; item and category sales.
- Click an agent, branch or item for detail. EN / AR changes text, entity names, number formatting and reading direction; the sidebar remains on the left as requested.
- Caizo logo supplied by the user. Xelevate presentation branding.

## Data and menu assumptions

This is not connected to Google Forms, Google Sheets, a telephone system or Caizo production data. No customer information is collected. Revenue shown is booked order value, not profit or proven ROI. Cancelled orders remain in booked value; completed value only includes completed orders.

The 24 representative menu items and illustrative prices were informed by [this public Caizo menu listing](https://directory.ordegate.com/directory/page/caizo?lang=ar), reviewed on 24 September 2026. This is not a verified complete/current menu. Confirm the official menu, branch list, prices and translations with the owner before production. Ambiguous menu entries were omitted. A multipack counts as one sold unit.

## Metrics

- Incoming calls = all recorded calls; answered + missed = incoming.
- Conversion = orders / answered calls. Each demo call creates at most one order.
- Answer rate = answered / incoming. Service level = answered within 20 seconds / incoming.
- Handling time = mean duration of answered calls (minutes).
- Accuracy = orders without a recorded correction / all orders; this is a demo proxy, not a measured QA score.
- Average order value = booked value / placed orders.
- Completion or cancellation rate = respective status count / placed orders.
- Menu value = sum(quantity × item price); menu values reconcile to order value.
- All date calculations use explicitly stored Egypt-local date strings, with no browser-timezone conversion.
- Order type filters affect order metrics. Call metrics retain all calls because unanswered/non-order calls have no order type. This is explained inside the dashboard.

## Future Google Forms / Sheets integration

The `dataProvider.getData()` adapter in `app.js` is the replacement point. It currently returns `DEMO`. A production adapter should retrieve authenticated, validated data from a backend, rather than publishing a customer spreadsheet or embedding credentials. Update the fixed date range and demo labels when a real feed is commissioned; implement loading/error/empty handling for that feed.

Recommended normalized tables (stable IDs should remain the same in EN and AR):

**Calls**: `id, date (YYYY-MM-DD in Africa/Cairo), hour (0–23), branchId, agentId, answered (boolean), waitSeconds, handlingSeconds`.

**Orders**: `id, callId, date, hour, branchId, agentId, type (delivery/pickup), status (completed/pending/cancelled), corrected (boolean), lines, value`.

**Order items**: one row per line: `orderId, itemId, quantity, unitPrice`. The backend joins these into `orders[].lines` and calculates `value` from the lines. Validate non-negative prices, positive quantities, unique IDs, and catalog references; deduplicate submissions and use the latest recorded order status.

**Catalogs**: branches and agents `{id,en,ar}`; menu `{id,en,ar,category,price}`. Category keys are `shawarma`, `hawawshi`, `sides`, `drinks`.

Use a call form/log for **every call**, including missed calls, and a linked order form for successful orders. An order-only Google Form cannot measure total incoming calls, missed calls, wait time or answer rate. Those need a call log or telephony integration. Keep customer names, addresses and phone numbers out of analytics responses unless specifically required and properly protected.

## Hosting

For GitHub Pages, serve the `main` branch root. The static files are `index.html`, `styles.css`, `app.js`, and `logo.webp`. Google Fonts are optional; system fallbacks work offline. There are no application dependencies and no credentials in the client.
