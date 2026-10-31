// 花草养护助手 —— 前端主程序
import { plants as PStore, waterings as WStore, checkins as CStore, settings as SStore } from './db.js';
import { PLANTS, WATER_LEVEL, MONTHLY_CALENDAR, findRule } from './data.js';
import { getWeather, vision, fileToDataURL, extractJSON } from './api.js';
import { planAll, computeWatering, seasonOf, SEASON_LABEL, todayStr, addDays, diffDays, careAdvice, inferType, typeIcon } from './engine.js';

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
// 植物头像图标统一由 engine.js 的 typeIcon() 提供（同时涵盖植物类别与打卡类型）
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
        <div class="plant-row__top">
          <span class="plant-avatar">${typeIcon(inferType(plant.name))}</span>
          <div class="plant-row__text">
            <div class="plant-row__name">${esc(plant.name)} ${levelBadge(plant.waterLevel)}</div>
            <div class="plant-row__meta">该浇水啦${plan.reasons.length ? ' · ' + esc(plan.reasons[0]) : ''}${plant.note ? ' · 📌' + esc(plant.note) : ''}</div>
          </div>
        </div>
        <button class="btn btn--primary" data-action="water" data-id="${plant.id}">已浇水</button>
      </div>`).join('')
    : `<div class="empty">🎉 今天没有植物需要浇水</div>`;

  const soonHtml = soon.length
    ? `<h3 class="section">接下来 7 天</h3>` + soon.map(({ plant, plan }) => `
      <div class="card plant-row">
        <div class="plant-row__top">
          <span class="plant-avatar">${typeIcon(inferType(plant.name))}</span>
          <div class="plant-row__text">
            <div class="plant-row__name">${esc(plant.name)}</div>
            <div class="plant-row__meta">${plan.daysLeft} 天后 · ${fmtDate(plan.nextDate)}${plant.note ? ' · 📌' + esc(plant.note) : ''}</div>
          </div>
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
            <span class="plant-avatar">${typeIcon(inferType(plant.name))}</span>
            <div class="plant-card__body">
              <div class="plant-card__name">${esc(plant.name)} ${levelBadge(plant.waterLevel)}</div>
              <div class="plant-card__meta">下次浇水 ${fmtDate(plan.nextDate)} · ${plan.due ? '<b class="warn">已到期</b>' : plan.daysLeft + ' 天后'}${plant.note ? ' · 📌' + esc(plant.note) : ''}</div>
            </div>
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
      <p class="hint">两种方式任选其一，<b>都不需要填 Key</b>：</p>

      <div class="route-card">
        <b>① 用千问网页免费识别（推荐）</b>
        <p class="hint">点按钮自动打开千问网页并复制指令 → 在千问里粘贴指令、上传订单截图 → 把结果复制回来粘贴到下方，自动提取植物。</p>
        <button class="btn btn--primary" data-action="qwen-order" type="button">📋 打开千问并复制指令</button>
        <div id="qwen-order-box" hidden>
          <ol class="steps">
            <li>在千问网页粘贴下面的<b>指令</b>（已自动复制；没复制就点「复制指令」）</li>
            <li>上传你的订单截图，等它返回植物列表</li>
            <li>把结果<b>复制</b>，粘贴到下方「识别结果」，点「解析并预览」</li>
          </ol>
          <p class="hint">指令（只读）：</p>
          <textarea id="qwen-instruction" rows="4" readonly>请识别这张购物订单或商品详情截图里的植物、花草、绿植、盆栽或种子类商品。
