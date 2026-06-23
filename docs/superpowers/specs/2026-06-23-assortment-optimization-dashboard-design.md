# Assortment Optimization Dashboard Demo Design

## Source And Intent

This design spec is based on `/Users/heather/Downloads/dashboard design working sheet.pdf`, an eight-page working sheet for an assortment optimization dashboard. Page 1 is only a data-model note for the build team and should not appear as dashboard content.

The dashboard is a business self-service analytics demo. It should help business users move from portfolio-level concentration, to complexity diagnosis, to product/SKU-level assortment actions. The demo uses mock data first, with a structure that can later be filled from real data.

## Product Promise

Help users answer three questions:

1. Where is the money?
2. Is complexity justified?
3. What should we keep, review, or simplify?

The dashboard should not feel like six separate BI sheets. It should feel like one guided analytical cockpit for Product (FG) and Sample (PLV) assortment optimization.

## Navigation Framework

Use the analytics framework page as the dashboard cover page and primary navigation model. The cover page should visually match the PDF's Page 2: light canvas, magenta for Product (FG), purple for Strategic Logic, cyan for Sample (PLV), and soft gradient accents.

| Level | Strategic question | Product (FG) page | Sample (PLV) page |
| --- | --- | --- | --- |
| Level 1: Macro | Where is the Money? | Core vs. Tail | PLV Support vs. FG Sales |
| Level 2: Diagnosis | Is Complexity Justified? | FG Variety vs. Value | Sample Complexity vs. Demand |
| Level 3: Micro | What Should We Keep, Review, or Simplify? | FG SKU Deep Dive | PLV SKU Deep Dive |

Top navigation:
- Overview
- Core vs. Tail
- FG Variety vs. Value
- FG SKU Deep Dive
- PLV Support vs. FG Sales
- Sample Complexity vs. Demand
- PLV SKU Deep Dive

Navigation behavior:
- The Overview page shows a simplified, clickable version of the analytics framework.
- Each framework card opens the matching dashboard page.
- The active page must be visibly highlighted in navigation and in the framework map.
- The user should always know whether they are looking at Product (FG), Sample (PLV), or Strategic Logic.

## App Shell

Use a dashboard app shell with a persistent top navigation and a sticky global filter bar. The global filter bar should remain visible while users scroll down the page.

Global filters:
- Time period
- Channel lvl1
- Brand
- Category
- Product lifecycle

Page-specific filters:
- Product search appears only on FG SKU Deep Dive and PLV SKU Deep Dive.
- ABC Category appears where it is analytically relevant, especially FG Variety vs. Value, PLV Support vs. FG Sales, Sample Complexity vs. Demand, and SKU deep dives.

Filter behavior:
- Filters should apply to the KPI row, chart, and detailed table on the active page.
- Active filters should be visible as chips.
- Reset should appear only when at least one filter differs from the default.
- Filter state should be URL-addressable in the eventual implementation.

## Page Layout Pattern

Every analytical page uses the same reading order:

1. Decision this page supports
2. KPI row
3. Primary chart area
4. Detailed table
5. Scope & definitions drawer

The page should keep the user's focus on one default analytical view, with optional axis/metric switching available as secondary controls.

## Scope & Definitions Pattern

Do not show long scope notes as large visible footers. Instead, put a `Scope & definitions` control in the top-right page header or chart header.

The drawer should include:
- Page scope
- Metric definitions
- Default chart axis definitions
- Available metric switches
- Grain of the chart and table
- Any important denominator rule

Shared scope definitions:
- `FG only`: includes finished goods records only.
- `PLV only`: includes sample records only.
- `Total Product`: FG + PLV for the same parent Product.
- `Value`: sales value for the selected scope and filters.
- `Units`: shipped or sold units for the selected scope and filters.
- `Indicative GM`: indicative gross margin for the selected scope and filters.
- `ABC Category`: classification based on brand sales contribution.
- `FLA Count`: number of FLA variants attached to the product or SKU.

## Visual Style

The visual design should match the framework page, but the dashboard pages should be more restrained and operational.

Style principles:
- Light canvas with subtle magenta, purple, and cyan accents.
- Product (FG) uses magenta accents.
- Sample (PLV) uses cyan accents.
- Strategic logic uses purple accents.
- Dashboard surfaces use white cards, quiet borders, and clear typography.
- Tables are dense but readable.
- Charts should use direct labels and clear quadrant annotations where useful.
- Avoid decorative gradients inside chart marks.
- Avoid making every metric card visually loud.

Recommended visual hierarchy:
- Framework/cover page: expressive and presentation-like.
- Dashboard pages: calm, data-first, business-tool-like.
- Action statuses: use red/yellow/green only for the `Suggested action` column, not as general decoration.

