<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#लाइसेंस"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

एक स्थानीय, खोज योग्य दर्पण जो एंथ्रोपिक और उससे संबंधित सभी एआई विकास उपकरणों के परिवर्तन लॉग का होता है — साथ ही एक क्यूरेटेड "**सिनर्जी**" परत जो क्रॉस-उत्पाद वर्कफ़्लो का वर्णन करती है — ताकि उपकरण के अंदर मौजूद एलएलएम एजेंट को पता चले कि उपकरण क्या कर सकता है।

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


एकल एफटीएस क्वेरी एक समन्वित क्रॉस-एसडीके सुरक्षा सुधार प्रदान करती है जिसे किसी भी व्यक्तिगत परिवर्तन लॉग में सीवीई के रूप में चिह्नित नहीं किया गया है। यह एक शानदार डेमो है: जब प्रत्येक परिवर्तन लॉग को एक साथ रखा जाता है, तो पैटर्न उभर कर आते हैं।

रिपॉजिटरी: [github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## समस्या

क्लॉड कोड सीएलआई लगभग दैनिक रूप से जारी किया जाता है। क्लॉड एपीआई लगभग उतनी ही बार जारी किया जाता है। एसडीके प्रत्येक सीएलआई रिलीज़ के साथ जारी किए जाते हैं। क्लॉड डिज़ाइन, कोवर्क, चैट और मोबाइल एकीकृत सहायता केंद्र के माध्यम से फीड किए जाते हैं। एमसीपी पारिस्थितिकी तंत्र प्रति सप्ताह लगभग 200-300 नए सर्वर जारी करता है। इसके अलावा, 7 प्रमुख एआई विकास उपकरण सतहें (कर्सर, एइडर, कंटिन्यू, कोपायलट, कोडी, विंडसर्फ) हैं, जो सभी अपने स्वयं के परिवर्तन लॉग को अपनी गति से जारी करते हैं।

इनमें से किसी एक के अंदर मौजूद एलएलएम एजेंट का प्रशिक्षण कटऑफ स्थिर है। हर दिन अंतर बढ़ता जाता है। ऐसी विशेषताएं जारी की जाती हैं जिनके बारे में एजेंट को पता नहीं होता है। ऐसी बग ठीक की जाती हैं जिनके बारे में एजेंट अभी भी काम करता रहता है। पर्यावरण चर और झंडे जोड़े जाते हैं जिन्हें एजेंट कभी भी सुझाव नहीं देता है। क्रॉस-उत्पाद वर्कफ़्लो जो कई सतहों को जोड़ते हैं, वे अप्रत्याशित रहते हैं।

**यह रिपॉजिटरी अंतर को दूर करता है।** सिनर्जी अनुभाग इसे एक दर्पण के बजाय एक उत्पाद बनाता है।

---

## यहां क्या है

```
claude-synergy/
├── products/                # 44 product directories (1,186 release files)
│   ├── claude-code/             # Anthropic CLI — 117 releases
│   ├── claude-agent-sdk-{python,typescript}/  # Agent SDKs
│   ├── anthropic-sdk-{python,typescript,go,java,csharp,ruby,php}/  # 7 language SDKs
│   ├── claude-api/              # Platform release notes
│   ├── anthropic-apps/          # Design / Cowork / Chat / Mobile (Help Center feed)
│   ├── claude-code-action/      # GitHub Action
│   ├── anthropic-cli/           # `ant` CLI
│   ├── mcp-{python,typescript,go,java,csharp,kotlin,ruby,swift,rust,php}-sdk/
│   ├── mcp-{spec,inspector,registry,mcpb,conformance}/
│   ├── cursor/                  # RSS feed
│   ├── aider/                   # raw HISTORY.md
│   ├── continue-{dev,cli}/      # GH releases
│   ├── cody-enterprise/         # filtered Sourcegraph RSS
│   ├── github-copilot/          # HTML scrape (github.blog)
│   ├── vscode-copilot-chat/     # HTML scrape (code.visualstudio.com)
│   ├── windsurf/                # Playwright fetcher (CSR-only changelog)
│   ├── skills/                  # Anthropic Skills catalog
│   └── plugins-{official,community,knowledge-work}/  # Plugin marketplaces
├── synergies/               # 12 curated cross-product workflows
├── src/                     # TypeScript implementation
├── test/                    # 508 tests (unit, integration, regression, smoke)
├── data/claude-synergy.db   # SQLite database (created by `hk init`)
├── schema.sql               # Tier 2a tables (products, releases, changes, entities, FTS5, …)
├── schema-vec.sql           # Tier 2b tables (chunks, chunks_vec, chunks_fts)
├── SOURCES.md               # 5-tier source landscape with fetch strategies
└── URGENT_FINDINGS.md       # 23 actionable items surfaced from the corpus
```

**लाइव आंकड़े (v1.2.1 के अनुसार):** 44 उत्पाद / 1,171 रिलीज़ फ़ाइलें / 6,573 परिवर्तन / 1,260 इकाइयाँ / 12 सिनर्जी / 519 परीक्षण / 13 एमसीपी उपकरण / 17 सीएलआई कमांड। (2026-05-24 को `sync_now` के माध्यम से कॉर्पस को ताज़ा किया गया।)

---

## स्थिति - सभी स्तर जारी किए गए

| स्तर | स्थिति | वहां क्या है |
|------|--------|--------------|
| **1 - बूटस्ट्रैप (मार्कडाउन कॉर्पस)** | ✅ जारी किया गया | स्टडी-स्वार्म ने जनवरी से मई 2026 तक 706 रिलीज़ फ़ाइलों को सीड किया; इसे स्तर 4d द्वारा 1,186 तक विस्तारित किया गया। |
| **2a - SQLite + FTS5 + सीएलआई** | ✅ जारी किया गया | `hk` सीएलआई; 15 उप-कमांड; sub-300ms इनजेस्ट |
| **2b - sqlite-vec + प्रासंगिक पुनर्प्राप्ति** | ✅ जारी किया गया | प्रदाता-प्लग करने योग्य (कोई नहीं/संरचित/ओलामा/क्लॉड-हाइकु संदर्भ × ओलामा/वॉयज एम्बेड × कोई नहीं/ओलामा-जज/वॉयज/कोहेर रीरैंक) |
| **3 - सिंक + एमसीपी सर्वर** | ✅ जारी किया गया | `hk fetch / sync / seed-markers`; `claude-synergy-mcp` stdio पर 13 उपकरण उजागर करता है (मूल स्तर-3 शिप पर 8, v1.1 में 3 जोड़े गए, v1.2 में 2 जोड़े गए) |
| **4a - एंथ्रोपिक से परे विस्तार करें** | ✅ जारी किया गया | +15 एमसीपी एसडीके, कर्सर (आरएसएस), एइडर (HISTORY.md), कंटिन्यू.देव, कोडी एंटरप्राइज (आरएसएस फ़िल्टर्ड) |
| **4b - एचटीएमएल-स्क्रैप फ़ेचर** | ✅ जारी किया गया | GitHub कोपायलट + वीएस कोड चैट (विंडसर्फ को प्लेराइट की आवश्यकता है - v0.7) |
| **4c - टर्नडाउन एचटीएमएल→मार्कडाउन इनजेस्ट** | ✅ जारी किया गया | एचटीएमएल बॉडी (कोपायलट/वीएस कोड/कर्सर) अब FTS5 + इकाई निष्कर्षण के लिए प्रति-बुलेट पंक्तियाँ उत्पन्न करते हैं |
| **4d - प्लेराइट + एमसीपी रजिस्ट्री + वाईएएमएल कॉन्फ़िगरेशन** | ✅ जारी किया गया | प्लेराइट के माध्यम से विंडसर्फ; स्मिथरी + आधिकारिक एमसीपी रजिस्ट्री स्तर-4 कैटलॉग के रूप में; उत्पादों को `products.yaml` में समेकित किया गया |
| **5 - v1.1 विंडोयुक्त ब्राउज़िंग + OpenAI एम्बेड** | ✅ जारी किया गया | `hk diff` / `hk breaking`, सभी ब्राउज़िंग कमांड में दिनांक सीमाएँ, 3 नए एमसीपी उपकरण (कुल 11), OpenAI एम्बेडिंग प्रदाता, कॉन्फ़िगर करने योग्य एम्बेडिंग आयाम, `claude-code` ऑटो-सिंक, सामान्य `keep-a-changelog` पार्सर |
| **6 - v1.2 सिंक-फ्रॉम-एमसीपी** | ✅ जारी किया गया | `sync_status` (प्रति-उत्पाद ताजगी, कभी नहीं/पुराना पता लगाना) और `sync_now` (मांग पर फ़ेच → इनजेस्ट → `dry_run` पूर्वावलोकन + इन-प्रोसेस समवर्ती लॉक के साथ एम्बेड)। उस अंतर को दूर करता है जहां एक कॉलिंग एजेंट कॉर्पस को क्वेरी कर सकता है लेकिन इसे ताज़ा नहीं कर सकता। **इसके अतिरिक्त, यह ठीक करता है:** मार्कर-वाइप बग जहां `INSERT OR REPLACE INTO products` ने `markers` एफके पर एक DELETE को कैस्केड किया, चुपचाप प्रत्येक उत्पाद के `since` कर्सर को प्रत्येक इनजेस्ट पर रीसेट कर दिया (प्रतिगमन §8.20)। |
| **6.1 - v1.2.1 फ़ेचर-मार्कर केंद्रीकरण** | ✅ जारी किया गया | केंद्रीकृत `writeMarker` `fetchOne` में ताकि प्रत्येक सफल फ़ेच मार्कर को अपडेट करे - फिक्स से पहले, ऐसी रणनीतियाँ जो विंडो में 0 दिनांकित आइटम लौटाती थीं (सबसे उल्लेखनीय रूप से `aider` रॉ-चेंजलॉग) कभी भी मार्कर नहीं लिखती थीं और प्रत्येक सिंक पर `HISTORY.md` को फिर से खींचती थीं। अप्रयुक्त `webfetch` रणनीति का नाम बदलकर `manual` कर दिया गया ताकि `claude-api` + `anthropic-apps`; `sync_status` अब मैन्युअल उत्पादों को "मैन्युअल" के रूप में प्रस्तुत करता है, न कि "कभी नहीं" और उन्हें `stale_only` से बाहर रखता है (प्रतिगमन §8.21)। |
| **7 - v1.3 cs-actions:v1 फाइन-ट्यून किया गया सिंथेसाइज़र** | ✅ जारी किया गया | कॉर्पस पर प्रशिक्षित पहला डाउनस्ट्रीम मॉडल। एक परिवर्तन लॉग प्रविष्टि → एक सख्त-जेएसओएन कार्रवाई आइटम `{kind, severity, subject, action_text, deadline, tags}` में परिवर्तित करता है। Qwen2.5-7B + LoRA 242 प्रविष्टियों से `dataset/changelog-actions/v1/`, q8_0 जीजीयूएफ, ओलामा-तैनात। रिलीज़-गेट मूल्यांकन: **88.1% प्रकार / 79.7% गंभीरता / 0.842 macro-F1** बनाम 59-प्रविष्टि स्तरीकृत होल्डआउट पर ग्राउंड ट्रुथ (+10.1pp / +27.2pp / +0.041 qwen3:8b आधार से अधिक)। `cs-actions-v1` टैग किया गया; मूल्यांकन रिपोर्ट को [GitHub रिलीज़](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) से एक एकल-फ़ाइल डाउनलोड के रूप में जोड़ा गया। **दस्तावेज़ v1 सीमा:** एंटी-`unknown` पूर्वाग्रह (सटीकता 1.000 / रिकॉल 0.286) - मॉडल अस्पष्ट इनपुट को कम आंकता है। [हैंडबुक → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/) + [`dataset/README.md`](dataset/README.md) + [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) + [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md) देखें। |

v1.3 से परे रोडमैप: [URGENT_FINDINGS.md](URGENT_FINDINGS.md) और मुद्दों में ट्रैक किया गया।

---

## सुरक्षा और डेटा मॉडल

यह उपकरण स्थानीय रूप से चलता है। **स्पर्श किया गया डेटा:** एक व्युत्पन्न SQLite डेटाबेस और मार्कडाउन रिलीज़ फ़ाइलें - सभी पुन: बनाने योग्य। **नेटवर्क:** आउटबाउंड HTTPS तब होता है जब आप `hk fetch`/`hk sync` चलाते हैं, जब कोई एजेंट MCP `sync_now` टूल को कॉल करता है, और पहली बार उपयोग पर: खाली स्टोर पर चलाया गया कोई क्वेरी कमांड या MCP टूल अपने आप सिंक करता है (`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` इसे बंद करता है)। गंतव्य GitHub API, RSS फ़ीड, चेंजलॉग पेज और MCP रजिस्ट्री हैं, और कोई दूरस्थ AI प्रदाता केवल तब जब आप उसे चुनते हैं: `hk embed` (Voyage एम्बेडिंग, संदर्भ निर्माण के लिए Anthropic), या `hk hybrid -e voyage` / `-r voyage|cohere`। अन्यथा हाइब्रिड खोज, MCP `search` टूल के डिफ़ॉल्ट मोड सहित, क्वेरी को एम्बेड करने के लिए localhost पर स्थानीय Ollama को कॉल करती है। **गुप्त:** पर्यावरण चर `GITHUB_TOKEN`, `VOYAGE_API_KEY`, `COHERE_API_KEY`, `ANTHROPIC_API_KEY` से पढ़ता है - कभी भी लॉग नहीं किया जाता है, कभी भी डिस्क पर संग्रहीत नहीं किया जाता है। **कोई टेलीमेट्री नहीं।** रिपोर्टिंग नीति के लिए [SECURITY.md](SECURITY.md) देखें।

**विक्रेता पाठ:** तृतीय-पक्ष रिलीज़ नोट्स और कैटलॉग प्रविष्टियों को सख्ती से उद्धृत डेटा के रूप में माना जाता है, और इन्हें कभी भी स्थायी निर्देशों के रूप में नहीं माना जाना चाहिए। रिलीज़ टेक्स्ट को इनपुट के समय निश्चित रूप से जांचा जाता है (छिपे हुए यूनिकोड नियंत्रणों को हटाना, छवि/असुरक्षित लिंक को निष्क्रिय करना, ईमेल और होम पाथ को संपादित करना, और निर्देश-जैसी पैटर्न को चिह्नित करना), और इसे छह एमसीपी टूल द्वारा एक निश्चित डेटा फ्रेम में लपेटा जाता है जो रिलीज़ टेक्स्ट लौटाते हैं, जिसमें इनलाइन `[flagged: …]` मार्कर होते हैं, और इसे कभी भी निर्देश फ़ाइलों में नहीं लिखा जाता है।

---

## इंस्टॉल करें

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

या `@mcptoolshop/claude-synergy` इंस्टॉल करने के बाद सीधे चलाएं। `hk` और `claude-synergy-mcp` दोनों स्थानीय स्टोर को समान 4-चरणीय क्रम का उपयोग करके हल करते हैं:

1. `CLAUDE_SYNERGY_DB` पर्यावरण चर
2. स्पष्ट `--db <path>` (सीएलआई) या स्थितिजन्य argv पाथ (एमसीपी)
3. `<cwd>/data/claude-synergy.db` **केवल तभी जब वह फ़ाइल पहले से मौजूद हो** (रिपो-क्लोन उपयोग को संरक्षित करता है)
4. `<home>/.claude-synergy/data/claude-synergy.db` (`<home>/.claude-synergy/products` के अंतर्गत उत्पादों के साथ)

`CLAUDE_SYNERGY_PRODUCTS_ROOT` उत्पादों की निर्देशिका को ओवरराइड करता है।

**स्वचालित पहली बार उपयोग सिंक्रनाइज़ेशन:** जब कोई क्वेरी कमांड या एमसीपी टूल किसी गुम या खाली स्टोर के विरुद्ध चलता है, तो यह स्कीमा को आरंभ करता है और स्वचालित रूप से `fetch` → `ingest` चलाता है (कोई एम्बेडिंग चरण नहीं, एक टाइमआउट द्वारा सीमित, किसी भी दुर्गम फ़ीड को छोड़ देता है) और प्रत्येक उत्तर को `data as of: …` के साथ चिह्नित करता है। स्वचालित पहली बार उपयोग सिंक्रनाइज़ेशन को अक्षम करने और इसके बजाय खाली-कॉर्पस निर्देशों के साथ विफल/चेतावनी देने के लिए `CLAUDE_SYNERGY_NO_AUTO_SYNC=1` सेट करें।

बिल्डिंग के बिना विकास के लिए, `npx tsx src/cli.ts ...` को सीधे उपयोग करें। **pnpm 10 विशेषता:** `pnpm dev`, `--` के बाद सीएलआई ध्वजों को अनदेखा कर देता है; विकास के लिए `npx tsx` का उपयोग करें।

---

## सीएलआई सतह - 17 कमांड

```
# DB lifecycle
hk init                              # create DB with schema
hk ingest                            # parse products/*/releases/*.md → DB (idempotent)
hk embed                             # generate chunks + embeddings (sqlite-vec)
hk fetch [--product X]               # incremental pull from sources
hk sync                              # combined fetch → ingest → embed (cron-friendly)
hk seed-markers                      # one-time setup after initial corpus

# Search
hk query "managed agents"            # FTS5 keyword search (+ --until <date>)
hk hybrid "credential exfiltration"  # FTS5 + vec hybrid via RRF (+ --rerank, --until)

# Windowed change browsing
hk diff [product] --since 7d         # what changed in a window, grouped by product+version
hk breaking --since 30d              # filter-browse of breaking changes (no search term)

# Entity lookups
hk env-var CLAUDE_CODE_WORKFLOWS     # when introduced + history
hk command code-review               # slash command + rename history
hk model claude-opus-4-7             # model launch + mentions across products
hk cve CVE-2025-66414                # CVE references in corpus

# Browsing
hk latest [--product X] [--limit N]  # recent releases (+ --since <date>)
hk products                          # list all 44 with counts
hk top env_var                       # most-mentioned by entity type
                                     # (env_var, slash_command, cli_option,
                                     #  model_id, beta_header, cve, ghsa,
                                     #  hook_event, setting_key)
```

**v1.1 में नया:** `hk diff` और `hk breaking` "हाल ही में क्या बदला है?" का उत्तर खोज शब्द की आवश्यकता के बिना देते हैं। तिथि सीमाएँ समान हैं: प्रत्येक ब्राउज़िंग कमांड `--since` और `--until` को `YYYY-MM-DD` में लेता है (या पूर्ण आईएसओ 8601), या एक सापेक्ष रूप (`7d`, `2w`, `3m`, `1y`)।

---

## उदाहरण वर्कफ़्लो

**पता करें कि क्लाउड कोड पर्यावरण चर कब पेश किया गया था:**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**एक क्रॉस-एसडीके ब्रेकिंग परिवर्तन को ट्रैक करें:**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**एक मॉडल माइग्रेशन की योजना बनाएं:**
```
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  Deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model,
  with retirement on the Claude API scheduled for June 15, 2026...
```

**संपूर्ण कॉर्पस में सिमेंटिक खोज करें:**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

क्वेरी कभी भी "env_scrub" नहीं कहती है - vec इसे सिमेंटिक समानता के माध्यम से प्रस्तुत करता है। शुद्ध FTS5 इसे पूरी तरह से छोड़ देता है।

**इस सप्ताह claude-code में क्या बदला:**
```
$ hk diff claude-code --since 7d
claude-code@2.1.147  2026-05-21  (3 changes)
  [added]     Added the `Workflow` tool for deterministic multi-agent orchestration.
  [changed]   Slash commands now lazy-load until first invocation.
  [fixed]     Race condition in MCP server discovery on Windows.

claude-code@2.1.146  2026-05-19  (1 change)
  [fixed]     Restored `--debug` flag accidentally removed in 2.1.144.
```

**संपूर्ण कॉर्पस में ब्रेकिंग परिवर्तनों को ब्राउज़ करें:**
```
$ hk breaking --since 30d --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       Headless and SDK sessions now use Task tools by default.
2026-05-14  claude-agent-sdk-typescript@0.3.142  Headless and SDK sessions now use Task tools by default.
2026-05-08  anthropic-sdk-go@1.42.0              Removed deprecated `client.Beta()` namespace.
2026-04-29  cursor@0.49.0                        MCP server config moved from `cursor.json` to `.cursor/mcp.json`.
2026-04-22  windsurf@1.10.0                      Removed `cascade.run` JSON-RPC method.
```

किसी खोज शब्द की आवश्यकता नहीं है - `hk breaking` "क्या हाल ही में किसी भी भार-असर वाले परिवर्तन हुए?" का उत्तर है।

---

## एमसीपी सर्वर - अपने एजेंटों को इस कॉर्पस तक पहुंच प्रदान करें

`claude-synergy-mcp` stdio पर 13 टूल उजागर करता है। इसे क्लाउड कोड (या किसी भी एमसीपी होस्ट) में `~/.claude/.mcp.json` या आपके प्रोजेक्ट के `.mcp.json` के माध्यम से वायर करें:

```json
{
  "mcpServers": {
    "claude-synergy": {
      "command": "claude-synergy-mcp"
    }
  }
}
```

यदि आप एक कस्टम स्टोर पाथ चाहते हैं, तो `env` में `CLAUDE_SYNERGY_DB` सेट करें; अन्यथा यह `./data/claude-synergy.db` का उपयोग करता है यदि वह फ़ाइल पहले से मौजूद है, नहीं तो `~/.claude-synergy/data/claude-synergy.db` का उपयोग करता है और पहले टूल के उपयोग पर स्वचालित रूप से सिंक्रनाइज़ करता है (`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` इसे अक्षम करता है)। प्रत्येक टूल प्रतिक्रिया `data as of:` ताजगी स्टैम्प के साथ समाप्त होती है (7 दिनों के बाद `STALE:` उपसर्ग)।

GitHub कोपायलट के `.vscode/mcp.json` के लिए, `mcpServers` के बजाय `servers` रैपर का उपयोग करें ([सिनर्जी 12](synergies/12-mcp-config-format-gotcha.md) देखें)।

उजागर किए गए उपकरण:

| उपकरण | उद्देश्य |
|---|---|
| `search` | हाइब्रिड FTS5 + vec; वैकल्पिक रीरैंक। प्राकृतिक-भाषा प्रश्नों के लिए डिफ़ॉल्ट मोड। (+ `until` तिथि ऊपरी सीमा) |
| `lookup_entity` | सटीक इकाई इतिहास: पर्यावरण चर, स्लैश कमांड, मॉडल आईडी, सीवीई, आदि। |
| `latest_releases` | उत्पादों (या एक) में हालिया रिलीज़। (+ `since` तिथि निचली सीमा) |
| `get_release` | एक रिलीज़ की पूरी सामग्री |
| `list_products` | गिनती + नवीनतम संस्करण के साथ गणना |
| `top_entities` | प्रकार के अनुसार सबसे अधिक उल्लिखित इकाइयाँ |
| `list_synergies` | क्यूरेटेड क्रॉस-उत्पाद वर्कफ़्लो। (+ वैकल्पिक `product` फ़िल्टर) |
| `read_synergy` | एक सिनर्जी फ़ाइल का पूरा पाठ |
| `get_changes_since` | **नया।** एक समय अवधि में परिवर्तन, उत्पाद+संस्करण द्वारा समूहीकृत। इनपुट: `since` (आवश्यक), `until?`, `product?`, `kind?`, `limit?`। |
| `search_breaking_changes` | **नया।** ब्रेकिंग परिवर्तनों की सपाट सूची - किसी खोज शब्द की आवश्यकता नहीं है। इनपुट: `product?`, `since?`, `until?`, `limit?`। |
| `compare_versions` | **v1.1।** एक उत्पाद के दो संस्करणों के बीच सभी परिवर्तन। इनपुट: `product`, `from_version`, `to_version`। |
| `sync_status` | **v1.2।** प्रति-उत्पाद सिंक्रनाइज़ेशन ताजगी - अंतिम फ़ेच टाइमस्टैम्प, फ़ेच के बाद से घंटे, इनपुट रिलीज़ गणना। इनपुट: `product?`, `stale_only?`, `stale_hours?`। यह जानने के लिए कि कॉर्पस पुराना है या नहीं, `latest_releases` पर भरोसा करने से पहले उपयोग करें। |
| `sync_now` | **v1.2।** मांग पर ताज़ा करें (`hk sync` को मिरर करता है)। इनपुट: `product?`, `dry_run?`, `include_ingest?`, `include_embed?`, `timeout_ms?`। यदि कोई अन्य `sync_now` पहले से ही चल रहा है, तो `InvalidParams` के साथ अस्वीकार करता है। यह गिट के लिए प्रतिबद्ध नहीं है। |

v1.1 उपकरण `hk diff` / `hk breaking` और संस्करण-तुलना वर्कफ़्लो को मिरर करते हैं जिसके लिए पहले स्क्रिप्टिंग की आवश्यकता होती थी। v1.2 सिंक्रनाइज़ेशन उपकरण उस अंतर को बंद करते हैं जहां एक सत्र कॉर्पस को क्वेरी कर सकता है लेकिन इसे ताज़ा नहीं कर सकता है - `sync_status` पुरानी स्थिति की रिपोर्ट करता है, `sync_now` पाइपलाइन चलाता है। पूर्ण इनपुट स्कीमा के लिए [हैंडबुक → एमसीपी सर्वर](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/mcp-server/) देखें।

---

## स्रोत - 5 स्तर, 7 फ़ेचर रणनीतियाँ

पूर्ण परिदृश्य [SOURCES.md](SOURCES.md) में है।

- **स्तर 1 (GitHub रिलीज़)** - 23 उत्पादों के लिए `gh api repos/<owner>/<repo>/releases`, जिसमें एंथ्रोपिक एसडीके (7 भाषाएँ), एजेंट एसडीके (2), एन्ट सीएलआई, **claude-code** (अब v1.1 के बाद से घ-रिलीज़ के माध्यम से स्वचालित रूप से सिंक्रनाइज़ किया गया - पहले मैन्युअल रूप से सीड किया गया), claude-code-action, claude-code-security-review, और 15 एमसीपी पारिस्थितिकी तंत्र एसडीके शामिल हैं
- **स्तर 2 (कच्चा मार्कडाउन)** - `Aider-AI/aider/HISTORY.md`। सामान्य `keep-a-changelog` पार्सर (v1.1+) किसी भी उत्पाद के लिए भी उपलब्ध है जिसका स्रोत कीप-ए-चेंजलॉग प्रारूप में CHANGELOG.md है - `products.yaml` में एक प्रविष्टि के माध्यम से कॉन्फ़िगर करें।
- **स्तर 3 (एचटीएमएल / आरएसएस)** - `platform.claude.com/docs/release-notes`, `support.claude.com/articles/12138966`, `cursor.com/changelog/rss.xml`, `sourcegraph.com/changelog/featured.rss` (फ़िल्टर किया गया), `github.blog/changelog/label/copilot/`, `code.visualstudio.com/updates/v1_NNN`
- **स्तर 4 (कैटलॉग)** - `anthropics/skills`, `claude-plugins-{official,community}`, `knowledge-work-plugins`
- **स्तर 5 (सलाह)** - `@ClaudeCodeLog` एक्स खाता; मारक्रेन चेंजलॉग मिरर

फ़ेच रणनीतियाँ: `gh-releases | rss | raw-changelog | keep-a-changelog | html-scrape | catalog | playwright`। नया उत्पाद = `products.yaml` में एक प्रविष्टि।

---

## सिनर्जी - क्या अनलॉक होता है

12 क्यूरेटेड क्रॉस-उत्पाद वर्कफ़्लो। प्रत्येक एक रचना पैटर्न, उस ट्रिगर का वर्णन करता है जो इसे सही उत्तर बनाता है, और वह चेंजलॉग साक्ष्य जो इसे सक्षम बनाता है। उदाहरण:

- **08 — सार्वभौमिक SKILL.md प्रारूप** (कोड + कर्सर + कोडेक्स): एक कौशल लेखक, तीन एजेंट इसे पढ़ते हैं
- **09 — सात सतहों पर MCP** (कोड + कर्सर + जारी रखें + कोपायलट + विंडसर्फ + कोडी + एपीआई): एक बाइनरी, प्रत्येक एजेंट
- **10 — सतहों पर एंथ्रोपिक BYOK**: एक एपीआई कुंजी 7 संपादकों में क्लाउड को एकीकृत बिलिंग के साथ शक्ति प्रदान करती है
- **11 — क्लाउड कोड एइडर को व्यवस्थित करता है**: क्लाउड की योजना बनाते समय, सस्ते मॉडल पर लागत-बढ़ाने वाले संपादन
- **12 — MCP कॉन्फ़िगरेशन प्रारूप में ध्यान देने योग्य बातें**: कोपायलट `servers` का उपयोग करता है; बाकी सभी `mcpServers` का उपयोग करते हैं

[synergies/INDEX.md](synergies/INDEX.md) में पूर्ण अनुक्रमणिका।

---

## डेटासेट और फाइन-ट्यून किए गए मॉडल

कॉर्पस में एक डाउनस्ट्रीम परत है: परिवर्तन बुलेट से प्राप्त क्यूरेटेड **डेटासेट**, और उन डेटासेट पर प्रशिक्षित **फाइन-ट्यून किए गए मॉडल**। डेटासेट इस रिपॉजिटरी में कलाकृति है; मॉडल डाउनस्ट्रीम है।

### `dataset/changelog-actions/v1` — 301 प्रविष्टियाँ

प्रत्येक प्रविष्टि कॉर्पस से एक परिवर्तन बुलेट को एक हाथ से लिखी गई कार्रवाई आइटम के साथ जोड़ती है: `{kind, severity, subject, action_text, deadline, tags}`। 8-एनम `kind` वर्गीकरण (`breaking | deprecation | security | feature | fix | performance | docs | unknown`), स्तरीकृत 80/20 प्रशिक्षण/होल्डआउट, A3c-reviewed मानव द्वारा + क्रॉस-परिवार qwen3:8b न्यायाधीश (92.4% सहमति)। वितरण तालिका के लिए [`dataset/README.md`](dataset/README.md), क्षेत्र-दर-क्षेत्र अनुबंध के लिए [`SCHEMA.md`](dataset/changelog-actions/SCHEMA.md), और `action_text` लेखन नियमों के लिए [`STYLE.md`](dataset/changelog-actions/STYLE.md) देखें।

### `cs-actions:v1` — फाइन-ट्यून किया गया सिंथेसाइज़र

डेटासेट पर प्रशिक्षित पहला मॉडल। Qwen2.5-7B-Instruct + LoRA (रैंक-256 / सभी-रैखिक, 100 चरण QLoRA 242 प्रशिक्षण प्रविष्टियों पर), q8_0 GGUF, दो-चरणीय ओलामा मॉडेलफ़ाइल (`cs-actions-base` + `cs-actions:v1`) के माध्यम से तैनात।

**रिलीज़-गेट मूल्यांकन** (59-प्रविष्टि स्तरीकृत होल्डआउट, तीन रन, सभी पास, शून्य पार्स त्रुटियाँ):

| मीट्रिक | qwen3:8b आधार | cs-actions:v1 | डेल्टा |
|---|---|---|---|
| प्रकार की सहमति बनाम जमीनी सच्चाई | 78.0% | **88.1%** | +10.1pp |
| गंभीरता की सहमति बनाम जमीनी सच्चाई | 52.5% | **79.7%** | +27.2pp |
| Macro-F1 (अच्छी तरह से आबादी वाली कक्षाएं) | 0.801 | **0.854** | +0.053 |
| रन 3 — प्रकार-संकेत एब्लेशन (संकेत के साथ / बिना) | — | 0.842 / 0.777 | 6.5pt → लक्ष्य क्षेत्र |

रिलीज़ पास मानदंड `qwen3-vs-cs-actions ≥ qwen3-vs-GT` (`0.780 ≥ 0.780`) — पास ✓। [`eval-report.v1.json`](dataset/changelog-actions/v1/eval-report.v1.json) में प्रति-प्रविष्टि निर्णय, साथ ही [GitHub रिलीज़](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) से एकल-फ़ाइल डाउनलोड के रूप में संलग्न।

**दस्तावेजीकृत v1 सीमा — एंटी-`unknown` पूर्वाग्रह।** `unknown` एकमात्र वर्ग है जहां cs-actions:v1, qwen3:8b से कम प्रदर्शन करता है (F1 0.444 बनाम 0.545)। परिशुद्धता 1.000 / रिकॉल 0.286 — जब इनपुट वास्तव में अस्पष्ट होता है, तो मॉडल एक विशिष्ट प्रकार के लिए प्रतिबद्ध होता है बजाय कि अनिर्धारित रहने के। विरासत में मिला qwen-परिवार का पूर्व, LoRA द्वारा पूरी तरह से ओवरराइड नहीं किया गया। डाउनस्ट्रीम उपभोक्ताओं को अपेक्षित से कम `kind: "unknown"` दर को मानव समीक्षा के लिए बैचों को रूट करने के संकेत के रूप में मानना चाहिए। [v2 योजना](dataset/README.md) अज्ञात-वर्ग संवर्धन और संकेत-यादृच्छिकरण के साथ इसका समाधान करती है।

**इस रिपॉजिटरी के माध्यम से वितरित नहीं** — q8_0 GGUF लगभग 5 GB है और मर्ज किया गया चेकपॉइंट लगभग 15 GB है। डेटासेट और बिल्ड पाइपलाइन वह है जो प्रकाशित की जाती है; मॉडल [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) (4-चरण मैनुअल श्रृंखला, ~88 मिनट RTX 5080 लैपटॉप 16 GB VRAM पर गर्म) के अनुसार स्थानीय रूप से पुनर्निर्माण करता है। तीन-रन रिलीज़-गेट अनुबंध [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md) में है।

पूर्ण उपयोग वॉकथ्रू — जिसमें स्थानीय ओलामा आह्वान, `format: "json"` प्रति-अनुरोध कॉलर आवश्यकता और बिल्ड पाइपलाइन शामिल है — [हैंडबुक → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/) पृष्ठ पर है।

---

## परीक्षण

विटेस्ट सूट इकाई / एकीकरण / प्रतिगमन / धूम्रपान स्तरों को कवर करता है। v0.7.0 की तारीख तक [test-spec-3.md](test-spec-3.md) वर्तमान प्राधिकरण है; [test-spec.md](test-spec.md) (v1) और [test-spec-2.md](test-spec-2.md) (v2) डिज़ाइन वंश के ऐतिहासिक रिकॉर्ड के रूप में रिपॉजिटरी में बने हुए हैं।

```bash
pnpm test               # unit + integration + regression (~36s, 519 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

लेआउट:

| निर्देशिका | यह क्या कवर करता है |
|-----|----------------|
| `test/unit/` | प्रति-मॉड्यूल — निकालें, अंतर्ग्रहण करें, क्वेरी करें (जिसमें `until` / ब्राउज़ / तब से / तुलना करें), db (जिसमें डायम-कॉन्फ़िगर v3 माइग्रेशन शामिल है), एम्बेड, हाइब्रिड, फ़ेच + प्रत्येक प्रदाता (ओलामा / वॉयज / **OpenAI**) + फ़ेच-आरएसएस/चेंजलॉग (जिसमें **कीप-ए-चेंजलॉग** पार्सर)/html + फ़ेच-एमसीपी-रजिस्ट्री + फ़ेच-प्लेराइट + उत्पाद-कॉन्फ़िगर + सिनर्जी अंतर्ग्रहण/क्वेरी |
| `test/integration/` | एंड-टू-एंड — पाइपलाइन, सिंक, एमसीपी सर्वर (स्टडियो JSON-RPC, 13 उपकरण जिनमें `sync_status` / `sync_now` शामिल हैं), सीएलआई (जिसमें `hk diff`, `hk breaking` शामिल हैं) |
| `test/regression/` | §8.1–§8.19 — प्रत्येक विकास के दौरान ठीक की गई वास्तविक बग के खिलाफ सुरक्षा करता है (§8.19: ghReleases प्रारंभिक-निकास पृष्ठन विंडो में आइटम को संरक्षित करता है) |
| `test/smoke/` | वास्तविक `products/` के खिलाफ ऑप्ट-इन पूर्ण-कॉर्पस (1,143 फ़ाइलें) |
| `test/fixtures/` | 3 नकली उत्पाद + मॉक एचटीटीपी प्रतिक्रियाएं (आरएसएस / जीएच / वॉयज / कोहेर / ओलामा / एंथ्रोपिक / स्मिथरी / आधिकारिक एमसीपी रजिस्ट्री) |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**परीक्षणों में डिफ़ॉल्ट रूप से कोई नेटवर्क नहीं** — प्रदाता एचटीटीपी को `vi.spyOn(global, 'fetch')` के माध्यम से मॉक किया जाता है। वास्तविक SQLite अस्थायी फ़ाइलों में (न कि `:memory:`) क्योंकि sqlite-vec एक्सटेंशन लोड सिमेंटिक्स संस्करणों में भिन्न होते हैं और ऑन-डिस्क कैनोनिकल पथ है। प्लेराइट को गतिशील आयात के माध्यम से लोड किया जाता है और `vi.doMock('playwright', ...)` के माध्यम से मॉक किया जाता है ताकि परीक्षण वास्तविक ब्राउज़र स्थापना के बिना पास हो जाएं।

सीआई: `.github/workflows/test.yml` पुश और पीआर पर `pnpm test:coverage` चलाता है।

---

## समस्या निवारण

**"डेटाबेस लॉक" या डब्ल्यूएएल त्रुटियाँ**

एक अन्य `hk` प्रक्रिया (या एक पुरानी एमसीपी सर्वर) SQLite डेटाबेस को खुला रखता है। अन्य `hk` प्रक्रियाओं को बंद करें, फिर पुनः प्रयास करें। यदि समस्या बनी रहती है, तो `data/claude-synergy.db` के साथ `-wal` या `-shm` फ़ाइल की जांच करें — ये सामान्य डब्ल्यूएएल-मोड फ़ाइलें हैं और अंतिम कनेक्शन बंद होने पर उन्हें साफ़ कर दिया जाएगा। उन्हें तब तक न हटाएं जब तक कि किसी अन्य प्रक्रिया में डीबी खुला न हो।

**"sqlite-vec एक्सटेंशन नहीं मिला" / sqlite-vec लोड विफल**

`sqlite-vec` मूल एक्सटेंशन लोड करने में विफल रहा। सामान्य कारण:

1. **नोड संस्करण बहुत पुराना** — `claude-synergy` को नोड 22.12 या उसके बाद का संस्करण चाहिए; यह विंडोज, macOS या लिनक्स (glibc या musl) पर x64 या arm64 में चलता है; 32-बिट एआरएम समर्थित नहीं है। `node -v` से जांच करें।
2. **मूल मॉड्यूल को पुनर्निर्माण की आवश्यकता है** — `npm rebuild better-sqlite3` (या `pnpm rebuild better-sqlite3`) चलाएं।
3. **प्लेटफ़ॉर्म बेमेल** — विंडोज/एआरएम पर, `better-sqlite3` को सी++ बिल्ड टूलचेन की आवश्यकता होती है। [विंडोज-बिल्ड-टूल्स](https://github.com/nicedoc/windows-build-tools) या डेस्कटॉप विकास के साथ विज़ुअल स्टूडियो बिल्ड टूल्स स्थापित करें।

ध्यान दें: `sqlite-vec` वैकल्पिक है। FTS5 कीवर्ड खोज (`hk query`) इसके बिना काम करती है। केवल `hk embed` और `hk hybrid` को वेक्टर एक्सटेंशन की आवश्यकता होती है।

**"उत्पाद एक्स के लिए सिंक विफल" / फ़ेच त्रुटियाँ**

`hk fetch` और `hk sync` बाहरी एपीआई को कॉल करते हैं। सामान्य कारण:

- **GitHub दर सीमा** — `gh-releases` रणनीति `gh api` को कॉल करती है, जो आपके `GITHUB_TOKEN` का उपयोग करती है। अप्रमाणित अनुरोध 60 अनुरोध/घंटा तक सीमित हैं; `gh auth login` से प्रमाणित करें या अपने परिवेश में `GITHUB_TOKEN` सेट करें।
- **नेटवर्क / प्रॉक्सी** — आरएसएस और एचटीएमएल फ़ेचर `fetch()` का उपयोग करते हैं। कनेक्टिविटी और किसी भी कॉर्पोरेट प्रॉक्सी सेटिंग्स (`HTTPS_PROXY`) की जांच करें।
- **अज्ञात उत्पाद** — `hk fetch --product foo` केवल `products.yaml` में सूचीबद्ध उत्पादों के लिए काम करता है। सभी उपलब्ध नामों को देखने के लिए `hk products` चलाएं।

सिंक आइडेंपोटेंट है — आंशिक विफलता के बाद इसे फिर से चलाना सुरक्षित है। पहले से ही प्राप्त रिलीज़ को छोड़ दिया जाता है।

**"एम्बेडिंग प्रदाता प्रतिक्रिया नहीं दे रहा"**

`hk embed` एक बाहरी एम्बेडिंग सेवा को कॉल करता है:

- **ओलामा (डिफ़ॉल्ट, 768-आयाम)** — सुनिश्चित करें कि ओलामा चल रहा है (`ollama serve`) और एम्बेडिंग मॉडल डाउनलोड किया गया है (`ollama pull nomic-embed-text`)।
- **वॉयज (1024-आयाम)** — अपने परिवेश में `VOYAGE_API_KEY` सेट करें। [dash.voyageai.com](https://dash.voyageai.com) पर अपनी एपीआई कुंजी जांचें।
- **OpenAI (1536-आयाम डिफ़ॉल्ट, कॉन्फ़िगर करने योग्य)** — `OPENAI_API_KEY` सेट करें। डिफ़ॉल्ट मॉडल `text-embedding-3-small` है; इसे `OPENAI_EMBED_MODEL` (जैसे 3072-आयाम के लिए `text-embedding-3-large`) से बदलें। `hk hybrid --embed openai` या `hk embed --embed openai` के माध्यम से उपयोग करें।

**प्रदाता स्विच पर एम्बेडिंग आयाम बेमेल**

प्रत्येक प्रदाता एक निश्चित आयाम के वेक्टर उत्पन्न करता है (ओलामा 768, वॉयज 1024, डिफ़ॉल्ट रूप से OpenAI 1536 — OpenAI मॉडल के मूल आकार के भीतर कॉन्फ़िगर करने योग्य आयाम का समर्थन करता है)। डेटाबेस सक्रिय आयाम को `schema_meta.embedding_dim` में संग्रहीत करता है। विभिन्न आयामों में प्रदाताओं को स्विच करने से, जबकि चंक्स मौजूद हैं, `EMBEDDING_DIM_MISMATCH` (`AppError`) उत्पन्न होगा, न कि वेक्टर तालिका को चुपचाप दूषित करना। स्विच करने के लिए:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --embed openai     # new provider, new dim, fresh chunks_vec
```

OpenAI मैत्रोश्का ट्रंकेशन (मूल आयाम से छोटा) के लिए, `OPENAI_EMBED_MODEL` सेट करें और वांछित आयाम को `hk embed` के प्रदाता निर्माण के माध्यम से पास करें — विवरण के लिए [हैंडबुक एम्बेडिंग अनुभाग](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cli-reference/#embedding-providers-and-dimensions) देखें।

**स्कीमा संस्करण बेमेल / दूषित डेटाबेस**

यदि डेटाबेस को पुराने स्कीमा संस्करण के साथ बनाया गया था और माइग्रेशन विफल हो जाता है, या यदि क्रैश के बाद डेटा गलत दिखता है:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --context structured --embedding ollama   # optional, for vector search
```

यह सुरक्षित है — डेटाबेस एक व्युत्पन्न कैश है। सभी स्रोत डेटा `products/*/releases/*.md` फ़ाइलों में मौजूद है।

---

## संबंधित फ़ाइलें

- [CONTRIBUTING.md](CONTRIBUTING.md) — उत्पादों को कैसे जोड़ें, परीक्षण कैसे चलाएं, पीआर कैसे सबमिट करें
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23 कार्रवाई योग्य आइटम (सुरक्षा सीवीई, मॉडल सेवानिवृत्ति, ब्रेकिंग परिवर्तन, कॉन्फ़िगरेशन संबंधी सावधानियां)
- [SOURCES.md](SOURCES.md) — 5-स्तरीय स्रोत परिदृश्य जिसमें फ़ेच रणनीतियां शामिल हैं
- [synergies/INDEX.md](synergies/INDEX.md) — 12 क्यूरेटेड क्रॉस-प्रोडक्ट वर्कफ़्लो
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — SQLite + sqlite-vec स्कीमा
- [test-spec-3.md](test-spec-3.md) (वर्तमान) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (ऐतिहासिक) — परीक्षण सूट विनिर्देश

---

## लाइसेंस

एमआईटी। <a href="https://mcp-tool-shop.github.io/">एमसीपी टूल शॉप</a> द्वारा निर्मित।
