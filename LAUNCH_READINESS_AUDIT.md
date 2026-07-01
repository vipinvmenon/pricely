# Pricely Launch Readiness Audit

**Audit date:** 29 June 2026  
**Launch readiness score:** **33/100 — No-go for public launch**

## Scope and limitations

The audit covered all currently implemented public routes at desktop and `402×874`
mobile sizes:

- Home
- Compare
- Watchlist
- Alerts
- Sign in
- Sign up

It also covered navigation and key interactions, API routes, auth flows, Supabase
schema, the alert cron, scraper service, shared components, accessibility,
responsiveness, and design-system compliance.

The rendered audit used mock comparison data because development mode enables
`shouldUseMockData()`. The live scraper, Supabase, alert, and verdict paths were
reviewed statically but were not executed against live retailers or a real
authenticated account.

The following remain outside the verified scope:

- Live retailer scraping accuracy, availability, and latency
- Real Supabase sign-up, sign-in, and email confirmation
- Authenticated watchlist and alert behavior with production data
- Actual Resend delivery and deliverability
- Production deployment and cron execution
- Lint, type-check, and production build validation

Priority definitions:

- **P0:** Launch blocker
- **P1:** Must fix before or immediately around launch
- **P2:** Post-launch improvement
- **P3:** Backlog or delight work

Effort definitions:

- **S:** Under approximately one day
- **M:** Several days
- **L:** Multi-week or cross-system work

## Complete issue backlog

