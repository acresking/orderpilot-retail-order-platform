// Generated runtime bundle. Source of truth: src/client/mobile/app.js
// Run: npm run build:web
const ORDERPILOT_FEATURES = [{"id":"core","label":"בסיס הפלטפורמה (קטלוג, סל, הזמנות, ניהול רשתות/סניפים, מועדפים, התראות מלאי ופוש)","scope":"both","core":true,"setupPrice":4200,"monthlyPrice":390},{"id":"returns","label":"ניהול חזרות (כולל זיהוי אוטומטי מתעודה)","scope":"both","core":false,"setupPrice":1800,"monthlyPrice":120},{"id":"promotions","label":"מבצעים","scope":"both","core":false,"setupPrice":950,"monthlyPrice":70},{"id":"banners","label":"באנרים (כולל וידיאו וסיבוב אוטומטי)","scope":"both","core":false,"setupPrice":750,"monthlyPrice":45},{"id":"offlineQueue","label":"הזמנה במצב לא מקוון","scope":"app","core":false,"setupPrice":1400,"monthlyPrice":90},{"id":"barcodeScan","label":"סריקת ברקוד","scope":"app","core":false,"setupPrice":750,"monthlyPrice":40},{"id":"stats","label":"סטטיסטיקות וגרפים","scope":"admin","core":false,"setupPrice":1100,"monthlyPrice":80},{"id":"multiLanguage","label":"ריבוי שפות (אנגלית / ערבית / רוסית)","scope":"app","core":false,"setupPrice":850,"monthlyPrice":45},{"id":"integrations","label":"ממשקים וייבוא (ERP)","scope":"admin","core":false,"setupPrice":2600,"monthlyPrice":170},{"id":"multiEmployee","label":"ריבוי עובדים והרשאות","scope":"admin","core":false,"setupPrice":650,"monthlyPrice":40}];
const root = document.getElementById('app');
const API_BASE = (function(){
  if (typeof window !== 'undefined' && window.ORDERPILOT_API_BASE !== undefined) return window.ORDERPILOT_API_BASE;
  if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http') && !window.Capacitor?.isNativePlatform?.()) {
    return '';
  }
  return window.ORDERPILOT_CONFIG?.API_BASE_URL || '';
})();
function apiUrlForDisplay(){ return API_BASE || location.origin || '(relative)'; }
function isNativeCapacitor(){ return !!(window.Capacitor && (window.Capacitor.isNativePlatform?.() || window.Capacitor.getPlatform?.() === 'android' || window.Capacitor.getPlatform?.() === 'ios')); }
function nativeHttpPlugin(){ return window.Capacitor?.Plugins?.CapacitorHttp || window.CapacitorHttp || null; }
async function fetchWithTimeout(url, options={}, ms=12000){
  const method=(options.method||'GET').toUpperCase();
  const headers={...(options.headers||{})};
  const body=options.body;
  const nativeHttp=nativeHttpPlugin();
  const shouldTryNative=isNativeCapacitor() && nativeHttp && /^https?:\/\//i.test(String(url));
  if(shouldTryNative){
    try{
      const nativeOptions={ url:String(url), method, headers, connectTimeout:ms, readTimeout:ms };
      if(body){
        try{ nativeOptions.data=typeof body==='string'?JSON.parse(body):body; }
        catch(_){ nativeOptions.data=body; }
      }
      const result=await nativeHttp.request(nativeOptions);
      const responseBody=typeof result.data==='string' ? result.data : JSON.stringify(result.data ?? {});
      return new Response(responseBody,{ status:result.status || 200, headers:{ 'Content-Type':'application/json' } });
    }catch(nativeErr){
      console.warn('[OrderPilot] Native HTTP failed, falling back to fetch:', nativeErr?.message || nativeErr);
    }
  }
  const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),ms);
  try{ return await fetch(url,{...options,signal:ctrl.signal,cache:options.cache||'no-store'}); }
  finally { clearTimeout(timer); }
}
function connectionTroubleshootingText(){ return `API: ${apiUrlForDisplay()}\nPlatform: ${window.Capacitor?.getPlatform?.() || 'web'}\nNative HTTP: ${nativeHttpPlugin()?'available':'not available'}\nOpen on phone browser: ${apiUrlForDisplay()}/api/health`; }
async function testConnection(){
  const target=(API_BASE||'')+'/api/diagnostics/connection';
  try{
    const res=await fetchWithTimeout(target,{cache:'no-store'},8000);
    const text=await res.text(); let data={};
    try{ data=JSON.parse(text); }catch(_){ data={raw:text.slice(0,300)}; }
    showModal(`<h2>בדיקת חיבור</h2><div class="diag-box"><p><b>API:</b> ${esc(apiUrlForDisplay())}</p><p><b>סטטוס:</b> ${res.status}</p><p><b>פלטפורמה:</b> ${esc(window.Capacitor?.getPlatform?.() || 'web')}</p><p><b>Native HTTP:</b> ${nativeHttpPlugin()?'פעיל':'לא זמין'}</p><pre>${esc(JSON.stringify(data,null,2))}</pre></div><button class="btn primary block" data-modal-close>סגירה</button>`);
  }catch(err){
    showModal(`<h2>בדיקת חיבור נכשלה</h2><div class="diag-box"><pre>${esc(connectionTroubleshootingText())}</pre><p>${esc(err.message||String(err))}</p><p>אם הקישור נפתח בדפדפן אבל לא באפליקציה, מחק את האפליקציה והתקן APK חדש. אם עדיין לא עובד, לחץ שוב אחרי התקנת v44 כי הוא משתמש גם ב־Native HTTP.</p></div><button class="btn primary block" data-modal-close>סגירה</button>`);
  }
}
window.orderPilotTestConnection=testConnection;
const tokenKey = 'orderpilot_store_token_v21';
const langKey = 'orderpilot_lang_v12';
const themeKey = 'orderpilot_theme_v12';
const fontKey = 'orderpilot_font_v12';
const appState = {
  token: localStorage.getItem(tokenKey) || '',
  lang: localStorage.getItem(langKey) || 'he',
  theme: localStorage.getItem(themeKey) || 'light',
  fontSize: localStorage.getItem(fontKey) || 'normal',
  data: null,
  screen: 'order',
  selectedTypeId: '',
  selectedDate: '',
  selectedCategory: 'all',
  selectedSubcategory: '',
  search: '',
  cart: {}
};
const ui = {
  he: { login:'התחברות', networkCode:'קוד רשת', branchCode:'קוד סניף', password:'סיסמה', signIn:'כניסה', forgot:'שכחתי סיסמה', chooseType:'בחירת סוג הזמנה', chooseDate:'בחירת תאריך אספקה', chooseDateBtn:'בחירת תאריך אספקה והמשך', catalog:'קטלוג', all:'הכל', search:'חיפוש מוצר או ברקוד', scan:'סריקה', cart:'סל', orders:'הזמנות', notifications:'התראות', settings:'הגדרות', contact:'צור קשר', add:'הוספה', qty:'כמות', cartons:'קרטונים', unitsPerCarton:'יחידות בקרטון', kosher:'כשרות', stock:'מלאי', submit:'שליחת הזמנה', summary:'סיכום הזמנה', minOrder:'מינימום הזמנה', missingMin:'צריך להשלים מינימום', date:'תאריך אספקה', back:'חזרה', close:'סגירה', history:'היסטוריה', productInfo:'מידע מוצר', language:'שפה', theme:'ערכת נושא', light:'בהיר', dark:'כהה', send:'שליחה', subject:'נושא', message:'הודעה', phone:'טלפון', email:'מייל', passwordChange:'קביעת סיסמה קבועה', newPassword:'סיסמה חדשה', save:'שמירה', resetCode:'קוד שחזור', scanHint:'מקם את הברקוד בתוך המלבן', manualBarcode:'הקלדת ברקוד ידנית', noProducts:'אין מוצרים מתאימים', delivered:'סופק', packed:'נארז', missing:'נפל מההזמנה', appSettings:'הגדרות אפליקציה', exception:'חריג', barcode:'ברקוד', noDates:'אין תאריכים זמינים', logout:'התנתקות', fontSize:'גודל כתב', small:'קטן', normal:'רגיל', large:'גדול', barcodeNotFound:'ברקוד לא נמצא', status:'סטטוס', type:'סוג', product:'מוצר', products:'מוצרים' },
  en: { login:'Login', networkCode:'Network code', branchCode:'Branch code', password:'Password', signIn:'Sign in', forgot:'Forgot password', chooseType:'Choose order type', chooseDate:'Choose delivery date', chooseDateBtn:'Choose delivery date and continue', catalog:'Catalog', all:'All', search:'Search product or barcode', scan:'Scan', cart:'Cart', orders:'Orders', notifications:'Notifications', settings:'Settings', contact:'Contact', add:'Add', qty:'Quantity', cartons:'Cartons', unitsPerCarton:'Units per carton', kosher:'Kosher', stock:'Stock', submit:'Submit order', summary:'Order summary', minOrder:'Minimum order', missingMin:'Minimum not reached', date:'Delivery date', back:'Back', close:'Close', history:'History', productInfo:'Product info', language:'Language', theme:'Theme', light:'Light', dark:'Dark', send:'Send', subject:'Subject', message:'Message', phone:'Phone', email:'Email', passwordChange:'Set permanent password', newPassword:'New password', save:'Save', resetCode:'Reset code', scanHint:'Place the barcode inside the rectangle', manualBarcode:'Enter barcode manually', noProducts:'No matching products', delivered:'Delivered', packed:'Packed', missing:'Missing from order', appSettings:'App settings', exception:'Exception', barcode:'Barcode', noDates:'No available dates', logout:'Logout', fontSize:'Font size', small:'Small', normal:'Normal', large:'Large', barcodeNotFound:'Barcode not found', status:'Status', type:'Type', product:'Product', products:'Products' },
  ar: { login:'تسجيل الدخول', networkCode:'رمز الشبكة', branchCode:'رمز الفرع', password:'كلمة المرور', signIn:'دخول', forgot:'نسيت كلمة المرور', chooseType:'اختر نوع الطلب', chooseDate:'اختر تاريخ التوريد', chooseDateBtn:'اختيار تاريخ التوريد والمتابعة', catalog:'الكتالوج', all:'الكل', search:'ابحث عن منتج أو باركود', scan:'مسح', cart:'السلة', orders:'الطلبات', notifications:'الإشعارات', settings:'الإعدادات', contact:'تواصل', add:'إضافة', qty:'الكمية', cartons:'كراتين', unitsPerCarton:'وحدات في الكرتون', kosher:'كوشير', stock:'المخزون', submit:'إرسال الطلب', summary:'ملخص الطلب', minOrder:'الحد الأدنى للطلب', missingMin:'لم يتم الوصول للحد الأدنى', date:'تاريخ التوريد', back:'رجوع', close:'إغلاق', history:'السجل', productInfo:'معلومات المنتج', language:'اللغة', theme:'المظهر', light:'فاتح', dark:'داكن', send:'إرسال', subject:'الموضوع', message:'الرسالة', phone:'هاتف', email:'بريد إلكتروني', passwordChange:'تعيين كلمة مرور دائمة', newPassword:'كلمة مرور جديدة', save:'حفظ', resetCode:'رمز الاستعادة', scanHint:'ضع الباركود داخل المستطيل', manualBarcode:'إدخال الباركود يدويًا', noProducts:'لا توجد منتجات مطابقة', delivered:'تم التوريد', packed:'تم التجهيز', missing:'نقص من الطلب', appSettings:'إعدادات التطبيق', exception:'استثناء', barcode:'باركود', noDates:'لا توجد تواريخ متاحة', logout:'تسجيل الخروج', fontSize:'حجم الخط', small:'صغير', normal:'عادي', large:'كبير', barcodeNotFound:'لم يتم العثور على الباركود', status:'الحالة', type:'النوع', product:'المنتج', products:'المنتجات' },
  ru: { login:'Вход', networkCode:'Код сети', branchCode:'Код филиала', password:'Пароль', signIn:'Войти', forgot:'Забыли пароль', chooseType:'Выберите тип заказа', chooseDate:'Выберите дату поставки', chooseDateBtn:'Выбрать дату поставки и продолжить', catalog:'Каталог', all:'Все', search:'Поиск товара или штрихкода', scan:'Сканировать', cart:'Корзина', orders:'Заказы', notifications:'Уведомления', settings:'Настройки', contact:'Связаться', add:'Добавить', qty:'Количество', cartons:'Короба', unitsPerCarton:'Ед. в коробе', kosher:'Кашрут', stock:'Склад', submit:'Отправить заказ', summary:'Итог заказа', minOrder:'Минимальный заказ', missingMin:'Минимум не достигнут', date:'Дата поставки', back:'Назад', close:'Закрыть', history:'История', productInfo:'Информация о товаре', language:'Язык', theme:'Тема', light:'Светлая', dark:'Темная', send:'Отправить', subject:'Тема', message:'Сообщение', phone:'Телефон', email:'Email', passwordChange:'Установить постоянный пароль', newPassword:'Новый пароль', save:'Сохранить', resetCode:'Код восстановления', scanHint:'Поместите штрихкод в прямоугольник', manualBarcode:'Ввести штрихкод вручную', noProducts:'Нет подходящих товаров', delivered:'Доставлено', packed:'Упаковано', missing:'Не вошло в заказ', appSettings:'Настройки приложения', exception:'Исключение', barcode:'Штрихкод', noDates:'Нет доступных дат', logout:'Выход', fontSize:'Размер текста', small:'Малый', normal:'Обычный', large:'Крупный', barcodeNotFound:'Штрихкод не найден', status:'Статус', type:'Тип', product:'Товар', products:'Товары' }
};
function t(k){ return (ui[appState.lang] || ui.he)[k] || ui.he[k] || k; }
function tr(value){ const s=String(value||''); if(!s) return ''; if(appState.lang==='he') return s; return appState.data?.translations?.[s]?.[appState.lang] || s; }
function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function hasFeatureApp(id){ return id==null || (appState.data?.features||[]).includes(id); }
// Professional line-icon set (MIT-licensed Feather Icons path data, vendored inline — no CDN, works offline).
// Replaces the emoji previously used across the UI with consistent 24x24 stroke icons.
const ICONS = {
  "cart":`<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>`,
  "tag":`<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>`,
  "check-circle":`<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
  "sparkle":`<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  "chat":`<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>`,
  "box":`<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>`,
  "bell":`<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`,
  "settings":`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
  "megaphone":`<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>`,
  "return":`<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>`,
  "check":`<polyline points="20 6 9 17 4 12"/>`,
  "camera":`<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>`,
  "home":`<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  "search":`<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
  "bolt":`<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
  "star":`<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  "logout":`<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
  "x":`<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
  "clipboard":`<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>`,
  "trash":`<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>`,
  "truck":`<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`,
  "edit":`<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>`,
  "save":`<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>`,
  "users":`<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  "arrow-up":`<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>`,
  "arrow-down":`<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>`,
  "arrow-right":`<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
  "bag":`<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
  "plug":`<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`,
  "card":`<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>`,
  "video":`<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>`,
  "image":`<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>`,
  "chart-bar":`<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
  "paperclip":`<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>`,
  "user":`<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  "refresh":`<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`,
  "folder":`<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>`,
  "import":`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
  "link":`<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>`,
  "mobile":`<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>`,
  "trending-up":`<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`,
  "building":`<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
  "heart":`<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
  "plus":`<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
  "minus":`<line x1="5" y1="12" x2="19" y2="12"/>`,
  "chevron-left":`<polyline points="15 18 9 12 15 6"/>`,
  "chevron-right":`<polyline points="9 18 15 12 9 6"/>`,
  "chevron-down":`<polyline points="6 9 12 15 18 9"/>`,
  "chevron-up":`<polyline points="18 15 12 9 6 15"/>`,
  "upload":`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`,
  "calendar":`<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  "clock":`<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  "map-pin":`<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
  "phone":`<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`,
  "mail":`<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`,
  "send":`<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`,
  "filter":`<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
  "more":`<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>`,
  "alert-triangle":`<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  "alert-circle":`<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
  "info":`<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`,
  "check-square":`<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`,
  "wifi":`<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>`,
  "wifi-off":`<line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>`,
  "cloud":`<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>`,
  "cloud-off":`<path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"/><line x1="1" y1="1" x2="23" y2="23"/>`,
  "grid":`<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>`,
  "gift":`<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>`,
  "award":`<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>`,
  "activity":`<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
  "barcode":`<line x1="3" y1="4" x2="3" y2="20"/><line x1="6.5" y1="4" x2="6.5" y2="20"/><line x1="9.5" y1="4" x2="9.5" y2="20"/><line x1="12.5" y1="4" x2="12.5" y2="20"/><line x1="15" y1="4" x2="15" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/><line x1="21" y1="4" x2="21" y2="20"/>`,
  "bell-plus":`<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M15 8h6"/><path d="M18 5v6"/><path d="M20.002 14.464a9 9 0 0 0 .738.863A1 1 0 0 1 20 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 8.75-5.332"/>`,
  "swipe":`<path d="M8 12h13"/><path d="m17 8 4 4-4 4"/><circle cx="4" cy="12" r="1"/>`
};
function icon(name, opts){
  opts = opts || {};
  const body = ICONS[name];
  if(!body) return '';
  const size = opts.size || 20;
  const cls = 'icon' + (opts.cls ? ' ' + opts.cls : '');
  const a11y = opts.label ? `role="img" aria-label="${esc(opts.label)}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${body}</svg>`;
}
function fileToDataUrl(file){ return new Promise((resolve,reject)=>{ if(!file) return resolve(''); const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); }); }
function searchFieldHtml(value){ const v=String(value||''); return `<div class="search-field"><input value="${esc(v)}" data-search placeholder="${t('search')}" aria-label="${t('search')}"/>${v?`<button type="button" class="search-clear" data-clear-search aria-label="${t('close')}">${icon('x',{size:14})}</button>`:''}</div>`; }
function money(n){ return Number(n||0).toLocaleString(appState.lang==='he'?'he-IL':'en-US',{style:'currency',currency:'ILS',maximumFractionDigits:0}); }
function dir(){ return ['he','ar'].includes(appState.lang) ? 'rtl' : 'ltr'; }
function img(p){ return `<img class="product-img" src="${esc(p.imageUrl||'/icon.svg')}" alt="${esc(tr(p.name))}" loading="lazy"/>`; }
async function api(path, options={}){ const headers={'Content-Type':'application/json',...(options.headers||{})}; if(appState.token) headers.Authorization=`Bearer ${appState.token}`; const res=await fetchWithTimeout(API_BASE+path,{...options,headers},15000); const data=await res.json().catch(()=>({})); if(res.status===428){ showModal(passwordChangeForm()); throw new Error(data.message||t('passwordChange')); } if(!res.ok) throw new Error(data.message||'Error'); return data; }
function shadeHex(hex, percent){ const n=parseInt(String(hex||'').replace('#',''),16); if(Number.isNaN(n)) return hex; let r=(n>>16)&0xff, g=(n>>8)&0xff, b=n&0xff; const t=percent<0?0:255, p=Math.abs(percent); r=Math.round((t-r)*p)+r; g=Math.round((t-g)*p)+g; b=Math.round((t-b)*p)+b; return '#'+(0x1000000+r*0x10000+g*0x100+b).toString(16).slice(1); }
function applyBrandColors(brandColors){ const primary=brandColors?.primary, accent=brandColors?.accent; const root=document.documentElement.style; if(primary){ root.setProperty('--primary',primary); root.setProperty('--primary-2',shadeHex(primary,-0.18)); root.setProperty('--primary-soft',shadeHex(primary,0.85)); } if(accent) root.setProperty('--accent',accent); }
async function bootstrap(){ appState.data=await api('/api/app/bootstrap'); applyBrandColors(appState.data.brandColors); applyPreferences(); }
function toast(msg,type='info'){ const el=document.createElement('div'); el.className=`toast toast-${type}`; el.setAttribute('role','status'); el.setAttribute('aria-live','polite'); const iconName=type==='error'?'alert-circle':type==='success'?'check-circle':'info'; el.innerHTML=`${typeof icon==='function'?icon(iconName,{size:16}):''}<span></span>`; el.querySelector('span').textContent=msg; document.body.appendChild(el); setTimeout(()=>{ el.classList.add('toast-out'); setTimeout(()=>el.remove(),220); },3500); }
function showModal(html, cls=''){ closeModal(); const div=document.createElement('div'); div.className='modal-backdrop app-modal'; div.innerHTML=`<div class="modal-card ${cls}" role="dialog" aria-modal="true">${html}</div>`; document.body.appendChild(div); div.addEventListener('click',e=>{ if(e.target.classList.contains('modal-backdrop')||e.target.closest('[data-modal-close]')) closeModal(); }); const focusable=div.querySelector('input,select,textarea,button,[href]'); if(focusable) focusable.focus({preventScroll:true}); }
function closeModal(){ document.querySelectorAll('.modal-backdrop').forEach(x=>x.remove()); }
function setQty(id,q){ q=Math.max(0,Number(q||0)); if(q) appState.cart[id]=q; else delete appState.cart[id]; render(); }
function cartItems(){ return Object.entries(appState.cart).map(([id,q])=>({ product:appState.data.products.find(p=>p.id===id), quantity:q })).filter(x=>x.product); }
function cartTotals(){ return cartItems().reduce((a,{product,quantity})=>{ a.cartons+=quantity; a.value+=quantity*Number(product.pricePerCarton||0); a.lines+=1; return a; },{lines:0,cartons:0,value:0}); }
function minText(){ const m=appState.data.minimum || {}; return m.type==='cartons' ? `${m.cartons} ${t('cartons')}` : money(m.value||0); }
function minOk(){ const m=appState.data.minimum || {}; const totals=cartTotals(); if(m.type==='cartons' && m.cartons>0) return totals.cartons>=m.cartons; if((m.type==='money'||!m.type)&&m.value>0) return totals.value>=m.value; return true; }

function applyPreferences(){
  document.documentElement.lang=appState.lang;
  document.documentElement.dir=dir();
  document.documentElement.dataset.theme=appState.theme;
  document.documentElement.dataset.font=appState.fontSize;
}
function getAllowedDates(typeId=appState.selectedTypeId){
  return (appState.data?.allowedDatesByType?.[typeId] || appState.data?.allowedDates || []).filter(Boolean);
}
function appError(title,msg){
  root.innerHTML = `<main class="login-page" dir="${dir()}"><section class="login-card"><img src="/icon.svg" class="login-logo" alt=""/><h1>${esc(title)}</h1><p>${esc(msg)}</p><button class="btn primary block" onclick="location.reload()">רענון</button></section></main>`;
}

function render(){ applyPreferences(); if(!appState.token || !appState.data){ root.innerHTML=loginView(); return; } root.innerHTML=`<div class="app-shell" dir="${dir()}"><header class="app-hero"><div><span class="eyebrow">OrderPilot</span><h1>${esc(tr(appState.data.branch.name))}</h1><p>${esc(tr(appState.data.network.name))} · ${esc(tr(appState.data.branch.city||''))}</p></div><button class="round-btn" data-screen="settings">${icon('settings')}</button></header><main class="app-main">${screenView()}</main><nav class="bottom-nav"><button class="${appState.screen==='order'?'active':''}" data-screen="order">${icon('cart')}<span>${t('catalog')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">${icon('box')}<span>${t('orders')}</span></button><button class="${appState.screen==='notifications'?'active':''}" data-screen="notifications">${icon('bell')}<span>${t('notifications')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">${icon('chat')}<span>${t('contact')}</span></button></nav></div>`; }
function loginView(){ applyPreferences(); return `<main class="login-page" dir="${dir()}"><section class="login-card"><img src="/icon.svg" class="login-logo" alt=""/><h1>${t('login')}</h1><form data-form="login" class="stack"><input name="networkCode" type="password" inputmode="numeric" autocomplete="off" placeholder="${t('networkCode')}" aria-label="${t('networkCode')}" required/><input name="branchCode" type="password" inputmode="numeric" autocomplete="off" placeholder="${t('branchCode')}" aria-label="${t('branchCode')}" required/><input name="password" type="password" autocomplete="current-password" placeholder="${t('password')}" aria-label="${t('password')}" required/><button class="btn primary block">${t('signIn')}</button></form><button class="text-btn" data-action="recover-store">${t('forgot')}</button><div class="lang-row">${['he','en','ar','ru'].map(l=>`<button class="chip ${appState.lang===l?'active':''}" data-lang="${l}">${l==='he'?'עברית':l==='en'?'English':l==='ar'?'العربية':'Русский'}</button>`).join('')}</div></section></main>`; }
function screenView(){ if(appState.screen==='orders') return ordersView(); if(appState.screen==='notifications') return notificationsView(); if(appState.screen==='settings') return settingsView(); if(appState.screen==='contact') return contactView(); return orderFlowView(); }
function orderFlowView(){ const types=appState.data.deliveryTypes||[]; if(!appState.selectedTypeId && types.length===1) appState.selectedTypeId=types[0].id; if(!appState.selectedTypeId) return typeStep(); if(!appState.selectedDate) return dateStep(); return catalogView(); }
function typeStep(){ return `<section class="flow-card enter"><h2>${t('chooseType')}</h2><div class="type-grid">${appState.data.deliveryTypes.map(type=>`<article class="type-card" data-select-type="${type.id}"><img src="${esc(type.imageUrl||'/icon.svg')}" alt=""/><div><h3>${esc(tr(type.title))}</h3><p>${esc(tr(type.desc||''))}</p></div><span>←</span></article>`).join('')}</div></section>`; }
function dateStep(){ const type=appState.data.deliveryTypes.find(t=>t.id===appState.selectedTypeId); const singleType=(appState.data.deliveryTypes||[]).length===1; const backAttr=singleType?'data-screen="home"':'data-action="back-type"'; return `<section class="flow-card enter"><button class="text-btn" ${backAttr}>${t('back')}</button><div class="selected-type"><img src="${esc(type?.imageUrl||'/icon.svg')}" alt=""/><div><span>${t('chooseType')}</span><b>${esc(tr(type?.title||''))}</b></div></div><button class="btn primary big pulse" data-action="open-date-picker">${t('chooseDateBtn')}</button></section>`; }
async function openDatePicker(){ try{ const data=await api(`/api/app/delivery-dates?deliveryTypeId=${encodeURIComponent(appState.selectedTypeId)}`); showModal(`<h2>${t('chooseDate')}</h2><div class="floating-dates">${(data.dates||[]).map(d=>`<button data-date-choice="${d.date}"><b>${esc(d.label)}</b>${d.exception?`<span>${t('exception')}</span>`:''}</button>`).join('') || `<p>${t('noDates')}</p>`}</div>`, 'date-popover'); }catch(e){ toast(e.message,'error'); } }
function productsForCurrent(){ const q=appState.search.trim().toLowerCase(); return appState.data.products.filter(p=>p.active!==false && (p.deliveryTypeIds||[]).includes(appState.selectedTypeId)).filter(p=>{ if(appState.selectedCategory!=='all' && p.category!==appState.selectedCategory) return false; if(appState.selectedSubcategory && p.subcategory!==appState.selectedSubcategory) return false; if(!q) return true; return [tr(p.name),p.name,p.barcode,tr(p.category),p.category,tr(p.subcategory),p.subcategory,(p.tags||[]).map(tr).join(' '),(p.kosherTypes||[]).map(tr).join(' ')].join(' ').toLowerCase().includes(q); }); }
function categoriesForCurrent(){ return [...new Set(appState.data.products.filter(p=>(p.deliveryTypeIds||[]).includes(appState.selectedTypeId)).map(p=>p.category).filter(Boolean))]; }
function subsForCat(){ if(appState.selectedCategory==='all') return []; return [...new Set(appState.data.products.filter(p=>p.category===appState.selectedCategory && (p.deliveryTypeIds||[]).includes(appState.selectedTypeId)).map(p=>p.subcategory).filter(Boolean))]; }
function catalogView(){ const products=productsForCurrent(); const cats=categoriesForCurrent(); const subs=subsForCat(); const totals=cartTotals(); return `<section class="catalog-screen enter"><div class="catalog-head"><button class="text-btn" data-action="back-date">${t('back')}</button><div><h2>${t('catalog')}</h2><p>${t('date')}: ${esc(appState.selectedDate)} · ${esc(tr(appState.data.deliveryTypes.find(t=>t.id===appState.selectedTypeId)?.title||''))}</p></div></div><div class="search-row"><input value="${esc(appState.search)}" data-search placeholder="${t('search')}" aria-label="${t('search')}"/><button class="btn ghost" data-action="scan-barcode">${t('scan')}</button></div><div class="category-rail"><button class="cat-chip ${appState.selectedCategory==='all'?'active':''}" data-cat="all">${t('all')}</button>${cats.map(c=>`<button class="cat-chip ${appState.selectedCategory===c?'active':''}" data-cat="${esc(c)}">${esc(tr(c))}</button>`).join('')}</div>${subs.length?`<div class="subcategory-rail"><button class="sub-chip ${!appState.selectedSubcategory?'active':''}" data-subcat="">${t('all')}</button>${subs.map(s=>`<button class="sub-chip ${appState.selectedSubcategory===s?'active':''}" data-subcat="${esc(s)}">${esc(tr(s))}</button>`).join('')}</div>`:''}<div class="product-grid">${products.map(productCard).join('') || `<p class="empty">${t('noProducts')}</p>`}</div>${totals.lines?cartBar(totals):''}</section>`; }
function productCard(p){ const q=appState.cart[p.id]||0; return `<article class="product-card" data-product="${p.id}">${img(p)}<div class="product-body"><div class="tags">${(p.tags||[]).slice(0,3).map(tag=>`<span>${esc(tr(tag))}</span>`).join('')}</div><h3>${esc(tr(p.name))}</h3><p>${esc(tr(p.category))} · ${esc(tr(p.subcategory||''))}</p><div class="product-meta"><span>${t('stock')}: ${Number(p.stockQty||0)}</span><span>${money(p.pricePerCarton||0)}</span></div><div class="qty-controls" onclick="event.stopPropagation()"><button data-qty-dec="${p.id}">−</button><input data-qty-input="${p.id}" type="number" min="0" value="${q}"/><button data-qty-inc="${p.id}">+</button></div></div></article>`; }
function cartBar(totals){ return `<div class="cart-bar"><div><b>${totals.cartons} ${t('cartons')}</b><span>${money(totals.value)} · ${t('minOrder')}: ${minText()}</span>${!minOk()?`<small class="danger-text">${t('missingMin')}</small>`:''}</div><button class="btn primary" data-action="open-cart">${t('summary')}</button></div>`; }
function productModal(p){ const hist=appState.data.orders.flatMap(o=>(o.items||[]).filter(i=>i.productId===p.id).map(i=>({date:o.deliveryDate, order:o.orderNumber, q:i.quantity, packed:i.packedQty??i.suppliedQty??i.quantity, missing:Math.max(0,Number(i.quantity||0)-Number((i.packedQty??i.suppliedQty??i.quantity)||0))}))).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,8); return `<h2>${esc(tr(p.name))}</h2><div class="product-modal-head">${img(p)}<div><p><b>${t('unitsPerCarton')}:</b> ${Number(p.unitsPerCarton||0)}</p><p><b>${t('kosher')}:</b> ${esc((p.kosherTypes||[]).map(tr).join(', '))}</p><p><b>${t('stock')}:</b> ${Number(p.stockQty||0)}</p><p><b>${t('barcode')}:</b> ${esc(p.barcode||'')}</p></div></div><h3>${t('history')}</h3><div class="history-list">${hist.map(h=>`<div><span>${esc(h.date)} · ${esc(h.order)}</span><b>${h.q} / ${h.packed} ${t('cartons')}</b>${h.missing?`<em>${t('missing')}: ${h.missing}</em>`:''}</div>`).join('') || '<p class="muted">—</p>'}</div><div class="modal-actions"><button class="btn primary" data-modal-close>${t('close')}</button></div>`; }
function cartModal(){ const items=cartItems(); const totals=cartTotals(); return `<h2>${t('summary')}</h2><div class="cart-lines">${items.map(({product,quantity})=>`<div class="cart-line"><div>${img(product)}<b>${esc(tr(product.name))}</b></div><div class="qty-controls"><button data-qty-dec="${product.id}">−</button><input data-qty-input="${product.id}" type="number" min="0" value="${quantity}"/><button data-qty-inc="${product.id}">+</button></div></div>`).join('')}</div><div class="summary-box"><div><span>${t('cartons')}</span><b>${totals.cartons}</b></div><div><span>${t('summary')}</span><b>${money(totals.value)}</b></div><div><span>${t('minOrder')}</span><b>${minText()}</b></div></div>${!minOk()?`<p class="danger-text">${t('missingMin')}</p>`:''}<div class="modal-actions"><button class="btn primary" data-action="submit-order" ${!minOk()?'disabled':''}>${t('submit')}</button><button class="btn ghost" data-modal-close>${t('close')}</button></div>`; }
function ordersView(){ return `<section class="list-screen enter"><h2>${t('orders')}</h2>${appState.data.orders.map(o=>`<article class="order-card"><div><b>${esc(o.orderNumber)}</b><span>${esc(tr(o.deliveryTypeTitle))} · ${esc(o.deliveryDate)}</span></div><span class="badge">${esc(tr(o.statusText))}</span>${Number(o.totals?.missingCartons||0)?`<p class="danger-text">${t('missing')}: ${o.totals.missingCartons} ${t('cartons')}</p>`:''}<details><summary>${t('productInfo')}</summary>${(o.items||[]).map(i=>`<div class="order-line"><span>${esc(tr(i.name))}</span><b>${i.quantity} / ${i.packedQty??i.suppliedQty??i.quantity}</b>${Number(i.missingQty||0)?`<em>${t('missing')}: ${i.missingQty}</em>`:''}</div>`).join('')}</details></article>`).join('')}</section>`; }
function notificationsView(){ return `<section class="list-screen enter"><h2>${t('notifications')}</h2>${(appState.data.notifications||[]).map(n=>`<article class="note-card"><b>${esc(tr(n.title))}</b><p>${esc(tr(n.message))}</p><span>${esc((n.createdAt||'').slice(0,10))}</span></article>`).join('')||'<p class="empty">—</p>'}</section>`; }
function settingsView(){ return `<section class="flow-card enter"><h2>${t('appSettings')}</h2><label>${t('language')}<select data-lang-select>${['he','en','ar','ru'].map(l=>`<option value="${l}" ${l===appState.lang?'selected':''}>${l==='he'?'עברית':l==='en'?'English':l==='ar'?'العربية':'Русский'}</option>`).join('')}</select></label><label>${t('theme')}<select data-theme-select><option value="light" ${appState.theme==='light'?'selected':''}>${t('light')}</option><option value="dark" ${appState.theme==='dark'?'selected':''}>${t('dark')}</option></select></label><label>${t('fontSize')}<select data-font-select><option value="small" ${appState.fontSize==='small'?'selected':''}>${t('small')}</option><option value="normal" ${appState.fontSize==='normal'?'selected':''}>${t('normal')}</option><option value="large" ${appState.fontSize==='large'?'selected':''}>${t('large')}</option></select></label><button class="btn ghost block" data-screen="orders">${t('orders')}</button><button class="btn ghost block" data-action="logout">${t('logout')}</button></section>`; }
function contactView(){ return `<section class="flow-card enter"><h2>${t('contact')}</h2><form data-form="contact" class="stack"><input name="subject" placeholder="${t('subject')}" required/><textarea name="message" placeholder="${t('message')}" required></textarea><input name="phone" placeholder="${t('phone')}" value="${esc(appState.data.branch.phone||'')}"/><input name="email" placeholder="${t('email')}" value="${esc(appState.data.branch.email||'')}"/><button class="btn primary">${t('send')}</button></form></section>`; }
function passwordChangeForm(){ return `<h2>${t('passwordChange')}</h2><form data-form="change-password" class="stack"><input name="newPassword" type="password" placeholder="${t('newPassword')}" required/><button class="btn primary">${t('save')}</button></form>`; }
function recoverForm(){ return `<h2>${t('forgot')}</h2><form data-form="recover" class="stack"><input name="networkCode" placeholder="${t('networkCode')}"/><input name="branchCode" placeholder="${t('branchCode')}"/><input name="email" placeholder="${t('email')}"/><button class="btn primary">${t('send')}</button></form>`; }
function resetForm(payload, code){ return `<h2>${t('forgot')}</h2><form data-form="reset" class="stack"><input name="networkCode" value="${esc(payload.networkCode)}"/><input name="branchCode" value="${esc(payload.branchCode)}"/><input name="resetCode" value="${esc(code)}" placeholder="${t('resetCode')}"/><input name="newPassword" type="password" placeholder="${t('newPassword')}"/><button class="btn primary">${t('save')}</button></form>`; }

