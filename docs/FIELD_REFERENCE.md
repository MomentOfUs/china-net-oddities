# 人物档案 · 字段完全参考手册

> 本文档是编辑、修改、新建人物卷宗的唯一权威参考。
> 所有字段均以 `src/content/phenomenon/*.yaml` 为准，由 `src/content/config.ts` 的 Schema 强制校验。

---

## 快速上手：三步流程

```
① 复制本文末尾的【空白模板】
② 按本手册逐字段填写
③ pnpm run build 确认无报错后提交
```

**硬性规则：**
- 字段填错 Schema 类型 → `pnpm run build` 报错，网站无法构建
- `clearance` 只能是 `A` / `B` / `C` / `D` 四个字母之一
- `scores` 下所有子字段必须是 **0–10 的整数**
- 含特殊字符的字符串（含冒号 `:`、`#`、`<` 等 HTML）必须用**单引号或双引号**包裹

---

## 字段速查表

| 字段 | 必填 | 类型 | 一句话说明 |
|------|------|------|-----------|
| `title` | ✅ | 字符串 | 人物显示名 |
| `english_name` | 推荐 | 字符串 | 拼音/英文名 |
| `subtitle` | 推荐 | 字符串 | 首页卡片副标题 |
| `avatar` | ✅ | 路径 | 头像图片 |
| `hero` | 否 | 路径 | 详情页大背景图 |
| `hero_tag` | 推荐 | 字符串 | 详情页大图上方标签 |
| `hero_type` | 推荐 | 字符串 | 详情页大图下方分类 |
| `clearance` | ✅ | A/B/C/D | 解密等级 |
| `scores` | ✅ | 对象 | 六维评分 |
| `home_metadata` | ✅ | 对象 | 首页卡片元数据 |
| `ribbon` | 推荐 | 数组 | 详情页顶部四格数据条 |
| `main_stat` | ✅ | 对象 | 详情页核心数字大字报 |
| `data_grid` | 推荐 | 数组 | 核心数据 3×N 网格 |
| `body_grid` | 推荐 | 数组 | 档案属性明细网格 |
| `timeline` | 推荐 | 数组 | 时间线 |
| `quote` | 推荐 | 对象 | 经典语录大字报 |
| `quote_list` | 否 | 数组 | 语录列表 |
| `num_strip` | 否 | 数组 | 底部横向数字条 |
| `end_section` | 否 | 数组 | 档案末尾总结卡片组 |
| `video` | 否 | URL | B 站嵌入视频地址 |
| `comment` | ✅ | HTML字符串 | 档案注脚（事实叙述） |
| `essay` | ✅ | HTML字符串 | 编者按（深度分析） |
| `relics` | ✅ | 数组 | 时代物证陈列柜 |
| `glossary` | 推荐 | 数组 | 时代黑话边注 |
| `tags` | 推荐 | 数组 | 搜索标签 |
| `footer` | 推荐 | 字符串 | 数据来源声明 |

---

## 一、身份与基础信息

### `title` ✅ 必填
人物在网站上的**显示主名**。用最广为人知的称呼，而非本名。

```yaml
title: 峰哥
title: 阿Giao
title: 窃·格瓦拉（周立齐）   # 本名知名度高时可附带
```

---

### `english_name`
拼音或英文名，用于页面的次要展示和 slug 与内容的对应说明。

```yaml
english_name: Fengge (Zhou Lifeng)
english_name: A-Giao (Zhan Yapeng)
```

---

### `subtitle`
首页卡片和详情页的**副标题**，提炼人物最核心的标签，用 ` · ` 分隔。

```yaml
subtitle: B站抽象 · 猎奇访谈 · 全平台封禁
subtitle: 四川理塘 · 甜野男孩 · 国有网红
```

---

### `avatar` ✅ 必填
头像图片路径。图片放在 `public/images/avatars/` 下，文件名与 YAML 文件名一致。
建议使用 `.webp` 格式，尺寸 **360×360px**，风格偏复古、偏暗、偏灰。

```yaml
avatar: /images/avatars/fengge.jpg
avatar: /images/avatars/dingzhen.webp
```

---

### `hero`
详情页顶部大背景图。留空或省略则使用默认抽象几何纹理背景。
图片放在 `public/images/heros/` 下。

```yaml
hero: /images/heros/qiegela.webp
hero: ''   # 不用大图时写空字符串
```

---

### `hero_tag` / `hero_type`
详情页大图区域的两行文字标注。

```yaml
hero_tag: 抽象 · 猎奇 · 纪实       # 上方小标签
hero_type: 自导自演 · 抽象输出      # 下方分类描述
```

---

## 二、档案解密等级

