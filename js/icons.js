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
// 手绘插画（内联 SVG，水彩柔彩风格：无描边、低饱和粉彩、米色留白）
// ---------------------------------------------------------------
const ART = {
  // 空状态：还没有植物 —— 一盆小苗（水彩柔彩，无描边）
  'empty-pot': `<svg class="art" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="60" cy="46" r="34" fill="#F1EEE8"/>
    <path d="M60 70 C 59 58 61 48 60 38" stroke="#9DAE96" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.9"/>
    <path d="M58 56 C 48 52 41 56 37 64 C 47 66 54 63 58 56 Z" fill="#9DAE96"/>
    <path d="M58 56 C 48 52 41 56 37 64 C 47 66 54 63 58 56 Z" fill="#FFFFFF" opacity="0.22"/>
    <path d="M62 50 C 72 45 80 49 84 57 C 73 59 65 56 62 50 Z" fill="#8E9B86"/>
    <path d="M62 50 C 72 45 80 49 84 57 C 73 59 65 56 62 50 Z" fill="#FFFFFF" opacity="0.20"/>
    <g transform="translate(60,36)">
      <path d="M0 12 C -11 4 -10 -14 0 -20 C 10 -14 11 4 0 12 Z" fill="#9A95B8"/>
      <path d="M0 12 C -11 4 -10 -14 0 -20 C 10 -14 11 4 0 12 Z" fill="#FFFFFF" opacity="0.18"/>
      <ellipse cx="0" cy="0" rx="3.4" ry="5" fill="#D6C7A4"/>
    </g>
    <path d="M48 72 h24 l-3 16 a2.4 2.4 0 0 1 -2.4 2.4 h-13.2 a2.4 2.4 0 0 1 -2.4 -2.4 z" fill="#9A95B5"/>
    <path d="M48 72 h24 l-0.9 5 H48.9 Z" fill="#B0ABC8"/>
    <rect x="45" y="68" width="30" height="5" rx="2.5" fill="#8E89AE"/>
    <ellipse cx="60" cy="71" rx="13" ry="2.8" fill="#B3A689"/>
  </svg>`,
  // 空状态：今天没有植物需要浇水 —— 枝叶 + 对勾
  'empty-done': `<svg class="art" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="60" cy="46" r="34" fill="#F1EEE8"/>
    <path d="M44 60 C 40 46 44 34 56 30 C 56 44 52 56 44 60 Z" fill="#9DAE96"/>
    <path d="M44 60 C 40 46 44 34 56 30 C 56 44 52 56 44 60 Z" fill="#FFFFFF" opacity="0.22"/>
    <path d="M58 64 C 62 50 70 42 82 42 C 80 56 70 64 58 64 Z" fill="#8E9B86"/>
    <path d="M58 64 C 62 50 70 42 82 42 C 80 56 70 64 58 64 Z" fill="#FFFFFF" opacity="0.20"/>
    <path d="M38 52 C 50 50 64 46 76 36" stroke="#8E89AE" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M68 38 l9 9 15 -17" stroke="#9DAE96" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  // 空状态：还没有打卡记录 —— 柔彩日历卡 + 小苗
  'empty-timeline': `<svg class="art" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="60" cy="46" r="34" fill="#F1EEE8"/>
    <rect x="38" y="30" width="44" height="34" rx="9" fill="#E7E3EC"/>
    <path d="M38 41 a9 9 0 0 1 9 -9 h26 a9 9 0 0 1 9 9 z" fill="#9A95B5"/>
    <path d="M47 27 v5M73 27 v5" stroke="#8E89AE" stroke-width="2.4" stroke-linecap="round"/>
    <g stroke="#8E89AE" stroke-width="2" stroke-linecap="round">
      <path d="M47 52 h6M58 52 h6M69 52 h6"/>
    </g>
    <path d="M60 64 C 58 56 60 50 60 44" stroke="#9DAE96" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.9"/>
    <path d="M58 54 C 50 51 45 54 42 60 C 50 62 55 59 58 54 Z" fill="#9DAE96"/>
  </svg>`,
};

export function artSVG(name) {
  return ART[name] || ART['empty-pot'];
}

// ---------------- 首页顶部 hero（水彩柔彩花卉，参考 NORA 风） ----------------
// 无描边、低饱和粉彩、米色留白；蓝紫为主题花色，陶土/灰玫瑰/鼠尾草/燕麦为点缀。
const HERO = `
<svg class="hero__art" viewBox="0 0 360 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <!-- 柔和晕染底色（水彩感，无轮廓） -->
  <circle cx="300" cy="34" r="74" fill="#C9C3DF" opacity="0.30"/>
  <circle cx="58" cy="124" r="84" fill="#B9C6AE" opacity="0.26"/>
  <circle cx="200" cy="20" r="42" fill="#E4DCC6" opacity="0.30"/>
  <!-- 左侧细茎与叶 -->
  <path d="M70 150 C 68 130 73 112 70 96" stroke="#9DAE96" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.85"/>
  <path d="M70 120 C 59 116 50 121 45 130 C 57 132 66 129 70 120 Z" fill="#9DAE96"/>
  <path d="M70 120 C 59 116 50 121 45 130 C 57 132 66 129 70 120 Z" fill="#FFFFFF" opacity="0.22"/>
  <path d="M71 106 C 81 102 90 107 95 116 C 84 118 75 115 71 106 Z" fill="#9DAE96"/>
  <path d="M71 106 C 81 102 90 107 95 116 C 84 118 75 115 71 106 Z" fill="#FFFFFF" opacity="0.22"/>
  <!-- 左侧粉蓝小花苞 -->
  <g transform="translate(72,86)">
    <g fill="#A6AEC6">
      <circle cx="0" cy="-7" r="5"/><circle cx="6.5" cy="-2" r="5"/><circle cx="4" cy="6" r="5"/><circle cx="-4" cy="6" r="5"/><circle cx="-6.5" cy="-2" r="5"/>
    </g>
    <circle cx="0" cy="0" r="2.6" fill="#EBDFC4"/>
  </g>
  <!-- 中央鸢尾（蓝紫，主题色） -->
  <path d="M140 150 C 138 122 142 100 140 80" stroke="#9DAE96" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.85"/>
  <g transform="translate(140,56)">
    <path d="M0 20 C -18 8 -16 -22 0 -32 C 16 -22 18 8 0 20 Z" fill="#9A95B8"/>
    <path d="M0 20 C -18 8 -16 -22 0 -32 C 16 -22 18 8 0 20 Z" fill="#FFFFFF" opacity="0.18"/>
    <path d="M0 20 C -24 -2 -32 -18 -36 -32 C -19 -28 -7 -12 0 20 Z" fill="#8E89AE" opacity="0.95"/>
    <path d="M0 20 C 24 -2 32 -18 36 -32 C 19 -28 7 -12 0 20 Z" fill="#8E89AE" opacity="0.95"/>
    <ellipse cx="0" cy="2" rx="6" ry="9" fill="#D6C7A4"/>
    <ellipse cx="-1" cy="-3" rx="2.6" ry="5" fill="#FFFFFF" opacity="0.5"/>
  </g>
  <!-- 右侧灰玫瑰小花丛 -->
  <g transform="translate(248,74)">
    <g fill="#C29CA0">
      <circle cx="0" cy="-9" r="6"/><circle cx="8.5" cy="-3" r="6"/><circle cx="5.5" cy="7" r="6"/><circle cx="-5.5" cy="7" r="6"/><circle cx="-8.5" cy="-3" r="6"/>
    </g>
    <circle cx="0" cy="0" r="3.6" fill="#EBDFC4"/>
  </g>
  <g transform="translate(228,90) scale(0.8)">
    <g fill="#C8A7AB">
      <circle cx="0" cy="-9" r="6"/><circle cx="8.5" cy="-3" r="6"/><circle cx="5.5" cy="7" r="6"/><circle cx="-5.5" cy="7" r="6"/><circle cx="-8.5" cy="-3" r="6"/>
    </g>
    <circle cx="0" cy="0" r="3.6" fill="#EBDFC4"/>
  </g>
  <g transform="translate(268,92) scale(0.78)">
    <g fill="#C8A7AB">
      <circle cx="0" cy="-9" r="6"/><circle cx="8.5" cy="-3" r="6"/><circle cx="5.5" cy="7" r="6"/><circle cx="-5.5" cy="7" r="6"/><circle cx="-8.5" cy="-3" r="6"/>
    </g>
    <circle cx="0" cy="0" r="3.6" fill="#EBDFC4"/>
  </g>
  <!-- 右下鼠尾草枝叶 -->
  <path d="M300 150 C 298 132 302 116 300 102" stroke="#9DAE96" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.85"/>
  <g transform="translate(300,116)">
    <path d="M0 0 C 12 -8 16 -26 6 -40 C -4 -26 -5 -10 0 0 Z" fill="#9DAE96"/>
    <path d="M0 0 C 12 -8 16 -26 6 -40 C -4 -26 -5 -10 0 0 Z" fill="#FFFFFF" opacity="0.20"/>
    <path d="M0 0 C 10 -6 14 -22 5 -34 C -4 -22 -5 -8 0 0 Z" fill="#8E9B86" transform="rotate(22)"/>
  </g>
  <!-- 漂浮的小点，留白呼吸 -->
  <circle cx="200" cy="44" r="2" fill="#C29CA0" opacity="0.5"/>
  <circle cx="320" cy="82" r="1.6" fill="#D6C7A4" opacity="0.55"/>
  <circle cx="112" cy="34" r="1.6" fill="#9A95B8" opacity="0.45"/>
  <circle cx="176" cy="112" r="2" fill="#9DAE96" opacity="0.45"/>
</svg>`;

export function heroSVG() {
  return HERO;
}

// 吉祥物：一盆柔彩小花苗（用于空状态，给 App 一点性格；无描边、温和表情）
const MASCOT = `
<svg class="art" viewBox="0 0 120 112" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="60" cy="50" r="42" fill="#F1EEE8"/>
  <!-- 茎 -->
  <path d="M60 84 C 59 70 61 58 60 46" stroke="#9DAE96" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.9"/>
  <!-- 叶片 -->
  <path d="M58 64 C 46 60 38 64 33 73 C 45 75 54 72 58 64 Z" fill="#9DAE96"/>
  <path d="M58 64 C 46 60 38 64 33 73 C 45 75 54 72 58 64 Z" fill="#FFFFFF" opacity="0.22"/>
  <path d="M62 58 C 73 53 82 57 87 66 C 75 68 66 65 62 58 Z" fill="#8E9B86"/>
  <path d="M62 58 C 73 53 82 57 87 66 C 75 68 66 65 62 58 Z" fill="#FFFFFF" opacity="0.20"/>
  <!-- 顶部小花（蓝紫主题） -->
  <g transform="translate(60,40)">
    <path d="M0 14 C -13 5 -12 -16 0 -23 C 12 -16 13 5 0 14 Z" fill="#9A95B8"/>
    <path d="M0 14 C -13 5 -12 -16 0 -23 C 12 -16 13 5 0 14 Z" fill="#FFFFFF" opacity="0.18"/>
    <ellipse cx="0" cy="1" rx="4" ry="6" fill="#D6C7A4"/>
  </g>
  <!-- 盆（无描边，柔紫） -->
  <path d="M46 84 h28 l-4 21 a3 3 0 0 1 -3 3 h-14 a3 3 0 0 1 -3 -3 z" fill="#9A95B5"/>
  <path d="M46 84 h28 l-1.4 7 H47.4 Z" fill="#B0ABC8"/>
  <rect x="43" y="80" width="34" height="6" rx="3" fill="#8E89AE"/>
  <ellipse cx="60" cy="83" rx="15" ry="3.4" fill="#B3A689"/>
  <!-- 温和的小表情 -->
  <circle cx="53" cy="98" r="1.7" fill="#5A5670"/>
  <circle cx="67" cy="98" r="1.7" fill="#5A5670"/>
  <path d="M53 102 q7 4 14 0" stroke="#5A5670" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.85"/>
</svg>`;

export function mascotSVG() {
  return MASCOT;
}