function manualBarcodeForm(){ return `<h2>${t('manualBarcode')}</h2><form data-form="manual-barcode" class="stack"><input name="barcode" inputmode="numeric" placeholder="${t('barcode')}" required/><button class="btn primary">${t('search')}</button></form>`; }

async function scanBarcode(){ showModal(`<h2>${t('scan')}</h2><div class="scanner-box"><video autoplay playsinline></video><div class="scan-frame"><span></span></div></div><p>${t('scanHint')}</p><button class="btn ghost" data-action="manual-barcode">${t('manualBarcode')}</button>`, 'scanner-modal'); const video=document.querySelector('.scanner-box video'); try{ const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); video.srcObject=stream; if('BarcodeDetector' in window){ const detector=new BarcodeDetector({formats:['ean_13','ean_8','code_128','upc_a','upc_e']}); const loop=async()=>{ if(!video.isConnected){ stream.getTracks().forEach(t=>t.stop()); return; } try{ const codes=await detector.detect(video); if(codes[0]){ stream.getTracks().forEach(t=>t.stop()); closeModal(); findBarcode(codes[0].rawValue); return; } }catch{} requestAnimationFrame(loop); }; loop(); } }catch(e){ toast(e.message,'error'); } }
function findBarcode(code){ appState.search=String(code||''); const p=appState.data.products.find(x=>String(x.barcode)===String(code)); render(); if(p) showModal(productModal(p)); else toast(t('barcodeNotFound')); }
async function submitOrder(){ try{ const items=cartItems().map(x=>({productId:x.product.id,quantity:x.quantity})); const data=await api('/api/app/orders',{method:'POST',body:JSON.stringify({deliveryTypeId:appState.selectedTypeId,deliveryDate:appState.selectedDate,items})}); appState.cart={}; closeModal(); await bootstrap(); appState.screen='orders'; render(); toast(`${t('submit')} · ${data.order.orderNumber}`,'success'); }catch(e){ toast(e.message,'error'); } }
function formObject(form){ return Object.fromEntries(new FormData(form).entries()); }
async function handleSubmit(e){ const form=e.target.closest('form[data-form]'); if(!form) return; e.preventDefault(); const type=form.dataset.form; try{ if(type==='login'){ const data=await api('/api/auth/login',{method:'POST',body:JSON.stringify(formObject(form))}); appState.token=data.token; localStorage.setItem(tokenKey,appState.token); window.OrderPilotMobile?.saveToken?.(appState.token); if(data.passwordChangeRequired){ showModal(passwordChangeForm()); } else { appState.data=data.bootstrap; render(); } return; } if(type==='change-password'){ const data=await api('/api/app/password/change',{method:'POST',body:JSON.stringify(formObject(form))}); appState.data=data.bootstrap; closeModal(); render(); return; } if(type==='recover'){ const payload=formObject(form); const data=await api('/api/auth/recover',{method:'POST',body:JSON.stringify(payload)}); showModal(resetForm(payload,data.demoResetCode)); return; } if(type==='reset'){ await api('/api/auth/reset',{method:'POST',body:JSON.stringify(formObject(form))}); closeModal(); toast('OK'); return; } if(type==='manual-barcode'){ const obj=formObject(form); closeModal(); findBarcode(obj.barcode); return; } if(type==='contact'){ await api('/api/app/contact',{method:'POST',body:JSON.stringify(formObject(form))}); toast('✓'); form.reset(); return; } }catch(err){ toast(err.message,'error'); } }
function handleClick(e){ const clearSearch=e.target.closest('[data-clear-search]'); if(clearSearch){ appState.search=''; render(); const el=document.querySelector('[data-search]'); if(el) el.focus(); return; } const screen=e.target.closest('[data-screen]'); if(screen){ appState.screen=screen.dataset.screen; render(); return; } const lang=e.target.closest('[data-lang]'); if(lang){ appState.lang=lang.dataset.lang; localStorage.setItem(langKey,appState.lang); render(); return; } const type=e.target.closest('[data-select-type]'); if(type){ appState.selectedTypeId=type.dataset.selectType; appState.selectedDate=''; appState.selectedCategory='all'; appState.selectedSubcategory=''; render(); return; } const action=e.target.closest('[data-action]')?.dataset.action; if(action==='back-type'){ appState.selectedTypeId=''; render(); return; } if(action==='back-date'){ appState.selectedDate=''; render(); return; } if(action==='open-date-picker'){ openDatePicker(); return; } if(action==='open-cart'){ showModal(cartModal(),'cart-modal'); return; } if(action==='submit-order'){ submitOrder(); return; } if(action==='scan-barcode'){ scanBarcode(); return; } if(action==='manual-barcode'){ showModal(manualBarcodeForm()); return; } if(action==='recover-store'){ showModal(recoverForm()); return; } if(action==='logout'){ localStorage.removeItem(tokenKey); window.OrderPilotMobile?.removeToken?.(); appState.token=''; appState.data=null; render(); return; } const date=e.target.closest('[data-date-choice]'); if(date){ appState.selectedDate=date.dataset.dateChoice; closeModal(); render(); return; } const cat=e.target.closest('[data-cat]'); if(cat){ appState.selectedCategory=cat.dataset.cat; appState.selectedSubcategory=''; render(); return; } const sub=e.target.closest('[data-subcat]'); if(sub){ appState.selectedSubcategory=sub.dataset.subcat; render(); return; } const p=e.target.closest('[data-product]'); if(p){ const product=appState.data.products.find(x=>x.id===p.dataset.product); showModal(productModal(product)); return; } const inc=e.target.closest('[data-qty-inc]'); if(inc){ setQty(inc.dataset.qtyInc,(appState.cart[inc.dataset.qtyInc]||0)+1); return; } const dec=e.target.closest('[data-qty-dec]'); if(dec){ setQty(dec.dataset.qtyDec,(appState.cart[dec.dataset.qtyDec]||0)-1); return; } }
function handleInput(e){ if(e.target.matches('[data-search]')){ const pos=e.target.selectionStart; appState.search=e.target.value; render(); const el=document.querySelector('[data-search]'); if(el){ el.focus(); try{ el.setSelectionRange(pos,pos); }catch(_){} } return; } if(e.target.matches('[data-qty-input]')) setQty(e.target.dataset.qtyInput,e.target.value); if(e.target.matches('[data-lang-select]')){ appState.lang=e.target.value; localStorage.setItem(langKey,appState.lang); render(); } if(e.target.matches('[data-theme-select]')){ appState.theme=e.target.value; localStorage.setItem(themeKey,appState.theme); render(); } if(e.target.matches('[data-font-select]')){ appState.fontSize=e.target.value; localStorage.setItem(fontKey,appState.fontSize); render(); } }
document.addEventListener('submit',handleSubmit); document.addEventListener('click',handleClick); document.addEventListener('input',handleInput);
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });
(async function boot(){ applyPreferences(); try{ const branding=await api('/api/branding'); applyBrandColors(branding.brandColors); }catch{} try{ if(!appState.token && window.OrderPilotMobile?.getToken){ appState.token = await window.OrderPilotMobile.getToken(); if(appState.token) localStorage.setItem(tokenKey, appState.token); } if(appState.token) await bootstrap(); render(); } catch(err){ localStorage.removeItem(tokenKey); window.OrderPilotMobile?.removeToken?.(); appState.token=''; appState.data=null; toast(err.message||'שגיאת טעינה'); render(); } })();

/* v17 focused app patch: secure login, stable scanner, readable themes */
function loginView(){ applyPreferences(); return `<main class="login-page" dir="${dir()}"><section class="login-card"><img src="/icon.svg" class="login-logo" alt=""/><h1>${t('login')}</h1><form data-form="login" class="stack"><input name="networkCode" type="password" inputmode="numeric" autocomplete="off" placeholder="${t('networkCode')}" aria-label="${t('networkCode')}" required/><input name="branchCode" type="password" inputmode="numeric" autocomplete="off" placeholder="${t('branchCode')}" aria-label="${t('branchCode')}" required/><input name="password" type="password" autocomplete="current-password" placeholder="${t('password')}" aria-label="${t('password')}" required/><button class="btn primary block">${t('signIn')}</button></form><button class="text-btn" data-action="recover-store">${t('forgot')}</button><div class="lang-row">${['he','en','ar','ru'].map(l=>`<button class="chip ${appState.lang===l?'active':''}" data-lang="${l}">${l==='he'?'עברית':l==='en'?'English':l==='ar'?'العربية':'Русский'}</button>`).join('')}</div></section></main>`; }
function render(){ applyPreferences(); if(!appState.token || !appState.data){ root.innerHTML=loginView(); return; } root.innerHTML=`<div class="app-shell" dir="${dir()}"><header class="app-hero"><div><span class="eyebrow">OrderPilot</span><h1>${esc(tr(appState.data.branch.name))}</h1><p>${esc(tr(appState.data.network.name))} · ${esc(tr(appState.data.branch.city||''))}</p></div><button class="round-btn" data-screen="settings">${icon('settings')}</button></header><main class="app-main">${screenView()}</main><nav class="bottom-nav"><button class="${appState.screen==='order'?'active':''}" data-screen="order">${icon('cart')}<span>${t('catalog')}</span></button><button class="${appState.screen==='notifications'?'active':''}" data-screen="notifications">${icon('bell')}<span>${t('notifications')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">${icon('chat')}<span>${t('contact')}</span></button><button class="${appState.screen==='settings'?'active':''}" data-screen="settings">${icon('settings')}<span>${t('settings')}</span></button></nav></div>`; }
async function openDatePicker(){ try{ const data=await api(`/api/app/delivery-dates?deliveryTypeId=${encodeURIComponent(appState.selectedTypeId)}`); const orders=appState.data.orders||[]; showModal(`<h2>${t('chooseDate')}</h2><div class="floating-dates">${(data.dates||[]).map(d=>{ const dup=orders.find(o=>o.deliveryTypeId===appState.selectedTypeId && o.deliveryDate===d.date && o.status!=='cancelled'); return `<button data-date-choice="${d.date}" ${dup?'data-existing-order="'+dup.id+'"':''}><b>${esc(d.label)}</b>${d.exception?`<span>${t('exception')}</span>`:''}${dup?`<em>כבר קיימת הזמנה · ${esc(dup.orderNumber)}</em>`:''}</button>`; }).join('') || `<p>${t('noDates')}</p>`}</div>`, 'date-popover'); }catch(e){ toast(e.message,'error'); } }
function productModal(p){ const q=appState.cart[p.id]||0; const hist=appState.data.orders.flatMap(o=>(o.items||[]).filter(i=>i.productId===p.id).map(i=>({date:o.deliveryDate, order:o.orderNumber, q:i.quantity, packed:i.packedQty??i.suppliedQty??i.quantity, missing:Math.max(0,Number(i.quantity||0)-Number((i.packedQty??i.suppliedQty??i.quantity)||0))}))).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,8); return `<h2>${esc(tr(p.name))}</h2><div class="product-modal-head">${img(p)}<div><p><b>${t('unitsPerCarton')}:</b> ${Number(p.unitsPerCarton||0)}</p><p><b>${t('kosher')}:</b> ${esc((p.kosherTypes||[]).map(tr).join(', '))}</p><p><b>${t('stock')}:</b> ${Number(p.stockQty||0)}</p><p><b>${t('barcode')}:</b> ${esc(p.barcode||'')}</p><div class="qty-controls modal-qty"><button data-qty-dec="${p.id}">−</button><input data-qty-input="${p.id}" type="number" min="0" value="${q}"/><button data-qty-inc="${p.id}">+</button></div></div></div><h3>${t('history')}</h3><div class="history-list">${hist.map(h=>`<div><span>${esc(h.date)} · ${esc(h.order)}</span><b>${h.q} / ${h.packed} ${t('cartons')}</b>${h.missing?`<em>${t('missing')}: ${h.missing}</em>`:''}</div>`).join('') || '<p class="muted">—</p>'}</div><div class="modal-actions"><button class="btn primary" data-modal-close>${t('close')}</button></div>`; }
function recommendedStep(){ const inCart=new Set(Object.keys(appState.cart).filter(id=>appState.cart[id]>0)); const rec=(appState.data.products||[]).filter(p=>!inCart.has(p.id) && (p.deliveryTypeIds||[]).includes(appState.selectedTypeId) && (p.usual||p.trending||p.newItem||Number(p.recommendedQty||0)>0)).slice(0,6); if(!rec.length) return submitOrder(); showModal(`<h2>אולי שכחת להזמין</h2><p class="muted">מוצרים שמוזמנים בדרך כלל / חמים / חדשים ולא נמצאים בסל.</p><div class="product-grid modal-products">${rec.map(productCard).join('')}</div><div class="modal-actions"><button class="btn primary" data-action="submit-order-final">שליחת הזמנה</button><button class="btn ghost" data-modal-close>חזרה לסל</button></div>`); }
async function scanBarcode(){ showModal(`<h2>${t('scan')}</h2><div class="scanner-box stable"><video autoplay muted playsinline></video><div class="scan-frame"><span></span></div></div><p>${t('scanHint')}</p><button class="btn ghost" data-action="manual-barcode">${t('manualBarcode')}</button>`, 'scanner-modal'); const video=document.querySelector('.scanner-box video'); try{ const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}, width:{ideal:1280}, height:{ideal:720}}}); video.srcObject=stream; await video.play().catch(()=>{}); if('BarcodeDetector' in window){ const detector=new BarcodeDetector({formats:['ean_13','ean_8','code_128','upc_a','upc_e']}); let busy=false,last=0; const loop=async(ts)=>{ if(!video.isConnected){ stream.getTracks().forEach(t=>t.stop()); return; } if(!busy && ts-last>350){ busy=true; last=ts; try{ const codes=await detector.detect(video); if(codes[0]){ stream.getTracks().forEach(t=>t.stop()); closeModal(); findBarcode(codes[0].rawValue); return; } }catch{} busy=false; } requestAnimationFrame(loop); }; requestAnimationFrame(loop); } }catch(e){ toast(e.message || 'לא ניתן לפתוח מצלמה'); } }
const oldCartModal = cartModal;
function cartModal(){ const items=cartItems(); const totals=cartTotals(); return `<h2>${t('summary')}</h2><div class="cart-lines">${items.map(({product,quantity})=>`<div class="cart-line"><div>${img(product)}<b>${esc(tr(product.name))}</b></div><div class="qty-controls"><button data-qty-dec="${product.id}">−</button><input data-qty-input="${product.id}" type="number" min="0" value="${quantity}"/><button data-qty-inc="${product.id}">+</button></div></div>`).join('')}</div><div class="summary-box"><div><b>${totals.lines}</b><span>${t('cart')}</span></div><div><b>${totals.cartons}</b><span>${t('cartons')}</span></div><div><b>${money(totals.value)}</b><span>${t('summary')}</span></div></div>${!minOk()?`<p class="danger-text">${t('missingMin')} · ${t('minOrder')}: ${minText()}</p>`:''}<div class="modal-actions"><button class="btn primary" data-action="pre-submit-recommendations" ${!minOk()?'disabled':''}>${t('submit')}</button><button class="btn ghost" data-modal-close>${t('close')}</button></div>`; }
const oldHandleAppClick = document.onclick;
document.addEventListener('click', e=>{ const choice=e.target.closest('[data-date-choice]'); if(choice && choice.dataset.existingOrder){ e.preventDefault(); e.stopPropagation(); const order=(appState.data.orders||[]).find(o=>o.id===choice.dataset.existingOrder); showModal(`<h2>${t('duplicateOrderTitle')}</h2><p>${t('duplicateOrderBody')} ${esc(order?.orderNumber||'')}.</p><div class="modal-actions"><button class="btn primary" data-screen="orders" data-modal-close>${t('goToOrders')}</button><button class="btn ghost" data-modal-close>${t('chooseOtherDate')}</button></div>`); return; } const pre=e.target.closest('[data-action="pre-submit-recommendations"]'); if(pre){ e.preventDefault(); e.stopPropagation(); recommendedStep(); } const final=e.target.closest('[data-action="submit-order-final"]'); if(final){ e.preventDefault(); e.stopPropagation(); submitOrder(); } }, true);


/* v18 app UX/contrast/i18n patch */
function render(){ applyPreferences(); if(!appState.token || !appState.data){ root.innerHTML=loginView(); return; } root.innerHTML=`<div class="app-shell" dir="${dir()}"><header class="app-hero"><div><span class="eyebrow">OrderPilot</span><h1>${esc(tr(appState.data.branch.name))}</h1><p>${esc(tr(appState.data.network.name))} · ${esc(tr(appState.data.branch.city||''))}</p></div><button class="round-btn" data-screen="settings">${icon('settings')}</button></header><main class="app-main">${screenView()}</main><nav class="bottom-nav"><button class="${appState.screen==='order'?'active':''}" data-screen="order">${icon('cart')}<span>${t('catalog')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">${icon('box')}<span>${t('orders')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">${icon('chat')}<span>${t('contact')}</span></button><button class="${appState.screen==='settings'?'active':''}" data-screen="settings">${icon('settings')}<span>${t('settings')}</span></button></nav></div>`; }
function notificationsView(){ return ordersView(); }
function productCard(p){ const q=appState.cart[p.id]||0; return `<article class="product-card"><button class="product-open" data-product="${p.id}">${img(p)}<div class="product-body"><div class="tags">${(p.tags||[]).slice(0,3).map(tag=>`<span>${esc(tr(tag))}</span>`).join('')}</div><h3>${esc(tr(p.name))}</h3><p>${esc(tr(p.category))} · ${esc(tr(p.subcategory||''))}</p><div class="product-meta"><span>${t('stock')}: ${Number(p.stockQty||0)}</span><span>${money(p.pricePerCarton||0)}</span></div></div></button><div class="qty-controls"><button data-qty-dec="${p.id}" type="button">−</button><input data-qty-input="${p.id}" type="number" min="0" value="${q}"/><button data-qty-inc="${p.id}" type="button">+</button></div></article>`; }
function productModal(p){ const q=appState.cart[p.id]||0; const food=p.foodType||p.dairyType||'פרווה'; const hist=appState.data.orders.flatMap(o=>(o.items||[]).filter(i=>i.productId===p.id).map(i=>({date:o.deliveryDate, order:o.orderNumber, q:i.quantity, packed:i.packedQty??i.suppliedQty??i.quantity, missing:Math.max(0,Number(i.quantity||0)-Number((i.packedQty??i.suppliedQty??i.quantity)||0))}))).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,8); return `<h2>${esc(tr(p.name))}</h2><div class="product-modal-head">${img(p)}<div><p><b>${t('unitsPerCarton')}:</b> ${Number(p.unitsPerCarton||0)}</p><p><b>${t('kosher')}:</b> ${esc((p.kosherTypes||[]).map(tr).join(', '))}</p><p><b>סוג:</b> ${esc(tr(food))}</p><p><b>${t('stock')}:</b> ${Number(p.stockQty||0)}</p><p><b>${t('barcode')}:</b> ${esc(p.barcode||'')}</p><div class="qty-controls modal-qty"><button data-qty-dec="${p.id}" type="button">−</button><input data-qty-input="${p.id}" type="number" min="0" value="${q}"/><button data-qty-inc="${p.id}" type="button">+</button></div></div></div><h3>${t('history')}</h3><div class="history-list">${hist.map(h=>`<div><span>${esc(h.date)} · ${esc(h.order)}</span><b>${h.q} / ${h.packed} ${t('cartons')}</b>${h.missing?`<em>${t('missing')}: ${h.missing}</em>`:''}</div>`).join('') || '<p class="muted">—</p>'}</div><div class="modal-actions"><button class="btn primary" data-modal-close>${t('close')}</button></div>`; }
const oldTrV18 = tr;
function tr(value){ const s=String(value||''); if(!s) return ''; if(appState.lang==='he') return s; const fromServer=appState.data?.translations?.[s]?.[appState.lang]; if(fromServer) return fromServer; const local={ 'פרווה':{en:'Pareve',ar:'بارفي',ru:'Парве'}, 'חלב ישראל':{en:'Chalav Yisrael',ar:'حليب إسرائيل',ru:'Халав Исраэль'}, 'אבקת חלב נוכרי':{en:'Non-Jewish milk powder',ar:'مسحوق حليب أجنبي',ru:'Сухое молоко'}, 'בשרי':{en:'Meat',ar:'لحومي',ru:'Мясной'}, 'הזמנה רגילה':{en:'Regular order',ar:'طلب عادي',ru:'Обычный заказ'}, 'אספקה בקירור':{en:'Chilled delivery',ar:'توصيل مبرد',ru:'Охлажденная поставка'} }; return local[s]?.[appState.lang] || s; }
document.addEventListener('click', e=>{ const p=e.target.closest('.product-open[data-product]'); if(p){ e.preventDefault(); e.stopPropagation(); const product=appState.data.products.find(x=>x.id===p.dataset.product); if(product) showModal(productModal(product)); } }, true);

/* v19 app patch: stable dark mode, cart access, notifications in settings, stronger translation pass */
(function(){
  const oldTr = tr;
  tr = function(value){
    const raw = String(value ?? '');
    if(!raw) return '';
    const fromServer = appState.data?.translations?.[raw]?.[appState.lang];
    if(fromServer) return fromServer;
    const local = dict[appState.lang] || dict.he;
    return local[raw] || oldTr(raw);
  };

  settingsView = function(){
    return `<section class="flow-card enter settings-card"><h2>${t('appSettings')}</h2><label>${t('language')}<select data-lang-select>${['he','en','ar','ru'].map(l=>`<option value="${l}" ${l===appState.lang?'selected':''}>${l==='he'?'עברית':l==='en'?'English':l==='ar'?'العربية':'Русский'}</option>`).join('')}</select></label><label>${t('theme')}<select data-theme-select><option value="light" ${appState.theme==='light'?'selected':''}>${t('light')}</option><option value="dark" ${appState.theme==='dark'?'selected':''}>${t('dark')}</option></select></label><label>${t('fontSize')}<select data-font-select><option value="small" ${appState.fontSize==='small'?'selected':''}>${t('small')}</option><option value="normal" ${appState.fontSize==='normal'?'selected':''}>${t('normal')}</option><option value="large" ${appState.fontSize==='large'?'selected':''}>${t('large')}</option></select></label><button class="btn ghost block" data-action="open-notifications">${icon('bell')} ${t('notifications')}</button><button class="btn ghost block" data-action="logout">${t('logout')}</button></section>`;
  };

  const oldCartBar = cartBar;
  cartBar = function(totals){
    return oldCartBar(totals);
  };

  document.addEventListener('click', e=>{
    const notif=e.target.closest('[data-action="open-notifications"]');
    if(notif){ e.preventDefault(); showModal(`<h2>${t('notifications')}</h2><div class="notifications-mini">${(appState.data.notifications||[]).slice(0,12).map(n=>`<article class="note-card"><b>${esc(tr(n.title))}</b><p>${esc(tr(n.message))}</p><span>${esc((n.createdAt||'').slice(0,10))}</span></article>`).join('') || '<p class="empty">—</p>'}</div><div class="modal-actions"><button class="btn primary" data-modal-close>${t('close')}</button></div>`); }
  }, true);

  document.addEventListener('click', e=>{
    const inc=e.target.closest('[data-qty-inc]');
    const dec=e.target.closest('[data-qty-dec]');
    if(inc || dec){
      e.preventDefault();
      e.stopPropagation();
      const id=(inc||dec).dataset.qtyInc || (inc||dec).dataset.qtyDec;
      setQty(id,(appState.cart[id]||0)+(inc?1:-1));
    }
  }, true);
})();


