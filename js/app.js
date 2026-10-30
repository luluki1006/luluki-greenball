// 花草养护助手 —— 前端主程序
import { plants as PStore, waterings as WStore, checkins as CStore, settings as SStore } from './db.js';
import { PLANTS, WATER_LEVEL, MONTHLY_CALENDAR, findRule } from './data.js';
import { getWeather, vision, fileToDataURL, extractJSON } from './api.js';
import { planAll, computeWatering, seasonOf, SEASON_LABEL, todayStr, addDays, diffDays } from './engine.js';

const state = {
  settings: { location: '', dashscopeKey: '' },
  weather: null,          // { now, daily }
  weatherLoadedAt: 0,
  route: 'home',
  routeParam: null,
};

const WEATHER_TTL = 3 * 3600 * 1000; // 天气缓存 3 小时

// ---------------- 工具 ----------------
const $ = (sel, root = document) => root.querySelector(sel);
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmtDate(iso) {
  if (!iso) return '—';
  return iso.slice(0, 10);
}
function levelBadge(level) {
  const lv = WATER_LEVEL[level] || WATER_LEVEL.mid;
  return `<span class="badge" style="background:${lv.color}">${lv.label}</span>`;
}
let toastTimer = null;
function toast(msg, ms = 2200) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}
let loadingEl = null;
function loading(on, text = '处理中…') {
  if (on) {
    if (!loadingEl) {
      loadingEl = document.createElement('div');
      loadingEl.className = 'overlay';
      loadingEl.innerHTML = '<div class="spinner"></div><p></p>';
      document.body.appendChild(loadingEl);
    }
    loadingEl.querySelector('p').textContent = text;
    loadingEl.style.display = 'flex';
  } else if (loadingEl) {
    loadingEl.style.display = 'none';
  }
}
// 图片压缩，减小上传体积
function resizeImage(dataURL, maxDim = 1024, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const r = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * r); height = Math.round(height * r);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataURL);
    img.src = dataURL;
  });
}

// ---------------- 初始化 ----------------
async function init() {
  state.settings.location = (await SStore.get('location')) || '';
  state.settings.dashscopeKey = (await SStore.get('dashscopeKey')) || '';
  const wc = await SStore.get('weatherCache');
  if (wc && Date.now() - wc.at < WEATHER_TTL) { state.weather = wc.data; state.weatherLoadedAt = wc.at; }

  // 注册 Service Worker（PWA 离线 + 通知）
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // 路由：tab 点击
  document.querySelectorAll('.tab').forEach((b) => {
    b.addEventListener('click', () => navigate(b.dataset.route));
  });
  $('#sync-btn').addEventListener('click', () => refreshWeather(true));

  // 视图事件委托
  const view = $('#view');
  view.addEventListener('click', onViewClick);
  view.addEventListener('submit', onViewSubmit);
  view.addEventListener('change', onViewChange);

  if (state.settings.location) refreshWeather(false);
  navigate('home');
}

// ---------------- 路由 ----------------
async function navigate(route, param) {
  state.route = route;
  state.routeParam = param;
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.route === route));
  const view = $('#view');
  if (route === 'home') view.innerHTML = await renderHome();
  else if (route === 'plants') view.innerHTML = await renderPlants();
  else if (route === 'add') view.innerHTML = renderAdd();
  else if (route === 'calendar') view.innerHTML = renderCalendar();
  else if (route === 'settings') view.innerHTML = await renderSettings();
  else if (route === 'plant') view.innerHTML = await renderPlantDetail(param);
  window.scrollTo(0, 0);
}

// ---------------- 天气 ----------------
async function refreshWeather(force) {
  if (!state.settings.location) { if (force) toast('请先在“设置”里填写所在地'); return; }
  if (!force && state.weather && Date.now() - state.weatherLoadedAt < WEATHER_TTL) return;
  loading(true, '获取天气中…');
  try {
    const data = await getWeather(state.settings.location);
    state.weather = data;
    state.weatherLoadedAt = Date.now();
    await SStore.set('weatherCache', { at: state.weatherLoadedAt, data });
    if (state.route === 'home') $('#view').innerHTML = await renderHome();
  } catch (e) {
    toast('天气获取失败：' + e.message);
  } finally {
    loading(false);
  }
}

