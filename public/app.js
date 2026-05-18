const root = document.getElementById('app');
const API_BASE = window.ORDERPILOT_API_BASE || window.ORDERPILOT_CONFIG?.API_BASE_URL || '';
function apiUrlForDisplay(){ return API_BASE || location.origin || '(relative)'; }
async function fetchWithTimeout(url, options={}, ms=12000){ const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),ms); try{ return await fetch(url,{...options,signal:ctrl.signal}); } finally { clearTimeout(timer); } }
async function testConnection(){ const target=(API_BASE||'')+'/api/diagnostics/connection'; try{ const res=await fetchWithTimeout(target,{cache:'no-store'},8000); const text=await res.text(); let data={}; try{ data=JSON.parse(text); }catch(_){ data={raw:text.slice(0,300)}; } showModal(`<h2>בדיקת חיבור</h2><div class="diag-box"><p><b>API:</b> ${esc(apiUrlForDisplay())}</p><p><b>סטטוס:</b> ${res.status}</p><pre>${esc(JSON.stringify(data,null,2))}</pre></div><button class="btn primary block" data-modal-close>סגירה</button>`); }catch(err){ showModal(`<h2>בדיקת חיבור נכשלה</h2><div class="diag-box"><p><b>API:</b> ${esc(apiUrlForDisplay())}</p><p>${esc(err.message||String(err))}</p><p>פתח בטלפון בדפדפן: ${esc(apiUrlForDisplay())}/api/health</p></div><button class="btn primary block" data-modal-close>סגירה</button>`); } }
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
  he: { login:'התחברות', networkCode:'קוד רשת', branchCode:'קוד סניף', password:'סיסמה', signIn:'כניסה', forgot:'שכחתי סיסמה', chooseType:'בחירת סוג הזמנה', chooseDate:'בחירת תאריך אספקה', chooseDateBtn:'בחירת תאריך אספקה והמשך', catalog:'קטלוג', all:'הכל', search:'חיפוש מוצר או ברקוד', scan:'סריקה', cart:'סל', orders:'הזמנות', notifications:'התראות', settings:'הגדרות', contact:'צור קשר', add:'הוספה', qty:'כמות', cartons:'קרטונים', unitsPerCarton:'יחידות בקרטון', kosher:'כשרות', stock:'מלאי', submit:'שליחת הזמנה', summary:'סיכום הזמנה', minOrder:'מינימום הזמנה', missingMin:'צריך להשלים מינימום', date:'תאריך אספקה', back:'חזרה', close:'סגירה', history:'היסטוריה', productInfo:'מידע מוצר', language:'שפה', theme:'ערכת נושא', light:'בהיר', dark:'כהה', send:'שליחה', subject:'נושא', message:'הודעה', phone:'טלפון', email:'מייל', passwordChange:'קביעת סיסמה קבועה', newPassword:'סיסמה חדשה', save:'שמירה', resetCode:'קוד שחזור', scanHint:'מקם את הברקוד בתוך המלבן', manualBarcode:'הקלדת ברקוד ידנית', noProducts:'אין מוצרים מתאימים', delivered:'סופק', packed:'נארז', missing:'נפל מההזמנה', appSettings:'הגדרות אפליקציה', exception:'חריג', barcode:'ברקוד', noDates:'אין תאריכים זמינים', logout:'התנתקות', fontSize:'גודל כתב', small:'קטן', normal:'רגיל', large:'גדול', barcodeNotFound:'ברקוד לא נמצא' },
  en: { login:'Login', networkCode:'Network code', branchCode:'Branch code', password:'Password', signIn:'Sign in', forgot:'Forgot password', chooseType:'Choose order type', chooseDate:'Choose delivery date', chooseDateBtn:'Choose delivery date and continue', catalog:'Catalog', all:'All', search:'Search product or barcode', scan:'Scan', cart:'Cart', orders:'Orders', notifications:'Notifications', settings:'Settings', contact:'Contact', add:'Add', qty:'Quantity', cartons:'Cartons', unitsPerCarton:'Units per carton', kosher:'Kosher', stock:'Stock', submit:'Submit order', summary:'Order summary', minOrder:'Minimum order', missingMin:'Minimum not reached', date:'Delivery date', back:'Back', close:'Close', history:'History', productInfo:'Product info', language:'Language', theme:'Theme', light:'Light', dark:'Dark', send:'Send', subject:'Subject', message:'Message', phone:'Phone', email:'Email', passwordChange:'Set permanent password', newPassword:'New password', save:'Save', resetCode:'Reset code', scanHint:'Place the barcode inside the rectangle', manualBarcode:'Enter barcode manually', noProducts:'No matching products', delivered:'Delivered', packed:'Packed', missing:'Missing from order', appSettings:'App settings', exception:'Exception', barcode:'Barcode', noDates:'No available dates', logout:'Logout', fontSize:'Font size', small:'Small', normal:'Normal', large:'Large', barcodeNotFound:'Barcode not found' },
  ar: { login:'تسجيل الدخول', networkCode:'رمز الشبكة', branchCode:'رمز الفرع', password:'كلمة المرور', signIn:'دخول', forgot:'نسيت كلمة المرور', chooseType:'اختر نوع الطلب', chooseDate:'اختر تاريخ التوريد', chooseDateBtn:'اختيار تاريخ التوريد والمتابعة', catalog:'الكتالوج', all:'الكل', search:'ابحث عن منتج أو باركود', scan:'مسح', cart:'السلة', orders:'الطلبات', notifications:'الإشعارات', settings:'الإعدادات', contact:'تواصل', add:'إضافة', qty:'الكمية', cartons:'كراتين', unitsPerCarton:'وحدات في الكرتون', kosher:'كوشير', stock:'المخزون', submit:'إرسال الطلب', summary:'ملخص الطلب', minOrder:'الحد الأدنى للطلب', missingMin:'لم يتم الوصول للحد الأدنى', date:'تاريخ التوريد', back:'رجوع', close:'إغلاق', history:'السجل', productInfo:'معلومات المنتج', language:'اللغة', theme:'المظهر', light:'فاتح', dark:'داكن', send:'إرسال', subject:'الموضوع', message:'الرسالة', phone:'هاتف', email:'بريد إلكتروني', passwordChange:'تعيين كلمة مرور دائمة', newPassword:'كلمة مرور جديدة', save:'حفظ', resetCode:'رمز الاستعادة', scanHint:'ضع الباركود داخل المستطيل', manualBarcode:'إدخال الباركود يدويًا', noProducts:'لا توجد منتجات مطابقة', delivered:'تم التوريد', packed:'تم التجهيز', missing:'نقص من الطلب', appSettings:'إعدادات التطبيق', exception:'استثناء', barcode:'باركود', noDates:'لا توجد تواريخ متاحة', logout:'تسجيل الخروج', fontSize:'حجم الخط', small:'صغير', normal:'عادي', large:'كبير', barcodeNotFound:'لم يتم العثور على الباركود' },
  ru: { login:'Вход', networkCode:'Код сети', branchCode:'Код филиала', password:'Пароль', signIn:'Войти', forgot:'Забыли пароль', chooseType:'Выберите тип заказа', chooseDate:'Выберите дату поставки', chooseDateBtn:'Выбрать дату поставки и продолжить', catalog:'Каталог', all:'Все', search:'Поиск товара или штрихкода', scan:'Сканировать', cart:'Корзина', orders:'Заказы', notifications:'Уведомления', settings:'Настройки', contact:'Связаться', add:'Добавить', qty:'Количество', cartons:'Короба', unitsPerCarton:'Ед. в коробе', kosher:'Кашрут', stock:'Склад', submit:'Отправить заказ', summary:'Итог заказа', minOrder:'Минимальный заказ', missingMin:'Минимум не достигнут', date:'Дата поставки', back:'Назад', close:'Закрыть', history:'История', productInfo:'Информация о товаре', language:'Язык', theme:'Тема', light:'Светлая', dark:'Темная', send:'Отправить', subject:'Тема', message:'Сообщение', phone:'Телефон', email:'Email', passwordChange:'Установить постоянный пароль', newPassword:'Новый пароль', save:'Сохранить', resetCode:'Код восстановления', scanHint:'Поместите штрихкод в прямоугольник', manualBarcode:'Ввести штрихкод вручную', noProducts:'Нет подходящих товаров', delivered:'Доставлено', packed:'Упаковано', missing:'Не вошло в заказ', appSettings:'Настройки приложения', exception:'Исключение', barcode:'Штрихкод', noDates:'Нет доступных дат', logout:'Выход', fontSize:'Размер текста', small:'Малый', normal:'Обычный', large:'Крупный', barcodeNotFound:'Штрихкод не найден' }
};
function t(k){ return (ui[appState.lang] || ui.he)[k] || ui.he[k] || k; }
function tr(value){ const s=String(value||''); if(!s) return ''; if(appState.lang==='he') return s; return appState.data?.translations?.[s]?.[appState.lang] || s; }
function esc(v){ return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function money(n){ return Number(n||0).toLocaleString(appState.lang==='he'?'he-IL':'en-US',{style:'currency',currency:'ILS',maximumFractionDigits:0}); }
function dir(){ return ['he','ar'].includes(appState.lang) ? 'rtl' : 'ltr'; }
function img(p){ return `<img class="product-img" src="${esc(p.imageUrl||'/icon.svg')}" alt="${esc(tr(p.name))}" loading="lazy"/>`; }
async function api(path, options={}){ const headers={'Content-Type':'application/json',...(options.headers||{})}; if(appState.token) headers.Authorization=`Bearer ${appState.token}`; const res=await fetchWithTimeout(API_BASE+path,{...options,headers},15000); const data=await res.json().catch(()=>({})); if(res.status===428){ showModal(passwordChangeForm()); throw new Error(data.message||t('passwordChange')); } if(!res.ok) throw new Error(data.message||'Error'); return data; }
async function bootstrap(){ appState.data=await api('/api/app/bootstrap'); applyPreferences(); }
function toast(msg){ const el=document.createElement('div'); el.className='toast'; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),3500); }
function showModal(html, cls=''){ closeModal(); const div=document.createElement('div'); div.className='modal-backdrop app-modal'; div.innerHTML=`<div class="modal-card ${cls}">${html}</div>`; document.body.appendChild(div); div.addEventListener('click',e=>{ if(e.target.classList.contains('modal-backdrop')||e.target.closest('[data-modal-close]')) closeModal(); }); }
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

