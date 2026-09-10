import { useRef, useState } from "react";
import {
  ArrowClockwise,
  Check,
  Copy,
  FileText,
  Sparkle,
  UploadSimple,
} from "@phosphor-icons/react";

const SAMPLE_SCRIPT = `夜，公寓客厅。

林晓坐在沙发上，手里捏着一封信，眼眶发红。
陈默从门口走进来，看到她，停下脚步。

林晓：你终于回来了。
陈默：……我知道这很突然。
林晓：你还记得你答应过我的话吗？
陈默沉默片刻，走近她，却没有坐下。`;

const SAMPLE_DIRECTION =
  "林晓前半段一直压住，不急着哭。她想从陈默那里得到一句挽留，所以说话尽量平稳，只有捏信纸的手越来越紧。陈默不要马上解释，他先把视线移开，用沉默躲她。镜头开始保持两个人都有余地的中景；林晓把信放到桌上之后，镜头才缓慢靠近她。这个靠近不是煽情，是观众第一次发现她已经知道真相。陈默想走近又停住时，镜头不要跟他，让他留在画面边缘。";

function makePrompt({ script, direction, scopes }) {
  const focus = [scopes.acting && "人物表演", scopes.visual && "视听语言"]
    .filter(Boolean)
    .join("与");

  const performance = scopes.acting
    ? "把抽象情绪落实为演员可以完成、画面可以看见的行为：人物当下的目标、被对方阻挡后的策略变化，以及呼吸、视线、手部、重心和停顿。情绪先压住，只在导演指定的触发点泄露。"
    : "不额外改写演员表演，仅保留剧本和导演原话中已经明确的行为。";

  const camera = scopes.visual
    ? "镜头变化必须由人物动作、关系变化或信息变化触发。保持导演指定的景别、视角、机位和运动逻辑；不要为了台词数量自动切镜，也不要自行扩写成分镜表。"
    : "不额外设计镜头，仅保留导演原话中已经明确的视听要求。";

  return `【Seedance 2.5 生成目标】
根据以下单场戏，生成一段以${focus || "导演意图"}为核心的连续戏剧场面。忠实保留剧本事实、人物关系、台词顺序和导演决定，不增加新的情节、人物或动作。

【单场戏剧本】
${script.trim()}

【导演的话｜最高优先级】
${direction.trim()}

【执行要求】
${performance}
${camera}
镜头与表演写在同一条连续行动逻辑中：当演员的动作、停顿、眼神或情绪转折触发镜头变化时，明确写出触发关系。整段保持空间方向、人物身份、服装、道具归属和光线连续。使用具体可见的动作，避免只写“悲伤、愤怒、复杂、电影感”等抽象词。

【声音】
保留剧本中的人物对白和现场环境声。对白之外不要添加旁白、解说或额外台词。NO BGM。

【输出约束】
Seedance 2.5，720p。按单个连续片段组织；只有同一次生成同时承担复杂物理动作和细微表演、或总时长超过 30 秒时，才建议拆段，并说明拆分发生在何处及其叙事原因。`;
}