// ---------------- 视图：首页 ----------------
async function renderHome() {
  const all = await PStore.all();
  const planned = planAll(all, state.weather);
  const due = planned.filter((x) => x.plan.due);
  const soon = planned.filter((x) => !x.plan.due && x.plan.daysLeft <= 7);

  const w = state.weather && state.weather.now;
  const weatherCard = w
    ? `<div class="card weather">
         <div class="weather__main">${esc(w.text)} <b>${w.temp}℃</b></div>
         <div class="weather__sub">湿度 ${w.humidity}% · 体感 ${w.feelsLike ?? '—'}℃</div>
       </div>`
    : `<div class="card weather weather--empty">未获取天气 · <a data-action="geo">📍 点此开启定位</a></div>`;

  const dueHtml = due.length
    ? due.map(({ plant, plan }) => `
      <div class="card plant-row">
        <div class="plant-row__info">
          <div class="plant-row__name">${esc(plant.name)} ${levelBadge(plant.waterLevel)}</div>
          <div class="plant-row__meta">该浇水啦${plan.reasons.length ? ' · ' + esc(plan.reasons[0]) : ''}</div>
        </div>
        <button class="btn btn--primary" data-action="water" data-id="${plant.id}">已浇水</button>
      </div>`).join('')
    : `<div class="empty">🎉 今天没有植物需要浇水</div>`;

  const soonHtml = soon.length
    ? `<h3 class="section">接下来 7 天</h3>` + soon.map(({ plant, plan }) => `
      <div class="card plant-row">
        <div class="plant-row__info">
          <div class="plant-row__name">${esc(plant.name)}</div>
          <div class="plant-row__meta">${plan.daysLeft} 天后 · ${fmtDate(plan.nextDate)}</div>
        </div>
        <button class="btn btn--ghost" data-action="plant" data-id="${plant.id}">查看</button>
      </div>`).join('')
    : '';

  return `
    ${weatherCard}
    <div class="stats">
      <div class="stat"><b>${all.length}</b><span>我的植物</span></div>
      <div class="stat stat--warn"><b>${due.length}</b><span>今日待浇</span></div>
    </div>
    <h3 class="section">今日需浇水</h3>
    ${dueHtml}
    ${soonHtml}
    ${all.length === 0 ? `<div class="empty">还没有植物，点底部“➕ 添加”开始吧</div>` : ''}
  `;
}

// ---------------- 视图：我的植物 ----------------
async function renderPlants() {
  const all = await PStore.all();
  if (!all.length) return `<div class="empty">还没有植物<br/>点底部“➕ 添加”通过拍照或订单截图自动录入</div>`;
  const planned = planAll(all, state.weather);
  return `
    <div class="search"><input id="plant-search" placeholder="搜索植物名称…" /></div>
    <div id="plant-list">
      ${planned.map(({ plant, plan }) => `
        <div class="card plant-card" data-action="plant" data-id="${plant.id}">
          <div class="plant-card__top">
            <span class="plant-card__name">${esc(plant.name)}</span>
            ${levelBadge(plant.waterLevel)}
          </div>
          <div class="plant-card__meta">
            下次浇水 ${fmtDate(plan.nextDate)} · ${plan.due ? '<b class="warn">已到期</b>' : plan.daysLeft + ' 天后'}
          </div>
          <div class="plant-card__meta">上次浇水 ${fmtDate(plant.lastWatered || plant.plantedDate || '—')}</div>
        </div>`).join('')}
    </div>`;
}

