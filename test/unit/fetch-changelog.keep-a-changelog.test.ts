// Unit tests for parseKeepAChangelog — the new Wave 1 generic CHANGELOG.md parser.
//
// Contract per kickoff:
//   parseKeepAChangelog(content: string): Array<{version, released_at, body}>
//
// We test the pure parser directly (no network), exercising the documented
// real-world drift cases:
//   - `## [X.Y.Z] - YYYY-MM-DD` canonical
//   - `## [vX.Y.Z]` leading-v variant
//   - `## [Unreleased]` skipped (no version slot)
//   - `## X.Y.Z` without brackets
//   - `## vX.Y.Z (YYYY-MM-DD)` with parens
//   - bare `## X.Y.Z` (no date → releasedAt = null)

import { describe, it, expect } from 'vitest';
import { parseKeepAChangelog } from '../../src/fetch-changelog.js';

describe('parseKeepAChangelog — basic format', () => {
  it('parses canonical "## [X.Y.Z] - YYYY-MM-DD" headings', () => {
    const md = `# Changelog

## [1.2.3] - 2026-05-22

### Added
- New feature A
- New feature B

### Fixed
- Bug 1
`;
    const items = parseKeepAChangelog(md);
    expect(items).toHaveLength(1);
    expect(items[0].version).toBe('1.2.3');
    expect(items[0].releasedAt).toBe('2026-05-22');
    expect(items[0].body).toContain('### Added');
    expect(items[0].body).toContain('New feature A');
    expect(items[0].body).toContain('### Fixed');
  });

  it('parses multiple release sections, preserving order', () => {
    const md = `# Changelog

## [2.0.0] - 2026-05-22

- Major refactor

## [1.1.0] - 2026-04-01

- Feature added

## [1.0.0] - 2026-01-15

- Initial release
`;
    const items = parseKeepAChangelog(md);
    expect(items.map((i) => i.version)).toEqual(['2.0.0', '1.1.0', '1.0.0']);
    expect(items[0].releasedAt).toBe('2026-05-22');
    expect(items[2].releasedAt).toBe('2026-01-15');
  });
});

describe('parseKeepAChangelog — version prefix variations', () => {
  it('handles leading "v" prefix in brackets: "## [v1.2.3]"', () => {
    const md = `## [v1.2.3] - 2026-05-22

- one
`;
    const items = parseKeepAChangelog(md);
    expect(items).toHaveLength(1);
    expect(items[0].version).toBe('1.2.3'); // v stripped
    expect(items[0].releasedAt).toBe('2026-05-22');
  });

  it('handles bare "## X.Y.Z" (no brackets)', () => {
    const md = `## 1.2.3 - 2026-05-22

- bullet
`;
    const items = parseKeepAChangelog(md);
    expect(items).toHaveLength(1);
    expect(items[0].version).toBe('1.2.3');
    expect(items[0].releasedAt).toBe('2026-05-22');
  });

  it('handles "## vX.Y.Z (YYYY-MM-DD)" with parens around date', () => {
    const md = `## v1.2.3 (2026-05-22)

- bullet
`;
    const items = parseKeepAChangelog(md);
    expect(items).toHaveLength(1);
    expect(items[0].version).toBe('1.2.3');
    expect(items[0].releasedAt).toBe('2026-05-22');
  });

  it('handles pre-release / build metadata in version (e.g. 1.2.3-rc.1)', () => {
    const md = `## [1.2.3-rc.1] - 2026-05-22

- bullet
`;
    const items = parseKeepAChangelog(md);
    expect(items).toHaveLength(1);
    expect(items[0].version).toMatch(/1\.2\.3-rc\.1/);
  });
});