| # | Severity | Screen/Page | Description | Why it matters | Recommendation | Priority | Effort |
|---|---|---|---|---|---|---|---|
| 1 | Critical | Compare/verdict | History combines prices from different retailers as one time series. | Cross-retailer variance is mistaken for price movement, producing false charts and verdicts. | Aggregate one daily lowest comparable price, preserve retailer series separately, and require sufficient distinct days. | P0 | L |
| 2 | Critical | Compare API | New price points are inserted before the product row exists, and insert errors are ignored. | First searches can silently lose history because of the foreign key. | Upsert the product first, persist points transactionally, and handle database errors. | P0 | M |
| 3 | Critical | Compare | Out-of-stock scrape results are marked available and can become the lowest result. | Users may receive a Buy verdict for something they cannot purchase. | Normalize stock states and exclude unavailable listings from rankings and CTAs. | P0 | M |
| 4 | Critical | Search/Compare | Listings are automatically matched without exact product and variant confirmation. | Storage, size, color, generation, and accessory mismatches can create false comparisons. | Add canonical products, variant selection, match confidence, and a disambiguation step. | P0 | L |
| 5 | Critical | Alerts | Missing Resend configuration or delivery errors can still result in an alert being marked triggered and inactive. | The user may never receive the notification and the alert then stops working. | Mark an alert triggered only after verified delivery; retry failures and expose delivery state. | P0 | M |
| 6 | Critical | Alerts | The cron runs daily at 04:00 while the product promises instant or five-minute alerts. | The primary retention promise is materially false. | Run frequent batched checks or queue-based monitoring and communicate the real SLA. | P0 | M |
| 7 | Critical | Compare/mock mode | Any query can return the same Sony product, random history, and `#` purchase links. Production can also fall back to mock data when scraper configuration is absent. | Public users could see fabricated live prices and recommendations. | Fail closed in production, clearly badge demo mode, and make mock results query-specific and deterministic. | P0 | S |
| 8 | Critical | Compare API | Public uncached query variations can fan out to seven expensive scraper jobs without rate limits. | This enables denial-of-service and uncontrolled infrastructure cost. | Add per-IP and per-user quotas, normalized caching, concurrency limits, and a queue. | P0 | M |
| 9 | High | Compare/mobile | The seven-column retailer table clips retailer names and compresses values at mobile width. | The core product is effectively unusable on mobile. | Replace the table with stacked retailer cards or responsive disclosure. | P0 | L |
| 10 | High | Compare/mobile | The chart clips its right edge and current-price label. | Users cannot reliably read the evidence behind the verdict. | Fix chart margins, label placement, mobile height, and overflow. | P0 | M |
| 11 | High | Global/product | Location silently defaults to Mumbai and is never displayed or editable. | Availability, price, and delivery are location-dependent in India. | Add detected-city confirmation and persistent city or pincode selection. | P0 | M |
| 12 | High | Compare | Partial scraper failures returned by the API are not shown. | “Retailers tracked” can conceal missing or failed sources. | Show successful, unavailable, stale, and failed retailers explicitly. | P0 | S |
| 13 | High | Sign-up | Terms and Privacy Policy point to `#`. | Legal consent is invalid and credibility suffers. | Publish reviewed legal pages and record versioned consent. | P0 | M |
| 14 | High | Alert emails | Scraped product names, retailer names, and URLs are interpolated into HTML without escaping. | External data can inject malicious or misleading email markup. | Escape text, validate retailer URLs, and use a safe template. | P0 | S |
| 15 | High | Alert emails | Production email uses `onboarding@resend.dev`. | Deliverability and brand trust will be poor or restricted. | Verify a Pricely domain and configure SPF, DKIM, DMARC, bounce, and complaint handling. | P0 | M |
| 16 | High | Watchlist/Alerts | Ellipsis buttons immediately delete items without confirmation. | The label implies a menu and makes accidental deletion likely. | Use an explicit Remove action, confirmation or undo toast, and failure rollback. | P0 | S |
| 17 | High | Watchlist/Alerts mobile | Authenticated rows retain fixed desktop column grids. | Real user data will clip similarly to Compare. | Design dedicated mobile cards with progressive disclosure. | P0 | M |
| 18 | High | Global accessibility | Muted text such as `#4A4F58` on the dark canvas fails contrast in many places. | Important labels and metadata are difficult to read. | Raise semantic muted colors to WCAG AA and test both themes. | P0 | S |
| 19 | High | Forms/search | Inline `outline: none` removes focus indication from search and auth inputs. | Keyboard users cannot see focus. | Use tokenized `:focus-visible` and `:focus-within` states. | P0 | S |
| 20 | High | Tables/charts | Retailer, watchlist, and alert tables are generic div grids; charts lack textual summaries. | Screen-reader relationships and chart meaning are lost. | Use semantic tables or lists and accessible chart summaries. | P0 | M |
| 21 | High | Global | Many controls are below the mandatory 44px target, including nav links, chips, and small buttons. | Touch and motor accessibility suffer. | Enforce 44×44 targets on mobile and adequate spacing. | P0 | M |
| 22 | High | Auth | No password reset, recovery, password visibility, resend-confirmation, or account deletion flow exists. | Users can become locked out and cannot manage their data. | Complete the account lifecycle before launch. | P1 | L |
| 23 | High | Alert auth handoff | An unauthenticated alert intent is not completed after sign-in. | Users must repeat the operation, harming conversion. | Persist product, target, and return path and resume creation after authentication. | P1 | M |
| 24 | High | Compare | Direct `/compare` silently loads Sony rather than a purposeful empty state. | It looks like the user already searched and creates confusion. | Start with search, recent, or trending content and fetch only after a query. | P1 | S |
| 25 | High | Compare | There is no genuine zero-result or low-confidence-match state. | Users may mistake a weak match or query echo for a real product. | Add no-result, partial-result, ambiguous-result, and retry states. | P1 | M |
| 26 | High | Compare | No freshness timestamp, source time, or manual refresh is shown. | Users cannot assess whether live prices are current. | Display per-retailer freshness and offer a bounded refresh action. | P1 | M |
| 27 | High | Compare | Prices omit seller identity, shipping totals, offer conditions, and bank-card dependencies. | The visually lowest price may not be the payable price. | Compare landed price and disclose every assumption. | P1 | L |
| 28 | High | Global trust | “Live,” “always up to date,” “90-day history,” and “7 retailers” are shown without qualification. | Claims exceed implemented guarantees. | Add methodology, coverage status, affiliate disclosure, and honest freshness copy. | P1 | M |
| 29 | High | Search | No autocomplete, typo handling, recent searches, or variant suggestions exist. | Search is high-friction and prone to incorrect matches. | Add structured search with canonical product and variant suggestions. | P1 | L |
| 30 | High | Product scope | Grocery and cab comparison described in repository context are absent and there is no category information architecture. | The implemented market proposition is much narrower than the defined product. | Narrow the public positioning or implement category-specific journeys. | P1 | L |
| 31 | Medium | Compare | Delivery and Trust controls are inert buttons. | They look interactive but do nothing. | Implement real sorting or remove them. | P1 | S |
| 32 | Medium | Compare | There is no filtering by stock, retailer, delivery, returns, seller, or offer type. | Users cannot optimize beyond nominal price. | Add useful filters and persistent sorting. | P1 | M |
| 33 | Medium | Compare | There is no canonical product-detail permalink separate from the mutable comparison page. | Sharing, SEO, re-entry, and canonical identity are weak. | Add `/product/[id]` with canonical metadata and selected variant. | P1 | L |
| 34 | Medium | Compare | Product imagery remains a large placeholder and retailer logos are absent. | Results feel unfinished and are harder to verify visually. | Add optimized product images, retailer marks, alt text, and fallbacks. | P1 | M |
| 35 | Medium | Watchlist | “Saved with Pricely” measures observed price decline rather than verified purchase savings. | It overclaims business impact. | Rename it to price movement observed or calculate savings from confirmed purchases. | P1 | S |
| 36 | Medium | Watchlist | Two cards are labelled Tracked, and unauthenticated users see four meaningless zero cards. | Information hierarchy is noisy and confusing. | Show sign-in value first and rename or consolidate the stats. | P1 | S |
| 37 | Medium | Alerts | Alerts cannot be edited, paused, reactivated, or assigned notification channels. | Normal alert management journeys are incomplete. | Add lifecycle controls, current price, distance to target, and delivery status. | P1 | M |
| 38 | Medium | Loading/errors | Most routes use plain Loading text and errors lack retry and offline distinction. | Perceived performance is poor and failures become dead ends. | Add layout-matched skeletons, retry controls, and reconnect states. | P1 | M |
| 39 | Medium | Mobile navigation | The menu lacks Escape handling, focus management, backdrop, scroll lock, and `aria-controls`. | Keyboard and screen-reader navigation is incomplete. | Implement an accessible disclosure or dialog navigation pattern. | P1 | S |
| 40 | Medium | Global markup | Links frequently wrap buttons. | Nested interactive controls are invalid and cause inconsistent focus behavior. | Style links as buttons or support polymorphic button rendering. | P1 | S |
| 41 | Medium | Returning home | Clickable change rows are non-focusable divs. | Keyboard users cannot open them. | Render links or buttons with contextual accessible names. | P1 | S |
| 42 | Medium | Compare chart | Copy says 90 days, mock data spans 12 months, and 6M, 12M, and All can represent identical live datasets. | The chart is internally inconsistent. | Derive copy and ranges from actual coverage and aggregate by day. | P1 | M |
| 43 | Medium | Auth forms | Full name is optional despite appearing required; no strength feedback or password confirmation exists. Errors lack live-region semantics. | Validation feels weak and errors may not be announced. | Align labels and validation, add strength guidance, and use `role="alert"`. | P1 | S |
| 44 | Medium | Global navigation | The fixed top nav and 768px breakpoint contradict the mandated desktop sidebar and mobile tab shell. | Layout behavior is inconsistent with the design contract. | Reconcile the contract or implement the specified shell. | P2 | L |
| 45 | Medium | Design system | Runtime uses Geist instead of defined typography roles, legacy glass values, 316 inline style objects, and many raw spacing values. | Consistency and maintainability will deteriorate rapidly. | Move styles into reusable tokenized variants and enforce lint rules. | P2 | L |
| 46 | Medium | Motion | Continuous pulse animations are decorative despite the contract prohibiting continuous animation. | This adds distraction and conflicts with system rules. | Use static status dots or one-shot transitions. | P2 | S |
| 47 | Medium | Feedback | Save, delete, and alert actions lack consistent toasts, undo, and durable error presentation. | Users cannot confidently tell whether an action succeeded. | Add an accessible action-feedback and toast system. | P1 | M |
| 48 | High | Scraper | A comparison may launch seven browser-heavy scraper jobs simultaneously. | Memory, CPU, retailer blocking, and latency will degrade rapidly. | Use pooled browsers, platform queues, circuit breakers, and concurrency caps. | P0 | L |
| 49 | High | Cron/backend | Alerts are processed sequentially and user emails are fetched with N+1 admin calls. | Moderate volume can exceed serverless execution limits. | Batch by product and city, queue deliveries, and remove the N+1 lookup. | P0 | L |
| 50 | High | Reliability | API, database, scraper, verdict, and cron failures are frequently swallowed; no production error telemetry exists. | Silent bad data is worse than visible failure in a financial decision product. | Add structured logs, tracing, error reporting, alerting, and data-quality metrics. | P0 | M |
| 51 | High | Testing | The repository contains no automated tests. | Matching, verdicts, auth, alerts, and API contracts can regress unnoticed. | Add unit, integration, accessibility, responsive, and critical E2E coverage. | P0 | L |
| 52 | High | Security | Public pages lack CSP, HSTS, Referrer-Policy, and Permissions-Policy; only API routes receive minimal headers. | Browser attack surface and privacy leakage are insufficiently controlled. | Publish a tested security-header policy and enable dependency scanning. | P0 | M |
| 53 | Medium | Architecture | Large route files contain business logic and every main page is a client component. | Bundle size, reuse, testability, and server-rendering benefits suffer. | Split route composition from feature controllers and server-renderable content. | P1 | L |
| 54 | Medium | Architecture | Auth subscription, auth layouts, Google icons, input styles, and table patterns are duplicated. | Fixes will drift between screens. | Create shared auth, form, session, responsive-row, and icon primitives. | P1 | M |
| 55 | Medium | Analytics/business | No analytics or funnel instrumentation exists. | Search success, retailer clicks, conversion, delivery, and retention cannot be measured. | Define privacy-conscious events and launch dashboards. | P1 | M |
| 56 | Medium | SEO/credibility | Only root metadata exists; there is no sitemap, robots policy, Open Graph content, structured product data, footer, support, or methodology page. | Discovery and trust are weak. | Add canonical metadata, public trust pages, contact support, and share previews. | P1 | M |
| 57 | Medium | Privacy/i18n | There are no notification preferences, data export and deletion tools, localization framework, or locale-ready copy architecture. | Compliance and expansion beyond English and INR will be expensive later. | Add data controls and externalize user-facing strings now. | P1 | L |
| 58 | Low | Tooling | Documentation specifies pnpm but only npm lockfiles exist; deprecated middleware is used; Turbopack exhausted approximately 1.5GB during the audit. | Developer reliability and reproducibility are uncertain. | Standardize package management, migrate middleware to proxy, and reproduce and profile memory use. | P2 | S |

