// 细线描图标集
// 规范：24×24 网格、1.5px 等粗线条、圆角端点、无填充、描边色继承 currentColor
// 参考：植物养护 App 的 24px keyline 线描体系（keyline 内缩 2px，保证视觉重量一致）

const PATHS = {
  // ---------- 植物类别 ----------
  rose: '<circle cx="12" cy="8.4" r="4.2"/><circle cx="12" cy="8.4" r="1.5"/><path d="M12 12.6V20"/><path d="M12 16.8c-3.2 0-5.6-2.4-5.6-5.6 3.2 0 5.6 2.4 5.6 5.6z"/>',
  citrus: '<ellipse cx="12" cy="14" rx="6" ry="5"/><path d="M12 9c0-2.4 1.6-3.8 3.6-4 .2 2-1.4 3.8-3.6 4z"/><path d="M9.4 14h5.2"/>',
  succulent: '<g transform="translate(12,10.6)"><ellipse cx="0" cy="-4.2" rx="2.1" ry="4.3"/><ellipse cx="0" cy="-4.2" rx="2.1" ry="4.3" transform="rotate(60)"/><ellipse cx="0" cy="-4.2" rx="2.1" ry="4.3" transform="rotate(120)"/><ellipse cx="0" cy="-4.2" rx="2.1" ry="4.3" transform="rotate(180)"/><ellipse cx="0" cy="-4.2" rx="2.1" ry="4.3" transform="rotate(240)"/><ellipse cx="0" cy="-4.2" rx="2.1" ry="4.3" transform="rotate(300)"/></g><path d="M8 15.4h8l-.9 5H8.9z"/>',
  orchid: '<path d="M12 5.6c-1.7 0-2.9 1.5-2.9 3.3 0 1.6 1.2 2.8 2.9 2.8s2.9-1.2 2.9-2.8c0-1.8-1.2-3.3-2.9-3.3z"/><path d="M9.2 9.4C7.4 8.9 6.2 9.9 6.4 11.5c.2 1.4 1.6 2.2 2.8 1.8"/><path d="M14.8 9.4c1.8-.5 3 .5 2.8 2.1-.2 1.4-1.6 2.2-2.8 1.8"/><path d="M12 11.9V20"/>',
  herb: '<path d="M12 20V9"/><path d="M12 14.6c-2.7 0-4.6-1.9-4.6-4.6 2.7 0 4.6 1.9 4.6 4.6z"/><path d="M12 12.4c2.7 0 4.6-1.9 4.6-4.6-2.7 0-4.6 1.9-4.6 4.6z"/>',
  shrub: '<path d="M12 20v-4.4"/><path d="M12 15.6c0-3 2-5.4 5.4-5.4 0 3.4-2 5.4-5.4 5.4z"/><path d="M12 15.6c0-3-2-5.4-5.4-5.4 0 3.4 2 5.4 5.4 5.4z"/><path d="M12 13.4c0-3.2 0-5.6 0-7.4"/>',
  foliage: '<path d="M4.6 19.4C4.6 11 10.4 4.6 19.4 4.6c0 9-5 14.8-14.8 14.8z"/><path d="M6.4 17.6C9.6 13.6 13 10.6 17.4 7.6"/>',
  bulb: '<path d="M12 20.5c0-5.4-1.2-8.4-3.4-10.6"/><path d="M12 20.5c0-5.4 1.2-8.4 3.4-10.6"/><path d="M12 20.5c0-6.4 0-10 0-12.4"/><path d="M12 9.6c-1.7 0-2.8-1.3-2.8-2.9S10.3 3.8 12 3.8s2.8 1.3 2.8 2.9S13.7 9.6 12 9.6z"/>',
  carnivorous: '<path d="M13.4 13.2h5.2l.8 5.6c.2 2-1.2 3.4-3.4 3.4s-3.6-1.4-3.4-3.4z"/><path d="M13.1 13.2c.7-1.5 2-2.5 3.9-2.5s3.2 1 3.9 2.5"/><path d="M4.4 11.6c3.6-2 7-1.4 8.9 1.4"/>',
  tree: '<path d="M12 20.5v-4.6"/><path d="M12 15.9c-4 0-6.6-3-6.6-6.6S8 3.4 12 3.4s6.6 1.7 6.6 5.3-2.6 7.2-6.6 7.2z"/>',
  generic: '<path d="M9 13.8h6l-.8 6.2H9.8z"/><path d="M12 13.8V8.6"/><path d="M12 11c-2.4 0-4-1.7-4-4.2 2.4 0 4 1.7 4 4.2z"/><path d="M12 9.8c2.4 0 4-1.7 4-4.2-2.4 0-4 1.7-4 4.2z"/>',

  // ---------- 打卡 / 功能 ----------
  water: '<path d="M12 3.6s5.4 6 5.4 9.2a5.4 5.4 0 0 1-10.8 0C6.6 9.6 12 3.6 12 3.6z"/>',
  fertilize: '<path d="M12 20.4v-6.2"/><path d="M12 16.6c-2.3 0-3.8-1.7-3.8-3.8 2.3 0 3.8 1.7 3.8 3.8z"/><circle cx="7.2" cy="6.2" r="1.1"/><circle cx="11.4" cy="4.4" r="1.1"/><circle cx="15.6" cy="6.6" r="1.1"/>',
  growth: '<rect x="3.2" y="7.4" width="17.6" height="12.2" rx="2.6"/><path d="M8.6 7.4l1.3-2.2h4.2l1.3 2.2"/><circle cx="12" cy="13.6" r="3.3"/>',
  diagnosis: '<circle cx="10.8" cy="10.8" r="6.2"/><path d="M15.4 15.4L20 20"/>',
  note: '<path d="M5 4.4h14v11.2H5z"/><path d="M8 8h8"/><path d="M8 11.2h5"/>',
  other: '<circle cx="12" cy="12" r="2"/><path d="M12 5.6v2M12 16.4v2M5.6 12h2M16.4 12h2"/>',

  // ---------- 导航 ----------
  home: '<path d="M4 11.2L12 4.8l8 6.4"/><path d="M6.6 10v9.6h10.8V10"/>',
  plants: '<path d="M12 20.4v-6.2"/><path d="M12 15.6c-3 0-5.2-2.2-5.2-5.2 3 0 5.2 2.2 5.2 5.2z"/><path d="M12 13.2c3 0 5.2-2.2 5.2-5.2-3 0-5.2 2.2-5.2 5.2z"/>',
  add: '<path d="M12 5.8v12.4"/><path d="M5.8 12h12.4"/>',
  calendar: '<rect x="4" y="5.4" width="16" height="14.2" rx="2.6"/><path d="M4 10h16"/><path d="M8.6 3.4v4"/><path d="M15.4 3.4v4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3.6v2.2M12 18.2v2.2M4.9 7.7l1.9 1.1M17.2 15.2l1.9 1.1M4.9 16.3l1.9-1.1M17.2 8.8l1.9-1.1"/>',

  // ---------- 养护建议条目 ----------
  spray: '<path d="M12 3.6s5.4 6 5.4 9.2a5.4 5.4 0 0 1-10.8 0C6.6 9.6 12 3.6 12 3.6z"/><path d="M4.4 8.2c-.8 1-.8 2.4 0 3.4M19.6 8.2c.8 1 .8 2.4 0 3.4"/>',
  scissors: '<circle cx="6.6" cy="17.4" r="2.4"/><circle cx="17.4" cy="17.4" r="2.4"/><path d="M8.4 15.7L18 5.4M15.6 15.7L6 5.4"/>',
  shield: '<path d="M12 3.8l7 2.6v5.4c0 4.4-3 7.8-7 9.2-4-1.4-7-4.8-7-9.2V6.4z"/><path d="M9.2 12.2l2.1 2.1 3.9-3.9"/>',
  sprout: '<path d="M12 20.5v-7"/><path d="M12 15.2c-3.2 0-5.4-2.2-5.4-5.4 3.2 0 5.4 2.2 5.4 5.4z"/><path d="M12 13c3.2 0 5.4-2.2 5.4-5.4-3.2 0-5.4 2.2-5.4 5.4z"/>',
  thermo: '<path d="M10.6 13.8V5.6a1.4 1.4 0 0 1 2.8 0v8.2a3.3 3.3 0 1 1-2.8 0z"/><path d="M12 16.8v-3"/>',

  // ---------- 操作 ----------
  refresh: '<path d="M19.6 12a7.6 7.6 0 1 1-2.2-5.4"/><path d="M20 4.2v4.4h-4.4"/>',
  back: '<path d="M14.6 5.2L7.8 12l6.8 6.8"/>',
  edit: '<path d="M16.4 3.6l4 4L8 20H4v-4z"/>',
  delete: '<path d="M5 7h14"/><path d="M9.6 7V4.6h4.8V7"/><path d="M6.8 7l.9 12.4h8.6L17.2 7"/>',

  // ---------- 天气 ----------
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3.2v2M12 18.8v2M3.2 12h2M18.8 12h2M5.9 5.9l1.4 1.4M16.7 16.7l1.4 1.4M5.9 18.1l1.4-1.4M16.7 7.3l1.4-1.4"/>',
  cloud: '<path d="M7.6 18h9.2a3.6 3.6 0 0 0 .4-7.2 5.2 5.2 0 0 0-9.9-1.5A3.8 3.8 0 0 0 7.6 18z"/>',
  rain: '<path d="M7.6 15.6h9.2a3.6 3.6 0 0 0 .4-7.2 5.2 5.2 0 0 0-9.9-1.5 3.8 3.8 0 0 0 .3 8.7z"/><path d="M9.4 18.4l-1 2.2M13 18.4l-1 2.2M16.6 18.4l-1 2.2"/>',
  leaf: '<path d="M4.6 19.4C4.6 11 10.4 4.6 19.4 4.6c0 9-5 14.8-14.8 14.8z"/><path d="M6.4 17.6C9.6 13.6 13 10.6 17.4 7.6"/>',
};

