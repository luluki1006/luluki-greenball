// 纯前端接口：浏览器直接调用 Open-Meteo（天气，免 Key）与 通义千问（视觉识别）。
// 天气数据来自 Open-Meteo，完全免费、无需注册、无需密钥、支持浏览器跨域。
// 通义千问 Key 只存在你本机（设置里填写，存 IndexedDB），不上传任何服务器。

const OM_GEO = 'https://geocoding-api.open-meteo.com/v1/search';
const OM_FC = 'https://api.open-meteo.com/v1/forecast';
const DS_EP = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const VL_MODEL = 'qwen3-vl-plus'; // Qwen3-VL 视觉模型（原 qwen-vl-plus 已停用）；更高精度可改 'qwen-vl-max'（需在百炼模型广场开通）

// 带超时的 fetch：避免网络卡住导致「诊断中 / 获取天气中」永久不关闭
async function fetchWithTimeout(url, opts = {}, ms = 30000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('请求超时，请检查网络后重试');
    throw new Error('网络错误：' + e.message);
  } finally {
    clearTimeout(tid);
  }
}

// location 支持 "经度,纬度" 或直接城市名（如 "北京"）
async function resolveLatLon(location) {
  const s = location.trim();
  if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(s)) {
    const [lon, lat] = s.split(',').map(Number);
    return { lat, lon };
  }
  const r = await fetchWithTimeout(`${OM_GEO}?name=${encodeURIComponent(s)}&count=1&language=zh`, {}, 15000);
  const d = await r.json();
  if (!d.results || !d.results.length) {
    throw new Error('城市 "' + s + '" 未找到，试试"经度,纬度"或换个写法');
  }
  return { lat: d.results[0].latitude, lon: d.results[0].longitude };
}

// WMO 天气代码 → 中文描述（Open-Meteo 用 WMO code 表示天气现象）
const WMO = {
  0:'晴',1:'晴间多云',2:'局部多云',3:'阴',
  45:'雾',48:'雾凇',
  51:'小毛毛雨',53:'毛毛雨',55:'强毛毛雨',56:'冻毛毛雨',57:'冻毛毛雨',
  61:'小雨',63:'中雨',65:'大雨',66:'冻雨',67:'冻雨',
  71:'小雪',73:'中雪',75:'大雪',77:'雪粒',
  80:'阵雨',81:'阵雨',82:'强阵雨',
  85:'阵雪',86:'强阵雪',
  95:'雷阵雨',96:'雷阵雨伴冰雹',99:'强雷阵雨伴冰雹',
};
const wmoText = (c) => WMO[c] ?? '未知';

export async function getWeather(location) {
  if (!location) throw new Error('请先在“设置”里填写所在地或使用定位');
  const { lat, lon } = await resolveLatLon(location);
  const url = `${OM_FC}?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean' +
    '&timezone=auto&forecast_days=7';
  const r = await fetchWithTimeout(url, {}, 15000);
  const d = await r.json();
  if (d.error) throw new Error(d.reason || '天气获取失败');
  const now = d.current || {};
  const daily = d.daily || {};
  const dates = daily.time || [];
  const dailyArr = dates.map((date, i) => ({
    date,
    tempMax: daily.temperature_2m_max ? daily.temperature_2m_max[i] : null,
    tempMin: daily.temperature_2m_min ? daily.temperature_2m_min[i] : null,
    textDay: wmoText(daily.weather_code ? daily.weather_code[i] : null),
    textNight: wmoText(daily.weather_code ? daily.weather_code[i] : null),
    humidity: daily.relative_humidity_2m_mean ? daily.relative_humidity_2m_mean[i] : null,
    precip: daily.precipitation_sum ? Number(daily.precipitation_sum[i] || 0) : 0,
  }));
  return {
    location,
    now: {
      temp: now.temperature_2m,
      text: wmoText(now.weather_code),
      humidity: now.relative_humidity_2m,
      feelsLike: now.apparent_temperature,
      windScale: null,
    },
    daily: dailyArr,
    source: 'open-meteo',
  };
}

export async function vision(image, prompt, key) {
  if (!key) throw new Error('请先在“设置”里填写通义千问 VL Key');
  const r = await fetchWithTimeout(DS_EP, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + key,
    },
    body: JSON.stringify({
      model: VL_MODEL,
      input: {
        messages: [
          {
            role: 'user',
            content: [
              { image: image },
              { text: prompt },
            ],
          },
        ],
      },
    }),
  }, 30000);
  const d = await r.json();
  if (d.code && d.code !== '200') throw new Error(d.message || ('视觉识别失败(' + d.code + ')'));
  const content = d.output && d.output.choices && d.output.choices[0] && d.output.choices[0].message && d.output.choices[0].message.content;
  if (!content) throw new Error('视觉识别返回为空');
  // content 可能是 [{text:'...'}] 或字符串
  const text = Array.isArray(content) ? content.map((c) => c.text || '').join('') : String(content);
  return text;
}

// 文件 → base64 dataURL
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// 尝试从模型返回文本里解析 JSON（容错：支持对象/数组、去除 Markdown 代码围栏、尾随逗号）
export function extractJSON(text) {
  if (!text) return null;
  let t = String(text).trim();
  // 去掉 ```json ... ``` 或 ``` ... ``` 围栏
  t = t.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  try { return JSON.parse(t); } catch (e) { /* 继续 */ }
  const sArr = t.indexOf('['), eArr = t.lastIndexOf(']');
  const sObj = t.indexOf('{'), eObj = t.lastIndexOf('}');
  const trySlice = (s, e) => {
    if (s === -1 || e === -1 || e <= s) return null;
    let sub = t.slice(s, e + 1).replace(/,(\s*[}\]])/g, '$1'); // 去尾随逗号
    try { return JSON.parse(sub); } catch (err) { return null; }
  };
  // 优先取数组（订单/列表场景），否则取对象
  if (sArr !== -1 && (sObj === -1 || sArr < sObj)) {
    const v = trySlice(sArr, eArr); if (v) return v;
  }
  return trySlice(sObj, eObj);
}