### `clearance` ✅ 必填
**只能填 `A`、`B`、`C`、`D` 之一**（大写字母）。

| 等级 | 名称 | 判定标准 | 典型人物 |
|------|------|---------|---------|
| `D` | D级解密 · 日常娱乐 | 算法推波的娱乐快餐型网红 | 药水哥、阿Giao |
| `C` | C级限阅 · 底层挣扎 | 涉及底层生存危机、法制纠纷的命运切片 | 大力哥、窃·格瓦拉 |
| `B` | B级绝密 · 网络风暴眼 | 脱离个人意志，成为庞大符号，遭全网解构审丑 | 孙笑川、马保国 |
| `A` | A级封存 · 封锁遗迹 | 被全网物理封杀，消失在数字荒漠的"数字幽灵" | 铁山靠、秀才、郭老师 |

```yaml
clearance: C
```

---

## 三、六维评分

### `scores` ✅ 必填
六个维度各打 **0–10 的整数**分，对应入馆宪章（`docs/CHARTE.md`）的评价体系。总分 ≥ 36 为合格准入线。

```yaml
scores:
  popularity: 9    # 国民度：大众认知烈度与圈层跨越度
  dispute: 8       # 争议性：引发的撕裂度与讨论持续周期
  absurdity: 7     # 荒诞性：事件的离奇、反直觉、超现实程度
  slice: 8         # 时代切片性：能否作为特定时代的文化锚点
  narrative: 8     # 叙事弧光：命运轨迹的跌宕起伏与完整性
  native: 9        # 互联网原生性：影响力内生于互联网的程度
```

> **注**：`scores` 的数值同时在首页雷达图和 `/charte` 评分表中渲染，修改后两处都会更新。

---

## 四、首页卡片

### `home_metadata` ✅ 必填
控制首页人物卡片的展示内容。

```yaml
home_metadata:
  tag: 甜野男孩 · 国有网红 · 顶流风暴眼   # 卡片主分类标签（粗体展示）
  meta: '丁真珍珠 · <span class="hl">2001 —</span>'   # 副元数据，可用 span 高亮
  stats:                                  # 卡片底部快速数据（建议 2–4 项）
    - val: 7秒
      label: 走红视频
    - val: 213亿
      label: 话题阅读
    - val: 国企
      label: 有编制网红
```

> `meta` 常见格式：`本名 · <span class="hl">起始年 — 结束年或至今</span>`

---

## 五、详情页数据展示区

### `ribbon`
详情页顶部横向四格数据条（通常 4 项）。`color` 可设置强调色，省略则为默认白色。

| color 值 | 视觉效果 |
|---------|---------|
| `gold` | 金色高亮 |
| `red` / `danger` | 红色警示 |
| `warning` | 橙色警告 |
| `primary` | 主题蓝色 |

```yaml
ribbon:
  - label: 走红
    num: 2020.11.11
    note: 7秒视频
    color: gold
  - label: 月薪
    num: 3500
    note: 元/国企
  - label: 纪录片播放
    num: 7亿
    note: 72h
  - label: 甘孜旅游
    num: 385亿
    note: 收入
```

---

### `main_stat` ✅ 必填
详情页左侧核心数字大字报区域。

```yaml
main_stat:
  big_number: 385亿
  big_unit: 甘 孜 旅 游 收 入     # 字间加空格更有气势
  big_desc: 四川甘孜理塘 · 2001.5.7 · 藏族
  big_sublabel: '一个人用7秒视频<br>为一个县带来了不可逆的经济变迁'
  bio:
    - '2020.11.11 一段<b class="hl">7秒</b>视频走红，被称为"甜野男孩"'
    - '拒绝天价选秀合约，签国企月薪<b class="hlg">3500元</b>——有编制网红'
    - '<b class="hr">他不是英雄——他是处境</b>'
```

**`bio` 支持的 HTML 样式类：**

| 类名 | 效果 |
|------|------|
| `<b>` | 加粗 |
| `<b class="hl">` | 蓝色强调高亮 |
| `<b class="hlg">` | 绿色高亮 |
| `<b class="hr">` | 红色高亮（警示/负面） |
| `<span class="hl">` | 行内蓝色高亮 |
| `<span class="hr">` | 行内红色高亮 |
| `<span class="lt">` | 浅灰色小字 |

---

### `data_grid`
核心数据网格（通常 6–9 格，3列排列）。每格展示一个数字或数据点。

```yaml
data_grid:
  - label: 走红视频
    value: 7
    unit: 秒
  - label: 话题阅读
    value: 213
    unit: 亿
  - label: 理塘搜索
    value: '<span class="hl">暴涨620%</span>'
    unit: ''
```

---