// ---------------- 视图：添加植物 ----------------
function renderAdd() {
  const datalist = PLANTS.map((p) => `<option value="${esc(p.name)}">`).join('');
  return `
    <div class="add-tabs">
      <button class="chip active" data-action="chip" data-mode="photo">📷 拍照识别</button>
      <button class="chip" data-action="chip" data-mode="order">🧾 订单截图</button>
      <button class="chip" data-action="chip" data-mode="manual">✍️ 手动</button>
    </div>

    <div class="add-panel" data-panel="photo">
      <p class="hint">拍一张植物的照片，自动识别种类并加入管理目录。</p>
      <label class="upload">
        <input type="file" accept="image/*" capture="environment" data-action="filePlant" hidden />
        <span>📷 拍照 / 选图识别</span>
      </label>
      <div id="photo-result"></div>
    </div>

    <div class="add-panel" data-panel="order" hidden>
      <p class="hint">上传电商订单截图，自动提取里面买的花草并批量入库。</p>
      <label class="upload">
        <input type="file" accept="image/*" data-action="fileOrder" hidden />
        <span>🧾 选择订单截图</span>
      </label>
      <div id="order-result"></div>
    </div>

    <div class="add-panel" data-panel="manual" hidden>
      <form data-action="manual-add">
        <label>名称（可输入或下拉选择常见植物）
          <input list="plant-names" name="name" required placeholder="例如：绿萝" />
          <datalist id="plant-names">${datalist}</datalist>
        </label>
        <label>喜水程度
          <select name="waterLevel">
            <option value="high">喜水（浇勤）</option>
            <option value="mid" selected>中等</option>
            <option value="low">耐旱（少浇）</option>
          </select>
        </label>
        <label>基础浇水间隔（天）
          <input type="number" name="baseDays" min="1" max="30" value="5" />
        </label>
        <label>光照需求
          <input name="light" placeholder="例如：散射光" />
        </label>
        <label>备注
          <input name="note" placeholder="选填" />
        </label>
        <button class="btn btn--primary" type="submit">加入目录</button>
      </form>
    </div>`;
}