// 生成内联 SVG。size 可省略（用 CSS 控制尺寸时传 0）
export function iconSVG(name, size = 24, cls = 'ic') {
  const d = PATHS[name] || PATHS.generic;
  const dim = size ? ` width="${size}" height="${size}"` : '';
  return `<svg class="${cls}" viewBox="0 0 24 24"${dim} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}

export function hasIcon(name) {
  return Object.prototype.hasOwnProperty.call(PATHS, name);
}

export function iconNames() {
  return Object.keys(PATHS);
}

// 天气文案 → 图标名
export function weatherIcon(text = '') {
  const t = String(text);
  if (t.includes('雨') || t.includes('雷') || t.includes('雪')) return 'rain';
  if (t.includes('云') || t.includes('阴') || t.includes('霾') || t.includes('雾')) return 'cloud';
  return 'sun';
}

// ---------------------------------------------------------------
// 手绘插画（内联 SVG，淡紫底 + 蓝紫线描，与图标同一套语言）
// ---------------------------------------------------------------
const ART = {
  // 空状态：还没有植物 —— 一盆小苗
  'empty-pot': `<svg class="art" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="60" cy="45" r="34" fill="#EDEFFF"/>
    <circle cx="95" cy="19" r="3" fill="#C9C4F8"/>
    <circle cx="24" cy="31" r="2.2" fill="#C9C4F8"/>
    <circle cx="99" cy="64" r="2.6" fill="#DED9FF"/>
    <circle cx="21" cy="63" r="1.8" fill="#DED9FF"/>
    <path d="M60 71V44" stroke="#5A5FD4" stroke-width="2" stroke-linecap="round"/>
    <path d="M60 58c-9 0-15.5-6.6-15.5-15.5 9 0 15.5 6.6 15.5 15.5z" fill="#FFFFFF" stroke="#5A5FD4" stroke-width="2" stroke-linejoin="round"/>
    <path d="M60 51c9 0 15.5-6.6 15.5-15.5-9 0-15.5 6.6-15.5 15.5z" fill="#DCD8FB" stroke="#5A5FD4" stroke-width="2" stroke-linejoin="round"/>
    <path d="M44.5 70h31l-3.3 18h-24.4z" fill="#FFFFFF" stroke="#5A5FD4" stroke-width="2" stroke-linejoin="round"/>
    <path d="M41.5 70h37" stroke="#5A5FD4" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  // 空状态：今天没有植物需要浇水 —— 一片叶 + 对勾
  'empty-done': `<svg class="art" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="60" cy="45" r="34" fill="#EDEFFF"/>
    <circle cx="93" cy="22" r="2.6" fill="#C9C4F8"/>
    <circle cx="26" cy="28" r="2" fill="#C9C4F8"/>
    <circle cx="97" cy="66" r="2.2" fill="#DED9FF"/>
    <path d="M40 47c0-12 8-19 21-19 0 13-8 19-21 19z" fill="#DCD8FB" stroke="#5A5FD4" stroke-width="2" stroke-linejoin="round"/>
    <path d="M40 47c3-5 7-9 12-12" stroke="#5A5FD4" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M34 62l10 10 20-24" stroke="#5A5FD4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  // 空状态：还没有打卡记录
  'empty-timeline': `<svg class="art" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="60" cy="45" r="34" fill="#EDEFFF"/>
    <circle cx="94" cy="24" r="2.6" fill="#C9C4F8"/>
    <circle cx="25" cy="60" r="2.2" fill="#DED9FF"/>
    <rect x="34" y="30" width="52" height="38" rx="7" fill="#FFFFFF" stroke="#5A5FD4" stroke-width="2"/>
    <path d="M44 20v10" stroke="#5A5FD4" stroke-width="2" stroke-linecap="round"/>
    <path d="M76 20v10" stroke="#5A5FD4" stroke-width="2" stroke-linecap="round"/>
    <path d="M34 42h52" stroke="#5A5FD4" stroke-width="2"/>
    <path d="M47 53h8M65 53h8M47 61h8" stroke="#8F8EF5" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
};

export function artSVG(name) {
  return ART[name] || ART['empty-pot'];
}
