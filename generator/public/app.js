'use strict';

const state = {
  features: [],
  defaultFeatureIds: [],
  extraDeliveryTypePrice: { setupPrice: 0, monthlyPrice: 0 },
  selected: new Set(),
  deliveryTypes: [{ title: 'יבש', kind: 'dry', builtin: true }],
  logoDataUrl: null,
  palette: ['#2563eb'],
};

function updatePreviewSwatch(target, palette) {
  target.style.setProperty('--preview-primary', palette[0] || '#2563eb');
  target.style.setProperty('--preview-accent', palette[1] || palette[0] || '#06b6d4');
  target.style.setProperty('--preview-tertiary', palette[2] || palette[0] || '#a78bfa');
}

// Renders a palette (array of hex strings, any length) as a row of editable swatches — a color
// picker + hex text field + remove button each — into `containerEl`. Mutates `palette` in place
// as the user edits, and calls `onChange` after every add/remove/edit so callers can refresh
// price/preview. No fixed limit on how many colors a client can have: some brands are one color,
// others are four or more, and the UI has to support both without assuming a count.
function renderPalette(containerEl, palette, onChange) {
  containerEl.innerHTML = palette.length ? palette.map((hex, i) => `
    <span class="palette-swatch">
      <input type="color" data-idx="${i}" class="palette-color" value="${hex}" />
      <input type="text" data-idx="${i}" class="palette-hex" value="${hex}" maxlength="7" />
      <button type="button" class="palette-remove" data-idx="${i}" title="הסרה">×</button>
    </span>
  `).join('') : '<span class="palette-empty">אין עדיין צבעים — אפשר להעלות לוגו או להוסיף ידנית.</span>';

  containerEl.querySelectorAll('.palette-color').forEach(el => {
    el.addEventListener('input', () => {
      const i = Number(el.dataset.idx);
      palette[i] = el.value;
      const hexTwin = containerEl.querySelector(`.palette-hex[data-idx="${i}"]`);
      if (hexTwin) hexTwin.value = el.value;
      onChange();
    });
  });
  containerEl.querySelectorAll('.palette-hex').forEach(el => {
    el.addEventListener('input', () => {
      if (!/^#[0-9a-fA-F]{6}$/.test(el.value)) return;
      const i = Number(el.dataset.idx);
      palette[i] = el.value;
      const colorTwin = containerEl.querySelector(`.palette-color[data-idx="${i}"]`);
      if (colorTwin) colorTwin.value = el.value;
      onChange();
    });
  });
  containerEl.querySelectorAll('.palette-remove').forEach(el => {
    el.addEventListener('click', () => {
      palette.splice(Number(el.dataset.idx), 1);
      renderPalette(containerEl, palette, onChange);
      onChange();
    });
  });
}

// Dominant-color extraction from an uploaded logo, entirely client-side (Canvas pixel sampling —
// no image library). Downscales the image, buckets pixels into a reduced color space, drops
// near-transparent/near-white/near-black pixels (usually background, not brand color), then picks
// the most frequent buckets while enforcing a minimum distance between picks so the result is a
// a few genuinely distinct colors rather than near-duplicate shades of the same one.
function extractDominantColors(imageDataUrl, count = 4) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = 80;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        const step = 24;
        const buckets = new Map();
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 200) continue;
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          if (min > 235 || max < 20) continue; // near-white / near-black background
          const key = [Math.round(r / step) * step, Math.round(g / step) * step, Math.round(b / step) * step].join(',');
          buckets.set(key, (buckets.get(key) || 0) + 1);
        }
        const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k.split(',').map(Number));
        const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
        const picked = [];
        for (const c of sorted) {
          if (picked.length >= count) break;
          if (picked.some(p => dist(p, c) < 60)) continue;
          picked.push(c);
        }
        const toHex = v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
        resolve(picked.map(([r, g, b]) => `#${toHex(r)}${toHex(g)}${toHex(b)}`));
      } catch (err) { resolve([]); }
    };
    img.onerror = () => resolve([]);
    img.src = imageDataUrl;
  });
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

function setupPalette() {
  const container = document.getElementById('paletteRow');
  const preview = document.getElementById('colorPreview');
  const onChange = () => updatePreviewSwatch(preview, state.palette);
  renderPalette(container, state.palette, onChange);
  onChange();
  document.getElementById('paletteAddBtn').addEventListener('click', () => {
    state.palette.push('#64748b');
    renderPalette(container, state.palette, onChange);
    onChange();
  });
}

function resetPalette(colors) {
  const container = document.getElementById('paletteRow');
  const preview = document.getElementById('colorPreview');
  state.palette = colors;
  renderPalette(container, state.palette, () => updatePreviewSwatch(preview, state.palette));
  updatePreviewSwatch(preview, state.palette);
}

function setupLogoUpload() {
  const input = document.getElementById('logoInput');
  const preview = document.getElementById('logoPreview');
  const placeholder = document.getElementById('logoPlaceholder');
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      state.logoDataUrl = reader.result;
      preview.src = reader.result;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
      const extracted = await extractDominantColors(reader.result, 4);
      if (extracted.length) resetPalette(extracted);
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
let existingPalette = [];

function openExistingClientForm(id) {
  const client = lastClients.find(c => c.id === id);
  if (!client) return;
  editingClientId = id;
  existingPalette = Array.isArray(client.brandColors?.palette) && client.brandColors.palette.length
    ? [...client.brandColors.palette]
    : ['#2563eb'];
  document.getElementById('existingClientTitle').textContent = `התאמה אישית — ${client.name}`;
  document.getElementById('existingLogoInput').value = '';
  renderPalette(document.getElementById('existingPaletteRow'), existingPalette, () => {});
  document.getElementById('existingNotesField').value = client.notes || '';
  document.getElementById('existingClientResult').innerHTML = '';
  document.getElementById('existingClientForm').classList.add('open');
  document.getElementById('existingClientForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function setupExistingClientForm() {
  document.getElementById('existingPaletteAddBtn').addEventListener('click', () => {
    existingPalette.push('#64748b');
    renderPalette(document.getElementById('existingPaletteRow'), existingPalette, () => {});
  });
  document.getElementById('existingLogoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const extracted = await extractDominantColors(reader.result, 4);
      if (extracted.length) {
        existingPalette = extracted;
        renderPalette(document.getElementById('existingPaletteRow'), existingPalette, () => {});
      }
    };
    reader.readAsDataURL(file);
  });
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
          brandColors: { palette: existingPalette },
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
    brandColors: { palette: state.palette.filter(c => /^#[0-9a-fA-F]{6}$/.test(c)) },
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
      resetPalette(['#2563eb']);
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
setupPalette();
setupExistingClientForm();
loadFeatures();
loadClients();
loadExports();