function render(){ applyPreferences(); if(!appState.token || !appState.data){ root.innerHTML=loginView(); return; } root.innerHTML=`<div class="app-shell" dir="${dir()}"><header class="app-hero"><div><span class="eyebrow">OrderPilot</span><h1>${esc(tr(appState.data.branch.name))}</h1><p>${esc(tr(appState.data.network.name))} · ${esc(tr(appState.data.branch.city||''))}</p></div><button class="round-btn" data-screen="settings">⚙</button></header><main class="app-main">${screenView()}</main><nav class="bottom-nav"><button class="${appState.screen==='order'?'active':''}" data-screen="order">🛒<span>${t('catalog')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">📦<span>${t('orders')}</span></button><button class="${appState.screen==='notifications'?'active':''}" data-screen="notifications">🔔<span>${t('notifications')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">💬<span>${t('contact')}</span></button></nav></div>`; }
function loginView(){ applyPreferences(); return `<main class="login-page" dir="${dir()}"><section class="login-card"><img src="/icon.svg" class="login-logo" alt=""/><h1>${t('login')}</h1><form data-form="login" class="stack"><input name="networkCode" type="password" inputmode="numeric" autocomplete="off" placeholder="${t('networkCode')}" required/><input name="branchCode" type="password" inputmode="numeric" autocomplete="off" placeholder="${t('branchCode')}" required/><input name="password" type="password" autocomplete="current-password" placeholder="${t('password')}" required/><button class="btn primary block">${t('signIn')}</button></form><button class="text-btn" data-action="recover-store">${t('forgot')}</button><div class="lang-row">${['he','en','ar','ru'].map(l=>`<button class="chip ${appState.lang===l?'active':''}" data-lang="${l}">${l==='he'?'עברית':l==='en'?'English':l==='ar'?'العربية':'Русский'}</button>`).join('')}</div></section></main>`; }
function screenView(){ if(appState.screen==='orders') return ordersView(); if(appState.screen==='notifications') return notificationsView(); if(appState.screen==='settings') return settingsView(); if(appState.screen==='contact') return contactView(); return orderFlowView(); }
function orderFlowView(){ if(!appState.selectedTypeId) return typeStep(); if(!appState.selectedDate) return dateStep(); return catalogView(); }
function typeStep(){ return `<section class="flow-card enter"><h2>${t('chooseType')}</h2><div class="type-grid">${appState.data.deliveryTypes.map(type=>`<article class="type-card" data-select-type="${type.id}"><img src="${esc(type.imageUrl||'/icon.svg')}" alt=""/><div><h3>${esc(tr(type.title))}</h3><p>${esc(tr(type.desc||''))}</p></div><span>←</span></article>`).join('')}</div></section>`; }
function dateStep(){ const type=appState.data.deliveryTypes.find(t=>t.id===appState.selectedTypeId); return `<section class="flow-card enter"><button class="text-btn" data-action="back-type">${t('back')}</button><div class="selected-type"><img src="${esc(type?.imageUrl||'/icon.svg')}" alt=""/><div><span>${t('chooseType')}</span><b>${esc(tr(type?.title||''))}</b></div></div><button class="btn primary big pulse" data-action="open-date-picker">${t('chooseDateBtn')}</button></section>`; }
async function openDatePicker(){ try{ const data=await api(`/api/app/delivery-dates?deliveryTypeId=${encodeURIComponent(appState.selectedTypeId)}`); showModal(`<h2>${t('chooseDate')}</h2><div class="floating-dates">${(data.dates||[]).map(d=>`<button data-date-choice="${d.date}"><b>${esc(d.label)}</b>${d.exception?`<span>${t('exception')}</span>`:''}</button>`).join('') || `<p>${t('noDates')}</p>`}</div>`, 'date-popover'); }catch(e){ toast(e.message); } }
function productsForCurrent(){ const q=appState.search.trim().toLowerCase(); return appState.data.products.filter(p=>p.active!==false && (p.deliveryTypeIds||[]).includes(appState.selectedTypeId)).filter(p=>{ if(appState.selectedCategory!=='all' && p.category!==appState.selectedCategory) return false; if(appState.selectedSubcategory && p.subcategory!==appState.selectedSubcategory) return false; if(!q) return true; return [tr(p.name),p.name,p.barcode,tr(p.category),p.category,tr(p.subcategory),p.subcategory,(p.tags||[]).map(tr).join(' '),(p.kosherTypes||[]).map(tr).join(' ')].join(' ').toLowerCase().includes(q); }); }
function categoriesForCurrent(){ return [...new Set(appState.data.products.filter(p=>(p.deliveryTypeIds||[]).includes(appState.selectedTypeId)).map(p=>p.category).filter(Boolean))]; }
function subsForCat(){ if(appState.selectedCategory==='all') return []; return [...new Set(appState.data.products.filter(p=>p.category===appState.selectedCategory && (p.deliveryTypeIds||[]).includes(appState.selectedTypeId)).map(p=>p.subcategory).filter(Boolean))]; }
function catalogView(){ const products=productsForCurrent(); const cats=categoriesForCurrent(); const subs=subsForCat(); const totals=cartTotals(); return `<section class="catalog-screen enter"><div class="catalog-head"><button class="text-btn" data-action="back-date">${t('back')}</button><div><h2>${t('catalog')}</h2><p>${t('date')}: ${esc(appState.selectedDate)} · ${esc(tr(appState.data.deliveryTypes.find(t=>t.id===appState.selectedTypeId)?.title||''))}</p></div></div><div class="search-row"><input value="${esc(appState.search)}" data-search placeholder="${t('search')}"/><button class="btn ghost" data-action="scan-barcode">${t('scan')}</button></div><div class="category-rail"><button class="cat-chip ${appState.selectedCategory==='all'?'active':''}" data-cat="all">${t('all')}</button>${cats.map(c=>`<button class="cat-chip ${appState.selectedCategory===c?'active':''}" data-cat="${esc(c)}">${esc(tr(c))}</button>`).join('')}</div>${subs.length?`<div class="subcategory-rail"><button class="sub-chip ${!appState.selectedSubcategory?'active':''}" data-subcat="">${t('all')}</button>${subs.map(s=>`<button class="sub-chip ${appState.selectedSubcategory===s?'active':''}" data-subcat="${esc(s)}">${esc(tr(s))}</button>`).join('')}</div>`:''}<div class="product-grid">${products.map(productCard).join('') || `<p class="empty">${t('noProducts')}</p>`}</div>${totals.lines?cartBar(totals):''}</section>`; }
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

