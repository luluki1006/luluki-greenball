// 浇水算法引擎：结合植物喜水等级 + 当地实时/预报天气，动态计算下次浇水
import { WATER_LEVEL } from './data.js';

export function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
export function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
export function diffDays(aIso, bIso) {
  const a = new Date(aIso + 'T00:00:00');
  const b = new Date(bIso + 'T00:00:00');
  return Math.round((a - b) / 86400000);
}
export function seasonOf(month = new Date().getMonth() + 1) {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}
export const SEASON_LABEL = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };

function isRainy(day) {
  if (!day) return false;
  const t = (day.textDay || day.textNight || day.text || '').toLowerCase();
  if (/雨|雪|雷|阵雨|小雨|中雨|大雨|暴雨|雨夹雪|冻雨|小雪|中雪|大雪|雨凇/.test(t)) return true;
  if (typeof day.precip === 'number' && day.precip > 0) return true;
  return false;
}

/**
 * 计算某植物的浇水计划
 * @param {object} plant 植物档案（含 waterLevel / baseDays / lastWatered / plantedDate）
 * @param {object|null} weather 天气数据 { now, daily }（来源 Open-Meteo）
 */
export function computeWatering(plant, weather) {
  const level = WATER_LEVEL[plant.waterLevel] || WATER_LEVEL.mid;
  const base = plant.baseDays || level.baseDays;

  let factor = 1;
  const reasons = [];

  const now = weather && weather.now;
  if (now) {
    const temp = Number(now.temp);
    const hum = Number(now.humidity);
    if (temp >= 30 && hum < 45) { factor *= 0.8; reasons.push('高温干燥，蒸发快，浇水要勤一点'); }
    else if (temp <= 10) { factor *= 1.5; reasons.push('低温休眠/半休眠，需控水'); }
    else if (temp >= 26 && hum < 55) { factor *= 0.9; reasons.push('温暖偏干，略勤'); }
  }

  // 未来两天有雨/雪 → 延长间隔
  const daily = (weather && weather.daily) || [];
  const upcoming = daily.slice(0, 2);
  const willRain = upcoming.some(isRainy);
  if (willRain) { factor *= 1.3; reasons.push('未来两天有降雨/雪，可适当延后'); }

  // 持续高湿 → 略延长
  const avgHum = daily.slice(0, 3).map((d) => Number(d.humidity)).filter((n) => !isNaN(n));
  if (avgHum.length && avgHum.reduce((a, b) => a + b, 0) / avgHum.length >= 85) {
    factor *= 1.1; reasons.push('空气湿度高，蒸发慢');
  }

  let interval = Math.round(base * factor);
  interval = Math.max(1, Math.min(30, interval));

  const refDate = plant.lastWatered || plant.plantedDate || plant.createdAt?.slice(0, 10) || todayStr();
  const nextDate = addDays(refDate, interval);
  const daysLeft = diffDays(nextDate, todayStr());
  const due = daysLeft <= 0;

  return {
    base,
    interval,
    factor: Math.round(factor * 100) / 100,
    refDate,
    nextDate,
    daysLeft,
    due,
    reasons,
    weatherText: now ? `${now.text} ${now.temp}℃ 湿度${now.humidity}%` : '未获取天气',
  };
}

// 给植物列表批量计算，并排序（到期的在前）
export function planAll(plants, weather) {
  return plants
    .map((p) => ({ plant: p, plan: computeWatering(p, weather) }))
    .sort((a, b) => a.plan.daysLeft - b.plan.daysLeft);
}

// 季节花事（修剪/换盆/施肥时机）+ 实时气温禁忌
function flowerTasks(season, temp) {
  const base = {
    spring: '春季是换盆分株、萌芽前修剪、施基肥的好时机；扦插繁殖也易成活。',
    summer: '夏季以遮阴防晒、通风降温为主；高温期暂停浓肥与重剪，花后轻剪残花即可。',
    autumn: '秋季渐凉，剪除枯枝黄叶、清理病残；控水停肥，入室前做好清园。',
    winter: '冬季防寒保暖为主，低温时不宜换盆与重剪，保持盆土偏干、停肥。',
  }[season];
  let caveat = '';
  if (temp !== null && temp >= 32) caveat = '当前高温（≥32℃），换盆/重剪请延后，等凉爽时再进行。';
  else if (temp !== null && temp <= 5) caveat = '当前低温（≤5℃），不宜换盆与修剪，以免伤根或冻害。';
  return { base, caveat };
}

