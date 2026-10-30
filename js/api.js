// 纯前端接口：浏览器直接调用和风天气 / 通义千问（两家均支持跨域 CORS）
// 密钥只存在你本机（设置里填写，存 IndexedDB），不上传任何服务器。
// 适合个人自用：密钥在你的设备上、调你自己的账号，安全可控。

const QW_GEO = 'https://geoapi.qweather.com/v2/city/lookup';
const QW_NOW = 'https://devapi.qweather.com/v7/weather/now';
const QW_7D = 'https://devapi.qweather.com/v7/weather/7d';
const DS_EP = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const VL_MODEL = 'qwen-vl-plus'; // 如需更高精度可改为 'qwen-vl-max'

// location 支持 "经度,纬度" 或直接城市名（如 "北京"）
async function resolveLocation(location, key) {
  if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(location.trim())) return location.trim();
  const r = await fetch(`${QW_GEO}?location=${encodeURIComponent(location)}&key=${encodeURIComponent(key)}`);
  const d = await r.json();
  if (d.code !== '200' || !d.location || !d.location.length) {
    throw new Error(d.message || ('城市 "' + location + '" 未找到，试试"经度,纬度"'));
  }
  return d.location[0].id;
}

export async function getWeather(location, key) {
  if (!key) throw new Error('请先在“设置”里填写和风天气 Key');
  const loc = await resolveLocation(location, key);
  const [nowR, d7R] = await Promise.all([
    fetch(`${QW_NOW}?location=${encodeURIComponent(loc)}&key=${encodeURIComponent(key)}`),
    fetch(`${QW_7D}?location=${encodeURIComponent(loc)}&key=${encodeURIComponent(key)}`),
  ]);
  const nowD = await nowR.json();
  const d7D = await d7R.json();
  if (nowD.code !== '200') throw new Error(nowD.message || ('天气实况失败(' + nowD.code + ')'));
  if (d7D.code !== '200') throw new Error(d7D.message || ('天气预报失败(' + d7D.code + ')'));

  const now = nowD.now || {};
  const daily = (d7D.daily || []).map((d) => ({
    date: d.fxDate,
    tempMax: d.tempMax,
    tempMin: d.tempMin,
    textDay: d.textDay,
    textNight: d.textNight,
    humidity: d.humidity,
    precip: Number(d.precip || 0),
  }));

  return {
    location: location,
    now: {
      temp: now.temp,
      text: now.text,
      humidity: now.humidity,
      feelsLike: now.feelsLike,
      windScale: now.windScale,
    },
    daily,
    source: 'qweather',
  };
}

export async function vision(image, prompt, key) {
  if (!key) throw new Error('请先在“设置”里填写通义千问 VL Key');
  const r = await fetch(DS_EP, {
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
  });
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

// 尝试从模型返回文本里解析 JSON（容错：截取到首个 { 与末个 }）
export function extractJSON(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (e) { /* 继续 */ }
  const s = text.indexOf('{');
  const e = text.lastIndexOf('}');
  if (s !== -1 && e !== -1 && e > s) {
    try { return JSON.parse(text.slice(s, e + 1)); } catch (e2) { /* ignore */ }
  }
  return null;
}