## Page 0: Overview

Purpose:
Show the simplified analytics framework and let users choose where to start.

Content:
- Title: `Assortment Optimization Analytics Framework`
- Three columns: Product (FG), Strategic Logic, Sample (PLV)
- Three levels:
  - Level 1: Macro - Where is the Money?
  - Level 2: Diagnosis - Is Complexity Justified?
  - Level 3: Micro - What Should We Keep, Review, or Simplify?

Cards:
- Core vs. Tail: Separate top value drivers from the low-performing long tail across the portfolio.
- FG Variety vs. Value: Flag products where high SKU and FLA variety fail to generate enough value.
- FG SKU Deep Dive: Zoom into one product to identify low-volume, low-margin, or high-complexity SKUs.
- PLV Support vs. FG Sales: Check whether PLV support is proportionate to FG sales and units.
- Sample Complexity vs. Demand: Expose complex mini-assortments that lack shipped units to justify their existence.
- PLV SKU Deep Dive: Zoom into one product to identify overlapping PLV sizes with no distinct sales role.

Interactions:
- Clicking a card navigates to its page.
- Hovering a card subtly highlights the connected strategic logic level.

## Page 1: Core vs. Tail

Decision this page supports:
Identify the products that drive most FG value, units, or indicative GM, and separate them from the long tail.

Scope:
- FG only.
- All Value, Units, and Indicative GM calculations are FG only.

KPI row:
- Total product count
- A segment product count and percentage: products contributing the first cumulative 60% of the selected metric
- B segment product count and percentage: products contributing cumulative 60%-90% of the selected metric
- C segment product count and percentage: products in the bottom 10% of the selected metric

Primary chart:
- Pareto chart
- Grain: Product
- Default metric: Value
- Switchable metrics: Value, Units, Indicative GM

Chart behavior:
- Sort products descending by selected metric.
- Show cumulative contribution line.
- Visually mark A, B, and C regions.
- Use the selected metric consistently across KPI cards, chart, and table.

Detailed table columns:
- Brand
- Category
- Product Lvl 1
- Sales value and contribution to brand
- Units and contribution to brand
- Indicative GM and contribution to brand
- RSP
- MAP
- Indicative GM%
- Lifecycle
- ABC Category based on brand sales

## Page 2: FG Variety vs. Value

Decision this page supports:
Identify products where FG SKU or FLA variety is high relative to business contribution.

Scope:
- FG only.
- SKU count, FLA count, Value, Units, and Indicative GM calculations are FG only.

KPI row:
- Total product count
- Average number of SKUs
- Average number of FLA

Primary chart:
- Scatter chart
- Grain: Product
- Default x-axis: Value
- Default y-axis: SKU Count
- Switchable x-axis: Value, Units, Indicative GM
- Switchable y-axis: SKU Count, FLA Count

Chart behavior:
- Default view should answer: which products have high SKU count but low Value?
- Add quadrant labels:
  - High variety / high value
  - High variety / low value
  - Low variety / high value
  - Low variety / low value
- The `High variety / low value` quadrant should be visually marked as a review zone.
- Points should be labeled or reveal Product Lvl 1 on hover.

Detailed table columns:
- Brand
- Category
- Product Lvl 1
- Sales value
- Units
- Indicative GM
- Indicative GM%
- SKU Count
- Sales per SKU
- FLA Count
- Sales per FLA
- Lifecycle
- ABC Category based on brand sales

## Page 3: FG SKU Deep Dive

Decision this page supports:
Within one selected FG product, identify SKUs that should be kept, reviewed, or simplified.

Scope:
- FG only.
- SKU count, FLA count, Value, Units, and Indicative GM calculations are FG only.
- This page requires a selected Product.

Filters:
- Time period
- Channel lvl1
- Brand + Category + Product search

KPI row:
- Product lifecycle
- ABC Category based on brand sales
- SKU count
- Brand total benchmark: average SKU count
- FLA count
- Brand total benchmark: average FLA count
- Selected metric value
- Selected metric contribution to brand
- Selected metric rank out of total brand

Primary charts:
- Pareto chart
- Grain: SKU
- Scope: FG only
- Default metric: Value
- Switchable metric: Value, Units, Indicative GM

- Bubble chart
- Grain: SKU
- Scope: FG only
- Default x-axis: selected metric
- Default y-axis: COGS per ml/kg
- Bubble size: FLA Count
- Switchable x-axis: Value, Units, Indicative GM

