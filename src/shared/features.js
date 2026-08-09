'use strict';
// Single source of truth for the platform's optional (toggleable) features.
// Read directly by the server (require) and injected as a literal `ORDERPILOT_FEATURES`
// constant into the built app.js / admin.js bundles by scripts/build-web.js, so both the
// server and both clients always agree on ids, labels, and prices without duplicating them.
//
// `core: true` is the single always-on base bundle — it is never shown as a toggle in the
// generator and can never be removed by a client. Only genuinely advanced/optional add-ons are
// listed as separate, removable items; everyday basics (favorites, "back in stock" alerts, push
// notifications) are folded into the base price instead of being separately removable, since a
// client shouldn't be able to strip out things that make the product feel unfinished.
//
// Delivery-type count is priced separately (see EXTRA_DELIVERY_TYPE_PRICE below): the vendor
// fixes the number of delivery types per client in the generator; the client's own admin panel
// can only rename them afterwards, never add/remove, so the count — and its price — stays under
// vendor control for the life of the deployment.
//
// Prices are pre-VAT estimates the vendor can edit any time; nothing else hardcodes a total.
const FEATURES = [
  { id: 'core', label: 'בסיס הפלטפורמה (קטלוג, סל, הזמנות, ניהול רשתות/סניפים, מועדפים, התראות מלאי ופוש)', scope: 'both', core: true, setupPrice: 4200, monthlyPrice: 390 },
  { id: 'returns', label: 'ניהול חזרות (כולל זיהוי אוטומטי מתעודה)', scope: 'both', core: false, setupPrice: 1800, monthlyPrice: 120 },
  { id: 'promotions', label: 'מבצעים', scope: 'both', core: false, setupPrice: 950, monthlyPrice: 70 },
  { id: 'banners', label: 'באנרים (כולל וידיאו וסיבוב אוטומטי)', scope: 'both', core: false, setupPrice: 750, monthlyPrice: 45 },
  { id: 'offlineQueue', label: 'הזמנה במצב לא מקוון', scope: 'app', core: false, setupPrice: 1400, monthlyPrice: 90 },
  { id: 'barcodeScan', label: 'סריקת ברקוד', scope: 'app', core: false, setupPrice: 750, monthlyPrice: 40 },
  { id: 'stats', label: 'סטטיסטיקות וגרפים', scope: 'admin', core: false, setupPrice: 1100, monthlyPrice: 80 },
  { id: 'multiLanguage', label: 'ריבוי שפות (אנגלית / ערבית / רוסית)', scope: 'app', core: false, setupPrice: 850, monthlyPrice: 45 },
  { id: 'integrations', label: 'ממשקים וייבוא (ERP)', scope: 'admin', core: false, setupPrice: 2600, monthlyPrice: 170 },
  { id: 'multiEmployee', label: 'ריבוי עובדים והרשאות', scope: 'admin', core: false, setupPrice: 650, monthlyPrice: 40 },
];

// The vendor sets the delivery-type count per client at creation time; the first type is
// included in the base price and every additional one is charged here. Not a toggleable
// "feature" — there's nothing for the client to turn on/off, only a count the vendor fixes.
const EXTRA_DELIVERY_TYPE_PRICE = { setupPrice: 300, monthlyPrice: 20 };

function defaultFeatureIds() {
  return FEATURES.filter(f => f.core).map(f => f.id);
}

function priceFor(featureIds, deliveryTypeCount = 1) {
  const ids = new Set([...featureIds, 'core']);
  let setup = 0, monthly = 0;
  for (const f of FEATURES) {
    if (ids.has(f.id)) { setup += f.setupPrice; monthly += f.monthlyPrice; }
  }
  const extraTypes = Math.max(0, Number(deliveryTypeCount || 1) - 1);
  setup += extraTypes * EXTRA_DELIVERY_TYPE_PRICE.setupPrice;
  monthly += extraTypes * EXTRA_DELIVERY_TYPE_PRICE.monthlyPrice;
  return { setup, monthly, extraDeliveryTypes: extraTypes };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FEATURES, EXTRA_DELIVERY_TYPE_PRICE, defaultFeatureIds, priceFor };
}