describe('parseKeepAChangelog — skip cases', () => {
  it('skips "## [Unreleased]" sections', () => {
    const md = `# Changelog

## [Unreleased]

- planned feature

## [1.0.0] - 2026-01-15

- shipped feature
`;
    const items = parseKeepAChangelog(md);
    expect(items.map((i) => i.version)).not.toContain('Unreleased');
    expect(items.map((i) => i.version)).toContain('1.0.0');
  });

  it('skips other text-only level-2 headings (e.g. "## Migration guide")', () => {
    const md = `# Changelog

## Migration guide

Read this first.

## [1.0.0] - 2026-01-15

- shipped
`;
    const items = parseKeepAChangelog(md);
    expect(items.map((i) => i.version)).toEqual(['1.0.0']);
  });

  it('returns an empty array for a doc with no version headings', () => {
    const md = `# Changelog

Some intro text.

## [Unreleased]

- pending
`;
    const items = parseKeepAChangelog(md);
    expect(items).toEqual([]);
  });
});

describe('parseKeepAChangelog — date handling', () => {
  it('returns releasedAt = null when the heading has no date', () => {
    const md = `## 1.2.3

- bullet without date
`;
    const items = parseKeepAChangelog(md);
    expect(items).toHaveLength(1);
    expect(items[0].version).toBe('1.2.3');
    expect(items[0].releasedAt).toBeNull();
  });

  it('preserves dated and undated entries side-by-side', () => {
    const md = `## 2.0.0 - 2026-05-22

- dated entry

## 1.9.0

- undated entry

## 1.8.0 - 2026-04-01

- another dated
`;
    const items = parseKeepAChangelog(md);
    expect(items).toHaveLength(3);
    const byV = Object.fromEntries(items.map((i) => [i.version, i.releasedAt]));
    expect(byV['2.0.0']).toBe('2026-05-22');
    expect(byV['1.9.0']).toBeNull();
    expect(byV['1.8.0']).toBe('2026-04-01');
  });
});

describe('parseKeepAChangelog — body content preservation', () => {
  it("each version's body contains its Added/Changed/Fixed subsections verbatim", () => {
    const md = `## [1.0.0] - 2026-01-15

### Added
- A1
- A2

### Changed
- C1

### Fixed
- F1
`;
    const items = parseKeepAChangelog(md);
    expect(items).toHaveLength(1);
    const body = items[0].body;
    expect(body).toContain('### Added');
    expect(body).toContain('A1');
    expect(body).toContain('A2');
    expect(body).toContain('### Changed');
    expect(body).toContain('C1');
    expect(body).toContain('### Fixed');
    expect(body).toContain('F1');
  });

  it('treats level-3 "###" headings as body content, not new release boundaries', () => {
    const md = `## [1.0.0] - 2026-01-15

### Added
- one
### Fixed
- two
`;
    const items = parseKeepAChangelog(md);
    expect(items).toHaveLength(1);
    expect(items[0].body).toContain('### Added');
    expect(items[0].body).toContain('### Fixed');
  });

  it('handles CRLF line endings', () => {
    const md = `## [1.0.0] - 2026-01-15\r\n\r\n- one\r\n- two\r\n`;
    const items = parseKeepAChangelog(md);
    expect(items).toHaveLength(1);
    expect(items[0].version).toBe('1.0.0');
    expect(items[0].releasedAt).toBe('2026-01-15');
    expect(items[0].body).toMatch(/- one/);
    expect(items[0].body).toMatch(/- two/);
  });

  it('handles em-dash "–" date separator (not just hyphen "-")', () => {
    const md = `## [1.0.0] – 2026-01-15

- bullet
`;
    const items = parseKeepAChangelog(md);
    // Accept either parse: dated or undated. We only require no throw + version found.
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items.some((i) => i.version === '1.0.0')).toBe(true);
  });
});

describe('parseKeepAChangelog — empty / edge', () => {
  it('returns [] for empty string input', () => {
    expect(parseKeepAChangelog('')).toEqual([]);
  });

  it('does not throw on a malformed heading with no version', () => {
    const md = `## []

- bullet
`;
    expect(() => parseKeepAChangelog(md)).not.toThrow();
  });

  it('does not include sections with empty bodies', () => {
    // The implementation drops entries whose body is empty (noise filter)
    const md = `## [1.0.0] - 2026-01-15
## [2.0.0] - 2026-02-01

- something for 2.0.0
`;
    const items = parseKeepAChangelog(md);
    expect(items.map((i) => i.version)).not.toContain('1.0.0');
    expect(items.map((i) => i.version)).toContain('2.0.0');
  });
});