## Top 20 issues before launch

1. Correct the price-history data model and verdict inputs.
2. Prevent variant and product mismatches.
3. Exclude unavailable and out-of-stock listings.
4. Fail closed instead of exposing fabricated mock results.
5. Make alert delivery transactional and observable.
6. Align alert frequency with the product promise.
7. Add comparison API rate limits and job queues.
8. Rebuild the mobile comparison layout.
9. Add city or pincode selection.
10. Surface partial retailer failures and freshness.
11. Publish real Terms and Privacy pages.
12. Escape and validate email content.
13. Use a verified email domain.
14. Replace accidental one-click deletion.
15. Fix authenticated mobile watchlist and alert layouts.
16. Complete password recovery and account lifecycle.
17. Preserve alert intent through authentication.
18. Resolve contrast, focus, target-size, and semantic accessibility failures.
19. Add automated tests and production observability.
20. Add CSP and complete security headers.

## Prioritized roadmap

### Phase 1: Critical fixes

- Repair history aggregation, product persistence order, variant identity, and
  stock handling.
- Remove production mock fallback.
- Make alerts reliable, frequent, retryable, and observable.
- Add rate limiting, queues, scraper pooling, security headers, and safe email
  templates.
- Fix mobile Compare, Watchlist, and Alerts layouts.
- Publish legal pages.
- Establish P0 automated tests and monitoring.

