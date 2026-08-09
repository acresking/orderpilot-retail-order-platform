'use strict';

const state = {
  features: [],
  defaultFeatureIds: [],
  extraDeliveryTypePrice: { setupPrice: 0, monthlyPrice: 0 },
  selected: new Set(),
  deliveryTypes: [{ title: 'יבש', kind: 'dry', builtin: true }],
  logoDataUrl: null,
  brandColors: { primary: '#2563eb', accent: '#06b6d4' },
};

function updatePreviewSwatch(target, primary, accent) {
  target.style.setProperty('--preview-primary', primary);
  target.style.setProperty('--preview-accent', accent);
}

// Wires a color <input type=color> and its paired hex <input type=text> to stay in sync in both
// directions, and calls onChange(primaryOrAccentHex) whenever either one changes.
function wireColorPair(colorId, hexId, onChange) {
  const colorInput = document.getElementById(colorId);
  const hexInput = document.getElementById(hexId);
  colorInput.addEventListener('input', () => { hexInput.value = colorInput.value; onChange(colorInput.value); });
  hexInput.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hexInput.value)) { colorInput.value = hexInput.value; onChange(hexInput.value); }
  });
}

function setupColorPickers() {
  const preview = document.getElementById('colorPreview');
  wireColorPair('colorPrimary', 'colorPrimaryHex', (v) => { state.brandColors.primary = v; updatePreviewSwatch(preview, state.brandColors.primary, state.brandColors.accent); });
  wireColorPair('colorAccent', 'colorAccentHex', (v) => { state.brandColors.accent = v; updatePreviewSwatch(preview, state.brandColors.primary, state.brandColors.accent); });
  updatePreviewSwatch(preview, state.brandColors.primary, state.brandColors.accent);
}

function money(n) { return `₪${Number(n || 0).toLocaleString('he-IL')}`; }

function scopeLabel(scope) {
  return { app: 'אפליקציה', admin: 'פאנל ניהול', both: 'אפליקציה + פאנל' }[scope] || scope;
}

function renderFeatures() {
  const groups = {};
  for (const f of state.features) {
    if (f.core) continue;
    const key = f.scope;
    (groups[key] = groups[key] || []).push(f);
  }
  const order = ['both', 'app', 'admin'];
  const html = order.filter(k => groups[k]).map(scope => `
    <div class="feature-group">
      <h3>${scopeLabel(scope)}</h3>
      ${groups[scope].map(f => `
        <div class="feature-item">
          <label>
            <input type="checkbox" data-feature="${f.id}" ${state.selected.has(f.id) ? 'checked' : ''}/>
            ${f.label}
          </label>
          <span class="price">₪${f.setupPrice} הקמה · ₪${f.monthlyPrice}/חודש</span>
        </div>
      `).join('')}
    </div>
  `).join('');
  document.getElementById('featureGroups').innerHTML = html;
  document.querySelectorAll('[data-feature]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) state.selected.add(cb.dataset.feature);
      else state.selected.delete(cb.dataset.feature);
      updatePrice();
    });
  });
}

function enabledDeliveryTypeCount() {
  return Math.max(1, state.deliveryTypes.filter(t => t.enabled !== false).length);
}

function updatePrice() {
  const core = state.features.find(f => f.core);
  let setup = core ? core.setupPrice : 0;
  let monthly = core ? core.monthlyPrice : 0;
  for (const f of state.features) {
    if (!f.core && state.selected.has(f.id)) { setup += f.setupPrice; monthly += f.monthlyPrice; }
  }
  const extraTypes = enabledDeliveryTypeCount() - 1;
  setup += extraTypes * state.extraDeliveryTypePrice.setupPrice;
  monthly += extraTypes * state.extraDeliveryTypePrice.monthlyPrice;
  document.getElementById('setupTotal').textContent = money(setup);
  document.getElementById('monthlyTotal').textContent = money(monthly);
  const dtPriceNote = document.getElementById('dtPriceNote');
  if (dtPriceNote) {
    dtPriceNote.textContent = extraTypes > 0
      ? `${extraTypes} סוגים נוספים מעבר לראשון × (₪${state.extraDeliveryTypePrice.setupPrice} הקמה + ₪${state.extraDeliveryTypePrice.monthlyPrice}/חודש) = ₪${extraTypes * state.extraDeliveryTypePrice.setupPrice} הקמה + ₪${extraTypes * state.extraDeliveryTypePrice.monthlyPrice}/חודש`
      : `הסוג הראשון כלול בבסיס. כל סוג נוסף: ₪${state.extraDeliveryTypePrice.setupPrice} הקמה + ₪${state.extraDeliveryTypePrice.monthlyPrice}/חודש`;
  }
}

