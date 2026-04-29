const notesEl = document.querySelector("#candidateNotes");
const targetRoleEl = document.querySelector("#targetRole");
const highlightEl = document.querySelector("#highlight");
const exclusionsEl = document.querySelector("#exclusions");
const statusEl = document.querySelector("#inputStatus");
const previewEl = document.querySelector("#resumePreview");
const generateBtn = document.querySelector("#generateResume");
const sampleBtn = document.querySelector("#loadSample");
const promptBtn = document.querySelector("#copyPrompt");
const copyBtn = document.querySelector("#copyOutput");
const downloadBtn = document.querySelector("#downloadOutput");
const conservativeEl = document.querySelector("#conservativeMode");
const evidenceEl = document.querySelector("#includeEvidence");

let outputMode = "resume";
let latestMarkdown = "";

const sampleNotes = `姓名：陈越
当前公司：OpenAI
当前职位：Research Engineer
所在地：San Francisco Bay Area
推荐方向：agent infra / post-training

教育背景：
清华大学 计算机科学 本科，2016-2020
Stanford University MS in Computer Science，2020-2022

工作经历：
OpenAI Research Engineer，2023年至今
- 参与 coding agent 的 post-training 与 evaluation 工作，覆盖任务构造、自动化评测和失败案例分析。
- 支持 tool use / browser use 场景的数据闭环建设，和 research、product、infra 团队协作。
- 参与训练数据质量控制和 benchmark 设计，重点关注真实开发任务中的可靠性。

Google Software Engineer，2022-2023
- 参与大规模服务端系统开发，主要使用 Python、Go 和 Kubernetes。

推荐亮点：
1. 同时理解 post-training、agent evaluation 和工程落地。
2. 有大厂工程背景，也有前沿模型团队经验，适合 agent infra / RL environment scaling 方向。

不要写：薪资、汇报线、内部组织信息。`;

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    outputMode = button.dataset.mode;
  });
});

notesEl.addEventListener("input", updateStatus);
sampleBtn.addEventListener("click", () => {
  notesEl.value = sampleNotes;
  targetRoleEl.value = "agent infra / post-training";
  highlightEl.value = "同时理解 post-training、agent evaluation 和工程落地";
  exclusionsEl.value = "薪资、汇报线、内部组织信息";
  updateStatus();
});

generateBtn.addEventListener("click", () => {
  const parsed = parseCandidate(notesEl.value);
  latestMarkdown = buildMarkdown(parsed);
  previewEl.innerHTML = markdownToHtml(latestMarkdown);
});

promptBtn.addEventListener("click", async () => {
  const prompt = buildModelPrompt(parseCandidate(notesEl.value));
  await navigator.clipboard.writeText(prompt);
  promptBtn.textContent = "Prompt 已复制";
  window.setTimeout(() => {
    promptBtn.textContent = "复制模型 Prompt";
  }, 1400);
});

copyBtn.addEventListener("click", async () => {
  if (!latestMarkdown) return;
  await navigator.clipboard.writeText(latestMarkdown);
  copyBtn.textContent = "已复制";
  window.setTimeout(() => {
    copyBtn.textContent = "复制";
  }, 1200);
});