只输出一个 JSON 数组，不要解释，也不要用 Markdown 代码块。格式示例：
[{"name":"绿萝","quantity":1},{"name":"龟背竹","quantity":1}]
如果完全没有植物类商品，直接输出 []。</textarea>
          <button class="btn btn--ghost" data-action="copy-instruction" type="button">复制指令</button>
          <p class="hint">千问识别结果粘贴到这里：</p>
          <textarea id="qwen-order-text" rows="5" placeholder="在此粘贴千问返回的识别结果（JSON 或纯文字均可）"></textarea>
          <button class="btn btn--primary" data-action="parse-qwen-order" type="button">解析并预览</button>
        </div>
      </div>

      <div class="route-card">
        <b>② 本机直传（需填写通义千问 VL Key）</b>
        <p class="hint">已在「⚙️ 设置」填了 Key 时可用，全自动识别、无需跳转。</p>
        <label class="upload">
          <input type="file" accept="image/*" data-action="fileOrder" hidden />
          <span>🧾 选择订单截图</span>
        </label>
      </div>

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
  const advice = careAdvice(plant, rule, state.weather);
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
      <button class="btn btn--ghost" data-action="edit" data-id="${plant.id}">✏️ 编辑</button>
      <button class="btn btn--ghost" data-action="delete" data-id="${plant.id}">删除</button>
    </div>
    <div id="diag-result"></div>
    <div class="card plant-hero">
      <span class="plant-avatar plant-avatar--lg">${typeIcon(inferType(plant.name))}</span>
      <div class="plant-hero__body">
        <div class="plant-card__name">${esc(plant.name)} ${levelBadge(plant.waterLevel)}</div>
        ${plant.note ? `<div class="plant-note">📌 ${esc(plant.note)}</div>` : ''}
      </div>
    </div>
    <div class="card">
      <div class="kv"><span>光照</span><b>${esc(plant.light || (rule && rule.light) || '—')}</b></div>
      <div class="kv"><span>基础间隔</span><b>${plant.baseDays || (rule && WATER_LEVEL[plant.waterLevel].baseDays)} 天</b></div>
      <div class="kv"><span>下次浇水</span><b class="${plan.due ? 'warn' : ''}">${fmtDate(plan.nextDate)}（${plan.due ? '已到期' : plan.daysLeft + ' 天后'}）</b></div>
      <div class="kv"><span>上次浇水</span><b>${fmtDate(plant.lastWatered || plant.plantedDate || '—')}</b></div>
      <div class="reasons">${plan.reasons.map((r) => `<span class="tag">${esc(r)}</span>`).join('') || '<span class="tag">天气温和，按常规节奏</span>'}</div>
    </div>

    <div class="card care-card">
      <h4>🌡️ 实时养护建议</h4>
      <p class="care-head">${esc(advice.headline)}</p>
      ${advice.items.map((it) => `
        <div class="care-item">
          <span class="care-ico">${it.icon}</span>
          <div class="care-body"><b>${esc(it.title)}</b><p>${esc(it.text)}</p></div>
        </div>`).join('')}
      ${tips ? `<p class="tip">💡 ${esc(tips)}</p>` : ''}
      <p class="hint">依据当地实时天气逐日生成 · 仅供参考</p>
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
      <button class="btn btn--ghost" data-action="open-guide">📖 查看图文指引</button>
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
    const ok = await confirmModal({
      title: '记录浇水',
      message: '确定要把这盆标记为「今天已浇水」吗？（误触可点取消）',
      okText: '已浇水',
      cancelText: '取消',
    });
    if (ok) await markWatered(id);
    return;
  }
  if (action === 'plant') return navigate('plant', id);
  if (action === 'edit') return editPlant(id);
  if (action === 'delete') {
    const ok = await confirmModal({
      title: '删除植物',
      message: '确定删除该植物及其所有浇水/打卡/诊断记录？此操作不可撤销',
      okText: '删除',
      cancelText: '取消',
      danger: true,
    });
    if (ok) {
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
  if (action === 'open-guide') { window.open('key-guide.html', '_blank', 'noopener'); return; }

  // 订单：千问网页免 Key 识别
  if (action === 'qwen-order') return openQwenOrder();
  if (action === 'copy-instruction') return copyInstruction();
  if (action === 'parse-qwen-order') return parseQwenOrder();

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

// ---------------- 订单：千问网页免 Key 识别 ----------------
const QWEN_CHAT_URL = 'https://chat.qwen.ai';

async function openQwenOrder() {
  const instr = document.getElementById('qwen-instruction');
  const box = document.getElementById('qwen-order-box');
  const instruction = instr ? instr.value : '';
  let copied = false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(instruction);
      copied = true;
    }
  } catch (e) { /* 忽略，走手动复制 */ }
  window.open(QWEN_CHAT_URL, '_blank', 'noopener');
  if (box) box.hidden = false;
  toast(copied ? '指令已复制，去千问粘贴并上传截图' : '已打开千问，请手动复制下方指令');
}

async function copyInstruction() {
  const instr = document.getElementById('qwen-instruction');
  if (!instr) return;
  try {
    await navigator.clipboard.writeText(instr.value);
    toast('指令已复制');
  } catch (e) {
    instr.focus(); instr.select();
    toast('请在上方手动复制（已选中）');
  }
}

// 从自由文本里找植物名附近的数量（×2 / 2盆 / 2棵 等）
function findQuantity(text, name) {
  const idx = text.indexOf(name);
  if (idx === -1) return 1;
  const tail = text.slice(idx, idx + 24);
  const m = tail.match(/[×xX*]?\s*(\d+)\s*(?:盆|棵|株|个|件|支|束)?/);
  if (m) { const n = parseInt(m[1], 10); if (n > 0 && n < 1000) return n; }
  return 1;
}

