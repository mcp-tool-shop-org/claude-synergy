---
product: skills
catalog: anthropics-skills-official
skill_name: "xlsx"
trigger_summary: ".xlsx / .xlsm / .csv / .tsv — create, read, edit, restructure spreadsheets. Financial-model-grade color/formula conventions enforced."
github_path: "skills/xlsx"
fetched_at: "2026-05-21"
---

# xlsx

**Description:** Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an existing .xlsx, .xlsm, .csv, or .tsv file (e.g., adding columns, computing formulas, formatting, charting, cleaning messy data); create a new spreadsheet from scratch or from other data sources; or convert between tabular file formats. Trigger especially when the user references a spreadsheet file by name or path — even casually (like "the xlsx in my downloads") — and wants something done to it or produced from it. Also trigger for cleaning or restructuring messy tabular data files (malformed rows, misplaced headers, junk data) into proper spreadsheets. The deliverable must be a spreadsheet file. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved.

**Trigger:** Any mention of `.xlsx`/`.xlsm`/`.csv`/`.tsv`, "the spreadsheet", "financial model", "add a column / compute formula / format / chart". The deliverable must be a spreadsheet file.

**Surfaces:** Claude.ai document capabilities (production), Claude Code, Claude API. License: Proprietary (source-available). Requires LibreOffice for formula recalc.

## Original SKILL.md excerpt

> # Requirements for Outputs
>
> ## All Excel files
> - **Professional Font**: Arial / Times New Roman default
> - **Zero Formula Errors**: Every Excel model MUST be delivered with ZERO formula errors (#REF!, #DIV/0!, #VALUE!, #N/A, #NAME?)
> - **Preserve Existing Templates**: Study and EXACTLY match existing format, style, and conventions when modifying files
>
> ## Financial models
>
> ### Color Coding Standards (Industry-Standard Convention)
> - **Blue text (RGB: 0,0,255)**: Hardcoded inputs / numbers users will change for scenarios
> - **Black text (RGB: 0,0,0)**: ALL formulas and calculations
> - **Green text (RGB: 0,128,0)**: Links pulling from other worksheets within same workbook
> - **Red text (RGB: 255,0,0)**: External links to other files
> - **Yellow background (RGB: 255,255,0)**: Key assumptions / cells needing attention
>
> ### Number Formatting Standards
> - **Years**: text strings (e.g., "2024" not "2,024")
> - **Currency**: `$#,##0`; ALWAYS specify units in headers ("Revenue ($mm)")
> - **Zeros**: format as "-": `$#,##0;($#,##0);-`
> - **Percentages**: default 0.0% (one decimal)
> - **Multiples**: 0.0x for valuation multiples
> - **Negative numbers**: parentheses (123), not -123
>
> ### Formula Construction Rules
> - Place ALL assumptions in separate assumption cells, reference them: `=B5*(1+$B$6)` not `=B5*1.05`
> - Documentation for hardcodes: "Source: Company 10-K, FY2024, Page 45, Revenue Note, [SEC EDGAR URL]"
>
> ## Reading / Analysis
> Use pandas for data analysis. LibreOffice required for formula recalculation via `scripts/recalc.py`. Bundled scripts: `scripts/recalc.py`, `scripts/office/{soffice,unpack,pack,validate}.py`.