/* v20 patch: contact replies, editable order history and localized dates */
(function(){
  const dateLocaleMap = { he:'he-IL', en:'en-US', ar:'ar', ru:'ru-RU' };
  window.formatAppDate = function(value, opts){
    if(!value) return '';
    const raw = String(value);
    const d = raw.length <= 10 ? new Date(raw + 'T12:00:00') : new Date(raw);
    if(Number.isNaN(d.getTime())) return raw;
    return new Intl.DateTimeFormat(dateLocaleMap[appState.lang] || 'he-IL', opts || {weekday:'short', day:'2-digit', month:'short', year:'numeric'}).format(d);
  };
  const localExtra={
    he:{ edit:'עריכה', contactSentTitle:'הפנייה נשלחה', contactSentBody:'הפנייה נשלחה לחברה. כשיתקבל מענה תופיע התראה בהגדרות ובמסך ההתראות.', reply:'תגובה', contactReply:'תגובת החברה', editable:'פתוחה לעריכה', openExisting:'מעבר לעריכה', chooseOtherDate:'בחירת תאריך אחר' },
    en:{ edit:'Edit', contactSentTitle:'Message sent', contactSentBody:'Your message was sent to the company. When a reply arrives, it will appear in notifications.', reply:'Reply', contactReply:'Company reply', editable:'Editable', openExisting:'Edit existing order', chooseOtherDate:'Choose another date' },
    ar:{ edit:'تعديل', contactSentTitle:'تم إرسال الطلب', contactSentBody:'تم إرسال الرسالة للشركة. عند وصول رد سيظهر في الإشعارات.', reply:'رد', contactReply:'رد الشركة', editable:'قابل للتعديل', openExisting:'تعديل الطلب الحالي', chooseOtherDate:'اختيار تاريخ آخر' },
    ru:{ edit:'Редактировать', contactSentTitle:'Сообщение отправлено', contactSentBody:'Обращение отправлено компании. Ответ появится в уведомлениях.', reply:'Ответ', contactReply:'Ответ компании', editable:'Можно редактировать', openExisting:'Редактировать заказ', chooseOtherDate:'Выбрать другую дату' }
  };
  const oldT=t;
  t=function(key){ return localExtra[appState.lang]?.[key] || oldT(key); };
  function canEditOrder(o){ return !!(o && o.canEdit && !['approved','picking','prepared','supplied','cancelled'].includes(o.status)); }
  function loadOrderForEdit(order){
    if(!canEditOrder(order)){ toast(tr(order?.statusText || 'אי אפשר לערוך הזמנה זו')); return; }
    appState.selectedTypeId=order.deliveryTypeId;
    appState.selectedDate=order.deliveryDate;
    appState.cart={};
    (order.items||[]).forEach(i=>{ appState.cart[i.productId]=Number(i.quantity||0); });
    appState.editingOrderId=order.id;
    appState.screen='order';
    closeModal();
    render();
    toast(`${t('edit')} ${order.orderNumber}`);
  }
  window.loadOrderForEdit=loadOrderForEdit;
  ordersView=function(){
    const rows=(appState.data.orders||[]).map(o=>`<article class="order-card ${canEditOrder(o)?'editable-order':''}"><div><b>${esc(o.orderNumber)}</b><span>${esc(tr(o.deliveryTypeTitle))} · ${esc(formatAppDate(o.deliveryDate))}</span></div><div class="order-status-row"><span class="badge ${o.status==='closed'||o.status==='supplied'?'done':''}">${esc(tr(o.statusText))}</span>${canEditOrder(o)?`<button class="btn sm primary" data-edit-history-order="${esc(o.id)}">${t('edit')}</button>`:''}</div>${Number(o.totals?.missingCartons||0)?`<p class="danger-text">${t('missing')}: ${o.totals.missingCartons} ${t('cartons')}</p>`:''}<details><summary>${t('productInfo')}</summary>${(o.items||[]).map(i=>`<div class="order-line"><span>${esc(tr(i.name))}</span><b>${i.quantity} / ${i.packedQty??i.suppliedQty??i.quantity}</b>${Number(i.missingQty||0)?`<em>${t('missing')}: ${i.missingQty}</em>`:''}</div>`).join('')}</details></article>`).join('');
    return `<section class="list-screen enter"><h2>${t('orders')}</h2>${rows || '<p class="empty">—</p>'}</section>`;
  };
  const oldOpenDatePicker = openDatePicker;
  openDatePicker=async function(){
    try{
      const data=await api(`/api/app/delivery-dates?deliveryTypeId=${encodeURIComponent(appState.selectedTypeId)}`);
      const orders=appState.data.orders||[];
      showModal(`<h2>${t('chooseDate')}</h2><div class="floating-dates">${(data.dates||[]).map(d=>{ const dup=orders.find(o=>o.deliveryTypeId===appState.selectedTypeId && o.deliveryDate===d.date && o.status!=='cancelled'); return `<button data-date-choice="${d.date}" ${dup?'data-existing-order="'+dup.id+'"':''}><b>${esc(formatAppDate(d.date))}</b>${d.exception?`<span>${t('exception')}</span>`:''}${dup?`<em>${t('editable')} · ${esc(dup.orderNumber)}</em>`:''}</button>`; }).join('') || `<p>${t('noDates')}</p>`}</div>`, 'date-popover');
    }catch(e){ toast(e.message,'error'); }
  };
  const oldProductModal = productModal;
  productModal=function(p){
    const html=oldProductModal(p);
    return html.replace(/(<div class="history-list">)([\s\S]*?)(<\/div><div class="modal-actions">)/, (m,a,b,c)=> a + b.replace(/<span>([^<]+?) ·/g, (x,date)=>`<span>${esc(formatAppDate(date.trim()))} ·`) + c);
  };
  notificationsView=function(){
    return `<section class="list-screen enter"><h2>${t('notifications')}</h2>${(appState.data.notifications||[]).map(n=>`<article class="note-card ${n.type==='contact-reply'?'reply-note':''}"><b>${esc(tr(n.title))}</b><p>${esc(tr(n.message))}</p><span>${esc(formatAppDate(n.createdAt,{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}))}</span></article>`).join('')||'<p class="empty">—</p>'}</section>`;
  };
  const oldSettingsView=settingsView;
  settingsView=function(){
    return oldSettingsView().replace(/\$\{t\('notifications'\)\}/g, t('notifications'));
  };
  contactView=function(){ return `<section class="flow-card enter"><h2>${t('contact')}</h2><p class="muted">${t('contactSentBody')}</p><form data-form="contact" class="stack contact-form"><input name="subject" placeholder="${t('subject')}" required/><textarea name="message" placeholder="${t('message')}" required></textarea><input name="phone" placeholder="${t('phone')}" value="${esc(appState.data.branch.phone||'')}"/><input name="email" placeholder="${t('email')}" value="${esc(appState.data.branch.email||'')}"/><button class="btn primary">${t('send')}</button></form></section>`; };
  const oldHandleSubmitV20=handleSubmit;
  handleSubmit=async function(e){
    const form=e.target.closest('form[data-form]');
    if(!form || form.dataset.form!=='contact') return oldHandleSubmitV20(e);
    e.preventDefault();
    try{
      const data=await api('/api/app/contact',{method:'POST',body:JSON.stringify(formObject(form))});
      await bootstrap();
      showModal(`<h2>${t('contactSentTitle')}</h2><p>${t('contactSentBody')}</p><div class="contact-ticket"><b>#${esc(data.contact?.id || '')}</b><span>${esc(formatAppDate(data.contact?.createdAt,{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}))}</span></div><div class="modal-actions"><button class="btn primary" data-modal-close>${t('close')}</button></div>`);
      form.reset();
      render();
    }catch(err){ toast(err.message,'error'); }
  };
  const oldSubmitOrderV20=submitOrder;
  submitOrder=async function(){
    try{
      const items=cartItems().map(x=>({productId:x.product.id,quantity:x.quantity}));
      const url=appState.editingOrderId ? `/api/app/orders/${encodeURIComponent(appState.editingOrderId)}` : '/api/app/orders';
      const method=appState.editingOrderId ? 'PUT' : 'POST';
      const data=await api(url,{method,body:JSON.stringify({deliveryTypeId:appState.selectedTypeId,deliveryDate:appState.selectedDate,items})});
      appState.cart={}; appState.editingOrderId=''; closeModal(); await bootstrap(); appState.screen='orders'; render(); toast(`${t('submit')} · ${(data.order||{}).orderNumber||''}`,'success');
    }catch(e){ toast(e.message,'error'); }
  };
  document.addEventListener('click', e=>{
    const edit=e.target.closest('[data-edit-history-order]');
    if(edit){ e.preventDefault(); e.stopPropagation(); const order=(appState.data.orders||[]).find(o=>o.id===edit.dataset.editHistoryOrder); loadOrderForEdit(order); return; }
    const existing=e.target.closest('[data-existing-order]');
    if(existing){ const order=(appState.data.orders||[]).find(o=>o.id===existing.dataset.existingOrder); if(order && canEditOrder(order)){ e.preventDefault(); e.stopPropagation(); showModal(`<div class="confirm-dialog"><div class="confirm-icon warn">${icon('alert-triangle')}</div><h2>${t('editable')}</h2><p>${esc(order.orderNumber)} · ${esc(formatAppDate(order.deliveryDate))}</p><div class="modal-actions"><button class="btn primary" data-edit-history-order="${esc(order.id)}">${t('openExisting')}</button><button class="btn ghost" data-modal-close>${t('chooseOtherDate')}</button></div></div>`); } }
  }, true);
})();

/* v22 patch: product history table, similar alternatives, push registration and hidden debug report */
(function(){
  const extra={
    he:{ similarProducts:'מוצרים דומים', alternativeProducts:'בחר פריטים חלופיים', chooseSimilar:'בחר מוצרים דומים', ordered:'הוזמן', supplied:'סופק', orderNo:'הזמנה', noHistory:'אין היסטוריית הזמנות למוצר הזה', addToCart:'הוספה לסל', debugSent:'דוח דיבאג נשלח למערכת', debugFailed:'שליחת דיבאג נכשלה', pushEnabled:'התראות טלפון פעילות', enablePush:'הפעל התראות קופצות', openNotifications:'פתיחת התראות' },
    en:{ similarProducts:'Similar products', alternativeProducts:'Choose alternatives', chooseSimilar:'Choose similar products', ordered:'Ordered', supplied:'Supplied', orderNo:'Order', noHistory:'No order history for this product', addToCart:'Add to cart', debugSent:'Debug report was sent', debugFailed:'Failed to send debug report', pushEnabled:'Phone notifications enabled', enablePush:'Enable push notifications', openNotifications:'Open notifications' },
    ar:{ similarProducts:'منتجات مشابهة', alternativeProducts:'اختيار بدائل', chooseSimilar:'اختيار منتجات مشابهة', ordered:'تم الطلب', supplied:'تم التوريد', orderNo:'طلب', noHistory:'لا يوجد سجل طلبات لهذا المنتج', addToCart:'إضافة للسلة', debugSent:'تم إرسال تقرير التشخيص', debugFailed:'فشل إرسال التشخيص', pushEnabled:'إشعارات الهاتف مفعلة', enablePush:'تفعيل الإشعارات', openNotifications:'فتح الإشعارات' },
    ru:{ similarProducts:'Похожие товары', alternativeProducts:'Выбрать замену', chooseSimilar:'Выбрать похожие товары', ordered:'Заказано', supplied:'Поставлено', orderNo:'Заказ', noHistory:'Нет истории заказов по этому товару', addToCart:'Добавить в корзину', debugSent:'Отчет диагностики отправлен', debugFailed:'Не удалось отправить отчет', pushEnabled:'Уведомления включены', enablePush:'Включить уведомления', openNotifications:'Открыть уведомления' }
  };
  const previousT=t;
  t=function(k){ return extra[appState.lang]?.[k] || previousT(k); };

  function productHistoryRows(product){
    const rows=(appState.data.orders||[]).flatMap(o=>(o.items||[]).filter(i=>i.productId===product.id).map(i=>({
      date:o.deliveryDate,
      order:o.orderNumber,
      ordered:Number(i.quantity||0),
      packed:Number((i.packedQty??i.suppliedQty??i.quantity)||0),
      missing:Math.max(0,Number(i.quantity||0)-Number((i.packedQty??i.suppliedQty??i.quantity)||0))
    }))).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,12);
    if(!rows.length) return `<tr><td colspan="5" class="empty">${t('noHistory')}</td></tr>`;
    return rows.map(h=>`<tr><td>${esc(typeof formatAppDate==='function'?formatAppDate(h.date):h.date)}</td><td>${esc(h.order)}</td><td>${h.ordered}</td><td>${h.packed}</td><td>${h.missing?`<b class="danger-text">${h.missing}</b>`:'0'}</td></tr>`).join('');
  }
  productModal=function(p){
    const q=Number(appState.cart[p.id]||0);
    const isOut=!p.inStock || Number(p.stockQty||0)<=0;
    return `<h2>${esc(tr(p.name))}</h2>
      <div class="product-modal-head">${img(p)}<div>
        <p><b>${t('unitsPerCarton')}:</b> ${Number(p.unitsPerCarton||0)}</p>
        <p><b>${t('kosher')}:</b> ${esc([...(p.kosherTypes||[]), p.foodType||p.dairyType||''].filter(Boolean).map(tr).join(', '))}</p>
        <p><b>${t('stock')}:</b> ${isOut?esc(tr('לא במלאי')):Number(p.stockQty||0)}</p>
        <p><b>${t('barcode')}:</b> ${esc(p.barcode||'')}</p>
        <div class="qty-controls modal-qty"><button type="button" data-qty-dec="${esc(p.id)}">−</button><input type="number" min="0" value="${q}" data-modal-qty-input="${esc(p.id)}"/><button type="button" data-qty-inc="${esc(p.id)}">+</button></div>
      </div></div>
      <div class="modal-actions modal-actions-inline"><button class="btn ghost" data-action="show-similar" data-product-id="${esc(p.id)}">${isOut?t('alternativeProducts'):t('chooseSimilar')}</button></div>
      <h3>${t('history')}</h3>
      <div class="table-wrap product-history-wrap"><table class="app-history-table"><thead><tr><th>${t('date')}</th><th>${t('orderNo')}</th><th>${t('ordered')}</th><th>${t('supplied')}</th><th>${t('missing')}</th></tr></thead><tbody>${productHistoryRows(p)}</tbody></table></div>
      <div class="modal-actions"><button class="btn primary" data-modal-close>${t('close')}</button></div>`;
  };

  async function showSimilar(productId){
    const original=(appState.data.products||[]).find(p=>p.id===productId);
    try{
      const data=await api(`/api/app/products/similar?productId=${encodeURIComponent(productId)}&deliveryTypeId=${encodeURIComponent(appState.selectedTypeId||'')}`);
      const products=data.products||[];
      showModal(`<h2>${original && (!original.inStock || Number(original.stockQty||0)<=0) ? t('alternativeProducts') : t('similarProducts')}</h2><div class="product-grid modal-products">${products.map(productCard).join('') || `<p class="empty">${t('noProducts')}</p>`}</div><div class="modal-actions"><button class="btn primary" data-modal-close>${t('close')}</button></div>`);
    }catch(e){ toast(e.message,'error'); }
  }

  const oldSettings=settingsView;
  settingsView=function(){
    const base=oldSettings();
    const insert=`<button class="btn ghost block" data-action="enable-push">${icon('bell')} ${t('enablePush')}</button>`;
    return base.replace(`<button class="btn ghost block" data-action="open-notifications">${icon('bell')} ${t('notifications')}</button>`, `<button class="btn ghost block" data-action="open-notifications">${icon('bell')} ${t('openNotifications')}</button>${insert}`);
  };
  async function enablePush(){
    try{
      if('Notification' in window && Notification.permission!=='granted') await Notification.requestPermission();
      const token = await window.OrderPilotMobile?.registerPushNotifications?.();
      if(token?.token) await api('/api/app/device-token',{method:'POST',body:JSON.stringify(token)});
      toast(t('pushEnabled'));
    }catch(e){ toast(e.message || t('debugFailed')); }
  }
  window.addEventListener('orderpilot:push-token', async ev=>{ try{ if(ev.detail?.token) await api('/api/app/device-token',{method:'POST',body:JSON.stringify(ev.detail)}); }catch(_){} });

  const debugLogs=[];
  function addLog(level,args){ debugLogs.push({ level, at:new Date().toISOString(), text:Array.from(args).map(x=>{ try{return typeof x==='string'?x:JSON.stringify(x);}catch(_){return String(x);} }).join(' ') }); while(debugLogs.length>100) debugLogs.shift(); }
  ['log','warn','error'].forEach(level=>{ const old=console[level]; console[level]=function(){ addLog(level, arguments); return old.apply(console, arguments); }; });
  window.addEventListener('error', e=>addLog('error',[e.message, e.filename, e.lineno]));
  window.addEventListener('unhandledrejection', e=>addLog('error',[e.reason?.message || e.reason || 'unhandled rejection']));
  async function sendDebug(){
    try{
      const payload={ appVersion:window.ORDERPILOT_CONFIG?.APP_VERSION || '22.0.0', platform:window.OrderPilotMobile?.getPlatform?.() || 'web', screen:appState.screen, language:appState.lang, theme:appState.theme, url:location.href, userAgent:navigator.userAgent, logs:debugLogs };
      const data=await api('/api/app/debug-report',{method:'POST',body:JSON.stringify(payload)});
      toast(`${t('debugSent')} #${data.reportId||''}`);
    }catch(e){ toast(t('debugFailed')); }
  }
  let debugTimer=null;
  document.addEventListener('pointerdown', e=>{ if(e.target.closest('.app-hero,.login-logo,.round-btn')) debugTimer=setTimeout(sendDebug,1800); }, true);
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>document.addEventListener(ev,()=>{ if(debugTimer){ clearTimeout(debugTimer); debugTimer=null; } }, true));

  document.addEventListener('click', e=>{
    const sim=e.target.closest('[data-action="show-similar"]');
    if(sim){ e.preventDefault(); e.stopPropagation(); showSimilar(sim.dataset.productId); return; }
    const push=e.target.closest('[data-action="enable-push"]');
    if(push){ e.preventDefault(); e.stopPropagation(); enablePush(); return; }
  }, true);
  document.addEventListener('change', e=>{
    const input=e.target.closest('[data-modal-qty-input]');
    if(input){ setQty(input.dataset.modalQtyInput, Number(input.value||0)); }
  }, true);
})();

/* v23 patch: product details, cart, promos, recommendations, stronger dark mode and all translated server labels */
(function(){
  const extra={
    he:{ recommended:'אולי שכחת להזמין', arrived:'הגיע בפועל', ingredients:'רכיבים', allergens:'אלרגנים', cartonsPerPallet:'קרטונים במשטח', useRecommended:'כמות מומלצת', sale:'מבצע', similarShort:'דומים', scanIcon:'📷' },
    en:{ recommended:'Maybe you forgot', arrived:'Actually arrived', ingredients:'Ingredients', allergens:'Allergens', cartonsPerPallet:'Cartons per pallet', useRecommended:'Recommended qty', sale:'Sale', similarShort:'Similar', scanIcon:'📷' },
    ar:{ recommended:'ربما نسيت', arrived:'وصل فعليًا', ingredients:'المكونات', allergens:'مسببات الحساسية', cartonsPerPallet:'كراتين في الطبلية', useRecommended:'كمية مقترحة', sale:'عرض', similarShort:'مشابهة', scanIcon:'📷' },
    ru:{ recommended:'Возможно, забыли', arrived:'Фактически пришло', ingredients:'Состав', allergens:'Аллергены', cartonsPerPallet:'Коробов на паллете', useRecommended:'Рекоменд. кол-во', sale:'Акция', similarShort:'Похожие', scanIcon:'📷' }
  };
  const prevT23=t; t=function(k){ return extra[appState.lang]?.[k] || prevT23(k); };
  const prevTr23=tr; tr=function(value){ const raw=String(value??''); if(!raw) return ''; if(appState.lang==='he') return raw; const direct=appState.data?.translations?.[raw]?.[appState.lang]; if(direct) return direct; return prevTr23(raw); };
  function showPrices(){ return appState.data?.showPrices !== false && appState.data?.network?.showPricesInApp !== false; }
  function promoBadge(p){ return p.promotion ? `<span class="promo-badge">${icon('tag')} ${esc(tr(p.promotion.title||t('sale')))}</span>` : ''; }
  productCard=function(p){ const q=appState.cart[p.id]||0; const price=showPrices()?`<span>${money(p.pricePerCarton||0)}</span>`:''; return `<article class="product-card"><button class="product-open" data-product="${esc(p.id)}">${img(p)}${promoBadge(p)}<div class="product-body"><div class="tags">${(p.tags||[]).slice(0,3).map(tag=>`<span>${esc(tr(tag))}</span>`).join('')}</div><h3>${esc(tr(p.name))}</h3><p>${esc(tr(p.category))} · ${esc(tr(p.subcategory||''))}</p><div class="product-meta"><span>${t('stock')}: ${Number(p.stockQty||0)}</span>${price}</div></div></button><div class="quick-actions"><button class="btn sm ghost" data-action="show-similar" data-product-id="${esc(p.id)}">${t('similarShort')}</button>${Number(p.recommendedQty||0)>0?`<button class="btn sm ghost" data-recommended-qty="${esc(p.id)}">${t('useRecommended')}: ${Number(p.recommendedQty||0)}</button>`:''}</div><div class="qty-controls"><button data-qty-dec="${esc(p.id)}" type="button">−</button><input data-qty-input="${esc(p.id)}" type="number" min="0" value="${q}"/><button data-qty-inc="${esc(p.id)}" type="button">+</button></div></article>`; };
  productModal=function(p){ const q=appState.cart[p.id]||0; const food=p.foodType||p.dairyType||'פרווה'; const rows=(appState.data.orders||[]).flatMap(o=>(o.items||[]).filter(i=>i.productId===p.id).map(i=>({date:o.deliveryDate, order:o.orderNumber, arrived:Number((i.packedQty??i.suppliedQty??i.quantity)||0)}))).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,12); return `<h2>${esc(tr(p.name))}</h2><div class="product-modal-head">${img(p)}<div>${promoBadge(p)}<p><b>${t('unitsPerCarton')}:</b> ${Number(p.unitsPerCarton||0)}</p><p><b>${t('cartonsPerPallet')}:</b> ${Number(p.cartonsPerPallet||0)}</p><p><b>${t('kosher')}:</b> ${esc((p.kosherTypes||[]).map(tr).join(', '))}</p><p><b>סוג:</b> ${esc(tr(food))}</p><p><b>${t('stock')}:</b> ${Number(p.stockQty||0)}</p><p><b>${t('barcode')}:</b> ${esc(p.barcode||'')}</p>${showPrices()?`<p><b>מחיר:</b> ${money(p.pricePerCarton||0)}</p>`:''}<div class="qty-controls modal-qty"><button data-qty-dec="${esc(p.id)}" type="button">−</button><input data-qty-input="${esc(p.id)}" type="number" min="0" value="${q}"/><button data-qty-inc="${esc(p.id)}" type="button">+</button></div></div></div><div class="modal-actions modal-actions-inline"><button class="btn ghost" data-action="show-similar" data-product-id="${esc(p.id)}">${(!p.inStock||Number(p.stockQty||0)<=0)?t('alternativeProducts'):t('chooseSimilar')}</button>${Number(p.recommendedQty||0)>0?`<button class="btn primary" data-recommended-qty="${esc(p.id)}">${t('useRecommended')}: ${Number(p.recommendedQty||0)}</button>`:''}</div><div class="product-extra-table"><h3>${t('ingredients')}</h3><p>${esc(tr(p.ingredients||'—'))}</p><h3>${t('allergens')}</h3><p>${esc(tr(p.allergens||'—'))}</p></div><h3>${t('history')}</h3><div class="table-wrap product-history-wrap"><table class="app-history-table"><thead><tr><th>${t('date')}</th><th>${t('orderNo')}</th><th>${t('arrived')}</th></tr></thead><tbody>${rows.map(h=>`<tr><td>${esc(typeof formatAppDate==='function'?formatAppDate(h.date):h.date)}</td><td>${esc(h.order)}</td><td>${h.arrived}</td></tr>`).join('') || `<tr><td colspan="3" class="empty">${t('noHistory')}</td></tr>`}</tbody></table></div><div class="modal-actions"><button class="btn primary" data-modal-close>${t('close')}</button></div>`; };
  catalogView=function(){ const products=productsForCurrent(); const cats=categoriesForCurrent(); const subs=subsForCat(); const totals=cartTotals(); return `<section class="catalog-screen enter"><div class="catalog-head"><button class="text-btn" data-action="back-date">${t('back')}</button><div><h2>${t('catalog')}</h2><p>${t('date')}: ${esc(typeof formatAppDate==='function'?formatAppDate(appState.selectedDate):appState.selectedDate)} · ${esc(tr(appState.data.deliveryTypes.find(t=>t.id===appState.selectedTypeId)?.title||''))}</p></div></div><div class="search-row">${searchFieldHtml(appState.search)}${hasFeatureApp('barcodeScan')?`<button class="btn ghost icon-scan" aria-label="${t('scan')}" data-action="scan-barcode">${icon('barcode')}</button>`:''}</div><div class="category-rail"><button class="cat-chip ${appState.selectedCategory==='all'?'active':''}" data-cat="all">${t('all')}</button>${cats.map(c=>`<button class="cat-chip ${appState.selectedCategory===c?'active':''}" data-cat="${esc(c)}">${esc(tr(c))}</button>`).join('')}</div>${subs.length?`<div class="subcategory-rail"><button class="sub-chip ${!appState.selectedSubcategory?'active':''}" data-subcat="">${t('all')}</button>${subs.map(s=>`<button class="sub-chip ${appState.selectedSubcategory===s?'active':''}" data-subcat="${esc(s)}">${esc(tr(s))}</button>`).join('')}</div>`:''}<div class="product-grid">${products.map(productCard).join('') || `<p class="empty">${t('noProducts')}</p>`}</div>${totals.lines?cartBar(totals):''}</section>`; };
  function recommendedProducts(){ const inCart=new Set(Object.keys(appState.cart)); return (appState.data.products||[]).filter(p=>p.active!==false && (p.deliveryTypeIds||[]).includes(appState.selectedTypeId) && !inCart.has(p.id) && (p.usual || p.trending || p.newItem || Number(p.recommendedQty||0)>0)).slice(0,8); }
  window.recommendedStep=function(){ const rec=recommendedProducts(); showModal(`<h2>${t('recommended')}</h2><p class="muted">${t('recommended')}</p><div class="product-grid modal-products">${rec.map(productCard).join('') || `<p class="empty">${t('noProducts')}</p>`}</div><div class="modal-actions"><button class="btn primary" data-action="submit-order-final">${t('submit')}</button><button class="btn ghost" data-modal-close>${t('close')}</button></div>`); };
  cartModal=function(){ const items=cartItems(); const totals=cartTotals(); return `<h2>${t('summary')}</h2><div class="cart-lines">${items.map(({product,quantity})=>`<div class="cart-line"><div>${img(product)}<b>${esc(tr(product.name))}</b></div><div class="qty-controls"><button data-qty-dec="${esc(product.id)}">−</button><input data-qty-input="${esc(product.id)}" type="number" min="0" value="${quantity}"/><button data-qty-inc="${esc(product.id)}">+</button></div></div>`).join('')}</div><div class="summary-box"><div><b>${totals.lines}</b><span>${t('cart')}</span></div><div><b>${totals.cartons}</b><span>${t('cartons')}</span></div>${showPrices()?`<div><b>${money(totals.value)}</b><span>${t('summary')}</span></div>`:''}</div>${!minOk()?`<p class="danger-text">${t('missingMin')} · ${t('minOrder')}: ${minText()}</p>`:''}<div class="modal-actions"><button class="btn primary" data-action="pre-submit-recommendations" ${!minOk()?'disabled':''}>${t('submit')}</button><button class="btn ghost" data-modal-close>${t('close')}</button></div>`; };
  const oldRender23=render; render=function(){ oldRender23(); const nav=root.querySelector('[data-screen="notifications"]'); if(nav) nav.remove(); };
  document.addEventListener('click', e=>{ const rec=e.target.closest('[data-recommended-qty]'); if(rec){ e.preventDefault(); e.stopPropagation(); const p=(appState.data.products||[]).find(x=>x.id===rec.dataset.recommendedQty); if(p) setQty(p.id, Number(p.recommendedQty||1)); return; } }, true);
  document.addEventListener('change', e=>{ const inp=e.target.closest('[data-qty-input]'); if(inp){ setQty(inp.dataset.qtyInput, Number(inp.value||0)); } }, true);
})();