async function scanBarcode(){ showModal(`<h2>${t('scan')}</h2><div class="scanner-box"><video autoplay playsinline></video><div class="scan-frame"><span></span></div></div><p>${t('scanHint')}</p><button class="btn ghost" data-action="manual-barcode">${t('manualBarcode')}</button>`, 'scanner-modal'); const video=document.querySelector('.scanner-box video'); try{ const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); video.srcObject=stream; if('BarcodeDetector' in window){ const detector=new BarcodeDetector({formats:['ean_13','ean_8','code_128','upc_a','upc_e']}); const loop=async()=>{ if(!video.isConnected){ stream.getTracks().forEach(t=>t.stop()); return; } try{ const codes=await detector.detect(video); if(codes[0]){ stream.getTracks().forEach(t=>t.stop()); closeModal(); findBarcode(codes[0].rawValue); return; } }catch{} requestAnimationFrame(loop); }; loop(); } }catch(e){ toast(e.message); } }
function findBarcode(code){ appState.search=String(code||''); const p=appState.data.products.find(x=>String(x.barcode)===String(code)); render(); if(p) showModal(productModal(p)); else toast(t('barcodeNotFound')); }
async function submitOrder(){ try{ const items=cartItems().map(x=>({productId:x.product.id,quantity:x.quantity})); const data=await api('/api/app/orders',{method:'POST',body:JSON.stringify({deliveryTypeId:appState.selectedTypeId,deliveryDate:appState.selectedDate,items})}); appState.cart={}; closeModal(); await bootstrap(); appState.screen='orders'; render(); toast(`${t('submit')} ✓ ${data.order.orderNumber}`); }catch(e){ toast(e.message); } }
function formObject(form){ return Object.fromEntries(new FormData(form).entries()); }
async function handleSubmit(e){ const form=e.target.closest('form[data-form]'); if(!form) return; e.preventDefault(); const type=form.dataset.form; try{ if(type==='login'){ const data=await api('/api/auth/login',{method:'POST',body:JSON.stringify(formObject(form))}); appState.token=data.token; localStorage.setItem(tokenKey,appState.token); window.OrderPilotMobile?.saveToken?.(appState.token); if(data.passwordChangeRequired){ showModal(passwordChangeForm()); } else { appState.data=data.bootstrap; render(); } return; } if(type==='change-password'){ const data=await api('/api/app/password/change',{method:'POST',body:JSON.stringify(formObject(form))}); appState.data=data.bootstrap; closeModal(); render(); return; } if(type==='recover'){ const payload=formObject(form); const data=await api('/api/auth/recover',{method:'POST',body:JSON.stringify(payload)}); showModal(resetForm(payload,data.demoResetCode)); return; } if(type==='reset'){ await api('/api/auth/reset',{method:'POST',body:JSON.stringify(formObject(form))}); closeModal(); toast('OK'); return; } if(type==='manual-barcode'){ const obj=formObject(form); closeModal(); findBarcode(obj.barcode); return; } if(type==='contact'){ await api('/api/app/contact',{method:'POST',body:JSON.stringify(formObject(form))}); toast('✓'); form.reset(); return; } }catch(err){ toast(err.message); } }
function handleClick(e){ const screen=e.target.closest('[data-screen]'); if(screen){ appState.screen=screen.dataset.screen; render(); return; } const lang=e.target.closest('[data-lang]'); if(lang){ appState.lang=lang.dataset.lang; localStorage.setItem(langKey,appState.lang); render(); return; } const type=e.target.closest('[data-select-type]'); if(type){ appState.selectedTypeId=type.dataset.selectType; appState.selectedDate=''; appState.selectedCategory='all'; appState.selectedSubcategory=''; render(); return; } const action=e.target.closest('[data-action]')?.dataset.action; if(action==='back-type'){ appState.selectedTypeId=''; render(); return; } if(action==='back-date'){ appState.selectedDate=''; render(); return; } if(action==='open-date-picker'){ openDatePicker(); return; } if(action==='open-cart'){ showModal(cartModal(),'cart-modal'); return; } if(action==='submit-order'){ submitOrder(); return; } if(action==='scan-barcode'){ scanBarcode(); return; } if(action==='manual-barcode'){ showModal(manualBarcodeForm()); return; } if(action==='recover-store'){ showModal(recoverForm()); return; } if(action==='logout'){ localStorage.removeItem(tokenKey); window.OrderPilotMobile?.removeToken?.(); appState.token=''; appState.data=null; render(); return; } const date=e.target.closest('[data-date-choice]'); if(date){ appState.selectedDate=date.dataset.dateChoice; closeModal(); render(); return; } const cat=e.target.closest('[data-cat]'); if(cat){ appState.selectedCategory=cat.dataset.cat; appState.selectedSubcategory=''; render(); return; } const sub=e.target.closest('[data-subcat]'); if(sub){ appState.selectedSubcategory=sub.dataset.subcat; render(); return; } const p=e.target.closest('[data-product]'); if(p){ const product=appState.data.products.find(x=>x.id===p.dataset.product); showModal(productModal(product)); return; } const inc=e.target.closest('[data-qty-inc]'); if(inc){ setQty(inc.dataset.qtyInc,(appState.cart[inc.dataset.qtyInc]||0)+1); return; } const dec=e.target.closest('[data-qty-dec]'); if(dec){ setQty(dec.dataset.qtyDec,(appState.cart[dec.dataset.qtyDec]||0)-1); return; } }
function handleInput(e){ if(e.target.matches('[data-search]')){ appState.search=e.target.value; render(); } if(e.target.matches('[data-qty-input]')) setQty(e.target.dataset.qtyInput,e.target.value); if(e.target.matches('[data-lang-select]')){ appState.lang=e.target.value; localStorage.setItem(langKey,appState.lang); render(); } if(e.target.matches('[data-theme-select]')){ appState.theme=e.target.value; localStorage.setItem(themeKey,appState.theme); render(); } if(e.target.matches('[data-font-select]')){ appState.fontSize=e.target.value; localStorage.setItem(fontKey,appState.fontSize); render(); } }
document.addEventListener('submit',handleSubmit); document.addEventListener('click',handleClick); document.addEventListener('input',handleInput);
(async function boot(){ applyPreferences(); try{ if(!appState.token && window.OrderPilotMobile?.getToken){ appState.token = await window.OrderPilotMobile.getToken(); if(appState.token) localStorage.setItem(tokenKey, appState.token); } if(appState.token) await bootstrap(); render(); } catch(err){ localStorage.removeItem(tokenKey); window.OrderPilotMobile?.removeToken?.(); appState.token=''; appState.data=null; toast(err.message||'שגיאת טעינה'); render(); } })();

/* v17 focused app patch: secure login, stable scanner, readable themes */
function loginView(){ applyPreferences(); return `<main class="login-page" dir="${dir()}"><section class="login-card"><img src="/icon.svg" class="login-logo" alt=""/><h1>${t('login')}</h1><form data-form="login" class="stack"><input name="networkCode" type="password" inputmode="numeric" autocomplete="off" placeholder="${t('networkCode')}" required/><input name="branchCode" type="password" inputmode="numeric" autocomplete="off" placeholder="${t('branchCode')}" required/><input name="password" type="password" autocomplete="current-password" placeholder="${t('password')}" required/><button class="btn primary block">${t('signIn')}</button></form><button class="text-btn" data-action="recover-store">${t('forgot')}</button><div class="lang-row">${['he','en','ar','ru'].map(l=>`<button class="chip ${appState.lang===l?'active':''}" data-lang="${l}">${l==='he'?'עברית':l==='en'?'English':l==='ar'?'العربية':'Русский'}</button>`).join('')}</div></section></main>`; }
function render(){ applyPreferences(); if(!appState.token || !appState.data){ root.innerHTML=loginView(); return; } root.innerHTML=`<div class="app-shell" dir="${dir()}"><header class="app-hero"><div><span class="eyebrow">OrderPilot</span><h1>${esc(tr(appState.data.branch.name))}</h1><p>${esc(tr(appState.data.network.name))} · ${esc(tr(appState.data.branch.city||''))}</p></div><button class="round-btn" data-screen="settings">⚙</button></header><main class="app-main">${screenView()}</main><nav class="bottom-nav"><button class="${appState.screen==='order'?'active':''}" data-screen="order">🛒<span>${t('catalog')}</span></button><button class="${appState.screen==='notifications'?'active':''}" data-screen="notifications">🔔<span>${t('notifications')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">💬<span>${t('contact')}</span></button><button class="${appState.screen==='settings'?'active':''}" data-screen="settings">⚙<span>${t('settings')}</span></button></nav></div>`; }
async function openDatePicker(){ try{ const data=await api(`/api/app/delivery-dates?deliveryTypeId=${encodeURIComponent(appState.selectedTypeId)}`); const orders=appState.data.orders||[]; showModal(`<h2>${t('chooseDate')}</h2><div class="floating-dates">${(data.dates||[]).map(d=>{ const dup=orders.find(o=>o.deliveryTypeId===appState.selectedTypeId && o.deliveryDate===d.date && o.status!=='cancelled'); return `<button data-date-choice="${d.date}" ${dup?'data-existing-order="'+dup.id+'"':''}><b>${esc(d.label)}</b>${d.exception?`<span>${t('exception')}</span>`:''}${dup?`<em>כבר קיימת הזמנה · ${esc(dup.orderNumber)}</em>`:''}</button>`; }).join('') || `<p>${t('noDates')}</p>`}</div>`, 'date-popover'); }catch(e){ toast(e.message); } }
function productModal(p){ const q=appState.cart[p.id]||0; const hist=appState.data.orders.flatMap(o=>(o.items||[]).filter(i=>i.productId===p.id).map(i=>({date:o.deliveryDate, order:o.orderNumber, q:i.quantity, packed:i.packedQty??i.suppliedQty??i.quantity, missing:Math.max(0,Number(i.quantity||0)-Number((i.packedQty??i.suppliedQty??i.quantity)||0))}))).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,8); return `<h2>${esc(tr(p.name))}</h2><div class="product-modal-head">${img(p)}<div><p><b>${t('unitsPerCarton')}:</b> ${Number(p.unitsPerCarton||0)}</p><p><b>${t('kosher')}:</b> ${esc((p.kosherTypes||[]).map(tr).join(', '))}</p><p><b>${t('stock')}:</b> ${Number(p.stockQty||0)}</p><p><b>${t('barcode')}:</b> ${esc(p.barcode||'')}</p><div class="qty-controls modal-qty"><button data-qty-dec="${p.id}">−</button><input data-qty-input="${p.id}" type="number" min="0" value="${q}"/><button data-qty-inc="${p.id}">+</button></div></div></div><h3>${t('history')}</h3><div class="history-list">${hist.map(h=>`<div><span>${esc(h.date)} · ${esc(h.order)}</span><b>${h.q} / ${h.packed} ${t('cartons')}</b>${h.missing?`<em>${t('missing')}: ${h.missing}</em>`:''}</div>`).join('') || '<p class="muted">—</p>'}</div><div class="modal-actions"><button class="btn primary" data-modal-close>${t('close')}</button></div>`; }
function recommendedStep(){ const inCart=new Set(Object.keys(appState.cart).filter(id=>appState.cart[id]>0)); const rec=(appState.data.products||[]).filter(p=>!inCart.has(p.id) && (p.deliveryTypeIds||[]).includes(appState.selectedTypeId) && (p.usual||p.trending||p.newItem||Number(p.recommendedQty||0)>0)).slice(0,6); if(!rec.length) return submitOrder(); showModal(`<h2>אולי שכחת להזמין</h2><p class="muted">מוצרים שמוזמנים בדרך כלל / חמים / חדשים ולא נמצאים בסל.</p><div class="product-grid modal-products">${rec.map(productCard).join('')}</div><div class="modal-actions"><button class="btn primary" data-action="submit-order-final">שליחת הזמנה</button><button class="btn ghost" data-modal-close>חזרה לסל</button></div>`); }
async function scanBarcode(){ showModal(`<h2>${t('scan')}</h2><div class="scanner-box stable"><video autoplay muted playsinline></video><div class="scan-frame"><span></span></div></div><p>${t('scanHint')}</p><button class="btn ghost" data-action="manual-barcode">${t('manualBarcode')}</button>`, 'scanner-modal'); const video=document.querySelector('.scanner-box video'); try{ const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}, width:{ideal:1280}, height:{ideal:720}}}); video.srcObject=stream; await video.play().catch(()=>{}); if('BarcodeDetector' in window){ const detector=new BarcodeDetector({formats:['ean_13','ean_8','code_128','upc_a','upc_e']}); let busy=false,last=0; const loop=async(ts)=>{ if(!video.isConnected){ stream.getTracks().forEach(t=>t.stop()); return; } if(!busy && ts-last>350){ busy=true; last=ts; try{ const codes=await detector.detect(video); if(codes[0]){ stream.getTracks().forEach(t=>t.stop()); closeModal(); findBarcode(codes[0].rawValue); return; } }catch{} busy=false; } requestAnimationFrame(loop); }; requestAnimationFrame(loop); } }catch(e){ toast(e.message || 'לא ניתן לפתוח מצלמה'); } }
const oldCartModal = cartModal;
function cartModal(){ const items=cartItems(); const totals=cartTotals(); return `<h2>${t('summary')}</h2><div class="cart-lines">${items.map(({product,quantity})=>`<div class="cart-line"><div>${img(product)}<b>${esc(tr(product.name))}</b></div><div class="qty-controls"><button data-qty-dec="${product.id}">−</button><input data-qty-input="${product.id}" type="number" min="0" value="${quantity}"/><button data-qty-inc="${product.id}">+</button></div></div>`).join('')}</div><div class="summary-box"><div><b>${totals.lines}</b><span>${t('cart')}</span></div><div><b>${totals.cartons}</b><span>${t('cartons')}</span></div><div><b>${money(totals.value)}</b><span>${t('summary')}</span></div></div>${!minOk()?`<p class="danger-text">${t('missingMin')} · ${t('minOrder')}: ${minText()}</p>`:''}<div class="modal-actions"><button class="btn primary" data-action="pre-submit-recommendations" ${!minOk()?'disabled':''}>${t('submit')}</button><button class="btn ghost" data-modal-close>${t('close')}</button></div>`; }
const oldHandleAppClick = document.onclick;
document.addEventListener('click', e=>{ const choice=e.target.closest('[data-date-choice]'); if(choice && choice.dataset.existingOrder){ e.preventDefault(); e.stopPropagation(); const order=(appState.data.orders||[]).find(o=>o.id===choice.dataset.existingOrder); showModal(`<h2>כבר קיימת הזמנה</h2><p>לתאריך הזה כבר קיימת הזמנה ${esc(order?.orderNumber||'')}.</p><div class="modal-actions"><button class="btn primary" data-screen="orders" data-modal-close>מעבר להזמנות</button><button class="btn ghost" data-modal-close>בחירת תאריך אחר</button></div>`); return; } const pre=e.target.closest('[data-action="pre-submit-recommendations"]'); if(pre){ e.preventDefault(); e.stopPropagation(); recommendedStep(); } const final=e.target.closest('[data-action="submit-order-final"]'); if(final){ e.preventDefault(); e.stopPropagation(); submitOrder(); } }, true);