### Phase 2: UX improvements

- Add canonical search, autocomplete, disambiguation, city selection, and
  no-result states.
- Add real filtering and sorting and canonical product-detail routes.
- Show freshness, partial failures, offer conditions, and payable price.
- Complete auth recovery and alert-intent handoff.
- Add alert editing, pausing, reactivation, and notification preferences.
- Add skeleton, retry, offline, and action-feedback systems.

### Phase 3: Polish

- Add product imagery and retailer branding.
- Complete accessibility remediation and keyboard testing.
- Move to tokenized responsive components and remove inline-style sprawl.
- Make chart ranges, tooltips, summaries, and annotations accurate.
- Add SEO, Open Graph, support, methodology, footer, and affiliate disclosure.
- Add analytics dashboards and conversion instrumentation.

### Phase 4: Delight features

- Predicted next-drop windows and sale-calendar intelligence
- Personalized effective price including cards, coupons, delivery, and EMI
- WhatsApp, push, and browser-extension alerts
- Shared and family watchlists
- Verified-purchase savings history
- Premium longer history, real-time monitoring, multiple alert conditions, and
  unlimited tracking

## Quick wins under one day

- Remove or disable the inert Delivery and Trust controls.
- Replace the default Sony comparison with an empty search state.
- Show a prominent Demo Data badge and fail closed in production.
- Add partial-retailer failure and last-updated labels.
- Rename ellipsis actions and add confirmation or undo.
- Make full name required and add accessible auth error regions.
- Fix input focus states and small touch targets.
- Add contextual labels such as “Buy Sony WH-1000XM5 at Amazon.”
- Adjust chart margins and hide impossible ranges.
- Replace the duplicate Tracked stat and suppress zero dashboards for guests.
- Add a footer with support, methodology, Terms, Privacy, and affiliate
  disclosure.