/* v24: app home dashboard, notification bell, rotating banners, business details */
(function(){
  const extra24 = {
    he:{ home:'ראשי', goodMorning:'בוקר טוב', goodAfternoon:'צהריים טובים', goodEvening:'ערב טוב', newOrder:'ביצוע הזמנה חדשה', deals:'מבצעים', newProducts:'מוצרים חדשים', recommendedProducts:'מועדפים', quickActions:'מה תרצה לעשות?', companyAds:'עדכוני חברה', businessDetails:'פרטי העסק', networkNumber:'מספר רשת', customerNumber:'מספר לקוח', networkName:'שם רשת', branchName:'שם סניף', address:'כתובת', contactDetails:'פרטי התקשרות', manager:'מנהל', nextDelivery:'תאריך ההזמנה הקרוב', startOrder:'התחלת הזמנה', noNotifications:'אין התראות חדשות', openSettings:'הגדרות', viewOrders:'היסטוריית הזמנות', viewContact:'צור קשר', banner1:'מבצעים חמים מחכים לך השבוע', banner2:'בדוק מוצרים חדשים לפני כולם', banner3:'הזמנה חכמה חוסכת זמן וכסף', banner4:'מוצרים שחזרו למלאי מסומנים עבורך', banner5:'אל תשכח לבדוק המלצות לפני שידור ההזמנה' },
    en:{ home:'Home', goodMorning:'Good morning', goodAfternoon:'Good afternoon', goodEvening:'Good evening', newOrder:'New order', deals:'Deals', newProducts:'New products', recommendedProducts:'Recommended products', quickActions:'What would you like to do?', companyAds:'Company updates', businessDetails:'Business details', networkNumber:'Network number', customerNumber:'Customer number', networkName:'Network name', branchName:'Branch name', address:'Address', contactDetails:'Contact details', manager:'Manager', nextDelivery:'Nearest order date', startOrder:'Start order', noNotifications:'No new notifications', openSettings:'Settings', viewOrders:'Order history', viewContact:'Contact', banner1:'Hot deals are waiting this week', banner2:'Check new products before everyone else', banner3:'Smart ordering saves time and money', banner4:'Back-in-stock products are marked for you', banner5:'Check recommendations before submitting' },
    ar:{ home:'الرئيسية', goodMorning:'صباح الخير', goodAfternoon:'مساء الخير', goodEvening:'مساء الخير', newOrder:'طلب جديد', deals:'عروض', newProducts:'منتجات جديدة', recommendedProducts:'منتجات مقترحة', quickActions:'ماذا تريد أن تفعل؟', companyAds:'تحديثات الشركة', businessDetails:'تفاصيل المتجر', networkNumber:'رقم الشبكة', customerNumber:'رقم العميل', networkName:'اسم الشبكة', branchName:'اسم الفرع', address:'العنوان', contactDetails:'تفاصيل الاتصال', manager:'المدير', nextDelivery:'أقرب تاريخ طلب', startOrder:'بدء الطلب', noNotifications:'لا توجد إشعارات جديدة', openSettings:'الإعدادات', viewOrders:'سجل الطلبات', viewContact:'تواصل', banner1:'عروض ساخنة بانتظارك هذا الأسبوع', banner2:'شاهد المنتجات الجديدة أولًا', banner3:'الطلب الذكي يوفر الوقت والمال', banner4:'المنتجات التي عادت للمخزون واضحة لك', banner5:'راجع المقترحات قبل إرسال الطلب' },
    ru:{ home:'Главная', goodMorning:'Доброе утро', goodAfternoon:'Добрый день', goodEvening:'Добрый вечер', newOrder:'Новый заказ', deals:'Акции', newProducts:'Новые товары', recommendedProducts:'Рекомендуемые товары', quickActions:'Что хотите сделать?', companyAds:'Новости компании', businessDetails:'Данные магазина', networkNumber:'Номер сети', customerNumber:'Номер клиента', networkName:'Название сети', branchName:'Название филиала', address:'Адрес', contactDetails:'Контакты', manager:'Менеджер', nextDelivery:'Ближайшая дата заказа', startOrder:'Начать заказ', noNotifications:'Нет новых уведомлений', openSettings:'Настройки', viewOrders:'История заказов', viewContact:'Связаться', banner1:'Горячие акции ждут вас на этой неделе', banner2:'Посмотрите новые товары первыми', banner3:'Умный заказ экономит время и деньги', banner4:'Товары снова в наличии отмечены для вас', banner5:'Проверьте рекомендации перед отправкой' }
  };
  const prevT24 = t;
  t = function(k){ return extra24[appState.lang]?.[k] || prevT24(k); };

  if(appState.screen === 'order' && !appState.selectedTypeId && !appState.selectedDate){ appState.screen = 'home'; }

  function greetingKey(){ const h = new Date().getHours(); if(h < 12) return 'goodMorning'; if(h < 18) return 'goodAfternoon'; return 'goodEvening'; }
  function managerName(){ return appState.data?.branch?.managerName || appState.data?.branch?.contactName || appState.data?.branch?.name || ''; }
  function branchAddress(){ const b = appState.data?.branch || {}; return [b.city,b.address].filter(Boolean).join(', '); }
  function maskedCode(obj, prefix){ if(obj?.customerNumber) return obj.customerNumber; if(obj?.number) return obj.number; if(obj?.accessCodeLast2) return '***' + obj.accessCodeLast2; if(obj?.branchCodeLast2) return '***' + obj.branchCodeLast2; return obj?.id || prefix || '—'; }
  function appBanners(){
    const custom = appState.data?.appBanners || appState.data?.banners || [];
    const fallback = [
      {title:t('banner1'), text:t('deals'), icon:'🏷️'},
      {title:t('banner2'), text:t('newProducts'), icon:'✨'},
      {title:t('banner3'), text:t('newOrder'), icon:'⚡'},
      {title:t('banner4'), text:t('stock'), icon:'📦'},
      {title:t('banner5'), text:t('recommendedProducts'), icon:'✅'}
    ];
    return (custom.length ? custom : fallback).slice(0,5);
  }
  function nextDeliveryHint(){
    const map = appState.data?.allowedDatesByType || {};
    const all = Object.values(map).flat().concat(appState.data?.allowedDates || []).filter(Boolean);
    const dates = all.map(d => typeof d === 'string' ? {date:d,label:d} : d).filter(d=>d.date).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    return dates[0] || null;
  }
  function homeView(){
    const next = nextDeliveryHint();
    const banners = appBanners();
    const b = appState.data.branch || {}, n = appState.data.network || {};
    return `<section class="home-screen enter">
      <div class="greeting-card">
        <span class="eyebrow">${t(greetingKey())}</span>
        <h2>${esc(managerName())}</h2>
        <p>${esc(tr(n.name))} · ${esc(tr(b.name))}</p>
        ${next ? `<div class="next-delivery-pill">${t('nextDelivery')}: <b>${esc(typeof formatAppDate==='function'?formatAppDate(next.date):next.label||next.date)}</b></div>` : ''}
      </div>
      <div class="app-banner-carousel" aria-label="${t('companyAds')}">
        <div class="app-banner-track" style="--banner-count:${banners.length}">
          ${banners.map((x,i)=>`<article class="app-banner"><span>${esc(x.icon||'📣')}</span><div><b>${esc(tr(x.title||x.text||''))}</b><small>${esc(tr(x.text||t('companyAds')))}</small></div></article>`).join('')}
        </div>
      </div>
      <div class="home-actions-title"><h3>${t('quickActions')}</h3></div>
      <div class="home-action-grid">
        <button class="home-action primary" data-action="start-new-order"><span>${icon('cart')}</span><b>${t('newOrder')}</b><small>${t('startOrder')}</small></button>
        <button class="home-action" data-home-products="deals"><span>${icon('tag')}</span><b>${t('deals')}</b><small>${t('companyAds')}</small></button>
        <button class="home-action" data-home-products="new"><span>${icon('sparkle')}</span><b>${t('newProducts')}</b><small>${t('catalog')}</small></button>
        <button class="home-action" data-home-products="recommended"><span>⭐</span><b>${t('recommendedProducts')}</b><small>${t('useRecommended')}</small></button>
      </div>
      <div class="home-secondary-actions">
        <button class="btn ghost" data-screen="contact">${icon('chat')} ${t('viewContact')}</button>
        <button class="btn ghost" data-screen="orders">${icon('box')} ${t('viewOrders')}</button>
      </div>
    </section>`;
  }
  function homeProductsView(){
    const mode = appState.homeProductMode || 'deals';
    const title = mode === 'new' ? t('newProducts') : mode === 'recommended' ? t('recommendedProducts') : t('deals');
    const products = (appState.data.products || []).filter(p => {
      if(p.active === false) return false;
      if(mode === 'new') return p.newItem || (p.tags||[]).some(x=>String(x).includes('חדש'));
      if(mode === 'recommended') return p.usual || p.trending || Number(p.recommendedQty||0)>0;
      return p.promotion || (p.tags||[]).some(x=>String(x).includes('מבצע'));
    }).slice(0,60);
    return `<section class="catalog-screen home-products-screen enter"><div class="catalog-head"><button class="text-btn" data-screen="home">${t('back')}</button><div><h2>${title}</h2><p>${esc(tr(appState.data.branch.name))}</p></div></div><div class="product-grid readonly-products">${products.map(p=>`<article class="product-card"><button class="product-open" data-product="${esc(p.id)}">${img(p)}<div class="product-body"><div class="tags">${(p.tags||[]).slice(0,3).map(tag=>`<span>${esc(tr(tag))}</span>`).join('')}</div><h3>${esc(tr(p.name))}</h3><p>${esc(tr(p.category||''))} · ${esc(tr(p.subcategory||''))}</p></div></button></article>`).join('') || `<p class="empty">${t('noProducts')}</p>`}</div></section>`;
  }
  const previousScreenView24 = screenView;
  screenView = function(){
    if(appState.screen === 'home') return homeView();
    if(appState.screen === 'home-products') return homeProductsView();
    return previousScreenView24();
  };
  const previousSettingsView24 = settingsView;
  settingsView = function(){
    const n = appState.data?.network || {}, b = appState.data?.branch || {};
    const base = previousSettingsView24();
    const details = `<section class="business-details-card"><h3>${t('businessDetails')}</h3><dl>
      <div><dt>${t('networkNumber')}</dt><dd>${esc(maskedCode(n,'—'))}</dd></div>
      <div><dt>${t('customerNumber')}</dt><dd>${esc(maskedCode(b,'—'))}</dd></div>
      <div><dt>${t('networkName')}</dt><dd>${esc(tr(n.name||''))}</dd></div>
      <div><dt>${t('branchName')}</dt><dd>${esc(tr(b.name||''))}</dd></div>
      <div><dt>${t('address')}</dt><dd>${esc(branchAddress()||'—')}</dd></div>
      <div><dt>${t('contactDetails')}</dt><dd>${esc([b.phone,b.email].filter(Boolean).join(' · ')||'—')}</dd></div>
      <div><dt>${t('manager')}</dt><dd>${esc(b.managerName||'—')}</dd></div>
    </dl></section>`;
    return base.replace('</section>', `${details}</section>`);
  };
  render = function(){
    applyPreferences();
    if(!appState.token || !appState.data){ root.innerHTML = loginView(); return; }
    const totals = cartTotals();
    root.innerHTML = `<div class="app-shell v24-home-shell" dir="${dir()}">
      <header class="app-topbar">
        <div class="app-identity"><span class="eyebrow">OrderPilot</span><h1>${esc(tr(appState.data.network?.name||''))}</h1><p>${esc(tr(appState.data.branch?.name||''))}</p></div>
        <div class="topbar-actions"><button class="round-btn notify-btn" aria-label="${t('notifications')}" data-action="open-notifications">${icon('bell')}${(appState.data.notifications||[]).length?`<em>${Math.min(99,(appState.data.notifications||[]).length)}</em>`:''}</button><button class="round-btn" aria-label="${t('settings')}" data-screen="settings">${icon('settings')}</button></div>
      </header>
      <main class="app-main">${screenView()}</main>
      ${totals.lines && appState.screen !== 'order' ? `<button class="floating-cart home-floating-cart" data-action="open-cart">${icon('cart')} <b>${totals.cartons}</b></button>` : ''}
      <nav class="bottom-nav"><button class="${appState.screen==='home'?'active':''}" data-screen="home">${icon('home')}<span>${t('home')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">${icon('box')}<span>${t('orders')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">${icon('chat')}<span>${t('contact')}</span></button><button class="${appState.screen==='settings'?'active':''}" data-screen="settings">${icon('settings')}<span>${t('settings')}</span></button></nav>
    </div>`;
  };
  document.addEventListener('click', e => {
    const start = e.target.closest('[data-action="start-new-order"]');
    if(start){ e.preventDefault(); e.stopPropagation(); appState.screen='order'; appState.selectedTypeId=''; appState.selectedDate=''; appState.selectedCategory='all'; appState.selectedSubcategory=''; render(); return; }
    const hp = e.target.closest('[data-home-products]');
    if(hp){ e.preventDefault(); e.stopPropagation(); appState.homeProductMode = hp.dataset.homeProducts; appState.screen='home-products'; render(); return; }
  }, true);
})();

/* v25 app home/orders/product/notifications polish */
(function(){
  const extra25={
    he:{actuallyArrived:'הגיע בפועל', cloneOrder:'שכפול הזמנה', orderSource:'אופן ביצוע', edited:'נערכה', orderDetails:'פרטי הזמנה', ingredients:'רכיבים', allergens:'אלרגנים', cartonsPerPallet:'קרטונים במשטח', contactAndHistory:'שירות והזמנות'},
    en:{actuallyArrived:'Actually arrived', cloneOrder:'Duplicate order', orderSource:'Source', edited:'Edited', orderDetails:'Order details', ingredients:'Ingredients', allergens:'Allergens', cartonsPerPallet:'Cartons per pallet', contactAndHistory:'Service and orders'},
    ar:{actuallyArrived:'وصل فعليًا', cloneOrder:'نسخ الطلب', orderSource:'طريقة الإنشاء', edited:'تم التعديل', orderDetails:'تفاصيل الطلب', ingredients:'المكونات', allergens:'مسببات الحساسية', cartonsPerPallet:'كرتون في منصة', contactAndHistory:'الخدمة والطلبات'},
    ru:{actuallyArrived:'Фактически прибыло', cloneOrder:'Дублировать заказ', orderSource:'Источник', edited:'Изменен', orderDetails:'Детали заказа', ingredients:'Состав', allergens:'Аллергены', cartonsPerPallet:'Коробок на паллете', contactAndHistory:'Сервис и заказы'}
  };
  const prevT25=t; t=function(k){ return extra25[appState.lang]?.[k] || prevT25(k); };
  function unreadNotifications(){ return (appState.data?.notifications||[]).filter(n=>n.status!=='read'); }
  async function markNotificationsRead(){ try{ await api('/api/app/notifications/read',{method:'POST',body:'{}'}); if(appState.data?.notifications) appState.data.notifications.forEach(n=>n.status='read'); }catch(_){} }
  function realDate(v){ return typeof formatAppDate==='function'?formatAppDate(v):String(v||''); }
  function shippedQty(item){ return Number((item.packedQty ?? item.suppliedQty ?? item.quantity) || 0); }
  function orderStatusClass(o){ return ['supplied','closed'].includes(o.status)?'done':(['cancelled'].includes(o.status)?'cancelled':''); }
  function orderModal(o){ return `<h2>${t('orderDetails')} ${esc(o.orderNumber)}</h2><div class="kpi-grid mini"><div><b>${esc(realDate(o.createdAt||o.deliveryDate))}</b><span>${t('date')}</span></div><div><b>${esc(tr(o.statusText||''))}</b><span>${t('status')}</span></div><div><b>${esc(tr(o.deliveryTypeTitle||''))}</b><span>${t('type')}</span></div><div><b>${esc(realDate(o.deliveryDate))}</b><span>${t('deliveryDate')}</span></div><div><b>${esc(o.source==='app'?'אפליקציה':o.source==='app-clone'?'שוכפלה באפליקציה':'נציג')}</b><span>${t('orderSource')}</span></div>${o.updatedAt&&o.updatedAt!==o.createdAt?`<div><b>${t('edited')}</b><span>${esc(realDate(o.updatedAt))}</span></div>`:''}</div><h3>${t('products')}</h3><div class="table-wrap"><table class="app-history-table"><thead><tr><th>${t('product')}</th><th>${t('ordered')}</th><th>${t('actuallyArrived')}</th></tr></thead><tbody>${(o.items||[]).map(i=>`<tr><td>${esc(tr(i.name))}</td><td>${Number(i.quantity||0)}</td><td>${shippedQty(i)}</td></tr>`).join('')}</tbody></table></div><div class="modal-actions"><button class="btn ghost" data-clone-order="${esc(o.id)}">${t('cloneOrder')}</button>${o.canEdit?`<button class="btn primary" data-edit-history-order="${esc(o.id)}">${t('edit')}</button>`:''}<button class="btn ghost" data-modal-close>${t('close')}</button></div>`; }
  ordersView=function(){ const rows=(appState.data.orders||[]).map(o=>`<article class="order-card"><button class="order-open-card" data-order-detail="${esc(o.id)}"><div><b>${esc(o.orderNumber)}</b><span>${esc(realDate(o.createdAt||o.deliveryDate))} · ${esc(tr(o.deliveryTypeTitle||''))}</span><small>${t('deliveryDate')}: ${esc(realDate(o.deliveryDate))} · ${t('orderSource')}: ${esc(o.source==='app'?'אפליקציה':o.source==='app-clone'?'שוכפלה באפליקציה':'נציג')}${o.updatedAt&&o.updatedAt!==o.createdAt?` · ${t('edited')}`:''}</small></div><span class="badge ${orderStatusClass(o)}">${esc(tr(o.statusText||''))}</span></button><div class="order-actions-mini"><button class="btn sm ghost" data-clone-order="${esc(o.id)}">${t('cloneOrder')}</button>${o.canEdit?`<button class="btn sm primary" data-edit-history-order="${esc(o.id)}">${t('edit')}</button>`:''}</div></article>`).join(''); return `<section class="list-screen enter"><h2>${t('orders')}</h2>${rows || '<p class="empty">—</p>'}</section>`; };
  productCard=function(p){ const q=appState.cart[p.id]||0; const out=!p.inStock||Number(p.stockQty||0)<=0; const promo=p.promotion; return `<article class="product-card v25-card">${promo?`<span class="promo-badge">${icon('tag')} ${esc(tr(promo.title||'מבצע'))}</span>`:''}<button class="product-open" data-product="${esc(p.id)}">${img(p)}<div class="product-body"><div class="tags">${(p.tags||[]).slice(0,3).map(tag=>`<span>${esc(tr(tag))}</span>`).join('')}</div><h3>${esc(tr(p.name))}</h3><p>${esc(tr(p.category||''))} · ${esc(tr(p.subcategory||''))}</p><div class="product-meta"><span>${t('stock')}: ${Number(p.stockQty||0)}</span><span>${t('cartonsPerPallet')}: ${Number(p.cartonsPerPallet||0)}</span></div></div></button><div class="quick-actions product-card-actions"><button class="btn sm ghost" data-recommended-qty="${esc(p.id)}">${t('useRecommended')}: ${Number(p.recommendedQty||0)}</button><button class="btn sm ghost" data-action="show-similar" data-product-id="${esc(p.id)}">${out?t('alternativeProducts'):t('chooseSimilar')}</button></div><div class="qty-controls"><button data-qty-dec="${esc(p.id)}" type="button">−</button><input data-qty-input="${esc(p.id)}" type="number" min="0" value="${q}"/><button data-qty-inc="${esc(p.id)}" type="button">+</button></div></article>`; };
  productModal=function(p){ const q=Number(appState.cart[p.id]||0); const rows=(appState.data.orders||[]).flatMap(o=>(o.items||[]).filter(i=>i.productId===p.id).map(i=>({date:o.deliveryDate,order:o.orderNumber,arrived:shippedQty(i)}))).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,10); return `<h2>${esc(tr(p.name))}</h2><div class="product-modal-head">${img(p)}<div><p><b>${t('unitsPerCarton')}:</b> ${Number(p.unitsPerCarton||0)}</p><p><b>${t('cartonsPerPallet')}:</b> ${Number(p.cartonsPerPallet||0)}</p><p><b>${t('useRecommended')}:</b> <button class="text-btn" data-recommended-qty="${esc(p.id)}">${Number(p.recommendedQty||0)}</button></p><p><b>${t('kosher')}:</b> ${esc([...(p.kosherTypes||[]), p.foodType||p.dairyType||''].filter(Boolean).map(tr).join(', '))}</p><p><b>${t('ingredients')}:</b> ${esc(tr(p.ingredients||'—'))}</p><p><b>${t('allergens')}:</b> ${esc(tr(p.allergens||'—'))}</p><p><b>${t('barcode')}:</b> ${esc(p.barcode||'')}</p><div class="qty-controls modal-qty"><button data-qty-dec="${esc(p.id)}" type="button">−</button><input data-qty-input="${esc(p.id)}" type="number" min="0" value="${q}"/><button data-qty-inc="${esc(p.id)}" type="button">+</button></div></div></div><div class="modal-actions modal-actions-inline"><button class="btn ghost" data-action="show-similar" data-product-id="${esc(p.id)}">${(!p.inStock||Number(p.stockQty||0)<=0)?t('alternativeProducts'):t('chooseSimilar')}</button></div><h3>${t('history')}</h3><div class="table-wrap product-history-wrap"><table class="app-history-table"><thead><tr><th>${t('date')}</th><th>${t('orderNo')}</th><th>${t('actuallyArrived')}</th></tr></thead><tbody>${rows.map(h=>`<tr><td>${esc(realDate(h.date))}</td><td>${esc(h.order)}</td><td>${h.arrived}</td></tr>`).join('')||`<tr><td colspan="3">${t('noHistory')}</td></tr>`}</tbody></table></div><div class="modal-actions"><button class="btn primary" data-modal-close>${t('close')}</button></div>`; };
  settingsView=function(){ const n=appState.data?.network||{}, b=appState.data?.branch||{}; const address=[b.city,b.address].filter(Boolean).join(', '); return `<section class="flow-card enter settings-card"><h2>${t('appSettings')}</h2><label>${t('language')}<select data-lang-select>${['he','en','ar','ru'].map(l=>`<option value="${l}" ${l===appState.lang?'selected':''}>${l==='he'?'עברית':l==='en'?'English':l==='ar'?'العربية':'Русский'}</option>`).join('')}</select></label><label>${t('theme')}<select data-theme-select><option value="light" ${appState.theme==='light'?'selected':''}>${t('light')}</option><option value="dark" ${appState.theme==='dark'?'selected':''}>${t('dark')}</option></select></label><label>${t('fontSize')}<select data-font-select><option value="small" ${appState.fontSize==='small'?'selected':''}>${t('small')}</option><option value="normal" ${appState.fontSize==='normal'?'selected':''}>${t('normal')}</option><option value="large" ${appState.fontSize==='large'?'selected':''}>${t('large')}</option></select></label><section class="business-details-card"><h3>${t('businessDetails')}</h3><dl><div><dt>${t('networkName')}</dt><dd>${esc(tr(n.name||''))}</dd></div><div><dt>${t('branchName')}</dt><dd>${esc(tr(b.name||''))}</dd></div><div><dt>${t('address')}</dt><dd>${esc(address||'—')}</dd></div><div><dt>${t('contactDetails')}</dt><dd>${esc([b.phone,b.email].filter(Boolean).join(' · ')||'—')}</dd></div><div><dt>${t('manager')}</dt><dd>${esc(b.managerName||'—')}</dd></div></dl></section><button class="btn danger block" data-action="logout">${icon('logout')} ${t('logout')}</button></section>`; };
  function greetingKey(){ const h=new Date().getHours(); if(h<12) return 'goodMorning'; if(h<18) return 'goodAfternoon'; return 'goodEvening'; }
  function homeBanners(){ const custom=appState.data?.appBanners||[]; const fallback=[{title:t('banner1'),text:t('deals'),icon:'🏷️'},{title:t('banner2'),text:t('newProducts'),icon:'✨'},{title:t('banner3'),text:t('newOrder'),icon:'⚡'},{title:t('banner4'),text:t('stock'),icon:'📦'},{title:t('banner5'),text:t('recommendedProducts'),icon:'✅'}]; return (custom.length?custom:fallback).slice(0,5); }
  function nextDeliveryHint(){ const map=appState.data?.allowedDatesByType||{}; const all=Object.values(map).flat().concat(appState.data?.allowedDates||[]).filter(Boolean); return all.map(d=>typeof d==='string'?{date:d}:d).filter(d=>d.date).sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0]; }
  homeView=function(){ const b=appState.data.branch||{}, n=appState.data.network||{}; const next=nextDeliveryHint(); const banners=homeBanners(); const address=[b.city,b.address].filter(Boolean).join(', '); return `<section class="home-screen enter"><div class="home-branch-card"><b>${esc(tr(n.name||''))}</b><span>${esc(tr(b.name||''))}${address?` · ${esc(address)}`:''}</span><strong>${t(greetingKey())}, ${esc(b.managerName||b.name||'')}</strong>${next?`<div class="next-delivery-pill">${t('nextDelivery')}: <b>${esc(realDate(next.date))}</b></div>`:''}</div><div class="app-banner-carousel" aria-label="${t('companyAds')}"><div class="app-banner-track" style="--banner-count:${banners.length}">${banners.map(x=>`<article class="app-banner ${x.imageUrl?'with-image':''}" ${x.imageUrl?`style="background-image:linear-gradient(90deg,rgba(15,23,42,.72),rgba(37,99,235,.38)),url('${esc(x.imageUrl)}')"`:''}><span>${esc(x.icon||'📣')}</span><div><b>${esc(tr(x.title||''))}</b><small>${esc(tr(x.text||''))}</small></div></article>`).join('')}</div></div><div class="home-action-grid"><button class="home-action primary" data-action="start-new-order"><span>${icon('cart')}</span><b>${t('newOrder')}</b><small>${t('startOrder')}</small></button><button class="home-action" data-home-products="deals"><span>${icon('tag')}</span><b>${t('deals')}</b><small>${t('companyAds')}</small></button><button class="home-action" data-home-products="new"><span>${icon('sparkle')}</span><b>${t('newProducts')}</b><small>${t('catalog')}</small></button><button class="home-action" data-home-products="recommended"><span>⭐</span><b>${t('recommendedProducts')}</b><small>${t('useRecommended')}</small></button></div></section>`; };
  render=function(){ applyPreferences(); if(!appState.token||!appState.data){ root.innerHTML=loginView(); return; } const totals=cartTotals(); const unread=unreadNotifications().length; root.innerHTML=`<div class="app-shell v25-home-shell" dir="${dir()}"><header class="app-topbar"><div class="app-identity"><span class="eyebrow">OrderPilot</span><h1>${esc(tr(appState.data.network?.name||''))}</h1><p>${esc(tr(appState.data.branch?.name||''))}</p></div><div class="topbar-actions"><button class="round-btn notify-btn" aria-label="${t('notifications')}" data-action="open-notifications">${icon('bell')}${unread?`<em>${Math.min(99,unread)}</em>`:''}</button><button class="round-btn" aria-label="${t('settings')}" data-screen="settings">${icon('settings')}</button></div></header><main class="app-main">${screenView()}</main>${totals.lines?`<button class="floating-cart home-floating-cart" data-action="open-cart">${icon('cart')} <b>${totals.cartons}</b></button>`:''}<nav class="bottom-nav"><button class="${appState.screen==='home'?'active':''}" data-screen="home">${icon('home')}<span>${t('home')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">${icon('chat')}<span>${t('contact')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">${icon('box')}<span>${t('orders')}</span></button><button class="${appState.screen==='settings'?'active':''}" data-screen="settings">${icon('settings')}<span>${t('settings')}</span></button></nav></div>`; };
  document.addEventListener('click', async e=>{
    const detail=e.target.closest('[data-order-detail]'); if(detail){ e.preventDefault(); const o=(appState.data.orders||[]).find(x=>x.id===detail.dataset.orderDetail); if(o) showModal(orderModal(o)); return; }
    const clone=e.target.closest('[data-clone-order]'); if(clone){ e.preventDefault(); e.stopPropagation(); const o=(appState.data.orders||[]).find(x=>x.id===clone.dataset.cloneOrder); if(o){ appState.cart={}; (o.items||[]).forEach(i=>appState.cart[i.productId]=Number(i.quantity||0)); appState.selectedTypeId=o.deliveryTypeId; appState.selectedDate=''; appState.editingOrderId=''; closeModal(); appState.screen='order'; render(); toast(t('cloneOrder')); } return; }
    const notif=e.target.closest('[data-action="open-notifications"]'); if(notif){ e.preventDefault(); const notes=(appState.data.notifications||[]); showModal(`<h2>${t('notifications')}</h2><div class="notifications-mini">${notes.slice(0,20).map(n=>`<article class="note-card"><b>${esc(tr(n.title||''))}</b><p>${esc(tr(n.message||''))}</p><span>${esc(realDate(n.createdAt))}</span></article>`).join('')||`<p class="empty">${t('noNotifications')}</p>`}</div><div class="modal-actions"><button class="btn primary" data-modal-close>${t('close')}</button></div>`); await markNotificationsRead(); render(); return; }
  }, true);
})();

