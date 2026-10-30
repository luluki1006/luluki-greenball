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
 * @param {object|null} weather 和风天气返回 { now, daily }
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
