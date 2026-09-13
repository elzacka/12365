#!/usr/bin/env python3
"""
Merge the table in dev_only/Ordliste_ki-modeller_en-tabell.md into
public/content/ordbok.json.

Column mapping (decided by the table header):
  Ord                          -> tittel
  Kategori (Emneknagg 1a og 1b) -> tags "ki" and "modell" (applies to every row)
  Kategori (Emneknagg 2)        -> tag = category in lowercase (begrep, modell, ...)
  Engelsk (Også)                -> alias (plus the acronym in parentheses, if any)
  Forklaring                    -> forklaring

Rows whose term already exists in ordbok.json (by title or alias) are not
added; the existing entry keeps its explanation and gets the glossary's
Norwegian term, English term and tags as extras.

Idempotent: safe to re-run after the table changes.
"""
import json
import re

SOURCE = 'dev_only/Ordliste_ki-modeller_en-tabell.md'
TARGET = 'public/content/ordbok.json'
BASE_TAGS = ['ki', 'modell']

# Glossary terms whose existing entry cannot be found by title or alias.
OVERRIDES = {'KI': 'kunstig-intelligens'}

# The glossary was written for a standalone document; two rows refer to it.
REWORD = {
    'i denne oversikten': 'i denne ordboken',
    'i hele stakken': 'blant NBs modeller',
}


def norm(s: str) -> str:
    return re.sub(r'[^a-zæøå0-9]', '', s.lower())


def alias_key(s: str) -> str:
    return norm(re.sub(r'\(.*?\)', '', s))


def slug(s: str) -> str:
    s = s.lower().replace('æ', 'ae').replace('ø', 'o').replace('å', 'a')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s


def clean(s: str) -> str:
    return s.replace('`', '').strip()


def aliases_from_english(eng: str) -> list[str]:
    if not eng:
        return []
    out = []
    for part in re.split(r',\s*', eng):
        part = part.strip()
        if not part:
            continue
        out.append(part)
        m = re.search(r'\(([A-Za-z][A-Za-z0-9-]{1,7})\)\s*$', part)
        if m and m.group(1) not in out:
            out.append(m.group(1))
    return out


def read_rows(path: str):
    rows = []
    with open(path, encoding='utf-8') as f:
        lines = [l for l in f if l.startswith('| ')]
    for line in lines[2:]:  # skip header and separator
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) != 5:
            raise ValueError(f'Expected 5 columns: {line[:80]}')
        ord_, _k1, k2, eng, fork = cells
        rows.append((ord_, k2.lstrip('# ').strip(), eng, fork))
    return rows


with open(TARGET, encoding='utf-8') as f:
    data = json.load(f)

# Titles are matched before aliases: "DPO" must hit Direct Preference
# Optimization, not the alias DPO on Personvernombud.
by_title: dict[str, dict] = {}
by_alias: dict[str, dict] = {}
for e in data:
    by_title.setdefault(norm(e['tittel']), e)
    for a in e.get('alias', []):
        by_alias.setdefault(norm(a), e)
by_id = {e['id']: e for e in data}
ids = set(by_id)


def find_existing(title: str, eng_aliases: list[str]):
    if title in OVERRIDES:
        return by_id[OVERRIDES[title]]
    if slug(title) in by_id:
        return by_id[slug(title)]
    keys = [alias_key(p) for p in re.split(r',\s*', title)]
    keys += [alias_key(a) for a in eng_aliases]
    keys = [k for k in keys if k]
    for lookup in (by_title, by_alias):
        for k in keys:
            if k in lookup:
                return lookup[k]
    return None


def add_aliases(entry: dict, values: list[str]):
    existing = entry.setdefault('alias', [])
    seen = {alias_key(x) for x in existing}
    seen.add(alias_key(entry['tittel']))
    if entry.get('undertittel'):
        seen.add(alias_key(entry['undertittel']))
    for v in values:
        if alias_key(v) not in seen:
            existing.append(v)
            seen.add(alias_key(v))
    if not existing:
        del entry['alias']


def add_tags(entry: dict, values: list[str]):
    for v in values:
        if v not in entry['tags']:
            entry['tags'].append(v)


added, merged = [], []
for ord_, category, eng, fork in read_rows(SOURCE):
    title = clean(ord_)
    eng_aliases = aliases_from_english(clean(eng))
    tags = BASE_TAGS + [category.lower()]
    tags = list(dict.fromkeys(tags))

    existing = find_existing(title, eng_aliases)
    if existing:
        add_aliases(existing, [title] + eng_aliases)
        add_tags(existing, tags)
        merged.append((title, existing['id']))
        continue

    text = clean(fork)
    for old, new in REWORD.items():
        text = text.replace(old, new)
    text = re.sub(r'\*(.+?)\*', r'«\1»', text)  # the app renders plain text
    if text and text[-1] not in '.!?':
        text += '.'

    entry_id = slug(title)
    if entry_id in ids:
        raise ValueError(f'Duplicate id: {entry_id}')
    ids.add(entry_id)

    entry = {'id': entry_id, 'tittel': title, 'forklaring': text, 'tags': tags}
    if eng_aliases:
        entry['alias'] = eng_aliases
    data.append(entry)
    by_title[norm(title)] = entry
    added.append(title)

with open(TARGET, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write('\n')

print(f'Lagt til {len(added)} nye oppføringer. Totalt: {len(data)} ord.')
print(f'Slått sammen med eksisterende ({len(merged)}):')
for title, eid in merged:
    print(f'  {title} -> {eid}')