/* v26 patch: returns flow, return-heavy product context and product history table refinement */
(function(){
  Object.assign(ui.he,{ returns:'חזרות', createReturn:'פתיחת בקשת החזרה', returnHistory:'היסטוריית חזרות', returnStatus:'סטטוס החזרה', returnUnits:'יחידות להחזרה', cartonPart:'מתוך קרטון', returnCertificate:'תעודת החזרה', returnImages:'תמונות החזרה', returnReason:'סיבת החזרה', heavyReturns:'מרובה חזרות', requestedReturns:'בקשות החזרה', returnedActual:'הוחזר בפועל' });
  Object.assign(ui.en,{ returns:'Returns', createReturn:'Open return request', returnHistory:'Return history', returnStatus:'Return status', returnUnits:'Units to return', cartonPart:'Carton fraction', returnCertificate:'Return certificate', returnImages:'Return photos', returnReason:'Return reason', heavyReturns:'High returns', requestedReturns:'Return requests', returnedActual:'Actually returned' });
  Object.assign(ui.ar,{ returns:'إرجاعات', createReturn:'فتح طلب إرجاع', returnHistory:'سجل الإرجاعات', returnStatus:'حالة الإرجاع', returnUnits:'وحدات للإرجاع', cartonPart:'جزء من كرتون', returnCertificate:'شهادة إرجاع', returnImages:'صور الإرجاع', returnReason:'سبب الإرجاع', heavyReturns:'إرجاعات كثيرة', requestedReturns:'طلبات إرجاع', returnedActual:'تم إرجاعه فعليًا' });
  Object.assign(ui.ru,{ returns:'Возвраты', createReturn:'Открыть возврат', returnHistory:'История возвратов', returnStatus:'Статус возврата', returnUnits:'Единицы к возврату', cartonPart:'Доля короба', returnCertificate:'Акт возврата', returnImages:'Фото возврата', returnReason:'Причина возврата', heavyReturns:'Много возвратов', requestedReturns:'Запросы возврата', returnedActual:'Фактически возвращено' });
  function fileToDataUrl(file){ return new Promise((resolve,reject)=>{ if(!file) return resolve(''); const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); }); }
  function returnRowsForProduct(productId){ return (appState.data.returns||[]).flatMap(r=>(r.items||[]).filter(i=>i.productId===productId).map(i=>({ returnNumber:r.returnNumber, date:r.createdAt, statusText:r.statusText, units:i.units, approvedUnits:i.approvedUnits, cartonFraction:i.cartonFraction, reason:i.reason }))).sort((a,b)=>String(b.date).localeCompare(String(a.date))); }
  function returnBadge(p){ return p.returnHeavy ? `<span class="badge danger">${t('heavyReturns')}</span>` : ''; }
  const oldProductCard26 = productCard;
  productCard = function(p){ return oldProductCard26(p).replace('<div class="tags">', `${returnBadge(p)}<div class="tags">`); };
  const oldProductModal26 = productModal;
  productModal = function(p){ const base=oldProductModal26(p); const returns=returnRowsForProduct(p.id); const table=`<h3>${t('returnHistory')}</h3><div class="table-wrap"><table class="app-history-table"><thead><tr><th>${t('date')}</th><th>${t('returnedActual')}</th><th>${t('cartonPart')}</th><th>${t('returnStatus')}</th></tr></thead><tbody>${returns.map(r=>`<tr><td>${esc(typeof formatAppDate==='function'?formatAppDate(r.date):String(r.date||'').slice(0,10))}</td><td>${Number((r.approvedUnits ?? r.units) || 0)}</td><td>${Math.round(Number(r.cartonFraction||0)*100)}%</td><td>${esc(tr(r.statusText||''))}</td></tr>`).join('') || `<tr><td colspan="4" class="empty">—</td></tr>`}</tbody></table></div><div class="modal-actions"></div>`; return base.replace('<div class="modal-actions"><button class="btn primary" data-modal-close>', `${table}<div class="modal-actions"><button class="btn primary" data-modal-close>`); };
  function returnsView(){ const rows=(appState.data.returns||[]).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))); return `<section class="list-screen enter"><div class="panel-head"><h2>${t('returns')}</h2><button class="btn primary" data-action="new-return">${t('createReturn')}</button></div>${rows.map(r=>`<article class="order-card"><div><b>${esc(r.returnNumber)}</b><span>${esc(typeof formatAppDate==='function'?formatAppDate(r.createdAt):String(r.createdAt||'').slice(0,10))}</span></div><span class="badge">${esc(tr(r.statusText||''))}</span>${(r.items||[]).map(i=>`<div class="order-line"><span>${esc(tr(i.productName))}</span><b>${Number(i.units||0)} יח׳ · ${Math.round(Number(i.cartonFraction||0)*100)}%</b></div>`).join('')}</article>`).join('') || `<p class="empty">—</p>`}</section>`; }
  const oldScreenView26 = screenView;
  screenView = function(){ if(appState.screen==='returns') return returnsView(); return oldScreenView26(); };
  const oldSettings26 = settingsView;
  settingsView = function(){ return oldSettings26().replace(`<button class="btn ghost block" data-screen="orders">${t('orders')}</button>`, `<button class="btn ghost block" data-screen="orders">${t('orders')}</button><button class="btn ghost block" data-screen="returns">${t('returns')}</button>`); };
  function returnForm(productId=''){ const products=(appState.data.products||[]).filter(p=>p.active!==false); return `<h2>${t('createReturn')}</h2><form data-form="return-request" class="stack return-form"><div class="return-products">${products.map(p=>`<label class="return-product-row"><span>${returnBadge(p)} ${esc(tr(p.name))}<small>${esc(p.barcode||'')} · ${Number(p.unitsPerCarton||1)} ${t('unitsPerCarton')}</small></span><input type="number" min="0" name="units__${esc(p.id)}" value="${p.id===productId?'1':''}" placeholder="${t('returnUnits')}"/></label>`).join('')}</div><label>${t('returnCertificate')}<input type="file" name="certificateImageUrl" accept="image/*"/></label><label>${t('returnImages')}<input type="file" name="returnImages" accept="image/*" multiple/></label><textarea name="note" placeholder="${t('returnReason')}"></textarea><div class="modal-actions"><button class="btn primary">${t('send')}</button><button class="btn ghost" type="button" data-modal-close>${t('close')}</button></div></form>`; }
  function collectReturnItems(form){ return [...form.querySelectorAll('input[name^="units__"]')].map(i=>({ productId:i.name.replace('units__',''), units:Number(i.value||0) })).filter(x=>x.units>0); }
  document.addEventListener('click', e=>{ const nr=e.target.closest('[data-action="new-return"]'); if(nr){ e.preventDefault(); showModal(returnForm()); return; } const rp=e.target.closest('[data-action="return-one-product"]'); if(rp){ e.preventDefault(); e.stopPropagation(); showModal(returnForm(rp.dataset.productId)); return; } }, true);
  document.addEventListener('submit', async e=>{ const form=e.target.closest('form[data-form="return-request"]'); if(!form) return; e.preventDefault(); e.stopPropagation(); try{ const cert=await fileToDataUrl(form.querySelector('[name="certificateImageUrl"]')?.files?.[0]); const photos=[]; for(const f of form.querySelector('[name="returnImages"]')?.files||[]) photos.push(await fileToDataUrl(f)); const data=await api('/api/app/returns',{method:'POST',body:JSON.stringify({ items:collectReturnItems(form), note:form.note.value, certificateImageUrl:cert, returnImageUrls:photos })}); closeModal(); await bootstrap(); appState.screen='returns'; render(); toast(`${t('createReturn')} ${icon('check')} ${data.return.returnNumber}`); }catch(err){ toast(err.message,'error'); } }, true);
})();


/* v27 patch: app home hierarchy, returns in bottom nav, improved returns units/carton and promotions view */
(function(){
  Object.assign(ui.he,{ promotions:'מבצעים', cartonActual:'קרטון בפועל', unitsShort:'יח׳' });
  Object.assign(ui.en,{ promotions:'Promotions', cartonActual:'Actual carton', unitsShort:'units' });
  Object.assign(ui.ar,{ promotions:'عروض', cartonActual:'كرتون فعلي', unitsShort:'وحدات' });
  Object.assign(ui.ru,{ promotions:'Акции', cartonActual:'Фактический короб', unitsShort:'шт.' });
  function v27Notes(){ return (appState.data?.notifications||[]).filter(n=>n.status!=='read'); }
  function v27Address(){ const b=appState.data?.branch||{}; return [tr(b.name||''), b.city, b.address].filter(Boolean).join(' · '); }
  function v27Greeting(){ const h=new Date().getHours(); return h<12?t('goodMorning'):h<17?t('goodAfternoon'):t('goodEvening'); }
  function v27Banners(){ const custom=(appState.data?.appBanners||[]).filter(b=>b.active!==false); const fallback=[{title:t('banner1'),text:t('deals'),icon:'🏷️'},{title:t('banner2'),text:t('newProducts'),icon:'✨'},{title:t('banner3'),text:t('newOrder'),icon:'⚡'},{title:t('banner4'),text:t('stock'),icon:'📦'},{title:t('banner5'),text:t('recommendedProducts'),icon:'✅'}]; return (custom.length?custom:fallback).slice(0,5); }
  function v27HomeView(){
    const n=appState.data?.network||{}, b=appState.data?.branch||{};
    const banners=v27Banners();
    const promos=(appState.data?.products||[]).filter(p=>p.promotion);
    return `<section class="home-screen v27-home enter"><div class="branch-hero"><div class="branch-main"><span class="eyebrow">${t('networkName')}</span><h2>${esc(tr(n.name||''))}</h2><p>${esc(v27Address())}</p><small>${esc(v27Greeting())}, ${esc(b.managerName||'')}</small></div></div><div class="banner-carousel tall">${banners.map((x,i)=>`<article class="home-banner ${i===0?'active':''}" style="--i:${i}">${x.imageUrl?`<img src="${esc(x.imageUrl)}" alt="">`:''}<span>${esc(x.icon||'📣')}</span><div><b>${esc(tr(x.title||''))}</b><p>${esc(tr(x.text||''))}</p></div></article>`).join('')}</div><div class="home-actions"><button class="action-card primary" data-action="start-new-order">${icon('cart')}<b>${t('newOrder')}</b></button><button class="action-card" data-screen="promotions">${icon('tag')}<b>${t('deals')}</b><small>${promos.length}</small></button><button class="action-card" data-action="filter-new">${icon('sparkle')}<b>${t('newProducts')}</b></button><button class="action-card" data-action="filter-recommended">${icon('check-circle')}<b>${t('recommendedProducts')}</b></button></div></section>`;
  }
  function v27PromotionsView(){ const rows=(appState.data?.products||[]).filter(p=>p.promotion); return `<section class="catalog-screen enter"><div class="panel-head"><h2>${t('promotions')}</h2></div><div class="product-grid">${rows.map(p=>productCard(p)).join('')||`<p class="empty">${t('noProducts')}</p>`}</div></section>`; }
  const oldScreenV27=screenView;
  screenView=function(){ if(appState.screen==='home') return v27HomeView(); if(appState.screen==='promotions') return v27PromotionsView(); return oldScreenV27(); };
  const oldRenderV27=render;
  render=function(){ applyPreferences(); if(!appState.token||!appState.data){ root.innerHTML=loginView(); return; } const totals=cartTotals(); const unread=v27Notes().length; root.innerHTML=`<div class="app-shell v27-shell" dir="${dir()}"><header class="app-topbar"><div class="app-identity compact"><span class="eyebrow">OrderPilot</span><h1>${esc(tr(appState.data.network?.name||''))}</h1></div><div class="topbar-actions"><button class="round-btn notify-btn" aria-label="${t('notifications')}" data-action="open-notifications">${icon('bell')}${unread?`<em>${Math.min(99,unread)}</em>`:''}</button><button class="round-btn" aria-label="${t('settings')}" data-screen="settings">${icon('settings')}</button></div></header><main class="app-main">${screenView()}</main>${totals.lines?`<button class="floating-cart home-floating-cart" data-action="open-cart">${icon('cart')} <b>${totals.cartons}</b></button>`:''}<nav class="bottom-nav"><button class="${appState.screen==='home'?'active':''}" data-screen="home">${icon('home')}<span>${t('home')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">${icon('box')}<span>${t('orders')}</span></button><button class="${appState.screen==='returns'?'active':''}" data-screen="returns">${icon('return')}<span>${t('returns')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">${icon('chat')}<span>${t('contact')}</span></button></nav></div>`; };
  function v27CartonPart(units,p){ const per=Number(p?.unitsPerCarton||1); return per ? (Number(units||0)/per).toFixed(2) : '0.00'; }
  const oldProductModalV27=productModal;
  productModal=function(p){ let html=oldProductModalV27(p); return html.replace(/<th>[^<]*מתוך קרטון[^<]*<\/th>/g, `<th>${t('cartonActual')}</th>`); };
  const oldProductCardV27=productCard;
  productCard=function(p){ let html=oldProductCardV27(p); if(p.promotion && !html.includes('promo-corner')) html=html.replace('<article ', '<article data-promo="1" ').replace('<div class="tags">', `<span class="promo-corner">${icon('tag')}</span><div class="tags">`); return html; };
  const oldReturnFormSubmit = null;
  document.addEventListener('input', e=>{ if(e.target.matches('form[data-form="return-request"] input[name^="units__"]')){ const row=e.target.closest('.return-product-row'); const pid=e.target.name.replace('units__',''); const p=(appState.data?.products||[]).find(x=>x.id===pid); let preview=row?.querySelector('[data-return-carton-preview]'); if(!preview){ preview=document.createElement('em'); preview.dataset.returnCartonPreview='1'; row.appendChild(preview); } preview.textContent=`${v27CartonPart(e.target.value,p)} ${t('cartonActual')}`; } }, true);
})();


/* v29 patch: restore cleaner home header, order history labels/details, compact returns and translation polish */
(function(){
  const v29copy={
    he:{orders:'היסטוריית הזמנות', orderHistory:'היסטוריית הזמנות', returns:'חזרות', home:'ראשי', networkBranchLine:'פרטי סניף', returnedItems:'מוצרים להחזרה', productsCount:'כמות מוצרים', totalUnits:'סך יחידות', totalCartons:'סך קרטונים', returnDetails:'פרטי החזרה', actualArrived:'הגיע בפועל', ordered:'הוזמן', editedChanges:'שינויים בעריכה', deliveryExpected:'מועד אספקה', createdAt:'בוצע בתאריך', newOrder:'ביצוע הזמנה חדשה', deals:'מבצעים', newProducts:'מוצרים חדשים', recommendedProducts:'מועדפים', goodMorning:'בוקר טוב', goodAfternoon:'צהריים טובים', goodEvening:'ערב טוב'},
    en:{orders:'Order history', orderHistory:'Order history', returns:'Returns', home:'Home', networkBranchLine:'Branch details', returnedItems:'Returned items', productsCount:'Products', totalUnits:'Total units', totalCartons:'Total cartons', returnDetails:'Return details', actualArrived:'Actually arrived', ordered:'Ordered', editedChanges:'Edits', deliveryExpected:'Expected delivery', createdAt:'Created', newOrder:'New order', deals:'Promotions', newProducts:'New products', recommendedProducts:'Recommended products', goodMorning:'Good morning', goodAfternoon:'Good afternoon', goodEvening:'Good evening'},
    ar:{orders:'سجل الطلبات', orderHistory:'سجل الطلبات', returns:'المرتجعات', home:'الرئيسية', networkBranchLine:'تفاصيل الفرع', returnedItems:'منتجات المرتجع', productsCount:'عدد المنتجات', totalUnits:'إجمالي الوحدات', totalCartons:'إجمالي الكراتين', returnDetails:'تفاصيل المرتجع', actualArrived:'وصل فعليًا', ordered:'تم طلبه', editedChanges:'تعديلات', deliveryExpected:'موعد التوريد', createdAt:'تم الإنشاء', newOrder:'طلب جديد', deals:'عروض', newProducts:'منتجات جديدة', recommendedProducts:'منتجات موصى بها', goodMorning:'صباح الخير', goodAfternoon:'مساء الخير', goodEvening:'مساء الخير'},
    ru:{orders:'История заказов', orderHistory:'История заказов', returns:'Возвраты', home:'Главная', networkBranchLine:'Данные филиала', returnedItems:'Товары к возврату', productsCount:'Товаров', totalUnits:'Всего штук', totalCartons:'Всего коробов', returnDetails:'Детали возврата', actualArrived:'Фактически прибыло', ordered:'Заказано', editedChanges:'Изменения', deliveryExpected:'Дата поставки', createdAt:'Создан', newOrder:'Новый заказ', deals:'Акции', newProducts:'Новинки', recommendedProducts:'Рекомендуемые', goodMorning:'Доброе утро', goodAfternoon:'Добрый день', goodEvening:'Добрый вечер'}
  };
  const oldT29=t; t=function(k){ return v29copy[appState.lang]?.[k] || oldT29(k); };
  function v29Esc(x){ return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
  function v29FmtDate(v){ return typeof formatAppDate==='function' ? formatAppDate(v) : String(v||'').slice(0,10); }
  function v29Greeting(){ const h=new Date().getHours(); return h<12?t('goodMorning'):h<17?t('goodAfternoon'):t('goodEvening'); }
  function v29Address(){ const b=appState.data?.branch||{}; return [b.address,b.city].filter(Boolean).join(' '); }
  function v29Banners(){ const custom=(appState.data?.appBanners||[]).filter(b=>b.active!==false); const fallback=[{title:t('deals'),text:t('companyAds'),icon:'🏷️'},{title:t('newProducts'),text:t('catalog'),icon:'✨'},{title:t('newOrder'),text:t('startOrder'),icon:'🛒'},{title:t('recommendedProducts'),text:t('useRecommended'),icon:'✅'},{title:t('stock'),text:t('notifications'),icon:'📦'}]; return (custom.length?custom:fallback).slice(0,5); }
  function v29HomeView(){
    const n=appState.data?.network||{}, b=appState.data?.branch||{};
    const line=`${tr(n.name||'')} - ${v29Address() || tr(b.name||'')}`;
    const banners=v29Banners();
    return `<section class="home-screen v29-home enter">
      <div class="home-branch-line"><b>${v29Esc(line)}</b><span>${v29Esc(v29Greeting())}, ${v29Esc(b.managerName||'')}</span></div>
      <div class="banner-carousel v29-banners">${banners.map((x,i)=>`<article class="home-banner ${i===0?'active':''}" style="--i:${i}">${x.imageUrl?`<img src="${v29Esc(x.imageUrl)}" alt="">`:''}<span>${v29Esc(x.icon||'📣')}</span><div><b>${v29Esc(tr(x.title||''))}</b><p>${v29Esc(tr(x.text||''))}</p></div></article>`).join('')}</div>
      <div class="home-actions v29-actions">
        ${(cartTotals().cartons > 0) ? `<button class="action-card primary" data-screen="catalog"><span>${icon('cart')}</span><b>${t('continueOrder')} (${cartTotals().cartons} ${t('cartons')})</b></button>` : `<button class="action-card primary" data-action="start-new-order"><span>${icon('cart')}</span><b>${t('newOrder')}</b></button>`}
        <button class="action-card" data-screen="promotions"><span>${icon('tag')}</span><b>${t('deals')}</b></button>
        <button class="action-card" data-action="filter-new"><span>${icon('sparkle')}</span><b>${t('newProducts')}</b></button>
        <button class="action-card" data-action="filter-recommended"><span>${icon('check-circle')}</span><b>${t('recommendedProducts')}</b></button>
      </div>
    </section>`;
  }
  function v29OrderStatus(o){ return tr(o.statusText||o.status||''); }
  function v29Source(o){ return o.source==='app'?'אפליקציה':o.source==='app-clone'?'שכפול באפליקציה':(o.source==='admin'?'נציג':''); }
  function v29OrderRows(o){ return (o.items||[]).map(i=>`<tr><td>${v29Esc(tr(i.name||i.productName||''))}</td><td>${Number(i.quantity||0)}</td><td>${Number((i.packedQty ?? i.suppliedQty ?? i.suppliedQuantity ?? i.quantity) || 0)}</td></tr>`).join(''); }
  function v29OrderDetails(o){ return `<h2>${t('orderDetails')} ${v29Esc(o.orderNumber||'')}</h2><div class="order-detail-grid"><div><b>${v29Esc(v29FmtDate(o.createdAt||o.deliveryDate))}</b><span>${t('createdAt')}</span></div><div><b>${v29Esc(v29OrderStatus(o))}</b><span>${t('status')}</span></div><div><b>${v29Esc(tr(o.deliveryTypeTitle||''))}</b><span>${t('type')}</span></div><div><b>${v29Esc(v29FmtDate(o.deliveryDate))}</b><span>${t('deliveryExpected')}</span></div><div><b>${v29Esc(v29Source(o))}</b><span>${t('orderSource')}</span></div>${o.updatedAt&&o.updatedAt!==o.createdAt?`<div><b>${t('edited')}</b><span>${v29Esc(v29FmtDate(o.updatedAt))}</span></div>`:''}</div><div class="table-wrap"><table class="app-history-table"><thead><tr><th>${t('product')}</th><th>${t('ordered')}</th><th>${t('actualArrived')}</th></tr></thead><tbody>${v29OrderRows(o)}</tbody></table></div>${o.editLog?.length?`<h3>${t('editedChanges')}</h3><ul class="simple-list">${o.editLog.map(x=>`<li>${v29Esc(v29FmtDate(x.at||''))} · ${v29Esc(x.text||x.action||'')}</li>`).join('')}</ul>`:''}<div class="modal-actions"><button class="btn ghost" data-clone-order="${v29Esc(o.id)}">${t('cloneOrder')}</button>${o.canEdit?`<button class="btn primary" data-edit-history-order="${v29Esc(o.id)}">${t('edit')}</button>`:''}<button class="btn ghost" data-modal-close>${t('close')}</button></div>`; }
  ordersView=function(){ const rows=(appState.data.orders||[]).map(o=>`<article class="order-card v29-order-card"><button class="order-open-card" data-order-detail="${v29Esc(o.id)}"><div><b>${v29Esc(o.orderNumber||'')}</b><span>${t('createdAt')}: ${v29Esc(v29FmtDate(o.createdAt||o.deliveryDate))}</span><small>${t('deliveryExpected')}: ${v29Esc(v29FmtDate(o.deliveryDate))} · ${v29Esc(tr(o.deliveryTypeTitle||''))}</small><small>${t('orderSource')}: ${v29Esc(v29Source(o))}${o.updatedAt&&o.updatedAt!==o.createdAt?` · ${t('edited')}`:''}</small></div><span class="badge ${o.status==='supplied'?'on':''}">${v29Esc(v29OrderStatus(o))}</span></button></article>`).join('') || `<p class="empty">—</p>`; return `<section class="list-screen enter"><div class="panel-head"><h2>${t('orderHistory')}</h2></div>${rows}</section>`; };
  function v29ReturnTotals(r){ const units=(r.items||[]).reduce((s,i)=>s+Number(i.units||i.approvedUnits||0),0); const cartons=(r.items||[]).reduce((s,i)=>s+Number(i.cartonFraction||0),0); return {count:(r.items||[]).length,units,cartons}; }
  function v29ReturnDetails(r){ const rows=(r.items||[]).map(i=>`<tr><td>${v29Esc(tr(i.productName||i.name||''))}</td><td>${Number(i.units||0)}</td><td>${Number(i.approvedUnits ?? i.units ?? 0)}</td><td>${Number(i.cartonFraction||0).toFixed(2)}</td></tr>`).join(''); return `<h2>${t('returnDetails')} ${v29Esc(r.returnNumber||'')}</h2><div class="order-detail-grid"><div><b>${v29Esc(v29FmtDate(r.createdAt))}</b><span>${t('createdAt')}</span></div><div><b>${v29Esc(tr(r.statusText||r.status||''))}</b><span>${t('status')}</span></div><div><b>${v29ReturnTotals(r).count}</b><span>${t('productsCount')}</span></div><div><b>${v29ReturnTotals(r).units}</b><span>${t('totalUnits')}</span></div></div><div class="table-wrap"><table class="app-history-table"><thead><tr><th>${t('product')}</th><th>${t('qty')}</th><th>${t('actualArrived')}</th><th>${t('cartons')}</th></tr></thead><tbody>${rows}</tbody></table></div><p class="muted">${v29Esc(r.note||'')}</p><div class="modal-actions"><button class="btn ghost" data-modal-close>${t('close')}</button></div>`; }
  returnsView=function(){ const rows=(appState.data.returns||[]).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).map(r=>{ const tot=v29ReturnTotals(r); return `<article class="order-card return-card"><button class="order-open-card" data-return-detail="${v29Esc(r.id)}"><div><b>${v29Esc(r.returnNumber||'')}</b><span>${v29Esc(v29FmtDate(r.createdAt))}</span><small>${tot.count} ${t('productsCount')} · ${tot.units} ${t('totalUnits')} · ${tot.cartons.toFixed(2)} ${t('cartons')}</small></div><span class="badge">${v29Esc(tr(r.statusText||r.status||''))}</span></button></article>`; }).join('') || `<p class="empty">—</p>`; return `<section class="list-screen enter"><div class="panel-head"><h2>${t('returns')}</h2><button class="btn primary" data-action="new-return">${t('createReturn')}</button></div>${rows}</section>`; };
  const prevScreenV29=screenView;
  screenView=function(){ if(appState.screen==='home') return v29HomeView(); if(appState.screen==='orders') return ordersView(); if(appState.screen==='returns') return returnsView(); return prevScreenV29(); };
  render=function(){ applyPreferences(); if(!appState.token||!appState.data){ root.innerHTML=loginView(); return; } const totals=cartTotals(); const unread=(appState.data.notifications||[]).filter(n=>n.status!=='read').length; root.innerHTML=`<div class="app-shell v29-shell" dir="${dir()}"><header class="app-topbar"><div class="app-identity compact"><span class="eyebrow">OrderPilot</span></div><div class="topbar-actions"><button class="round-btn notify-btn" aria-label="${t('notifications')}" data-action="open-notifications">${icon('bell')}${unread?`<em>${Math.min(99,unread)}</em>`:''}</button><button class="round-btn" aria-label="${t('settings')}" data-screen="settings">${icon('settings')}</button></div></header><main class="app-main">${screenView()}</main>${totals.lines?`<button class="floating-cart home-floating-cart" data-action="open-cart">${icon('cart')} <b>${totals.cartons}</b></button>`:''}<nav class="bottom-nav"><button class="${appState.screen==='home'?'active':''}" data-screen="home">${icon('home')}<span>${t('home')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">${icon('box')}<span>${t('orderHistory')}</span></button><button class="${appState.screen==='returns'?'active':''}" data-screen="returns">${icon('return')}<span>${t('returns')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">${icon('chat')}<span>${t('contact')}</span></button></nav></div>`; };
  document.addEventListener('click',e=>{ const od=e.target.closest('[data-order-detail]'); if(od){ const o=(appState.data.orders||[]).find(x=>x.id===od.dataset.orderDetail); if(o){ e.preventDefault(); e.stopPropagation(); showModal(v29OrderDetails(o)); } return; } const rd=e.target.closest('[data-return-detail]'); if(rd){ const r=(appState.data.returns||[]).find(x=>x.id===rd.dataset.returnDetail); if(r){ e.preventDefault(); e.stopPropagation(); showModal(v29ReturnDetails(r)); } return; } }, true);
})();


/* v30 patch: require return photo in the app */
(function(){
  const oldReturnForm30 = typeof returnForm === 'function' ? returnForm : null;
  if(oldReturnForm30){
    returnForm = function(productId=''){
      let html = oldReturnForm30(productId);
      html = html.replace(/<label>תמונות החזרה<input type="file" name="returnImages"/g, '<label>תמונות החזרה <b class="required">*</b><input type="file" name="returnImages" required');
      html = html.replace(/<label>Return photos<input type="file" name="returnImages"/g, '<label>Return photos <b class="required">*</b><input type="file" name="returnImages" required');
      return html;
    };
  }
  document.addEventListener('submit', e=>{
    const form=e.target.closest('form[data-form="return-request"]');
    if(!form) return;
    const imgs=form.querySelector('[name="returnImages"]');
    if(imgs && (!imgs.files || imgs.files.length===0)){
      e.preventDefault(); e.stopPropagation(); toast('חובה לצרף לפחות תמונה אחת של ההחזרה','error');
      return false;
    }
  }, true);
})();