### `body_grid`
人物档案属性明细网格（key-value 形式），通常 6–15 格，适合放详细的个人背景信息。

```yaml
body_grid:
  - label: 本名
    value: 周丽峰
    sub: 艺名更知名
  - label: 账号状态
    value: '<span class="hr">全平台封禁</span>'
    sub: 禁止关注
```

---

### `timeline`
时间线条目，按时间顺序排列，`year` 是左侧标注，`text` 是右侧描述，均支持 HTML。

```yaml
timeline:
  - year: 2020.11.11
    text: 摄影师胡波拍到他去买泡面，7秒视频引爆互联网
  - year: 2020.11
    text: '拒绝选秀签约理塘文旅，<b class="hlg">月薪3500+五险一金</b>，史上第一位编制网红'
```

---

### `quote`
详情页经典语录大字报（单条，最具代表性的一句话）。

```yaml
quote:
  text: 打工是不可能打工的，这辈子都不可能打工的。
  source: 周立齐 · 2012
```

---

### `quote_list`
语录列表（多条），支持 HTML 行内高亮。

```yaml
quote_list:
  - '<span class="hl">一给我里giao giao！</span> —— 从无意义到有意义，用了十年'
  - '我嘻哈玩的不是flow，<span class="hl">是giao式风格</span>'
```

---

### `num_strip`
底部横向数字条，用于放几个关键数字简报。

```yaml
num_strip:
  - label: 走红视频播放
    num: 1200万+
  - label: 纪录片播放
    num: 7亿
```

---

### `end_section`
详情页末尾的总结卡片组（通常 3–5 张），每张概括人物命运的一个阶段或侧面。

```yaml
end_section:
  - num: 超现实人生
    unit: 从放牛娃到国字号网红
    desc: '7秒视频走红 → 国企签约 → 联合国演讲<br><span class="lt">中国互联网最魔幻的剧本</span>'
  - num: 被封
    unit: '<span class="hr">2024</span>'
    desc: '因违反法律法规 全平台禁止关注<br><span class="lt">微博/B站/小红书/抖音</span>'
```

---

### `video`
B 站嵌入视频的 iframe 地址。不需要视频时写空字符串 `''`。

```yaml
video: 'https://player.bilibili.com/player.html?aid=80132338&bvid=BV1GJ411x7CE&cid=137102047&page=1'
video: ''
```

---

## 六、正文内容

### `comment` ✅ 必填
**档案注脚**：事实地基，给读者交代"这个人是谁、发生了什么"。

- 平实叙事，可以详细，不需要玩弄文字
- 支持 HTML：`<br>` 换段，`<b>`/`<b class="hl">` 强调关键词
- 与 `essay` 分工：comment 摆事实，essay 做判断，**内容不重复**

```yaml
comment: '<b>1991</b> · 河南许昌 · 展亚鹏 · 家中老六<br><br>他叫展亚鹏……'
```

> 📖 详细写作规范见 `docs/ESSAY_STYLE.md` → "comment 和 essay 的分工"

---

### `essay` ✅ 必填
**编者按**：深度分析，档案馆的"最终评语"。约 800 字，5–7 个自然段。

- 内容必须包裹在 `<p>…</p>` 段落标签中
- 语调：档案员冷峻评注，不站队，不道德审判，不展开论证洞察
- 每段都要推进分析，不复述 comment 中的事实

```yaml
essay: '<p>峰哥拍过一条视频……</p><p>没人说清楚……</p>'
```

> 📖 完整写作规范、自检清单见 `docs/ESSAY_STYLE.md`

---

## 七、三大拟物玩法字段

### `relics` ✅ 必填（新建档案必须有）
**时代物证陈列柜**：1–3 件随案物证，在详情页侧边以"玻璃标本盒"图标展示。

**写作公式**：用最冷冰冰的学术词汇解剖最粗鄙的网络名梗物。

```yaml
relics:
  - name: 晒干的苹果干
    desc: 展亚鹏成名前推小车卖苹果的实物切片，承载着未被算法卷入前的底层劳作宿命。
  - name: 破损的麦克风
    desc: 见证了其两度征战《中国新说唱》被无情淘汰，却借此收割了百万流量的荒诞演艺之路。
```

**✅ 好的 `desc` 特征：**
- 有具体地点或时间锚点（"2012年南宁某看守所外"）
- 有宏大的时代背景词汇（"华南电动车防盗技术迭代前夕"）
- 雅俗错位，反差越大越好

**❌ 避免：** 直白描述（"阿Giao拍视频时啃的玉米"），没有张力

---

### `glossary`
**时代黑话边注**：正文中出现匹配 `key` 的词时，页面自动显示虚线下划线，悬停弹出黄色便利贴。