// ---------------- 视图：植物详情 ----------------
async function renderPlantDetail(id) {
  const plant = await PStore.get(id);
  if (!plant) return `<div class="empty">植物不存在</div>`;
  const rule = findRule(plant.name);
  const plan = computeWatering(plant, state.weather);
  const season = seasonOf();
  const careText = rule ? rule.season[season] : (plant.note || '暂无养护建议');
  const tips = rule ? rule.tips : '';

  const checks = (await CStore.byPlant(id)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const timeline = checks.length
    ? checks.map((c) => `
      <div class="card tl">
        <div class="tl__head"><span class="tl__type">${typeIcon(c.type)} ${typeLabel(c.type)}</span><span class="tl__date">${fmtDate(c.date)}</span></div>
        ${c.text ? `<div class="tl__text">${esc(c.text)}</div>` : ''}
        ${c.photo ? `<img class="tl__photo" src="${c.photo}" alt="记录" />` : ''}
      </div>`).join('')
    : `<div class="empty">还没有打卡记录</div>`;

  return `
    <div class="detail-head">
      <button class="btn btn--ghost" data-action="back">← 返回</button>
      <button class="btn btn--ghost" data-action="delete" data-id="${plant.id}">删除</button>
    </div>
    <div id="diag-result"></div>
    <div class="card">
      <div class="plant-card__top"><span class="plant-card__name">${esc(plant.name)}</span>${levelBadge(plant.waterLevel)}</div>
      <div class="kv"><span>光照</span><b>${esc(plant.light || (rule && rule.light) || '—')}</b></div>
      <div class="kv"><span>基础间隔</span><b>${plant.baseDays || (rule && WATER_LEVEL[plant.waterLevel].baseDays)} 天</b></div>
      <div class="kv"><span>下次浇水</span><b class="${plan.due ? 'warn' : ''}">${fmtDate(plan.nextDate)}（${plan.due ? '已到期' : plan.daysLeft + ' 天后'}）</b></div>
      <div class="kv"><span>上次浇水</span><b>${fmtDate(plant.lastWatered || plant.plantedDate || '—')}</b></div>
      <div class="reasons">${plan.reasons.map((r) => `<span class="tag">${esc(r)}</span>`).join('') || '<span class="tag">天气温和，按常规节奏</span>'}</div>
    </div>

    <div class="card">
      <h4>${SEASON_LABEL[season]}季养护</h4>
      <p class="care">${esc(careText)}</p>
      ${tips ? `<p class="tip">💡 ${esc(tips)}</p>` : ''}
    </div>

    <div class="detail-actions">
      <button class="btn btn--primary" data-action="water" data-id="${plant.id}">💧 浇水</button>
      <button class="btn btn--accent" data-action="addCheckin" data-id="${plant.id}">📸 打卡</button>
      <button class="btn btn--warn" data-action="diagnose" data-id="${plant.id}">🔍 诊断</button>
    </div>

    <h3 class="section">成长时间线</h3>
    <div id="checkin-result"></div>
    ${timeline}
  `;
}

// ---------------- 视图：养护历 ----------------
function renderCalendar() {
  const month = new Date().getMonth() + 1;
  const cur = MONTHLY_CALENDAR.find((m) => m.month === month);
  const others = MONTHLY_CALENDAR.filter((m) => m.month !== month);
  return `
    <div class="card month-card">
      <h3>${esc(cur.title)}</h3>
      <ul class="tasks">${cur.tasks.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </div>
    <h3 class="section">全年养护历</h3>
    ${others.map((m) => `
      <details class="card month-item">
        <summary>${esc(m.title)}</summary>
        <ul class="tasks">${m.tasks.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </details>`).join('')}
  `;
}

// ---------------- 视图：设置 ----------------
async function renderSettings() {
  const notifyOn = (await SStore.get('notify')) || false;
  const w = state.weather && state.weather.now;
  return `
    <div class="card">
      <h4>📍 所在地</h4>
      <p class="hint">获取实时天气、自动调整浇水频率。<b>无需任何天气 Key</b>：点「定位」用手机 GPS，或填城市名（如 北京）。</p>
      <div class="row">
        <input id="loc-input" value="${esc(state.settings.location)}" placeholder="例如 116.40,39.90 或 北京" />
        <button class="btn btn--ghost" data-action="geo">定位</button>
      </div>
      <button class="btn btn--primary" data-action="save-loc">保存所在地</button>
      ${w ? `<p class="hint">当前天气：${esc(w.text)} ${w.temp}℃</p>` : ''}
    </div>

    <div class="card">
      <h4>🔑 通义千问 VL Key（仅存本机）</h4>
      <p class="hint">天气功能已免 Key，无需配置。此 Key 仅用于「拍照识别植物」和「病虫害诊断」。不填也能手动添加与打卡。密钥只存在你手机/电脑浏览器里，不会上传。</p>
      <label>通义千问 VL Key
        <input id="ds-input" value="${esc(state.settings.dashscopeKey)}" placeholder="sk- 开头" />
      </label>
      <button class="btn btn--primary" data-action="save-keys">保存密钥</button>
    </div>

    <div class="card">
      <h4>🔔 浇水提醒</h4>
      <p class="hint">开启后，打开 App 时会提醒今天该浇水的植物（iPhone 需“添加到主屏幕”后才有系统通知）。</p>
      <button class="btn ${notifyOn ? 'btn--primary' : 'btn--ghost'}" data-action="toggle-notify">${notifyOn ? '已开启' : '开启提醒'}</button>
    </div>

    <div class="card">
      <h4>💾 数据备份</h4>
      <p class="hint">导出全部数据为一个 JSON 文件，换设备或重装时可导入恢复。</p>
      <button class="btn btn--ghost" data-action="export">导出 JSON</button>
    </div>

    <div class="card about">
      <h4>关于</h4>
      <p>花草养护助手 v0.1 · 数据全部本地存储。</p>
      <p>天气：Open-Meteo（免 Key）· 识别：通义千问 VL</p>
    </div>
  `;
}

// ---------------- 事件：点击 ----------------
async function onViewClick(e) {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const action = t.dataset.action;
  const id = t.dataset.id;

  if (action === 'goto-settings') return navigate('settings');
  if (action === 'back') return navigate('plants');

  if (action === 'water') {
    await markWatered(id);
    return;
  }
  if (action === 'plant') return navigate('plant', id);
  if (action === 'delete') {
    if (confirm('确定删除该植物及其所有记录？')) {
      await PStore.remove(id);
      toast('已删除');
      navigate('plants');
    }
    return;
  }
  if (action === 'addCheckin') return openCheckin(id);
  if (action === 'diagnose') return openDiagnose(id);

  if (action === 'geo') return doGeolocation();
  if (action === 'save-loc') {
    state.settings.location = $('#loc-input').value.trim();
    await SStore.set('location', state.settings.location);
    toast('已保存');
    refreshWeather(true);
    return;
  }
  if (action === 'save-keys') {
    state.settings.dashscopeKey = $('#ds-input').value.trim();
    await SStore.set('dashscopeKey', state.settings.dashscopeKey);
    toast('密钥已保存（仅本机）');
    return;
  }
  if (action === 'toggle-notify') return toggleNotify();
  if (action === 'export') return exportData();

  // add 页切换面板
  if (t.classList.contains('chip')) {
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === t));
    document.querySelectorAll('.add-panel').forEach((p) => { p.hidden = p.dataset.panel !== t.dataset.mode; });
  }
}

