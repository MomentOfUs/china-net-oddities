#!/usr/bin/env python3
"""Build internet-phenomenon site.
Usage: python3 build.py          # builds to /tmp/site-out/
       python3 build.py deploy   # builds + deploys to /var/www/prospettiva/
"""
import os, sys, glob, subprocess
import yaml
from jinja2 import Environment, FileSystemLoader

ROOT = "/var/www/prospettiva"
DATA_DIR = os.path.join(ROOT, "data")
TPL_DIR = os.path.join(ROOT, "tpl")
IMG_DIR = os.path.join(ROOT, "images")
OUT_DIR = "/tmp/site-out"

yaml.reader.Reader.check_printable = lambda self, data: None

# Supported image file extensions in priority order
IMG_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]


def resolve_image(slug, suffix=""):
    """Auto-detect image by naming convention: images/{slug}{suffix}.{ext}
    
    Convention:
      images/{slug}.jpg            — hero background (full-width banner)
      images/{slug}-hero.jpg       — hero background (overrides slug.jpg)
      images/{slug}-avatar.jpg     — card thumbnail (overrides slug.jpg)
    
    Also copied to /images/ URL path automatically via Nginx.
    """
    for ext in IMG_EXTENSIONS:
        path = os.path.join(IMG_DIR, f"{slug}{suffix}{ext}")
        if os.path.exists(path):
            return f"/images/{slug}{suffix}{ext}"
    return None


