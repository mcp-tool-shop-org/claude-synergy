---
product: skills
catalog: anthropics-skills-official
skill_name: "docx"
trigger_summary: ".docx (Word) — create, read, edit, manipulate, convert. Includes tracked changes, comments, TOC, page numbers, letterheads."
github_path: "skills/docx"
fetched_at: "2026-05-21"
---

# docx

**Description:** Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation.

**Trigger:** Any mention of `.docx`, "Word doc", "word document", "report/memo/letter/template" as a Word deliverable, or extracting from / editing Word files.

**Surfaces:** Claude.ai document capabilities (production), Claude Code, Claude API. License: Proprietary (source-available, not Apache 2.0 like most other skills here).

## Original SKILL.md excerpt

> # DOCX creation, editing, and analysis
>
> ## Overview
> A .docx file is a ZIP archive containing XML files.
>
> ## Quick Reference
>
> | Task | Approach |
> |------|----------|
> | Read/analyze content | `pandoc` or unpack for raw XML |
> | Create new document | Use `docx-js` |
> | Edit existing document | Unpack → edit XML → repack |
>
> ### Converting .doc to .docx
> Legacy `.doc` files must be converted before editing:
> ```bash
> python scripts/office/soffice.py --headless --convert-to docx document.doc
> ```
>
> ### Reading Content
> ```bash
> pandoc --track-changes=all document.docx -o output.md
> python scripts/office/unpack.py document.docx unpacked/
> ```
>
> ### Accepting Tracked Changes (LibreOffice required)
> ```bash
> python scripts/accept_changes.py input.docx output.docx
> ```
>
> ## Creating New Documents
> Generate .docx files with JavaScript, then validate. Install: `npm install -g docx`
>
> ### Validation
> ```bash
> python scripts/office/validate.py doc.docx
> ```
>
> ### Page Size
> ```javascript
> // CRITICAL: docx-js defaults to A4, not US Letter — always set page size explicitly
> sections: [{
>   properties: {
>     page: {
>       size: { width: 12240, height: 15840 },  // 8.5 x 11 in DXA
>       margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
>     }
>   }
> }]
> ```
>
> Bundled scripts: `scripts/office/{unpack,pack,validate,soffice}.py`, `scripts/accept_changes.py`, `scripts/comment.py`. Uses docx-js (JavaScript), pandoc, LibreOffice.
