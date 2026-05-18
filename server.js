const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || process.env.ORDERPILOT_HOST || '0.0.0.0';
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const CODE_PEPPER = process.env.CODE_PEPPER || 'change-this-code-pepper';
const SESSION_HOURS = 12; // admin panel: short server session; frontend uses sessionStorage so closing the desktop/browser requires login again
const STORE_SESSION_HOURS = 24 * 180; // branch app stays signed in up to six months
const PASSWORD_ROTATION_DAYS = 180;
const PASSWORD_ROTATION_MS = PASSWORD_ROTATION_DAYS * 24 * 60 * 60 * 1000;
const APP_VERSION = 34;

const DATA_FILES = {
  meta: 'meta.json',
  admins: 'admins.json',
  sessions: 'sessions.json',
  networks: 'networks.json',
  branches: 'branches.json',
  deliveryTypes: 'delivery-types.json',
  categories: 'categories.json',
  subcategories: 'subcategories.json',
  categoryDeliveryRules: 'category-delivery-rules.json',
  kosherTypes: 'kosher-types.json',
  translations: 'translations.json',
  products: 'products.json',
  orders: 'orders.json',
  contacts: 'contacts.json',
  stockAlerts: 'stock-alerts.json',
  notifications: 'notifications.json',
  deliveryExceptions: 'delivery-exceptions.json',
  integrations: 'integrations.json',
  importJobs: 'imports.json',
  stockMovements: 'stock-movements.json',
  auditLogs: 'audit-logs.json',
  deviceTokens: 'device-tokens.json',
  pushOutbox: 'push-outbox.json',
  paymentMethods: 'payment-methods.json',
  billingEvents: 'billing-events.json',
  promotions: 'promotions.json',
  debugReports: 'debug-reports.json',
  appBanners: 'app-banners.json',
  returns: 'returns.json'
};
const LIST_KEYS = Object.keys(DATA_FILES).filter(k => k !== 'meta');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

const DAY_NAMES = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const ORDER_STATUSES = ['submitted','approved','picking','prepared','supplied','cancelled'];
const LOCKED_STATUSES = new Set(['approved','picking','prepared','supplied','cancelled']);
const APP_LANGS = ['he','en','ar','ru'];
function isSpecialDeliveryType(t){ return /מבצע|החזר|השלמ|חריג|promo|return|special/i.test(String(t?.title||t?.id||'')) || t?.specialOnly === true || t?.kind === 'special'; }
function visibleOrderTypes(db){ return (db.deliveryTypes || []).filter(t => t.active !== false && !isSpecialDeliveryType(t)); }
function orderedCategories(db){ const cats=[...(db.categories||[])]; const meta=db.meta||{}; if(meta.categorySortMode==='manual' && Array.isArray(meta.categoryOrder)){ const order=new Map(meta.categoryOrder.map((c,i)=>[c,i])); return cats.sort((a,b)=>(order.has(a)?order.get(a):9999)-(order.has(b)?order.get(b):9999)||String(a).localeCompare(String(b),'he')); } if(meta.categorySortMode==='alpha') return cats.sort((a,b)=>String(a).localeCompare(String(b),'he')); return cats; }

const PERMISSIONS = [
  'dashboard.view','networks.manage','branches.manage','products.manage','orders.view','orders.create','orders.edit','orders.status','orders.pack','stats.view','contacts.manage','delivery.manage','users.manage','integrations.manage','imports.manage'
];
const PERMISSION_LABELS = {
  'dashboard.view':'דשבורד','networks.manage':'ניהול רשתות','branches.manage':'ניהול סניפים','products.manage':'מוצרים וקטלוג','orders.view':'צפייה בהזמנות','orders.create':'יצירת הזמנות','orders.edit':'עריכת הזמנות פתוחות','orders.status':'שינוי סטטוס','orders.pack':'דיווח אריזה','stats.view':'סטטיסטיקות','contacts.manage':'פניות','delivery.manage':'מועדי אספקה','users.manage':'ניהול עובדים','integrations.manage':'ממשקים','imports.manage':'ייבוא נתונים'
};
const ROLE_PRESETS = {
  owner: PERMISSIONS,
  manager: PERMISSIONS.filter(p => !['users.manage'].includes(p)),
  clerk: ['dashboard.view','orders.view','orders.create','orders.edit','orders.status','contacts.manage'],
  packer: ['dashboard.view','orders.view','orders.pack'],
  supervisor: ['dashboard.view','orders.view','stats.view','contacts.manage'],
  custom: []
};
const ROLE_LABELS = {
  owner:'מנהל ראשי', manager:'מנהל תפעול', clerk:'פקיד הזמנות', packer:'אורז / מחסן', supervisor:'מפקח', custom:'מותאם אישית'
};