function renderDeliveryTypes() {
  const html = state.deliveryTypes.map((t, i) => `
    <span class="dt-chip">
      <input type="checkbox" data-dt-index="${i}" ${t.enabled !== false ? 'checked' : ''}/>
      ${t.title}
    </span>
  `).join('');
  document.getElementById('dtRow').innerHTML = html;
  document.querySelectorAll('[data-dt-index]').forEach(cb => {
    cb.addEventListener('change', () => {
      state.deliveryTypes[Number(cb.dataset.dtIndex)].enabled = cb.checked;
      updatePrice();
    });
  });
  updatePrice();
}

async function loadFeatures() {
  const res = await fetch('/api/features');
  const data = await res.json();
  state.features = data.features;
  state.defaultFeatureIds = data.defaultFeatureIds;
  state.extraDeliveryTypePrice = data.extraDeliveryTypePrice || state.extraDeliveryTypePrice;
  renderFeatures();
  updatePrice();
}

function setupDeliveryTypeDefaults() {
  state.deliveryTypes = [
    { title: 'יבש', kind: 'dry', enabled: true },
    { title: 'מצונן', kind: 'cold', enabled: false },
    { title: 'קפוא', kind: 'frozen', enabled: false },
  ];
  renderDeliveryTypes();
}

function setupLogoUpload() {
  const input = document.getElementById('logoInput');
  const preview = document.getElementById('logoPreview');
  const placeholder = document.getElementById('logoPlaceholder');
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.logoDataUrl = reader.result;
      preview.src = reader.result;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  });
}

function setupCustomDeliveryType() {
  document.getElementById('dtCustomAdd').addEventListener('click', () => {
    const input = document.getElementById('dtCustomInput');
    const title = input.value.trim();
    if (!title) return;
    state.deliveryTypes.push({ title, kind: 'other', enabled: true });
    input.value = '';
    renderDeliveryTypes();
  });
}

let lastClients = [];

async function loadClients() {
  const res = await fetch('/api/clients');
  const data = await res.json();
  lastClients = data.clients;
  const rows = data.clients.slice().reverse().map(c => `
    <tr>
      <td><b>${escapeHtml(c.name)}</b><br/><span class="muted">${escapeHtml(c.ownerEmail || '')}</span></td>
      <td class="muted">${new Date(c.createdAt).toLocaleDateString('he-IL')}</td>
      <td>${c.features.length - 1} תוספות</td>
      <td>₪${c.price.setup} + ₪${c.price.monthly}/ח׳</td>
      <td class="muted">${escapeHtml(c.folderName)}</td>
      <td class="muted">${c.currentVersionSent ? `v${escapeHtml(c.currentVersionSent)}` : 'טרם נשלח'}</td>
      <td><button type="button" class="btn ghost" data-open="${c.id}">פתיחת תיקייה</button> <button type="button" class="btn ghost" data-mark-sent="${c.id}">סימון עדכון כנשלח</button> <button type="button" class="btn ghost" data-customize="${c.id}">התאמה אישית</button></td>
    </tr>
  `).join('');
  document.getElementById('clientsBody').innerHTML = rows || '<tr><td colspan="7" class="muted">עדיין לא נוצרו לקוחות</td></tr>';
  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await fetch('/api/open-folder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: btn.dataset.open }) });
    });
  });
  document.querySelectorAll('[data-mark-sent]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const exportsRes = await fetch('/api/exports');
      const exportsData = await exportsRes.json();
      await fetch(`/api/clients/${btn.dataset.markSent}/mark-sent`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: exportsData.platformVersion }) });
      loadClients();
    });
  });
  document.querySelectorAll('[data-customize]').forEach(btn => {
    btn.addEventListener('click', () => openExistingClientForm(btn.dataset.customize));
  });
}

let editingClientId = null;

