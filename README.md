


# ResuGen v1.2

> Recruiters, if your candidates are too lazy to write their own resume, you are luck 'cause you got this.

ResuGen 是一个用于生成高端技术候选人中文简历的Skill。

它主要服务于高端技术招聘场景：当候选人没有正式简历、懒得准备简历，或只提供了碎片化材料时，ResuGen 可以基于访谈记录、LinkedIn 截图、个人主页、Google Scholar、GitHub、论文列表等信息，整理出一份面向业务负责人、面试官和内部评审使用的中文简历成品。

---

## 1. 核心用途

ResuGen 适用于以下场景：

- 候选人没有正式简历，需要招聘方代为整理
- 用户已经和候选人做过一手访谈，需要快速生成内部材料
- 候选人只有 LinkedIn、个人主页、Google Scholar、GitHub 等公开信息
- 需要把零散信息整理成业务可读的中文候选人简历
- 需要为 AI / ML / Infra / Agent / Multimodal / Product 等方向的人才生成推荐材料

---

## 2. 默认输出内容

默认生成一份中文简历成品，结构包括：

1. 推荐语 / 一句话推荐
2. 个人基本信息
3. 教育背景
4. 工作经历
5. 论文 / 专利 / 开源项目（如有）

默认不输出：

- 材料来源说明
- 面向对象说明
- 语言说明
- 候选人画像
- 技术能力拆解
- 目标岗位匹配度评估
- 待确认信息
- 关键情报
- 招聘官总结 / Final Pitch
- 建议面试问题

---

## 3. 目录结构

推荐目录结构如下：

```text
resugen_v1.2/
├── SKILL.md
├── README.md
└── references/
    └── resume_examples/
        ├── 黄杰.md
        ├── 李尚文中文简历.md
        ├── 林旭东.md
        ├── 沈卓然.md
        ├── CTZ简历.md
        └── Le Chen简历.md