// ---------------- 事件：表单提交 ----------------
async function onViewSubmit(e) {
  const form = e.target.closest('form[data-action]');
  if (!form) return;
  e.preventDefault();
  if (form.dataset.action === 'manual-add') {
    const fd = new FormData(form);
    const name = fd.get('name').trim();
    if (!name) return toast('请填写名称');
    const rule = findRule(name);
    const plant = {
      name,
      waterLevel: fd.get('waterLevel'),
      baseDays: Number(fd.get('baseDays')) || WATER_LEVEL[fd.get('waterLevel')].baseDays,
      light: fd.get('light') || (rule && rule.light) || '',
      note: fd.get('note') || '',
      source: 'manual',
      plantedDate: todayStr(),
      lastWatered: todayStr(),
    };
    await PStore.add(plant);
    toast('已加入目录');
    navigate('plants');
  }
}

// ---------------- 事件：文件选择 ----------------
async function onViewChange(e) {
  const inp = e.target.closest('input[data-action]');
  if (!inp) return;
  const file = inp.files && inp.files[0];
  if (!file) return;
  const dataURL = await resizeImage(await fileToDataURL(file));
  if (inp.dataset.action === 'filePlant') return handlePlantPhoto(dataURL);
  if (inp.dataset.action === 'fileOrder') return handleOrderPhoto(dataURL);
  if (inp.dataset.action === 'fileCheckin') return handleCheckinPhoto(dataURL);
}

// ---------------- 业务逻辑 ----------------
async function markWatered(id) {
  const plant = await PStore.get(id);
  if (!plant) return;
  const today = todayStr();
  await WStore.add({ plantId: id, date: today, note: 'App 标记' });
  plant.lastWatered = today;
  await PStore.update(plant);
  toast('已记录浇水 💧');
  if (state.route === 'home') $('#view').innerHTML = await renderHome();
  else if (state.route === 'plant') $('#view').innerHTML = await renderPlantDetail(id);
  else if (state.route === 'plants') $('#view').innerHTML = await renderPlants();
}

const PLANT_PROMPT = '请识别图片中的植物种类。只返回 JSON，不要任何解释或 Markdown：{"name":"最常见的植物名称","waterLevel":"高/中/低","light":"光照需求（如 散射光/全日照）","confidence":0到1的小数}。若无法确定具体种类，请给出最可能的常见名。';
const ORDER_PROMPT = '这是一张购物订单截图。请提取其中购买的植物/花草/绿植/种子/盆栽商品。只返回 JSON 数组，不要解释或 Markdown，格式：[{"name":"商品名","quantity":数量(整数),"type":"花草/种子/盆栽/其他"}]。若没有任何植物类商品，返回 []。';
const DIAG_PROMPT = '这是一盆（或一株）植物的照片，请判断它的健康状态、是否有病虫害或养护问题。只返回 JSON，不要任何解释或 Markdown：{"healthy":true或false,"problem":"问题名称，如 叶斑病/红蜘蛛/蚧壳虫/缺水/积水烂根/晒伤/肥害/正常等","cause":"可能原因","solution":"处理建议","severity":"轻/中/重（健康则为空）"}。若看起来健康，healthy 为 true，problem 为 正常。';