/* v18 app UX/contrast/i18n patch */
function render(){ applyPreferences(); if(!appState.token || !appState.data){ root.innerHTML=loginView(); return; } root.innerHTML=`<div class="app-shell" dir="${dir()}"><header class="app-hero"><div><span class="eyebrow">OrderPilot</span><h1>${esc(tr(appState.data.branch.name))}</h1><p>${esc(tr(appState.data.network.name))} · ${esc(tr(appState.data.branch.city||''))}</p></div><button class="round-btn" data-screen="settings">⚙</button></header><main class="app-main">${screenView()}</main><nav class="bottom-nav"><button class="${appState.screen==='order'?'active':''}" data-screen="order">🛒<span>${t('catalog')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">📦<span>${t('orders')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">💬<span>${t('contact')}</span></button><button class="${appState.screen==='settings'?'active':''}" data-screen="settings">⚙<span>${t('settings')}</span></button></nav></div>`; }
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
    return `<section class="flow-card enter settings-card"><h2>${t('appSettings')}</h2><label>${t('language')}<select data-lang-select>${['he','en','ar','ru'].map(l=>`<option value="${l}" ${l===appState.lang?'selected':''}>${l==='he'?'עברית':l==='en'?'English':l==='ar'?'العربية':'Русский'}</option>`).join('')}</select></label><label>${t('theme')}<select data-theme-select><option value="light" ${appState.theme==='light'?'selected':''}>${t('light')}</option><option value="dark" ${appState.theme==='dark'?'selected':''}>${t('dark')}</option></select></label><label>${t('fontSize')}<select data-font-select><option value="small" ${appState.fontSize==='small'?'selected':''}>${t('small')}</option><option value="normal" ${appState.fontSize==='normal'?'selected':''}>${t('normal')}</option><option value="large" ${appState.fontSize==='large'?'selected':''}>${t('large')}</option></select></label><button class="btn ghost block" data-action="open-notifications">🔔 ${t('notifications')}</button><button class="btn ghost block" data-action="logout">${t('logout')}</button></section>`;
  };

  const oldCartBar = cartBar;
  cartBar = function(totals){
    return `<button class="floating-cart" data-action="open-cart" aria-label="${t('cart')}">🛒<span>${totals.cartons}</span></button>` + oldCartBar(totals);
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
    }catch(e){ toast(e.message); }
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
    }catch(err){ toast(err.message); }
  };
  const oldSubmitOrderV20=submitOrder;
  submitOrder=async function(){
    try{
      const items=cartItems().map(x=>({productId:x.product.id,quantity:x.quantity}));
      const url=appState.editingOrderId ? `/api/app/orders/${encodeURIComponent(appState.editingOrderId)}` : '/api/app/orders';
      const method=appState.editingOrderId ? 'PUT' : 'POST';
      const data=await api(url,{method,body:JSON.stringify({deliveryTypeId:appState.selectedTypeId,deliveryDate:appState.selectedDate,items})});
      appState.cart={}; appState.editingOrderId=''; closeModal(); await bootstrap(); appState.screen='orders'; render(); toast(`${t('submit')} ✓ ${(data.order||{}).orderNumber||''}`);
    }catch(e){ toast(e.message); }
  };
  document.addEventListener('click', e=>{
    const edit=e.target.closest('[data-edit-history-order]');
    if(edit){ e.preventDefault(); e.stopPropagation(); const order=(appState.data.orders||[]).find(o=>o.id===edit.dataset.editHistoryOrder); loadOrderForEdit(order); return; }
    const existing=e.target.closest('[data-existing-order]');
    if(existing){ const order=(appState.data.orders||[]).find(o=>o.id===existing.dataset.existingOrder); if(order && canEditOrder(order)){ e.preventDefault(); e.stopPropagation(); showModal(`<h2>${t('editable')}</h2><p>${esc(order.orderNumber)} · ${esc(formatAppDate(order.deliveryDate))}</p><div class="modal-actions"><button class="btn primary" data-edit-history-order="${esc(order.id)}">${t('openExisting')}</button><button class="btn ghost" data-modal-close>${t('chooseOtherDate')}</button></div>`); } }
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
    }catch(e){ toast(e.message); }
  }

  const oldSettings=settingsView;
  settingsView=function(){
    const base=oldSettings();
    const insert=`<button class="btn ghost block" data-action="enable-push">📲 ${t('enablePush')}</button>`;
    return base.replace(`<button class="btn ghost block" data-action="open-notifications">🔔 ${t('notifications')}</button>`, `<button class="btn ghost block" data-action="open-notifications">🔔 ${t('openNotifications')}</button>${insert}`);
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
  function promoBadge(p){ return p.promotion ? `<span class="promo-badge">🏷️ ${esc(tr(p.promotion.title||t('sale')))}</span>` : ''; }
  productCard=function(p){ const q=appState.cart[p.id]||0; const price=showPrices()?`<span>${money(p.pricePerCarton||0)}</span>`:''; return `<article class="product-card"><button class="product-open" data-product="${esc(p.id)}">${img(p)}${promoBadge(p)}<div class="product-body"><div class="tags">${(p.tags||[]).slice(0,3).map(tag=>`<span>${esc(tr(tag))}</span>`).join('')}</div><h3>${esc(tr(p.name))}</h3><p>${esc(tr(p.category))} · ${esc(tr(p.subcategory||''))}</p><div class="product-meta"><span>${t('stock')}: ${Number(p.stockQty||0)}</span>${price}</div></div></button><div class="quick-actions"><button class="btn sm ghost" data-action="show-similar" data-product-id="${esc(p.id)}">${t('similarShort')}</button>${Number(p.recommendedQty||0)>0?`<button class="btn sm ghost" data-recommended-qty="${esc(p.id)}">${t('useRecommended')}: ${Number(p.recommendedQty||0)}</button>`:''}</div><div class="qty-controls"><button data-qty-dec="${esc(p.id)}" type="button">−</button><input data-qty-input="${esc(p.id)}" type="number" min="0" value="${q}"/><button data-qty-inc="${esc(p.id)}" type="button">+</button></div></article>`; };
  productModal=function(p){ const q=appState.cart[p.id]||0; const food=p.foodType||p.dairyType||'פרווה'; const rows=(appState.data.orders||[]).flatMap(o=>(o.items||[]).filter(i=>i.productId===p.id).map(i=>({date:o.deliveryDate, order:o.orderNumber, arrived:Number((i.packedQty??i.suppliedQty??i.quantity)||0)}))).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,12); return `<h2>${esc(tr(p.name))}</h2><div class="product-modal-head">${img(p)}<div>${promoBadge(p)}<p><b>${t('unitsPerCarton')}:</b> ${Number(p.unitsPerCarton||0)}</p><p><b>${t('cartonsPerPallet')}:</b> ${Number(p.cartonsPerPallet||0)}</p><p><b>${t('kosher')}:</b> ${esc((p.kosherTypes||[]).map(tr).join(', '))}</p><p><b>סוג:</b> ${esc(tr(food))}</p><p><b>${t('stock')}:</b> ${Number(p.stockQty||0)}</p><p><b>${t('barcode')}:</b> ${esc(p.barcode||'')}</p>${showPrices()?`<p><b>מחיר:</b> ${money(p.pricePerCarton||0)}</p>`:''}<div class="qty-controls modal-qty"><button data-qty-dec="${esc(p.id)}" type="button">−</button><input data-qty-input="${esc(p.id)}" type="number" min="0" value="${q}"/><button data-qty-inc="${esc(p.id)}" type="button">+</button></div></div></div><div class="modal-actions modal-actions-inline"><button class="btn ghost" data-action="show-similar" data-product-id="${esc(p.id)}">${(!p.inStock||Number(p.stockQty||0)<=0)?t('alternativeProducts'):t('chooseSimilar')}</button>${Number(p.recommendedQty||0)>0?`<button class="btn primary" data-recommended-qty="${esc(p.id)}">${t('useRecommended')}: ${Number(p.recommendedQty||0)}</button>`:''}</div><div class="product-extra-table"><h3>${t('ingredients')}</h3><p>${esc(tr(p.ingredients||'—'))}</p><h3>${t('allergens')}</h3><p>${esc(tr(p.allergens||'—'))}</p></div><h3>${t('history')}</h3><div class="table-wrap product-history-wrap"><table class="app-history-table"><thead><tr><th>${t('date')}</th><th>${t('orderNo')}</th><th>${t('arrived')}</th></tr></thead><tbody>${rows.map(h=>`<tr><td>${esc(typeof formatAppDate==='function'?formatAppDate(h.date):h.date)}</td><td>${esc(h.order)}</td><td>${h.arrived}</td></tr>`).join('') || `<tr><td colspan="3" class="empty">${t('noHistory')}</td></tr>`}</tbody></table></div><div class="modal-actions"><button class="btn primary" data-modal-close>${t('close')}</button></div>`; };
  catalogView=function(){ const products=productsForCurrent(); const cats=categoriesForCurrent(); const subs=subsForCat(); const totals=cartTotals(); return `<section class="catalog-screen enter"><div class="catalog-head"><button class="text-btn" data-action="back-date">${t('back')}</button><div><h2>${t('catalog')}</h2><p>${t('date')}: ${esc(typeof formatAppDate==='function'?formatAppDate(appState.selectedDate):appState.selectedDate)} · ${esc(tr(appState.data.deliveryTypes.find(t=>t.id===appState.selectedTypeId)?.title||''))}</p></div></div><div class="search-row"><input value="${esc(appState.search)}" data-search placeholder="${t('search')}"/><button class="btn ghost icon-scan" aria-label="${t('scan')}" data-action="scan-barcode">${t('scanIcon')}</button></div><div class="category-rail"><button class="cat-chip ${appState.selectedCategory==='all'?'active':''}" data-cat="all">${t('all')}</button>${cats.map(c=>`<button class="cat-chip ${appState.selectedCategory===c?'active':''}" data-cat="${esc(c)}">${esc(tr(c))}</button>`).join('')}</div>${subs.length?`<div class="subcategory-rail"><button class="sub-chip ${!appState.selectedSubcategory?'active':''}" data-subcat="">${t('all')}</button>${subs.map(s=>`<button class="sub-chip ${appState.selectedSubcategory===s?'active':''}" data-subcat="${esc(s)}">${esc(tr(s))}</button>`).join('')}</div>`:''}<div class="product-grid">${products.map(productCard).join('') || `<p class="empty">${t('noProducts')}</p>`}</div>${totals.lines?cartBar(totals):''}</section>`; };
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
    he:{ home:'ראשי', goodMorning:'בוקר טוב', goodAfternoon:'צהריים טובים', goodEvening:'ערב טוב', newOrder:'ביצוע הזמנה חדשה', deals:'מבצעים', newProducts:'מוצרים חדשים', recommendedProducts:'מוצרים מומלצים', quickActions:'מה תרצה לעשות?', companyAds:'עדכוני חברה', businessDetails:'פרטי העסק', networkNumber:'מספר רשת', customerNumber:'מספר לקוח', networkName:'שם רשת', branchName:'שם סניף', address:'כתובת', contactDetails:'פרטי התקשרות', manager:'מנהל', nextDelivery:'תאריך ההזמנה הקרוב', startOrder:'התחלת הזמנה', noNotifications:'אין התראות חדשות', openSettings:'הגדרות', viewOrders:'היסטוריית הזמנות', viewContact:'צור קשר', banner1:'מבצעים חמים מחכים לך השבוע', banner2:'בדוק מוצרים חדשים לפני כולם', banner3:'הזמנה חכמה חוסכת זמן וכסף', banner4:'מוצרים שחזרו למלאי מסומנים עבורך', banner5:'אל תשכח לבדוק המלצות לפני שידור ההזמנה' },
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
        <button class="home-action primary" data-action="start-new-order"><span>🛒</span><b>${t('newOrder')}</b><small>${t('startOrder')}</small></button>
        <button class="home-action" data-home-products="deals"><span>🏷️</span><b>${t('deals')}</b><small>${t('companyAds')}</small></button>
        <button class="home-action" data-home-products="new"><span>✨</span><b>${t('newProducts')}</b><small>${t('catalog')}</small></button>
        <button class="home-action" data-home-products="recommended"><span>⭐</span><b>${t('recommendedProducts')}</b><small>${t('useRecommended')}</small></button>
      </div>
      <div class="home-secondary-actions">
        <button class="btn ghost" data-screen="contact">💬 ${t('viewContact')}</button>
        <button class="btn ghost" data-screen="orders">📦 ${t('viewOrders')}</button>
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
        <div class="topbar-actions"><button class="round-btn notify-btn" aria-label="${t('notifications')}" data-action="open-notifications">🔔${(appState.data.notifications||[]).length?`<em>${Math.min(99,(appState.data.notifications||[]).length)}</em>`:''}</button><button class="round-btn" aria-label="${t('settings')}" data-screen="settings">⚙</button></div>
      </header>
      <main class="app-main">${screenView()}</main>
      ${totals.lines && appState.screen !== 'order' ? `<button class="floating-cart home-floating-cart" data-action="open-cart">🛒 <b>${totals.cartons}</b></button>` : ''}
      <nav class="bottom-nav"><button class="${appState.screen==='home'?'active':''}" data-screen="home">🏠<span>${t('home')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">📦<span>${t('orders')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">💬<span>${t('contact')}</span></button><button class="${appState.screen==='settings'?'active':''}" data-screen="settings">⚙<span>${t('settings')}</span></button></nav>
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
  productCard=function(p){ const q=appState.cart[p.id]||0; const out=!p.inStock||Number(p.stockQty||0)<=0; const promo=p.promotion; return `<article class="product-card v25-card">${promo?`<span class="promo-badge">🏷️ ${esc(tr(promo.title||'מבצע'))}</span>`:''}<button class="product-open" data-product="${esc(p.id)}">${img(p)}<div class="product-body"><div class="tags">${(p.tags||[]).slice(0,3).map(tag=>`<span>${esc(tr(tag))}</span>`).join('')}</div><h3>${esc(tr(p.name))}</h3><p>${esc(tr(p.category||''))} · ${esc(tr(p.subcategory||''))}</p><div class="product-meta"><span>${t('stock')}: ${Number(p.stockQty||0)}</span><span>${t('cartonsPerPallet')}: ${Number(p.cartonsPerPallet||0)}</span></div></div></button><div class="quick-actions product-card-actions"><button class="btn sm ghost" data-recommended-qty="${esc(p.id)}">${t('recommendedQty')}: ${Number(p.recommendedQty||0)}</button><button class="btn sm ghost" data-action="show-similar" data-product-id="${esc(p.id)}">${out?t('alternativeProducts'):t('chooseSimilar')}</button></div><div class="qty-controls"><button data-qty-dec="${esc(p.id)}" type="button">−</button><input data-qty-input="${esc(p.id)}" type="number" min="0" value="${q}"/><button data-qty-inc="${esc(p.id)}" type="button">+</button></div></article>`; };
  productModal=function(p){ const q=Number(appState.cart[p.id]||0); const rows=(appState.data.orders||[]).flatMap(o=>(o.items||[]).filter(i=>i.productId===p.id).map(i=>({date:o.deliveryDate,order:o.orderNumber,arrived:shippedQty(i)}))).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,10); return `<h2>${esc(tr(p.name))}</h2><div class="product-modal-head">${img(p)}<div><p><b>${t('unitsPerCarton')}:</b> ${Number(p.unitsPerCarton||0)}</p><p><b>${t('cartonsPerPallet')}:</b> ${Number(p.cartonsPerPallet||0)}</p><p><b>${t('recommendedQty')}:</b> <button class="text-btn" data-recommended-qty="${esc(p.id)}">${Number(p.recommendedQty||0)}</button></p><p><b>${t('kosher')}:</b> ${esc([...(p.kosherTypes||[]), p.foodType||p.dairyType||''].filter(Boolean).map(tr).join(', '))}</p><p><b>${t('ingredients')}:</b> ${esc(tr(p.ingredients||'—'))}</p><p><b>${t('allergens')}:</b> ${esc(tr(p.allergens||'—'))}</p><p><b>${t('barcode')}:</b> ${esc(p.barcode||'')}</p><div class="qty-controls modal-qty"><button data-qty-dec="${esc(p.id)}" type="button">−</button><input data-qty-input="${esc(p.id)}" type="number" min="0" value="${q}"/><button data-qty-inc="${esc(p.id)}" type="button">+</button></div></div></div><div class="modal-actions modal-actions-inline"><button class="btn ghost" data-action="show-similar" data-product-id="${esc(p.id)}">${(!p.inStock||Number(p.stockQty||0)<=0)?t('alternativeProducts'):t('chooseSimilar')}</button></div><h3>${t('history')}</h3><div class="table-wrap product-history-wrap"><table class="app-history-table"><thead><tr><th>${t('date')}</th><th>${t('orderNo')}</th><th>${t('actuallyArrived')}</th></tr></thead><tbody>${rows.map(h=>`<tr><td>${esc(realDate(h.date))}</td><td>${esc(h.order)}</td><td>${h.arrived}</td></tr>`).join('')||`<tr><td colspan="3">${t('noHistory')}</td></tr>`}</tbody></table></div><div class="modal-actions"><button class="btn primary" data-modal-close>${t('close')}</button></div>`; };
  settingsView=function(){ const n=appState.data?.network||{}, b=appState.data?.branch||{}; const address=[b.city,b.address].filter(Boolean).join(', '); return `<section class="flow-card enter settings-card"><h2>${t('appSettings')}</h2><label>${t('language')}<select data-lang-select>${['he','en','ar','ru'].map(l=>`<option value="${l}" ${l===appState.lang?'selected':''}>${l==='he'?'עברית':l==='en'?'English':l==='ar'?'العربية':'Русский'}</option>`).join('')}</select></label><label>${t('theme')}<select data-theme-select><option value="light" ${appState.theme==='light'?'selected':''}>${t('light')}</option><option value="dark" ${appState.theme==='dark'?'selected':''}>${t('dark')}</option></select></label><label>${t('fontSize')}<select data-font-select><option value="small" ${appState.fontSize==='small'?'selected':''}>${t('small')}</option><option value="normal" ${appState.fontSize==='normal'?'selected':''}>${t('normal')}</option><option value="large" ${appState.fontSize==='large'?'selected':''}>${t('large')}</option></select></label><section class="business-details-card"><h3>${t('businessDetails')}</h3><dl><div><dt>${t('networkName')}</dt><dd>${esc(tr(n.name||''))}</dd></div><div><dt>${t('branchName')}</dt><dd>${esc(tr(b.name||''))}</dd></div><div><dt>${t('address')}</dt><dd>${esc(address||'—')}</dd></div><div><dt>${t('contactDetails')}</dt><dd>${esc([b.phone,b.email].filter(Boolean).join(' · ')||'—')}</dd></div><div><dt>${t('manager')}</dt><dd>${esc(b.managerName||'—')}</dd></div></dl></section><button class="btn ghost block" data-action="logout">${t('logout')}</button></section>`; };
  function greetingKey(){ const h=new Date().getHours(); if(h<12) return 'goodMorning'; if(h<18) return 'goodAfternoon'; return 'goodEvening'; }
  function homeBanners(){ const custom=appState.data?.appBanners||[]; const fallback=[{title:t('banner1'),text:t('deals'),icon:'🏷️'},{title:t('banner2'),text:t('newProducts'),icon:'✨'},{title:t('banner3'),text:t('newOrder'),icon:'⚡'},{title:t('banner4'),text:t('stock'),icon:'📦'},{title:t('banner5'),text:t('recommendedProducts'),icon:'✅'}]; return (custom.length?custom:fallback).slice(0,5); }
  function nextDeliveryHint(){ const map=appState.data?.allowedDatesByType||{}; const all=Object.values(map).flat().concat(appState.data?.allowedDates||[]).filter(Boolean); return all.map(d=>typeof d==='string'?{date:d}:d).filter(d=>d.date).sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0]; }
  homeView=function(){ const b=appState.data.branch||{}, n=appState.data.network||{}; const next=nextDeliveryHint(); const banners=homeBanners(); const address=[b.city,b.address].filter(Boolean).join(', '); return `<section class="home-screen enter"><div class="home-branch-card"><b>${esc(tr(n.name||''))}</b><span>${esc(tr(b.name||''))}${address?` · ${esc(address)}`:''}</span><strong>${t(greetingKey())}, ${esc(b.managerName||b.name||'')}</strong>${next?`<div class="next-delivery-pill">${t('nextDelivery')}: <b>${esc(realDate(next.date))}</b></div>`:''}</div><div class="app-banner-carousel" aria-label="${t('companyAds')}"><div class="app-banner-track" style="--banner-count:${banners.length}">${banners.map(x=>`<article class="app-banner ${x.imageUrl?'with-image':''}" ${x.imageUrl?`style="background-image:linear-gradient(90deg,rgba(15,23,42,.72),rgba(37,99,235,.38)),url('${esc(x.imageUrl)}')"`:''}><span>${esc(x.icon||'📣')}</span><div><b>${esc(tr(x.title||''))}</b><small>${esc(tr(x.text||''))}</small></div></article>`).join('')}</div></div><div class="home-action-grid"><button class="home-action primary" data-action="start-new-order"><span>🛒</span><b>${t('newOrder')}</b><small>${t('startOrder')}</small></button><button class="home-action" data-home-products="deals"><span>🏷️</span><b>${t('deals')}</b><small>${t('companyAds')}</small></button><button class="home-action" data-home-products="new"><span>✨</span><b>${t('newProducts')}</b><small>${t('catalog')}</small></button><button class="home-action" data-home-products="recommended"><span>⭐</span><b>${t('recommendedProducts')}</b><small>${t('useRecommended')}</small></button></div></section>`; };
  render=function(){ applyPreferences(); if(!appState.token||!appState.data){ root.innerHTML=loginView(); return; } const totals=cartTotals(); const unread=unreadNotifications().length; root.innerHTML=`<div class="app-shell v25-home-shell" dir="${dir()}"><header class="app-topbar"><div class="app-identity"><span class="eyebrow">OrderPilot</span><h1>${esc(tr(appState.data.network?.name||''))}</h1><p>${esc(tr(appState.data.branch?.name||''))}</p></div><div class="topbar-actions"><button class="round-btn notify-btn" aria-label="${t('notifications')}" data-action="open-notifications">🔔${unread?`<em>${Math.min(99,unread)}</em>`:''}</button><button class="round-btn" aria-label="${t('settings')}" data-screen="settings">⚙</button></div></header><main class="app-main">${screenView()}</main>${totals.lines?`<button class="floating-cart home-floating-cart" data-action="open-cart">🛒 <b>${totals.cartons}</b></button>`:''}<nav class="bottom-nav"><button class="${appState.screen==='home'?'active':''}" data-screen="home">🏠<span>${t('home')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">💬<span>${t('contact')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">📦<span>${t('orders')}</span></button><button class="${appState.screen==='settings'?'active':''}" data-screen="settings">⚙<span>${t('settings')}</span></button></nav></div>`; };
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
  productModal = function(p){ const base=oldProductModal26(p); const returns=returnRowsForProduct(p.id); const table=`<h3>${t('returnHistory')}</h3><div class="table-wrap"><table class="app-history-table"><thead><tr><th>${t('date')}</th><th>${t('returnedActual')}</th><th>${t('cartonPart')}</th><th>${t('returnStatus')}</th></tr></thead><tbody>${returns.map(r=>`<tr><td>${esc(typeof formatAppDate==='function'?formatAppDate(r.date):String(r.date||'').slice(0,10))}</td><td>${Number((r.approvedUnits ?? r.units) || 0)}</td><td>${Math.round(Number(r.cartonFraction||0)*100)}%</td><td>${esc(tr(r.statusText||''))}</td></tr>`).join('') || `<tr><td colspan="4" class="empty">—</td></tr>`}</tbody></table></div><div class="modal-actions"><button class="btn ghost" data-action="return-one-product" data-product-id="${esc(p.id)}">${t('createReturn')}</button></div>`; return base.replace('<div class="modal-actions"><button class="btn primary" data-modal-close>', `${table}<div class="modal-actions"><button class="btn primary" data-modal-close>`); };
  function returnsView(){ const rows=(appState.data.returns||[]).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))); return `<section class="list-screen enter"><div class="panel-head"><h2>${t('returns')}</h2><button class="btn primary" data-action="new-return">${t('createReturn')}</button></div>${rows.map(r=>`<article class="order-card"><div><b>${esc(r.returnNumber)}</b><span>${esc(typeof formatAppDate==='function'?formatAppDate(r.createdAt):String(r.createdAt||'').slice(0,10))}</span></div><span class="badge">${esc(tr(r.statusText||''))}</span>${(r.items||[]).map(i=>`<div class="order-line"><span>${esc(tr(i.productName))}</span><b>${Number(i.units||0)} יח׳ · ${Math.round(Number(i.cartonFraction||0)*100)}%</b></div>`).join('')}</article>`).join('') || `<p class="empty">—</p>`}</section>`; }
  const oldScreenView26 = screenView;
  screenView = function(){ if(appState.screen==='returns') return returnsView(); return oldScreenView26(); };
  const oldSettings26 = settingsView;
  settingsView = function(){ return oldSettings26().replace(`<button class="btn ghost block" data-screen="orders">${t('orders')}</button>`, `<button class="btn ghost block" data-screen="orders">${t('orders')}</button><button class="btn ghost block" data-screen="returns">${t('returns')}</button>`); };
  function returnForm(productId=''){ const products=(appState.data.products||[]).filter(p=>p.active!==false); return `<h2>${t('createReturn')}</h2><form data-form="return-request" class="stack return-form"><div class="return-products">${products.map(p=>`<label class="return-product-row"><span>${returnBadge(p)} ${esc(tr(p.name))}<small>${esc(p.barcode||'')} · ${Number(p.unitsPerCarton||1)} ${t('unitsPerCarton')}</small></span><input type="number" min="0" name="units__${esc(p.id)}" value="${p.id===productId?'1':''}" placeholder="${t('returnUnits')}"/></label>`).join('')}</div><label>${t('returnCertificate')}<input type="file" name="certificateImageUrl" accept="image/*"/></label><label>${t('returnImages')}<input type="file" name="returnImages" accept="image/*" multiple/></label><textarea name="note" placeholder="${t('returnReason')}"></textarea><div class="modal-actions"><button class="btn primary">${t('send')}</button><button class="btn ghost" type="button" data-modal-close>${t('close')}</button></div></form>`; }
  function collectReturnItems(form){ return [...form.querySelectorAll('input[name^="units__"]')].map(i=>({ productId:i.name.replace('units__',''), units:Number(i.value||0) })).filter(x=>x.units>0); }
  document.addEventListener('click', e=>{ const nr=e.target.closest('[data-action="new-return"]'); if(nr){ e.preventDefault(); showModal(returnForm()); return; } const rp=e.target.closest('[data-action="return-one-product"]'); if(rp){ e.preventDefault(); e.stopPropagation(); showModal(returnForm(rp.dataset.productId)); return; } }, true);
  document.addEventListener('submit', async e=>{ const form=e.target.closest('form[data-form="return-request"]'); if(!form) return; e.preventDefault(); e.stopPropagation(); try{ const cert=await fileToDataUrl(form.querySelector('[name="certificateImageUrl"]')?.files?.[0]); const photos=[]; for(const f of form.querySelector('[name="returnImages"]')?.files||[]) photos.push(await fileToDataUrl(f)); const data=await api('/api/app/returns',{method:'POST',body:JSON.stringify({ items:collectReturnItems(form), note:form.note.value, certificateImageUrl:cert, returnImageUrls:photos })}); closeModal(); await bootstrap(); appState.screen='returns'; render(); toast(`${t('createReturn')} ✓ ${data.return.returnNumber}`); }catch(err){ toast(err.message); } }, true);
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
    return `<section class="home-screen v27-home enter"><div class="branch-hero"><div class="branch-main"><span class="eyebrow">${t('networkName')}</span><h2>${esc(tr(n.name||''))}</h2><p>${esc(v27Address())}</p><small>${esc(v27Greeting())}, ${esc(b.managerName||'')}</small></div></div><div class="banner-carousel tall">${banners.map((x,i)=>`<article class="home-banner ${i===0?'active':''}" style="--i:${i}">${x.imageUrl?`<img src="${esc(x.imageUrl)}" alt="">`:''}<span>${esc(x.icon||'📣')}</span><div><b>${esc(tr(x.title||''))}</b><p>${esc(tr(x.text||''))}</p></div></article>`).join('')}</div><div class="home-actions"><button class="action-card primary" data-action="start-new-order">🛒<b>${t('newOrder')}</b></button><button class="action-card" data-screen="promotions">🏷️<b>${t('deals')}</b><small>${promos.length}</small></button><button class="action-card" data-action="filter-new">✨<b>${t('newProducts')}</b></button><button class="action-card" data-action="filter-recommended">✅<b>${t('recommendedProducts')}</b></button></div></section>`;
  }
  function v27PromotionsView(){ const rows=(appState.data?.products||[]).filter(p=>p.promotion); return `<section class="catalog-screen enter"><div class="panel-head"><h2>${t('promotions')}</h2></div><div class="product-grid">${rows.map(p=>productCard(p)).join('')||`<p class="empty">${t('noProducts')}</p>`}</div></section>`; }
  const oldScreenV27=screenView;
  screenView=function(){ if(appState.screen==='home') return v27HomeView(); if(appState.screen==='promotions') return v27PromotionsView(); return oldScreenV27(); };
  const oldRenderV27=render;
  render=function(){ applyPreferences(); if(!appState.token||!appState.data){ root.innerHTML=loginView(); return; } const totals=cartTotals(); const unread=v27Notes().length; root.innerHTML=`<div class="app-shell v27-shell" dir="${dir()}"><header class="app-topbar"><div class="app-identity compact"><span class="eyebrow">OrderPilot</span><h1>${esc(tr(appState.data.network?.name||''))}</h1></div><div class="topbar-actions"><button class="round-btn notify-btn" aria-label="${t('notifications')}" data-action="open-notifications">🔔${unread?`<em>${Math.min(99,unread)}</em>`:''}</button><button class="round-btn" aria-label="${t('settings')}" data-screen="settings">⚙</button></div></header><main class="app-main">${screenView()}</main>${totals.lines?`<button class="floating-cart home-floating-cart" data-action="open-cart">🛒 <b>${totals.cartons}</b></button>`:''}<nav class="bottom-nav"><button class="${appState.screen==='home'?'active':''}" data-screen="home">🏠<span>${t('home')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">📦<span>${t('orders')}</span></button><button class="${appState.screen==='returns'?'active':''}" data-screen="returns">↩️<span>${t('returns')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">💬<span>${t('contact')}</span></button></nav></div>`; };
  function v27CartonPart(units,p){ const per=Number(p?.unitsPerCarton||1); return per ? (Number(units||0)/per).toFixed(2) : '0.00'; }
  const oldProductModalV27=productModal;
  productModal=function(p){ let html=oldProductModalV27(p); return html.replace(/<th>[^<]*מתוך קרטון[^<]*<\/th>/g, `<th>${t('cartonActual')}</th>`); };
  const oldProductCardV27=productCard;
  productCard=function(p){ let html=oldProductCardV27(p); if(p.promotion && !html.includes('promo-corner')) html=html.replace('<article ', '<article data-promo="1" ').replace('<div class="tags">', `<span class="promo-corner">🏷️</span><div class="tags">`); return html; };
  const oldReturnFormSubmit = null;
  document.addEventListener('input', e=>{ if(e.target.matches('form[data-form="return-request"] input[name^="units__"]')){ const row=e.target.closest('.return-product-row'); const pid=e.target.name.replace('units__',''); const p=(appState.data?.products||[]).find(x=>x.id===pid); let preview=row?.querySelector('[data-return-carton-preview]'); if(!preview){ preview=document.createElement('em'); preview.dataset.returnCartonPreview='1'; row.appendChild(preview); } preview.textContent=`${v27CartonPart(e.target.value,p)} ${t('cartonActual')}`; } }, true);
})();