PAGE_CONFIG = {
    "liangzi": {
        "tag": "推荐",
        "meta": '李占良 · 良子大胃袋 · <span class="hl">1993 —</span>',
        "stats": [{"val": "410", "label": "巅峰体重(斤)"}, {"val": "150", "label": "胃袋(斤)"},
                   {"val": "300万", "label": "年收入"}, {"val": "29万", "label": "虎扑男神票"}],
    },
    "fanxiaoqin": {
        "tag": "被制造的奇观",
        "meta": '"小马云" · <span class="hl">2008 —</span>',
        "stats": [{"val": "8岁", "label": "被带走"}, {"val": "13岁", "label": "被送回"},
                   {"val": "智力二级", "label": "诊断"}],
    },
    "fengge": {
        "tag": "自导自演 · 抽象输出",
        "meta": '资本峰 · 婆罗门 · <span class="hl">2019 — 2024</span>',
        "stats": [{"val": "190w", "label": "B站粉丝"},
                   {"val": "1527w", "label": "巅峰播放"},
                   {"val": "2024", "label": "封禁"}],
    },
    "gazi": {
        "tag": "潘嘎之交 · 你把握不住",
        "meta": '谢孟伟 · 嘎子 · <span class="hl">1989 —</span>',
        "stats": [{"val": "1116万", "label": "快手粉丝"}, {"val": "潘嘎之交", "label": "2021年度热词"}, {"val": "2200万", "label": "最高负债"}],
    },
    "zhangxuefeng": {
        "tag": "全网群嘲的教育顶流",
        "meta": '张子彪 · <span class="hl">1984 — 2026</span>',
        "stats": [{"val": "2016", "label": "7分钟爆红"}, {"val": "41岁", "label": "心源性猝死"},
                   {"val": "18999", "label": "最高套餐(元)"}],
    },
    "dailanzi": {
        "tag": "抽象带专生 · 土狗进城 · 不要当带孝子",
        "meta": '陈冷静 · 陈E · <span class="hl">~1998 —</span>',
        "stats": [{"val": "90万+", "label": "B站粉丝"}, {"val": "土狗进城", "label": "出圈代表作"},
                   {"val": "大专", "label": "辍学"}, {"val": "抽象", "label": "当代生活"}],
    },
    "daoge": {
        "tag": "fw刀 · 二次元刀酱 · 我不道啊",
        "meta": '刀哥 · 二次元刀酱一刀哥 · <span class="hl">~1990 —</span>',
        "stats": [{"val": "fw刀", "label": "东北往事定位"}, {"val": "我不道啊", "label": "传世语录"},
                   {"val": "2019", "label": "B站转型"}, {"val": "刀酱", "label": "coser新身份"}],
    },
    "dingzhen": {
        "tag": "甜野男孩 · 国有网红 · 顶流风暴眼",
        "meta": '丁真珍珠 · <span class="hl">2001 —</span>',
        "stats": [{"val": "7秒", "label": "走红视频"}, {"val": "213亿", "label": "话题阅读"},
                   {"val": "国企", "label": "有编制网红"}],
    },
    "sanheshen": {
        "tag": "躺平元祖 · 日结江湖 · 挂逼天堂",
        "meta": '深圳龙华三和 · <span class="hl">2016 — 2020</span>',
        "stats": [{"val": "2万", "label": "巅峰人群"}, {"val": "15元", "label": "日均生活费"},
                   {"val": "4元", "label": "一瓶红牛"}],
    },
    "wujing": {
        "tag": "战狼文化图腾 · 票房碾压机",
        "meta": '吴京 · <span class="hl">1974 —</span>',
        "stats": [{"val": "279亿", "label": "一番总票房"}, {"val": "325亿", "label": "主演总票房"},
                   {"val": "10/10", "label": "争议指数"}],
    },
    "wangweiheng": {
        "tag": "润人顶流 & 街头笑话",
        "meta": '王伟恒 · <span class="hl">1988 —</span>',
        "stats": [{"val": "2022", "label": "走线美国"}, {"val": "20美元", "label": "买不起甜甜圈"},
                   {"val": "街头", "label": "现状"}],
    },
    "huge": {
        "tag": "沈阳大街霸主 · 好果汁 · 二次元教父",
        "meta": '柴浩 · 虎哥 · <span class="hl">1994 —</span>',
        "stats": [{"val": "沈阳大街", "label": "封神之地"}, {"val": "好果汁", "label": "年度弹幕"},
                   {"val": "2018", "label": "B站爆红"}, {"val": "二次元", "label": "教父转型"}],
    },
    "laoa": {
        "tag": "封号斗士 · 时代代言人",
        "meta": 'Alex · 斯奎奇大王 · <span class="hl">2025 —</span>',
        "stats": [{"val": "50w+", "label": "B站粉丝"}, {"val": "多次", "label": "封号"},
                   {"val": "2025", "label": "争议爆发"}, {"val": "撕裂", "label": "舆论等级"}],
    },
    "shamatetuanzhang": {
        "tag": "杀马特最后的代表 · 虎哥大战杀马特",
        "meta": '杀马特团长 · 沈阳大街另一极 · <span class="hl">~1990 —</span>',
        "stats": [{"val": "彩色假发", "label": "标志造型"}, {"val": "虎哥大战", "label": "经典对决"},
                   {"val": "杀马特", "label": "亚文化标本"}, {"val": "寸头", "label": "回归平凡"}],
    },
    "shenyingheishou": {
        "tag": "西西里教父 · 比划比划 · 超级变换形态",
        "meta": '神鹰黑手 · 黑手哥 · <span class="hl">~1980 —</span>',
        "stats": [{"val": "比划比划", "label": "核心梗"}, {"val": "西西里", "label": "教父人设"},
                   {"val": "2025", "label": "大厦崩塌"}, {"val": "超级形态", "label": "yygq持续"}],
    },
    "sunxiaochuan": {
        "tag": "抽象教父 · 狗粉丝 · 6324",
        "meta": '孙笑川 · 带带大师兄 · <span class="hl">1990 —</span>',
        "stats": [{"val": "200w+", "label": "斗鱼巅峰关注"}, {"val": "100+", "label": "贡献梗"},
                   {"val": "全部", "label": "被封平台"}, {"val": "∞", "label": "假号数量"}],
    },
    "changshu_anuo": {
        "tag": "健丑第一人 · 那我问你 · 头顶尖尖",
        "meta": '盛亦陶 · 常熟阿诺 · <span class="hl">1994 —</span>',
        "stats": [{"val": "44w", "label": "抖音粉丝"}, {"val": "无数", "label": "传世圣经"},
                   {"val": "3", "label": "参赛次数"}, {"val": "健丑", "label": "抽象至极"}],
    },
    "laochen": {
        "tag": "反诈先锋 · 国家反诈APP代言人",
        "meta": '陈国平 · 反诈警官老陈 · <span class="hl">1978 —</span>',
        "stats": [{"val": "181w", "label": "抖音巅峰粉丝"}, {"val": "100万+", "label": "单场打赏"},
                   {"val": "2022", "label": "辞去公职"}, {"val": "后悔", "label": "公开道歉"}],
    },
    "xiucai": {
        "tag": "中老年妇女收割机 · 油头西装对口型",
        "meta": '徐某某 · 秀才 · <span class="hl">~1984 — 2023</span>',
        "stats": [{"val": "1054w", "label": "抖音粉丝"}, {"val": "70%", "label": "女性粉丝"},
                   {"val": "2023", "label": "封号"}, {"val": "封禁", "label": "税收违法"}],
    },
    "lili": {
        "tag": "拷打之王 · 徒步造假 · 戴维董事长",
        "meta": '刘建龙 · 丽丽 · <span class="hl">1988 —</span>',
        "stats": [{"val": "小学", "label": "文化程度"}, {"val": "徒步", "label": "电动代步造假"},
                   {"val": "拷打", "label": "嘴臭连麦出圈"}, {"val": "快手", "label": "永久封禁"}],
    },
    "mabaoguo": {
        "tag": "不讲武德 · 太极大师 · 浑元形意拳",
        "meta": '马保国 · 浑元形意太极拳掌门 · <span class="hl">1952 —</span>',
        "stats": [{"val": "2020", "label": "年度梗王"}, {"val": "30秒", "label": "KO时长"},
                   {"val": "4", "label": "传世圣经"}, {"val": "全网", "label": "鬼畜狂欢"}],
    },
    "maoyibei": {
        "tag": "巴黎捡作业 · 全网造假风波",
        "meta": '猫一杯 · Thurman · <span class="hl">~2020 — 2024</span>',
        "stats": [{"val": "1500w+", "label": "全平台粉丝"}, {"val": "巴黎", "label": "捡作业"},
                   {"val": "2024", "label": "翻车"}, {"val": "封禁", "label": "账号"}],
    },
    "yangli": {
        "tag": "普通且自信 · 性别战争的中心",
        "meta": '杨笠 · 脱口秀演员 · <span class="hl">1992 —</span>',
        "stats": [{"val": "2020", "label": "爆梗之年"}, {"val": "五个字", "label": "引爆全网"},
                   {"val": "英特尔", "label": "代言风波"}, {"val": "符号", "label": "不可回避"}],
    },
    "yaoshuige": {
        "tag": "抽象艺术家 · 你配吗 · 药水哲学",
        "meta": '刘波 · 药水哥 · <span class="hl">~1995 —</span>',
        "stats": [{"val": "200w+", "label": "斗鱼巅峰粉丝"}, {"val": "你配吗", "label": "三字封神"},
                   {"val": "无数次", "label": "被封纪录"}, {"val": "抽象", "label": "代名词"}],
    },
    "yujie": {
        "tag": "东北女王 · 穿上",
        "meta": '常小雨 · 东北雨姐 · <span class="hl">~2022 —</span>',
        "stats": [{"val": "2000w+", "label": "抖音粉丝"}, {"val": "穿上！！", "label": "招牌口号"},
                   {"val": "2024", "label": "争议"}, {"val": "真实", "label": "人设质疑"}],
    },
}