**关键规则：**
- `key` 必须与正文中的字符**完全一致**（包括标点）
- `val` 写 1–2 句：先科普该词起源，再点出社会学象征意义

```yaml
glossary:
  - key: 一给我里giao giao
    val: 阿Giao在每段短视频结尾必喊的无意义拟音口号。它以反智、粗粝且极具节奏感的土味特质，成为2010年代末中国互联网快手下沉美学的集大成符号。
  - key: 正能量人生导师
    val: 阿Giao成名中期后的严肃转型定位，通过对社会底层青年的说教，完成了从"互联网审丑标本"到"大众励志导师"的二次洗脑。
```

---

## 八、辅助字段

### `tags`
搜索和分类标签，字符串数组。填 5–12 个关键词，包含：本名、外号、标志性事件、平台、文化标签。

```yaml
tags:
  - 阿giao
  - 土味
  - giao式
  - 展亚鹏
  - 新说唱
```

---

### `footer`
数据来源声明，显示在详情页底部。

```yaml
footer: 数据源 百度百科/新京报/澎湃新闻/央视新闻/知乎
```

---

## 九、常见错误速查

| 错误信息 | 原因 | 修复方式 |
|---------|------|---------|
| `Expected string` | 字段值含 HTML 未加引号 | 用单引号或双引号包裹整个值 |
| `Invalid enum value` | `clearance` 填了小写 a/b/c/d | 改为大写 `A`/`B`/`C`/`D` |
| `Expected number` | `scores` 下某字段填了字符串 | 改为纯整数，不加引号 |
| 正文黑话没有虚线下划线 | `glossary.key` 与正文文字不完全一致 | 复制正文原文粘贴为 key |
| 首页卡片没有出现 | `home_metadata` 字段缺失 | 补全 `tag` / `meta` / `stats` |

---

## 十、空白模板

复制以下模板新建人物档案：

```yaml
# ============================================================
# 人物档案模板 · 互联网奇观档案馆
# ============================================================

# 一、身份基础
title: 人物名
english_name: Pinyin
subtitle: 标签A · 标签B · 标签C

avatar: /images/avatars/filename.webp
hero: ''
hero_tag: 标签A · 标签B
hero_type: 分类描述A · 分类描述B

# 二、解密等级（必填：A / B / C / D）
clearance: D

# 三、六维评分（0–10 整数）
scores:
  popularity: 5
  dispute: 5
  absurdity: 5
  slice: 5
  narrative: 5
  native: 5

# 四、首页卡片
home_metadata:
  tag: 首页分类标签
  meta: '本名 · <span class="hl">YYYY —</span>'
  stats:
    - val: 数值
      label: 说明
    - val: 数值
      label: 说明
    - val: 数值
      label: 说明

# 五、详情页数据
ribbon:
  - label: 标签
    num: 数值
    note: 补充
    color: gold
  - label: 标签
    num: 数值
    note: 补充
  - label: 标签
    num: 数值
    note: 补充
  - label: 标签
    num: 数值
    note: 补充

main_stat:
  big_number: 核心大数字
  big_unit: 单 位 说 明
  big_desc: 补充说明文字
  big_sublabel: 最小字号说明
  bio:
    - 人物要点一
    - 人物要点二

data_grid:
  - label: 数据标签
    value: 数值
    unit: 单位
  - label: 数据标签
    value: 数值
    unit: 单位

body_grid:
  - label: 属性名
    value: 属性值
    sub: 补充说明

timeline:
  - year: YYYY
    text: 时间线事件描述

quote:
  text: 经典语录原文
  source: 人物名 · 年份

quote_list:
  - '<span class="hl">语录一</span> —— 背景说明'
  - '<span class="hl">语录二</span>'

num_strip:
  - label: 数字标签
    num: 数值

end_section:
  - num: 阶段名
    unit: 时间/分类
    desc: '这个阶段的描述<br><span class="lt">补充说明</span>'

video: ''

# 六、正文内容
comment: '<b>出生年</b> · 籍贯 · 本名<br><br>档案注脚正文……'

essay: '<p>编者按第一段——用画面开头，不用定义开头。</p><p>第二段……</p><p>最后一段——一句话合上卷宗。</p>'

# 七、三大拟物字段
relics:
  - name: 物证名称
    desc: 物证的博物馆学术解说词，用冷峻学术腔描述粗鄙网络名梗。
  - name: 物证名称二
    desc: 解说词……

glossary:
  - key: 正文中出现的黑话原词
    val: 1–2句：科普起源 + 社会学象征意义。
  - key: 另一个黑话
    val: 解释……

# 八、辅助
tags:
  - 标签一
  - 标签二
  - 标签三

footer: 数据源 来源一/来源二/来源三
```