// 依据天气给出病害风险与预防/喷药建议（天气驱动，并兼顾耐旱植物）
function diseaseAdvice(plant, temp, hum, daily) {
  const msgs = [];
  const willRain = daily.slice(0, 3).some(isRainy);
  const hArr = daily.slice(0, 3).map((d) => Number(d.humidity)).filter((n) => !isNaN(n));
  const meanHum = hArr.length ? hArr.reduce((a, b) => a + b, 0) / hArr.length : (hum ?? 50);

  if (temp !== null && temp >= 28 && hum !== null && hum < 50) {
    msgs.push('高温干燥，红蜘蛛（叶背小白点、叶片失绿）易爆发：多喷雾增湿、用水冲淋叶背，必要时喷阿维菌素');
  }
  if (temp !== null && temp >= 18 && temp <= 30 && (meanHum >= 85 || willRain)) {
    msgs.push('温暖高湿或连雨，白粉病、黑斑病、霜霉病高发：加强通风、避免叶面喷水，雨前/雨后喷多菌灵或百菌清预防');
  }
  if (temp !== null && temp <= 12 && meanHum >= 80) {
    msgs.push('低温高湿，灰霉病风险：控水通风，及时摘除残花病叶');
  }
  // 耐旱/多肉植物遇高湿或连雨 → 黑腐、化水
  if (plant.waterLevel === 'low' && (meanHum >= 80 || willRain)) {
    msgs.push('多肉/耐旱植物遇高湿或连雨易黑腐、化水：严格控水、避雨、保证通风，勿喷叶面水');
  }
  return msgs;
}

/**
 * 实时养护建议：把「物种特性 + 当地实时天气」合并成可执行的建议卡片。
 * 返回 { headline, items:[{icon,title,text}], season }，供植物详情页渲染。
 * 这是比「通用静态月历」更科学的方式：随真实温度/湿度/降水逐日变化。
 */
export function careAdvice(plant, rule, weather) {
  const plan = computeWatering(plant, weather);
  const season = seasonOf();
  const now = weather && weather.now;
  const temp = now ? Number(now.temp) : null;
  const hum = now ? Number(now.humidity) : null;

  const items = [];

  // 1) 浇水（实时）：间隔 + computeWatering 已生成的温湿度/降水短语
  const waterMain = plan.due
    ? '今天该浇水了'
    : `约 ${plan.daysLeft} 天后再浇（${plan.nextDate}）`;
  const waterExtra = plan.reasons.slice();
  items.push({
    icon: '💧',
    title: '浇水',
    text: waterMain + (waterExtra.length ? '；' + waterExtra.join('；') : '，按常规节奏') +
      `（基础间隔 ${plan.base} 天，当前系数 ${plan.factor}）`,
  });

  // 2) 光照（物种偏好 + 实时高温/低温提示）
  if (rule && rule.light) {
    let t = rule.light;
    if (temp !== null && temp >= 32) t += '；当前高温，注意遮阴、避开正午暴晒';
    else if (temp !== null && temp <= 5) t += '；低温注意保暖防冻';
    items.push({ icon: '☀️', title: '光照', text: t });
  }

  // 3) 增湿（喜水植物 + 空气偏干时）
  if (plant.waterLevel === 'high' && hum !== null && hum < 55) {
    items.push({ icon: '💦', title: '增湿', text: '空气偏干，常向叶面和周围喷雾增湿，避免叶尖发黄' });
  }

  // 4) 花事（修剪 / 换盆）—— 季节特点 + 实时气温禁忌
  const ft = flowerTasks(season, temp);
  items.push({ icon: '🌿', title: '花事（修剪/换盆）', text: ft.base + (ft.caveat ? ' ' + ft.caveat : '') });

  // 5) 防病喷药 —— 仅当天气存在病害风险
  const daily = (weather && weather.daily) || [];
  const dm = diseaseAdvice(plant, temp, hum, daily);
  if (dm.length) {
    items.push({ icon: '🛡️', title: '防病喷药', text: dm.join('；') });
  }

  // 6) 季节要点（物种静态习性，作为背景补充，而非孤立月历）
  if (rule && rule.season && rule.season[season]) {
    items.push({ icon: '📅', title: `${SEASON_LABEL[season]}季要点`, text: rule.season[season] });
  }

  const headline = now
    ? `🌡️ 当前 ${now.text} ${temp}℃ · 湿度 ${hum}% · ${plant.name}`
    : `🌡️ 未获取天气 · ${plant.name}（点首页「定位」开启实时建议）`;

  return { headline, items, season, weatherText: plan.weatherText };
}