/* v31 patch: restored attractive home header, working home shortcuts, stronger dark mode */
(function(){
  const esc31 = typeof esc === 'function' ? esc : (v=>String(v??'').replace(/[&<>"']/g,''));
  function v31Greeting(){ const h=new Date().getHours(); return h<12?t('goodMorning'):h<17?t('goodAfternoon'):t('goodEvening'); }
  function v31Address(){ const b=appState.data?.branch||{}; return [b.address,b.city].filter(Boolean).join(' '); }
  function v31Banners(){ const custom=(appState.data?.appBanners||[]).filter(b=>b.active!==false); const fallback=[{title:t('deals'),text:t('companyAds'),icon:'🏷️'},{title:t('newProducts'),text:t('catalog'),icon:'✨'},{title:t('recommendedProducts'),text:t('useRecommended'),icon:'✅'},{title:t('returns'),text:t('createReturn'),icon:'↩️'},{title:t('contact'),text:t('contact'),icon:'💬'}]; return (custom.length?custom:fallback).slice(0,5); }
  function v31HomeView(){
    const n=appState.data?.network||{}, b=appState.data?.branch||{};
    const place=`${tr(n.name||'')} - ${v31Address() || tr(b.name||'')}`;
    const banners=v31Banners();
    return `<section class="home-screen v31-home enter"><div class="v31-brand-card"><span class="eyebrow">OrderPilot</span><b>${esc31(place)}</b><small>${esc31(v31Greeting())}, ${esc31(b.managerName||b.name||'')}</small></div><div class="banner-carousel v31-banners">${banners.map((x,i)=>`<article class="home-banner ${i===0?'active':''}" style="--i:${i}">${x.imageUrl?`<img src="${esc31(x.imageUrl)}" alt="">`:''}<span>${esc31(x.icon||'📣')}</span><div><b>${esc31(tr(x.title||''))}</b><p>${esc31(tr(x.text||''))}</p></div></article>`).join('')}</div><div class="home-actions v31-actions">${(cartTotals().cartons > 0) ? `<button class="action-card primary" data-screen="catalog"><span>${icon('cart')}</span><b>${t('continueOrder')} (${cartTotals().cartons} ${t('cartons')})</b></button>` : `<button class="action-card primary" data-action="start-new-order"><span>${icon('cart')}</span><b>${t('newOrder')}</b></button>`}<button class="action-card" data-screen="promotions"><span>${icon('tag')}</span><b>${t('deals')}</b></button><button class="action-card" data-action="filter-new"><span>${icon('sparkle')}</span><b>${t('newProducts')}</b></button><button class="action-card" data-action="filter-recommended"><span>${icon('check-circle')}</span><b>${t('recommendedProducts')}</b></button></div></section>`;
  }
  function v31PromotionsView(){ const rows=(appState.data?.products||[]).filter(p=>p.promotion || (p.tags||[]).some(x=>String(x).includes('מבצע'))); return `<section class="catalog-screen enter"><div class="panel-head"><h2>${t('deals')}</h2></div><div class="product-grid">${rows.map(p=>productCard(p)).join('')||`<p class="empty">${t('noProducts')}</p>`}</div></section>`; }
  const prevScreen31=screenView;
  screenView=function(){ if(appState.screen==='home') return v31HomeView(); if(appState.screen==='promotions') return v31PromotionsView(); return prevScreen31(); };
  // Capture home shortcut clicks before older handlers that missed these actions.
  document.addEventListener('click', e=>{
    const act=e.target.closest('[data-action]')?.dataset.action;
    if(act==='filter-new' || act==='filter-recommended'){
      e.preventDefault(); e.stopPropagation();
      appState.selectedTypeId = appState.selectedTypeId || (appState.data?.deliveryTypes||[]).find(x=>x.active!==false)?.id || '';
      appState.selectedDate = appState.selectedDate || '';
      appState.selectedCategory='all'; appState.selectedSubcategory=''; appState.search='';
      appState.homeProductMode = act==='filter-new' ? 'new' : 'recommended';
      const baseProductsForCurrent = productsForCurrent;
      productsForCurrent = function(){ const list=baseProductsForCurrent(); if(appState.homeProductMode==='new') return list.filter(p=>p.newItem || (p.tags||[]).some(x=>String(x).includes('חדש'))); if(appState.homeProductMode==='recommended') return list.filter(p=>p.usual || p.trending || Number(p.recommendedQty||0)>0); return list; };
      appState.screen='order';
      if(!appState.selectedTypeId){ render(); return; }
      render();
      return;
    }
    if(act==='start-new-order'){ appState.homeProductMode=''; }
  }, true);
  const prevRender31=render;
  render=function(){ prevRender31(); const shell=document.querySelector('.app-shell'); if(shell){ shell.classList.add('v31-shell'); } };
})();


/* v32 patch: clean app home placement, fixed shortcut screens, contact success, translations, safer colors */
(function(){
  const esc32 = typeof esc === 'function' ? esc : (v=>String(v??'').replace(/[&<>"']/g,''));
  const oldT32 = t;
  const labels32 = {
    he:{home:'ראשי', newOrder:'ביצוע הזמנה חדשה', deals:'מבצעים', newProducts:'מוצרים חדשים', recommendedProducts:'מועדפים', quickProducts:'מוצרים', contactSentTitle:'הפנייה נשלחה בהצלחה', contactSentBody:'קיבלנו את הפנייה. תשובה מהחברה תופיע בפעמון ההתראות.', backHome:'חזרה לראשי', businessDetails:'פרטי העסק', network:'רשת', branch:'סניף', address:'כתובת', manager:'מנהל', settings:'הגדרות', notifications:'התראות'},
    en:{home:'Home', newOrder:'New order', deals:'Deals', newProducts:'New products', recommendedProducts:'Recommended products', quickProducts:'Products', contactSentTitle:'Message sent successfully', contactSentBody:'Your message was received. The company reply will appear in the notification bell.', backHome:'Back home', businessDetails:'Business details', network:'Network', branch:'Branch', address:'Address', manager:'Manager', settings:'Settings', notifications:'Notifications'},
    ar:{home:'الرئيسية', newOrder:'طلب جديد', deals:'العروض', newProducts:'منتجات جديدة', recommendedProducts:'منتجات مقترحة', quickProducts:'المنتجات', contactSentTitle:'تم إرسال الطلب بنجاح', contactSentBody:'تم استلام رسالتك. سيظهر رد الشركة في جرس الإشعارات.', backHome:'رجوع للرئيسية', businessDetails:'تفاصيل النشاط', network:'الشبكة', branch:'الفرع', address:'العنوان', manager:'المدير', settings:'الإعدادات', notifications:'الإشعارات'},
    ru:{home:'Главная', newOrder:'Новый заказ', deals:'Акции', newProducts:'Новинки', recommendedProducts:'Рекомендованные', quickProducts:'Товары', contactSentTitle:'Сообщение отправлено', contactSentBody:'Ваше обращение получено. Ответ компании появится в колокольчике уведомлений.', backHome:'На главную', businessDetails:'Данные бизнеса', network:'Сеть', branch:'Филиал', address:'Адрес', manager:'Менеджер', settings:'Настройки', notifications:'Уведомления'}
  };
  t = function(k){ return labels32[appState.lang]?.[k] || oldT32(k); };
  const oldTr32 = tr;
  tr = function(value){
    const raw=String(value??''); if(!raw) return '';
    const data=appState.data?.translations?.[raw]?.[appState.lang]; if(data) return data;
    const dict={
      'company':{he:'חברה',en:'Company',ar:'الشركة',ru:'Компания'}, 'network':{he:'רשת',en:'Network',ar:'شبكة',ru:'Сеть'},
      'מבצע חברה':{en:'Company promotion',ar:'عرض الشركة',ru:'Акция компании'}, 'מבצע רשת':{en:'Network promotion',ar:'عرض الشبكة',ru:'Акция сети'},
      'חדש':{en:'New',ar:'جديد',ru:'Новинка'}, 'חזר למלאי':{en:'Back in stock',ar:'عاد للمخزون',ru:'Снова в наличии'}, 'מבצע':{en:'Deal',ar:'عرض',ru:'Акция'},
      'מרובה חזרות':{en:'High returns',ar:'مرتجعات كثيرة',ru:'Много возвратов'}, 'מוזמן קבוע':{en:'Usually ordered',ar:'يُطلب عادة',ru:'Часто заказывают'}, 'הולך חזק':{en:'Trending',ar:'رائج',ru:'Популярно'}
    };
    return dict[raw]?.[appState.lang] || oldTr32(raw);
  };
  function greeting32(){ const h=new Date().getHours(); return h<12?(appState.lang==='he'?'בוקר טוב':t('goodMorning')):h<17?(appState.lang==='he'?'צהריים טובים':t('goodAfternoon')):(appState.lang==='he'?'ערב טוב':t('goodEvening')); }
  function branchAddress32(){ const b=appState.data?.branch||{}; return [b.address,b.city].filter(Boolean).join(' '); }
  function placeLine32(){ const n=tr(appState.data?.network?.name||''); const addr=branchAddress32(); return [n, addr].filter(Boolean).join(' - '); }
  function banners32(){ const custom=(appState.data?.appBanners||[]).filter(b=>b.active!==false); const fallback=[{title:t('deals'),text:t('newOrder'),icon:'🏷️'},{title:t('newProducts'),text:t('catalog'),icon:'✨'},{title:t('recommendedProducts'),text:t('useRecommended'),icon:'✅'},{title:t('returns'),text:t('createReturn'),icon:'↩️'},{title:t('contact'),text:t('contact'),icon:'💬'}]; return (custom.length?custom:fallback).slice(0,5); }
  function home32(){ const b=appState.data?.branch||{}; const banners=banners32(); return `<section class="home-screen v32-home enter"><div class="banner-carousel v32-banners">${banners.map((x,i)=>`<article class="home-banner ${i===0?'active':''}" style="--i:${i}">${x.imageUrl?`<img src="${esc32(x.imageUrl)}" alt="">`:''}<span>${esc32(x.icon||'📣')}</span><div><b>${esc32(tr(x.title||''))}</b><p>${esc32(tr(x.text||''))}</p></div></article>`).join('')}</div><div class="home-actions v32-actions">${(cartTotals().cartons > 0) ? `<button class="action-card primary" data-screen="catalog"><span>${icon('cart')}</span><b>${t('continueOrder')} (${cartTotals().cartons} ${t('cartons')})</b></button>` : `<button class="action-card primary" data-action="start-new-order"><span>${icon('cart')}</span><b>${t('newOrder')}</b></button>`}<button class="action-card" data-screen="promotions"><span>${icon('tag')}</span><b>${t('deals')}</b></button><button class="action-card" data-action="v32-filter-new"><span>${icon('sparkle')}</span><b>${t('newProducts')}</b></button><button class="action-card" data-action="v32-filter-recommended"><span>${icon('check-circle')}</span><b>${t('recommendedProducts')}</b></button></div></section>`; }
  function quickProducts32(){ const mode=appState.quickMode||'new'; const all=(appState.data?.products||[]).filter(p=>p.active!==false); const rows=all.filter(p=> mode==='new' ? (p.newItem || (p.tags||[]).some(x=>String(x).includes('חדש'))) : (p.usual || p.trending || Number(p.recommendedQty||0)>0)); return `<section class="catalog-screen quick-products enter"><div class="catalog-head"><button class="text-btn" data-screen="home">${t('backHome')}</button><div><h2>${mode==='new'?t('newProducts'):t('recommendedProducts')}</h2><p>${t('quickProducts')}</p></div></div><div class="search-row"><input value="${esc32(appState.search||'')}" data-search placeholder="${t('search')}" aria-label="${t('search')}"/><button class="btn ghost" data-action="scan-barcode">${icon('camera')}</button></div><div class="product-grid">${rows.filter(p=>{const q=(appState.search||'').trim().toLowerCase(); return !q || [tr(p.name),p.name,p.barcode,tr(p.category),p.category,(p.tags||[]).map(tr).join(' ')].join(' ').toLowerCase().includes(q)}).map(productCard).join('') || `<p class="empty">${t('noProducts')}</p>`}</div></section>`; }
  const prevScreen32=screenView;
  screenView=function(){ if(appState.screen==='home') return home32(); if(appState.screen==='quick-products') return quickProducts32(); return prevScreen32(); };
  render=function(){ applyPreferences(); if(!appState.token||!appState.data){ root.innerHTML=loginView(); return; } const totals=cartTotals(); const unread=(appState.data.notifications||[]).filter(n=>n.status!=='read').length; const b=appState.data.branch||{}; root.innerHTML=`<div class="app-shell v32-shell" dir="${dir()}"><header class="app-topbar v32-topbar"><div class="v32-title-bubble"><span class="eyebrow">OrderPilot</span><b>${esc32(placeLine32())}</b><small>${esc32(greeting32())}, ${esc32(b.managerName||b.name||'')}</small></div><div class="topbar-actions"><button class="round-btn notify-btn" aria-label="${t('notifications')}" data-action="open-notifications">${icon('bell')}${unread?`<em>${Math.min(99,unread)}</em>`:''}</button><button class="round-btn settings-btn" aria-label="${t('settings')}" data-action="open-settings-modal"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button></div></header><main class="app-main">${screenView()}</main>${totals.lines?`<button class="floating-cart home-floating-cart" data-action="open-cart">${icon('cart')} <b>${totals.cartons}</b></button>`:''}<nav class="bottom-nav"><button class="${appState.screen==='home'?'active':''}" data-screen="home">${icon('home')}<span>${t('home')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">${icon('box')}<span>${t('orderHistory')||t('orders')}</span></button><button class="${appState.screen==='returns'?'active':''}" data-screen="returns">${icon('return')}<span>${t('returns')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">${icon('chat')}<span>${t('contact')}</span></button></nav></div>`; };
  const prevSettings32=settingsView;
  settingsView=function(){ const b=appState.data?.branch||{}, n=appState.data?.network||{}; return `<section class="flow-card enter settings-card"><h2>${t('appSettings')}</h2><label>${t('language')}<select data-lang-select>${['he','en','ar','ru'].map(l=>`<option value="${l}" ${l===appState.lang?'selected':''}>${l==='he'?'עברית':l==='en'?'English':l==='ar'?'العربية':'Русский'}</option>`).join('')}</select></label><label>${t('theme')}<select data-theme-select><option value="light" ${appState.theme==='light'?'selected':''}>${t('light')}</option><option value="dark" ${appState.theme==='dark'?'selected':''}>${t('dark')}</option></select></label><label>${t('fontSize')}<select data-font-select><option value="small" ${appState.fontSize==='small'?'selected':''}>${t('small')}</option><option value="normal" ${appState.fontSize==='normal'?'selected':''}>${t('normal')}</option><option value="large" ${appState.fontSize==='large'?'selected':''}>${t('large')}</option></select></label><div class="business-details"><h3>${t('businessDetails')}</h3><p><b>${t('network')}:</b> ${esc32(tr(n.name||''))}</p><p><b>${t('branch')}:</b> ${esc32(tr(b.name||''))}</p><p><b>${t('address')}:</b> ${esc32(branchAddress32())}</p><p><b>${t('manager')}:</b> ${esc32(b.managerName||'')}</p><p><b>${t('phone')}:</b> ${esc32(b.phone||'')}</p><p><b>${t('email')}:</b> ${esc32(b.email||'')}</p></div><button class="btn danger block" data-action="logout">${icon('logout')} ${t('logout')}</button></section>`; };
  const oldContact32=contactView;
  contactView=function(){ if(appState.contactSent){ return `<section class="flow-card enter contact-success"><h2>${t('contactSentTitle')}</h2><p>${t('contactSentBody')}</p><button class="btn primary block" data-action="contact-new">${t('send')}</button></section>`; } return oldContact32(); };
  document.addEventListener('click',e=>{ const a=e.target.closest('[data-action]')?.dataset.action; if(a==='v32-filter-new'||a==='v32-filter-recommended'){ e.preventDefault(); e.stopPropagation(); appState.quickMode=a==='v32-filter-new'?'new':'recommended'; appState.search=''; appState.screen='quick-products'; render(); return; } if(a==='contact-new'){ e.preventDefault(); appState.contactSent=false; render(); return; } }, true);
  document.addEventListener('submit', e=>{ const f=e.target.closest('form[data-form="contact"]'); if(!f) return; setTimeout(()=>{ appState.contactSent=true; render(); }, 250); }, true);
})();

/* v33 patch: final home header, shortcut navigation, contact success and stronger translations/colors */
(function(){
  const esc33 = typeof esc === 'function' ? esc : (v=>String(v??'').replace(/[&<>"']/g,''));
  const prevT33 = t;
  const more33 = {
    he:{orderHistory:'היסטוריית הזמנות', home:'ראשי', settings:'הגדרות', notifications:'התראות', newProducts:'מוצרים חדשים', recommendedProducts:'מועדפים', deals:'מבצעים', backHome:'חזרה לראשי', contactSentTitle:'הפנייה נשלחה בהצלחה', contactSentBody:'קיבלנו את הפנייה. תשובת החברה תופיע בפעמון ההתראות.', sendAnother:'שליחת פנייה נוספת'},
    en:{orderHistory:'Order history', home:'Home', settings:'Settings', notifications:'Notifications', newProducts:'New products', recommendedProducts:'Recommended products', deals:'Deals', backHome:'Back home', contactSentTitle:'Message sent successfully', contactSentBody:'Your message was received. The company response will appear in the notification bell.', sendAnother:'Send another message'},
    ar:{orderHistory:'سجل الطلبات', home:'الرئيسية', settings:'الإعدادات', notifications:'الإشعارات', newProducts:'منتجات جديدة', recommendedProducts:'منتجات مقترحة', deals:'عروض', backHome:'رجوع للرئيسية', contactSentTitle:'تم إرسال الطلب بنجاح', contactSentBody:'تم استلام رسالتك. سيظهر رد الشركة في جرس الإشعارات.', sendAnother:'إرسال رسالة أخرى'},
    ru:{orderHistory:'История заказов', home:'Главная', settings:'Настройки', notifications:'Уведомления', newProducts:'Новинки', recommendedProducts:'Рекомендованные', deals:'Акции', backHome:'На главную', contactSentTitle:'Сообщение отправлено', contactSentBody:'Ваше обращение получено. Ответ компании появится в колокольчике уведомлений.', sendAnother:'Отправить ещё'}
  };
  t = function(k){ return more33[appState.lang]?.[k] || prevT33(k); };
  const prevTr33 = tr;
  const local33 = {
    'הזמנה רגילה':{en:'Regular order',ar:'طلب عادي',ru:'Обычный заказ'},
    'אספקה בקירור':{en:'Chilled delivery',ar:'توصيل مبرد',ru:'Охлаждённая поставка'},
    'מבצע':{en:'Deal',ar:'عرض',ru:'Акция'}, 'חדש':{en:'New',ar:'جديد',ru:'Новинка'},
    'מומלץ':{en:'Recommended',ar:'مقترح',ru:'Рекомендуется'}, 'מוצרים מומלצים':{en:'Recommended products',ar:'منتجات مقترحة',ru:'Рекомендуемые товары'},
    'מוצרים חדשים':{en:'New products',ar:'منتجات جديدة',ru:'Новинки'}, 'חזר למלאי':{en:'Back in stock',ar:'عاد للمخزون',ru:'Снова в наличии'},
    'מרובה חזרות':{en:'High returns',ar:'مرتجعات كثيرة',ru:'Много возвратов'}, 'פרווה':{en:'Pareve',ar:'بارفي',ru:'Парве'},
    'חלב ישראל':{en:'Chalav Yisrael',ar:'حليب إسرائيل',ru:'Халав Исраэль'}, 'אבקת חלב נוכרי':{en:'Non-Jewish milk powder',ar:'مسحوق حليب أجنبي',ru:'Сухое молоко'},
    'בשרי':{en:'Meat',ar:'لحومي',ru:'Мясной'}, 'ממתינה לבדיקה':{en:'Pending review',ar:'بانتظار الفحص',ru:'Ожидает проверки'},
    'אושרה':{en:'Approved',ar:'تمت الموافقة',ru:'Одобрено'}, 'נדחתה':{en:'Rejected',ar:'مرفوضة',ru:'Отклонено'}
  };
  tr = function(value){ const raw=String(value??''); if(!raw) return ''; if(appState.lang==='he') return raw; const data=appState.data?.translations?.[raw]?.[appState.lang]; if(data) return data; return local33[raw]?.[appState.lang] || prevTr33(raw); };
  function addr33(){ const b=appState.data?.branch||{}; return [b.address,b.city].filter(Boolean).join(' '); }
  function greeting33(){ const h=new Date().getHours(); if(h<12) return appState.lang==='he'?'בוקר טוב':t('goodMorning'); if(h<17) return appState.lang==='he'?'צהריים טובים':t('goodAfternoon'); return appState.lang==='he'?'ערב טוב':t('goodEvening'); }
  function place33(){ const n=tr(appState.data?.network?.name||''); const address=addr33(); return [n,address].filter(Boolean).join(' - '); }
  function banners33(){ const custom=(appState.data?.appBanners||[]).filter(x=>x.active!==false); const fallback=[{icon:'🏷️',title:t('deals'),text:t('newOrder')},{icon:'✨',title:t('newProducts'),text:t('catalog')},{icon:'✅',title:t('recommendedProducts'),text:t('useRecommended')},{icon:'↩️',title:t('returns'),text:t('createReturn')},{icon:'💬',title:t('contact'),text:t('contactSentBody')}]; return (custom.length?custom:fallback).slice(0,5); }
  function home33(){ const banners=banners33(); return `<section class="home-screen v33-home enter"><div class="banner-carousel v33-banners">${banners.map((x,i)=>`<article class="home-banner ${i===0?'active':''}" style="--i:${i}">${x.imageUrl?`<img src="${esc33(x.imageUrl)}" alt="">`:''}<span>${esc33(x.icon||'📣')}</span><div><b>${esc33(tr(x.title||''))}</b><p>${esc33(tr(x.text||''))}</p></div></article>`).join('')}</div><div class="home-actions v33-actions">${(cartTotals().cartons > 0) ? `<button class="action-card primary" data-screen="catalog"><span>${icon('cart')}</span><b>${t('continueOrder')} (${cartTotals().cartons} ${t('cartons')})</b></button>` : `<button class="action-card primary" data-action="start-new-order"><span>${icon('cart')}</span><b>${t('newOrder')}</b></button>`}<button class="action-card" data-screen="promotions"><span>${icon('tag')}</span><b>${t('deals')}</b></button><button class="action-card" data-quick-mode="new"><span>${icon('sparkle')}</span><b>${t('newProducts')}</b></button><button class="action-card" data-quick-mode="recommended"><span>${icon('check-circle')}</span><b>${t('recommendedProducts')}</b></button></div></section>`; }
  function quickProducts33(){ const mode=appState.quickMode||'new'; const rows=(appState.data?.products||[]).filter(p=>{ if(p.active===false) return false; if(mode==='new') return p.newItem || (p.tags||[]).some(x=>String(x).includes('חדש')); if(mode==='recommended') return p.usual || p.trending || Number(p.recommendedQty||0)>0; return p.promotion || (p.tags||[]).some(x=>String(x).includes('מבצע')); }); const q=(appState.search||'').trim().toLowerCase(); const visible=rows.filter(p=>!q || [tr(p.name),p.name,p.barcode,tr(p.category),p.category,tr(p.subcategory),p.subcategory,(p.tags||[]).map(tr).join(' ')].join(' ').toLowerCase().includes(q)); const title=mode==='new'?t('newProducts'):mode==='recommended'?t('recommendedProducts'):t('deals'); return `<section class="catalog-screen quick-products enter"><div class="catalog-head"><button class="text-btn" data-screen="home">${t('backHome')}</button><div><h2>${title}</h2><p>${esc33(place33())}</p></div></div><div class="search-row">${searchFieldHtml(appState.search)}${hasFeatureApp('barcodeScan')?`<button class="btn ghost" data-action="scan-barcode">${icon('barcode')}</button>`:''}</div><div class="product-grid">${visible.map(productCard).join('') || `<p class="empty">${t('noProducts')}</p>`}</div></section>`; }
  const prevScreen33=screenView;
  screenView=function(){ if(appState.screen==='home') return home33(); if(appState.screen==='quick-products') return quickProducts33(); return prevScreen33(); };
  render=function(){ applyPreferences(); if(!appState.token||!appState.data){ root.innerHTML=loginView(); return; } const totals=cartTotals(); const unread=(appState.data.notifications||[]).filter(n=>n.status!=='read').length; const b=appState.data.branch||{}; root.innerHTML=`<div class="app-shell v33-shell" dir="${dir()}"><header class="app-topbar v33-topbar"><div class="v33-title"><span class="eyebrow">OrderPilot</span><b>${esc33(place33())}</b><small>${esc33(greeting33())}, ${esc33(b.managerName||b.name||'')}</small></div><div class="topbar-actions"><button class="round-btn notify-btn" aria-label="${t('notifications')}" data-action="open-notifications">${icon('bell')}${unread?`<em>${Math.min(99,unread)}</em>`:''}</button><button class="round-btn settings-btn" aria-label="${t('settings')}" data-action="open-settings-modal"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button></div></header><main class="app-main">${screenView()}</main>${totals.lines?`<button class="floating-cart home-floating-cart" data-action="open-cart">${icon('cart')} <b>${totals.cartons}</b></button>`:''}<nav class="bottom-nav"><button class="${appState.screen==='home'?'active':''}" data-screen="home">${icon('home')}<span>${t('home')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">${icon('box')}<span>${t('orderHistory')||t('orders')}</span></button><button class="${appState.screen==='returns'?'active':''}" data-screen="returns">${icon('return')}<span>${t('returns')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">${icon('chat')}<span>${t('contact')}</span></button></nav></div>`; };
  document.addEventListener('click', e=>{ const q=e.target.closest('[data-quick-mode]'); if(q){ e.preventDefault(); e.stopPropagation(); appState.quickMode=q.dataset.quickMode; appState.search=''; appState.screen='quick-products'; render(); return; } const cn=e.target.closest('[data-action="contact-new"]'); if(cn){ e.preventDefault(); appState.contactSent=false; render(); } }, true);
  const prevContact33=contactView;
  contactView=function(){ if(appState.contactSent){ return `<section class="flow-card enter contact-success"><h2>${t('contactSentTitle')}</h2><p>${t('contactSentBody')}</p><button class="btn primary block" data-action="contact-new">${t('sendAnother')}</button></section>`; } return prevContact33(); };
  document.addEventListener('submit', e=>{ const f=e.target.closest('form[data-form="contact"]'); if(!f) return; setTimeout(()=>{ appState.contactSent=true; render(); }, 350); }, true);
})();

document.addEventListener('click', e=>{ const el=e.target.closest('[data-action="test-connection"]'); if(el){ e.preventDefault(); testConnection(); } }, true);

/* v45 patch: production mobile UX, local notifications, camera inputs, single cart and full order success */
(function(){
  const esc45 = typeof esc === 'function' ? esc : (v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])));
  const previousT45 = t;
  const v45Text = {
    he:{orderSentTitle:'ההזמנה נשלחה בהצלחה',orderSentBody:'ההזמנה התקבלה במערכת ותטופל לפי מועד האספקה שבחרת.',orderNumber:'מספר הזמנה',deliveryDate:'מועד אספקה',backHome:'חזרה לראשי',viewOrderHistory:'צפייה בהיסטוריית הזמנות',dailyReminderTitle:'תזכורת הזמנה',dailyReminderBody:'היום יום הזמנה. כדאי להיכנס ולשדר הזמנה בזמן.',attachments:'קבצים מצורפים',chooseFromCameraOrGallery:'אפשר לצלם או לבחור מהגלריה',sendSuccess:'הפנייה נשלחה בהצלחה',camera:'מצלמה',cart:'סל',notifications:'התראות',orderType:'סוג הזמנה'},
    en:{orderSentTitle:'Order sent successfully',orderSentBody:'The order was received and will be handled for the selected delivery date.',orderNumber:'Order number',deliveryDate:'Delivery date',backHome:'Back home',viewOrderHistory:'View order history',dailyReminderTitle:'Order reminder',dailyReminderBody:'Today is an order day. Open the app and submit your order on time.',attachments:'Attachments',chooseFromCameraOrGallery:'Take a photo or choose from gallery',sendSuccess:'Message sent successfully',camera:'Camera',cart:'Cart',notifications:'Notifications',orderType:'Order type'},
    ar:{orderSentTitle:'تم إرسال الطلب بنجاح',orderSentBody:'تم استلام الطلب وسيتم التعامل معه حسب تاريخ التوريد المحدد.',orderNumber:'رقم الطلب',deliveryDate:'تاريخ التوريد',backHome:'العودة للرئيسية',viewOrderHistory:'عرض سجل الطلبات',dailyReminderTitle:'تذكير طلب',dailyReminderBody:'اليوم يوم طلب. ادخل للتطبيق وأرسل الطلب في الوقت.',attachments:'مرفقات',chooseFromCameraOrGallery:'يمكن التصوير أو الاختيار من المعرض',sendSuccess:'تم إرسال الطلب بنجاح',camera:'كاميرا',cart:'السلة',notifications:'الإشعارات',orderType:'نوع الطلب'},
    ru:{orderSentTitle:'Заказ успешно отправлен',orderSentBody:'Заказ получен и будет обработан к выбранной дате поставки.',orderNumber:'Номер заказа',deliveryDate:'Дата поставки',backHome:'На главную',viewOrderHistory:'История заказов',dailyReminderTitle:'Напоминание о заказе',dailyReminderBody:'Сегодня день заказа. Откройте приложение и отправьте заказ вовремя.',attachments:'Вложения',chooseFromCameraOrGallery:'Сфотографируйте или выберите из галереи',sendSuccess:'Сообщение отправлено',camera:'Камера',cart:'Корзина',notifications:'Уведомления',orderType:'Тип заказа'}
  };
  t = function(k){ return v45Text[appState.lang]?.[k] || previousT45(k); };

  function currentNetworkBranchLine(){
    const n=appState.data?.network||{}, b=appState.data?.branch||{};
    return [tr(n.name||''), [b.address,b.city].filter(Boolean).join(' ') || tr(b.name||'')].filter(Boolean).join(' - ');
  }
  function greeting45(){ const h=new Date().getHours(); return h<12?t('goodMorning'):h<17?t('goodAfternoon'):t('goodEvening'); }
  function currentManager(){ const b=appState.data?.branch||{}; return b.managerName || b.name || ''; }
  function unreadCount45(){ return (appState.data?.notifications||[]).filter(n=>n.status!=='read').length; }
  function activeBanners45(){
    const custom=(appState.data?.appBanners||[]).filter(x=>x.active!==false);
    const fallback=[{icon:'🏷️',title:t('deals'),text:t('newOrder')},{icon:'✨',title:t('newProducts'),text:t('catalog')},{icon:'✅',title:t('recommendedProducts'),text:t('useRecommended')||t('recommendedProducts')},{icon:'↩️',title:t('returns'),text:t('createReturn')},{icon:'💬',title:t('contact'),text:t('contact')}];
    return (custom.length?custom:fallback).slice(0,5);
  }
  function home45(){ const banners=activeBanners45(); return `<section class="home-screen v45-home enter"><div class="banner-carousel v45-banners">${banners.map((x,i)=>{
  const url = x.videoUrl || x.imageUrl || '';
  const isVid = url.endsWith('.mp4') || url.endsWith('.webm') || url.startsWith('data:video/');
  const clickAttr = x.linkUrl ? `data-banner-url="${esc45(x.linkUrl)}"` : (x.targetCategory ? `data-home-cat="${esc45(x.targetCategory)}"` : '');
  return `<article class="home-banner ${i===0?'active':''}" ${clickAttr} style="--i:${i};${clickAttr ? 'cursor:pointer' : ''}">
    ${isVid ? `<video src="${esc45(url)}" autoplay loop muted playsinline></video>` : (url ? `<img src="${esc45(url)}" alt="">` : '')}
    <span>${esc45(x.icon||'📣')}</span>
    <div><b>${esc45(tr(x.title||''))}</b><p>${esc45(tr(x.text||''))}</p></div>
  </article>`;
}).join('')}</div><div class="home-actions v45-actions">${(cartTotals().cartons > 0) ? `<button class="action-card primary" data-screen="catalog"><span>${icon('cart')}</span><b>${t('continueOrder')} (${cartTotals().cartons} ${t('cartons')})</b></button>` : `<button class="action-card primary" data-action="start-new-order"><span>${icon('cart')}</span><b>${t('newOrder')}</b></button>`}${hasFeatureApp('promotions')?`<button class="action-card" data-screen="promotions"><span>${icon('tag')}</span><b>${t('deals')}</b></button>`:''}<button class="action-card" data-quick-mode="new"><span>${icon('sparkle')}</span><b>${t('newProducts')}</b></button><button class="action-card" data-quick-mode="recommended"><span>${icon('check-circle')}</span><b>${t('recommendedProducts')}</b></button></div></section>`; }
  const prevScreen45=screenView;
  screenView=function(){ if(appState.screen==='home') return home45(); if(appState.screen==='order-success') return orderSuccessView45(); return prevScreen45(); };

  function orderSuccessView45(){ const o=appState.lastOrderSuccess || {}; return `<section class="order-success-page enter"><div class="success-icon">${icon('check')}</div><h2>${t('orderSentTitle')}</h2><p>${t('orderSentBody')}</p><div class="success-details"><div><span>${t('orderNumber')}</span><b>${esc45(o.orderNumber||'')}</b></div><div><span>${t('orderType')}</span><b>${esc45(tr(o.deliveryTypeTitle||''))}</b></div><div><span>${t('deliveryDate')}</span><b>${esc45(typeof formatAppDate==='function'?formatAppDate(o.deliveryDate):String(o.deliveryDate||''))}</b></div><div><span>${t('cartons')}</span><b>${Number(o.totals?.cartons||0)}</b></div></div><div class="success-actions"><button class="btn primary" data-screen="orders">${t('viewOrderHistory')}</button><button class="btn ghost" data-screen="home">${t('backHome')}</button></div></section>`; }

  const prevRender45=render;
  render=function(){
    applyPreferences();
    if(!appState.token||!appState.data){ root.innerHTML=loginView().replace(/<button class="text-btn" data-action="test-connection">[\s\S]*?<\/button>/,''); return; }
    const totals=cartTotals(); const unread=unreadCount45();
    root.innerHTML=`<div class="app-shell v45-shell" dir="${dir()}"><header class="app-topbar v45-topbar"><div class="v49-brand"><img src="/icon.svg" alt="OrderPilot"/><div class="v45-title"><span class="eyebrow">OrderPilot</span><b>${esc45(currentNetworkBranchLine())}</b><small>${esc45(greeting45())}, ${esc45(currentManager())}</small></div></div><div class="topbar-actions"><button class="round-btn notify-btn" aria-label="${t('notifications')}" data-action="open-notifications">${icon('bell')}${unread?`<em>${Math.min(99,unread)}</em>`:''}</button><button class="round-btn settings-btn" aria-label="${t('settings')}" data-action="open-settings-modal"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button></div></header><main class="app-main">${screenView()}</main>${totals.lines?`<button class="floating-cart v45-cart" data-action="open-cart" aria-label="${t('cart')}">${icon('cart')}<b>${totals.cartons}</b></button>`:''}<nav class="bottom-nav v45-bottom-nav"><button class="${appState.screen==='home'?'active':''}" data-screen="home"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg><span>${t('home')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg><span>${t('orderHistory')||t('orders')}</span></button>${hasFeatureApp('returns')?`<button class="${appState.screen==='returns'?'active':''}" data-screen="returns"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg><span>${t('returns')}</span></button>`:''}<button class="${appState.screen==='contact'?'active':''}" data-screen="contact"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg><span>${t('contact')}</span></button></nav></div>`;
  };

  // Remove the temporary connection test button from login even if older patches re-add it.
  const prevLogin45=loginView;
  loginView=function(){ return prevLogin45().replace(/<button class="text-btn" data-action="test-connection">[\s\S]*?<\/button>/,''); };

  // One stable submit flow: show full success page instead of only toast + history redirect.
  submitOrder=async function(){
    try{
      const items=cartItems().map(x=>({productId:x.product.id,quantity:x.quantity}));
      const data=await api('/api/app/orders',{method:'POST',body:JSON.stringify({deliveryTypeId:appState.selectedTypeId,deliveryDate:appState.selectedDate,items})});
      appState.lastOrderSuccess=data.order;
      appState.cart={};
      closeModal();
      await bootstrap();
      appState.lastOrderSuccess=data.order;
      appState.screen='order-success';
      render();
      localNotify45(t('orderSentTitle'), `${t('orderNumber')}: ${data.order.orderNumber || ''}`);
    }catch(e){ toast(e.message,'error'); }
  };

  // Cleaner contact form with attachments and stable success state.
  contactView=function(){
    if(appState.contactSent){ return `<section class="flow-card enter contact-success"><h2>${t('sendSuccess')}</h2><p>${t('contactSentBody')}</p><button class="btn primary block" data-action="contact-new">${t('sendAnother')||t('send')}</button></section>`; }
    return `<section class="flow-card enter"><h2>${t('contact')}</h2><form data-form="contact" class="stack contact-form"><input name="subject" placeholder="${t('subject')}" required/><textarea name="message" placeholder="${t('message')}" required></textarea><input name="phone" placeholder="${t('phone')}" value="${esc45(appState.data.branch.phone||'')}"/><input name="email" placeholder="${t('email')}" value="${esc45(appState.data.branch.email||'')}"/><label class="file-choice">${t('attachments')}<small>${t('chooseFromCameraOrGallery')}</small><input type="file" name="attachments" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" capture="environment" multiple></label><button class="btn primary">${t('send')}</button></form></section>`;
  };

  async function fileListToDataUrls(input){ const out=[]; for(const f of input?.files||[]) out.push(await fileToDataUrl(f)); return out; }
  const originalHandleSubmit45 = handleSubmit;
  handleSubmit = async function(e){
    const form=e.target.closest('form[data-form]');
    if(!form) return;
    if(form.dataset.form==='contact'){
      e.preventDefault();
      try{
        const payload=formObject(form);
        payload.attachments=await fileListToDataUrls(form.querySelector('[name="attachments"]'));
        await api('/api/app/contact',{method:'POST',body:JSON.stringify(payload)});
        appState.contactSent=true;
        render();
        localNotify45(t('sendSuccess'), t('contactSentBody'));
      }catch(err){ toast(err.message,'error'); }
      return;
    }
    return originalHandleSubmit45(e);
  };

  // Camera/gallery capture for returns.
  const oldReturnForm45 = typeof returnForm === 'function' ? returnForm : null;
  if(oldReturnForm45){
    returnForm=function(productId=''){
      let html=oldReturnForm45(productId);
      html=html.replace('name="certificateImageUrl" accept="image/*"','name="certificateImageUrl" accept="image/*" capture="environment"');
      html=html.replace('name="returnImages" accept="image/*" multiple','name="returnImages" accept="image/*" capture="environment" multiple');
      return html.replace(`${t('returnImages')}<input`, `${t('returnImages')} <b class="required">*</b><small>${t('chooseFromCameraOrGallery')}</small><input`);
    };
  }

  // Barcode scanner: prefer native bridge; fallback to WebView camera with explicit permission request.
  scanBarcode=async function(){
    try{
      const native=await window.OrderPilotMobile?.scanBarcode?.();
      if(native){ findBarcode(native); return; }
    }catch(_){ }
    showModal(`<h2>${t('scan')}</h2><div class="scanner-box stable-scanner"><video autoplay playsinline muted></video><div class="scan-frame"><span></span></div></div><p>${t('scanHint')}</p><div class="modal-actions"><button class="btn ghost" data-action="manual-barcode">${t('manualBarcode')}</button><button class="btn ghost" data-modal-close>${t('close')}</button></div>`, 'scanner-modal');
    const video=document.querySelector('.scanner-box video');
    try{
      if(!navigator.mediaDevices?.getUserMedia) throw new Error('camera_api_unavailable');
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}, audio:false});
      video.srcObject=stream;
      const detector=('BarcodeDetector' in window) ? new BarcodeDetector({formats:['ean_13','ean_8','code_128','upc_a','upc_e','qr_code']}) : null;
      const loop=async()=>{
        if(!video.isConnected){ stream.getTracks().forEach(t=>t.stop()); return; }
        try{ if(detector){ const codes=await detector.detect(video); if(codes[0]){ stream.getTracks().forEach(t=>t.stop()); closeModal(); findBarcode(codes[0].rawValue); return; } } }catch(_){ }
        setTimeout(()=>requestAnimationFrame(loop),250);
      };
      loop();
    }catch(e){ toast(e.message || t('camera')); }
  };

  async function localNotify45(title, body){
    try{
      const Local=window.Capacitor?.Plugins?.LocalNotifications;
      if(Local?.schedule){
        const perm=await Local.requestPermissions?.();
        if(!perm || perm.display==='granted' || perm.display===true){
          await Local.schedule({notifications:[{id:Date.now()%2147483647,title:String(title||'OrderPilot'),body:String(body||''),schedule:{at:new Date(Date.now()+600)},smallIcon:'ic_stat_icon_config_sample'}]});
          return;
        }
      }
      if('Notification' in window){ if(Notification.permission==='default') await Notification.requestPermission(); if(Notification.permission==='granted') new Notification(String(title||'OrderPilot'),{body:String(body||'')}); }
    }catch(_){ }
  }
  window.OrderPilotLocalNotify=localNotify45;
  async function scheduleDailyOrderReminders45(){
    try{
      const Local=window.Capacitor?.Plugins?.LocalNotifications;
      if(!Local?.schedule || !appState.data?.deliveryTypes) return;
      await Local.requestPermissions?.();
      const dates=[];
      for(const type of appState.data.deliveryTypes||[]){
        const list=appState.data.allowedDates?.[type.id] || [];
        for(const d of list.slice(0,6)) dates.push({type,date:d.date||d});
      }
      const notifications=dates.slice(0,20).map((x,i)=>{ const at=new Date(`${String(x.date).slice(0,10)}T09:00:00`); if(at.getTime()<Date.now()) at.setTime(Date.now()+3600000+i*60000); return {id:45000+i,title:t('dailyReminderTitle'),body:`${t('dailyReminderBody')} ${tr(x.type?.title||'')}`.trim(),schedule:{at},smallIcon:'ic_stat_icon_config_sample'}; });
      if(notifications.length) await Local.schedule({notifications});
    }catch(_){ }
  }
  const oldBootstrap45=bootstrap;
  bootstrap=async function(){ await oldBootstrap45(); try{ await window.OrderPilotMobile?.registerPushNotifications?.(); }catch(_){ } await scheduleDailyOrderReminders45(); showUnreadNotifications45(); };
  let shownNoteIds45; try{ shownNoteIds45=new Set(JSON.parse(localStorage.getItem('op_shown_notes_v45')||'[]')); }catch(_){ shownNoteIds45=new Set(); }
  function saveShown45(){ localStorage.setItem('op_shown_notes_v45', JSON.stringify([...shownNoteIds45].slice(-100))); }
  function showUnreadNotifications45(){
    const notes=(appState.data?.notifications||[]).filter(n=>n.status!=='read' && !shownNoteIds45.has(n.id)).slice(0,3);
    notes.forEach((n,idx)=>setTimeout(()=>{ shownNoteIds45.add(n.id); saveShown45(); localNotify45(tr(n.title||t('notifications')), tr(n.message||'')); }, idx*800));
  }

  document.addEventListener('click', e=>{
    const action=e.target.closest('[data-action]')?.dataset.action;
    if(action==='contact-new'){ e.preventDefault(); appState.contactSent=false; render(); return; }
  }, true);

  // Block legacy connection-test action; it is intentionally removed after v44 diagnostics.
  document.addEventListener('click', e=>{ if(e.target.closest('[data-action="test-connection"]')){ e.preventDefault(); e.stopPropagation(); } }, true);
})();

/* v47 patch: security/bug-audit fixes — server-side session logout, order double-submit guard, i18n gaps */
(function(){
  const extra47 = {
    he:{ continueOrder:'המשך הזמנה', duplicateOrderTitle:'כבר קיימת הזמנה', duplicateOrderBody:'לתאריך הזה כבר קיימת הזמנה', goToOrders:'מעבר להזמנות' },
    en:{ continueOrder:'Continue order', duplicateOrderTitle:'Order already exists', duplicateOrderBody:'An order already exists for this date:', goToOrders:'Go to orders' },
    ar:{ continueOrder:'متابعة الطلب', duplicateOrderTitle:'يوجد طلب بالفعل', duplicateOrderBody:'يوجد بالفعل طلب لهذا التاريخ:', goToOrders:'الانتقال للطلبات' },
    ru:{ continueOrder:'Продолжить заказ', duplicateOrderTitle:'Заказ уже существует', duplicateOrderBody:'На эту дату уже есть заказ:', goToOrders:'К заказам' }
  };
  const prevT47 = t;
  t = function(k){ return extra47[appState.lang]?.[k] || prevT47(k); };

  // Best-effort server-side session revocation on logout (capture phase so it runs before the
  // base handleClick clears appState.token). Local logout still proceeds even if this fails.
  document.addEventListener('click', e=>{
    const logoutBtn = e.target.closest('[data-action="logout"]');
    if(logoutBtn && appState.token){
      const tok = appState.token;
      fetch((API_BASE||'') + '/api/auth/logout', { method:'POST', headers:{ 'Authorization':'Bearer ' + tok, 'Content-Type':'application/json' }, body:'{}' }).catch(()=>{});
    }
  }, true);

  const prevSubmitOrder47 = submitOrder;
  let submitOrderInFlight47 = false;
  submitOrder = async function(){
    if(submitOrderInFlight47) return;
    submitOrderInFlight47 = true;
    try{ await prevSubmitOrder47(); }
    finally{ submitOrderInFlight47 = false; }
  };
})();

/* v48 patch: OCR-assisted return capture — photograph the certificate, on-device OCR detects
   products/quantities automatically, staff only verifies/adjusts (existing admin review flow
   already supports editing approved units per line — see returnReviewForm in admin.js). Runs
   fully on-device via a locally-vendored Tesseract.js (public/vendor/tesseract) — no network call,
   works offline in the Capacitor app. Falls back to manual product search if OCR is unavailable
   or finds nothing usable. */
(function(){
  const esc48 = typeof esc === 'function' ? esc : (v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])));
  const extra48 = {
    he:{ ocrHint:'צילום התעודה יזהה אוטומטית מוצרים וכמויות — אפשר לתקן ידנית אחרי הזיהוי', ocrRunning:'🔎 מזהה מוצרים מהתעודה...', ocrFoundItems:'✅ זוהו מוצרים אוטומטית', ocrNoMatches:'לא זוהו מוצרים אוטומטית — ניתן להוסיף ידנית למטה', ocrFailed:'זיהוי אוטומטי לא זמין כרגע — ניתן להוסיף מוצרים ידנית למטה', addProductManually:'🔍 הוספת מוצר ידנית (חיפוש לפי שם או ברקוד)', noItemsDetected:'צריך לבחור לפחות מוצר אחד להחזרה' },
    en:{ ocrHint:'Photographing the certificate auto-detects products and quantities — you can adjust after detection', ocrRunning:'🔎 Detecting products from the document...', ocrFoundItems:'✅ Products detected automatically', ocrNoMatches:'No products detected automatically — add them manually below', ocrFailed:'Automatic detection unavailable right now — add products manually below', addProductManually:'🔍 Add product manually (search by name or barcode)', noItemsDetected:'Choose at least one product to return' },
    ar:{ ocrHint:'تصوير التعويذة يكتشف المنتجات والكميات تلقائيًا — يمكن التعديل بعد الاكتشاف', ocrRunning:'🔎 جارٍ اكتشاف المنتجات من المستند...', ocrFoundItems:'✅ تم اكتشاف منتجات تلقائيًا', ocrNoMatches:'لم يتم اكتشاف منتجات تلقائيًا — أضف يدويًا أدناه', ocrFailed:'الاكتشاف التلقائي غير متاح الآن — أضف المنتجات يدويًا أدناه', addProductManually:'🔍 إضافة منتج يدويًا (بحث بالاسم أو الباركود)', noItemsDetected:'اختر منتجًا واحدًا على الأقل للإرجاع' },
    ru:{ ocrHint:'Фото документа автоматически определит товары и количества — можно скорректировать после распознавания', ocrRunning:'🔎 Распознаём товары из документа...', ocrFoundItems:'✅ Товары определены автоматически', ocrNoMatches:'Товары не распознаны автоматически — добавьте вручную ниже', ocrFailed:'Автораспознавание сейчас недоступно — добавьте товары вручную ниже', addProductManually:'🔍 Добавить товар вручную (поиск по названию или штрихкоду)', noItemsDetected:'Выберите хотя бы один товар для возврата' }
  };
  const prevT48 = t;
  t = function(k){ return extra48[appState.lang]?.[k] || prevT48(k); };

  // ---- On-device OCR engine (lazy-loaded from local vendor bundle, zero network calls) ----
  let tesseractScriptPromise = null;
  function loadTesseractScript(){
    if(window.Tesseract) return Promise.resolve();
    if(tesseractScriptPromise) return tesseractScriptPromise;
    tesseractScriptPromise = new Promise((resolve, reject)=>{
      const s = document.createElement('script');
      s.src = '/vendor/tesseract/tesseract.min.js';
      s.onload = ()=>resolve();
      s.onerror = ()=>reject(new Error('ocr_script_failed'));
      document.head.appendChild(s);
    });
    return tesseractScriptPromise;
  }
  let ocrWorkerPromise = null;
  async function getOcrWorker(){
    await loadTesseractScript();
    if(!ocrWorkerPromise){
      ocrWorkerPromise = window.Tesseract.createWorker(['heb','eng'], 1, {
        workerPath: '/vendor/tesseract/worker.min.js',
        corePath: '/vendor/tesseract/tesseract-core.wasm.js',
        langPath: '/vendor/tesseract/lang-data',
        gzip: true
      }).catch(err=>{ ocrWorkerPromise = null; throw err; });
    }
    return ocrWorkerPromise;
  }
  async function runOcr(file){
    const worker = await getOcrWorker();
    const { data } = await worker.recognize(file);
    return (data && data.text) || '';
  }

  // ---- Best-effort fuzzy match of OCR text lines against the product catalog ----
  function normOcr(s){ return String(s||'').toLowerCase().replace(/[^֐-׿a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim(); }
  function tokensOf(s){ return normOcr(s).split(' ').filter(w=>w.length>1); }
  function lineScore(lineTokens, productTokens){ if(!productTokens.length) return 0; const set=new Set(lineTokens); let hits=0; productTokens.forEach(w=>{ if(set.has(w)) hits++; }); return hits/productTokens.length; }
  function qtyFromLine(line){ const m=String(line||'').match(/\d+/g); if(!m || !m.length) return 1; const n=Number(m[m.length-1]); return Number.isFinite(n) && n>0 && n<100000 ? n : 1; }
  function matchOcrToProducts(text, products){
    const lines = String(text||'').split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>1);
    const found = new Map();
    for(const line of lines){
      const digits = line.replace(/\D/g,'');
      if(digits.length>=8 && digits.length<=14){
        const byCode = products.find(p=>p.barcode && String(p.barcode)===digits);
        if(byCode){ found.set(byCode.id, { productId:byCode.id, qty:qtyFromLine(line), confidence:1 }); continue; }
      }
      const lt = tokensOf(line);
      if(!lt.length) continue;
      let best=null;
      for(const p of products){
        const score = lineScore(lt, tokensOf(p.name));
        if(score>=0.5 && (!best || score>best.score)) best={product:p, score};
      }
      if(best){
        const existing = found.get(best.product.id);
        if(!existing || existing.confidence<best.score) found.set(best.product.id, { productId:best.product.id, qty:qtyFromLine(line), confidence:best.score });
      }
    }
    return [...found.values()].sort((a,b)=>b.confidence-a.confidence).slice(0,25);
  }

  // ---- Return form: certificate photo (OCR-assisted) + goods photos + editable detected items ----
  function returnRowHtml48(p, qty){
    return `<label class="return-product-row detected-row" data-return-row="${esc48(p.id)}"><span>${esc48(tr(p.name))}<small>${esc48(p.barcode||'')} · ${Number(p.unitsPerCarton||1)} ${t('unitsPerCarton')}</small></span><input type="number" min="0" name="units__${esc48(p.id)}" value="${Number(qty||1)}"/><button type="button" class="row-remove" data-remove-return-row="${esc48(p.id)}" aria-label="remove">${icon('x')}</button></label>`;
  }
  function returnForm48(productId=''){
    const preset = productId ? (appState.data?.products||[]).find(x=>x.id===productId) : null;
    const initialRows = preset ? returnRowHtml48(preset, 1) : '';
    return `<h2>${icon('clipboard')} ${t('createReturn')}</h2><form data-form="return-request" class="stack return-form">
      <label class="ocr-cert-label">${t('returnCertificate')} <b class="required">*</b><small>${t('ocrHint')}</small><input type="file" name="certificateImageUrl" accept="image/*" capture="environment" data-ocr-input required></label>
      <div class="ocr-status" data-ocr-status hidden></div>
      <div class="return-products" data-return-detected>${initialRows}</div>
      <div class="return-add-manual"><input type="search" data-return-add-search placeholder="${t('addProductManually')}"><div class="return-add-results" data-return-add-results hidden></div></div>
      <label class="photo-upload-label">${t('returnImages')} <b class="required">*</b><small>${t('chooseFromCameraOrGallery')}</small><input type="file" name="returnImages" accept="image/*" capture="environment" multiple required></label>
      <textarea name="note" placeholder="${t('returnReason')}"></textarea>
      <div class="modal-actions"><button class="btn primary">${t('send')}</button><button class="btn ghost" type="button" data-modal-close>${t('close')}</button></div>
    </form>`;
  }
  // v26/v30/v45's `returnForm` is private to their own closures (a pre-existing scope bug — their
  // enhancements never actually applied either), so we can't override that binding from here.
  // Instead we listen for the same trigger clicks and show our version after theirs; showModal()
  // always replaces whatever modal is currently open, so ours ends up the one the user sees.
  document.addEventListener('click', e=>{
    const nr=e.target.closest('[data-action="new-return"]');
    if(nr){ e.preventDefault(); showModal(returnForm48()); return; }
    const rp=e.target.closest('[data-action="return-one-product"]');
    if(rp){ e.preventDefault(); e.stopPropagation(); showModal(returnForm48(rp.dataset.productId)); return; }
  }, true);

  async function handleCertFile48(input){
    const file = input.files && input.files[0];
    if(!file) return;
    const form = input.closest('form');
    const statusEl = form?.querySelector('[data-ocr-status]');
    if(statusEl){ statusEl.hidden=false; statusEl.textContent=t('ocrRunning'); }
    try{
      const text = await runOcr(file);
      const products = appState.data?.products || [];
      const matches = matchOcrToProducts(text, products);
      const container = form?.querySelector('[data-return-detected]');
      let added=0;
      if(container){
        matches.forEach(m=>{
          if(container.querySelector(`[data-return-row="${m.productId}"]`)) return;
          const p = products.find(x=>x.id===m.productId);
          if(p){ container.insertAdjacentHTML('beforeend', returnRowHtml48(p, m.qty)); added++; }
        });
      }
      if(statusEl) statusEl.textContent = added ? `${t('ocrFoundItems')} (${added})` : t('ocrNoMatches');
    }catch(_){
      if(statusEl) statusEl.textContent = t('ocrFailed');
    }
  }

  document.addEventListener('change', e=>{ if(e.target.matches('[data-ocr-input]')) handleCertFile48(e.target); }, true);

  document.addEventListener('click', e=>{
    const rm = e.target.closest('[data-remove-return-row]');
    if(rm){ e.preventDefault(); rm.closest('[data-return-row]')?.remove(); return; }
    const addBtn = e.target.closest('[data-add-return-product]');
    if(addBtn){
      e.preventDefault();
      const form = addBtn.closest('form');
      const container = form?.querySelector('[data-return-detected]');
      const p = (appState.data?.products||[]).find(x=>x.id===addBtn.dataset.addReturnProduct);
      if(container && p && !container.querySelector(`[data-return-row="${p.id}"]`)) container.insertAdjacentHTML('beforeend', returnRowHtml48(p, 1));
      const searchInput = form?.querySelector('[data-return-add-search]');
      const resultsEl = form?.querySelector('[data-return-add-results]');
      if(searchInput) searchInput.value='';
      if(resultsEl){ resultsEl.hidden=true; resultsEl.innerHTML=''; }
      return;
    }
  }, true);

  document.addEventListener('input', e=>{
    if(e.target.matches('[data-return-add-search]')){
      const q = e.target.value.trim().toLowerCase();
      const resultsEl = e.target.closest('.return-add-manual')?.querySelector('[data-return-add-results]');
      if(!resultsEl) return;
      if(!q){ resultsEl.hidden=true; resultsEl.innerHTML=''; return; }
      const products = (appState.data?.products||[]).filter(p=>p.active!==false && (tr(p.name)+' '+p.name+' '+(p.barcode||'')).toLowerCase().includes(q)).slice(0,8);
      resultsEl.hidden = !products.length;
      resultsEl.innerHTML = products.map(p=>`<button type="button" class="return-add-option" data-add-return-product="${esc48(p.id)}">${esc48(tr(p.name))} <small>${esc48(p.barcode||'')}</small></button>`).join('');
    }
  }, true);
})();

/* v45.1 patch: capture contact submit before legacy handlers so attachments/success page are reliable */
(function(){
  async function fileUrls45(input){ const out=[]; for(const f of input?.files||[]) out.push(await fileToDataUrl(f)); return out; }
  document.addEventListener('submit', async e=>{
    const form=e.target.closest('form[data-form="contact"]');
    if(!form) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    try{
      const payload=formObject(form);
      payload.attachments=await fileUrls45(form.querySelector('[name="attachments"]'));
      await api('/api/app/contact',{method:'POST',body:JSON.stringify(payload)});
      appState.contactSent=true;
      render();
      window.OrderPilotLocalNotify?.(t('sendSuccess')||'OrderPilot', t('contactSentBody')||'');
    }catch(err){ toast(err.message,'error'); }
  }, true);
})();


/* Master v200 Real-Time & Modal Extension */
(function(){
  // Live update cart modal when open
  function updateCartModalIfOpen(){
    const modalBackdrop = document.querySelector('.modal-backdrop.app-modal');
    if (modalBackdrop && typeof cartModal === 'function') {
      const card = modalBackdrop.querySelector('.modal-card');
      if (card && card.querySelector('.cart-lines, .summary-box, .cart-modal')) {
        card.innerHTML = cartModal();
      }
    }
  }

  // Override setQty to update cart modal in real-time
  const originalSetQty = setQty;
  setQty = function(id, q){
    originalSetQty(id, q);
    updateCartModalIfOpen();
  };

  // Clear Cart Helper
  window.clearCart = function(){
    appState.cart = {};
    render();
    updateCartModalIfOpen();
    toast('סל הקניות רוקן');
  };

  // Mark All Notifications Read
  async function markAllNotificationsRead(){
    try {
      await api('/api/app/notifications/read', { method: 'POST', body: '{}' });
      if (appState.data?.notifications) {
        appState.data.notifications.forEach(n => n.status = 'read');
      }
      render();
      toast('כל ההתראות סומנו כנקראו');
    } catch(e) {
      toast(e.message,'error');
    }
  }

  // Unified Event Listener for Banner External Links, Clear Cart, Settings Modal
  document.addEventListener('click', function(e){
    const bannerLink = e.target.closest('[data-banner-url]')?.dataset.bannerUrl;
    if (bannerLink) {
      e.preventDefault();
      e.stopPropagation();
      window.open(bannerLink, '_blank', 'noopener,noreferrer');
      return;
    }

    const markReadBtn = e.target.closest('[data-action="mark-all-read"]');
    if (markReadBtn) {
      e.preventDefault();
      e.stopPropagation();
      markAllNotificationsRead();
      return;
    }

    const clearCartBtn = e.target.closest('[data-action="clear-cart"]');
    if (clearCartBtn) {
      e.preventDefault();
      e.stopPropagation();
      clearCart();
      return;
    }

    const settingsBtn = e.target.closest('[data-action="open-settings-modal"]');
    if (settingsBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof settingsView === 'function') {
        showModal(settingsView(), 'settings-popover-modal');
      } else {
        appState.screen = 'settings';
        render();
      }
      return;
    }
  }, true);
})();