/* v29 patch: restore cleaner home header, order history labels/details, compact returns and translation polish */
(function(){
  const v29copy={
    he:{orders:'היסטוריית הזמנות', orderHistory:'היסטוריית הזמנות', returns:'חזרות', home:'ראשי', networkBranchLine:'פרטי סניף', returnedItems:'מוצרים להחזרה', productsCount:'כמות מוצרים', totalUnits:'סך יחידות', totalCartons:'סך קרטונים', returnDetails:'פרטי החזרה', actualArrived:'הגיע בפועל', ordered:'הוזמן', editedChanges:'שינויים בעריכה', deliveryExpected:'מועד אספקה', createdAt:'בוצע בתאריך', newOrder:'ביצוע הזמנה חדשה', deals:'מבצעים', newProducts:'מוצרים חדשים', recommendedProducts:'מוצרים מומלצים', goodMorning:'בוקר טוב', goodAfternoon:'צהריים טובים', goodEvening:'ערב טוב'},
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
        <button class="action-card primary" data-action="start-new-order"><span>🛒</span><b>${t('newOrder')}</b></button>
        <button class="action-card" data-screen="promotions"><span>🏷️</span><b>${t('deals')}</b></button>
        <button class="action-card" data-action="filter-new"><span>✨</span><b>${t('newProducts')}</b></button>
        <button class="action-card" data-action="filter-recommended"><span>✅</span><b>${t('recommendedProducts')}</b></button>
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
  render=function(){ applyPreferences(); if(!appState.token||!appState.data){ root.innerHTML=loginView(); return; } const totals=cartTotals(); const unread=(appState.data.notifications||[]).filter(n=>n.status!=='read').length; root.innerHTML=`<div class="app-shell v29-shell" dir="${dir()}"><header class="app-topbar"><div class="app-identity compact"><span class="eyebrow">OrderPilot</span></div><div class="topbar-actions"><button class="round-btn notify-btn" aria-label="${t('notifications')}" data-action="open-notifications">🔔${unread?`<em>${Math.min(99,unread)}</em>`:''}</button><button class="round-btn" aria-label="${t('settings')}" data-screen="settings">⚙</button></div></header><main class="app-main">${screenView()}</main>${totals.lines?`<button class="floating-cart home-floating-cart" data-action="open-cart">🛒 <b>${totals.cartons}</b></button>`:''}<nav class="bottom-nav"><button class="${appState.screen==='home'?'active':''}" data-screen="home">🏠<span>${t('home')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">📦<span>${t('orderHistory')}</span></button><button class="${appState.screen==='returns'?'active':''}" data-screen="returns">↩️<span>${t('returns')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">💬<span>${t('contact')}</span></button></nav></div>`; };
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
      e.preventDefault(); e.stopPropagation(); toast('חובה לצרף לפחות תמונה אחת של ההחזרה');
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
    return `<section class="home-screen v31-home enter"><div class="v31-brand-card"><span class="eyebrow">OrderPilot</span><b>${esc31(place)}</b><small>${esc31(v31Greeting())}, ${esc31(b.managerName||b.name||'')}</small></div><div class="banner-carousel v31-banners">${banners.map((x,i)=>`<article class="home-banner ${i===0?'active':''}" style="--i:${i}">${x.imageUrl?`<img src="${esc31(x.imageUrl)}" alt="">`:''}<span>${esc31(x.icon||'📣')}</span><div><b>${esc31(tr(x.title||''))}</b><p>${esc31(tr(x.text||''))}</p></div></article>`).join('')}</div><div class="home-actions v31-actions"><button class="action-card primary" data-action="start-new-order"><span>🛒</span><b>${t('newOrder')}</b></button><button class="action-card" data-screen="promotions"><span>🏷️</span><b>${t('deals')}</b></button><button class="action-card" data-action="filter-new"><span>✨</span><b>${t('newProducts')}</b></button><button class="action-card" data-action="filter-recommended"><span>✅</span><b>${t('recommendedProducts')}</b></button></div></section>`;
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
    he:{home:'ראשי', newOrder:'ביצוע הזמנה חדשה', deals:'מבצעים', newProducts:'מוצרים חדשים', recommendedProducts:'מוצרים מומלצים', quickProducts:'מוצרים', contactSentTitle:'הפנייה נשלחה בהצלחה', contactSentBody:'קיבלנו את הפנייה. תשובה מהחברה תופיע בפעמון ההתראות.', backHome:'חזרה לראשי', businessDetails:'פרטי העסק', network:'רשת', branch:'סניף', address:'כתובת', manager:'מנהל', settings:'הגדרות', notifications:'התראות'},
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
  function home32(){ const b=appState.data?.branch||{}; const banners=banners32(); return `<section class="home-screen v32-home enter"><div class="banner-carousel v32-banners">${banners.map((x,i)=>`<article class="home-banner ${i===0?'active':''}" style="--i:${i}">${x.imageUrl?`<img src="${esc32(x.imageUrl)}" alt="">`:''}<span>${esc32(x.icon||'📣')}</span><div><b>${esc32(tr(x.title||''))}</b><p>${esc32(tr(x.text||''))}</p></div></article>`).join('')}</div><div class="home-actions v32-actions"><button class="action-card primary" data-action="start-new-order"><span>🛒</span><b>${t('newOrder')}</b></button><button class="action-card" data-screen="promotions"><span>🏷️</span><b>${t('deals')}</b></button><button class="action-card" data-action="v32-filter-new"><span>✨</span><b>${t('newProducts')}</b></button><button class="action-card" data-action="v32-filter-recommended"><span>✅</span><b>${t('recommendedProducts')}</b></button></div></section>`; }
  function quickProducts32(){ const mode=appState.quickMode||'new'; const all=(appState.data?.products||[]).filter(p=>p.active!==false); const rows=all.filter(p=> mode==='new' ? (p.newItem || (p.tags||[]).some(x=>String(x).includes('חדש'))) : (p.usual || p.trending || Number(p.recommendedQty||0)>0)); return `<section class="catalog-screen quick-products enter"><div class="catalog-head"><button class="text-btn" data-screen="home">${t('backHome')}</button><div><h2>${mode==='new'?t('newProducts'):t('recommendedProducts')}</h2><p>${t('quickProducts')}</p></div></div><div class="search-row"><input value="${esc32(appState.search||'')}" data-search placeholder="${t('search')}"/><button class="btn ghost" data-action="scan-barcode">📷</button></div><div class="product-grid">${rows.filter(p=>{const q=(appState.search||'').trim().toLowerCase(); return !q || [tr(p.name),p.name,p.barcode,tr(p.category),p.category,(p.tags||[]).map(tr).join(' ')].join(' ').toLowerCase().includes(q)}).map(productCard).join('') || `<p class="empty">${t('noProducts')}</p>`}</div></section>`; }
  const prevScreen32=screenView;
  screenView=function(){ if(appState.screen==='home') return home32(); if(appState.screen==='quick-products') return quickProducts32(); return prevScreen32(); };
  render=function(){ applyPreferences(); if(!appState.token||!appState.data){ root.innerHTML=loginView(); return; } const totals=cartTotals(); const unread=(appState.data.notifications||[]).filter(n=>n.status!=='read').length; const b=appState.data.branch||{}; root.innerHTML=`<div class="app-shell v32-shell" dir="${dir()}"><header class="app-topbar v32-topbar"><div class="v32-title-bubble"><span class="eyebrow">OrderPilot</span><b>${esc32(placeLine32())}</b><small>${esc32(greeting32())}, ${esc32(b.managerName||b.name||'')}</small></div><div class="topbar-actions"><button class="round-btn notify-btn" aria-label="${t('notifications')}" data-action="open-notifications">🔔${unread?`<em>${Math.min(99,unread)}</em>`:''}</button><button class="round-btn settings-btn" aria-label="${t('settings')}" data-screen="settings">⚙</button></div></header><main class="app-main">${screenView()}</main>${totals.lines?`<button class="floating-cart home-floating-cart" data-action="open-cart">🛒 <b>${totals.cartons}</b></button>`:''}<nav class="bottom-nav"><button class="${appState.screen==='home'?'active':''}" data-screen="home">🏠<span>${t('home')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">📦<span>${t('orderHistory')||t('orders')}</span></button><button class="${appState.screen==='returns'?'active':''}" data-screen="returns">↩️<span>${t('returns')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">💬<span>${t('contact')}</span></button></nav></div>`; };
  const prevSettings32=settingsView;
  settingsView=function(){ const b=appState.data?.branch||{}, n=appState.data?.network||{}; return `<section class="flow-card enter settings-card"><h2>${t('appSettings')}</h2><label>${t('language')}<select data-lang-select>${['he','en','ar','ru'].map(l=>`<option value="${l}" ${l===appState.lang?'selected':''}>${l==='he'?'עברית':l==='en'?'English':l==='ar'?'العربية':'Русский'}</option>`).join('')}</select></label><label>${t('theme')}<select data-theme-select><option value="light" ${appState.theme==='light'?'selected':''}>${t('light')}</option><option value="dark" ${appState.theme==='dark'?'selected':''}>${t('dark')}</option></select></label><label>${t('fontSize')}<select data-font-select><option value="small" ${appState.fontSize==='small'?'selected':''}>${t('small')}</option><option value="normal" ${appState.fontSize==='normal'?'selected':''}>${t('normal')}</option><option value="large" ${appState.fontSize==='large'?'selected':''}>${t('large')}</option></select></label><div class="business-details"><h3>${t('businessDetails')}</h3><p><b>${t('network')}:</b> ${esc32(tr(n.name||''))}</p><p><b>${t('branch')}:</b> ${esc32(tr(b.name||''))}</p><p><b>${t('address')}:</b> ${esc32(branchAddress32())}</p><p><b>${t('manager')}:</b> ${esc32(b.managerName||'')}</p><p><b>${t('phone')}:</b> ${esc32(b.phone||'')}</p><p><b>${t('email')}:</b> ${esc32(b.email||'')}</p></div><button class="btn ghost block" data-action="logout">${t('logout')}</button></section>`; };
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
    he:{orderHistory:'היסטוריית הזמנות', home:'ראשי', settings:'הגדרות', notifications:'התראות', newProducts:'מוצרים חדשים', recommendedProducts:'מוצרים מומלצים', deals:'מבצעים', backHome:'חזרה לראשי', contactSentTitle:'הפנייה נשלחה בהצלחה', contactSentBody:'קיבלנו את הפנייה. תשובת החברה תופיע בפעמון ההתראות.', sendAnother:'שליחת פנייה נוספת'},
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
  function home33(){ const banners=banners33(); return `<section class="home-screen v33-home enter"><div class="banner-carousel v33-banners">${banners.map((x,i)=>`<article class="home-banner ${i===0?'active':''}" style="--i:${i}">${x.imageUrl?`<img src="${esc33(x.imageUrl)}" alt="">`:''}<span>${esc33(x.icon||'📣')}</span><div><b>${esc33(tr(x.title||''))}</b><p>${esc33(tr(x.text||''))}</p></div></article>`).join('')}</div><div class="home-actions v33-actions"><button class="action-card primary" data-action="start-new-order"><span>🛒</span><b>${t('newOrder')}</b></button><button class="action-card" data-screen="promotions"><span>🏷️</span><b>${t('deals')}</b></button><button class="action-card" data-quick-mode="new"><span>✨</span><b>${t('newProducts')}</b></button><button class="action-card" data-quick-mode="recommended"><span>✅</span><b>${t('recommendedProducts')}</b></button></div></section>`; }
  function quickProducts33(){ const mode=appState.quickMode||'new'; const rows=(appState.data?.products||[]).filter(p=>{ if(p.active===false) return false; if(mode==='new') return p.newItem || (p.tags||[]).some(x=>String(x).includes('חדש')); if(mode==='recommended') return p.usual || p.trending || Number(p.recommendedQty||0)>0; return p.promotion || (p.tags||[]).some(x=>String(x).includes('מבצע')); }); const q=(appState.search||'').trim().toLowerCase(); const visible=rows.filter(p=>!q || [tr(p.name),p.name,p.barcode,tr(p.category),p.category,tr(p.subcategory),p.subcategory,(p.tags||[]).map(tr).join(' ')].join(' ').toLowerCase().includes(q)); const title=mode==='new'?t('newProducts'):mode==='recommended'?t('recommendedProducts'):t('deals'); return `<section class="catalog-screen quick-products enter"><div class="catalog-head"><button class="text-btn" data-screen="home">${t('backHome')}</button><div><h2>${title}</h2><p>${esc33(place33())}</p></div></div><div class="search-row"><input value="${esc33(appState.search||'')}" data-search placeholder="${t('search')}"/><button class="btn ghost" data-action="scan-barcode">📷</button></div><div class="product-grid">${visible.map(productCard).join('') || `<p class="empty">${t('noProducts')}</p>`}</div></section>`; }
  const prevScreen33=screenView;
  screenView=function(){ if(appState.screen==='home') return home33(); if(appState.screen==='quick-products') return quickProducts33(); return prevScreen33(); };
  render=function(){ applyPreferences(); if(!appState.token||!appState.data){ root.innerHTML=loginView(); return; } const totals=cartTotals(); const unread=(appState.data.notifications||[]).filter(n=>n.status!=='read').length; const b=appState.data.branch||{}; root.innerHTML=`<div class="app-shell v33-shell" dir="${dir()}"><header class="app-topbar v33-topbar"><div class="v33-title"><span class="eyebrow">OrderPilot</span><b>${esc33(place33())}</b><small>${esc33(greeting33())}, ${esc33(b.managerName||b.name||'')}</small></div><div class="topbar-actions"><button class="round-btn notify-btn" aria-label="${t('notifications')}" data-action="open-notifications">🔔${unread?`<em>${Math.min(99,unread)}</em>`:''}</button><button class="round-btn settings-btn" aria-label="${t('settings')}" data-screen="settings">⚙</button></div></header><main class="app-main">${screenView()}</main>${totals.lines?`<button class="floating-cart home-floating-cart" data-action="open-cart">🛒 <b>${totals.cartons}</b></button>`:''}<nav class="bottom-nav"><button class="${appState.screen==='home'?'active':''}" data-screen="home">🏠<span>${t('home')}</span></button><button class="${appState.screen==='orders'?'active':''}" data-screen="orders">📦<span>${t('orderHistory')||t('orders')}</span></button><button class="${appState.screen==='returns'?'active':''}" data-screen="returns">↩️<span>${t('returns')}</span></button><button class="${appState.screen==='contact'?'active':''}" data-screen="contact">💬<span>${t('contact')}</span></button></nav></div>`; };
  document.addEventListener('click', e=>{ const q=e.target.closest('[data-quick-mode]'); if(q){ e.preventDefault(); e.stopPropagation(); appState.quickMode=q.dataset.quickMode; appState.search=''; appState.screen='quick-products'; render(); return; } const cn=e.target.closest('[data-action="contact-new"]'); if(cn){ e.preventDefault(); appState.contactSent=false; render(); } }, true);
  const prevContact33=contactView;
  contactView=function(){ if(appState.contactSent){ return `<section class="flow-card enter contact-success"><h2>${t('contactSentTitle')}</h2><p>${t('contactSentBody')}</p><button class="btn primary block" data-action="contact-new">${t('sendAnother')}</button></section>`; } return prevContact33(); };
  document.addEventListener('submit', e=>{ const f=e.target.closest('form[data-form="contact"]'); if(!f) return; setTimeout(()=>{ appState.contactSent=true; render(); }, 350); }, true);
})();
