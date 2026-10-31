// 植物养护规则库 + 季节养护日历
// waterLevel: 'high' 喜水(浇勤) | 'mid' 中等 | 'low' 耐旱(少浇)
// baseDays: 该植物在“普通天气”下的基础浇水间隔（天）

export const WATER_LEVEL = {
  high: { label: '喜水', color: '#1565c0', baseDays: 3 },
  mid: { label: '中等', color: '#2e7d32', baseDays: 5 },
  low: { label: '耐旱', color: '#ef6c00', baseDays: 10 },
};

export const PLANTS = [
  { name: '绿萝', alias: ['黄金葛', '魔鬼藤'], waterLevel: 'high', light: '散射光', baseDays: 3,
    season: { spring: '生长旺季，保持盆土湿润，可每周施薄肥。', summer: '忌暴晒，多喷水增湿，2-3天浇一次。', autumn: '逐渐减少浇水，停肥。', winter: '控水保温，土干透再浇，低于10℃停肥。' },
    tips: '水培土培都易活，叶尖发黄多为缺水或空气太干。' },

  { name: '吊兰', alias: ['挂兰'], waterLevel: 'mid', light: '半阴', baseDays: 4,
    season: { spring: '可分株换盆，保持湿润。', summer: '避强光，常向叶面喷雾。', autumn: '正常养护，减少浇水。', winter: '入室保暖，盆土微干再浇。' },
    tips: '叶尖焦枯常因空气干燥或肥害，剪掉枯尖即可。' },

  { name: '龟背竹', alias: ['蓬莱蕉'], waterLevel: 'mid', light: '散射光', baseDays: 6,
    season: { spring: '换盆好时节，喜肥可每月一次。', summer: '高温期保持湿润并喷雾。', autumn: '控水。', winter: '少浇，防烂根。' },
    tips: '叶片不开背多因光照不足或苗龄小，属正常。' },

  { name: '多肉植物', alias: ['肉肉', '多浆', '雪天使', '冰梅', '景天'], type: 'succulent', waterLevel: 'low', light: '充足阳光', baseDays: 12,
    season: { spring: '生长季，土干透浇透。', summer: '高温休眠，遮阴控水，沿盆边少量给水。', autumn: '恢复生长，正常浇水。', winter: '5℃以下断水，放向阳处。' },
    habits: '多浆植物统称，储水耐旱，喜强光通风、怕积水怕闷湿；多数夏季高温半休眠、冬季低温断水；徒长=缺光，化水黑腐=浇多不通风。',
    prune: '极少修剪；枯叶及时摘除保持基部通风；徒长可砍头扦插；换盆在春秋生长季，盆土干透浇透。',
    pests: {
      spring: '生长季防介壳虫（茎叶小白点，用吡虫啉/酒精棉擦除）、蚜虫。',
      summer: '高温休眠严格控水，防黑腐/化水（严格控水、避雨、通风）；持续防蚧壳虫。',
      autumn: '恢复生长，正常浇水防根粉蚧。',
      winter: '低温断水，防冻伤；少病虫。',
    },
    tips: '徒长（变瘦拉长）= 缺光；化水腐烂 = 浇多/不通风。' },

  { name: '虎皮兰', alias: ['虎尾兰', '千岁兰'], waterLevel: 'low', light: '耐阴也耐晒', baseDays: 14,
    season: { spring: '可换盆分株。', summer: '正常浇水，忌积水。', autumn: '减少。', winter: '几乎断水，宁干勿湿。' },
    tips: '极耐旱，浇水多必烂根，是新手友好选手。' },

  { name: '芦荟', alias: [], waterLevel: 'low', light: '阳光充足', baseDays: 12,
    season: { spring: '生长快，土干透浇透。', summer: '适当遮午阳。', autumn: '控水。', winter: '断水保暖。' },
    tips: '叶发软褶皱是缺水；叶发黄化水是浇多了。' },

  { name: '发财树', alias: ['瓜栗'], waterLevel: 'low', light: '散射光', baseDays: 14,
    season: { spring: '可修剪造型。', summer: '保持通风。', autumn: '控水。', winter: '室内保暖，极少浇水。' },
    tips: '绝大多数死因是浇水过勤烂根，土干透再等两天浇。' },

  { name: '铜钱草', alias: ['香菇草'], waterLevel: 'high', light: '半日照', baseDays: 2,
    season: { spring: '水培土培皆宜，喜水喜肥。', summer: '不能断水，可半水半土。', autumn: '降温后生长放缓。', winter: '室内保暖，水培别冻。' },
    tips: '叶子耷拉立刻补水，缺水几小时就倒。' },

  { name: '富贵竹', alias: ['万年竹'], waterLevel: 'high', light: '散射光', baseDays: 4,
    season: { spring: '水培勤换水。', summer: '避晒。', autumn: '正常。', winter: '防冻，水培别低于10℃。' },
    tips: '水培生根前2-3天换一次水；叶黄多因水质或低温。' },

  { name: '君子兰', alias: [], waterLevel: 'mid', light: '半阴', baseDays: 7,
    season: { spring: '花期后换盆，施磷钾肥。', summer: '遮阴避暑，停肥。', autumn: '孕蕾期增光。', winter: '入室，控水促花。' },
    tips: '烂心多因叶心积水；夹箭可遮光升温催箭。' },

  { name: '文竹', alias: [], waterLevel: 'mid', light: '半阴', baseDays: 4,
    season: { spring: '可换盆。', summer: '忌干热风，常喷雾。', autumn: '正常。', winter: '保暖保湿。' },
    tips: '黄叶常因空气干燥或光照过强。' },

  { name: '茉莉', alias: ['茉莉花'], type: 'shrub', waterLevel: 'mid', light: '全日照', baseDays: 3,
    season: { spring: '萌芽前修剪，施酸性肥。', summer: '花期内见干见湿，薄肥勤施。', autumn: '花后修剪。', winter: '入室控水。' },
    habits: '木犀科常绿灌木，喜强光、喜温暖湿润、喜微酸性土壤；花期长（夏秋反复开花），极喜光，光照不足难开花；畏寒，北方冬季需入室。',
    prune: '早春萌芽前重剪（留基部10-15cm促新枝，新枝才开花）；花后及时剪残花并轻剪，促二茬花；疏除细弱枝、过密枝；秋季花后轻剪，控水停肥。',
    pests: {
      spring: '春季防蚜虫（嫩梢）、红蜘蛛（干燥时），喷吡虫啉/阿维菌素。',
      summer: '夏季多见红蜘蛛与介壳虫，加强通风并喷药；高温多湿防叶斑病。',
      autumn: '秋花后防蓟马（花瓣发褐），喷噻虫嗪。',
      winter: '入室保温，少病虫，注意通风防红蜘蛛。',
    },
    tips: '不开花多为光照不足；喜微酸土，偶尔浇硫酸亚铁。' },

  { name: '栀子花', alias: ['栀子'], waterLevel: 'high', light: '全日照', baseDays: 3,
    season: { spring: '花苞期保水保酸。', summer: '高温多浇，喷雾。', autumn: '控水。', winter: '入室保暖。' },
    tips: '黄叶掉苞常因碱土缺铁，浇硫酸亚铁可缓解。' },

  { name: '月季', alias: ['玫瑰', '月月红'], type: 'rose', waterLevel: 'mid', light: '全日照', baseDays: 3,
    season: { spring: '展叶即防虫，花后修剪施肥。', summer: '高温期清晨浇水。', autumn: '秋花后修剪。', winter: '休眠期重剪清园。' },
    habits: '落叶/半常绿灌木，喜强光、喜肥、喜通风；耐寒性较好，最怕闷热高湿与通风不良。多季重复开花品种（如杂交茶香月季）花后修剪可复花。',
    prune: '花后及时剪残花（在花下第2-3片五小叶上方饱满芽点处斜剪），促发新枝复花；冬季休眠期重剪，留主干约15-30cm，剪除细弱枝、交叉枝、病枝并清园；生长期疏除过密内膛枝改善通风。藤本月季（如蓝色阴雨）以牵引绑扎为主、花后只剪残花与侧枝、不似灌木重剪；微型月季（如果汁阳台）轻剪促分枝。',
    pests: {
      spring: '春季展叶即防蚜虫（嫩芽幼叶）与蔷薇叶蜂，喷吡虫啉/啶虫脒；同时预防黑斑病起步，雨前喷代森锰锌。',
      summer: '夏季高温高湿黑斑病、白粉病高发，雨前雨后喷露娜森/代森锰锌；红蜘蛛干燥时爆发，喷阿维菌素并冲淋叶背；务必加强通风。',
      autumn: '秋花后继续防黑斑病与红蜘蛛（同夏季），及时清理落叶减少病菌越冬。',
      winter: '冬季清园，剪去病枝并集中销毁，可喷石硫合剂封杀越冬病菌与虫卵。',
    },
    tips: '黑斑病、红蜘蛛高发，通风是第一要务。' },

  { name: '柠檬', alias: ['柑橘', '香柠檬', '桔', '橘', '橙子', '柚子', '金桔', '四季橘', '柠檬树'], type: 'citrus', waterLevel: 'mid', light: '全日照', baseDays: 4,
    season: { spring: '春梢老熟后疏梢保花保果，喜微酸土可施矾肥水。', summer: '抹夏梢保果、新梢摘心；避免环剥等重剪。', autumn: '采果后补肥恢复树势。', winter: '畏寒，5℃以下入室；冬季只剪病虫枝。' },
    habits: '常绿小乔木/灌木，喜温暖、喜强光、喜微酸性土壤（pH 5.5-6.5）；全年可多次开花结果，既观果又闻香；怕积水烂根，也怕严寒（低于5℃需入室保护）。',
    prune: '以疏剪为主：采果后剪除病虫枝、枯枝、内膛过密枝与徒长枝；春季疏梢保花保果；夏季抹除夏梢保果、新梢摘心；切勿像落叶果树那样冬季重剪，会削弱树势、影响来年花果。',
    pests: {
      spring: '春梢期防蚜虫、潜叶蛾（新叶卷曲），喷吡虫啉；红蜘蛛开始活动，注意检查叶背。',
      summer: '夏季红蜘蛛、蚧壳虫（枝干小白/褐点）猖獗，用阿维菌素+吡虫啉；溃疡病、炭疽病雨季喷铜制剂（氢氧化铜）或代森锰锌预防。',
      autumn: '秋梢期继续防潜叶蛾与红蜘蛛；采果后可喷一次保护性杀菌剂。',
      winter: '冬季清园，剪除病虫枝并集中销毁；重点是防寒（<5℃入室），低温期病害少但需防冻害。',
    },
    tips: '既观果又闻香；喜酸，黄叶可浇硫酸亚铁；新苗警惕黄龙病，买苗选无病来源。' },

  { name: '绣球', alias: ['八仙花'], waterLevel: 'high', light: '半阴', baseDays: 2,
    season: { spring: '萌芽展叶，喜水喜肥。', summer: '怕晒蔫，早晚浇水。', autumn: '剪残花。', winter: '落叶后修剪老枝。' },
    tips: '调蓝需酸性土+铝肥；蔫了多半是缺水，浇透即恢复。' },

  { name: '薄荷', alias: ['银丹草'], waterLevel: 'high', light: '全日照', baseDays: 2,
    season: { spring: '生长极快，可掐尖促分枝。', summer: '不能缺水，越剪越旺。', autumn: '正常。', winter: '地上部分枯，根越冬。' },
    tips: '最爱水与光，蔫了马上浇，涝点也不怕。' },

  { name: '向日葵', alias: ['太阳花（大）'], waterLevel: 'mid', light: '全日照', baseDays: 3,
    season: { spring: '直播育苗。', summer: '现蕾后需水大，清晨浇。', autumn: '收种。', winter: '一年生，结束。' },
    tips: '盆栽矮化品种更合适，高大种需深盆。' },

  { name: '矮牵牛', alias: [], waterLevel: 'mid', light: '全日照', baseDays: 2,
    season: { spring: '爆花季，勤摘残花。', summer: '天热需水大，早晚浇。', autumn: '秋花。', winter: '怕冷，室内过冬。' },
    tips: '晒足太阳才爆盆，阴处徒长少花。' },

  { name: '兰花', alias: ['国兰'], waterLevel: 'mid', light: '散射光', baseDays: 5,
    season: { spring: '花期后换植料。', summer: '通风遮阴，植料微润。', autumn: '孕蕾。', winter: '少水多见光。' },
    tips: '用专用兰土，忌园土；烂根多因植料不透气。' },

  { name: '蝴蝶兰', alias: [], waterLevel: 'mid', light: '散射光', baseDays: 6,
    season: { spring: '花后剪花梗，换水苔。', summer: '避晒。', autumn: '催花需温差。', winter: '室内保暖，根系发白再浇。' },
    tips: '用水苔别浇勤，根发灰皱才浇，泡盆法最好。' },

  { name: '三角梅', alias: ['叶子花'], waterLevel: 'low', light: '全日照', baseDays: 6,
    season: { spring: '修剪促花。', summer: '花前控水更易爆花。', autumn: '正常。', winter: '入室保暖。' },
    tips: '控水（叶软再浇）能逼出满树花；喜强光。' },

  { name: '橡皮树', alias: ['印度榕'], waterLevel: 'mid', light: '散射光', baseDays: 7,
    season: { spring: '生长快可施肥。', summer: '正常。', autumn: '控水。', winter: '少浇。' },
    tips: '耐阴但喜光，叶积灰影响呼吸，常擦叶。' },

  { name: '琴叶榕', alias: [], waterLevel: 'mid', light: '明亮散射', baseDays: 7,
    season: { spring: '换盆。', summer: '保湿。', autumn: '控水。', winter: '保暖。' },
    tips: '落叶黄叶常因浇水忽多忽少或通风差。' },

  { name: '金钱树', alias: ['雪铁芋'], waterLevel: 'low', light: '半阴', baseDays: 12,
    season: { spring: '生长季。', summer: '忌涝。', autumn: '控水。', winter: '断水。' },
    tips: '地下块茎储水，极耐旱，浇多必烂。' },

  { name: '豆瓣绿', alias: ['碧玉'], waterLevel: 'mid', light: '半阴', baseDays: 4,
    season: { spring: '可扦插。', summer: '喷雾。', autumn: '正常。', winter: '保暖。' },
    tips: '小巧桌面绿植，叶软即浇。' },

  { name: '常春藤', alias: [], waterLevel: 'mid', light: '半阴', baseDays: 4,
    season: { spring: '生长旺。', summer: '避烈阳。', autumn: '正常。', winter: '室内。' },
    tips: '垂吊佳品，空气干燥易叶黄，常喷雾。' },

  { name: '波斯顿蕨', alias: ['蕨'], waterLevel: 'high', light: '阴生', baseDays: 2,
    season: { spring: '分株。', summer: '高湿环境。', autumn: '正常。', winter: '保暖保湿。' },
    tips: '典型喜湿阴生，盆土不能干，常喷雾。' },

  { name: '铁线蕨', alias: [], waterLevel: 'high', light: '阴生', baseDays: 2,
    season: { spring: '喜湿。', summer: '喷雾。', autumn: '正常。', winter: '保暖。' },
    tips: '对干燥极敏感，叶卷即缺水。' },

  { name: '文心兰', alias: ['跳舞兰'], waterLevel: 'mid', light: '散射光', baseDays: 5,
    season: { spring: '花后换盆。', summer: '通风。', autumn: '催花。', winter: '少水。' },
    tips: '喜温暖湿润，薄肥勤施。' },

  { name: '长寿花', alias: ['圣诞伽蓝菜'], waterLevel: 'low', light: '全日照', baseDays: 7,
    season: { spring: '花后修剪。', summer: '遮午阳。', autumn: '孕蕾增光。', winter: '室内见光。' },
    tips: '多肉型，耐旱；徒长不开花=缺光。' },

  { name: '天竺葵', alias: ['洋绣球'], waterLevel: 'mid', light: '全日照', baseDays: 4,
    season: { spring: '盛花。', summer: '遮阴度夏。', autumn: '秋花。', winter: '室内。' },
    tips: '怕涝，土干再浇；气味驱虫。' },

  { name: '蟹爪兰', alias: [], waterLevel: 'mid', light: '散射光', baseDays: 5,
    season: { spring: '花后休养。', summer: '遮阴避暑。', autumn: '孕蕾（短日照）。', winter: '开花，保暖。' },
    tips: '茎节发软褶皱=缺水；落蕾多因温差大或移动。' },

  { name: '仙人掌', alias: ['仙人球'], waterLevel: 'low', light: '全日照', baseDays: 20,
    season: { spring: '生长。', summer: '少量水。', autumn: '控水。', winter: '断水。' },
    tips: '极耐旱，浇多必烂；开花品种需充足光照。' },

  { name: '绿宝石', alias: ['喜林芋'], waterLevel: 'mid', light: '散射光', baseDays: 6,
    season: { spring: '换盆。', summer: '保湿。', autumn: '控水。', winter: '少浇。' },
    tips: '大型观叶，攀援，需立柱。' },

  { name: '白掌', alias: ['和平芋', '一帆风顺'], waterLevel: 'high', light: '半阴', baseDays: 3,
    season: { spring: '生长。', summer: '喷雾。', autumn: '正常。', winter: '保暖。' },
    tips: '缺水即萎，浇透立挺；不开花可增光。' },

  { name: '红掌', alias: ['花烛'], waterLevel: 'high', light: '散射光', baseDays: 3,
    season: { spring: '生长。', summer: '保湿。', autumn: '正常。', winter: '保暖。' },
    tips: '喜高温高湿，叶黄多因低温或积水。' },

  { name: '鸭脚木', alias: ['鹅掌柴'], waterLevel: 'mid', light: '半阴', baseDays: 6,
    season: { spring: '生长。', summer: '正常。', autumn: '控水。', winter: '少浇。' },
    tips: '净化空气常见绿植，耐修剪。' },

  { name: '米兰', alias: ['米仔兰'], waterLevel: 'mid', light: '全日照', baseDays: 3,
    season: { spring: '生长旺盛。', summer: '喜水喜酸。', autumn: '控水。', winter: '入室。' },
    tips: '花香需足光与微酸土。' },

  { name: '桂花', alias: [], waterLevel: 'mid', light: '全日照', baseDays: 4,
    season: { spring: '萌芽。', summer: '花前保水。', autumn: '花期（9月）。', winter: '修剪。' },
    tips: '喜光喜肥，盆栽忌积水。' },

  { name: '茶花', alias: ['山茶'], waterLevel: 'mid', light: '半阴', baseDays: 4,
    season: { spring: '花后修剪。', summer: '花蕾期保水。', autumn: '孕蕾。', winter: '保暖。' },
    tips: '喜酸，黄叶浇硫酸亚铁；落蕾多因干湿剧变。' },

  { name: '杜鹃', alias: ['映山红'], waterLevel: 'high', light: '半阴', baseDays: 3,
    season: { spring: '盛花。', summer: '高湿遮阴。', autumn: '孕蕾。', winter: '保暖。' },
    tips: '喜酸喜湿，用酸性土，忌碱忌涝。' },

  { name: '薰衣草', alias: [], waterLevel: 'low', light: '全日照', baseDays: 8,
    season: { spring: '生长。', summer: '盛花。', autumn: '修剪。', winter: '室内保暖。' },
    tips: '香草类，怕涝怕阴，宁干勿湿。' },

  { name: '迷迭香', alias: [], waterLevel: 'low', light: '全日照', baseDays: 8,
    season: { spring: '生长。', summer: '正常。', autumn: '修剪。', winter: '室内。' },
    tips: '耐旱香草，浇多易枯。' },

  { name: '荷兰鸢尾', alias: ['鸢尾', '蓝蝴蝶', '扁竹花', 'iris'], type: 'bulb', waterLevel: 'mid', light: '充足光照', baseDays: 3,
    season: { spring: '萌芽生长、施基肥与1-2次液肥。', summer: '花期（4-6月）后养球，夏季忌积水防软腐。', autumn: '花后养球、秋末分株。', winter: '地上枯，球根留土休眠，防冻。' },
    habits: '鸢尾科宿根球根草本，性强健、耐寒、喜阳光充足的湿润环境；宜排水良好、肥沃的沙质/粘质壤土，忌土壤长期积水（易烂根、软腐病）；花后养球、2-3年分株一次。',
    prune: '花后及时剪除残花（保留叶片养球）；花后或初冬休眠期分株（每丛带2-3个芽），2-3年分一次；栽植忌过深，根茎要压实。',
    pests: {
      spring: '春季萌芽后防射干钻心虫（咬食茎基致萎蔫），5月幼虫期喷磷胺/毒死蜱。',
      summer: '夏季高温高湿忌积水，防软腐病（烂茎），发现病株挖除病部、换土重栽；豆金龟子可人工捕杀。',
      autumn: '秋部分株移栽，伤口蘸草木灰/硫磺粉防感染。',
      winter: '冬季地上部枯，球根留土越冬，少动。',
    },
    tips: '球根忌深栽、忌积水；软腐病是头号威胁。' },

  { name: '含羞草', alias: ['知羞草', '怕羞草', '感应草'], type: 'herb', waterLevel: 'high', light: '全日照', baseDays: 2,
    season: { spring: '3-4月播种，喜温湿、见光。', summer: '生长旺，每天浇水、略耐半阴。', autumn: '正常。', winter: '不耐寒，室内10℃以上可越冬，否则枯死。' },
    habits: '豆科含羞草属，热带蔓性草本（常作一年生栽培）；喜温暖湿润、阳光充足；不耐寒，低于10℃生长停滞、冬季易枯死；触碰小叶即闭合是其特性（频繁触动叶片需约1小时恢复）。',
    prune: '苗高约8cm可摘心控高、促分枝；一般无需重剪，作一年生欣赏；冬季枯死后可清理并重新播种。',
    pests: {
      spring: '春季少有病虫，偶见蛞蝓（撒石灰粉防治）。',
      summer: '夏季高温干旱早晚各浇一次，缺水叶下垂发黄；注意通风防介壳虫。',
      autumn: '秋凉正常。',
      winter: '冬季低温减少浇水、防冻，植株多自行枯死。',
    },
    tips: '触碰过多叶片需1小时恢复，别老逗它；喜阳怕冻。' },

  { name: '猪笼草', alias: ['猪笼'], type: 'carnivorous', waterLevel: 'high', light: '明亮散射光', baseDays: 2,
    season: { spring: '生长旺，换盆、补肥。', summer: '遮阴保湿，忌暴晒。', autumn: '放光足处利叶笼发育。', winter: '保温保湿越冬（≥16℃）。' },
    habits: '热带食虫附生植物，喜温暖（适温25-30℃）、高空气湿度（90%+）与半阴环境；极不耐寒（<16℃停长，10℃以下冻害）；以叶笼捕虫、不需施肥也能活；喜疏松透气基质（水苔/泥炭+树皮），宜用雨水或软水。',
    prune: '只剪除枯黄老叶与干瘪叶笼，不拔扯健康笼；每年2月新根未萌时换盆（水苔半年-一年需换新）；不需修剪造型。',
    pests: {
      spring: '春季高湿易生介壳虫（乐果喷杀）、叶斑病（代森锌）。',
      summer: '夏季遮阴防日灼，持续喷雾保湿度；介壳虫/叶斑病同春。',
      autumn: '秋冬季放阳光充足处利叶笼发育。',
      winter: '冬季保温≥16℃、湿度仍要够，防叶笼干瘪。',
    },
    tips: '用雨水/纯净水，自来水易伤根；湿度不够笼子长不出。' },

  { name: '捕蝇草', alias: ['捕虫草'], type: 'carnivorous', waterLevel: 'high', light: '全日照', baseDays: 2,
    season: { spring: '换土、全日照促红夹。', summer: '遮阴50%防灼伤，腰水保湿。', autumn: '正常。', winter: '休眠（0-8℃）或保暖续长，托盘水减量只保润。' },
    habits: '沼泽生食虫植物，喜阳光、喜酸怕盐；用无肥泥炭+珍珠岩或纯水苔，绝不可施固体肥（根系极不耐盐）；浇水须纯净水/雨水，采用“腰水法”托盘蓄水；有冬季休眠（0-8℃约6-8周），不经休眠也行但不利复壮。',
    prune: '几乎不需修剪；花茎可剪除以省养分（想观花则留）；每年春季换基质一次；枯叶摘除即可，别频繁触动夹子（每夹约闭合3次即枯）。',
    pests: {
      spring: '春季换土、全日照促红夹；少有病虫。',
      summer: '夏季遮阴50%防灼伤，腰水保湿；注意通风防根腐。',
      autumn: '秋凉正常。',
      winter: '冬季5℃左右让其休眠（0-8℃），或保暖续长；托盘水减量只保润。',
    },
    tips: '喂虫别喂肉（难消化）；自来水/肥料会咸死它。' },
];