// JSON 解析失败时的兜底：扫描文本里出现的已知植物名
function extractPlantsFromText(text) {
  const found = [];
  const seen = new Set();
  for (const p of PLANTS) {
    const names = [p.name, ...(p.alias || [])];
    for (const nm of names) {
      if (nm && text.includes(nm) && !seen.has(p.name)) {
        found.push({ name: p.name, quantity: findQuantity(text, nm) });
        seen.add(p.name);
        break;
      }
    }
  }
  return found;
}

async function parseQwenOrder() {
  const ta = document.getElementById('qwen-order-text');
  if (!ta) return;
  const text = ta.value.trim();
  if (!text) return toast('请先粘贴千问的识别结果');
  let arr = extractJSON(text);
  if (arr && arr.name && !Array.isArray(arr)) arr = [arr];      // 单对象兼容
  if (!Array.isArray(arr) || !arr.length) arr = extractPlantsFromText(text);
  if (!Array.isArray(arr) || !arr.length) {
    $('#order-result').innerHTML = `<div class="card err">没解析出植物。请确认粘贴的是千问返回的结果；或到「⚙️ 设置」填 Key 用②本机直传。</div>`;
    return;
  }
  const payload = arr.map((it) => ({ name: (it && it.name) || it, quantity: Number((it && it.quantity) || 1) || 1 }));
  const rows = payload.map((it, i) => {
    const rule = findRule(it.name);
    const level = rule ? rule.waterLevel : 'mid';
    return `<label class="order-row"><input type="checkbox" data-i="${i}" checked />
      <span>${esc(it.name)} ×${it.quantity} ${levelBadge(level)}</span></label>`;
  }).join('');
  $('#order-result').innerHTML = `<div class="card"><p>识别到以下植物，勾选要入库的：</p>${rows}
    <button class="btn btn--primary" data-action="import-order" data-json='${esc(JSON.stringify(payload))}'>导入选中</button></div>`;
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

// 媒体选择弹窗：自带「完成 / 取消」出口，避免 iOS 相机取消后 Promise 卡死
// 返回 { canceled, text, photo }；text 仅在 needNote 时有意义，photo 为压缩后的 dataURL
function openMediaModal({ title = '添加照片', hint = '', needNote = false, require = false, placeholder = '' } = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'overlay dim';
    overlay.innerHTML = `
      <div class="modal">
        <h3>${esc(title)}</h3>
        ${hint ? `<p class="hint">${esc(hint)}</p>` : ''}
        ${needNote ? `<textarea id="mm-note" placeholder="${esc(placeholder)}"></textarea>` : ''}
        <div id="mm-prev" class="prev"></div>
        <button class="btn btn--primary" data-p="camera">📷 拍照</button>
        <button class="btn" data-p="album">🖼️ 从相册选择</button>
        ${require ? '' : `<button class="btn" data-p="skip">⏭️ 不用照片</button>`}
        <button class="btn btn--primary" data-p="done">✅ 完成</button>
        <button class="btn btn--ghost" data-p="cancel">❌ 取消</button>
      </div>`;
    document.body.appendChild(overlay);
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;';
    overlay.appendChild(input);
    let photo = '';

    const close = (res) => {
      if (!overlay.parentNode) return;
      input.onchange = null;
      overlay.remove();
      resolve(res);
    };
    const renderPrev = () => {
      const prev = overlay.querySelector('#mm-prev');
      prev.innerHTML = photo
        ? `<img class="thumb" src="${photo}" alt="预览"/><button class="btn btn--ghost" data-p="remove">🗑️ 移除照片</button>`
        : '';
    };
    input.onchange = async () => {
      if (input.files && input.files[0]) {
        try { photo = await resizeImage(await fileToDataURL(input.files[0])); } catch (e) { photo = ''; }
        renderPrev();
      }
    };
    overlay.addEventListener('click', (e) => {
      const p = e.target.dataset && e.target.dataset.p;
      if (!p) return;
      if (p === 'camera') { input.setAttribute('capture', 'environment'); input.click(); }
      else if (p === 'album') { input.removeAttribute('capture'); input.click(); }
      else if (p === 'remove') { photo = ''; input.value = ''; renderPrev(); }
      else if (p === 'skip') {
        const note = needNote ? overlay.querySelector('#mm-note').value : '';
        close({ canceled: false, text: note, photo: '' });
      }
      else if (p === 'done') {
        if (require && !photo) { toast('请先选择一张照片'); return; }
        const note = needNote ? overlay.querySelector('#mm-note').value : '';
        close({ canceled: false, text: note, photo });
      }
      else if (p === 'cancel') { close({ canceled: true }); }
    });
  });
}

