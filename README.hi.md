<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

यह एंथ्रोपिक (Anthropic) और उससे संबंधित सभी एआई विकास उपकरणों के परिवर्तनों का एक स्थानीय, खोज योग्य दर्पण है - साथ ही एक क्यूरेटेड "**सिनर्जी**" (Synergy) परत जो विभिन्न उत्पादों के बीच कार्यप्रवाह का वर्णन करती है - ताकि 'हॉर्नेस्स' (harness) के अंदर मौजूद एलएलएम (LLM) एजेंट को पता चल सके कि 'हॉर्नेस्स' क्या कर सकता है।

<p align="center">

[![tests](https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg)](https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml) [![npm](https://img.shields.io/npm/v/@mcptoolshop/claude-synergy)](https://www.npmjs.com/package/@mcptoolshop/claude-synergy) [![license](https://img.shields.io/badge/license-MIT-blue)](#license) [![landing page](https://img.shields.io/badge/landing%20page-live-brightgreen)](https://mcp-tool-shop-org.github.io/claude-synergy/)

</p>

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```

एकल एफटीएस (FTS) क्वेरी एक समन्वित क्रॉस-एसडीके (SDK) सुरक्षा सुधार को उजागर करती है जिसे किसी भी व्यक्तिगत परिवर्तन लॉग में सीवीई (CVE) के रूप में चिह्नित नहीं किया गया था। यही मुख्य प्रदर्शन है: जब प्रत्येक परिवर्तन लॉग एक साथ होता है, तो पैटर्न उभरते हैं।

रिपॉजिटरी: [github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## समस्या

क्लाउड कोड सीएलआई (CLI) लगभग दैनिक रूप से जारी होता है। क्लाउड एपीआई (API) भी लगभग उतनी ही बार जारी होता है। एसडीके (SDK) सीएलआई (CLI) रिलीज के अनुसार जारी होते हैं। क्लाउड डिज़ाइन, कोवर्किंग (Cowork), चैट और मोबाइल, सभी एक एकीकृत हेल्प सेंटर के माध्यम से अपडेट होते हैं। एमसीपी (MCP) इकोसिस्टम में प्रति सप्ताह लगभग 200-300 नए सर्वर जारी होते हैं। इसके अलावा, 7 प्रमुख एआई विकास उपकरण (कर्सर, एडर, कंटिन्यू, कोपायलट, कोडी, विंडसर्फ़) हैं, जिनमें से प्रत्येक अपने स्वयं के परिवर्तन लॉग अपनी गति से जारी करता है।

इनमें से किसी भी 'हॉर्नेस्स' के अंदर मौजूद एलएलएम (LLM) एजेंट में प्रशिक्षण डेटा का एक निश्चित कटऑफ (cutoff) होता है। यह अंतर हर दिन बढ़ रहा है। ऐसे फ़ीचर जारी होते हैं जिनके बारे में एजेंट को पता नहीं होता है। ऐसे बग ठीक किए जाते हैं जिनसे एजेंट अभी भी निपट रहा है। ऐसे एनवायरनमेंट वेरिएबल (Env vars) और फ़्लैग जोड़े जाते हैं जिनका एजेंट कभी भी सुझाव नहीं देता है। विभिन्न उत्पादों के बीच कार्यप्रवाह जो कई सतहों को जोड़ते हैं, वे अभी भी अज्ञात रहते हैं।

यह रिपॉजिटरी इस अंतर को कम करता है। 'सिनर्जी' अनुभाग इसे एक उत्पाद बनाता है, केवल एक दर्पण नहीं।

---

## यहाँ क्या है

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
├── test/                    # 382 tests (unit, integration, regression, smoke)
├── data/claude-synergy.db   # SQLite database (created by `hk init`)
├── schema.sql               # Tier 2a tables (products, releases, changes, entities, FTS5, …)
├── schema-vec.sql           # Tier 2b tables (chunks, chunks_vec, chunks_fts)
├── SOURCES.md               # 5-tier source landscape with fetch strategies
└── URGENT_FINDINGS.md       # 23 actionable items surfaced from the corpus
```

**वर्तमान आंकड़े (v1.0.0 के अनुसार):** 44 उत्पाद / 1,186 रिलीज़ फ़ाइलें / 6,042 परिवर्तन / 1,225 इकाइयां / 12 तालमेल / 382 परीक्षण।

---

## स्थिति - सभी स्तर जारी किए गए

| स्तर | स्थिति | क्या है |
|------|--------|--------------|
| **1 — बूटस्ट्रैप (मार्कडाउन कॉर्पस)** | ✅ जारी किया गया | स्टडी-स्वार्म ने जनवरी से मई 2026 तक 706 रिलीज फ़ाइलें सीड (seed) कीं; इसे चौथे स्तर तक 1,186 तक बढ़ाया गया। |
| **2a — SQLite + FTS5 + CLI** | ✅ जारी किया गया | `hk` सीएलआई (CLI); 15 सबकमांड; 300 मिलीसेकंड से कम में डेटा इनपुट। |
| **2b — sqlite-vec + प्रासंगिक पुनर्प्राप्ति (Contextual Retrieval)** | ✅ जारी किया गया | प्रदाता-प्लग करने योग्य (कोई नहीं/संरचित/ओलामा/क्लाउड-हाइक्यू संदर्भ × ओलामा/वॉयज एम्बेड × कोई नहीं/ओलामा-जज/वॉयज/कोहेर रीरैंक)। |
| **3 — सिंक + एमसीपी सर्वर** | ✅ जारी किया गया | `hk fetch / sync / seed-markers`; `claude-synergy-mcp` 8 टूल को stdio के माध्यम से उजागर करता है। |
| **4a — एंथ्रोपिक से आगे बढ़ें** | ✅ जारी किया गया | +15 एमसीपी एसडीके (SDK), कर्सर (RSS), एडर (HISTORY.md), कंटिन्यू.देव, कोडी एंटरप्राइज (RSS फ़िल्टर)। |
| **4b — एचटीएमएल-स्क्रैप फ़ेचर** | ✅ जारी किया गया | GitHub कोपायलट + वीएस कोड चैट (विंडसर्फ़ के लिए प्लेराइट की आवश्यकता है - v0.7)। |
| **4c — टर्नडाउन एचटीएमएल→मार्कडाउन इनजेस्ट** | ✅ जारी किया गया | एचटीएमएल बॉडी (कोपायलट/वीएस कोड/कर्सर) अब एफटीएस5 (FTS5) + एंटिटी एक्सट्रैक्शन के लिए प्रति-बुलेट पंक्तियाँ उत्पन्न करते हैं। |
| **4d — प्लेराइट + एमसीपी रजिस्ट्री + YAML कॉन्फ़िगरेशन** | ✅ जारी किया गया | प्लेराइट के माध्यम से विंडसर्फ़; स्मिथरी + आधिकारिक एमसीपी रजिस्ट्री को चौथे स्तर के कैटलॉग के रूप में उपयोग किया जाता है; उत्पादों को `products.yaml` में समेकित किया गया है। |

v0.8+ के लिए रोडमैप: [URGENT_FINDINGS.md](URGENT_FINDINGS.md) और मुद्दों में ट्रैक किया गया है।

---

## सुरक्षा और डेटा मॉडल

यह टूल स्थानीय रूप से चलता है। **डेटा जो प्रभावित होता है:** एक व्युत्पन्न SQLite डेटाबेस और मार्कडाउन रिलीज़ फ़ाइलें - ये सभी फिर से बनाए जा सकते हैं। **नेटवर्क:** केवल आउटबाउंड HTTPS कनेक्शन, जब आप `hk fetch`/`hk sync` (GitHub API, RSS फ़ीड, परिवर्तन लॉग पेज, MCP रजिस्ट्री) या `hk embed` को किसी दूरस्थ प्रदाता (Voyage, Cohere) के साथ चलाते हैं। **गुप्त जानकारी:** यह `GITHUB_TOKEN`, `VOYAGE_API_KEY`, `COHERE_API_KEY`, `ANTHROPIC_API_KEY` को पर्यावरण चर से पढ़ता है - कभी भी लॉग नहीं किया जाता, कभी भी डिस्क पर संग्रहीत नहीं किया जाता। **कोई टेलीमेट्री नहीं।** रिपोर्टिंग नीति के लिए [SECURITY.md](SECURITY.md) देखें।

---

## इंस्टॉल करें

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

विकास के लिए, बिना बिल्ड किए, `npx tsx src/cli.ts ...` का सीधे उपयोग करें। **pnpm 10 की एक विशेष बात:** `pnpm dev` सीएलआई (CLI) फ़्लैग को `--` के बाद खा जाता है; विकास के लिए `npx tsx` का उपयोग करें।

---

## सीएलआई (CLI) सतह - 15 कमांड

```
# DB lifecycle
hk init                              # create DB with schema
hk ingest                            # parse products/*/releases/*.md → DB (idempotent)
hk embed                             # generate chunks + embeddings (sqlite-vec)
hk fetch [--product X]               # incremental pull from sources
hk sync                              # combined fetch → ingest → embed (cron-friendly)
hk seed-markers                      # one-time setup after initial corpus

# Search
hk query "managed agents"            # FTS5 keyword search
hk hybrid "credential exfiltration"  # FTS5 + vec hybrid via RRF (+ optional --rerank)

# Entity lookups
hk env-var CLAUDE_CODE_WORKFLOWS     # when introduced + history
hk command code-review               # slash command + rename history
hk model claude-opus-4-7             # model launch + mentions across products
hk cve CVE-2025-66414                # CVE references in corpus

# Browsing
hk latest [--product X] [--limit N]  # recent releases
hk products                          # list all 44 with counts
hk top env_var                       # most-mentioned by entity type
                                     # (env_var, slash_command, cli_option,
                                     #  model_id, beta_header, cve, ghsa,
                                     #  hook_event, setting_key)
```

---

## उदाहरण कार्यप्रवाह

क्लाउड कोड एनवायरमेंट वेरिएबल कब पेश किया गया था, यह पता करें।
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**एक ऐसे बदलाव को ट्रैक करें जो सभी सॉफ्टवेयर डेवलपमेंट किट (एसडीके) को प्रभावित करता है:**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

एक आदर्श माइग्रेशन की योजना बनाएं:
```
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  Deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model,
  with retirement on the Claude API scheduled for June 15, 2026...
```

पूरे डेटासेट में अर्थ-आधारित खोज।
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

यह क्वेरी कभी भी "env_scrub" शब्द का उल्लेख नहीं करती है - यह वेक्टर सतहों को अर्थ संबंधी समानता के आधार पर खोजता है। शुद्ध FTS5 (फुल-टेक्स्ट सर्च 5) इसे पूरी तरह से छोड़ देता है।

---

## MCP सर्वर: अपने एजेंटों को इस डेटासेट तक पहुंचने की अनुमति दें।

`claude-synergy-mcp` मानक इनपुट/आउटपुट (stdio) के माध्यम से 8 उपकरण उपलब्ध कराता है। आप इसे क्लाउड कोड (Claude Code) या किसी भी MCP होस्ट से `~/.claude/.mcp.json` फ़ाइल या अपने प्रोजेक्ट की `.mcp.json` फ़ाइल के माध्यम से कनेक्ट कर सकते हैं।

```json
{
  "mcpServers": {
    "claude-synergy": {
      "command": "claude-synergy-mcp",
      "env": {
        "CLAUDE_SYNERGY_DB": "/path/to/claude-synergy/data/claude-synergy.db"
      }
    }
  }
}
```

GitHub Copilot के लिए `.vscode/mcp.json` फ़ाइल में, `mcpServers` के बजाय `servers` नामक अनुभाग का उपयोग करें (अधिक जानकारी के लिए [synergy 12](synergies/12-mcp-config-format-gotcha.md) देखें)।

प्रदर्शित उपकरण:

| उपकरण। | उद्देश्य। |
|---|---|
| `search` | हाइब्रिड एफटीएस5 + वेक्टर; वैकल्पिक रूप से पुनः रैंकिंग (रीरैंक)। प्राकृतिक भाषा में पूछे गए प्रश्नों के लिए डिफ़ॉल्ट मोड। |
| `lookup_entity` | सटीक इकाई इतिहास: पर्यावरण चर, स्लैश कमांड, मॉडल आईडी, सीवीई (सुरक्षा कमजोरियों), आदि। |
| `latest_releases` | हाल ही में विभिन्न उत्पादों (या एक उत्पाद) के लिए जारी किए गए नए संस्करण। |
| `get_release` | एक विज्ञप्ति की पूरी सामग्री। |
| `list_products` | गणना के साथ सूची बनाना + नवीनतम संस्करण। |
| `top_entities` | प्रकार के अनुसार सबसे अधिक उल्लेखित इकाइयाँ। |
| `list_synergies` | विभिन्न उत्पादों को मिलाकर तैयार किए गए कार्यप्रवाह। |
| `read_synergy` | एक सिनर्जी फ़ाइल का पूरा पाठ। |

---

## स्रोत: 5 स्तर, 6 डेटा प्राप्त करने की रणनीतियाँ।

[SOURCES.md] फ़ाइल में विस्तृत जानकारी उपलब्ध है।

- **स्तर 1 (GitHub रिलीज़)** — `gh api repos/<मालिक>/<रिपॉजिटरी>/releases`। यह 22 उत्पादों के लिए है, जिनमें एंथ्रोपिक एसडीके (7 भाषाएं), एजेंट एसडीके (2), एंट सीएलआई, क्लाउड-कोड-एक्शन, क्लाउड-कोड-सुरक्षा-समीक्षा, और 15 एमसीपी इकोसिस्टम एसडीके शामिल हैं।
- **स्तर 2 (रॉ मार्कडाउन)** — `anthropics/claude-code/CHANGELOG.md` + `Aider-AI/aider/HISTORY.md`
- **स्तर 3 (एचटीएमएल / आरएसएस)** — `platform.claude.com/docs/release-notes`, `support.claude.com/articles/12138966`, `cursor.com/changelog/rss.xml`, `sourcegraph.com/changelog/featured.rss` (फ़िल्टर किया गया), `github.blog/changelog/label/copilot/`, `code.visualstudio.com/updates/v1_NNN`
- **स्तर 4 (सूची)** — `anthropics/skills`, `claude-plugins-{आधिकारिक,समुदाय}`, `knowledge-work-plugins`
- **स्तर 5 (सलाह)** — `@ClaudeCodeLog` ट्विटर अकाउंट; marckrenn का चेंजलॉग दर्पण।

डेटा प्राप्त करने की विधियाँ: `gh-releases | rss | raw-changelog | html-scrape | catalog | playwright`. नया उत्पाद = `products.yaml` फ़ाइल में एक प्रविष्टि।

---

## सिनेर्जी - क्या खुलता है?

12 विशेष रूप से तैयार किए गए, विभिन्न उत्पादों से जुड़े कार्यप्रवाह। प्रत्येक में एक विशिष्ट संरचना का वर्णन है, वह कारण जो इसे सही समाधान बनाता है, और वह परिवर्तन लॉग जो इसे संभव बनाता है। उदाहरण:

- **08 — यूनिवर्सल स्किल.एमडी फॉर्मेट** (कोड + कर्सर + कोडेक्स): एक कौशल लेखक, तीन एजेंट इसे पढ़ते हैं।
- **09 — एमसीपी सात सतहों पर** (कोड + कर्सर + जारी रखें + कोपायलट + विंडसर्फ + कोडी + एपीआई): एक बाइनरी फ़ाइल, हर एजेंट के लिए।
- **10 — एन्थ्रोपिक 'बाइयूओके' सभी सतहों पर:** एक एपीआई कुंजी, क्लाउड को 7 संपादकों में एकीकृत बिलिंग के साथ चलाती है।
- **11 — क्लाउड कोड, एइडर को व्यवस्थित करता है:** क्लाउड योजना बनाता है, जबकि भारी संपादन कार्यों को एक सस्ते मॉडल पर स्थानांतरित किया जाता है।
- **12 — एमसीपी कॉन्फ़िगरेशन फॉर्मेट में एक महत्वपूर्ण बात:** कोपायलट `सर्वर` का उपयोग करता है; बाकी सभी `mcpservers` का उपयोग करते हैं।

पूरा अनुक्रमणिका [synergies/INDEX.md](synergies/INDEX.md) में उपलब्ध है।

---

## परीक्षण।

विटेस्ट (Vitest) में यूनिट, इंटीग्रेशन, रिग्रेशन और स्मोक परीक्षण शामिल हैं। v0.7.0 के अनुसार, "[test-spec-3.md](test-spec-3.md)" वर्तमान में आधिकारिक दस्तावेज है; [test-spec.md](test-spec.md) (v1) और [test-spec-2.md](test-spec-2.md) (v2) डिज़ाइन के ऐतिहासिक रिकॉर्ड के रूप में रिपॉजिटरी में मौजूद हैं।

```bash
pnpm test               # unit + integration + regression (~16s, 382 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

लेआउट:

| मुझे खेद है, लेकिन मैं इस अनुरोध को पूरा करने में असमर्थ हूं क्योंकि यह अपूर्ण है। कृपया पूरा वाक्य या पाठ प्रदान करें जिसका आप अनुवाद करवाना चाहते हैं। | यह क्या शामिल करता है। |
|-----|----------------|
| `test/unit/` | प्रत्येक मॉड्यूल के लिए: डेटा निकालना, डेटा का संग्रह करना, डेटा पर प्रश्न करना, डेटाबेस, एम्बेडिंग, हाइब्रिड सिस्टम, डेटा प्राप्त करना, साथ ही प्रत्येक प्रदाता के लिए, आरएसएस/परिवर्तन लॉग/एचटीएमएल डेटा प्राप्त करना, एमसीपी रजिस्ट्री डेटा प्राप्त करना, प्लेराइट डेटा प्राप्त करना, और उत्पादों की कॉन्फ़िगरेशन जानकारी प्राप्त करना। |
| `test/integration/` | एंड-टू-एंड — पाइपलाइन, सिंक्रोनाइज़ेशन, एमसीपी सर्वर (स्टैंडर्ड इनपुट/आउटपुट JSON-RPC), कमांड-लाइन इंटरफेस। |
| `test/regression/` | §8.1–§8.18 — प्रत्येक एक वास्तविक बग को ठीक करता है जो विकास के दौरान पाया गया था। |
| `test/smoke/` | पूर्ण डेटासेट, वास्तविक `products/` (1,143 फ़ाइलें) के लिए। |
| `test/fixtures/` | 3 नकली उत्पाद + मॉक एचटीटीपी प्रतिक्रियाएं (RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / आधिकारिक MCP रजिस्ट्री)। |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**डिफ़ॉल्ट रूप से परीक्षणों में कोई नेटवर्क नहीं** — प्रदाता एचटीटीपी को `vi.spyOn(global, 'fetch')` के माध्यम से मॉक किया गया है। अस्थायी फ़ाइलों में वास्तविक SQLite (`:memory:` नहीं) क्योंकि `sqlite-vec` एक्सटेंशन का लोडिंग व्यवहार विभिन्न संस्करणों में भिन्न होता है और ऑन-डिस्क ही मानक तरीका है। Playwright को गतिशील आयात के माध्यम से लोड किया जाता है और `vi.doMock('playwright', ...)` के माध्यम से मॉक किया जाता है, इसलिए परीक्षण वास्तविक ब्राउज़र इंस्टॉलेशन के बिना पास हो जाते हैं।

CI: `.github/workflows/test.yml` पुश और PR पर `pnpm test:coverage` चलाता है।

---

## समस्या निवारण

**"डेटाबेस लॉक" या WAL त्रुटियां**

एक अन्य `hk` प्रक्रिया (या एक पुराना MCP सर्वर) SQLite डेटाबेस को खुला रखे हुए है। अन्य `hk` प्रक्रियाओं को बंद करें, फिर पुनः प्रयास करें। यदि समस्या बनी रहती है, तो `data/claude-synergy.db` के साथ `-wal` या `-shm` फ़ाइलें देखें - ये सामान्य WAL-मोड फ़ाइलें हैं और अंतिम कनेक्शन बंद होने पर इन्हें साफ़ कर दिया जाएगा। जब तक किसी अन्य प्रक्रिया के पास DB खुला है, तब तक उन्हें न हटाएं।

**"sqlite-vec एक्सटेंशन नहीं मिला" / sqlite-vec लोड विफल**

`sqlite-vec` देशी एक्सटेंशन लोड होने में विफल रहा। सामान्य कारण:

1. **Node का संस्करण बहुत पुराना** — `claude-synergy` को Node 22+ की आवश्यकता है। `node -v` से जांचें।
2. **देशी मॉड्यूल को फिर से बनाने की आवश्यकता है** — `npm rebuild better-sqlite3` (या `pnpm rebuild better-sqlite3`) चलाएं।
3. **प्लेटफ़ॉर्म बेमेल** — Windows/ARM पर, `better-sqlite3` को एक C++ बिल्ड टूलचेन की आवश्यकता होती है। [windows-build-tools](https://github.com/nicedoc/windows-build-tools) या "डेस्कटॉप डेवलपमेंट विद C++" के साथ विज़ुअल स्टूडियो बिल्ड टूल्स स्थापित करें।

ध्यान दें: `sqlite-vec` वैकल्पिक है। FTS5 कीवर्ड खोज (`hk query`) इसके बिना काम करती है। केवल `hk embed` और `hk hybrid` को वेक्टर एक्सटेंशन की आवश्यकता होती है।

**"उत्पाद X के लिए सिंक विफल" / फ़ेच त्रुटियां**

`hk fetch` और `hk sync` बाहरी एपीआई को कॉल करते हैं। सामान्य कारण:

- **GitHub दर सीमा** — `gh-releases` रणनीति `gh api` पर चली जाती है, जो आपके `GITHUB_TOKEN` का उपयोग करती है। बिना प्रमाणीकरण वाले अनुरोधों में 60 req/hr की सीमा होती है; `gh auth login` के साथ प्रमाणित करें या अपने वातावरण में `GITHUB_TOKEN` सेट करें।
- **नेटवर्क / प्रॉक्सी** — RSS और HTML फ़ेचर `fetch()` का उपयोग करते हैं। कनेक्टिविटी और किसी भी कॉर्पोरेट प्रॉक्सी सेटिंग्स (`HTTPS_PROXY`) की जांच करें।
- **अज्ञात उत्पाद** — `hk fetch --product foo` केवल `products.yaml` में सूचीबद्ध उत्पादों के लिए काम करता है। सभी उपलब्ध नामों को देखने के लिए `hk products` चलाएं।

सिंक आइडेंम्पोटेंट है — आंशिक विफलता के बाद इसे फिर से चलाना सुरक्षित है। पहले से प्राप्त किए गए रिलीज़ को छोड़ दिया जाता है।

**"एम्बेडिंग प्रदाता प्रतिक्रिया नहीं दे रहा है"**

`hk embed` एक बाहरी एम्बेडिंग सेवा को कॉल करता है:

- **Ollama (डिफ़ॉल्ट)** — सुनिश्चित करें कि Ollama चल रहा है (`ollama serve`) और एम्बेडिंग मॉडल डाउनलोड किया गया है (`ollama pull nomic-embed-text`)।
- **Voyage** — अपने वातावरण में `VOYAGE_API_KEY` सेट करें। अपने API कुंजी की जांच [dash.voyageai.com](https://dash.voyageai.com) पर करें।

**स्कीमा संस्करण बेमेल / दूषित डेटाबेस**

यदि DB को एक पुराने स्कीमा संस्करण के साथ बनाया गया था और माइग्रेशन विफल हो जाता है, या यदि क्रैश के बाद डेटा गलत दिखता है:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --context structured --embedding ollama   # optional, for vector search
```

यह सुरक्षित है — DB एक व्युत्पन्न कैश है। सभी स्रोत डेटा `products/*/releases/*.md` फ़ाइलों में मौजूद है।

---

## संबंधित फ़ाइलें

- [CONTRIBUTING.md](CONTRIBUTING.md) — उत्पादों को जोड़ने, परीक्षण चलाने और पुल रिक्वेस्ट (PR) सबमिट करने का तरीका।
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23 महत्वपूर्ण मुद्दे (सुरक्षा संबंधी कमजोरियां, मॉडल को बंद करना, महत्वपूर्ण बदलाव, कॉन्फ़िगरेशन संबंधी समस्याएं)।
- [SOURCES.md](SOURCES.md) — 5-स्तरीय स्रोत विवरण और उन्हें प्राप्त करने की रणनीतियाँ।
- [synergies/INDEX.md](synergies/INDEX.md) — 12 चयनित, विभिन्न उत्पादों से जुड़े कार्यप्रवाह।
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — SQLite और sqlite-vec स्कीमा।
- [test-spec-3.md](test-spec-3.md) (वर्तमान) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (ऐतिहासिक) — परीक्षण सूट के विनिर्देश।

---

## लाइसेंस

MIT। बनाया गया: <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> द्वारा।