// 按月通用养护日历（适用于大多数阳台/室内花草）
export const MONTHLY_CALENDAR = [
  { month: 1, title: '一月 · 越冬', tasks: ['绝大多数植物休眠，严格控制浇水，宁干勿湿', '畏寒植物（多肉、茉莉、米兰等）务必入室保暖', '停止施肥，避免低温伤根', '晴天中午可短暂通风'] },
  { month: 2, title: '二月 · 萌芽前', tasks: ['继续保温，少量植物开始苏醒', '整理工具，规划今年换盆与采购', '南北方差异大，按当地气温灵活调整'] },
  { month: 3, title: '三月 · 换盆季', tasks: ['气温回升，是换盆、分株、播种黄金期', '逐步恢复浇水与薄肥', '扦插繁殖好时机（绿萝、月季等）', '防倒春寒，晚霜前别急于出室'] },
  { month: 4, title: '四月 · 生长旺', tasks: ['生长旺季，水肥跟上', '月季、茉莉开始防虫（红蜘蛛、蚜虫）', '喜酸植物（栀子、杜鹃）可浇硫酸亚铁', '逐步增加光照'] },
  { month: 5, title: '五月 · 初夏', tasks: ['多数植物进入盛长期', '绣球、茉莉保水保肥', '梅雨区注意排水防烂根', '可继续扦插'] },
  { month: 6, title: '六月 · 梅雨/盛夏', tasks: ['梅雨地区控水、防徒长与黑斑病', '高温来临前遮阳网准备', '浇水改在清晨或傍晚', '加强通风，预防病虫害高发'] },
  { month: 7, title: '七月 · 酷暑', tasks: ['遮阴防晒，喜阴植物远离直射', '喜水植物（铜钱草、薄荷）不能断水', '多肉、仙人掌高温休眠严格控水', '停止重肥，薄肥勤施'] },
  { month: 8, title: '八月 · 高温持续', tasks: ['继续遮阴与补水', '台风暴雨后及时排水', '秋花植物（月季、矮牵牛）花后修剪', '注意红蜘蛛爆发'] },
  { month: 9, title: '九月 · 秋凉', tasks: ['气温回落，植物生长第二高峰', '恢复施肥，促秋花秋果', '多肉、仙人掌结束休眠，恢复正常浇水', '播种秋播花草'] },
  { month: 10, title: '十月 · 入室前', tasks: ['畏寒植物逐步移到室内/封闭阳台', '减少氮肥，增施磷钾提高抗寒', '清理枯叶病叶，降低越冬病害', '南方仍可户外'] },
  { month: 11, title: '十一月 · 保温', tasks: ['北方全面入室，控水停肥', '检查保温与补光设备', '月季、绣球可重剪清园', '仙人掌、多肉彻底断水'] },
  { month: 12, title: '十二月 · 休眠', tasks: ['保持越冬环境稳定，少折腾', '盘点一年养护，记录哪些好养哪些难养', '计划明春换盆与采购清单'] },
];

// 根据名称/别名模糊查找规则
export function findRule(name) {
  if (!name) return null;
  const n = String(name).trim().toLowerCase();
  return PLANTS.find((p) => {
    const pn = p.name.toLowerCase();
    if (pn === n) return true;
    // 植物名包含规则名（如“客厅绿萝”→绿萝，“阳台月季”→月季），且不误伤过短规则名
    if (pn.length >= 2 && n.includes(pn)) return true;
    return (p.alias || []).some((a) => {
      const al = a.toLowerCase();
      return al === n || n.includes(al) || al.includes(n);
    });
  }) || null;
}