// 通用确认弹窗（in-app 按钮，iOS 上比原生 confirm 更稳，取消可靠）
function confirmModal({ title = '请确认', message = '', okText = '确定', cancelText = '取消', danger = false } = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'overlay dim';
    overlay.innerHTML = `
      <div class="modal">
        <h3>${esc(title)}</h3>
        ${message ? `<p class="hint">${esc(message)}</p>` : ''}
        <button class="btn ${danger ? 'btn--warn' : 'btn--primary'}" data-r="ok">${esc(okText)}</button>
        <button class="btn btn--ghost" data-r="cancel">${esc(cancelText)}</button>
      </div>`;
    document.body.appendChild(overlay);
    const close = (val) => { if (!overlay.parentNode) return; overlay.remove(); resolve(val); };
    overlay.addEventListener('click', (e) => {
      const r = e.target.dataset && e.target.dataset.r;
      if (r === 'ok') close(true);
      else if (r === 'cancel') close(false);
    });
  });
}

// 编辑植物：名称/备注/喜水程度/间隔/光照均可改（便于区分同种植株）
async function editPlant(id) {
  const plant = await PStore.get(id);
  if (!plant) return;
  const overlay = document.createElement('div');
  overlay.className = 'overlay dim';
  overlay.innerHTML = `
    <div class="modal">
      <h3>✏️ 编辑植物</h3>
      <label class="m-label">名称（物种名，用于养护建议）
        <input id="ep-name" value="${esc(plant.name)}" />
      </label>
      <label class="m-label">备注 / 位置（区分同种植株，如：客厅、大盆）
        <input id="ep-note" value="${esc(plant.note || '')}" placeholder="选填，例如：客厅 / 卧室 / 大盆" />
      </label>
      <label class="m-label">喜水程度
        <select id="ep-level">
          <option value="high" ${plant.waterLevel === 'high' ? 'selected' : ''}>喜水（浇勤）</option>
          <option value="mid" ${plant.waterLevel === 'mid' ? 'selected' : ''}>中等</option>
          <option value="low" ${plant.waterLevel === 'low' ? 'selected' : ''}>耐旱（少浇）</option>
        </select>
      </label>
      <label class="m-label">基础浇水间隔（天）
        <input id="ep-days" type="number" min="1" max="30" value="${plant.baseDays || 5}" />
      </label>
      <label class="m-label">光照需求
        <input id="ep-light" value="${esc(plant.light || '')}" placeholder="例如：散射光" />
      </label>
      <button class="btn btn--primary" data-r="save">💾 保存</button>
      <button class="btn btn--ghost" data-r="cancel">取消</button>
    </div>`;
  document.body.appendChild(overlay);
  const close = () => { if (overlay.parentNode) overlay.remove(); };
  overlay.addEventListener('click', async (e) => {
    const r = e.target.dataset && e.target.dataset.r;
    if (!r) return;
    if (r === 'cancel') { close(); return; }
    if (r === 'save') {
      const name = overlay.querySelector('#ep-name').value.trim();
      if (!name) { toast('名称不能为空'); return; }
      const days = parseInt(overlay.querySelector('#ep-days').value, 10);
      plant.name = name;
      plant.note = overlay.querySelector('#ep-note').value.trim();
      plant.waterLevel = overlay.querySelector('#ep-level').value;
      plant.baseDays = Math.max(1, Math.min(30, isNaN(days) ? 5 : days));
      plant.light = overlay.querySelector('#ep-light').value.trim();
      loading(true, '保存中…');
      try {
        await PStore.update(plant);
        toast('已保存 ✏️');
        close();
        $('#view').innerHTML = await renderPlantDetail(id);
      } finally { loading(false); }
    }
  });
}

// 打卡弹窗（文字可选 + 照片可选，随时可取消）
async function openCheckin(id) {
  const res = await openMediaModal({
    title: '成长打卡',
    hint: '记录这一刻的成长（文字可选，照片可选）',
    needNote: true,
    require: false,
    placeholder: '选填，如：长了新叶 / 施了肥 / 状态良好',
  });
  if (res.canceled) { toast('已取消打卡'); return; }
  loading(true, '保存中…');
  try {
    await CStore.add({ plantId: id, type: 'growth', text: res.text || '', photo: res.photo || '', date: new Date().toISOString() });
    toast('已打卡 📸');
    $('#view').innerHTML = await renderPlantDetail(id);
  } finally {
    loading(false);
  }
}

// 拍照诊断病虫害 / 健康状态
async function openDiagnose(id) {
  if (!state.settings.dashscopeKey) { toast('请先在设置里填写通义千问 VL Key'); return; }
  const res = await openMediaModal({ title: '拍照诊断', hint: '拍一张清晰的植物照片，识别病虫害与健康状况', needNote: false, require: true });
  if (res.canceled) { toast('已取消'); return; }
  const dataURL = res.photo;
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