async function handlePlantPhoto(dataURL) {
  if (!state.settings.dashscopeKey) { toast('请先在设置里填写通义千问 VL Key'); return; }
  loading(true, '识别植物中…');
  try {
    const text = await vision(dataURL, PLANT_PROMPT, state.settings.dashscopeKey);
    const j = extractJSON(text);
    if (!j || !j.name) throw new Error('未能识别，请换个角度再拍');
    const rule = findRule(j.name);
    const level = (j.waterLevel === '高' || j.waterLevel === 'high') ? 'high' : (j.waterLevel === '低' || j.waterLevel === 'low') ? 'low' : 'mid';
    const plant = {
      name: j.name,
      waterLevel: level,
      baseDays: rule ? rule.baseDays : WATER_LEVEL[level].baseDays,
      light: j.light || (rule && rule.light) || '',
      note: rule ? rule.tips : '',
      source: 'photo',
      plantedDate: todayStr(),
      lastWatered: todayStr(),
    };
    await PStore.add(plant);
    $('#photo-result').innerHTML = `<div class="card ok">✅ 已识别并加入：<b>${esc(j.name)}</b> ${levelBadge(level)}<br/><span class="hint">置信度 ${(j.confidence || 0)}</span></div>`;
    toast('已添加 ' + j.name);
  } catch (err) {
    $('#photo-result').innerHTML = `<div class="card err">识别失败：${esc(err.message)}</div>`;
  } finally {
    loading(false);
  }
}

async function handleOrderPhoto(dataURL) {
  if (!state.settings.dashscopeKey) { toast('请先在设置里填写通义千问 VL Key'); return; }
  loading(true, '解析订单中…');
  try {
    const text = await vision(dataURL, ORDER_PROMPT, state.settings.dashscopeKey);
    const arr = extractJSON(text);
    if (!Array.isArray(arr) || !arr.length) throw new Error('没找到植物类商品，或截图不清晰');
    const rows = arr.map((it, i) => {
      const rule = findRule(it.name);
      const level = rule ? rule.waterLevel : 'mid';
      return `<label class="order-row"><input type="checkbox" data-i="${i}" checked />
        <span>${esc(it.name)} ×${it.quantity || 1} <small>${esc(it.type || '')}</small> ${levelBadge(level)}</span></label>`;
    }).join('');
    $('#order-result').innerHTML = `<div class="card"><p>识别到以下植物，勾选要入库的：</p>${rows}
      <button class="btn btn--primary" data-action="import-order" data-json='${esc(JSON.stringify(arr))}'>导入选中</button></div>`;
  } catch (err) {
    $('#order-result').innerHTML = `<div class="card err">解析失败：${esc(err.message)}</div>`;
  } finally {
    loading(false);
  }
}

async function doGeolocation() {
  if (!navigator.geolocation) return toast('当前环境不支持定位');
  loading(true, '定位中…');
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { longitude, latitude } = pos.coords;
      state.settings.location = `${longitude.toFixed(2)},${latitude.toFixed(2)}`;
      await SStore.set('location', state.settings.location);
      if ($('#loc-input')) $('#loc-input').value = state.settings.location;
      loading(false);
      toast('已定位');
      refreshWeather(true);
    },
    (err) => { loading(false); toast('定位失败：' + err.message); },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

async function toggleNotify() {
  let granted = (await SStore.get('notify')) || false;
  if (!granted) {
    if ('Notification' in window) {
      const p = await Notification.requestPermission();
      if (p !== 'granted') return toast('未授权通知权限');
    }
    granted = true;
    await SStore.set('notify', true);
    toast('已开启提醒');
  } else {
    await SStore.set('notify', false);
    toast('已关闭提醒');
  }
  $('#view').innerHTML = await renderSettings();
}

async function maybeNotifyDue() {
  const on = await SStore.get('notify');
  if (!on || !('Notification' in window) || Notification.permission !== 'granted') return;
  const all = await PStore.all();
  const due = planAll(all, state.weather).filter((x) => x.plan.due);
  if (due.length) {
    new Notification('💧 今日浇水提醒', { body: `有 ${due.length} 盆植物该浇水了：${due.map((d) => d.plant.name).join('、')}` });
  }
}

async function exportData() {
  const data = {
    plants: await PStore.all(),
    waterings: await WStore.all(),
    checkins: await CStore.all(),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'plantcare-backup-' + todayStr() + '.json';
  a.click();
  toast('已导出');
}

// 打卡弹窗（简单内联）
async function openCheckin(id) {
  const text = prompt('记录一下（选填，如：长了新叶 / 施了肥 / 状态良好）：', '');
  if (text === null) return;
  loading(true, '保存中…');
  try {
    let photo = '';
    // 可选拍照
    const want = confirm('是否同时拍一张照片记录？（确定=拍照，取消=仅文字）');
    if (want) photo = await pickPhoto();
    await CStore.add({ plantId: id, type: 'growth', text: text || '', photo, date: new Date().toISOString() });
    toast('已打卡 📸');
    $('#view').innerHTML = await renderPlantDetail(id);
  } finally {
    loading(false);
  }
}

// 打开相机/相册选一张图，返回压缩后的 dataURL
function pickPhoto() {
  return new Promise((resolve) => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*'; inp.capture = 'environment';
    inp.onchange = async () => {
      if (inp.files[0]) resolve(await resizeImage(await fileToDataURL(inp.files[0])));
      else resolve('');
    };
    inp.click();
  });
}