export function App() {
  const fileInputRef = useRef(null);
  const resultRef = useRef(null);
  const [script, setScript] = useState(SAMPLE_SCRIPT);
  const [direction, setDirection] = useState(SAMPLE_DIRECTION);
  const [scopes, setScopes] = useState({ acting: true, visual: true });
  const [model, setModel] = useState("openai");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleScope = (key) => {
    setScopes((current) => {
      const next = { ...current, [key]: !current[key] };
      return !next.acting && !next.visual ? current : next;
    });
  };

  const readFile = async (file) => {
    if (!file) return;
    setFileError("");
    const extension = file.name.split(".").pop()?.toLowerCase();

    try {
      let text = "";
      if (extension === "txt") {
        text = await file.text();
      } else if (extension === "docx") {
        const { default: mammoth } = await import("mammoth/mammoth.browser");
        const arrayBuffer = await file.arrayBuffer();
        const parsed = await mammoth.extractRawText({ arrayBuffer });
        text = parsed.value;
      } else {
        throw new Error("请上传 TXT 或 DOCX 文件");
      }

      if (!text.trim()) throw new Error("这个文件里没有读取到文字");
      setScript(text.trim());
      setFileName(file.name);
    } catch (error) {
      setFileError(error.message || "文件读取失败，请改为复制粘贴");
    }
  };

  const generate = () => {
    if (!script.trim() || !direction.trim()) return;
    setIsGenerating(true);
    setCopied(false);
    window.setTimeout(() => {
      setResult(makePrompt({ script, direction, scopes }));
      setIsGenerating(false);
      window.setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        50,
      );
    }, 650);
  };

  const copyResult = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const canGenerate = script.trim() && direction.trim() && !isGenerating;

  return (
    <main className="page-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">DIRECTOR&apos;S WORKSPACE</p>
          <h1>视听语言＋表演</h1>
        </div>
        <p className="header-note">把导演的话，变成可执行的画面</p>
      </header>

      <section className="workspace" aria-label="提示词生成表单">
        <div className="script-column">
          <div className="section-heading">
            <div>
              <span className="step-number">01</span>
              <h2>单场戏剧本</h2>
            </div>
            <button className="upload-button" type="button" onClick={() => fileInputRef.current?.click()}>
              <UploadSimple size={20} />
              上传 TXT / Word
            </button>
            <input
              ref={fileInputRef}
              className="visually-hidden"
              type="file"
              accept=".txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => readFile(event.target.files?.[0])}
            />
          </div>

          <div
            className="script-input-wrap"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              readFile(event.dataTransfer.files?.[0]);
            }}
          >
            <textarea
              value={script}
              onChange={(event) => {
                setScript(event.target.value);
                setFileName("");
              }}
              aria-label="单场戏剧本"
              placeholder="直接输入或粘贴单场戏剧本……"
              spellCheck="false"
            />
            <div className="field-meta">
              <span>
                {fileName ? (
                  <><FileText size={16} /> {fileName}</>
                ) : (
                  "支持 .txt、.docx，也可以直接输入或粘贴"
                )}
              </span>
              <span>{script.length} 字</span>
            </div>
          </div>
          {fileError && <p className="field-error" role="alert">{fileError}</p>}
        </div>

        <div className="direction-column">
          <div className="scope-block">
            <div className="section-heading compact">
              <div>
                <span className="step-number">02</span>
                <h2>这段话涉及</h2>
              </div>
              <span className="hint">可选一个，也可都选</span>
            </div>
            <div className="scope-options" role="group" aria-label="导演的话涉及的方向">
              <ScopeButton label="表演" selected={scopes.acting} onClick={() => toggleScope("acting")} />
              <ScopeButton label="视听语言" selected={scopes.visual} onClick={() => toggleScope("visual")} />
            </div>
          </div>

          <div className="direction-block">
            <div className="section-heading compact">
              <div>
                <span className="step-number">03</span>
                <h2>导演的话</h2>
              </div>
            </div>
            <p className="field-intro">直接写你会对演员和摄影说的话，不用分镜。</p>
            <textarea
              className="direction-input"
              value={direction}
              onChange={(event) => setDirection(event.target.value)}
              aria-label="导演的话"
              placeholder="例如：她先忍住不要哭，等钥匙放下后镜头才慢慢靠近……"
              spellCheck="false"
            />
            <div className="field-meta direction-meta">
              <span>系统会自行理解表演与镜头的关系</span>
              <span>{direction.length} 字</span>
            </div>
          </div>

          <div className="generation-controls">
            <div className="model-block">
              <span className="control-label">分析模型</span>
              <div className="model-options" role="radiogroup" aria-label="分析模型">
                <ModelButton label="OpenAI" selected={model === "openai"} onClick={() => setModel("openai")} />
                <ModelButton label="豆包" selected={model === "doubao"} onClick={() => setModel("doubao")} />
              </div>
            </div>

            <button className="generate-button" type="button" disabled={!canGenerate} onClick={generate}>
              <Sparkle size={21} weight="fill" />
              {isGenerating ? "正在理解导演的话……" : "生成 Seedance 2.5 提示词"}
            </button>
          </div>
        </div>
      </section>

      {result && (
        <section className="result-section" ref={resultRef} aria-live="polite">
          <div className="result-heading">
            <div>
              <p className="eyebrow">PROMPT PREVIEW · {model === "openai" ? "OPENAI" : "豆包"}</p>
              <h2>Seedance 2.5 提示词</h2>
            </div>
            <div className="result-actions">
              <button type="button" onClick={generate}>
                <ArrowClockwise size={18} /> 重新生成
              </button>
              <button className="copy-button" type="button" onClick={copyResult}>
                {copied ? <Check size={18} weight="bold" /> : <Copy size={18} />}
                {copied ? "已复制" : "复制提示词"}
              </button>
            </div>
          </div>
          <textarea
            className="result-output"
            value={result}
            onChange={(event) => setResult(event.target.value)}
            aria-label="生成的 Seedance 2.5 提示词"
          />
        </section>
      )}
    </main>
  );
}

function ScopeButton({ label, selected, onClick }) {
  return (
    <button type="button" className={`scope-chip ${selected ? "selected" : ""}`} aria-pressed={selected} onClick={onClick}>
      <span className="check-box">{selected && <Check size={16} weight="bold" />}</span>
      {label}
    </button>
  );
}

function ModelButton({ label, selected, onClick }) {
  return (
    <button type="button" className={selected ? "selected" : ""} role="radio" aria-checked={selected} onClick={onClick}>
      <span className="radio-dot" /> {label}
    </button>
  );
}