/* v46 patch: favorites (heart/star), cart reset, banner in-app navigation, notifications actions */
(function(){
  const esc46 = typeof esc === 'function' ? esc : (v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])));

  const extra46 = {
    he:{ myFavorites:'המועדפים שלי', addFavorite:'הוסף למועדפים', removeFavorite:'הסר ממועדפים', favoritesHint:'מוצרים שסימנת בלב', noFavoritesYet:'עדיין לא סימנת מוצרים מועדפים', resetCart:'איפוס סל', confirmResetCart:'לרוקן את הסל?', cartReset:'הסל רוקן', markAllRead:'סמן הכל כנקרא', allMarkedRead:'כל ההתראות סומנו כנקראו', noNotificationsShort:'אין התראות' },
    en:{ myFavorites:'My favorites', addFavorite:'Add to favorites', removeFavorite:'Remove from favorites', favoritesHint:'Products you marked with a heart', noFavoritesYet:'No favorite products yet', resetCart:'Reset cart', confirmResetCart:'Empty the cart?', cartReset:'Cart cleared', markAllRead:'Mark all as read', allMarkedRead:'All notifications marked as read', noNotificationsShort:'No notifications' },
    ar:{ myFavorites:'مفضلتي', addFavorite:'إضافة للمفضلة', removeFavorite:'إزالة من المفضلة', favoritesHint:'المنتجات التي وضعت عليها علامة قلب', noFavoritesYet:'لم تحدد منتجات مفضلة بعد', resetCart:'إفراغ السلة', confirmResetCart:'إفراغ السلة؟', cartReset:'تم إفراغ السلة', markAllRead:'تحديد الكل كمقروء', allMarkedRead:'تم تحديد كل الإشعارات كمقروءة', noNotificationsShort:'لا توجد إشعارات' },
    ru:{ myFavorites:'Мои избранные', addFavorite:'В избранное', removeFavorite:'Убрать из избранного', favoritesHint:'Товары, отмеченные сердечком', noFavoritesYet:'Пока нет избранных товаров', resetCart:'Очистить корзину', confirmResetCart:'Очистить корзину?', cartReset:'Корзина очищена', markAllRead:'Отметить всё как прочитанное', allMarkedRead:'Все уведомления отмечены как прочитанные', noNotificationsShort:'Нет уведомлений' }
  };
  const prevT46 = t;
  t = function(k){
    if(k==='recommendedProducts') return extra46[appState.lang]?.myFavorites || extra46.he.myFavorites;
    return extra46[appState.lang]?.[k] || prevT46(k);
  };

  // ---- Favorites storage (per branch, local to the device) ----
  function favBranchKey(){ return appState.data?.branch?.id || appState.token || 'guest'; }
  function allFavorites(){ try{ return JSON.parse(localStorage.getItem('orderpilot_favorites_v1')||'{}'); }catch(_){ return {}; } }
  function getFavoriteIds(){ return new Set(allFavorites()[favBranchKey()] || []); }
  function isFavorite(id){ return getFavoriteIds().has(id); }
  function toggleFavorite(id){
    const all = allFavorites();
    const key = favBranchKey();
    const set = new Set(all[key] || []);
    if(set.has(id)) set.delete(id); else set.add(id);
    all[key] = [...set];
    localStorage.setItem('orderpilot_favorites_v1', JSON.stringify(all));
  }

  // Heart/star toggle on every product card.
  const prevProductCard46 = productCard;
  productCard = function(p){
    const html = prevProductCard46(p);
    const active = isFavorite(p.id);
    const btn = `<button type="button" class="fav-toggle-btn ${active?'active':''}" data-fav-toggle="${esc46(p.id)}" aria-label="${active?t('removeFavorite'):t('addFavorite')}">${icon('star',{cls:active?'star-filled':'star-outline'})}</button>`;
    return html.replace('<button class="product-open"', btn + '<button class="product-open"');
  };

  // Heart/star toggle inside the product detail modal.
  const prevProductModal46 = productModal;
  productModal = function(p){
    const html = prevProductModal46(p);
    const active = isFavorite(p.id);
    const label = active ? `${icon('star')} ${t('removeFavorite')}` : `${icon('star')} ${t('addFavorite')}`;
    const btn = `<button type="button" class="fav-toggle-btn modal-fav ${active?'active':''}" data-fav-toggle="${esc46(p.id)}">${label}</button>`;
    return html.replace(/<h2>[^<]*<\/h2>/, m => m + btn);
  };

  function refreshOpenProductModal(productId){
    const card = document.querySelector('.modal-backdrop .modal-card');
    const favBtn = card && card.querySelector('.fav-toggle-btn.modal-fav');
    if(!favBtn || favBtn.dataset.favToggle !== productId) return;
    const p = (appState.data?.products||[]).find(x=>x.id===productId);
    if(p) card.innerHTML = productModal(p);
  }

  document.addEventListener('click', e=>{
    const favBtn = e.target.closest('[data-fav-toggle]');
    if(favBtn){
      e.preventDefault(); e.stopPropagation();
      toggleFavorite(favBtn.dataset.favToggle);
      refreshOpenProductModal(favBtn.dataset.favToggle);
      render();
      return;
    }
  }, true);

  // ---- "My favorites" screen instead of the old generic recommended-products list ----
  function favoriteProducts(){
    const ids = getFavoriteIds();
    return (appState.data?.products||[]).filter(p=>ids.has(p.id) && p.active!==false);
  }
  function favoritesView(){
    const q=(appState.search||'').trim().toLowerCase();
    const rows=favoriteProducts().filter(p=>!q || [tr(p.name),p.name,p.barcode,tr(p.category),p.category].join(' ').toLowerCase().includes(q));
    return `<section class="catalog-screen quick-products enter"><div class="catalog-head"><button class="text-btn" data-screen="home">${t('backHome')||t('back')}</button><div><h2>${t('myFavorites')}</h2><p>${t('favoritesHint')}</p></div></div><div class="search-row">${searchFieldHtml(appState.search)}</div><div class="product-grid">${rows.map(productCard).join('') || `<p class="empty">${t('noFavoritesYet')}</p>`}</div></section>`;
  }

  // ---- Banner in-app navigation (targetCategory renders as data-home-cat) ----
  function routeBannerTarget(target){
    closeModal();
    if(target==='promotions'){ appState.screen='promotions'; render(); return; }
    if(target==='orders'){ appState.screen='orders'; render(); return; }
    if(target==='returns'){ appState.screen='returns'; render(); return; }
    if(target==='contact'){ appState.screen='contact'; render(); return; }
    if(target==='new'){ appState.quickMode='new'; appState.search=''; appState.screen='quick-products'; render(); return; }
    if(target==='favorites'){ appState.quickMode='favorites'; appState.search=''; appState.screen='quick-products'; render(); return; }
    appState.selectedCategory=target; appState.selectedSubcategory='';
    if(!appState.selectedTypeId) appState.selectedTypeId=(appState.data?.deliveryTypes||[]).find(x=>x.active!==false)?.id||'';
    appState.screen='order';
    render();
  }

  const prevScreenView46 = screenView;
  screenView = function(){
    if(appState.screen==='quick-products' && appState.quickMode==='favorites') return favoritesView();
    let html = prevScreenView46();
    html = html.replace(/data-quick-mode="recommended"/g, 'data-quick-mode="favorites"');
    return html;
  };

  document.addEventListener('click', e=>{
    const cat=e.target.closest('[data-home-cat]');
    if(cat){ e.preventDefault(); e.stopPropagation(); routeBannerTarget(cat.dataset.homeCat); return; }
  }, true);

  // ---- Cart: explicit reset button ----
  const prevCartModal46 = cartModal;
  cartModal = function(){
    const html = prevCartModal46();
    const resetRow = `<div class="cart-reset-row"><button type="button" class="btn danger block" data-action="reset-cart">${icon('trash')} ${t('resetCart')}</button></div>`;
    if(html.includes('<div class="modal-actions">')) return html.replace('<div class="modal-actions">', `${resetRow}<div class="modal-actions">`);
    return html + resetRow;
  };
  document.addEventListener('click', e=>{
    const btn=e.target.closest('[data-action="reset-cart"]');
    if(btn){
      e.preventDefault(); e.stopPropagation();
      if(confirm(t('confirmResetCart'))){
        appState.cart={};
        closeModal();
        render();
        toast(t('cartReset'),'success');
      }
      return;
    }
  }, true);

  // ---- Notifications: mark all as read ----
  function notifTypeIcon46(type){ return ({order:'box',return:'return','return-status':'return','contact-sent':'chat','contact-reply':'chat','stock-back':'bell-plus'})[type] || 'bell'; }
  function notificationsModal46(){
    const notes=(appState.data?.notifications||[]).slice(0,30);
    const hasUnread = notes.some(n=>n.status!=='read');
    return `<h2>${t('notifications')}</h2>${notes.length && hasUnread ? `<div class="modal-actions inline-actions"><button type="button" class="btn sm ghost" data-action="notif-mark-all-read">${icon('check')} ${t('markAllRead')}</button></div>` : ''}<div class="notifications-mini">${notes.map(n=>`<article class="note-card ${n.status!=='read'?'unread':''}"><span class="note-icon">${icon(notifTypeIcon46(n.type),{size:16})}</span><div><b>${esc46(tr(n.title||''))}</b><p>${esc46(tr(n.message||''))}</p><span class="note-date">${esc46(typeof formatAppDate==='function'?formatAppDate(n.createdAt):String(n.createdAt||'').slice(0,10))}</span></div></article>`).join('') || `<p class="empty">${t('noNotificationsShort')}</p>`}</div><div class="modal-actions"><button type="button" class="btn ghost" data-modal-close>${t('close')}</button></div>`;
  }
  async function markAllRead46(){
    try{
      await api('/api/app/notifications/read',{method:'POST',body:'{}'});
      (appState.data.notifications||[]).forEach(n=>n.status='read');
      const card=document.querySelector('.modal-backdrop .modal-card');
      if(card && card.querySelector('.notifications-mini')) card.innerHTML=notificationsModal46();
      render();
      toast(t('allMarkedRead'),'success');
    }catch(e){ toast(e.message,'error'); }
  }
  document.addEventListener('click', e=>{
    const notif=e.target.closest('[data-action="open-notifications"]');
    if(notif){ e.preventDefault(); e.stopPropagation(); showModal(notificationsModal46(),'notifications-modal'); return; }
    const markAll=e.target.closest('[data-action="notif-mark-all-read"]');
    if(markAll){ e.preventDefault(); e.stopPropagation(); markAllRead46(); return; }
  }, true);
})();

