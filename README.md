


# ResuGen v1.2
### 高端技术候选人中文简历生成器

> Recruiters, if your candidates are too lazy to write their own resume, you are luck 'cause you got this.

ResuGen 是一个为高端技术招聘场景设计的 WorkBuddy Skill。  
它的任务很简单：当候选人没有正式简历、懒得准备简历，或者只给了一堆碎片信息时，帮你把材料整理成一份 **业务可读、面试官友好、可以直接交付的中文简历成品**。

简单说：

> 你丢进来访谈记录、LinkedIn、个人主页、Google Scholar、GitHub、论文列表；  
> ResuGen 帮你整理成一份像样的中文候选人简历。🧩➡️📄

---

## 1. 它适合什么时候用？🚀

ResuGen 特别适合这些场景：

- 候选人没有正式简历，需要招聘方代为整理
- 候选人很强，但材料很散：LinkedIn、主页、Scholar、GitHub 到处都是
- 你已经做了一手访谈，需要快速给业务 / 面试官一版候选人材料
- 需要把技术候选人的经历整理成简洁中文简历
- 需要为 AI / ML / Infra / Agent / Multimodal / Product 等方向人才生成推荐材料

一句话：  
**当信息很散，但你需要一份能交付的中文简历时，就用它。**

---

## 2. 默认会生成什么？📄

ResuGen 默认生成一份中文简历成品，通常包括：

1. 推荐语 / 一句话推荐
2. 个人基本信息
3. 教育背景
4. 工作经历
5. 论文 / 专利 / 开源项目（如有）

它默认不会写这些：

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

这些内容不是不能写，而是默认不写。  
只有你明确说“给我完整评估版”时，它才会展开。🧠

---

## 3. 目录应该长什么样？📁

推荐目录结构：

```text
resugen_v1.2/
├── SKILL.md
├── README.md
└── references/
    └── resume_examples/
        ├── candidate_a_resume.md
        ├── candidate_b_resume.md
