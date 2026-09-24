# Caizo × Xelevate — Performance Studio

A meeting-ready English/Arabic dashboard demo with an owner overview and left-sidebar pages for agent, branch and menu performance. No build tools or paid services required. Open `index.html` directly, or serve this directory with any static web server. All data is fictional. Language preference is saved on the device only.

## Included

- 30 days of reproducible sample calls and itemized orders, ending 24 September 2026.
- Seven real Google Maps branch locations and eight fictional agents. This is **not a confirmed complete branch list**; performance remains fictional.
- Daily/hourly call and order charts; order type and branch filters; preset periods and start/end calendars with inclusive custom date ranges.
- Agent conversion, handling time and recorded correction rate; branch completion and cancellation metrics; item and category sales.
- Click an agent, branch or item for detail. EN / AR changes text, entity names, number formatting and reading direction; the sidebar remains on the left as requested.
- Caizo logo supplied by the user. Xelevate presentation branding.

## Data and menu assumptions

This is not connected to Google Forms, Google Sheets, a telephone system or Caizo production data. No customer information is collected. Revenue shown is booked order value, not profit or proven ROI. Cancelled orders remain in booked value; completed value only includes completed orders.

The 24 representative menu items and illustrative prices were informed by [this public Caizo menu listing](https://directory.ordegate.com/directory/page/caizo?lang=ar), reviewed on 24 September 2026. This is not a verified complete/current menu. Confirm the official menu, full branch list, operating status, prices and translations with the owner before production. Ambiguous menu entries were omitted. A multipack counts as one sold unit.

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

## Calendar date ranges

Use the From and To calendars, then Apply range. Both endpoints are included. The demo supports 26 August through 24 September 2026. Missing dates, reversed ranges and dates outside this interval are rejected. Presets reset the dates; a one-day range shows hourly demand for that specific day. All pages and detail panels share the same range.

## Google Maps branch locations

Checked on 24 September 2026. Seven distinct Maps listings were found; this does not establish the complete network or current operating hours. Map links appear in Branch performance and branch details. Names and addresses are localized into English and Arabic. The North Coast location is inside NORTHED | ZAHRA. A separate Mountain View outlet mentioned in a third-party directory was not independently verified in Maps and is not included.

- [Maadi · The Field](https://www.google.com/maps/place/Caizo+-+The+Field/data=!4m7!3m6!1s0x14583900040ff847:0x1954d5510a8f72aa!8m2!3d29.9602594!4d31.2708832!16s%2Fg%2F11wc1_nctt!19sChIJR_gPBAA5WBQRqnKPClHVVBk): Victoria Square, Maadi as Sarayat Al Gharbeyah, Cairo.
- [New Cairo · Platz](https://www.google.com/maps/place/Caizo/data=!4m7!3m6!1s0x14583d9de7c015ed:0xdb90cc509985eb81!8m2!3d30.021961!4d31.4449019!16s%2Fg%2F11lsnlfzny!19sChIJ7RXA5509WBQRgeuFmVDMkNs): Platz, behind Petrosport Stadium, New Cairo.
- [Ring Road · Chill Out](https://www.google.com/maps/place/Caizo+chill+out+ring+road/data=!4m7!3m6!1s0x14583def7f65534b:0x27d69a7cdf98962a!8m2!3d30.0156983!4d31.3999306!16s%2Fg%2F11t3tyxw54!19sChIJS1Nlf-89WBQRKpaY33ya1ic): Chill Out, Ring Road, 90th Street Bridge, New Cairo.
- [Nasr City · Park View](https://www.google.com/maps/place/Caizo+-+Park+view/data=!4m7!3m6!1s0x14583f032181a3e5:0x2dbae27015dc8b2d!8m2!3d30.0630403!4d31.3488338!16s%2Fg%2F11sbst3r0t!19sChIJ5aOBIQM_WBQRLYvcFXDiui0): Child Garden, Park View, Ahmed Fakhry Street, Nasr City.
- [New Giza · The Garden](https://www.google.com/maps/place/Caizo+The+garden+New+Giza+club/data=!4m7!3m6!1s0x14585b00678d9275:0x37c2e08a1a260d0d!8m2!3d30.0045566!4d31.0653991!16s%2Fg%2F11vs51pkk_!19sChIJdZKNZwBbWBQRDQ0mGorgwjc): The Garden, New Giza Club, First 6th of October, Giza · 2338+V59.
- [Sheikh Zayed](https://www.google.com/maps/place/Caizo/data=!4m7!3m6!1s0x14585700790322e7:0xf4888cd4b8ace7f3!8m2!3d30.0098593!4d30.985134!16s%2Fg%2F11x7x0x0xp!19sChIJ5yIDeQBXWBQR8-esuNSMiPQ): First Al Sheikh Zayed, Giza · 2X5M+XWF.
- [North Coast · Northed](https://www.google.com/maps/place/Caizo/data=!4m7!3m6!1s0x145ffb2f09dd44ef:0xe54f23096a0a07c1!8m2!3d30.931351!4d28.7927467!16s%2Fg%2F11s43q227d!19sChIJ70TdCS_7XxQRwQcKagkjT-U): NORTHED | ZAHRA, El Alamein, Marsa Matrouh · WQMR+CRQ.

## Agent upsell

The Agent performance page includes offers made, accepted offers, acceptance rate, completed upsells, extra sandwiches, incremental revenue, and estimated incremental contribution by agent, plus sample order evidence and agent detail metrics. All date, branch and order-type filters apply.

The illustrative offer changes one shawarma (EGP 90) to two for EGP 170. Assumed variable cost is EGP 45 per sandwich. Incremental revenue is EGP 80 and estimated extra contribution is EGP 35. This is not verified profit or net profit. Confirm offer prices and variable costs before production.

Only explicitly attributed offer events count; normal multiple-item orders do not. Offers/acceptances include all order statuses; revenue, costs, units and contribution count only completed accepted upsells. The final item lines are repriced to EGP 85 each and reconcile with final order values across all dashboard views.

Future form fields: offer ID, agent ID, offer proposed (boolean), customer accepted (boolean), original basket snapshot/value, final basket snapshot/value after offer discounts, incremental units and incremental variable cost. Preserve order status and link the event to the order. Do not infer upselling from basket size alone. `orders[].upsell` stores `offered`, `accepted`, `offerId`, `originalValue`, `finalValue`, `extraRevenue`, `extraVariableCost`, and `extraUnits`.

## Scroll motion and pie charts

Cards, page titles, filters, table rows and chart legends fade/slide into view and fade out after leaving the viewport, repeating when scrolling back. An IntersectionObserver is disconnected and rebuilt on each render. Reduced-motion preferences and print mode show all content without motion; focused controls remain visible. Unsupported observers leave content visible.

Agent performance includes a pie chart of placed orders by agent. Menu performance includes a pie chart of booked value by category (all categories for context). Both follow dates, branch and order type; legends show exact values and percentages with accessible chart summaries in EN/AR. Zero totals use a neutral circle.