- Add metadata, sitemap, robots policy, and Open Graph content.

## Premium “wow” improvements

- A transparent Deal Score showing historical percentile, match confidence,
  freshness, and the reason for acting now
- Variant Lock so users confirm the exact specification once and Pricely only
  compares exact matches
- True-price comparison including delivery, coupons, bank offers, cashback, and
  EMI cost
- Price-drop forecasting with likely sale windows and confidence bands
- Instant WhatsApp alerts with one-tap retailer deep links
- A browser extension that answers “Is this a good price?” on retailer pages
- Collaborative household and gift watchlists
- A purchase-confirmation flow that proves actual savings instead of estimating
  them

## Recommended design-to-implementation sequence

Do not design every screen to final polish before testing the underlying product
model. Use this order:

1. **Lock the product truth**
   - Define canonical product and variant matching.
   - Define price freshness, availability, total payable price, and verdict
     rules.
   - Define alert delivery guarantees and failure states.
2. **Design the end-to-end journeys**
   - First search
   - Product disambiguation
   - Comparison and decision
   - Track and set alert
   - Sign-up handoff
   - Returning-user watchlist and alert management
   - Empty, loading, partial, error, offline, and recovery states
3. **Design mobile first**
   - Solve retailer comparison, charts, watchlist rows, and alert rows at the
     canonical `402×874` target.
   - Expand those patterns to desktop rather than shrinking desktop tables.
4. **Update the design-system contract and reusable components**
   - Navigation shell
   - Search and disambiguation
   - Retailer result card
   - Verdict and confidence explanation
   - Responsive data rows
   - Skeleton, error, toast, dialog, and confirmation patterns
5. **Implement one complete vertical slice**
   - Search one exact product.
   - Compare trustworthy live results.
   - Set and receive one alert.
   - Verify the complete journey with tests and telemetry.
6. **Scale coverage and polish**
   - Add more retailers, categories, retention features, and premium features
     only after the first slice is reliable.

Design and engineering should therefore overlap: product and UX design should
lead the interaction work, while engineering fixes the price, matching, alert,
and scalability foundations in parallel.