/* v49 patch: offline order-taking — cache the last-known catalog so a signal-less launch can still
   browse/order, and queue the order locally (auto-sending the moment connectivity returns) instead
   of failing when POST /api/app/orders can't reach the server. Only the very first sync (login +
   catalog load) needs a live connection, matching "internet only needed at the start." */
(function(){
  const esc49 = typeof esc === 'function' ? esc : (v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])));
  const extra49 = {
    he:{ offlineUsingCache:'אין חיבור כרגע — מציג את הקטלוג האחרון שנשמר במכשיר', orderQueuedOffline:'אין חיבור — ההזמנה נשמרה במכשיר ותישלח אוטומטית ברגע שיהיה אינטרנט', pendingSyncTitle:'ההזמנה נשמרה ותישלח אוטומטית', pendingSyncBody:'אין כרגע חיבור לאינטרנט. ההזמנה נשמרה במכשיר ותישלח לבד ברגע שהחיבור יחזור — אין צורך לעשות כלום.', pendingSyncLabel:'סטטוס', pendingSyncValue:'ממתינה לחיבור', pendingBadge:'ממתינה לשליחה', pendingOrdersTitle:'הזמנות ממתינות לשליחה', orderSyncedTitle:'הזמנה ממתינה נשלחה', backOnline:'החיבור לאינטרנט חזר' },
    en:{ offlineUsingCache:'No connection right now — showing the last catalog saved on this device', orderQueuedOffline:'No connection — the order was saved on this device and will send automatically once you have internet', pendingSyncTitle:'Order saved — will send automatically', pendingSyncBody:'No internet connection right now. The order was saved on this device and will send itself the moment the connection returns — nothing else to do.', pendingSyncLabel:'Status', pendingSyncValue:'Waiting for connection', pendingBadge:'Pending send', pendingOrdersTitle:'Orders waiting to send', orderSyncedTitle:'Pending order sent', backOnline:'Back online' },
    ar:{ offlineUsingCache:'لا يوجد اتصال حاليًا — يتم عرض آخر كتالوج محفوظ على الجهاز', orderQueuedOffline:'لا يوجد اتصال — تم حفظ الطلب على الجهاز وسيُرسل تلقائيًا بمجرد توفر الإنترنت', pendingSyncTitle:'تم حفظ الطلب — سيُرسل تلقائيًا', pendingSyncBody:'لا يوجد اتصال بالإنترنت حاليًا. تم حفظ الطلب على الجهاز وسيُرسل بنفسه بمجرد عودة الاتصال.', pendingSyncLabel:'الحالة', pendingSyncValue:'بانتظار الاتصال', pendingBadge:'بانتظار الإرسال', pendingOrdersTitle:'طلبات بانتظار الإرسال', orderSyncedTitle:'تم إرسال الطلب المعلق', backOnline:'عاد الاتصال بالإنترنت' },
    ru:{ offlineUsingCache:'Сейчас нет соединения — показан последний сохранённый каталог', orderQueuedOffline:'Нет соединения — заказ сохранён на устройстве и отправится автоматически при появлении интернета', pendingSyncTitle:'Заказ сохранён — отправится автоматически', pendingSyncBody:'Сейчас нет подключения к интернету. Заказ сохранён на устройстве и отправится сам, как только соединение вернётся.', pendingSyncLabel:'Статус', pendingSyncValue:'Ожидает соединения', pendingBadge:'Ожидает отправки', pendingOrdersTitle:'Заказы, ожидающие отправки', orderSyncedTitle:'Отложенный заказ отправлен', backOnline:'Соединение восстановлено' }
  };
  const prevT49 = t;
  t = function(k){
    if(appState.screen==='order-success' && appState.lastOrderSuccess?.pending){
      if(k==='orderSentTitle') return extra49[appState.lang]?.pendingSyncTitle || extra49.he.pendingSyncTitle;
      if(k==='orderSentBody') return extra49[appState.lang]?.pendingSyncBody || extra49.he.pendingSyncBody;
      if(k==='orderNumber') return extra49[appState.lang]?.pendingSyncLabel || extra49.he.pendingSyncLabel;
    }
    return extra49[appState.lang]?.[k] || prevT49(k);
  };

  const CACHE_KEY = 'orderpilot_cached_bootstrap_v1';
  const QUEUE_KEY = 'orderpilot_pending_orders_v1';

  function saveBootstrapCache(data){ try{ localStorage.setItem(CACHE_KEY, JSON.stringify({ data, savedAt: Date.now() })); }catch(_){ } }
  function loadBootstrapCache(){ try{ const raw=localStorage.getItem(CACHE_KEY); if(!raw) return null; const parsed=JSON.parse(raw); return parsed && parsed.data ? parsed : null; }catch(_){ return null; } }
  function isNetworkError(err){
    const msg = String((err && err.message) || err || '').toLowerCase();
    return navigator.onLine === false || msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed') || msg.includes('timeout') || msg.includes('abort') || msg.includes('network request failed');
  }

  // ---- Cache the catalog on every successful sync; fall back to it when offline instead of erroring ----
  const prevBootstrap49 = bootstrap;
  bootstrap = async function(){
    try{
      await prevBootstrap49();
      saveBootstrapCache(appState.data);
    }catch(err){
      const cached = loadBootstrapCache();
      if(cached && isNetworkError(err)){
        appState.data = cached.data;
        applyPreferences();
        toast(t('offlineUsingCache'));
        return;
      }
      throw err;
    }
  };

  // ---- Local pending-order queue ----
  function loadQueue(){ try{ return JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]'); }catch(_){ return []; } }
  function saveQueue(q){ try{ localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); }catch(_){ } }
  function queueOrder(payload){
    const q = loadQueue();
    q.push({ id:'pending-'+Date.now()+'-'+Math.random().toString(36).slice(2,8), payload, createdAt:new Date().toISOString() });
    saveQueue(q);
  }
  window.OrderPilotPendingOrders = { load: loadQueue };

  let flushing49 = false;
  async function flushQueue(silent){
    if(flushing49) return;
    flushing49 = true;
    try{
      const q = loadQueue();
      if(!q.length) return;
      let sentAny = false;
      for(const entry of q.slice()){
        try{
          const data = await api('/api/app/orders', { method:'POST', body: JSON.stringify(entry.payload) });
          const idx = q.findIndex(x=>x.id===entry.id);
          if(idx>=0) q.splice(idx,1);
          saveQueue(q);
          sentAny = true;
          window.OrderPilotLocalNotify?.(t('orderSyncedTitle'), `${t('orderNumber')}: ${data.order.orderNumber||''}`);
        }catch(err){
          if(isNetworkError(err)) break; // still offline — stop, try the rest later
          // server rejected it (e.g. date no longer valid) — drop it rather than retry forever, and tell the user
          const idx = q.findIndex(x=>x.id===entry.id);
          if(idx>=0) q.splice(idx,1);
          saveQueue(q);
          toast(err.message,'error');
        }
      }
      if(sentAny && !silent){ try{ await bootstrap(); render(); }catch(_){ } }
    } finally { flushing49 = false; }
  }
  window.OrderPilotFlushQueue = flushQueue;

  if(isNativeCapacitor() && window.Capacitor?.Plugins?.Network){
    window.Capacitor.Plugins.Network.addListener('networkStatusChange', status=>{ if(status.connected) flushQueue(); });
  } else {
    window.addEventListener('online', ()=>{ toast(t('backOnline'),'success'); flushQueue(); });
  }
  setTimeout(()=>flushQueue(true), 2500);

  // ---- submitOrder: queue locally instead of failing when there is no connection ----
  let submitOrderInFlight49 = false;
  submitOrder = async function(){
    if(submitOrderInFlight49) return;
    submitOrderInFlight49 = true;
    try{
      const items = cartItems().map(x=>({ productId:x.product.id, quantity:x.quantity }));
      const payload = { deliveryTypeId: appState.selectedTypeId, deliveryDate: appState.selectedDate, items };
      const typeTitle = (appState.data?.deliveryTypes||[]).find(d=>d.id===appState.selectedTypeId)?.title || '';
      const cartons = items.reduce((s,i)=>s+Number(i.quantity||0),0);
      const goOfflineSuccess = ()=>{
        queueOrder(payload);
        appState.cart = {};
        closeModal();
        appState.lastOrderSuccess = { orderNumber:'', deliveryTypeTitle: typeTitle, deliveryDate: appState.selectedDate, totals:{ cartons }, pending:true };
        appState.screen = 'order-success';
        render();
        toast(t('orderQueuedOffline'));
      };
      if(navigator.onLine === false){ goOfflineSuccess(); return; }
      try{
        const data = await api('/api/app/orders', { method:'POST', body: JSON.stringify(payload) });
        appState.cart = {};
        closeModal();
        await bootstrap();
        appState.lastOrderSuccess = data.order;
        appState.screen = 'order-success';
        render();
        window.OrderPilotLocalNotify?.(t('orderSentTitle'), `${t('orderNumber')}: ${data.order.orderNumber || ''}`);
      }catch(err){
        if(isNetworkError(err)) goOfflineSuccess();
        else toast(err.message,'error');
      }
    } finally {
      submitOrderInFlight49 = false;
    }
  };

  // ---- Surface pending orders at the top of the order-history screen ----
  const prevScreenView49 = screenView;
  screenView = function(){
    let html = prevScreenView49();
    if(appState.screen === 'orders'){
      const q = loadQueue();
      if(q.length){
        const cards = q.map(entryOrder=>{
          const cartons = (entryOrder.payload.items||[]).reduce((s,i)=>s+Number(i.quantity||0),0);
          const typeTitle = (appState.data?.deliveryTypes||[]).find(d=>d.id===entryOrder.payload.deliveryTypeId)?.title || '';
          return `<article class="order-card pending-order-card"><div><b>${icon('cloud-off',{cls:'pending-icon'})} ${esc49(t('pendingBadge'))}</b><span>${esc49(tr(typeTitle))} · ${esc49(entryOrder.payload.deliveryDate||'')}</span><small>${cartons} ${esc49(t('cartons'))}</small></div></article>`;
        }).join('');
        const block = `<div class="pending-orders-block"><h3>${icon('cloud-off')} ${esc49(t('pendingOrdersTitle'))}</h3>${cards}</div>`;
        html = html.replace(/(<section class="list-screen enter">(?:<div class="panel-head">)?<h2>[^<]*<\/h2>(?:<\/div>)?)/, `$1${block}`);
      }
    }
    return html;
  };
})();

/* v50 patch: out-of-stock "notify me when back in stock" subscription */
(function(){
  Object.assign(ui.he,{ notifyWhenBackInStock:'התראה כשחוזר למלאי', notifyStockSubscribed:'תישלח התראה כשיחזור', stockAlertConfirmed:'תישלח לכם התראה כשהמוצר יחזור למלאי' });
  Object.assign(ui.en,{ notifyWhenBackInStock:'Notify when back in stock', notifyStockSubscribed:"We'll notify you", stockAlertConfirmed:"We'll notify you when this product is back in stock" });
  Object.assign(ui.ar,{ notifyWhenBackInStock:'تنبيه عند توفره', notifyStockSubscribed:'سيتم إعلامك', stockAlertConfirmed:'سيتم إعلامك عند عودة المنتج للمخزون' });
  Object.assign(ui.ru,{ notifyWhenBackInStock:'Уведомить при поступлении', notifyStockSubscribed:'Мы вас уведомим', stockAlertConfirmed:'Мы уведомим вас, когда товар снова появится в наличии' });

  const stockSubsKey='orderpilot_stock_subs_v1';
  function loadStockSubs(){ try{ return new Set(JSON.parse(localStorage.getItem(stockSubsKey)||'[]')); }catch(_){ return new Set(); } }
  function saveStockSubs(set){ localStorage.setItem(stockSubsKey, JSON.stringify([...set])); }
  const stockSubs = loadStockSubs();
  (appState.data?.stockAlertProductIds||[]).forEach(id=>stockSubs.add(id));

  const prevBootstrap50 = bootstrap;
  bootstrap = async function(){
    await prevBootstrap50();
    (appState.data?.stockAlertProductIds||[]).forEach(id=>stockSubs.add(id));
  };

  function isOut(p){ return !p.inStock || Number(p.stockQty||0)<=0; }
  function stockNotifyBtn(p){
    const subscribed = stockSubs.has(p.id);
    return `<button type="button" class="btn ${subscribed?'ghost':'primary'} sm block stock-notify-btn" data-notify-stock="${esc(p.id)}" ${subscribed?'disabled':''}>${icon(subscribed?'check':'bell-plus',{size:14})} ${subscribed?t('notifyStockSubscribed'):t('notifyWhenBackInStock')}</button>`;
  }

  async function subscribeStock(productId){
    if(!productId || stockSubs.has(productId)) return;
    stockSubs.add(productId); saveStockSubs(stockSubs);
    render();
    toast(t('stockAlertConfirmed'),'success');
    try{ await api('/api/app/stock-alerts',{method:'POST',body:JSON.stringify({productId})}); }catch(_){ }
  }

  const prevProductCard50 = productCard;
  productCard = function(p){
    let html = prevProductCard50(p);
    if(isOut(p)) html = html.replace(/<div class="qty-controls">[\s\S]*?<\/div><\/article>$/, stockNotifyBtn(p) + '</article>');
    return html;
  };

  const prevProductModal50 = productModal;
  productModal = function(p){
    let html = prevProductModal50(p);
    if(isOut(p)) html = html.replace(/<div class="qty-controls modal-qty">[\s\S]*?<\/div>/, stockNotifyBtn(p));
    return html;
  };

  document.addEventListener('click', e=>{
    const btn = e.target.closest('[data-notify-stock]');
    if(btn){ e.preventDefault(); subscribeStock(btn.dataset.notifyStock); }
  });
})();

/* v51 patch: swipeable banner carousel + admin-configurable auto-rotation */
(function(){
  let bannerIndex = 0;
  let bannerTimer = null;

  function bannerTrack(){ return document.querySelector('.v45-banners'); }
  function applyBannerActive(){
    const track = bannerTrack();
    if(!track) return;
    const banners = [...track.querySelectorAll('.home-banner')];
    if(!banners.length) return;
    if(bannerIndex >= banners.length) bannerIndex = 0;
    banners.forEach((el,i)=>el.classList.toggle('active', i===bannerIndex));
    const dots = [...document.querySelectorAll('.banner-dot')];
    dots.forEach((el,i)=>el.classList.toggle('active', i===bannerIndex));
  }
  function stepBanner(dir){
    const track = bannerTrack();
    if(!track) return;
    const count = track.querySelectorAll('.home-banner').length;
    if(count<2) return;
    bannerIndex = (bannerIndex + dir + count) % count;
    applyBannerActive();
  }
  function goToBanner(i){
    const track = bannerTrack();
    if(!track) return;
    const count = track.querySelectorAll('.home-banner').length;
    if(!count) return;
    bannerIndex = ((i % count) + count) % count;
    applyBannerActive();
  }
  function ensureBannerTimer(){
    if(bannerTimer){ clearInterval(bannerTimer); bannerTimer=null; }
    const track = bannerTrack();
    if(!track) return;
    const count = track.querySelectorAll('.home-banner').length;
    const rotation = appState.data?.bannerRotation || {enabled:true, seconds:5};
    if(rotation.enabled===false || count<2) return;
    const seconds = Math.min(30, Math.max(2, Number(rotation.seconds)||5));
    bannerTimer = setInterval(()=>stepBanner(1), seconds*1000);
  }

  function ensureBannerDots(){
    const track = bannerTrack();
    if(!track) return;
    const count = track.querySelectorAll('.home-banner').length;
    if(count<2) return;
    if(track.nextElementSibling?.classList?.contains('banner-dots')) return;
    const dots = document.createElement('div');
    dots.className = 'banner-dots';
    dots.innerHTML = Array.from({length:count}).map((_,i)=>`<button type="button" class="banner-dot ${i===bannerIndex?'active':''}" data-banner-dot="${i}" aria-label="${i+1}"></button>`).join('');
    track.after(dots);
  }

  const prevRender51 = render;
  render = function(){
    prevRender51();
    ensureBannerDots();
    applyBannerActive();
    ensureBannerTimer();
  };

  let touchStartX=0, touchStartY=0, touchTracking=false;
  document.addEventListener('touchstart', e=>{
    if(!e.target.closest('.v45-banners')) return;
    const t = e.touches[0];
    touchStartX = t.clientX; touchStartY = t.clientY; touchTracking = true;
  }, {passive:true});
  document.addEventListener('touchend', e=>{
    if(!touchTracking) return;
    touchTracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX, dy = t.clientY - touchStartY;
    if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)*1.5){
      stepBanner(dx < 0 ? 1 : -1);
      ensureBannerTimer();
    }
  }, {passive:true});

  document.addEventListener('click', e=>{
    const dot = e.target.closest('[data-banner-dot]');
    if(dot){ e.preventDefault(); goToBanner(Number(dot.dataset.bannerDot)); ensureBannerTimer(); return; }
  });
})();

/* v52 patch: richer home screen — search shortcut + current-order status card */
(function(){
  Object.assign(ui.he,{ homeSearchPlaceholder:'חיפוש מוצר או ברקוד...', currentOrder:'ההזמנה הנוכחית', noCurrentOrder:'אין הזמנה פתוחה כרגע' });
  Object.assign(ui.en,{ homeSearchPlaceholder:'Search product or barcode...', currentOrder:'Current order', noCurrentOrder:'No open order right now' });
  Object.assign(ui.ar,{ homeSearchPlaceholder:'ابحث عن منتج أو باركود...', currentOrder:'الطلب الحالي', noCurrentOrder:'لا يوجد طلب مفتوح حاليًا' });
  Object.assign(ui.ru,{ homeSearchPlaceholder:'Поиск товара или штрихкода...', currentOrder:'Текущий заказ', noCurrentOrder:'Сейчас нет открытого заказа' });

  function pendingQueue52(){ try{ return JSON.parse(localStorage.getItem('orderpilot_pending_orders_v1')||'[]'); }catch(_){ return []; } }
  function activeOrder52(){
    const orders = appState.data?.orders || [];
    return orders.find(o=>!['supplied','cancelled','closed'].includes(o.status)) || null;
  }
  function currentOrderCardHtml(){
    const pending = pendingQueue52();
    if(pending.length){
      const p = pending[0];
      const cartons = (p.payload?.items||[]).reduce((s,i)=>s+Number(i.quantity||0),0);
      return `<button type="button" class="current-order-pill pending" data-screen="orders">${icon('cloud-off',{size:16})}<span><b>${esc(t('pendingBadge'))}</b><small>${cartons} ${esc(t('cartons'))}</small></span></button>`;
    }
    const order = activeOrder52();
    if(!order) return '';
    return `<button type="button" class="current-order-pill" data-order-detail="${esc(order.id)}"><span class="pill-dot"></span><span><b>${esc(order.orderNumber||'')}</b><small>${esc(tr(order.statusText||''))}</small></span>${icon('chevron-left',{size:16})}</button>`;
  }

  function ensureHomeExtras(){
    const home = document.querySelector('.v45-home');
    if(!home) return;
    if(!home.querySelector('.home-search-shortcut')){
      home.insertAdjacentHTML('afterbegin', `<button type="button" class="home-search-shortcut" data-action="home-search-shortcut">${icon('search',{size:16})}<span>${esc(t('homeSearchPlaceholder'))}</span></button>`);
    }
    const banners = home.querySelector('.v45-banners');
    const dots = home.querySelector('.banner-dots');
    const anchor = dots || banners;
    if(anchor && !home.querySelector('.current-order-pill')){
      const cardHtml = currentOrderCardHtml();
      if(cardHtml) anchor.insertAdjacentHTML('afterend', cardHtml);
    }
  }

  const prevRender52 = render;
  render = function(){
    prevRender52();
    ensureHomeExtras();
  };

  document.addEventListener('click', e=>{
    const shortcut = e.target.closest('[data-action="home-search-shortcut"]');
    if(shortcut){ e.preventDefault(); appState.screen='order'; appState.selectedTypeId=''; appState.selectedDate=''; appState.selectedCategory='all'; appState.selectedSubcategory=''; render(); return; }
  });
})();