Detailed table columns:
- SKU Code
- SKU Name
- Size
- FLA Count
- FLA
- Sales value and contribution to product
- Units and contribution to product
- Indicative GM and contribution to product
- RSP
- MAP
- Indicative GM%
- COGS per ml/kg
- Lifecycle
- Suggested action
- Reason

Suggested action logic:
- `Keep` shown in green.
- `Review` shown in yellow.
- `Simplify` shown in red.

Recommended default rules:
- Keep when the SKU is a meaningful contributor to product value, units, or indicative GM, or when it has a clear business role despite not being a top SKU.
- Review when the SKU has mixed signals, such as low volume but acceptable margin, high FLA burden but non-trivial value, or uncertain lifecycle role.
- Simplify when the SKU has low units contribution, low value or indicative GM contribution, weak GM%, high COGS per ml/kg, high FLA burden, or late/non-core lifecycle signals.

Reason field:
- Required for `Review` and `Simplify`.
- Empty for `Keep`.
- Suggested reason examples:
  - Low units contribution
  - Low value contribution
  - Low GM contribution
  - Low GM% / high COGS
  - High FLA burden
  - Tail SKU with weak contribution
  - Lifecycle review needed
  - Mixed performance signals

## Page 4: PLV Support vs. FG Sales

Decision this page supports:
Check whether PLV support is proportionate to the parent FG business.

Scope:
- KPI row and detailed table include all products, whether or not they have PLV.
- Chart includes only products with PLV.
- Total Product = FG + PLV.
- Other metrics use the specified FG or PLV scope.

KPI row:
- Total product count
- Product count with PLV
- Total PLV SKU Count
- Ratio: PLV SKU Count / Total Product SKU Count
- Total PLV Units
- Ratio: PLV Units / Total Product Units
- Total PLV Cost
- Ratio: PLV Cost / Total Product Cost
- Ratio: PLV Cost / FG Sales Value

Primary chart:
- Scatter chart
- Grain: Product
- Scope: products with PLV
- Default x-axis: FG Units
- Default y-axis: PLV Units / Total Product Units
- Switchable x-axis: FG Value, FG Units, FG Indicative GM
- Switchable y-axis: PLV Units / Total Product Units, PLV Cost / FG Sales Value, PLV SKU Count / Total Product SKU Count, PLV Cost / Total Product Cost

Chart behavior:
- Default view should answer: which products receive high PLV unit support relative to total units?
- Products with high PLV units ratio and low FG units should be visually marked as a review zone.
- Tooltip should show FG Units, PLV Units, Total Product Units, and PLV Units / Total Product Units.

Detailed table columns:
- Brand
- Category
- Product Lvl 1
- PLV SKU Count
- Total Product SKU Count
- Ratio: PLV SKU Count / Total Product SKU Count
- PLV Units
- Total Product Units
- Ratio: PLV Units / Total Product Units
- Total PLV Cost
- Total Product Cost
- Ratio: PLV Cost / Total Product Cost
- Ratio: PLV Cost / FG Sales Value
- Lifecycle
- ABC Category based on brand sales

## Page 5: Sample Complexity vs. Demand

Decision this page supports:
Identify products where PLV sample complexity is high, but shipped PLV demand does not justify that complexity.

Scope:
- Total product count includes all products.
- All other KPI, chart, and table metrics include only products with PLV.
- Total Product = FG + PLV.
- Other metrics use the specified FG or PLV scope.

KPI row:
- Total product count
- Product count with PLV
- Average number of PLV SKUs
- Average number of PLV FLA

Primary charts:
- Scatter chart 1:
  - Grain: Product
  - Default x-axis: PLV Units
  - Default y-axis: Number of PLV SKUs
  - Switchable y-axis: Number of PLV SKUs, Number of PLV FLA

- Scatter chart 2:
  - Grain: Product
  - Default x-axis: PLV channel coverage count at channel lvl2
  - Default y-axis: Number of PLV SKUs
  - Switchable y-axis: Number of PLV SKUs, Number of PLV FLA

Chart behavior:
- Default view should answer: which products carry a complex mini-assortment without enough PLV units?
- Mark the high complexity / low demand region as a review zone.
- Keep PLV Units as the demand anchor.

Detailed table columns:
- Brand
- Category
- Product Lvl 1
- PLV Units
- PLV channel coverage count
- Number of PLV SKUs
- Number of PLV FLA
- PLV Cost
- Lifecycle
- FG Sales value
- FG Sales value contribution to brand
- ABC Category based on brand sales

## Page 6: PLV SKU Deep Dive

Decision this page supports:
Within one selected product, identify PLV SKUs that should be kept, reviewed, or simplified based on units, cost, overlap, and distinct sales role.