function openExistingClientForm(id) {
  const client = lastClients.find(c => c.id === id);
  if (!client) return;
  editingClientId = id;
  const primary = client.brandColors?.primary || '#2563eb';
  const accent = client.brandColors?.accent || '#06b6d4';
  document.getElementById('existingClientTitle').textContent = `התאמה אישית — ${client.name}`;
  document.getElementById('existingColorPrimary').value = primary;
  document.getElementById('existingColorPrimaryHex').value = primary;
  document.getElementById('existingColorAccent').value = accent;
  document.getElementById('existingColorAccentHex').value = accent;
  document.getElementById('existingNotesField').value = client.notes || '';
  document.getElementById('existingClientResult').innerHTML = '';
  document.getElementById('existingClientForm').classList.add('open');
  document.getElementById('existingClientForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function setupExistingClientForm() {
  wireColorPair('existingColorPrimary', 'existingColorPrimaryHex', () => {});
  wireColorPair('existingColorAccent', 'existingColorAccentHex', () => {});
  document.getElementById('cancelExistingClientBtn').addEventListener('click', () => {
    editingClientId = null;
    document.getElementById('existingClientForm').classList.remove('open');
  });
  document.getElementById('saveExistingClientBtn').addEventListener('click', async () => {
    if (!editingClientId) return;
    const btn = document.getElementById('saveExistingClientBtn');
    const resultBox = document.getElementById('existingClientResult');
    btn.disabled = true;
    resultBox.innerHTML = '';
    try {
      const res = await fetch(`/api/clients/${editingClientId}/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandColors: { primary: document.getElementById('existingColorPrimaryHex').value, accent: document.getElementById('existingColorAccentHex').value },
          notes: document.getElementById('existingNotesField').value,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        resultBox.innerHTML = `<div class="result-card ok">נשמר בהצלחה.</div>`;
        loadClients();
      } else {
        resultBox.innerHTML = `<div class="result-card fail">${escapeHtml(data.message || 'שגיאה בשמירה')}</div>`;
      }
    } catch (err) {
      resultBox.innerHTML = `<div class="result-card fail">שגיאת רשת: ${escapeHtml(err.message)}</div>`;
    } finally {
      btn.disabled = false;
    }
  });
}

async function loadExports() {
  const res = await fetch('/api/exports');
  const data = await res.json();
  document.getElementById('platformVersionLabel').textContent = `גרסת פלטפורמה נוכחית: v${data.platformVersion}`;
  const rows = data.exports.map(e => `
    <tr>
      <td><b>${escapeHtml(e.fileName)}</b></td>
      <td class="muted">${(e.size / 1024).toFixed(0)} KB</td>
      <td class="muted">${new Date(e.createdAt).toLocaleString('he-IL')}</td>
      <td><a class="btn ghost" href="/api/exports/${encodeURIComponent(e.fileName)}" download>הורדה</a></td>
    </tr>
  `).join('');
  document.getElementById('exportsBody').innerHTML = rows || '<tr><td colspan="4" class="muted">עדיין לא יוצאה אף חבילת עדכון</td></tr>';
}

document.getElementById('exportUpdateBtn').addEventListener('click', async () => {
  const btn = document.getElementById('exportUpdateBtn');
  btn.disabled = true;
  const prevText = btn.textContent;
  btn.textContent = 'מייצא...';
  try {
    await fetch('/api/export-update', { method: 'POST' });
    await loadExports();
  } finally {
    btn.disabled = false;
    btn.textContent = prevText;
  }
});

function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('createBtn');
  btn.disabled = true;
  btn.textContent = 'יוצר... (זה עשוי לקחת דקה)';
  const resultArea = document.getElementById('resultArea');
  resultArea.innerHTML = '';

  const payload = {
    companyName: form.companyName.value.trim(),
    contactEmail: form.contactEmail.value.trim(),
    contactPhone: form.contactPhone.value.trim(),
    ownerEmail: form.ownerEmail.value.trim(),
    ownerPassword: form.ownerPassword.value,
    features: [...state.selected],
    deliveryTypes: state.deliveryTypes.filter(t => t.enabled !== false).map(t => ({ title: t.title, kind: t.kind })),
    logoDataUrl: state.logoDataUrl,
    brandColors: state.brandColors,
    notes: form.notes.value,
  };

  try {
    const res = await fetch('/api/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.ok) {
      resultArea.innerHTML = `<div class="result-card ok">נוצר בהצלחה: ${escapeHtml(data.client.name)} · תיקייה: ${escapeHtml(data.folderPath)}<br/>עלות: ₪${data.client.price.setup} הקמה + ₪${data.client.price.monthly}/חודש (לפני מע״מ)</div>`;
      form.reset();
      state.selected = new Set();
      state.logoDataUrl = null;
      state.brandColors = { primary: '#2563eb', accent: '#06b6d4' };
      document.getElementById('colorPrimary').value = state.brandColors.primary;
      document.getElementById('colorPrimaryHex').value = state.brandColors.primary;
      document.getElementById('colorAccent').value = state.brandColors.accent;
      document.getElementById('colorAccentHex').value = state.brandColors.accent;
      updatePreviewSwatch(document.getElementById('colorPreview'), state.brandColors.primary, state.brandColors.accent);
      document.getElementById('logoPreview').style.display = 'none';
      document.getElementById('logoPlaceholder').style.display = 'block';
      renderFeatures();
      setupDeliveryTypeDefaults();
      updatePrice();
      loadClients();
    } else {
      resultArea.innerHTML = `<div class="result-card fail">שגיאה ביצירת הלקוח (${escapeHtml(data.message || data.error || '')})<pre>${escapeHtml((data.log || []).join('\n'))}</pre></div>`;
    }
  } catch (err) {
    resultArea.innerHTML = `<div class="result-card fail">שגיאת רשת: ${escapeHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = 'יצירת חבילה ללקוח';
  }
}

document.getElementById('createForm').addEventListener('submit', handleSubmit);
setupDeliveryTypeDefaults();
setupLogoUpload();
setupCustomDeliveryType();
setupColorPickers();
setupExistingClientForm();
loadFeatures();
loadClients();
loadExports();