downloadBtn.addEventListener("click", () => {
  if (!latestMarkdown) return;
  const blob = new Blob([latestMarkdown], { type: "text/markdown;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${extractName(notesEl.value) || "resugen-output"}.md`;
  link.click();
  URL.revokeObjectURL(link.href);
});

function updateStatus() {
  const length = notesEl.value.trim().length;
  if (!length) {
    statusEl.textContent = "等待输入";
    return;
  }
  statusEl.textContent = length > 600 ? "材料较完整" : "可生成草稿";
}

function parseCandidate(raw) {
  const text = raw.trim();
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const field = (names) => {
    for (const name of names) {
      const found = lines.find((line) => line.startsWith(`${name}：`) || line.startsWith(`${name}:`));
      if (found) return found.replace(new RegExp(`^${name}[：:]\\s*`), "").trim();
    }
    return "";
  };

  const bullets = lines
    .filter((line) => /^[-•●]\s*/.test(line))
    .map((line) => line.replace(/^[-•●]\s*/, "").trim());

  const highlights = lines
    .filter((line) => /^\d+[.、]\s*/.test(line) || line.includes("亮点"))
    .map((line) => line.replace(/^\d+[.、]\s*/, "").replace(/^推荐亮点[：:]?/, "").trim())
    .filter(Boolean);

  return {
    name: field(["姓名"]) || extractName(text) || "候选人",
    company: field(["当前公司", "公司"]),
    title: field(["当前职位", "职位"]),
    location: field(["所在地", "地点"]),
    targetRole: targetRoleEl.value.trim() || field(["推荐方向", "目标岗位"]),
    highlight: highlightEl.value.trim(),
    exclusions: exclusionsEl.value.trim() || field(["不要写"]),
    education: extractSection(lines, ["教育背景", "教育经历"]),
    work: extractSection(lines, ["工作经历", "工作经验"]),
    bullets,
    highlights,
    raw: text,
  };
}

function extractSection(lines, titles) {
  const start = lines.findIndex((line) => titles.some((title) => line.includes(title)));
  if (start < 0) return [];
  const next = lines.findIndex((line, index) => {
    if (index <= start) return false;
    return /^(工作经历|工作经验|推荐亮点|不要写|论文|开源项目|项目经历)[：:]?$/.test(line);
  });
  return lines.slice(start + 1, next > start ? next : lines.length).filter((line) => !line.endsWith("："));
}

function extractName(text) {
  const match = text.match(/姓名[：:]\s*([^\n]+)/);
  return match ? match[1].trim() : "";
}

function buildMarkdown(data) {
  if (!data.raw) {
    return "# 中文简历\n\n请先粘贴候选人材料。";
  }

  if (outputMode === "pitch") return buildPitch(data);
  if (outputMode === "review") return buildReview(data);
  return buildResume(data);
}

function buildModelPrompt(data) {
  return `你是一个高端技术候选人中文简历生成器。请基于用户提供的访谈记录、LinkedIn、GitHub、论文列表等碎片材料，生成可直接交付业务负责人、面试官或内部评审使用的中文候选人简历成品。

核心要求：
- 默认输出简体中文。
- 输出结构优先使用：推荐语、个人基本信息、教育背景、工作经历、论文 / 专利 / 开源项目。
- 推荐语必须优先使用用户给定的候选人亮点和推荐判断。
- 不要输出材料来源说明、面向对象说明、语言说明、候选人画像、技术能力拆解、匹配度评估、关键情报、Final Pitch 或面试问题，除非用户明确要求。
- 不要编造职级、时间、ownership、论文贡献、薪资、汇报线或影响指标。
- 如果 ownership 不清楚，使用“参与 / 支持 / 主要参与”，不要写“主导 / 负责”。
- 缺失字段直接省略，不要写“待确认”。
- 保留标准 AI/ML 英文技术词，例如 pretraining、post-training、RLHF、RLVR、inference、agent infra、RL environment scaling、JAX、CUDA、NCCL、GB200。
- 工作经历保持简洁，核心经历 3-5 个 bullet，次要经历 1-2 个 bullet。

用户补充：
- 推荐方向：${data.targetRole || "未指定"}
- 重点亮点：${data.highlight || "未单独填写，请从材料中提取"}
- 不要写入：${data.exclusions || "薪资、汇报线、组织八卦和其他非招聘必要敏感信息"}

原始材料：
${data.raw || "用户尚未提供材料"}

请直接输出最终中文简历，不要解释写作过程。`;
}

function buildResume(data) {
  const recommendation = buildRecommendation(data);
  const infoRows = [
    ["姓名", data.name],
    ["公司", data.company],
    ["当前职位", data.title],
    ["核心身份", data.targetRole ? `${data.targetRole} 相关候选人` : ""],
    ["所在地", data.location],
  ].filter(([, value]) => value);

  const workBullets = data.bullets.length
    ? data.bullets.slice(0, 6)
    : ["基于已提供材料参与相关方向工作，具体职责可继续补充后细化。"];

  const education = data.education.length
    ? data.education.map((item) => `- ${item}`).join("\n")
    : "";

  const evidence = evidenceEl.checked ? buildEvidenceNotes(data) : "";

  return `# ${data.name}

## 推荐语

${recommendation}

## 个人基本信息

${renderInfoTable(infoRows)}

${education ? `## 教育背景\n\n${education}\n\n` : ""}## 工作经历

${data.company || "当前公司"} | ${data.title || "候选人"}

核心职责：
${workBullets.map((item) => `- ${normalizeOwnership(item)}`).join("\n")}
${evidence}`;
}

function buildPitch(data) {
  return `# ${data.name} 推荐理由

## 基本信息

${renderInfoTable([
    ["姓名", data.name],
    ["公司", data.company],
    ["当前职位", data.title],
    ["推荐方向", data.targetRole],
  ].filter(([, value]) => value))}

## 推荐理由

${buildRecommendation(data)}

## 建议下一步

- 可优先围绕 ${data.targetRole || "目标方向"} 进一步确认其核心项目 ownership、协作边界和真实落地深度。`;
}

function buildReview(data) {
  return `# ${data.name} 完整评估版

## 推荐语

${buildRecommendation(data)}

## 个人基本信息

${renderInfoTable([
    ["姓名", data.name],
    ["公司", data.company],
    ["当前职位", data.title],
    ["所在地", data.location],
    ["推荐方向", data.targetRole],
  ].filter(([, value]) => value))}

## 工作经历

${data.bullets.slice(0, 8).map((item) => `- ${normalizeOwnership(item)}`).join("\n") || "- 已提供材料较少，建议补充核心项目、时间线和贡献边界。"}

## 待确认信息

- 核心项目中候选人的具体 ownership
- 代表成果是否有可量化业务或技术影响
- 与目标岗位最相关的技术深度和协作范围`;
}

function buildRecommendation(data) {
  const primary = data.highlight || data.highlights[0];
  const secondary = data.highlights.find((item) => item !== primary);
  const target = data.targetRole ? `，适合继续沟通 ${data.targetRole} 方向` : "";

  if (primary && secondary) {
    return `（1）${primary}${target}。\n\n（2）${secondary}。`;
  }

  if (primary) {
    return `（1）${primary}${target}。`;
  }

  return `（1）候选人具备与目标方向相关的技术和项目背景${target}，建议结合后续材料进一步确认代表项目和贡献边界。`;
}

function renderInfoTable(rows) {
  if (!rows.length) return "";
  return `| 项目 | 内容 |
|---|---|
${rows.map(([key, value]) => `| ${key} | ${value} |`).join("\n")}`;
}

function normalizeOwnership(text) {
  if (!conservativeEl.checked) return text;
  return text
    .replace(/主导/g, "参与")
    .replace(/负责/g, "参与")
    .replace(/Owner/g, "Contributor");
}

function buildEvidenceNotes(data) {
  const notes = [];
  if (!data.company) notes.push("公司信息未明确，已在正文中省略。");
  if (!data.title) notes.push("当前职位未明确，已使用保守表述。");
  if (data.exclusions) notes.push(`已按要求避免写入：${data.exclusions}。`);
  if (!notes.length) return "";
  return `\n\n## 证据检查\n\n${notes.map((item) => `- ${item}`).join("\n")}`;
}

function markdownToHtml(markdown) {
  const escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  let html = "";
  let inList = false;
  let inTable = false;
  let tableRows = [];

  const closeList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  const closeTable = () => {
    if (!inTable) return;
    html += "<table><tbody>";
    tableRows.forEach((row) => {
      const cells = row.split("|").slice(1, -1).map((cell) => cell.trim());
      if (cells.every((cell) => /^-+$/.test(cell))) return;
      html += `<tr>${cells.map((cell, index) => index === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`).join("")}</tr>`;
    });
    html += "</tbody></table>";
    tableRows = [];
    inTable = false;
  };

  lines.forEach((line) => {
    if (line.startsWith("|")) {
      closeList();
      inTable = true;
      tableRows.push(line);
      return;
    }

    closeTable();

    if (line.startsWith("# ")) {
      closeList();
      html += `<h1>${line.slice(2)}</h1>`;
    } else if (line.startsWith("## ")) {
      closeList();
      html += `<h2>${line.slice(3)}</h2>`;
    } else if (line.startsWith("- ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${line.slice(2)}</li>`;
    } else if (line.trim()) {
      closeList();
      html += `<p>${line}</p>`;
    }
  });

  closeList();
  closeTable();
  return html;
}