Scope:
- PLV only.
- This page includes only products with PLV.
- Total Product = FG + PLV.
- Other metrics use the specified FG or PLV scope.
- This page requires a selected Product.

Filters:
- Time period
- Channel lvl1
- Brand + Category + Product search

KPI row:
- Product lifecycle
- ABC Category based on brand sales
- PLV SKU count
- Brand total benchmark: average PLV SKU count
- PLV FLA count
- Brand total benchmark: average PLV FLA count
- PLV units
- PLV units contribution to brand
- Units rank out of total brand

Primary charts:
- Pareto chart
- Grain: SKU
- Scope: PLV only
- Default metric: PLV Units

- Bubble chart
- Grain: SKU
- Scope: PLV only
- x-axis: PLV Units by SKU
- y-axis: COGS per ml/kg
- Bubble size: FLA Count

Optional matrix:
- Channel coverage matrix by SKU and channel lvl2
- Sample type matrix by SKU and sample type

Detailed table columns:
- SKU Code
- SKU Name
- Size
- FLA Count
- FLA
- PLV units contribution to product
- Cost
- COGS per ml/kg
- Lifecycle
- Channel covered at channel lvl2
- Sample type
- Suggested action
- Reason

Suggested action logic:
- `Keep` shown in green.
- `Review` shown in yellow.
- `Simplify` shown in red.

Recommended default rules:
- Keep when the PLV SKU has meaningful units, reasonable cost, and a distinct channel, sample-type, size, or commercial role.
- Review when the PLV SKU has partial demand, cost concerns, or possible overlap that requires business judgment.
- Simplify when the PLV SKU has low units, high COGS per ml/kg, high FLA burden, overlapping size/sample role, weak channel coverage, or no distinct sales role.

Reason field:
- Required for `Review` and `Simplify`.
- Empty for `Keep`.
- Suggested reason examples:
  - Low PLV units
  - High COGS
  - Overlapping sample role
  - Weak channel coverage
  - High FLA burden
  - No distinct sales role
  - Mixed demand and cost signals

## Suggested Action Display

Use one consistent action vocabulary on FG SKU Deep Dive and PLV SKU Deep Dive:

| Action | Color | Meaning | Reason required |
| --- | --- | --- | --- |
| Keep | Green | Strong enough role or contribution to retain | No |
| Review | Yellow | Mixed signal, needs business judgment | Yes |
| Simplify | Red | Candidate for simplification, consolidation, or cut | Yes |

The dashboard should not imply that actions are automatic decisions. It should frame them as recommendations for business review.

## Data Model Needed For Demo

The mock data should support these entities:

- Brand
- Category
- Product Lvl 1
- Product lifecycle
- ABC Category
- FG SKU
- PLV SKU
- Size
- FLA
- FLA Count
- Channel lvl1
- Channel lvl2
- Sample type
- Time period
- Sales value
- Units
- Indicative GM
- Indicative GM%
- RSP
- MAP
- COGS per ml/kg
- PLV cost

Derived metrics:
- Contribution to brand
- Contribution to product
- Sales per SKU
- Sales per FLA
- PLV SKU Count / Total Product SKU Count
- PLV Units / Total Product Units
- PLV Cost / Total Product Cost
- PLV Cost / FG Sales Value
- Product and SKU ranks
- Suggested action
- Reason

## Interaction Requirements

- Sticky global filters remain visible while scrolling.
- KPI cards, charts, and tables update together.
- Axis and metric switches affect only the active chart unless explicitly marked as page-wide.
- Clicking a product-level chart point can open the relevant deep-dive page with that product selected.
- Tables support sort by all numeric columns.
- Tables support search on Product or SKU fields where relevant.
- The Scope & definitions drawer is keyboard accessible and can be closed with Escape.
- Hover tooltips on charts supplement the visual; they must not contain the only definition of a metric.

## Responsive Behavior

Desktop is the primary demo target.

Minimum responsive behavior:
- At desktop width, show full framework, KPI row, chart, and detailed table.
- At tablet width, wrap KPI cards and keep charts full-width.
- At mobile width, keep the filter bar usable, stack charts vertically, and convert wide tables into horizontally scrollable tables or row cards.

## Out Of Scope For The First Demo

- Real data warehouse connection.
- User authentication.
- Saved views.
- Export workflow.
- Final consolidated cut list.
- Automated approval workflow for simplify/review actions.

## Open Implementation Choice

The preferred implementation path is a React + Tailwind dashboard. Tremor Raw or Recharts are good fits because the demo needs KPI cards, scatter charts, Pareto charts, and dense tables. The visual language should be custom enough to match the analytics framework page rather than looking like an off-the-shelf admin template.