def load_data():
    data = {}
    for f in sorted(glob.glob(os.path.join(DATA_DIR, "*.yaml"))):
        slug = os.path.splitext(os.path.basename(f))[0]
        with open(f, "r", encoding="utf-8") as fh:
            d = yaml.safe_load(fh)

        # ── Auto-detect images ──────────────────────────────────
        # Priority: YAML field override > convention-based detection
        #
        # hero:    used as full-width hero background on detail page
        # avatar:  used as card thumbnail on index page
        #
        # File naming convention (drop in /images/ dir):
        #   {slug}.jpg           → both hero + avatar (if no-specific variant)
        #   {slug}-hero.jpg      → hero only
        #   {slug}-avatar.jpg    → avatar only

        d["hero"] = d.get("hero") or resolve_image(slug, "-hero") or resolve_image(slug) or resolve_image(slug, "-avatar") or "/images/placeholder.svg"
        d["avatar"] = d.get("avatar") or resolve_image(slug, "-avatar") or resolve_image(slug) or "/images/placeholder-avatar.svg"

        data[slug] = d

        # Log what was detected
        img_marks = []
        if d.get("hero"): img_marks.append("hero")
        if d.get("avatar"): img_marks.append("avatar")
        img_info = f"  [{', '.join(img_marks)}]" if img_marks else ""
        print(f"  Loaded {slug}.yaml{img_info}")
    return data


def build():
    print("Building internet-phenomenon site...")
    os.makedirs(OUT_DIR, exist_ok=True)
    data = load_data()
    env = Environment(loader=FileSystemLoader(TPL_DIR))

    for slug, d in sorted(data.items()):
        with open(os.path.join(OUT_DIR, f"{slug}.html"), "w", encoding="utf-8") as f:
            f.write(env.get_template("page.html.j2").render(data=d))
        print(f"  -> {slug}.html")

    entries = []
    for slug in sorted(PAGE_CONFIG.keys()):
        d = data.get(slug)
        if not d:
            continue
        cfg = PAGE_CONFIG[slug]
        entries.append({
            "filename": f"{slug}.html",
            "avatar": d.get("avatar", ""),
            "title": d.get("title", ""),
            "tag": cfg["tag"],
            "meta": cfg["meta"],
            "stats": cfg["stats"],
        })

    with open(os.path.join(OUT_DIR, "index.html"), "w", encoding="utf-8") as f:
        f.write(env.get_template("index.html.j2").render(entries=entries))
    print("  -> index.html")
    return True


def deploy():
    for fn in os.listdir(OUT_DIR):
        if fn.endswith(".html"):
            subprocess.run(["sudo", "cp", os.path.join(OUT_DIR, fn), os.path.join(ROOT, fn)])
    # Ensure /images/ is world-readable for Nginx
    subprocess.run(["sudo", "chmod", "-R", "755", IMG_DIR])
    print(f"  Deployed to {ROOT}")


if __name__ == "__main__":
    if build():
        if len(sys.argv) > 1 and sys.argv[1] == "deploy":
            deploy()
        print("Done")