function nowIso(){ return new Date().toISOString(); }
function sha256(value){ return crypto.createHash('sha256').update(String(value)).digest('hex'); }
function hashCode(value){ return sha256(`${CODE_PEPPER}:${String(value || '').trim()}`); }
function tokenHash(token){ return sha256(`token:${String(token || '')}`); }
function passwordRecord(password){ const salt = crypto.randomBytes(16).toString('hex'); return { salt, hash: sha256(`${salt}:${String(password || '')}`) }; }
function verifyPassword(password, record){ return !!record && sha256(`${record.salt}:${String(password || '')}`) === record.hash; }
function passwordAgeBase(entity){ return entity?.passwordChangedAt || entity?.createdAt || entity?.updatedAt || nowIso(); }
function passwordExpired(entity){ const base = new Date(passwordAgeBase(entity)).getTime(); return Number.isFinite(base) && Date.now() - base >= PASSWORD_ROTATION_MS; }
function passwordReuseError(entity, newPassword){
  if(verifyPassword(newPassword, entity?.password)) return 'אי אפשר להשתמש בסיסמה הנוכחית שוב';
  for(const old of (entity?.passwordHistory || [])) if(verifyPassword(newPassword, old)) return 'אי אפשר להשתמש בסיסמה שכבר הייתה בשימוש';
  return '';
}
function setPermanentPassword(entity, newPassword){
  const reuse = passwordReuseError(entity, newPassword);
  if(reuse) throw new Error(reuse);
  const history = Array.isArray(entity.passwordHistory) ? entity.passwordHistory : [];
  if(entity.password) history.unshift(entity.password);
  entity.passwordHistory = history.slice(0, 8);
  entity.password = passwordRecord(newPassword);
  entity.mustChangePassword = false;
  entity.passwordChangedAt = nowIso();
  entity.updatedAt = nowIso();
}
function makeId(prefix){ return `${prefix}-${new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`; }
function money(n){ return Number(n || 0).toLocaleString('he-IL', { style:'currency', currency:'ILS', maximumFractionDigits:0 }); }
function numberValue(v, fallback=0){ const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function boolValue(v, fallback=false){ if (v === true || v === 'true' || v === 'on' || v === '1' || v === 1) return true; if (v === false || v === 'false' || v === '0' || v === 0) return false; return fallback; }
function parseList(value){ if (Array.isArray(value)) return value.map(String).map(s=>s.trim()).filter(Boolean); if (value === undefined || value === null) return []; return String(value).split(',').map(s=>s.trim()).filter(Boolean); }
function unique(values){ return [...new Set(parseList(values))]; }
function sanitizeText(value){ return String(value || '').trim(); }
function dateOnly(value){ if (!value) return ''; return String(value).slice(0,10); }
function addDays(date, days){ const copy = new Date(date.getTime()); copy.setDate(copy.getDate() + Number(days || 0)); return copy; }
function isoDate(d){ return d.toISOString().slice(0,10); }
function makeOrderNumber(){ const d = new Date(); return `ORD-${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(1000 + Math.random()*9000)}`; }
function secretMeta(value){ const text = String(value || '').trim(); return { hash: hashCode(text), last2: text.slice(-2), length: text.length }; }
function maskSecret(last2='', length=0){ const len = Math.max(Number(length || 0), 2); return `${'•'.repeat(Math.max(0, len - 2))}${last2 || '**'}`; }

function generateSecurePassword(length=14){
  const lower='abcdefghijkmnopqrstuvwxyz'; const upper='ABCDEFGHJKLMNPQRSTUVWXYZ'; const digits='23456789'; const symbols='!@#$%^&*?'; const all=lower+upper+digits+symbols;
  const pick = chars => chars[crypto.randomInt(0, chars.length)];
  const chars=[pick(lower), pick(upper), pick(digits), pick(symbols)];
  while(chars.length < length) chars.push(pick(all));
  for(let i=chars.length-1;i>0;i--){ const j=crypto.randomInt(0,i+1); [chars[i],chars[j]]=[chars[j],chars[i]]; }
  return chars.join('');
}
function passwordPolicyError(password){ const s=String(password||''); if(s.length<10) return 'הסיסמה חייבת לכלול לפחות 10 תווים'; if(!/[A-Z]/.test(s)) return 'הסיסמה חייבת לכלול אות גדולה באנגלית'; if(!/[a-z]/.test(s)) return 'הסיסמה חייבת לכלול אות קטנה באנגלית'; if(!/[0-9]/.test(s)) return 'הסיסמה חייבת לכלול ספרה'; if(!/[!@#$%^&*?._\-]/.test(s)) return 'הסיסמה חייבת לכלול סימן מיוחד'; return ''; }
function assertPasswordPolicy(password){ const e=passwordPolicyError(password); if(e) throw new Error(e); }
function resetCodeRecord(code){ return { hash: sha256(`reset:${String(code || '').trim()}`), expiresAt: new Date(Date.now() + 60*60*1000).toISOString() }; }
function verifyResetCode(code, rec){ return !!rec && new Date(rec.expiresAt).getTime() >= Date.now() && sha256(`reset:${String(code || '').trim()}`) === rec.hash; }

function dataPath(key){ return path.join(DATA_DIR, DATA_FILES[key]); }
function readJson(file, fallback){ try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return fallback; } }
function writeJson(file, value){ fs.mkdirSync(path.dirname(file), { recursive:true }); const tmp = `${file}.tmp`; fs.writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8'); fs.renameSync(tmp, file); }
function readDB(){ const db={ meta: readJson(dataPath('meta'), {}) }; for(const key of LIST_KEYS) db[key] = readJson(dataPath(key), []); return migrateDB(db); }
function writeDB(db){ fs.mkdirSync(DATA_DIR, { recursive:true }); writeJson(dataPath('meta'), db.meta || {}); for(const key of LIST_KEYS) writeJson(dataPath(key), Array.isArray(db[key]) ? db[key] : []); }

function defaultImage(label='OP', accent='#2563eb', bg='#eff6ff'){
  const safe = encodeURIComponent(String(label || 'OP').slice(0,4));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#fff"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-opacity=".17"/></filter></defs><rect width="640" height="480" rx="46" fill="url(#g)"/><circle cx="520" cy="90" r="88" fill="${accent}" opacity=".14"/><circle cx="118" cy="390" r="118" fill="${accent}" opacity=".1"/><g filter="url(#s)"><rect x="175" y="115" width="290" height="260" rx="42" fill="#fff"/><rect x="213" y="155" width="214" height="150" rx="30" fill="${accent}" opacity=".12"/><text x="320" y="254" text-anchor="middle" font-family="Arial,sans-serif" font-size="76" font-weight="900" fill="${accent}">${safe}</text><rect x="230" y="330" width="180" height="14" rx="7" fill="${accent}" opacity=".38"/></g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
function normalizeImageUrl(value, fallbackLabel='OP'){ const s=String(value || '').trim(); if(s.startsWith('data:image/') || s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s; return defaultImage(fallbackLabel); }

function defaultTranslationsRows(){
  const rows=[]; const add=(he,en,ar,ru)=> rows.push({ he, en, ar, ru });
  const pairs = [
    ['התחברות','Login','تسجيل الدخول','Вход'],['קוד רשת','Network code','رمز الشبكة','Код сети'],['קוד סניף','Branch code','رمز الفرع','Код филиала'],['סיסמה','Password','كلمة المرور','Пароль'],['כניסה','Sign in','دخول','Войти'],['שכחתי סיסמה','Forgot password','نسيت كلمة المرور','Забыли пароль'],['בחירת סוג הזמנה','Choose order type','اختر نوع الطلب','Выберите тип заказа'],['בחירת תאריך אספקה','Choose delivery date','اختر تاريخ التوريد','Выберите дату поставки'],['המשך לקטלוג','Continue to catalog','المتابعة إلى الكتالوج','Перейти к каталогу'],['קטלוג','Catalog','الكتالوج','Каталог'],['הכל','All','الكل','Все'],['חיפוש מוצר או ברקוד','Search product or barcode','ابحث عن منتج أو باركود','Поиск товара или штрихкода'],['סריקה','Scan','مسح','Сканировать'],['סל','Cart','السلة','Корзина'],['היסטוריה','History','السجل','История'],['הוספה','Add','إضافة','Добавить'],['כמות','Quantity','الكمية','Количество'],['קרטונים','Cartons','كراتين','Короба'],['יחידות בקרטון','Units per carton','وحدات في الكرتون','Ед. в коробе'],['כשרות','Kosher','كوشير','Кашрут'],['מלאי','Stock','المخزون','Склад'],['לא במלאי','Out of stock','غير متوفر','Нет в наличии'],['שליחת הזמנה','Submit order','إرسال الطلب','Отправить заказ'],['תאריך אספקה','Delivery date','تاريخ التوريد','Дата поставки'],['סיכום הזמנה','Order summary','ملخص الطلب','Итог заказа'],['מינימום הזמנה','Minimum order','الحد الأدنى للطلب','Минимальный заказ'],['צריך להשלים מינימום','Minimum not reached','لم يتم الوصول للحد الأدنى','Минимум не достигнут'],['הזמנות','Orders','الطلبات','Заказы'],['התראות','Notifications','الإشعارات','Уведомления'],['הגדרות','Settings','الإعدادات','Настройки'],['שפה','Language','اللغة','Язык'],['עברית','Hebrew','العبرية','Иврит'],['אנגלית','English','الإنجليزية','Английский'],['ערבית','Arabic','العربية','Арабский'],['רוסית','Russian','الروسية','Русский'],['חדש','New','جديد','Новинка'],['מבצע','Sale','عرض','Акция'],['חזר למלאי','Back in stock','عاد للمخزون','Снова в наличии'],['הולך חזק','Trending','رائج','Популярно'],['מוזמן קבוע','Regularly ordered','يُطلب عادة','Часто заказывают'],['הזמנה יבשה','Dry order','طلب جاف','Сухой заказ'],['הזמנה בקירור','Cold order','طلب مبرد','Охлажденный заказ'],['הזמנת מבצעים','Promotion order','طلب عروض','Заказ акций'],['החזרות והשלמות','Returns and completions','إرجاعات واستكمالات','Возвраты и дополнения'],['נשלחה - פתוחה לעריכה','Submitted - editable','تم الإرسال - قابل للتعديل','Отправлен - можно редактировать'],['אושרה לטיפול','Approved','تمت الموافقة','Подтвержден'],['בליקוט','Picking','قيد التجهيز','Сборка'],['משטח מוכן לאספקה','Prepared for delivery','جاهز للتوريد','Готово к доставке'],['סופקה','Delivered','تم التوريد','Доставлено'],['בוטלה','Cancelled','ملغاة','Отменено']
  ];
  pairs.forEach(p=>add(...p));
  return rows;
}
const FALLBACK_TRANSLATIONS = {
  'קפה פרימיום 200 גרם': ['Premium coffee 200g','قهوة فاخرة 200 غرام','Премиальный кофе 200 г'],
  'תה ירוק נענע 25 שקיקים': ['Green mint tea 25 bags','شاي أخضر بالنعناع 25 كيس','Зеленый чай с мятой 25 пакетиков'],
  'שוקולד חלב 100 גרם': ['Milk chocolate 100g','شوكولاتة حليب 100 غرام','Молочный шоколад 100 г'],
  'בייגלה קלאסי 400 גרם': ['Classic pretzel 400g','بريتزل كلاسيكي 400 غرام','Классические крендели 400 г'],
  'טחינה גולמית 500 גרם': ['Raw tahini 500g','طحينة خام 500 غرام','Тахини 500 г'],
  'רוטב עגבניות בזיליקום': ['Tomato basil sauce','صلصة طماطم بالريحان','Томатный соус с базиликом'],
  'נוזל כלים לימון 750 מ״ל': ['Lemon dish soap 750ml','سائل جلي ليمون 750 مل','Средство для посуды лимон 750 мл'],
  'מטליות לחות 3 יחידות': ['Wet wipes 3 pack','مناديل رطبة 3 وحدات','Влажные салфетки 3 шт'],
  'קרקרים כוסמין מלא': ['Whole spelt crackers','مقرمشات حنطة كاملة','Крекеры из спельты'],
  'חטיף אנרגיה תמרים': ['Date energy bar','لوح طاقة بالتمر','Энергетический батончик с финиками'],
  'מים מינרליים שישייה': ['Mineral water six pack','مياه معدنية عبوة ستة','Минеральная вода 6 шт'],
  'מיץ תפוזים טבעי 1 ליטר': ['Natural orange juice 1L','عصير برتقال طبيعي 1 لتر','Натуральный апельсиновый сок 1 л'],
  'משקאות חמים': ['Hot drinks','مشروبات ساخنة','Горячие напитки'], 'חטיפים ומתוקים':['Snacks and sweets','وجبات خفيفة وحلويات','Снеки и сладости'], 'מזווה':['Pantry','مخزن','Бакалея'], 'ניקיון':['Cleaning','تنظيف','Уборка'], 'בריאות':['Health','صحة','Здоровье'], 'משקאות':['Drinks','مشروبات','Напитки'], 'קירור':['Chilled','مبرد','Охлажденное'], 'כללי':['General','عام','Общее'], 'קפה':['Coffee','قهوة','Кофе'], 'תה':['Tea','شاي','Чай'], 'שוקולד ומתוקים':['Chocolate and sweets','شوكولاتة وحلويات','Шоколад и сладости'], 'מלוחים':['Savory snacks','موالح','Соленые снеки'], 'ממרחים':['Spreads','مأكولات قابلة للدهن','Пасты'], 'רטבים':['Sauces','صلصات','Соусы'], 'כלים וחומרים':['Tools and detergents','أدوات ومواد','Инструменты и средства'], 'מטליות ונייר':['Wipes and paper','مناديل وورق','Салфетки и бумага'], 'דגנים ובריאות':['Grains and health','حبوب وصحة','Злаки и здоровье'], 'מים':['Water','مياه','Вода'], 'מיצים':['Juices','عصائر','Соки']
};
function mergeTranslations(db){
  const existing = new Map((db.translations || []).map(r => [String(r.he || '').trim(), r]));
  for(const row of defaultTranslationsRows()){ const he=row.he; existing.set(he, { ...(existing.get(he)||{}), ...row }); }
  const dynamic = [];
  for(const p of db.products || []) dynamic.push(p.name, p.category, p.subcategory, ...(p.tags || []), ...(p.kosherTypes || []));
  for(const t of db.deliveryTypes || []) dynamic.push(t.title, t.desc);
  for(const c of db.categories || []) dynamic.push(c);
  for(const s of db.subcategories || []) dynamic.push(s.category, ...(s.subcategories || []));
  for(const k of db.kosherTypes || []) dynamic.push(k);
  for(const he of dynamic.filter(Boolean)){
    const key = String(he).trim(); if(!key) continue;
    const fallback = FALLBACK_TRANSLATIONS[key];
    if(!existing.has(key)) existing.set(key, { he:key, en:fallback?.[0] || key, ar:fallback?.[1] || key, ru:fallback?.[2] || key });
    else {
      const row=existing.get(key); if(!row.en) row.en=fallback?.[0] || key; if(!row.ar) row.ar=fallback?.[1] || key; if(!row.ru) row.ru=fallback?.[2] || key;
    }
  }
  db.translations = [...existing.values()].map(row => ({ he:String(row.he||''), en:String(row.en||row.he||''), ar:String(row.ar||row.he||''), ru:String(row.ru||row.he||'') })).filter(r=>r.he);
}
function translationsMap(db){ const map={}; for(const row of db.translations || []) { const he=String(row.he||'').trim(); if(!he) continue; map[he] = { he, en:row.en||he, ar:row.ar||he, ru:row.ru||he }; } return map; }

function baseKosherTypes(){ return [
  'לא רלוונטי','רבנות מקומית','רבנות מהדרין','בד״ץ העדה החרדית','בד״ץ בית יוסף','בד״ץ רובין','בד״ץ לנדא','בד״ץ שארית ישראל','בד״ץ חתם סופר','בד״ץ מחזיקי הדת','בד״ץ יורה דעה','OU Orthodox Union','OK Kosher','Star-K','Kof-K','CRC Chicago','KLBD London Beth Din','MK Canada','Kashrut Australia','חלב ישראל','אבקת חלב נוכרי','פרווה','חלבי','בשרי'
]; }
function defaultIntegrations(){ return [
  { id:'comax', name:'Comax / קומקס', type:'inventory', active:false, mode:'manual', apiBaseUrl:'', lastSyncAt:'', status:'not_configured', notes:'חיבור API/קבצי יבוא למלאי, מוצרים והזמנות.' },
  { id:'priority', name:'Priority', type:'erp', active:false, mode:'manual', apiBaseUrl:'', lastSyncAt:'', status:'not_configured', notes:'חיבור ERP למוצרים, לקוחות, מלאי והזמנות.' },
  { id:'hashavshevet', name:'Hashavshevet / חשבשבת', type:'erp', active:false, mode:'manual', apiBaseUrl:'', lastSyncAt:'', status:'not_configured', notes:'חיבור חשבונאי/מלאי לפי יצוא ויבוא.' },
  { id:'sap', name:'SAP Business One', type:'erp', active:false, mode:'manual', apiBaseUrl:'', lastSyncAt:'', status:'not_configured', notes:'חיבור B1 Service Layer.' },
  { id:'custom-api', name:'Custom API', type:'custom', active:false, mode:'manual', apiBaseUrl:'', lastSyncAt:'', status:'not_configured', notes:'Webhook/API מותאם לחברה.' }
]; }

function migrateDB(db){
  db.meta = { ...(db.meta || {}), version: APP_VERSION, updatedAt: nowIso() };
  for(const key of LIST_KEYS) if(!Array.isArray(db[key])) db[key] = [];
  if(!db.integrations.length) db.integrations = defaultIntegrations();
  if(!db.paymentMethods.length) db.paymentMethods = [
    { id:'billing-monthly-network', scope:'network', name:'חיוב חודשי לפי רשת', provider:'monthly_invoice', active:false, notes:'סגירת חשבון חודשית לרשת' },
    { id:'cardcom', scope:'branch', name:'Cardcom', provider:'cardcom', active:false, notes:'חיוב אשראי לאחר אישור/אספקה' },
    { id:'meshulam', scope:'branch', name:'Meshulam', provider:'meshulam', active:false, notes:'קישור תשלום / הוראת קבע' },
    { id:'tranzila', scope:'branch', name:'Tranzila', provider:'tranzila', active:false, notes:'מסוף תשלום וחיוב אוטומטי' },
    { id:'custom-billing-api', scope:'custom', name:'Custom Billing API', provider:'custom_api', active:false, notes:'חיבור מותאם לספק חיוב/חשבוניות' }
  ];
  if(!db.billingEvents.length) db.billingEvents = [];
  if(!Array.isArray(db.returns)) db.returns = [];
  if(!db.kosherTypes.length) db.kosherTypes = baseKosherTypes();
  db.kosherTypes = [...new Set([...db.kosherTypes, ...baseKosherTypes()])];
  if(!db.categories.length) db.categories = [...new Set((db.products || []).map(p=>p.category).filter(Boolean))];
  if(!db.subcategories.length){
    const byCat={}; for(const p of db.products || []) if(p.category && p.subcategory){ byCat[p.category] = byCat[p.category] || new Set(); byCat[p.category].add(p.subcategory); }
    db.subcategories = Object.entries(byCat).map(([category,set]) => ({ category, subcategories:[...set] }));
  }
  const typeIds = (db.deliveryTypes || []).map(t=>t.id);
  if(!typeIds.length){ db.deliveryTypes = [{id:'regular',title:'הזמנה יבשה',desc:'מוצרי מדף ויבש',active:true,sort:1,kind:'dry',imageUrl:defaultImage('יבש')},{id:'cold',title:'הזמנה בקירור',desc:'מוצרים בקירור',active:true,sort:2,kind:'cold',imageUrl:defaultImage('קר')}]; }
  for(const t of db.deliveryTypes){ t.title = t.title || t.name || 'סוג הזמנה'; t.desc = t.desc || ''; t.kind = t.kind || (String(t.title).includes('קירור') ? 'cold' : 'dry'); t.imageUrl = normalizeImageUrl(t.imageUrl, t.title); t.active = t.active !== false; }
  const activeIds = db.deliveryTypes.filter(t=>t.active!==false).map(t=>t.id);
  const firstType = activeIds[0] || db.deliveryTypes[0]?.id || 'regular';
  for(const a of db.admins || []){
    if(['owner','manager'].includes(a.role)){ const base=ROLE_PRESETS[a.role] || []; a.permissions=[...new Set([...(a.permissions||[]), ...base])]; }
    a.allowedIps = parseList(a.allowedIps);
    if(!a.passwordChangedAt) a.passwordChangedAt = a.createdAt || db.meta?.createdAt || nowIso();
    if(!Array.isArray(a.passwordHistory)) a.passwordHistory = [];
  }
  for(const n of db.networks || []){ n.minOrderType = n.minOrderType || 'money'; n.minOrderValue = numberValue(n.minOrderValue, 0); n.minOrderCartons = numberValue(n.minOrderCartons, 0); n.active = n.active !== false; }
  for(const b of db.branches || []){
    b.active = b.active !== false;
    if(!b.passwordChangedAt) b.passwordChangedAt = b.createdAt || db.meta?.createdAt || nowIso();
    if(!Array.isArray(b.passwordHistory)) b.passwordHistory = [];
    b.deliverySchedule = b.deliverySchedule || {};
    for(const id of (db.deliveryTypes || []).map(t=>t.id)) if(!Array.isArray(b.deliverySchedule[id])) b.deliverySchedule[id] = Array.isArray(b.deliveryDays) ? b.deliveryDays.filter(d=>Number(d)>=0 && Number(d)<=4) : [2,4];
    b.minOrderType = b.minOrderType && b.minOrderType !== 'inherit' ? b.minOrderType : (Number(b.minOrderValue || 0) > 0 ? 'money' : 'inherit');
    b.minOrderValue = numberValue(b.minOrderValue, 0);
    b.minOrderCartons = numberValue(b.minOrderCartons, 0);
  }
  for(const p of db.products || []){
    p.active = p.active !== false;
    p.imageUrl = normalizeImageUrl(p.imageUrl, p.name);
    p.category = p.category || 'כללי';
    if(!db.categories.includes(p.category)) db.categories.push(p.category);
    if(!p.subcategory) p.subcategory = guessSubcategory(p);
    ensureSubcategory(db, p.category, p.subcategory);
    p.deliveryTypeIds = unique(p.deliveryTypeIds && p.deliveryTypeIds.length ? p.deliveryTypeIds : inferDeliveryTypeIds(db, p)).filter(id => (db.deliveryTypes || []).some(t=>t.id===id));
    if(!p.deliveryTypeIds.length) p.deliveryTypeIds = [firstType];
    p.manualTags = Array.isArray(p.manualTags) ? p.manualTags : (Array.isArray(p.tags) ? p.tags.filter(tag => !['חדש','הולך חזק','מוזמן קבוע','מוזמן בדרך כלל','אזל זמנית','חזר למלאי'].includes(tag)) : []);
    p.autoTags = p.autoTags !== false;
    p.tags = mergedTags(p);
    p.kosherTypes = (Array.isArray(p.kosherTypes) && p.kosherTypes.length ? p.kosherTypes : unique([p.kosher])).filter(k=>!['none','cholov-yisrael','milk-powder','לא רלוונטי / פרווה'].includes(k));
    p.dairyType = p.dairyType || (String(p.name + ' ' + p.kosher + ' ' + p.kosherTypes.join(' ')).includes('אבקת חלב נוכרי') ? 'אבקת חלב נוכרי' : (String(p.name + ' ' + p.kosher + ' ' + p.kosherTypes.join(' ')).includes('חלב') ? 'חלב ישראל' : ''));
    if(['none','cholov-yisrael','milk-powder','לא רלוונטי / פרווה'].includes(p.dairyType)) p.dairyType='';
    if(p.dairyType==='cholov-yisrael') p.dairyType='חלב ישראל';
    if(p.dairyType==='milk-powder') p.dairyType='אבקת חלב נוכרי';
    if(p.dairyType && !p.kosherTypes.includes(p.dairyType)) p.kosherTypes.push(p.dairyType);
    p.pricePerCarton = numberValue(p.pricePerCarton || p.price, 0);
    p.stockQty = numberValue(p.stockQty, 0);
    p.stockMode = p.stockMode || 'auto';
    p.inStock = p.stockQty > 0 || boolValue(p.inStock, false);
    p.blockedNetworkIds = unique(p.blockedNetworkIds);
    p.blockedBranchIds = unique(p.blockedBranchIds);
  }
  for(const cat of db.categories) if(!(db.categoryDeliveryRules || []).some(r=>r.category===cat)) db.categoryDeliveryRules.push({ category:cat, deliveryTypeIds: inferCategoryTypeIds(db, cat), createdAt: nowIso() });
  for(const o of db.orders || []){
    const branch = db.branches.find(b=>b.id===o.branchId); const network = db.networks.find(n=>n.id===o.networkId) || db.networks.find(n=>n.id===branch?.networkId);
    o.networkName = network?.name || o.networkName || '';
    o.branchName = branch?.name || o.branchName || '';
    o.branchCity = branch?.city || o.branchCity || '';
    o.status = o.status || 'submitted'; o.statusText = mapStatus(o.status);
    for(const item of o.items || []){ item.packedQty = numberValue(item.packedQty ?? item.suppliedQty ?? item.quantity, item.quantity); item.suppliedQty = item.packedQty; item.missingQty = Math.max(0, numberValue(item.quantity,0) - numberValue(item.packedQty,0)); item.packingNote = item.packingNote || item.missingReason || ''; const p=db.products.find(x=>x.id===item.productId); if(p){ item.category = item.category || p.category; item.subcategory = item.subcategory || p.subcategory; item.pricePerCarton = numberValue(item.pricePerCarton || p.pricePerCarton || p.price, 0); item.name = item.name || p.name; item.barcode = item.barcode || p.barcode; }}
    o.totals = orderTotals(o.items || []);
    o.lockedForEditing = LOCKED_STATUSES.has(o.status);
  }
  mergeTranslations(db);
  return db;
}
function guessSubcategory(p){ const name=String(p.name||''); if(name.includes('קפה')) return 'קפה'; if(name.includes('תה')) return 'תה'; if(name.includes('שוקולד')) return 'שוקולד ומתוקים'; if(name.includes('בייגלה')) return 'מלוחים'; if(name.includes('טחינה')) return 'ממרחים'; if(name.includes('רוטב')) return 'רטבים'; if(name.includes('מטליות')) return 'מטליות ונייר'; if(name.includes('נוזל')) return 'כלים וחומרים'; if(name.includes('מים')) return 'מים'; if(name.includes('מיץ')) return 'מיצים'; return 'כללי'; }
function ensureSubcategory(db, category, sub){ if(!category || !sub) return; let row=db.subcategories.find(r=>r.category===category); if(!row){ row={category, subcategories:[]}; db.subcategories.push(row); } if(!row.subcategories.includes(sub)) row.subcategories.push(sub); }
function inferDeliveryTypeIds(db,p){ const cold=(db.deliveryTypes||[]).find(t=>t.kind==='cold')?.id || 'cold'; const dry=(db.deliveryTypes||[]).find(t=>t.kind==='dry')?.id || 'regular'; const label=`${p.name||''} ${p.category||''}`; return /קירור|חלב|מיץ|יוגורט|גבינה/.test(label) ? [cold] : [dry]; }
function inferCategoryTypeIds(db, cat){ const ids=[...new Set((db.products||[]).filter(p=>p.category===cat).flatMap(p=>p.deliveryTypeIds||[]))]; return ids.length ? ids : [db.deliveryTypes[0]?.id || 'regular']; }
function autoTags(product){ const tags=[]; if(product.newItem) tags.push('חדש'); if(product.trending) tags.push('הולך חזק'); if(product.usual) tags.push('מוזמן קבוע'); if(Number(product.stockQty||0)<=0) tags.push('אזל זמנית'); if(product.wasOutOfStock && Number(product.stockQty||0)>0) tags.push('חזר למלאי'); return tags; }
function mergedTags(product){ return [...new Set([...(product.manualTags||[]), ...(product.autoTags===false?[]:autoTags(product))].filter(Boolean))]; }

function sendJson(res, status, payload){ res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', ...corsHeaders() }); res.end(JSON.stringify(payload)); }
function corsHeaders(){ return { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'GET,POST,PATCH,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers':'Content-Type, Authorization' }; }
function badRequest(res, message){ return sendJson(res, 400, { error:'bad_request', message }); }
function unauthorized(res){ return sendJson(res, 401, { error:'unauthorized', message:'פרטי ההתחברות לא תקינים' }); }
function forbidden(res, message='אין הרשאה לפעולה הזו'){ return sendJson(res, 403, { error:'forbidden', message }); }
function notFound(res){ return sendJson(res, 404, { error:'not_found', message:'לא נמצא' }); }
async function readBody(req){ return new Promise((resolve,reject)=>{ let body=''; req.on('data', chunk=>{ body+=chunk; if(body.length>20*1024*1024) reject(new Error('payload_too_large')); }); req.on('end',()=>{ if(!body) return resolve({}); try { resolve(JSON.parse(body)); } catch { reject(new Error('invalid_json')); } }); req.on('error', reject); }); }
function clientIp(req){ return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].replace('::ffff:','').trim(); }
function userAgent(req){ return String(req.headers['user-agent'] || '').slice(0,300); }
function ipAllowed(admin, req){ const allowed=parseList(admin.allowedIps); if(!allowed.length) return true; const ip=clientIp(req); return allowed.includes(ip); }
function createSession(db, kind, payload, req){ const token=crypto.randomBytes(32).toString('hex'); const now=Date.now(); const hours=kind==='store'?STORE_SESSION_HOURS:SESSION_HOURS; const sess={ id:makeId('sess'), tokenHash:tokenHash(token), kind, payload, createdAt:new Date(now).toISOString(), lastSeenAt:new Date(now).toISOString(), expiresAt:new Date(now+hours*3600*1000).toISOString(), ip:clientIp(req), userAgent:userAgent(req) }; db.sessions.push(sess); if(kind==='admin'){ const admin=db.admins.find(a=>a.id===payload.adminId); if(admin){ admin.lastLoginAt=sess.createdAt; admin.lastSeenAt=sess.lastSeenAt; admin.currentSessionId=sess.id; admin.lastIp=sess.ip; admin.lastUserAgent=sess.userAgent; admin.loginCount=numberValue(admin.loginCount,0)+1; }} writeDB(db); return token; }
function authToken(req){ const h=String(req.headers.authorization||''); return h.startsWith('Bearer ')?h.slice(7):''; }
function getSession(req, db, kind){ const hash=tokenHash(authToken(req)); const sess=db.sessions.find(s=>s.tokenHash===hash && s.kind===kind && new Date(s.expiresAt).getTime()>Date.now()); if(!sess) return null; sess.lastSeenAt=nowIso(); if(kind==='admin'){ const admin=db.admins.find(a=>a.id===sess.payload.adminId && a.active!==false); if(!admin) return null; if(passwordExpired(admin)) admin.mustChangePassword = true; admin.lastSeenAt=sess.lastSeenAt; admin.currentSessionId=sess.id; admin.lastIp=sess.ip || admin.lastIp || ''; admin.lastUserAgent=sess.userAgent || admin.lastUserAgent || ''; return { session:sess, admin }; } if(kind==='store'){ const branch=db.branches.find(b=>b.id===sess.payload.branchId && b.active!==false); if(!branch) return null; const network=db.networks.find(n=>n.id===branch.networkId && n.active!==false); if(!network) return null; if(passwordExpired(branch)) branch.mustChangePassword = true; return { session:sess, branch, network }; } return null; }
function adminRoleConfig(){ return { roles:Object.entries(ROLE_LABELS).map(([id,label])=>({ id,label,permissions:ROLE_PRESETS[id] || [] })), permissions:PERMISSIONS.map(id=>({ id, label:PERMISSION_LABELS[id] || id })) }; }
function normalizeAdminPermissions(role, selected){ const base=ROLE_PRESETS[role] || []; const list=role==='custom' ? parseList(selected) : parseList(selected).length ? parseList(selected) : base; return [...new Set(list)].filter(p=>PERMISSIONS.includes(p)); }
function hasPerm(admin, permission){ return (admin.permissions || ROLE_PRESETS[admin.role] || []).includes(permission); }
function requirePerm(res, ctx, perm){ if(!ctx || !hasPerm(ctx.admin,perm)){ forbidden(res); return false; } return true; }
function requireAnyPerm(res, ctx, perms){ if(!ctx || !perms.some(p=>hasPerm(ctx.admin,p))){ forbidden(res); return false; } return true; }
function canAccessNetwork(admin, networkId){ if(!admin) return false; const ns=parseList(admin.assignedNetworkIds); const bs=parseList(admin.assignedBranchIds); if(!ns.length && !bs.length) return true; if(ns.includes(networkId)) return true; return false; }
function canAccessBranch(db, admin, branchId){ if(!admin) return false; const branch=db.branches.find(b=>b.id===branchId); if(!branch) return false; const ns=parseList(admin.assignedNetworkIds); const bs=parseList(admin.assignedBranchIds); if(!ns.length && !bs.length) return true; return bs.includes(branchId) || ns.includes(branch.networkId); }
function scopedBranches(db, admin){ return db.branches.filter(b=>canAccessBranch(db,admin,b.id)); }
function scopedNetworks(db, admin){ const branches=scopedBranches(db,admin); const ids=new Set(branches.map(b=>b.networkId)); return db.networks.filter(n=>canAccessNetwork(admin,n.id) || ids.has(n.id)); }
function scopedOrders(db, admin){ return db.orders.filter(o=>canAccessBranch(db,admin,o.branchId)); }
function scopedContacts(db, admin){ return db.contacts.filter(c=>canAccessBranch(db,admin,c.branchId)); }
function adminView(admin, db){ const expiresOnline=20*60*1000; const online=!!admin.currentSessionId && db.sessions.some(s=>s.id===admin.currentSessionId && new Date(s.expiresAt).getTime()>Date.now() && new Date(s.lastSeenAt||s.createdAt).getTime()>Date.now()-expiresOnline); const session=db.sessions.find(s=>s.id===admin.currentSessionId); return { id:admin.id, name:admin.name, email:admin.email, role:admin.role, roleText:ROLE_LABELS[admin.role]||admin.role, permissions:admin.permissions||ROLE_PRESETS[admin.role]||[], assignedNetworkIds:parseList(admin.assignedNetworkIds), assignedBranchIds:parseList(admin.assignedBranchIds), scopeText:scopeText(db,admin), active:admin.active!==false, allowedIps:parseList(admin.allowedIps), isOnline:online, lastLoginAt:admin.lastLoginAt||'', lastSeenAt:admin.lastSeenAt||'', currentSessionStartedAt:session?.createdAt||'', currentSessionSeconds: session ? Math.max(0, Math.floor((Date.now()-new Date(session.createdAt).getTime())/1000)) : 0, lastIp:admin.lastIp||'', lastUserAgent:admin.lastUserAgent||'', loginCount:numberValue(admin.loginCount,0), mustChangePassword:!!admin.mustChangePassword, passwordChangedAt:admin.passwordChangedAt||'', passwordExpiresAt:new Date(new Date(passwordAgeBase(admin)).getTime()+PASSWORD_ROTATION_MS).toISOString() }; }
function scopeText(db, admin){ const ns=parseList(admin.assignedNetworkIds), bs=parseList(admin.assignedBranchIds); if(!ns.length && !bs.length) return 'כל הרשתות והסניפים'; const parts=[]; if(ns.length) parts.push(`${ns.length} רשתות`); if(bs.length) parts.push(`${bs.length} סניפים`); return parts.join(' · '); }
function networkView(n){ return { ...n, showPricesInApp:n.showPricesInApp!==false, maskedCode:maskSecret(n.accessCodeLast2,n.accessCodeLength), accessCodeHash:undefined }; }
function branchView(db,b){ const network=db.networks.find(n=>n.id===b.networkId); return { ...b, networkName:network?.name||'', maskedCode:maskSecret(b.branchCodeLast2,b.branchCodeLength), branchCodeHash:undefined, password:undefined, passwordReset:undefined }; }
function productPromotionView(db,p,branchId=''){
  const branch=db.branches.find(b=>b.id===branchId);
  const now=new Date();
  const promos=(db.promotions||[]).filter(pr=>pr.active!==false && (!pr.startsAt || new Date(pr.startsAt)<=now) && (!pr.endsAt || new Date(pr.endsAt)>=now));
  return promos.find(pr=>{
    const ns=parseList(pr.networkIds), bs=parseList(pr.branchIds), ps=parseList(pr.productIds), cats=parseList(pr.categories);
    const branchOk = !branch || ((!ns.length || ns.includes(branch.networkId)) && (!bs.length || bs.includes(branch.id)));
    const productOk = (!ps.length && !cats.length) || ps.includes(p.id) || cats.includes(p.category) || cats.includes(p.subcategory);
    return branchOk && productOk;
  });
}
function productView(p){ return { ...p, tags:mergedTags(p), kosher: (p.kosherTypes || []).join(', ') || p.kosher || '', ingredients:sanitizeText(p.ingredients||''), allergens:sanitizeText(p.allergens||'') }; }
function deliveryTypeView(t){ return { ...t, imageUrl:normalizeImageUrl(t.imageUrl,t.title) }; }
function mapStatus(status){ return { submitted:'נשלחה - פתוחה לעריכה', approved:'אושרה לטיפול', picking:'בליקוט', prepared:'משטח מוכן לאספקה', supplied:'סופקה', cancelled:'בוטלה' }[status] || status || ''; }
function orderTotals(items){ const lines=items.length; let cartons=0, units=0, value=0, packedCartons=0, missingCartons=0; for(const it of items){ const q=numberValue(it.quantity,0); const packed=numberValue(it.packedQty ?? it.suppliedQty, q); cartons+=q; packedCartons+=packed; missingCartons+=Math.max(0,q-packed); units+=q*numberValue(it.unitsPerCarton,0); value+=q*numberValue(it.pricePerCarton || it.price || 0,0); } return { lines, cartons, units, value, packedCartons, missingCartons }; }
function orderView(db,o){ const network=db.networks.find(n=>n.id===o.networkId); const branch=db.branches.find(b=>b.id===o.branchId); const type=db.deliveryTypes.find(t=>t.id===o.deliveryTypeId); return { ...o, networkName:network?.name || o.networkName || '', branchName:branch?.name || o.branchName || '', branchCity:branch?.city || o.branchCity || '', deliveryTypeTitle:type?.title || o.deliveryTypeTitle || '', statusText:mapStatus(o.status), lockedForEditing:LOCKED_STATUSES.has(o.status), canEdit:!LOCKED_STATUSES.has(o.status), items:(o.items||[]).map(it=>({ ...it, missingQty:Math.max(0, numberValue(it.quantity)-numberValue(it.packedQty ?? it.suppliedQty, it.quantity)) })), totals:orderTotals(o.items||[]) }; }

function effectiveMinimum(db, branch){ const network=db.networks.find(n=>n.id===branch.networkId); if(branch.minOrderType && branch.minOrderType !== 'inherit'){ return { type:branch.minOrderType, value:numberValue(branch.minOrderValue,0), cartons:numberValue(branch.minOrderCartons,0), source:'branch' }; } return { type:network?.minOrderType || 'money', value:numberValue(network?.minOrderValue,0), cartons:numberValue(network?.minOrderCartons,0), source:'networkFallback' }; }
function productAllowedFor(db, product, branchId, deliveryTypeId=''){ const branch=db.branches.find(b=>b.id===branchId); if(!branch || !product || product.active===false) return false; if(parseList(product.blockedBranchIds).includes(branchId)) return false; if(parseList(product.blockedNetworkIds).includes(branch.networkId)) return false; if(deliveryTypeId && !(product.deliveryTypeIds || []).includes(deliveryTypeId)) return false; return true; }
function isBusinessDayIndex(d){ return Number(d)>=0 && Number(d)<=4; }
function scheduledDays(branch, deliveryTypeId){ const schedule=branch.deliverySchedule || {}; const days=Array.isArray(schedule[deliveryTypeId]) ? schedule[deliveryTypeId] : (Array.isArray(branch.deliveryDays) ? branch.deliveryDays : [2,4]); return [...new Set(days.map(Number).filter(d=>d>=0 && d<=4))]; }
function exceptionApplies(ex, branch, deliveryTypeId, date){ if(ex.active===false) return false; if(ex.date !== date) return false; if(ex.deliveryTypeId && ex.deliveryTypeId !== deliveryTypeId) return false; if(ex.branchId && ex.branchId !== branch.id) return false; if(ex.networkId && ex.networkId !== branch.networkId) return false; return true; }
function replacementApplies(ex, branch, deliveryTypeId, replacementDate){ if(ex.active===false || ex.mode !== 'replace') return false; if(ex.replacementDate !== replacementDate) return false; if(ex.deliveryTypeId && ex.deliveryTypeId !== deliveryTypeId) return false; if(ex.branchId && ex.branchId !== branch.id) return false; if(ex.networkId && ex.networkId !== branch.networkId) return false; return true; }
function addApplies(ex, branch, deliveryTypeId, date){ if(ex.active===false || ex.mode !== 'add') return false; if(ex.date !== date) return false; if(ex.deliveryTypeId && ex.deliveryTypeId !== deliveryTypeId) return false; if(ex.branchId && ex.branchId !== branch.id) return false; if(ex.networkId && ex.networkId !== branch.networkId) return false; return true; }
function canSubmitDate(date){ const today=new Date(); today.setHours(0,0,0,0); const d=new Date(`${date}T12:00:00`); const diff=Math.floor((d-today)/86400000); return diff>=2; }
function isDeliveryDateAllowed(db, branch, deliveryTypeId, date, allowExceptionOverride=true){
  const d=new Date(`${date}T12:00:00`); if(Number.isNaN(d.getTime())) return { ok:false, reason:'תאריך לא תקין' };
  const day=d.getDay(); const exceptions=db.deliveryExceptions || [];
  const direct=exceptions.filter(ex=>exceptionApplies(ex,branch,deliveryTypeId,date));
  if(direct.some(ex=>ex.mode==='cancel' || ex.mode==='replace')) return { ok:false, reason:'מועד האספקה בוטל או הוזז' };
  if(!canSubmitDate(date) && !direct.some(ex=>ex.mode==='add')) return { ok:false, reason:'הזמנה חייבת להישלח לפחות יומיים לפני מועד האספקה' };
  if(direct.some(ex=>ex.mode==='add')) return { ok:true, exception:true };
  if(exceptions.some(ex=>replacementApplies(ex,branch,deliveryTypeId,date))) return { ok:allowExceptionOverride, exception:true };
  if(!isBusinessDayIndex(day)) return { ok:false, reason:'אספקה רגילה אפשרית בימים ראשון עד חמישי בלבד' };
  if(!scheduledDays(branch,deliveryTypeId).includes(day)) return { ok:false, reason:'התאריך לא נמצא בימי האספקה של הסניף לסוג ההזמנה' };
  return { ok:true };
}
function availableDeliveryDates(db, branch, deliveryTypeId, limit=14){ const dates=[]; const seen=new Set(); let date=addDays(new Date(),1); for(let i=0; i<90 && dates.length<limit; i++){ const s=isoDate(date); const res=isDeliveryDateAllowed(db,branch,deliveryTypeId,s,true); if(res.ok && !seen.has(s)){ dates.push({ date:s, label:formatDateHe(s), exception:!!res.exception }); seen.add(s); } date=addDays(date,1); } return dates; }
function formatDateHe(date){ const d=new Date(`${date}T12:00:00`); return `${DAY_NAMES[d.getDay()]} · ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; }
function duplicateOrder(db, branchId, deliveryTypeId, deliveryDate, ignoreId=''){ return db.orders.find(o=>o.id!==ignoreId && o.branchId===branchId && o.deliveryTypeId===deliveryTypeId && o.deliveryDate===deliveryDate && o.status!=='cancelled'); }
function buildOrderItems(db, branchId, deliveryTypeId, items){ const lines=[]; for(const raw of items || []){ const product=db.products.find(p=>p.id===raw.productId); const qty=numberValue(raw.quantity,0); if(!product || qty<=0) continue; if(!productAllowedFor(db,product,branchId,deliveryTypeId)) throw new Error(`המוצר ${product?.name || raw.productId} לא זמין לסוג הזמנה/סניף זה`); lines.push({ productId:product.id, name:product.name, barcode:product.barcode, quantity:qty, packedQty:numberValue(raw.packedQty,qty), suppliedQty:numberValue(raw.packedQty,qty), missingQty:Math.max(0, qty-numberValue(raw.packedQty,qty)), packingNote:raw.packingNote || '', category:product.category, subcategory:product.subcategory, unitsPerCarton:numberValue(product.unitsPerCarton,0), cartonsPerPallet:numberValue(product.cartonsPerPallet,0), pricePerCarton:numberValue(product.pricePerCarton || product.price,0), lineValue:qty*numberValue(product.pricePerCarton || product.price,0) }); }
  if(!lines.length) throw new Error('צריך לפחות מוצר אחד בהזמנה'); return lines; }
function validateMinimum(db, branch, totals){ const min=effectiveMinimum(db,branch); if(min.type==='cartons' && min.cartons>0 && totals.cartons < min.cartons) throw new Error(`מינימום ההזמנה לסניף הוא ${min.cartons} קרטונים`); if((min.type==='money' || !min.type) && min.value>0 && totals.value < min.value) throw new Error(`מינימום ההזמנה לסניף הוא ${money(min.value)}`); return min; }
function applyStockDelta(db, oldItems=[], newItems=[], source='order', orderId=''){ const map=new Map(); for(const it of oldItems) map.set(it.productId, (map.get(it.productId)||0) - numberValue(it.quantity,0)); for(const it of newItems) map.set(it.productId, (map.get(it.productId)||0) + numberValue(it.quantity,0)); for(const [pid,delta] of map){ if(delta===0) continue; const p=db.products.find(x=>x.id===pid); if(!p || p.stockMode==='manual') continue; const before=numberValue(p.stockQty,0); p.stockQty=Math.max(0, before-delta); p.inStock=p.stockQty>0; p.updatedAt=nowIso(); db.stockMovements.push({ id:makeId('stk'), productId:pid, productName:p.name, delta:-delta, before, after:p.stockQty, source, orderId, createdAt:nowIso() }); if(before<=0 && p.stockQty>0) notifyStockBack(db,p); } }
function notifyStockBack(db, product){ for(const alert of db.stockAlerts.filter(a=>a.productId===product.id && a.status!=='sent')){ alert.status='sent'; alert.statusText='נשלחה התראה'; alert.sentAt=nowIso(); db.notifications.push({ id:makeId('note'), type:'stock-back', networkId:alert.networkId, branchId:alert.branchId, productId:product.id, productName:product.name, title:'המוצר חזר למלאי', message:`${product.name} חזר למלאי ואפשר להוסיף אותו להזמנה`, status:'unread', createdAt:nowIso() }); } }
function addOrderNotification(db, order, message){ db.notifications.push({ id:makeId('note'), type:'order', networkId:order.networkId, branchId:order.branchId, orderId:order.id, title:'עדכון הזמנה', message, status:'unread', createdAt:nowIso() }); }

function similarProducts(db, product, branchId, deliveryTypeId=''){
  if(!product) return [];
  const explicit = parseList(product.alternativeProductIds || product.similarProductIds);
  const byExplicit = explicit.map(id => db.products.find(p=>p.id===id)).filter(Boolean);
  const fallback = (db.products || []).filter(p => p.id !== product.id && productAllowedFor(db,p,branchId,deliveryTypeId || (product.deliveryTypeIds||[])[0] || '') && (p.category === product.category || p.subcategory === product.subcategory || (p.tags||[]).some(t => (product.tags||[]).includes(t))));
  return [...new Map([...byExplicit, ...fallback].map(p=>[p.id,p])).values()].slice(0,8).map(productView);
}
function queuePush(db, branchId, title, body, data={}){
  db.pushOutbox = Array.isArray(db.pushOutbox) ? db.pushOutbox : [];
  db.pushOutbox.push({ id:makeId('push'), branchId, title, body, data, status:'pending', createdAt:nowIso() });
}


function productReturnStats(db, productId, branchId=''){
  const rows=(db.returns||[]).filter(r=>String(r.status||'')!=='cancelled' && (!branchId || r.branchId===branchId))
    .flatMap(r=>(r.items||[]).filter(i=>i.productId===productId).map(i=>({ ...i, returnId:r.id, returnNumber:r.returnNumber, date:r.createdAt, status:r.status, statusText:returnStatusText(r.status), approvedUnits:Number(i.approvedUnits ?? i.units ?? 0), units:Number(i.units||0), cartonFraction:Number(i.cartonFraction||0), branchId:r.branchId })));
  const units=rows.reduce((sum,i)=>sum+Number(i.units||0),0);
  const approvedUnits=rows.reduce((sum,i)=>sum+Number(i.approvedUnits||0),0);
  const orderLines=(db.orders||[]).filter(o=>!branchId || o.branchId===branchId).flatMap(o=>(o.items||[]).filter(i=>i.productId===productId));
  const orderedUnits=orderLines.reduce((sum,i)=>sum+Number(i.quantity||0)*Number(i.unitsPerCarton||1),0);
  const rate=orderedUnits>0?units/orderedUnits:0;
  return { count:rows.length, units, approvedUnits, orderedUnits, rate, heavyReturns: rows.length>=3 || rate>=0.15, rows:rows.slice(-20).reverse() };
}
function returnStatusText(status){ return ({submitted:'ממתינה לבדיקה',review:'בבדיקה',approved:'אושרה',partial:'אושרה חלקית',rejected:'נדחתה',cancelled:'בוטלה'})[status] || status || 'ממתינה לבדיקה'; }
function makeReturnNumber(){ const d=new Date(); return `RET-${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`; }
function returnView(db,r){ const branch=db.branches.find(b=>b.id===r.branchId); const network=db.networks.find(n=>n.id===(r.networkId||branch?.networkId)); return { ...r, networkName:network?.name||'', branchName:branch?.name||'', statusText:returnStatusText(r.status), items:(r.items||[]).map(i=>{ const p=db.products.find(x=>x.id===i.productId); return { ...i, productName:i.productName||p?.name||'', barcode:i.barcode||p?.barcode||'', unitsPerCarton:Number(i.unitsPerCarton||p?.unitsPerCarton||1), cartonFraction:Number(i.cartonFraction||0) }; }) }; }
function buildReturnItems(db, rawItems){
  const items=Array.isArray(rawItems)?rawItems:[];
  return items.map(row=>{ const p=db.products.find(x=>x.id===row.productId); if(!p) return null; const units=Math.max(0, Number(row.units||0)); if(!units) return null; const upc=Math.max(1, Number(p.unitsPerCarton||1)); return { productId:p.id, productName:p.name, barcode:p.barcode||'', units, unitsPerCarton:upc, cartonFraction: +(units/upc).toFixed(3), reason:sanitizeText(row.reason), approvedUnits: row.approvedUnits===undefined ? null : Math.max(0,Number(row.approvedUnits||0)), note:sanitizeText(row.note) }; }).filter(Boolean);
}
function publicBootstrap(db, branch, network){ const visibleProducts=db.products.filter(p=>productAllowedFor(db,p,branch.id,'')).map(p=>{ const v=productView(p); const stats=productReturnStats(db,p.id,branch.id); v.returnStats=stats; if(stats.heavyReturns){ v.returnHeavy=true; v.tags=[...new Set([...(v.tags||[]),'מרובה חזרות'])]; } const promo=productPromotionView(db,p,branch.id); if(promo){ v.promotion={ id:promo.id, title:promo.title || 'מבצע', desc:promo.desc || '', icon:'🏷️' }; v.tags=[...new Set([...(v.tags||[]),'מבצע'])]; } return v; }); const types=visibleOrderTypes(db).map(deliveryTypeView); return { version:APP_VERSION, branch:branchView(db,branch), network:networkView(network), showPrices:network?.showPricesInApp!==false, minimum:effectiveMinimum(db,branch), deliveryTypes:types, products:visibleProducts, categories:orderedCategories(db), subcategories:db.subcategories, categoryDeliveryRules:db.categoryDeliveryRules, kosherTypes:db.kosherTypes, translations:translationsMap(db), orders:db.orders.filter(o=>o.branchId===branch.id).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).map(o=>orderView(db,o)), notifications:db.notifications.filter(n=>n.branchId===branch.id && new Date(n.createdAt||0).getTime() > Date.now()-7*24*60*60*1000).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))), appBanners:(db.appBanners||[]).filter(b=>b.active!==false).sort((a,b)=>Number(a.sort||0)-Number(b.sort||0)), returns:(db.returns||[]).filter(r=>r.branchId===branch.id).map(r=>returnView(db,r)).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))) }; }
function adminBootstrap(db, admin){ const branches=scopedBranches(db,admin), branchIds=new Set(branches.map(b=>b.id)); const networks=scopedNetworks(db,admin); return { version:APP_VERSION, me:adminView(admin,db), ...adminRoleConfig(), networks:networks.map(networkView), branches:branches.map(b=>branchView(db,b)), deliveryTypes:db.deliveryTypes.map(deliveryTypeView), products:db.products.map(productView), categories:orderedCategories(db), subcategories:db.subcategories, categoryDeliveryRules:db.categoryDeliveryRules, kosherTypes:db.kosherTypes, orders:db.orders.filter(o=>branchIds.has(o.branchId)).map(o=>orderView(db,o)).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))), contacts:scopedContacts(db,admin), deliveryExceptions:(db.deliveryExceptions||[]).filter(ex=>!ex.branchId || branchIds.has(ex.branchId)).sort((a,b)=>String(a.date).localeCompare(String(b.date))), users: hasPerm(admin,'users.manage') ? db.admins.map(a=>adminView(a,db)) : [], integrations: hasPerm(admin,'integrations.manage') ? db.integrations : [], paymentMethods: hasPerm(admin,'integrations.manage') ? db.paymentMethods : [], billingEvents: hasPerm(admin,'integrations.manage') ? db.billingEvents : [], importJobs: hasPerm(admin,'imports.manage') ? db.importJobs : [], debugReports: hasPerm(admin,'contacts.manage') ? (db.debugReports||[]) : [], returns: hasPerm(admin,'contacts.manage') || hasPerm(admin,'orders.view') ? (db.returns||[]).filter(r=>branchIds.has(r.branchId)).map(r=>returnView(db,r)).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))) : [], promotions:db.promotions||[], translations:translationsMap(db), stats:computeStats(db,admin,{}) }; }

function computeStats(db, admin, filters={}){ const allowed=scopedOrders(db,admin); const from=filters.from||''; const to=filters.to||''; const net=filters.networkId||''; const branch=filters.branchId||''; const product=filters.productId||''; const category=filters.category||''; const subcategory=filters.subcategory||''; const orders=allowed.filter(o=>{ const d=o.deliveryDate || dateOnly(o.createdAt); if(from && d<from) return false; if(to && d>to) return false; if(net && o.networkId!==net) return false; if(branch && o.branchId!==branch) return false; if(product && !(o.items||[]).some(i=>i.productId===product)) return false; if(category && !(o.items||[]).some(i=>i.category===category)) return false; if(subcategory && !(o.items||[]).some(i=>i.subcategory===subcategory)) return false; return o.status!=='cancelled'; }); const acc={ orderCount:orders.length, value:0, cartons:0, units:0, missingCartons:0, byProduct:{}, byCategory:{}, bySubcategory:{}, byNetwork:{}, byBranch:{}, timeline:{} }; for(const o of orders){ const ov=orderView(db,o); acc.value+=ov.totals.value; acc.cartons+=ov.totals.cartons; acc.units+=ov.totals.units; acc.missingCartons+=ov.totals.missingCartons; const month=(o.deliveryDate||dateOnly(o.createdAt)).slice(0,7); acc.timeline[month]=(acc.timeline[month]||0)+ov.totals.value; const n=ov.networkName||o.networkId; const b=ov.branchName||o.branchId; acc.byNetwork[n]=(acc.byNetwork[n]||0)+ov.totals.value; acc.byBranch[b]=(acc.byBranch[b]||0)+ov.totals.value; for(const i of ov.items){ const val=numberValue(i.quantity)*numberValue(i.pricePerCarton||i.price); acc.byProduct[i.name]=(acc.byProduct[i.name]||0)+val; acc.byCategory[i.category||'כללי']=(acc.byCategory[i.category||'כללי']||0)+val; acc.bySubcategory[i.subcategory||'כללי']=(acc.bySubcategory[i.subcategory||'כללי']||0)+val; }} const top=obj=>Object.entries(obj).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,10); return { kpis:{ orders:acc.orderCount, value:acc.value, avg:acc.orderCount?Math.round(acc.value/acc.orderCount):0, cartons:acc.cartons, units:acc.units, missingCartons:acc.missingCartons }, topProducts:top(acc.byProduct), topCategories:top(acc.byCategory), topSubcategories:top(acc.bySubcategory), byNetwork:top(acc.byNetwork), byBranch:top(acc.byBranch), timeline:Object.entries(acc.timeline).map(([month,value])=>({month,value})).sort((a,b)=>a.month.localeCompare(b.month)) }; }
function productHistory(db, productId, branchId, limit=20){ return db.orders.filter(o=>!branchId || o.branchId===branchId).flatMap(o=>(o.items||[]).filter(i=>i.productId===productId).map(i=>({ orderId:o.id, orderNumber:o.orderNumber, date:o.deliveryDate||dateOnly(o.createdAt), status:o.status, statusText:mapStatus(o.status), quantity:numberValue(i.quantity), packedQty:numberValue(i.packedQty ?? i.suppliedQty, i.quantity), missingQty:Math.max(0,numberValue(i.quantity)-numberValue(i.packedQty ?? i.suppliedQty, i.quantity)), branchId:o.branchId, branchName:db.branches.find(b=>b.id===o.branchId)?.name || '', note:i.packingNote || '' }))).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,limit); }

function parseCsv(text){ const rows=[]; const lines=String(text||'').split(/\r?\n/).filter(l=>l.trim()); if(!lines.length) return rows; const headers=lines[0].split(',').map(s=>s.trim()); for(const line of lines.slice(1)){ const cells=line.split(',').map(s=>s.trim()); const row={}; headers.forEach((h,i)=>row[h]=cells[i]||''); rows.push(row); } return rows; }
function importRows(db, entity, rows){ let created=0, updated=0; for(const row of rows){ if(entity==='products'){ const id=row.id || row.barcode || makeId('p'); let p=db.products.find(x=>x.id===id || (row.barcode && x.barcode===row.barcode)); if(!p){ p={ id: id.startsWith('p')?id:makeId('p') }; db.products.push(p); created++; } else updated++; Object.assign(p, { name:row.name||p.name, barcode:row.barcode||p.barcode, category:row.category||p.category||'כללי', subcategory:row.subcategory||p.subcategory||'כללי', unitsPerCarton:numberValue(row.unitsPerCarton,p.unitsPerCarton), cartonsPerPallet:numberValue(row.cartonsPerPallet,p.cartonsPerPallet), pricePerCarton:numberValue(row.pricePerCarton,p.pricePerCarton), stockQty:numberValue(row.stockQty,p.stockQty), active:row.active===undefined?p.active:boolValue(row.active,true) }); p.deliveryTypeIds=parseList(row.deliveryTypeIds).length?parseList(row.deliveryTypeIds):p.deliveryTypeIds; p.kosherTypes=parseList(row.kosherTypes).length?parseList(row.kosherTypes):p.kosherTypes; }
    if(entity==='networks'){ let n=db.networks.find(x=>x.id===row.id || x.name===row.name); if(!n){ n={ id:row.id||makeId('net'), createdAt:nowIso() }; db.networks.push(n); created++; } else updated++; n.name=row.name||n.name; n.active=row.active===undefined?n.active:boolValue(row.active,true); }
    if(entity==='branches'){ let b=db.branches.find(x=>x.id===row.id || (x.name===row.name && x.city===row.city)); if(!b){ const pass=generateSecurePassword(); const code=String(row.branchCode || Math.floor(10+Math.random()*90)); b={ id:row.id||makeId('branch'), password:passwordRecord(pass), branchCodeHash:hashCode(code), branchCodeLast2:code.slice(-2), branchCodeLength:code.length, mustChangePassword:true, createdAt:nowIso() }; db.branches.push(b); created++; } else updated++; b.networkId=row.networkId||b.networkId; b.name=row.name||b.name; b.city=row.city||b.city; b.address=row.address||b.address; b.email=row.email||b.email; b.managerName=row.managerName||b.managerName; b.phone=row.phone||b.phone; b.active=row.active===undefined?b.active:boolValue(row.active,true); }
    if(entity==='employees'){ let a=db.admins.find(x=>x.email===row.email); if(!a){ const pass=generateSecurePassword(); a={ id:makeId('admin'), password:passwordRecord(pass), mustChangePassword:true, createdAt:nowIso() }; db.admins.push(a); created++; } else updated++; a.name=row.name||a.name; a.email=row.email||a.email; a.role=row.role||a.role||'clerk'; a.permissions=normalizeAdminPermissions(a.role, parseList(row.permissions)); a.active=row.active===undefined?a.active:boolValue(row.active,true); }
  }
  return { created, updated };
}

async function handleApi(req,res,pathname){
  const method=req.method; const url=new URL(req.url, `http://${req.headers.host||'localhost'}`); const db=readDB();
  if(method==='GET' && pathname==='/api/diagnostics/connection') return sendJson(res,200,{ ok:true, version:APP_VERSION, host:req.headers.host||'', origin:req.headers.origin||'', userAgent:req.headers['user-agent']||'', time:nowIso() });
    if(method==='GET' && pathname==='/api/health') return sendJson(res,200,{ ok:true, version:APP_VERSION, time:nowIso() });

  if(method==='POST' && (pathname==='/api/auth/login' || pathname==='/api/login' || pathname==='/api/store/login')){ const body=await readBody(req); const network=db.networks.find(n=>n.accessCodeHash===hashCode(body.networkCode) && n.active!==false); if(!network) return unauthorized(res); const branch=db.branches.find(b=>b.networkId===network.id && b.branchCodeHash===hashCode(body.branchCode) && b.active!==false); if(!branch || !verifyPassword(body.password,branch.password)) return unauthorized(res); if(passwordExpired(branch)) branch.mustChangePassword = true; const token=createSession(db,'store',{branchId:branch.id},req); const fresh=readDB(); const b=fresh.branches.find(x=>x.id===branch.id); const n=fresh.networks.find(x=>x.id===network.id); return sendJson(res,200,{ token, passwordChangeRequired:!!b.mustChangePassword, passwordPolicy:{ rotationDays:PASSWORD_ROTATION_DAYS }, bootstrap:b.mustChangePassword?null:publicBootstrap(fresh,b,n) }); }
  if(method==='POST' && pathname==='/api/auth/recover'){ const body=await readBody(req); const network=db.networks.find(n=>n.accessCodeHash===hashCode(body.networkCode) && n.active!==false); const branch=network?db.branches.find(b=>b.networkId===network.id && b.branchCodeHash===hashCode(body.branchCode) && b.active!==false):null; if(!branch) return badRequest(res,'לא נמצא סניף פעיל לפי הפרטים שהוזנו'); if(body.email && String(branch.email||'').toLowerCase()!==String(body.email).trim().toLowerCase()) return badRequest(res,'המייל לא תואם לסניף'); const code=String(crypto.randomInt(100000,999999)); branch.passwordReset=resetCodeRecord(code); writeDB(db); return sendJson(res,200,{ ok:true, demoResetCode:code, message:'קוד שחזור נוצר. בדמו הוא מוצג כאן.' }); }
  if(method==='POST' && pathname==='/api/auth/reset'){ const body=await readBody(req); const network=db.networks.find(n=>n.accessCodeHash===hashCode(body.networkCode)); const branch=network?db.branches.find(b=>b.networkId===network.id && b.branchCodeHash===hashCode(body.branchCode)):null; if(!branch) return badRequest(res,'לא נמצא סניף'); if(!verifyResetCode(body.resetCode, branch.passwordReset)) return badRequest(res,'קוד שחזור לא תקין'); try{ assertPasswordPolicy(body.newPassword); }catch(e){ return badRequest(res,e.message); } try{ setPermanentPassword(branch, body.newPassword); }catch(e){ return badRequest(res,e.message); } delete branch.passwordReset; writeDB(db); return sendJson(res,200,{ ok:true }); }

  if(method==='POST' && pathname==='/api/admin/login'){ const body=await readBody(req); const admin=db.admins.find(a=>String(a.email||'').toLowerCase()===String(body.email||'').trim().toLowerCase() && a.active!==false); if(!admin || !verifyPassword(body.password,admin.password)) return unauthorized(res); if(!ipAllowed(admin,req)) return forbidden(res,'המשתמש מוגבל לכתובת IP אחרת'); if(passwordExpired(admin)) admin.mustChangePassword = true; const token=createSession(db,'admin',{adminId:admin.id},req); const fresh=readDB(); const freshAdmin=fresh.admins.find(a=>a.id===admin.id); return sendJson(res,200,{ token, passwordChangeRequired:!!freshAdmin.mustChangePassword, passwordPolicy:{ rotationDays:PASSWORD_ROTATION_DAYS, session:'sessionStorage' }, admin:adminView(freshAdmin,fresh), ...adminRoleConfig() }); }
  if(method==='POST' && pathname==='/api/admin/recover'){ const body=await readBody(req); const admin=db.admins.find(a=>String(a.email||'').toLowerCase()===String(body.email||'').trim().toLowerCase() && a.active!==false); if(!admin) return badRequest(res,'לא נמצא עובד פעיל'); const code=String(crypto.randomInt(100000,999999)); admin.passwordReset=resetCodeRecord(code); writeDB(db); return sendJson(res,200,{ ok:true, demoResetCode:code, message:'קוד שחזור נוצר. בדמו הוא מוצג כאן.' }); }
  if(method==='POST' && pathname==='/api/admin/reset'){ const body=await readBody(req); const admin=db.admins.find(a=>String(a.email||'').toLowerCase()===String(body.email||'').trim().toLowerCase() && a.active!==false); if(!admin) return badRequest(res,'לא נמצא עובד פעיל'); if(!verifyResetCode(body.resetCode,admin.passwordReset)) return badRequest(res,'קוד שחזור לא תקין'); try{ assertPasswordPolicy(body.newPassword); }catch(e){ return badRequest(res,e.message); } try{ setPermanentPassword(admin, body.newPassword); }catch(e){ return badRequest(res,e.message); } delete admin.passwordReset; writeDB(db); return sendJson(res,200,{ ok:true }); }

  if(pathname.startsWith('/api/app/')){
    const ctx=getSession(req,db,'store'); if(!ctx) return unauthorized(res);
    if(method==='POST' && pathname==='/api/app/password/change'){ const body=await readBody(req); try{ assertPasswordPolicy(body.newPassword); setPermanentPassword(ctx.branch, body.newPassword); }catch(e){ return badRequest(res,e.message); } writeDB(db); return sendJson(res,200,{ ok:true, bootstrap:publicBootstrap(readDB(),ctx.branch,ctx.network) }); }
    if(ctx.branch.mustChangePassword) return sendJson(res,428,{ error:'password_change_required', message:'צריך לקבוע סיסמה קבועה' });
    if(method==='GET' && pathname==='/api/app/bootstrap') return sendJson(res,200,publicBootstrap(db,ctx.branch,ctx.network));
    if(method==='GET' && pathname==='/api/app/delivery-dates') return sendJson(res,200,{ dates:availableDeliveryDates(db,ctx.branch,url.searchParams.get('deliveryTypeId')||'',20) });
    if(method==='GET' && pathname==='/api/app/orders') return sendJson(res,200,{ orders:db.orders.filter(o=>o.branchId===ctx.branch.id).map(o=>orderView(db,o)).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))) });
    if(method==='POST' && pathname==='/api/app/orders'){ const body=await readBody(req); try{ const type=db.deliveryTypes.find(t=>t.id===body.deliveryTypeId && t.active!==false); if(!type) throw new Error('סוג הזמנה לא תקין'); const date=dateOnly(body.deliveryDate); const allowed=isDeliveryDateAllowed(db,ctx.branch,type.id,date); if(!allowed.ok) throw new Error(allowed.reason); const duplicate=duplicateOrder(db,ctx.branch.id,type.id,date); if(duplicate) throw new Error('כבר קיימת הזמנה לתאריך הזה. יש לערוך את ההזמנה הקיימת.'); const items=buildOrderItems(db,ctx.branch.id,type.id,body.items); const totals=orderTotals(items); const min=validateMinimum(db,ctx.branch,totals); const createdAt=nowIso(); const order={ id:makeId('order'), orderNumber:makeOrderNumber(), networkId:ctx.network.id, branchId:ctx.branch.id, deliveryTypeId:type.id, deliveryTypeTitle:type.title, deliveryDate:date, status:'submitted', statusText:mapStatus('submitted'), source:'app', createdAt, updatedAt:createdAt, minimumOrderType:min.type, minimumOrderValue:min.value, minimumOrderCartons:min.cartons, items, totals }; applyStockDelta(db,[],items,'order-create',order.id); db.orders.push(order); writeDB(db); return sendJson(res,201,{ order:orderView(db,order) }); }catch(e){ return badRequest(res,e.message||'לא ניתן לשלוח הזמנה'); } }
    const appOrderMatch=pathname.match(/^\/api\/app\/orders\/([^/]+)$/);
    if(method==='PUT' && appOrderMatch){ const body=await readBody(req); const order=db.orders.find(o=>o.id===appOrderMatch[1] && o.branchId===ctx.branch.id); if(!order) return notFound(res); if(LOCKED_STATUSES.has(order.status)) return forbidden(res,'ההזמנה כבר אושרה ואי אפשר לשנות אותה'); try{ const type=db.deliveryTypes.find(t=>t.id===order.deliveryTypeId); const date=dateOnly(body.deliveryDate||order.deliveryDate); const allowed=isDeliveryDateAllowed(db,ctx.branch,type.id,date); if(!allowed.ok) throw new Error(allowed.reason); const duplicate=duplicateOrder(db,ctx.branch.id,type.id,date,order.id); if(duplicate) throw new Error('כבר קיימת הזמנה אחרת לתאריך הזה'); const old=order.items||[]; const items=buildOrderItems(db,ctx.branch.id,type.id,body.items); const totals=orderTotals(items); validateMinimum(db,ctx.branch,totals); order.deliveryTypeId=type.id; order.deliveryTypeTitle=type.title; order.deliveryDate=date; order.items=items; order.totals=totals; order.updatedAt=nowIso(); applyStockDelta(db,old,items,'order-edit',order.id); writeDB(db); return sendJson(res,200,{ order:orderView(db,order) }); }catch(e){ return badRequest(res,e.message); } }

    if(method==='POST' && appOrderMatch && pathname.endsWith('/clone')){ const sourceId=appOrderMatch[1]; const source=db.orders.find(o=>o.id===sourceId && o.branchId===ctx.branch.id); if(!source) return notFound(res); if(['cancelled'].includes(source.status)) return badRequest(res,'אי אפשר לשכפל הזמנה מבוטלת'); const body=await readBody(req); const type=db.deliveryTypes.find(t=>t.id===(body.deliveryTypeId||source.deliveryTypeId)); const date=dateOnly(body.deliveryDate||source.deliveryDate); try{ const allowed=isDeliveryDateAllowed(db,ctx.branch,type.id,date); if(!allowed.ok) throw new Error(allowed.reason); const duplicate=duplicateOrder(db,ctx.branch.id,type.id,date); if(duplicate) throw new Error('כבר קיימת הזמנה לתאריך הזה'); const items=buildOrderItems(db,ctx.branch.id,type.id,(source.items||[]).map(i=>({productId:i.productId,quantity:i.quantity}))); const totals=orderTotals(items); validateMinimum(db,ctx.branch,totals); const createdAt=nowIso(); const order={ id:makeId('order'), orderNumber:makeOrderNumber(), networkId:ctx.network.id, branchId:ctx.branch.id, deliveryTypeId:type.id, deliveryTypeTitle:type.title, deliveryDate:date, status:'submitted', statusText:mapStatus('submitted'), source:'app-clone', createdAt, updatedAt:createdAt, clonedFromOrderId:source.id, items, totals }; applyStockDelta(db,[],items,'order-clone',order.id); db.orders.push(order); writeDB(db); return sendJson(res,201,{ order:orderView(db,order) }); }catch(e){ return badRequest(res,e.message); } }
    if(method==='POST' && pathname==='/api/app/notifications/read'){ for(const n of db.notifications||[]) if(n.branchId===ctx.branch.id) n.status='read'; writeDB(db); return sendJson(res,200,{ok:true}); }
    if(method==='POST' && pathname==='/api/app/contact'){ const body=await readBody(req); const contact={ id:makeId('contact'), networkId:ctx.network.id, branchId:ctx.branch.id, networkName:ctx.network.name, branchName:ctx.branch.name, subject:sanitizeText(body.subject)||'פנייה מהאפליקציה', message:sanitizeText(body.message), phone:sanitizeText(body.phone)||ctx.branch.phone, email:sanitizeText(body.email)||ctx.branch.email, status:'open', statusText:'פתוחה', createdAt:nowIso(), updatedAt:nowIso() }; db.contacts.push(contact); writeDB(db); return sendJson(res,201,{ contact }); }
    if(method==='GET' && pathname==='/api/app/product-history'){ return sendJson(res,200,{ history:productHistory(db,url.searchParams.get('productId'),ctx.branch.id,20) }); }
    if(method==='GET' && pathname==='/api/app/products/similar'){ const product=db.products.find(p=>p.id===url.searchParams.get('productId')); if(!product) return notFound(res); return sendJson(res,200,{ products:similarProducts(db,product,ctx.branch.id,url.searchParams.get('deliveryTypeId')||'') }); }
    
    if(method==='POST' && pathname==='/api/app/returns'){
      const body=await readBody(req);
      const items=buildReturnItems(db, body.items);
      if(!items.length) return badRequest(res,'צריך לבחור לפחות מוצר אחד להחזרה');
      if(!parseList(body.returnImageUrls).length) return badRequest(res,'חובה לצרף לפחות תמונה אחת של ההחזרה');
      const ret={ id:makeId('return'), returnNumber:makeReturnNumber(), networkId:ctx.network.id, branchId:ctx.branch.id, status:'submitted', statusText:returnStatusText('submitted'), source:'app', createdAt:nowIso(), updatedAt:nowIso(), note:sanitizeText(body.note), certificateImageUrl:normalizeImageUrl(body.certificateImageUrl||'', 'תעודה'), returnImageUrls:parseList(body.returnImageUrls).map(x=>normalizeImageUrl(x,'החזרה')), items };
      db.returns.push(ret);
      db.notifications.push({ id:makeId('note'), type:'return', networkId:ctx.network.id, branchId:ctx.branch.id, title:'בקשת החזרה התקבלה', message:`בקשת החזרה ${ret.returnNumber} נשלחה לבדיקה`, status:'unread', createdAt:nowIso() });
      writeDB(db); return sendJson(res,201,{ return:returnView(db,ret) });
    }
    if(method==='POST' && pathname==='/api/app/device-token'){ const body=await readBody(req); const token=sanitizeText(body.token); if(!token) return badRequest(res,'חסר token'); db.deviceTokens = (db.deviceTokens||[]).filter(t=>!(t.token===token && t.branchId===ctx.branch.id)); db.deviceTokens.push({ id:makeId('dev'), branchId:ctx.branch.id, networkId:ctx.network.id, token, platform:sanitizeText(body.platform)||'unknown', appVersion:sanitizeText(body.appVersion)||'', createdAt:nowIso(), lastSeenAt:nowIso(), active:true }); writeDB(db); return sendJson(res,200,{ ok:true }); }
    if(method==='POST' && pathname==='/api/app/debug-report'){ const body=await readBody(req); const report={ id:makeId('dbg'), branchId:ctx.branch.id, networkId:ctx.network.id, appVersion:sanitizeText(body.appVersion), platform:sanitizeText(body.platform), screen:sanitizeText(body.screen), language:sanitizeText(body.language), theme:sanitizeText(body.theme), url:sanitizeText(body.url), userAgent:sanitizeText(body.userAgent)||userAgent(req), logs:Array.isArray(body.logs)?body.logs.slice(-80):[], createdAt:nowIso(), status:'new' }; db.debugReports = Array.isArray(db.debugReports) ? db.debugReports : []; db.debugReports.unshift(report); writeDB(db); return sendJson(res,201,{ reportId:report.id }); }
    return notFound(res);
  }

  if(pathname.startsWith('/api/admin/')){
    const ctx=getSession(req,db,'admin'); if(!ctx) return unauthorized(res);
    if(method==='POST' && pathname==='/api/admin/password/change'){ const body=await readBody(req); try{ assertPasswordPolicy(body.newPassword); setPermanentPassword(ctx.admin, body.newPassword); }catch(e){ return badRequest(res,e.message); } writeDB(db); return sendJson(res,200,{ ok:true }); }
    if(ctx.admin.mustChangePassword) return sendJson(res,428,{ error:'password_change_required', message:'צריך לקבוע סיסמה קבועה' });
    if(method==='GET' && pathname==='/api/admin/bootstrap') return sendJson(res,200,adminBootstrap(db,ctx.admin));
    if(method==='GET' && pathname==='/api/admin/stats') return sendJson(res,200,{ stats:computeStats(db,ctx.admin,Object.fromEntries(url.searchParams.entries())) });
    if(method==='GET' && pathname==='/api/admin/product-history') return sendJson(res,200,{ history:productHistory(db,url.searchParams.get('productId'),url.searchParams.get('branchId'),50) });

    if(method==='POST' && pathname==='/api/admin/users'){ if(!requirePerm(res,ctx,'users.manage')) return; const body=await readBody(req); const email=String(body.email||'').trim().toLowerCase(); if(!email) return badRequest(res,'צריך מייל לעובד'); if(db.admins.some(a=>String(a.email).toLowerCase()===email)) return badRequest(res,'כבר קיים עובד עם המייל הזה'); const pass=generateSecurePassword(); const role=body.role||'clerk'; const admin={ id:makeId('admin'), name:sanitizeText(body.name)||email, email, role, permissions:normalizeAdminPermissions(role,body.permissions), password:passwordRecord(pass), passwordHistory:[], passwordChangedAt:nowIso(), mustChangePassword:true, active:boolValue(body.active,true), assignedNetworkIds: boolValue(body.allScope,false) ? [] : parseList(body.assignedNetworkIds), assignedBranchIds: boolValue(body.allScope,false) ? [] : parseList(body.assignedBranchIds), allowedIps:parseList(body.allowedIps), createdAt:nowIso(), loginCount:0 }; db.admins.push(admin); writeDB(db); return sendJson(res,201,{ user:adminView(admin,db), temporaryPassword:pass, message:`שלום ${admin.name},\nנוצר עבורך משתמש לפאנל OrderPilot.\nכתובת: /admin\nשם משתמש: ${admin.email}\nסיסמה זמנית: ${pass}\nבכניסה הראשונה תתבקש/י להחליף לסיסמה קבועה.` }); }
    const userMatch=pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
    if(method==='PATCH' && userMatch){ if(!requirePerm(res,ctx,'users.manage')) return; const admin=db.admins.find(a=>a.id===userMatch[1]); if(!admin) return notFound(res); const body=await readBody(req); if(body.name!==undefined) admin.name=sanitizeText(body.name); if(body.email!==undefined) admin.email=String(body.email).trim().toLowerCase(); if(body.role!==undefined) admin.role=body.role; if(body.permissions!==undefined || body.role!==undefined) admin.permissions=normalizeAdminPermissions(admin.role,body.permissions); if(body.active!==undefined) admin.active=boolValue(body.active,true); if(body.allScope!==undefined && boolValue(body.allScope,false)){ admin.assignedNetworkIds=[]; admin.assignedBranchIds=[]; } else { if(body.assignedNetworkIds!==undefined) admin.assignedNetworkIds=parseList(body.assignedNetworkIds); if(body.assignedBranchIds!==undefined) admin.assignedBranchIds=parseList(body.assignedBranchIds); } if(body.allowedIps!==undefined) admin.allowedIps=parseList(body.allowedIps); admin.updatedAt=nowIso(); writeDB(db); return sendJson(res,200,{ user:adminView(admin,db) }); }
    const userReset=pathname.match(/^\/api\/admin\/users\/([^/]+)\/reset$/);
    if(method==='POST' && userReset){ if(!requirePerm(res,ctx,'users.manage')) return; const admin=db.admins.find(a=>a.id===userReset[1]); if(!admin) return notFound(res); const pass=generateSecurePassword(); admin.passwordHistory = Array.isArray(admin.passwordHistory) ? admin.passwordHistory : []; if(admin.password) admin.passwordHistory.unshift(admin.password); admin.passwordHistory = admin.passwordHistory.slice(0,8); admin.password=passwordRecord(pass); admin.passwordChangedAt=nowIso(); admin.mustChangePassword=true; admin.updatedAt=nowIso(); writeDB(db); return sendJson(res,200,{ temporaryPassword:pass, message:`שלום ${admin.name},\nסיסמתך אופסה.\nכתובת: /admin\nשם משתמש: ${admin.email}\nסיסמה זמנית: ${pass}\nבכניסה הראשונה יש להחליף סיסמה.` }); }

    if(method==='POST' && pathname==='/api/admin/networks'){ if(!requirePerm(res,ctx,'networks.manage')) return; const body=await readBody(req); const code=String(body.accessCode || '').trim(); if(!code) return badRequest(res,'חובה להזין קוד רשת'); if(!sanitizeText(body.contactPhone)) return badRequest(res,'חובה להזין טלפון איש קשר'); if(!sanitizeText(body.contactEmail)) return badRequest(res,'חובה להזין מייל איש קשר'); const meta=secretMeta(code); const n={ id:makeId('net'), name:sanitizeText(body.name)||'רשת חדשה', contactPhone:sanitizeText(body.contactPhone), contactEmail:sanitizeText(body.contactEmail), accessCodeHash:meta.hash, accessCodeLast2:meta.last2, accessCodeLength:meta.length, minOrderType:body.minOrderType||'money', minOrderValue:numberValue(body.minOrderValue,0), minOrderCartons:numberValue(body.minOrderCartons,0), showPricesInApp:boolValue(body.showPricesInApp,true), active:boolValue(body.active,true), createdAt:nowIso() }; db.networks.push(n); writeDB(db); return sendJson(res,201,{ network:networkView(n), accessCode:code }); }
    const netMatch=pathname.match(/^\/api\/admin\/networks\/([^/]+)$/);
    if(method==='PATCH' && netMatch){ if(!requirePerm(res,ctx,'networks.manage')) return; const n=db.networks.find(x=>x.id===netMatch[1]); if(!n) return notFound(res); const body=await readBody(req); ['name','minOrderType','contactPhone','contactEmail'].forEach(k=>{ if(body[k]!==undefined) n[k]=sanitizeText(body[k]); }); if(body.minOrderValue!==undefined) n.minOrderValue=numberValue(body.minOrderValue,0); if(body.minOrderCartons!==undefined) n.minOrderCartons=numberValue(body.minOrderCartons,0); if(body.showPricesInApp!==undefined) n.showPricesInApp=boolValue(body.showPricesInApp,true); if(body.active!==undefined) n.active=boolValue(body.active,true); if(body.accessCode){ const meta=secretMeta(body.accessCode); n.accessCodeHash=meta.hash; n.accessCodeLast2=meta.last2; n.accessCodeLength=meta.length; } n.updatedAt=nowIso(); writeDB(db); return sendJson(res,200,{ network:networkView(n) }); }

    if(method==='POST' && pathname==='/api/admin/branches'){ if(!requirePerm(res,ctx,'branches.manage')) return; const body=await readBody(req); if(!body.networkId) return badRequest(res,'צריך לבחור רשת'); if(!sanitizeText(body.email)) return badRequest(res,'חובה להזין מייל סניף'); if(!sanitizeText(body.phone)) return badRequest(res,'חובה להזין טלפון סניף'); const network=db.networks.find(n=>n.id===body.networkId); if(!network || !canAccessNetwork(ctx.admin,network.id)) return forbidden(res); const pass=generateSecurePassword(); const code=String(body.branchCode || Math.floor(10+Math.random()*90)).trim(); const meta=secretMeta(code); const b={ id:makeId('branch'), networkId:network.id, name:sanitizeText(body.name)||'סניף חדש', city:sanitizeText(body.city), address:sanitizeText(body.address), email:sanitizeText(body.email), managerName:sanitizeText(body.managerName), phone:sanitizeText(body.phone), branchCodeHash:meta.hash, branchCodeLast2:meta.last2, branchCodeLength:meta.length, password:passwordRecord(pass), passwordHistory:[], passwordChangedAt:nowIso(), mustChangePassword:true, deliverySchedule:parseDeliverySchedule(db,body), minOrderType:body.minOrderType||'inherit', minOrderValue:numberValue(body.minOrderValue,0), minOrderCartons:numberValue(body.minOrderCartons,0), active:boolValue(body.active,true), createdAt:nowIso() }; db.branches.push(b); writeDB(db); return sendJson(res,201,{ branch:branchView(db,b), temporaryPassword:pass, branchCode:code, message:`שלום ${b.managerName || 'מנהל/ת הסניף'},\nהוקם עבורכם סניף במערכת OrderPilot.\nקישור לאפליקציה: /\nרשת: ${network.name}\nסניף: ${b.name}\nעיר: ${b.city}\nקוד רשת: ${body.networkCodeForMessage || 'הקוד הקבוע של הרשת'}\nקוד סניף: ${code}\nסיסמה זמנית: ${pass}\nבכניסה הראשונה תתבקש/י להחליף לסיסמה קבועה.` }); }
    const branchMatch=pathname.match(/^\/api\/admin\/branches\/([^/]+)$/);
    if(method==='PATCH' && branchMatch){ if(!requirePerm(res,ctx,'branches.manage')) return; const b=db.branches.find(x=>x.id===branchMatch[1]); if(!b) return notFound(res); if(!canAccessBranch(db,ctx.admin,b.id)) return forbidden(res); const body=await readBody(req); ['networkId','name','city','address','email','managerName','phone','minOrderType'].forEach(k=>{ if(body[k]!==undefined) b[k]=sanitizeText(body[k]); }); if(body.deliverySchedule || Object.keys(body).some(k=>k.startsWith('deliverySchedule__'))) b.deliverySchedule=parseDeliverySchedule(db,body); if(body.minOrderValue!==undefined) b.minOrderValue=numberValue(body.minOrderValue,0); if(body.minOrderCartons!==undefined) b.minOrderCartons=numberValue(body.minOrderCartons,0); if(body.active!==undefined) b.active=boolValue(body.active,true); if(body.branchCode){ const meta=secretMeta(body.branchCode); b.branchCodeHash=meta.hash; b.branchCodeLast2=meta.last2; b.branchCodeLength=meta.length; } b.updatedAt=nowIso(); writeDB(db); return sendJson(res,200,{ branch:branchView(db,b) }); }
    const branchReset=pathname.match(/^\/api\/admin\/branches\/([^/]+)\/reset$/);
    if(method==='POST' && branchReset){ if(!requirePerm(res,ctx,'branches.manage')) return; const b=db.branches.find(x=>x.id===branchReset[1]); if(!b) return notFound(res); const network=db.networks.find(n=>n.id===b.networkId); const pass=generateSecurePassword(); b.passwordHistory = Array.isArray(b.passwordHistory) ? b.passwordHistory : []; if(b.password) b.passwordHistory.unshift(b.password); b.passwordHistory = b.passwordHistory.slice(0,8); b.password=passwordRecord(pass); b.passwordChangedAt=nowIso(); b.mustChangePassword=true; writeDB(db); return sendJson(res,200,{ temporaryPassword:pass, message:`שלום ${b.managerName || 'מנהל/ת הסניף'},\nסיסמת הסניף אופסה.\nקישור לאפליקציה: /\nרשת: ${network?.name||''}\nסניף: ${b.name}\nקוד סניף: ${maskSecret(b.branchCodeLast2,b.branchCodeLength)}\nסיסמה זמנית: ${pass}\nבכניסה הראשונה יש להחליף סיסמה.` }); }

    if(method==='POST' && pathname==='/api/admin/products'){ if(!requirePerm(res,ctx,'products.manage')) return; const body=await readBody(req); const p=productFromBody(db,body,{ id:makeId('p'), createdAt:nowIso() }); db.products.push(p); writeDB(db); return sendJson(res,201,{ product:productView(p) }); }
    const productMatch=pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
    if(method==='PATCH' && productMatch){ if(!requirePerm(res,ctx,'products.manage')) return; const p=db.products.find(x=>x.id===productMatch[1]); if(!p) return notFound(res); productFromBody(db,await readBody(req),p); p.updatedAt=nowIso(); writeDB(db); return sendJson(res,200,{ product:productView(p) }); }
    const stockEntry=pathname.match(/^\/api\/admin\/products\/([^/]+)\/stock-entry$/);
    if(method==='POST' && stockEntry){ if(!requirePerm(res,ctx,'products.manage')) return; const p=db.products.find(x=>x.id===stockEntry[1]); if(!p) return notFound(res); const body=await readBody(req); const qty=numberValue(body.quantity,0); if(qty<=0) return badRequest(res,'צריך כמות חיובית'); const before=numberValue(p.stockQty,0); p.stockQty=before+qty; p.inStock=p.stockQty>0; p.wasOutOfStock=before<=0; p.updatedAt=nowIso(); db.stockMovements.push({ id:makeId('stk'), productId:p.id, productName:p.name, delta:qty, before, after:p.stockQty, source:'stock-entry', note:sanitizeText(body.note), createdAt:nowIso() }); notifyStockBack(db,p); writeDB(db); return sendJson(res,200,{ product:productView(p) }); }

    if(method==='POST' && pathname==='/api/admin/orders'){ if(!requirePerm(res,ctx,'orders.create')) return; const body=await readBody(req); const branch=db.branches.find(b=>b.id===body.branchId); if(!branch || !canAccessBranch(db,ctx.admin,branch.id)) return forbidden(res); try{ const type=db.deliveryTypes.find(t=>t.id===body.deliveryTypeId); const date=dateOnly(body.deliveryDate); const allowed=isDeliveryDateAllowed(db,branch,type.id,date); if(!allowed.ok) throw new Error(allowed.reason); const dup=duplicateOrder(db,branch.id,type.id,date); if(dup) throw new Error('כבר קיימת הזמנה לתאריך הזה. יש לערוך את הקיימת.'); const items=buildOrderItems(db,branch.id,type.id,body.items); const totals=orderTotals(items); const min=validateMinimum(db,branch,totals); const order={ id:makeId('order'), orderNumber:makeOrderNumber(), networkId:branch.networkId, branchId:branch.id, deliveryTypeId:type.id, deliveryTypeTitle:type.title, deliveryDate:date, status:'submitted', statusText:mapStatus('submitted'), source:'admin', createdByAdminId:ctx.admin.id, createdAt:nowIso(), updatedAt:nowIso(), minimumOrderType:min.type, minimumOrderValue:min.value, minimumOrderCartons:min.cartons, items, totals }; applyStockDelta(db,[],items,'admin-order-create',order.id); db.orders.push(order); addOrderNotification(db,order,`נוצרה עבורך הזמנה ${order.orderNumber}`); writeDB(db); return sendJson(res,201,{ order:orderView(db,order) }); }catch(e){ return badRequest(res,e.message); } }
    const orderMatch=pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
    if(method==='PATCH' && orderMatch){ if(!requirePerm(res,ctx,'orders.edit')) return; const order=db.orders.find(o=>o.id===orderMatch[1]); if(!order) return notFound(res); if(!canAccessBranch(db,ctx.admin,order.branchId)) return forbidden(res); if(LOCKED_STATUSES.has(order.status)) return forbidden(res,'ההזמנה כבר אושרה או טופלה — ניתן לצפות בלבד'); const body=await readBody(req); const branch=db.branches.find(b=>b.id===(body.branchId||order.branchId)); try{ const type=db.deliveryTypes.find(t=>t.id===order.deliveryTypeId); const date=dateOnly(body.deliveryDate||order.deliveryDate); const allowed=isDeliveryDateAllowed(db,branch,type.id,date); if(!allowed.ok) throw new Error(allowed.reason); const dup=duplicateOrder(db,branch.id,type.id,date,order.id); if(dup) throw new Error('כבר קיימת הזמנה לתאריך הזה'); const old=order.items || []; const items=buildOrderItems(db,branch.id,type.id,body.items); const totals=orderTotals(items); validateMinimum(db,branch,totals); Object.assign(order,{ networkId:branch.networkId, branchId:branch.id, deliveryTypeId:type.id, deliveryTypeTitle:type.title, deliveryDate:date, items, totals, updatedAt:nowIso() }); applyStockDelta(db,old,items,'admin-order-edit',order.id); writeDB(db); return sendJson(res,200,{ order:orderView(db,order) }); }catch(e){ return badRequest(res,e.message); } }
    const orderAction=pathname.match(/^\/api\/admin\/orders\/([^/]+)\/(status|pack|cancel|clone|reschedule)$/);
    if(method==='POST' && orderAction){ const order=db.orders.find(o=>o.id===orderAction[1]); if(!order) return notFound(res); if(!canAccessBranch(db,ctx.admin,order.branchId)) return forbidden(res); const action=orderAction[2]; const body=await readBody(req); if(action==='status'){ if(!requirePerm(res,ctx,'orders.status')) return; const status=String(body.status||''); if(!ORDER_STATUSES.includes(status)) return badRequest(res,'סטטוס לא תקין'); order.status=status; order.statusText=mapStatus(status); order.lockedForEditing=LOCKED_STATUSES.has(status); order.updatedAt=nowIso(); addOrderNotification(db,order,`הזמנה ${order.orderNumber}: ${mapStatus(status)}`); writeDB(db); return sendJson(res,200,{ order:orderView(db,order) }); }
      if(action==='pack'){ if(!requirePerm(res,ctx,'orders.pack')) return; const packed=body.items || []; for(const item of order.items || []){ const row=packed.find(x=>x.productId===item.productId) || {}; item.packedQty=Math.max(0, numberValue(row.packedQty, item.quantity)); item.suppliedQty=item.packedQty; item.missingQty=Math.max(0,numberValue(item.quantity)-item.packedQty); item.packingNote=sanitizeText(row.packingNote); } order.status='prepared'; order.statusText=mapStatus('prepared'); order.lockedForEditing=true; order.fulfillmentNote=sanitizeText(body.fulfillmentNote); order.totals=orderTotals(order.items); order.updatedAt=nowIso(); addOrderNotification(db,order,`הזמנה ${order.orderNumber} נארזה. חוסרים: ${order.totals.missingCartons} קרטונים`); writeDB(db); return sendJson(res,200,{ order:orderView(db,order) }); }
      if(action==='cancel'){ if(!requirePerm(res,ctx,'orders.status')) return; if(order.status==='cancelled') return sendJson(res,200,{ order:orderView(db,order) }); if(order.status==='supplied') return forbidden(res,'אי אפשר לבטל הזמנה שכבר סופקה'); applyStockDelta(db, order.items || [], [], 'order-cancel', order.id); order.status='cancelled'; order.statusText=mapStatus('cancelled'); order.cancelReason=sanitizeText(body.reason); order.cancelledAt=nowIso(); order.lockedForEditing=true; order.updatedAt=nowIso(); addOrderNotification(db,order,`הזמנה ${order.orderNumber} בוטלה`); writeDB(db); return sendJson(res,200,{ order:orderView(db,order) }); }
      if(action==='clone'){ if(!requirePerm(res,ctx,'orders.create')) return; const date=dateOnly(body.deliveryDate); const branch=db.branches.find(b=>b.id===order.branchId); const type=db.deliveryTypes.find(t=>t.id===order.deliveryTypeId); const allowed=isDeliveryDateAllowed(db,branch,type.id,date); if(!allowed.ok) return badRequest(res,allowed.reason); if(duplicateOrder(db,branch.id,type.id,date)) return badRequest(res,'כבר קיימת הזמנה לתאריך הזה'); const items=buildOrderItems(db,branch.id,type.id,(order.items||[]).map(i=>({productId:i.productId,quantity:i.quantity}))); const totals=orderTotals(items); try{ validateMinimum(db,branch,totals); }catch(e){ return badRequest(res,e.message); } const clone={ ...order, id:makeId('order'), orderNumber:makeOrderNumber(), deliveryDate:date, status:'submitted', statusText:mapStatus('submitted'), source:'clone', clonedFrom:order.id, createdAt:nowIso(), updatedAt:nowIso(), items, totals, lockedForEditing:false }; db.orders.push(clone); applyStockDelta(db,[],items,'order-clone',clone.id); writeDB(db); return sendJson(res,201,{ order:orderView(db,clone) }); }
      if(action==='reschedule'){ if(!requirePerm(res,ctx,'orders.status')) return; if(order.status==='supplied' || order.status==='cancelled') return forbidden(res,'אי אפשר לדחות או להקדים הזמנה שסופקה או בוטלה'); const date=dateOnly(body.deliveryDate); const branch=db.branches.find(b=>b.id===order.branchId); const allowed=isDeliveryDateAllowed(db,branch,order.deliveryTypeId,date,true); if(!allowed.ok) return badRequest(res,allowed.reason); order.previousDeliveryDate=order.deliveryDate; order.deliveryDate=date; order.scheduleChangeReason=sanitizeText(body.reason); order.updatedAt=nowIso(); addOrderNotification(db,order,`מועד האספקה של הזמנה ${order.orderNumber} עודכן ל-${formatDateHe(date)}`); writeDB(db); return sendJson(res,200,{ order:orderView(db,order) }); }
    }

    if(method==='POST' && pathname==='/api/admin/delivery-exceptions'){ if(!requirePerm(res,ctx,'delivery.manage')) return; const body=await readBody(req); const mode=body.mode || (body.replacementDate ? 'replace' : 'add'); if(!['add','replace','cancel'].includes(mode)) return badRequest(res,'סוג חריג לא תקין'); if(mode==='cancel') body.replacementDate=''; const ex={ id:makeId('delx'), mode, date:dateOnly(body.date), replacementDate:mode==='replace'?dateOnly(body.replacementDate):'', networkId:sanitizeText(body.networkId), branchId:sanitizeText(body.branchId), deliveryTypeId:sanitizeText(body.deliveryTypeId), reason:sanitizeText(body.reason), active:true, createdAt:nowIso() }; if(!ex.date) return badRequest(res,'צריך תאריך'); if(mode==='replace' && !ex.replacementDate) return badRequest(res,'במצב הזזה צריך לבחור תאריך חלופי'); db.deliveryExceptions.push(ex); writeDB(db); return sendJson(res,201,{ exception:ex }); }
    const delx=pathname.match(/^\/api\/admin\/delivery-exceptions\/([^/]+)$/); if(method==='DELETE' && delx){ if(!requirePerm(res,ctx,'delivery.manage')) return; db.deliveryExceptions=db.deliveryExceptions.filter(x=>x.id!==delx[1]); writeDB(db); return sendJson(res,200,{ ok:true }); }

    if(method==='POST' && pathname==='/api/admin/delivery-types'){ if(!requirePerm(res,ctx,'delivery.manage')) return; const body=await readBody(req); const t={ id:makeId('dt'), title:sanitizeText(body.title)||'סוג חדש', desc:sanitizeText(body.desc), kind:body.kind||'other', active:boolValue(body.active,true), sort:numberValue(body.sort,db.deliveryTypes.length+1), imageUrl:normalizeImageUrl(body.imageUrl,body.title) }; db.deliveryTypes.push(t); writeDB(db); return sendJson(res,201,{ deliveryType:deliveryTypeView(t) }); }
    const dt=pathname.match(/^\/api\/admin\/delivery-types\/([^/]+)$/); if(method==='PATCH' && dt){ if(!requirePerm(res,ctx,'delivery.manage')) return; const t=db.deliveryTypes.find(x=>x.id===dt[1]); if(!t) return notFound(res); const b=await readBody(req); ['title','desc','kind'].forEach(k=>{ if(b[k]!==undefined)t[k]=sanitizeText(b[k]); }); if(b.active!==undefined)t.active=boolValue(b.active,true); if(b.sort!==undefined)t.sort=numberValue(b.sort,0); if(b.imageUrl!==undefined)t.imageUrl=normalizeImageUrl(b.imageUrl,t.title); writeDB(db); return sendJson(res,200,{ deliveryType:deliveryTypeView(t) }); }
    if(method==='DELETE' && dt){ if(!requirePerm(res,ctx,'delivery.manage')) return; db.deliveryTypes=db.deliveryTypes.filter(x=>x.id!==dt[1]); for(const p of db.products) p.deliveryTypeIds=(p.deliveryTypeIds||[]).filter(id=>id!==dt[1]); for(const b of db.branches) if(b.deliverySchedule) delete b.deliverySchedule[dt[1]]; writeDB(db); return sendJson(res,200,{ ok:true }); }

    if(method==='POST' && pathname==='/api/admin/categories'){ if(!requirePerm(res,ctx,'products.manage')) return; const body=await readBody(req); const name=sanitizeText(body.name); if(!name) return badRequest(res,'צריך שם קטגוריה'); if(!db.categories.includes(name)) db.categories.push(name); db.categoryDeliveryRules=db.categoryDeliveryRules.filter(r=>r.category!==name); db.categoryDeliveryRules.push({ category:name, deliveryTypeIds:parseList(body.deliveryTypeIds), createdAt:nowIso() }); writeDB(db); return sendJson(res,201,{ categories:db.categories }); }
    const cat=pathname.match(/^\/api\/admin\/categories\/(.+)$/); if(method==='DELETE' && cat){ if(!requirePerm(res,ctx,'products.manage')) return; const name=decodeURIComponent(cat[1]); db.categories=db.categories.filter(c=>c!==name); db.categoryDeliveryRules=db.categoryDeliveryRules.filter(r=>r.category!==name); for(const p of db.products) if(p.category===name) p.category='כללי'; writeDB(db); return sendJson(res,200,{ ok:true }); }
    if(method==='POST' && pathname==='/api/admin/subcategories'){ if(!requirePerm(res,ctx,'products.manage')) return; const body=await readBody(req); ensureSubcategory(db,sanitizeText(body.category),sanitizeText(body.name)); writeDB(db); return sendJson(res,201,{ subcategories:db.subcategories }); }
    const sub=pathname.match(/^\/api\/admin\/subcategories\/(.+)\/(.+)$/); if(method==='DELETE' && sub){ if(!requirePerm(res,ctx,'products.manage')) return; const category=decodeURIComponent(sub[1]); const name=decodeURIComponent(sub[2]); const row=db.subcategories.find(r=>r.category===category); if(row) row.subcategories=(row.subcategories||[]).filter(x=>x!==name); for(const p of db.products) if(p.category===category && p.subcategory===name) p.subcategory='כללי'; writeDB(db); return sendJson(res,200,{ ok:true }); }
    if(method==='POST' && pathname==='/api/admin/kosher-types'){ if(!requirePerm(res,ctx,'products.manage')) return; const body=await readBody(req); const name=sanitizeText(body.name); if(!name) return badRequest(res,'צריך שם כשרות'); if(!db.kosherTypes.includes(name)) db.kosherTypes.push(name); writeDB(db); return sendJson(res,201,{ kosherTypes:db.kosherTypes }); }
    const kosher=pathname.match(/^\/api\/admin\/kosher-types\/(.+)$/); if(method==='DELETE' && kosher){ if(!requirePerm(res,ctx,'products.manage')) return; const name=decodeURIComponent(kosher[1]); db.kosherTypes=db.kosherTypes.filter(k=>k!==name); for(const p of db.products) p.kosherTypes=(p.kosherTypes||[]).filter(k=>k!==name); writeDB(db); return sendJson(res,200,{ ok:true }); }


    if(method==='POST' && pathname==='/api/admin/returns/request'){
      if(!requireAnyPerm(res,ctx,['contacts.manage','orders.create'])) return;
      const body=await readBody(req); const branch=db.branches.find(b=>b.id===body.branchId); if(!branch || !canAccessBranch(db,ctx.admin,branch.id)) return forbidden(res);
      const items=buildReturnItems(db, body.items); if(!items.length) return badRequest(res,'צריך לבחור מוצרים לבקשת החזרה');
      const ret={ id:makeId('return'), returnNumber:makeReturnNumber(), networkId:branch.networkId, branchId:branch.id, status:'requested', statusText:'בקשת החזרה מהחברה', source:'admin-request', requestedByAdminId:ctx.admin.id, createdAt:nowIso(), updatedAt:nowIso(), note:sanitizeText(body.note), certificateImageUrl:'', returnImageUrls:[], items };
      db.returns.push(ret); db.notifications.push({ id:makeId('note'), type:'return-request', networkId:branch.networkId, branchId:branch.id, title:'בקשת החזרה מהחברה', message:`נפתחה בקשת החזרה ${ret.returnNumber}. יש לבדוק ולצרף תמונות/תעודה במידת הצורך.`, status:'unread', createdAt:nowIso() });
      writeDB(db); return sendJson(res,201,{ return:returnView(db,ret) });
    }
    const returnMatch=pathname.match(/^\/api\/admin\/returns\/([^/]+)$/);
    if(method==='PATCH' && returnMatch){
      if(!requirePerm(res,ctx,'contacts.manage')) return;
      const ret=db.returns.find(r=>r.id===returnMatch[1]); if(!ret) return notFound(res); if(!canAccessBranch(db,ctx.admin,ret.branchId)) return forbidden(res);
      const body=await readBody(req); const status=sanitizeText(body.status)||ret.status; if(!['submitted','requested','review','approved','partial','rejected','cancelled'].includes(status)) return badRequest(res,'סטטוס החזרה לא תקין');
      ret.status=status; ret.statusText=returnStatusText(status); ret.reviewNote=sanitizeText(body.reviewNote); ret.reviewedByAdminId=ctx.admin.id; ret.reviewedAt=nowIso(); ret.updatedAt=nowIso();
      if(Array.isArray(body.items)){ for(const item of ret.items||[]){ const row=body.items.find(x=>x.productId===item.productId); if(row) item.approvedUnits=Math.max(0,Number(row.approvedUnits||0)); }}
      db.notifications.push({ id:makeId('note'), type:'return-status', networkId:ret.networkId, branchId:ret.branchId, title:'סטטוס החזרה עודכן', message:`בקשת החזרה ${ret.returnNumber}: ${returnStatusText(ret.status)}`, status:'unread', createdAt:nowIso() });
      writeDB(db); return sendJson(res,200,{ return:returnView(db,ret) });
    }
    if(method==='PATCH' && pathname.startsWith('/api/admin/contacts/')){ if(!requirePerm(res,ctx,'contacts.manage')) return; const id=pathname.split('/').pop(); const c=db.contacts.find(x=>x.id===id); if(!c) return notFound(res); const body=await readBody(req); const previousReply=String(c.reply||''); c.status=body.status||c.status; if(body.reply!==undefined){ const reply=sanitizeText(body.reply); c.reply=reply; c.repliedAt=nowIso(); c.repliedByAdminId=ctx.admin.id; c.status='closed'; if(reply && reply!==previousReply){ db.notifications.push({ id:makeId('note'), type:'contact-reply', networkId:c.networkId, branchId:c.branchId, contactId:c.id, title:'תגובה חדשה לפנייה', message:`התקבלה תגובה מהחברה: ${reply}`, status:'unread', createdAt:nowIso() }); if(!db.pushOutbox) db.pushOutbox=[]; db.pushOutbox.push({ id:makeId('push'), type:'contact-reply', branchId:c.branchId, title:'תגובה חדשה לפנייה', body:reply, status:'pending', createdAt:nowIso() }); } } if(body.status==='closed' && !body.reply){ c.closedAt=nowIso(); } c.statusText=c.status==='closed'?'טופלה':'פתוחה'; c.updatedAt=nowIso(); writeDB(db); return sendJson(res,200,{ contact:c }); }
    const integ=pathname.match(/^\/api\/admin\/integrations\/([^/]+)$/); if(method==='PATCH' && integ){ if(!requirePerm(res,ctx,'integrations.manage')) return; const row=db.integrations.find(x=>x.id===integ[1]); if(!row) return notFound(res); const body=await readBody(req); Object.assign(row,{ active:boolValue(body.active,row.active), mode:body.mode||row.mode, apiBaseUrl:sanitizeText(body.apiBaseUrl), tokenMasked:body.token?'••••••••':row.tokenMasked, status:body.active?'configured':'not_configured', notes:sanitizeText(body.notes)||row.notes, updatedAt:nowIso() }); writeDB(db); return sendJson(res,200,{ integration:row }); }
    if(method==='POST' && pathname==='/api/admin/import'){ if(!requirePerm(res,ctx,'imports.manage')) return; const body=await readBody(req); const entity=body.entity; const rows=Array.isArray(body.rows)?body.rows:parseCsv(body.csvText); if(!['products','networks','branches','employees'].includes(entity)) return badRequest(res,'סוג ייבוא לא תקין'); const result=importRows(db,entity,rows); const job={ id:makeId('imp'), entity, rows:rows.length, created:result.created, updated:result.updated, createdAt:nowIso(), createdByAdminId:ctx.admin.id }; db.importJobs.push(job); writeDB(db); return sendJson(res,201,{ job }); }


    if(method==='POST' && pathname==='/api/admin/app-banners'){ if(!requirePerm(res,ctx,'products.manage')) return; const body=await readBody(req); const banner={ id:makeId('banner'), title:sanitizeText(body.title)||'עדכון חברה', text:sanitizeText(body.text), icon:sanitizeText(body.icon)||'📣', imageUrl:normalizeImageUrl(body.imageUrl||'', body.title||'באנר'), active:boolValue(body.active,true), sort:numberValue(body.sort,(db.appBanners||[]).length+1), createdAt:nowIso() }; db.appBanners=Array.isArray(db.appBanners)?db.appBanners:[]; db.appBanners.push(banner); writeDB(db); return sendJson(res,201,{ banner }); }
    const bannerMatch=pathname.match(/^\/api\/admin\/app-banners\/([^/]+)$/); if(method==='PATCH' && bannerMatch){ if(!requirePerm(res,ctx,'products.manage')) return; const b=(db.appBanners||[]).find(x=>x.id===bannerMatch[1]); if(!b) return notFound(res); const body=await readBody(req); ['title','text','icon','imageUrl'].forEach(k=>{ if(body[k]!==undefined) b[k]=sanitizeText(body[k]); }); if(body.active!==undefined)b.active=boolValue(body.active,true); if(body.sort!==undefined)b.sort=numberValue(body.sort,0); b.updatedAt=nowIso(); writeDB(db); return sendJson(res,200,{ banner:b }); }
    if(method==='DELETE' && bannerMatch){ if(!requirePerm(res,ctx,'products.manage')) return; db.appBanners=(db.appBanners||[]).filter(x=>x.id!==bannerMatch[1]); writeDB(db); return sendJson(res,200,{ok:true}); }

    if(method==='POST' && pathname==='/api/admin/categories/order'){ if(!requirePerm(res,ctx,'products.manage')) return; const body=await readBody(req); db.meta=db.meta||{}; db.meta.categorySortMode=sanitizeText(body.mode)||'manual'; const order=parseList(body.order); if(order.length) db.meta.categoryOrder=order.filter(c=>(db.categories||[]).includes(c)); writeDB(db); return sendJson(res,200,{ categories:orderedCategories(db), meta:db.meta }); }
    if(method==='POST' && pathname==='/api/admin/promotions'){ if(!requirePerm(res,ctx,'products.manage')) return; const body=await readBody(req); const promo={ id:makeId('promo'), title:sanitizeText(body.title)||'מבצע', desc:sanitizeText(body.desc), type:body.type||'products', source:body.source==='network'?'network':'company', discountType:sanitizeText(body.discountType)||'percent', discountValue:numberValue(body.discountValue, numberValue(body.discountPercent,0)), discountPercent:numberValue(body.discountPercent, numberValue(body.discountValue,0)), fixedAmount:numberValue(body.fixedAmount,0), fixedPrice:numberValue(body.fixedPrice,0), minQty:numberValue(body.minQty,0), minValue:numberValue(body.minValue,0), networkIds:parseList(body.networkIds), branchIds:parseList(body.branchIds), productIds:parseList(body.productIds), categories:parseList(body.categories), active:boolValue(body.active,true), startsAt:body.startsAt||'', endsAt:body.endsAt||'', createdAt:nowIso() }; db.promotions=Array.isArray(db.promotions)?db.promotions:[]; db.promotions.push(promo); writeDB(db); return sendJson(res,201,{ promotion:promo }); }
    const promoMatch=pathname.match(/^\/api\/admin\/promotions\/([^/]+)$/); if(method==='PATCH' && promoMatch){ if(!requirePerm(res,ctx,'products.manage')) return; const promo=(db.promotions||[]).find(x=>x.id===promoMatch[1]); if(!promo) return notFound(res); const body=await readBody(req); ['title','desc','type','source','discountType','startsAt','endsAt'].forEach(k=>{ if(body[k]!==undefined) promo[k]=sanitizeText(body[k]); }); ['networkIds','branchIds','productIds','categories'].forEach(k=>{ if(body[k]!==undefined) promo[k]=parseList(body[k]); }); if(body.discountValue!==undefined) promo.discountValue=numberValue(body.discountValue,0); if(body.discountPercent!==undefined) promo.discountPercent=numberValue(body.discountPercent,0); if(body.fixedAmount!==undefined) promo.fixedAmount=numberValue(body.fixedAmount,0); if(body.fixedPrice!==undefined) promo.fixedPrice=numberValue(body.fixedPrice,0); if(body.minQty!==undefined) promo.minQty=numberValue(body.minQty,0); if(body.minValue!==undefined) promo.minValue=numberValue(body.minValue,0); if(body.active!==undefined) promo.active=boolValue(body.active,true); promo.updatedAt=nowIso(); writeDB(db); return sendJson(res,200,{ promotion:promo }); }
    return notFound(res);
  }
  return notFound(res);
}
function parseDeliverySchedule(db, body){ const schedule={}; for(const t of visibleOrderTypes(db)){ const val=body[`deliverySchedule__${t.id}`] ?? body[t.id] ?? (body.deliverySchedule && body.deliverySchedule[t.id]); const days=parseList(val).map(Number).filter(d=>d>=0 && d<=4); schedule[t.id]=[...new Set(days.length?days:[2,4])]; } return schedule; }
function productFromBody(db,body,p){ p.name=sanitizeText(body.name)||p.name||'מוצר'; p.barcode=sanitizeText(body.barcode); p.category=sanitizeText(body.categoryOther)||sanitizeText(body.category)||'כללי'; p.subcategory=sanitizeText(body.subcategoryOther)||sanitizeText(body.subcategory)||'כללי'; p.imageUrl=normalizeImageUrl(body.imageUrl||p.imageUrl,p.name); p.deliveryTypeIds=parseList(body.deliveryTypeIds).length?parseList(body.deliveryTypeIds):[db.deliveryTypes[0]?.id||'regular']; p.unitsPerCarton=numberValue(body.unitsPerCarton,p.unitsPerCarton); p.cartonsPerPallet=numberValue(body.cartonsPerPallet,p.cartonsPerPallet); p.pricePerCarton=numberValue(body.pricePerCarton,p.pricePerCarton); p.stockQty=numberValue(body.stockQty,p.stockQty); p.stockMode=body.stockMode||p.stockMode||'auto'; p.inStock=p.stockQty>0; p.recommendedQty=numberValue(body.recommendedQty,p.recommendedQty); p.active=boolValue(body.active,p.active!==false); p.usual=boolValue(body.usual,false); p.trending=boolValue(body.trending,false); p.newItem=boolValue(body.newItem,false); p.autoTags=boolValue(body.autoTags,true); p.manualTags=parseList(body.manualTags); p.tags=mergedTags(p); p.kosherTypes=parseList(body.kosherTypes).filter(k=>!['none','cholov-yisrael','milk-powder','לא רלוונטי / פרווה','פרווה','חלב ישראל','אבקת חלב נוכרי','בשרי'].includes(k)); p.foodType=sanitizeText(body.foodType)||sanitizeText(body.dairyType)||p.foodType||'פרווה'; if(p.foodType==='cholov-yisrael') p.foodType='חלב ישראל'; if(p.foodType==='milk-powder') p.foodType='אבקת חלב נוכרי'; if(!['פרווה','חלב ישראל','אבקת חלב נוכרי','בשרי'].includes(p.foodType)) p.foodType='פרווה'; p.dairyType=p.foodType; p.kosher=p.kosherTypes.join(', '); p.blockedNetworkIds=parseList(body.blockedNetworkIds); p.blockedBranchIds=parseList(body.blockedBranchIds); p.alternativeProductIds=parseList(body.alternativeProductIds).filter(id=>id!==p.id); p.similarProductIds=p.alternativeProductIds; p.ingredients=sanitizeText(body.ingredients)||p.ingredients||''; p.allergens=sanitizeText(body.allergens)||p.allergens||''; p.returnAlertThreshold=numberValue(body.returnAlertThreshold,p.returnAlertThreshold||0.15); ensureSubcategory(db,p.category,p.subcategory); if(!db.categories.includes(p.category)) db.categories.push(p.category); return p; }

function serveStatic(req,res,pathname){ let requested=pathname; if(requested==='/') requested='/index.html'; if(requested==='/admin') requested='/admin.html'; if(requested==='/error') requested='/error.html'; if(requested==='/offline') requested='/offline.html'; if(requested==='/not-found') requested='/not-found.html'; const safe=path.normalize(decodeURIComponent(requested)).replace(/^([/\\])+/, ''); const filePath=path.join(PUBLIC_DIR,safe); if(!filePath.startsWith(PUBLIC_DIR)){ res.writeHead(403); return res.end('Forbidden'); } fs.stat(filePath,(err,stat)=>{ if(err||!stat.isFile()){ const wantsHtml=String(req.headers.accept||'').includes('text/html'); if(req.method==='GET' && wantsHtml && !path.extname(filePath)){ const fallback=path.join(PUBLIC_DIR, requested.startsWith('/admin')?'admin.html':'index.html'); res.writeHead(200,{ 'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store' }); return fs.createReadStream(fallback).pipe(res); } res.writeHead(404,{ 'Content-Type':'text/plain; charset=utf-8' }); return res.end('Not found'); } const ext=path.extname(filePath).toLowerCase(); const noStore=new Set(['.html','.js','.css','.json','.webmanifest']); res.writeHead(200,{ 'Content-Type':MIME[ext]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':noStore.has(ext)?'no-store':'public, max-age=86400' }); fs.createReadStream(filePath).pipe(res); }); }

fs.mkdirSync(DATA_DIR,{recursive:true});
const initial=readDB(); writeDB(initial);
const server=http.createServer(async (req,res)=>{ try{ if(req.method==='OPTIONS'){ res.writeHead(204,corsHeaders()); res.end(); return; } const url=new URL(req.url,`http://${req.headers.host||'localhost'}`); if(url.pathname.startsWith('/api/')) return await handleApi(req,res,url.pathname); if(req.method!=='GET' && req.method!=='HEAD') return notFound(res); serveStatic(req,res,url.pathname); }catch(err){ console.error('[server-error]',req.method,req.url,err.stack||err); const msg=err.message==='invalid_json'?'JSON לא תקין':err.message==='payload_too_large'?'בקשה גדולה מדי':'שגיאת שרת'; sendJson(res,err.message==='invalid_json'?400:500,{ error:'server_error', message:msg }); } });
server.listen(PORT, HOST, () => {
  const shownHost = HOST === '0.0.0.0' ? 'localhost / your LAN IP' : HOST;
  console.log(`OrderPilot v${APP_VERSION} running on http://${shownHost}:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log(`LAN test URL: http://<YOUR_PC_IP>:${PORT}/api/health`);
  }
});
