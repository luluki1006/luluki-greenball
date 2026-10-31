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

// 根据植物名称（含用户自定义名）推断园艺类别，从而实现「因种而异」的花事与病害建议
export function inferType(name = '') {
  const n = String(name).toLowerCase();
  const table = [
    ['rose', ['月季', '玫瑰', '蔷薇', '月月红', '藤本月季']],
    ['citrus', ['柠檬', '柑橘', '橙', '柚', '桔', '橘', '金桔', '柚子']],
    ['succulent', ['多肉', '肉肉', '仙人掌', '芦荟', '景天', '玉露', '胧月', '石莲']],
    ['orchid', ['兰', '蝴蝶兰', '石斛', '文心兰', '春兰', '蕙兰']],
    ['herb', ['薄荷', '罗勒', '百里香', '紫苏', '矮牵牛', '向日葵', '三色堇', '玛格丽特']],
    ['shrub', ['茉莉', '栀子', '绣球', '杜鹃', '茶花', '瑞香', '丁香', '三角梅']],
    ['foliage', ['绿萝', '吊兰', '龟背竹', '文竹', '富贵竹', '铜钱草', '蕨', '常春藤', '万年青', '竹芋', '合果芋']],
    ['tree', ['发财树', '幸福树', '鸭脚木', '橡皮树', '琴叶榕', '榕树', '平安树']],
  ];
  for (const [t, kws] of table) if (kws.some((k) => n.includes(k))) return t;
  return 'generic';
}

// 不同类别的修剪/换盆/施肥时机（季节驱动），远比“一刀切”科学
const FLOWER = {
  rose: {
    spring: '月季展叶后抹除过密芽、疏枝；现蕾前施磷钾肥，花前重点防虫。',
    summer: '高温期只轻剪疏密、剪残花，切勿重剪伤株；清晨浇水避开正午。',
    autumn: '秋花后轻剪残花并施一次磷钾肥壮枝，准备越冬。',
    winter: '休眠期重剪（保留 15–30cm，剪除细弱/病枝/交叉枝），清园减少黑斑病源。',
  },
  citrus: {
    spring: '春梢老熟后疏梢、保花保果；可施腐熟有机肥，喜微酸土。',
    summer: '抹除夏梢保果、新梢摘心；避免环剥等重剪，以免落果。',
    autumn: '采果后轻剪病虫枝、枯枝与内膛过密枝，补充养分。',
    winter: '常绿果树，冬季只剪病虫枝/枯枝，切勿重剪（会削弱树势、影响来年开花结果）。',
  },
  shrub: {
    spring: '萌芽前轻剪整形，花前增光、施花肥。',
    summer: '花后及时剪残花促复花；高温遮阴、通风。',
    autumn: '花后轻剪，控水停肥。',
    winter: '入室保暖，仅剪枯枝，尽量少动剪。',
  },
  succulent: {
    spring: '生长季，徒长可砍头繁殖；摘除枯叶保持通风。',
    summer: '高温休眠，不修剪不施肥，遮阴控水。',
    autumn: '恢复生长，可换盆分株。',
    winter: '低温断水，不操作，防冻。',
  },
  herb: {
    spring: '生长快，勤摘心/掐尖促分枝、及时摘残花。',
    summer: '越摘越旺，残花随清，不能缺水。',
    autumn: '秋花继续摘心；一年生准备收种。',
    winter: '怕冷品种入室，多年生地上枯、根越冬。',
  },
  orchid: {
    spring: '花后剪花梗（留节点有望再花），换植料。',
    summer: '遮阴通风，植料微润不积水。',
    autumn: '孕蕾期增光。',
    winter: '少水多见光，根发白再浇。',
  },
  foliage: {
    spring: '可换盆分株、剪黄叶促新叶。',
    summer: '忌暴晒，常喷雾；随时剪枯黄叶。',
    autumn: '减少浇水，正常养护。',
    winter: '控水保温，仅剪枯叶。',
  },
  tree: {
    spring: '可修剪造型、摘心促分枝。',
    summer: '保持通风，正常养护。',
    autumn: '控水。',
    winter: '室内保暖，极少动剪。',
  },
  generic: {
    spring: '春季是换盆分株、萌芽前修剪、施基肥的好时机；扦插繁殖也易成活。',
    summer: '夏季以遮阴防晒、通风降温为主；高温期暂停浓肥与重剪，花后轻剪残花即可。',
    autumn: '秋季渐凉，剪除枯枝黄叶、清理病残；控水停肥，入室前做好清园。',
    winter: '冬季防寒保暖为主，低温时不宜换盆与重剪，保持盆土偏干、停肥。',
  },
};

// 季节花事（因植物类别而异）+ 实时气温禁忌
function flowerTasks(type, season, temp) {
  const base = (FLOWER[type] || FLOWER.generic)[season];
  let caveat = '';
  if (temp !== null && temp >= 32) caveat = '当前高温（≥32℃），换盆/重剪请延后，等凉爽时再进行。';
  else if (temp !== null && temp <= 5) caveat = '当前低温（≤5℃），不宜换盆与重剪，以免伤根或冻害。';
  return { base, caveat };
}

// 依据天气 + 植物类别给出病害风险与预防/喷药建议
function diseaseAdvice(type, plant, temp, hum, daily) {
  const msgs = [];
  const willRain = daily.slice(0, 3).some(isRainy);
  const hArr = daily.slice(0, 3).map((d) => Number(d.humidity)).filter((n) => !isNaN(n));
  const meanHum = hArr.length ? hArr.reduce((a, b) => a + b, 0) / hArr.length : (hum ?? 50);

  // —— 与天气相关的通用病害 ——
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

  // —— 类别专属病害（因种而异）——
  if (type === 'rose') {
    msgs.push('月季专属：黑斑病（叶现黄褐圆斑、落叶）与白粉病（叶背白霜）高发，雨前雨后喷代森锰锌/多菌灵预防；红蜘蛛用阿维菌素；通风是第一要务');
  }
  if (type === 'citrus') {
    msgs.push('柑橘类专属：红蜘蛛、蚧壳虫（枝干褐/白小点）常见，用阿维菌素/吡虫啉；溃疡病、炭疽病雨季喷铜制剂或代森锰锌；新苗警惕黄龙病，务必买无病苗');
  }
  if (type === 'orchid') {
    msgs.push('兰花专属：软腐病、茎腐病多在闷湿时爆发，植料要透气、浇水后吹干叶心；两腐病可用链霉素预防');
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

  // 植物类别：优先用规则库标注，否则按名称关键词推断（兼容用户自定义名）
  const type = (rule && rule.type) || inferType(plant.name);

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

  // 4) 花事（修剪 / 换盆）—— 因植物类别而异 + 实时气温禁忌
  const ft = flowerTasks(type, season, temp);
  items.push({ icon: '🌿', title: '花事（修剪/换盆）', text: ft.base + (ft.caveat ? ' ' + ft.caveat : '') });

  // 5) 防病喷药 —— 仅当天气存在病害风险（且按类别补充专属病害）
  const daily = (weather && weather.daily) || [];
  const dm = diseaseAdvice(type, plant, temp, hum, daily);
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