// 拍照诊断病虫害 / 健康状态
async function openDiagnose(id) {
  if (!state.settings.dashscopeKey) { toast('请先在设置里填写通义千问 VL Key'); return; }
  const dataURL = await pickPhoto();
  if (!dataURL) return;
  loading(true, '诊断中…');
  try {
    const text = await vision(dataURL, DIAG_PROMPT, state.settings.dashscopeKey);
    const j = extractJSON(text);
    const healthy = j ? !!j.healthy : false;
    const problem = (j && j.problem) || '未知';
    const cause = (j && j.cause) || '';
    const solution = (j && j.solution) || '';
    const severity = (j && j.severity) || '';
    const summary = (healthy ? '✅ 看起来健康' : '⚠️ 发现问题：' + problem + (severity ? '（' + severity + '）' : ''))
      + (cause ? '\n原因：' + cause : '') + (solution ? '\n建议：' + solution : '');
    await CStore.add({ plantId: id, type: 'diagnosis', text: summary, photo: dataURL, date: new Date().toISOString() });
    const box = document.getElementById('diag-result');
    if (box) {
      box.innerHTML = `<div class="card ${healthy ? 'ok' : 'diag'}">
        <h4>${healthy ? '✅ 状态健康' : '⚠️ ' + esc(problem) + (severity ? ' · ' + esc(severity) : '')}</h4>
        ${cause ? `<p class="care"><b>可能原因：</b>${esc(cause)}</p>` : ''}
        ${solution ? `<p class="tip">💡 <b>处理建议：</b>${esc(solution)}</p>` : ''}
        <p class="hint">已记入成长时间线</p>
      </div>`;
    }
    toast(healthy ? '诊断：健康' : '发现问题：' + problem);
  } catch (err) {
    const box = document.getElementById('diag-result');
    if (box) box.innerHTML = `<div class="card err">诊断失败：${esc(err.message)}</div>`;
  } finally {
    loading(false);
  }
}

function typeIcon(t) { return ({ water: '💧', fertilize: '🌱', growth: '📸', diagnosis: '🔍', note: '📝', other: '•' })[t] || '•'; }
function typeLabel(t) { return ({ water: '浇水', fertilize: '施肥', growth: '打卡', diagnosis: '诊断', note: '笔记', other: '其他' })[t] || '记录'; }

// 植物搜索（plants 页）
document.addEventListener('input', (e) => {
  if (e.target.id === 'plant-search') {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('#plant-list .plant-card').forEach((c) => {
      const name = c.querySelector('.plant-card__name').textContent.toLowerCase();
      c.style.display = !q || name.includes(q) ? '' : 'none';
    });
  }
});

// 订单导入按钮（事件委托补丁）
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-action="import-order"]');
  if (!b) return;
  const arr = JSON.parse(b.dataset.json);
  const checked = [...document.querySelectorAll('#order-result input[type=checkbox]:checked')].map((c) => Number(c.dataset.i));
  let n = 0;
  for (const i of checked) {
    const it = arr[i];
    if (!it) continue;
    const rule = findRule(it.name);
    const level = rule ? rule.waterLevel : 'mid';
    await PStore.add({
      name: it.name,
      waterLevel: level,
      baseDays: rule ? rule.baseDays : WATER_LEVEL[level].baseDays,
      light: rule ? rule.light : '',
      note: rule ? rule.tips : '',
      source: 'order',
      plantedDate: todayStr(),
      lastWatered: todayStr(),
    });
    n++;
  }
  toast(`已导入 ${n} 盆植物`);
  $('#order-result').innerHTML = `<div class="card ok">✅ 已导入 ${n} 盆植物，去“我的植物”看看吧</div>`;
});

// ---------------- 启动 ----------------
init().then(() => maybeNotifyDue());
