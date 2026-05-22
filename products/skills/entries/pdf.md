---
product: skills
catalog: anthropics-skills-official
skill_name: "pdf"
trigger_summary: ".pdf — read, extract text/tables, merge/split, rotate, watermark, fill forms, encrypt/decrypt, OCR."
github_path: "skills/pdf"
fetched_at: "2026-05-21"
---

# pdf

**Description:** Use this skill whenever the user wants to do anything with PDF files. This includes reading or extracting text/tables from PDFs, combining or merging multiple PDFs into one, splitting PDFs apart, rotating pages, adding watermarks, creating new PDFs, filling PDF forms, encrypting/decrypting PDFs, extracting images, and OCR on scanned PDFs to make them searchable. If the user mentions a .pdf file or asks to produce one, use this skill.

**Trigger:** Any mention of `.pdf`, "extract text/tables from PDF", "merge/split PDFs", "fill a PDF form", "OCR a scanned PDF".

**Surfaces:** Claude.ai document capabilities (production), Claude Code, Claude API. License: Proprietary (source-available).

## Original SKILL.md excerpt

> # PDF Processing Guide
>
> ## Overview
> This guide covers essential PDF processing operations using Python libraries and command-line tools. For advanced features, JavaScript libraries, and detailed examples, see REFERENCE.md. If you need to fill out a PDF form, read FORMS.md and follow its instructions.
>
> ## Quick Start
> ```python
> from pypdf import PdfReader, PdfWriter
>
> reader = PdfReader("document.pdf")
> print(f"Pages: {len(reader.pages)}")
>
> text = ""
> for page in reader.pages:
>     text += page.extract_text()
> ```
>
> ## Python Libraries
>
> ### pypdf - Basic Operations
> - Merge PDFs: PdfWriter().add_page for each
> - Split PDF: one PdfWriter per page
> - Extract Metadata: reader.metadata
> - Rotate Pages: page.rotate(90)
>
> ### pdfplumber - Text and Table Extraction
> - Extract Text with Layout: pdfplumber.open().pages[i].extract_text()
> - Extract Tables: page.extract_tables()
>
> Bundled references: `REFERENCE.md` (advanced features + JS libraries), `FORMS.md` (form-filling workflow), `scripts/extract_form_structure.py`.
