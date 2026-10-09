#!/usr/bin/env python3
"""Turn Privatrecht – Das Superbuch (PDF) into structured course JSON."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

import pymupdf

PDF = Path("/tmp/superbuch/Privatrecht_Superbuch_neu.pdf")
OUT = Path("/workspace/data/course.json")

SECTION_RE = re.compile(r"^(\d{1,2}|[A-E])\.\d{1,2}$")
FALL_RE = re.compile(r"^FALL(\d{1,2}\.\d{1,2})$")
ANHANG_RE = re.compile(r"^ANHANG([A-E])$")

LABELS = {
    "DEFINITION": "definition",
    "MERKE": "merke",
    "BEISPIEL": "beispiel",
    "BEISPIELE": "beispiel",
    "AUSNAHME": "ausnahme",
    "TYPISCHERFEHLER": "fehler",
    "NEUERECHTSLAGE": "neu",
    "AUFEINENBLICK": "blick",
    "LOESUNG": "loesung",
    "LÖSUNG": "loesung",
    "QUELLEN&WEITEREFAELLE": "quellen",
    "QUELLEN&WEITEREFÄLLE": "quellen",
}

PARTS = [
    {"id": "A", "title": "Grundlagen", "kicker": "Recht verstehen", "chapters": ["1", "2"]},
    {"id": "B", "title": "Personen und Vertretung", "kicker": "Wer handeln kann", "chapters": ["3", "4"]},
    {"id": "C", "title": "Sachenrecht", "kicker": "Besitz und Eigentum", "chapters": ["5"]},
    {
        "id": "D",
        "title": "Vertragsrecht",
        "kicker": "Vom Abschluss bis zum Ende",
        "chapters": ["6", "7", "8", "9", "10", "11"],
    },
    {"id": "E", "title": "Gesetzliche Schuldverhältnisse", "kicker": "Ohne Vertrag haften", "chapters": ["12", "13"]},
    {"id": "F", "title": "IPR und UN-Kaufrecht", "kicker": "Über die Grenze", "chapters": ["14"]},
    {
        "id": "G",
        "title": "Unternehmens- und Gesellschaftsrecht",
        "kicker": "Wer am Markt auftritt",
        "chapters": ["15", "16", "17"],
    },
    {
        "id": "H",
        "title": "Wertpapier-, Wettbewerbs- und Immaterialgüterrecht",
        "kicker": "Papier, Markt und Geist",
        "chapters": ["18", "19", "20"],
    },
    {"id": "Z", "title": "Anhänge", "kicker": "Nachschlagen", "chapters": ["A", "B", "C", "E"]},
]


def clean(text: str) -> str:
    text = text.replace("\u00ad", "").replace("\xa0", " ").replace("ﬁ", "fi").replace("ﬂ", "fl")
    text = text.replace("\u200b", "")
    return re.sub(r"[ \t]+", " ", text).strip()


def tidy(text: str) -> str:
    text = clean(text)
    text = re.sub(r" +([,.;:?!])", r"\1", text)
    text = re.sub(r"\( +", "(", text)
    text = re.sub(r" +\)", ")", text)
    text = re.sub(r" +", " ", text)
    return text.strip()


def compact(text: str) -> str:
    return re.sub(r"[\s·•]+", "", clean(text)).upper()


def slugify(title: str) -> str:
    text = clean(title).lower()
    text = text.translate(str.maketrans({"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"}))
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text


def dehyphen_append(base: str, nxt: str) -> str:
    nxt = nxt.strip()
    if not base:
        return nxt
    if base.endswith("-"):
        if nxt[:1].islower():
            return base[:-1] + nxt
        return base + nxt
    if base.endswith("**") and nxt.startswith("**"):
        return base + " " + nxt
    return base + " " + nxt


def page_rows(page: pymupdf.Page) -> list[dict]:
    raw: list[dict] = []
    data = page.get_text("rawdict")
    for block in data["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            spans = line.get("spans") or []
            chars = [ch for span in spans for ch in span.get("chars", [])]
            if not spans or not chars:
                continue
            text = clean("".join(ch["c"] for ch in chars))
            if not text:
                continue
            s0 = spans[0]
            size = s0["size"]
            if size >= 78:
                continue
            raw.append(
                {
                    "x": line["bbox"][0],
                    "y": line["bbox"][1],
                    "x1": line["bbox"][2],
                    "size": size,
                    "color": s0["color"],
                    "text": text,
                    "dropcap": 40 <= size < 78 and len(text) == 1,
                }
            )
    raw.sort(key=lambda item: (item["y"], item["x"]))
    rows: list[dict] = []
    for item in raw:
        if rows and abs(item["y"] - rows[-1]["y"]) <= 2.2:
            rows[-1]["cells"].append(item)
            rows[-1]["y"] = min(rows[-1]["y"], item["y"])
        else:
            rows.append({"y": item["y"], "cells": [item]})
    def _is_num(row: dict) -> bool:
        return len(row["cells"]) == 1 and bool(SECTION_RE.match(row["cells"][0]["text"]))

    def _is_htitle(row: dict) -> bool:
        return any(cell["size"] >= 15 and not cell["text"].isdigit() for cell in row["cells"]) and not _is_num(row)

    merged: list[dict] = []
    index = 0
    while index < len(rows):
        row = rows[index]
        if index + 1 < len(rows) and abs(rows[index + 1]["y"] - row["y"]) < 8 and (
            (_is_num(row) and _is_htitle(rows[index + 1])) or (_is_htitle(row) and _is_num(rows[index + 1]))
        ):
            row["cells"].extend(rows[index + 1]["cells"])
            row["y"] = min(row["y"], rows[index + 1]["y"])
            index += 2
        else:
            index += 1
        row["cells"].sort(key=lambda cell: cell["x"])
        row["text"] = " ".join(cell["text"] for cell in row["cells"]).strip()
        merged.append(row)
    return merged


def is_header_noise(row: dict) -> bool:
    y = row["y"]
    cells = row["cells"]
    if y < 52:
        return True
    if y > 648 and all(cell["size"] < 11 for cell in cells):
        return True
    if y < 78 and all(cell["size"] < 8.2 for cell in cells):
        return True
    text = row["text"]
    if text in {"§", "NB", "NEU", "❦"}:
        return True
    if len(cells) == 1 and cells[0]["size"] > 30 and text == "§":
        return True
    return False


def row_label(row: dict) -> str | None:
    if len(row["cells"]) >= 3:
        return None
    for cell in row["cells"]:
        token = compact(cell["text"])
        if token in LABELS:
            return LABELS[token]
        if FALL_RE.match(token):
            return "fall:" + FALL_RE.match(token).group(1)
        if ANHANG_RE.match(token):
            return "anhang:" + ANHANG_RE.match(token).group(1)
        if token == "KAPITEL" and len(row["cells"]) == 1:
            return "kapitel"
        if token == "INDIESEMKAPITEL":
            return "inhalt"
        if token == "QUELLEN":
            return "quellenkopf"
    return None


def is_section_heading(row: dict) -> tuple[str, str] | None:
    number = None
    title_parts: list[str] = []
    for cell in row["cells"]:
        if SECTION_RE.match(cell["text"]) and 9 <= cell["size"] <= 13:
            number = cell["text"]
        elif cell["size"] >= 15 and not cell["text"].isdigit():
            title_parts.append(cell["text"])
    if number and title_parts:
        return number, tidy(" ".join(title_parts))
    return None


def is_table_row(row: dict) -> bool:
    cells = [c for c in row["cells"] if c["text"] not in {"§"}]
    if len(cells) < 2:
        return False
    if any(c.get("dropcap") for c in cells):
        return False
    if is_section_heading(row):
        return False
    sizes = [c["size"] for c in cells]
    if len(cells) >= 3 and max(sizes) < 12:
        # mini-toc rows carry a page number at the right edge
        if cells[-1]["x"] > 400 and cells[-1]["text"].isdigit():
            return False
        return True
    gap = cells[1]["x"] - cells[0]["x1"]
    if len(cells) == 2 and gap > 36 and max(sizes) <= 10.6 and cells[0]["size"] < 12:
        if cells[1]["x"] > 140 and cells[0]["x"] < 100:
            return True
    return False


class Builder:
    def __init__(self) -> None:
        self.chapters: list[dict] = []
        self.chapter: dict | None = None
        self.section: dict | None = None
        self.bucket: list[dict] = []
        self.para: list[str] = []
        self.list_type: str | None = None
        self.list_items: list[str] = []
        self.callout: dict | None = None
        self.table: dict | None = None
        self.dropcap = ""
        self.expect_title = False
        self.title_parts: list[str] = []
        self.skip_mini_toc = False
        self.on_opener = False
        self.pending_anhang: str | None = None
        self.queued_number = ""
        self.last_fall = ""
        self.last_para_y = 0.0
        self.page_break = False
        self._flush_code = ""

    def target(self) -> list[dict]:
        if self.section is not None:
            return self.section["blocks"]
        if self.chapter is not None:
            return self.chapter["intro"]
        return self.bucket

    def flush_para(self) -> None:
        if not self.para:
            return
        text = tidy(self.para[0])
        for part in self.para[1:]:
            text = tidy(dehyphen_append(text, part))
        self.para = []
        if text:
            self.target().append({"type": "p", "text": text})

    def flush_list(self) -> None:
        if not self.list_items:
            self.list_type = None
            return
        items = []
        buf = ""
        for item in self.list_items:
            if buf and not re.match(r"^[✓◆•▪]|\d+\.", item):
                buf = tidy(dehyphen_append(buf, item))
            else:
                if buf:
                    items.append(buf)
                buf = tidy(item)
        if buf:
            items.append(buf)
        kind = self.list_type or "ul"
        self.list_items = []
        self.list_type = None
        if items:
            self.target().append({"type": kind, "items": items})

    def flush_callout(self) -> None:
        if not self.callout:
            return
        kind = self.callout["type"]
        lines: list[str] = self.callout["lines"]
        self._flush_code = self.callout.get("code") or self.last_fall
        self.callout = None
        title = ""
        body_lines: list[str] = []
        items: list[str] = []
        quelle = ""
        for line in lines:
            stripped = line.strip()
            if not stripped or stripped in {"§", "NB", "NEU"}:
                continue
            if stripped.startswith("Quelle:"):
                quelle = tidy(stripped)
                continue
            is_item = bool(re.match(r"^[✓◆•▪]", stripped))
            if is_item or (items and not re.match(r"^[✓◆•▪]", stripped) and (
                stripped[:1].islower() or not re.search(r"[.!?…:]$", items[-1] if items else "")
            )):
                items.append(tidy(re.sub(r"^[✓◆•▪]\s*", "", stripped)))
                continue
            if (
                not title
                and not body_lines
                and not items
                and len(stripped) < 80
                and kind in {"definition", "merke", "beispiel", "ausnahme", "fehler", "neu"}
                and not re.search(r"[-–—,;:]$", stripped)
                and stripped.count(" ") <= 10
            ):
                title = tidy(stripped)
                continue
            body_lines.append(stripped)
        if kind == "fall" and not title and body_lines:
            first = tidy(body_lines[0])
            if len(first) < 90 and (first.endswith("?") or len(first.split()) <= 8):
                title = first
                body_lines = body_lines[1:]
        text = ""
        for line in body_lines:
            text = tidy(dehyphen_append(text, line)) if text else tidy(line)
        block: dict = {"type": kind}
        if title:
            block["title"] = title
        if text:
            block["text"] = text
        if items:
            block["items"] = [tidy(dehyphen_append("", i)) if False else i for i in _join_items(items)]
        if quelle:
            block["quelle"] = quelle.replace("Quelle:", "").strip()
        if kind in {"fall", "loesung"}:
            block["code"] = self._flush_code
        if any(block.get(key) for key in ("title", "text", "items")):
            self.target().append(block)

    def flush_table(self) -> None:
        if not self.table:
            return
        headers = self.table["headers"]
        rows = [row for row in self.table["rows"] if any(cell.strip() for cell in row)]
        self.table = None
        if headers or rows:
            self.target().append(
                {
                    "type": "table",
                    "headers": [tidy(h) for h in headers],
                    "rows": [[tidy(cell) for cell in row] for row in rows],
                }
            )

    def flush_inline(self) -> None:
        self.flush_para()
        self.flush_list()
        self.flush_table()

    def start_chapter(self, number: str, title: str) -> None:
        self.flush_inline()
        self.flush_callout()
        self.chapter = {
            "id": number,
            "slug": f"{number.lower()}-{slugify(title)}",
            "title": tidy(title),
            "intro": [],
            "sections": [],
            "quellen": "",
        }
        self.section = None
        self.chapters.append(self.chapter)
        self.on_opener = True
        self.skip_mini_toc = False

    def start_section(self, number: str, title: str) -> None:
        self.flush_inline()
        self.flush_callout()
        if not self.chapter:
            return
        self.section = {"id": number, "title": title, "blocks": []}
        self.chapter["sections"].append(self.section)
        self.on_opener = False
        self.skip_mini_toc = False

    def add_text_line(self, text: str, y: float, size: float, color: int, x: float) -> None:
        if self.chapter and self.chapter["title"] == "Glossar" and self.section is None:
            self._glossary_line(text, size, color, x)
            return
        labelish = compact(text)
        if labelish in LABELS or FALL_RE.match(labelish):
            return
        bullet = re.match(r"^([✓◆•▪])\s*(.*)", text)
        numbered = re.match(r"^(\d+)\.\s+(.*)", text)
        gold_list = color == 0xA77F3C and numbered and size < 12
        if bullet or gold_list:
            self.flush_para()
            self.flush_table()
            kind = "ol" if gold_list else "ul"
            if self.callout is not None:
                self.callout["lines"].append(text)
                return
            if self.list_type not in {None, kind}:
                self.flush_list()
            self.list_type = kind
            self.list_items.append(text)
            return
        if self.list_items and (x > 70 or (self.para == [] and size < 11)):
            self.list_items.append(text)
            return
        self.flush_list()
        if self.callout is not None and x >= 59:
            self.callout["lines"].append(text)
            return
        if self.callout is not None and x < 59:
            self.flush_callout()
        if self.dropcap and not self.para:
            text = self.dropcap + text
            self.dropcap = ""
        if self.page_break and self.para:
            tail = self.para[-1].rstrip()
            if tail.endswith("-") or not re.search(r"[.!?…:]$", tail):
                pass
            else:
                self.flush_para()
            self.page_break = False
        if self.para and self.last_para_y and y - self.last_para_y > 18:
            self.flush_para()
        if self.para:
            self.para.append(text)
        else:
            self.para = [text]
        self.last_para_y = y

    def _glossary_line(self, text: str, size: float, color: int, x: float) -> None:
        if size >= 20 or text == "§":
            return
        if color == 0x14284B and size >= 10 and x < 62 and len(text) < 140:
            self.flush_para()
            if self.section is None:
                self.section = {"id": "C", "title": "Begriffe", "blocks": []}
                self.chapter["sections"].append(self.section)
            self.section["blocks"].append({"type": "definition", "title": tidy(text), "text": ""})
            return
        if self.section and self.section["blocks"] and self.section["blocks"][-1]["type"] == "definition":
            block = self.section["blocks"][-1]
            extra = tidy(text)
            block["text"] = tidy(dehyphen_append(block["text"], extra)) if block["text"] else extra

    def open_callout(self, kind: str, code: str | None = None) -> None:
        self.flush_inline()
        self.flush_callout()
        self.callout = {"type": kind, "lines": [], "code": code or self.last_fall}

    def consider_title_line(self, text: str, size: float) -> bool:
        if not self.expect_title:
            return False
        if size >= 20 and text not in {"§"} and not text.isdigit():
            self.title_parts.append(text)
            return True
        if self.title_parts:
            number = self.pending_anhang or ""
            self.expect_title = False
            self.pending_anhang = None
            if number:
                self.start_chapter(number, " ".join(self.title_parts))
            self.title_parts = []
            return False
        return False

    def feed(self, row: dict) -> None:
        label = row_label(row)
        if label is None and is_header_noise(row):
            return
        cells = row["cells"]
        if any(c.get("dropcap") for c in cells) and len(clean(row["text"])) == 1:
            self.dropcap = row["text"]
            return
        if any(c["size"] > 150 for c in cells):
            return

        heading = is_section_heading(row)
        label_is_structural = label in {"kapitel", "inhalt"} or (label or "").startswith("anhang")

        if self.expect_title and not label_is_structural:
            title_cells = [c for c in cells if c["size"] >= 20 and not c["text"].isdigit() and c["text"] != "§"]
            if title_cells:
                self.title_parts.extend(c["text"] for c in title_cells)
                return
            if self.title_parts:
                number = self.pending_anhang or ""
                self.expect_title = False
                self.pending_anhang = None
                title = tidy(re.sub(r"-\s+(?=[A-ZÄÖÜ])", "-", " ".join(self.title_parts)))
                self.title_parts = []
                if number:
                    self.start_chapter(number, title)
            else:
                return

        if label == "kapitel":
            self.flush_inline()
            self.flush_callout()
            self.expect_title = True
            self.title_parts = []
            self.pending_anhang = self.queued_number or None
            return
        if label and label.startswith("anhang:"):
            self.flush_inline()
            self.flush_callout()
            self.pending_anhang = label.split(":")[1]
            self.expect_title = True
            self.title_parts = []
            return
        if label == "inhalt":
            self.skip_mini_toc = True
            return
        if label == "quellenkopf":
            self.flush_inline()
            self.flush_callout()
            if self.chapter is not None:
                rest = tidy(row["text"])
                rest = re.sub(r"^QUELLEN\s*", "", rest, flags=re.I)
                if rest:
                    self.chapter["quellen"] = tidy(self.chapter["quellen"] + " " + rest)
            return
        if self.skip_mini_toc:
            if heading or (label and label not in {"inhalt"}):
                self.skip_mini_toc = False
            else:
                if row["text"].upper().startswith("QUELLEN"):
                    if self.chapter is not None:
                        self.chapter["quellen"] = tidy(re.sub(r"^QUELLEN\s*", "", row["text"], flags=re.I))
                    self.skip_mini_toc = False
                return

        if heading:
            self.start_section(*heading)
            return

        inline = inline_heading(row)
        if inline and inline[0] == "section":
            self.start_section(inline[1], inline[2])
            return
        if inline and inline[0] == "h3":
            self.flush_inline()
            if self.callout is None:
                self.target().append({"type": "h3", "id": inline[1], "title": inline[2]})
                return

        if label and label.startswith("fall:"):
            code = label.split(":")[1]
            self.open_callout("fall", code)
            self.last_fall = code
            return
        if label in {"definition", "merke", "beispiel", "ausnahme", "fehler", "neu", "blick", "loesung", "quellen"}:
            self.open_callout(label)
            # same row may contain the title after the label
            leftover = []
            for cell in cells:
                token = compact(cell["text"])
                if token in LABELS or FALL_RE.match(token) or token in {"NB", "NEU"}:
                    continue
                if cell["size"] <= 7:
                    continue
                leftover.append(cell["text"])
            if leftover:
                self.callout["lines"].append(" ".join(leftover))
            return

        if is_table_row(row) or self.table is not None and self._continues_table(row):
            self._feed_table(row)
            return
        if self.table is not None:
            self.flush_table()

        main = max(cells, key=lambda c: len(c["text"]))
        self.add_text_line(main["text"] if len(cells) == 1 else row["text"], row["y"], main["size"], main["color"], main["x"])

    def _recent_number(self) -> str:
        return ""

    def _continues_table(self, row: dict) -> bool:
        if self.table is None:
            return False
        if row_label(row) or is_section_heading(row):
            return False
        cells = row["cells"]
        if len(cells) == 1 and cells[0]["size"] >= 10.4 and cells[0]["x"] < 66:
            return False
        if len(cells) == 1 and cells[0]["size"] >= 14:
            return False
        xs = self.table["xs"]
        if not xs:
            return False
        near = any(any(abs(cell["x"] - col) < 28 for col in xs) for cell in cells)
        return near and max(c["size"] for c in cells) < 12

    def _feed_table(self, row: dict) -> None:
        self.flush_para()
        self.flush_list()
        if self.callout is not None:
            self.flush_callout()
        cells = [c for c in row["cells"] if c["text"] != "§"]
        if self.table is None:
            self.table = {
                "xs": [c["x"] for c in cells],
                "headers": [c["text"] for c in cells],
                "rows": [],
                "header_mode": all(c["size"] < 8 for c in cells),
            }
            if not self.table["header_mode"]:
                width = len(cells)
                self.table["rows"].append([c["text"] for c in cells] + [""] * (len(self.table["xs"]) - width))
                self.table["headers"] = []
            return
        xs = self.table["xs"]
        # header continuation: still small caps and no data yet
        if self.table["header_mode"] and not self.table["rows"] and all(c["size"] < 8.2 for c in cells):
            for cell in cells:
                idx = min(range(len(xs)), key=lambda i: abs(xs[i] - cell["x"]))
                self.table["headers"][idx] = tidy(dehyphen_append(self.table["headers"][idx], cell["text"]))
            return
        self.table["header_mode"] = False
        starts_new = any(abs(cells[0]["x"] - xs[0]) < 22 for _ in [0]) and (
            not self.table["rows"] or abs(cells[0]["x"] - xs[0]) < 22
        )
        # A new logical row begins when the leftmost cell aligns with the first column
        # and there is more than a wrapped fragment.
        new_row = abs(cells[0]["x"] - xs[0]) < 24
        if new_row or not self.table["rows"]:
            values = [""] * len(xs)
            for cell in cells:
                idx = min(range(len(xs)), key=lambda i: abs(xs[i] - cell["x"]))
                values[idx] = tidy(dehyphen_append(values[idx], cell["text"])) if values[idx] else cell["text"]
            self.table["rows"].append(values)
        else:
            values = self.table["rows"][-1]
            for cell in cells:
                idx = min(range(len(xs)), key=lambda i: abs(xs[i] - cell["x"]))
                values[idx] = tidy(dehyphen_append(values[idx], cell["text"])) if values[idx] else cell["text"]

    def finish(self) -> None:
        self.flush_inline()
        self.flush_callout()


INLINE_SECTION = re.compile(r"^((?:\d{1,2}|[A-E])\.\d{1,2})\s+(.+)$")
INLINE_SUB = re.compile(r"^(\d{1,2}\.\d{1,2}\.\d{1,2}(?:\.\d{1,2})?)\s+(.+)$")


def inline_heading(row: dict) -> tuple[str, str, str] | None:
    if len(row["cells"]) != 1:
        return None
    cell = row["cells"][0]
    if cell["color"] != 0xA77F3C or cell["x"] > 88:
        return None
    text = cell["text"].strip()
    if 7.4 <= cell["size"] <= 8.8:
        match = INLINE_SUB.match(text)
        if match and len(text) < 150:
            return ("h3", match.group(1), tidy(match.group(2)))
    if 10 <= cell["size"] <= 11.5:
        match = INLINE_SECTION.match(text)
        if match and len(text) < 130:
            return ("section", match.group(1), tidy(match.group(2)))
    return None


def _join_items(items: list[str]) -> list[str]:
    joined: list[str] = []
    for item in items:
        item = tidy(re.sub(r"^[✓◆•▪]\s*", "", item))
        if not item:
            continue
        if joined and (item[:1].islower() or not re.search(r"[.!?…:]$", joined[-1])):
            joined[-1] = tidy(dehyphen_append(joined[-1], item))
        else:
            joined.append(item)
    return joined


def chapter_number_before_kapitel(rows: list[dict], index: int) -> str:
    for prev in reversed(rows[:index]):
        for cell in prev["cells"]:
            if cell["size"] > 50 and re.fullmatch(r"\d{1,2}", cell["text"]):
                return cell["text"]
    return ""


def giant_chapter_number(page: pymupdf.Page) -> str:
    data = page.get_text("dict")
    for block in data["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                text = clean(span["text"])
                if span["size"] >= 78 and re.fullmatch(r"\d{1,2}", text):
                    return text
    return ""


def parse(doc: pymupdf.Document) -> list[dict]:
    builder = Builder()
    for page_index, page in enumerate(doc):
        if page_index < 13:
            continue
        rows = page_rows(page)
        if any(cell["size"] > 150 for row in rows for cell in row["cells"]):
            continue
        builder.page_break = True
        builder.queued_number = giant_chapter_number(page)
        for row in rows:
            builder.feed(row)
    builder.finish()
    return builder.chapters


def postprocess(chapters: list[dict]) -> list[dict]:
    cleaned = []
    for chapter in chapters:
        if not chapter["title"]:
            continue
        if chapter["title"].startswith("Stichwort"):
            continue
        # A repeated case badge can leave an empty shell. Drop falls without a story.
        for section in chapter["sections"]:
            kept = []
            for block in section["blocks"]:
                if block["type"] == "fall" and len(block.get("text", "")) < 40 and not block.get("title"):
                    continue
                if block["type"] == "table":
                    block["rows"] = merge_wrapped_rows(block["rows"])
                    block["headers"] = [tidy(h) for h in block.get("headers", [])]
                kept.append(block)
            section["blocks"] = [b for b in kept if not (chapter["id"] == "E" and b["type"] in {"fall", "loesung"})]
        # drop empty intro paragraphs that are only a letter
        chapter["intro"] = [b for b in chapter["intro"] if _block_ok(b)]
        for section in chapter["sections"]:
            section["blocks"] = [b for b in section["blocks"] if _block_ok(b)]
        # merge solution text hyphenation already done
        cleaned.append(chapter)
    return cleaned


def merge_wrapped_rows(rows: list[list[str]]) -> list[list[str]]:
    merged: list[list[str]] = []
    for row in rows:
        cells = [cell.strip() for cell in row]
        if merged and _row_continues(merged[-1], cells):
            prev = merged[-1]
            width = max(len(prev), len(cells))
            while len(prev) < width:
                prev.append("")
            for index, cell in enumerate(cells):
                if not cell:
                    continue
                prev[index] = tidy(dehyphen_append(prev[index], cell)) if prev[index] else cell
        else:
            merged.append(cells)
    return merged


def _row_continues(prev: list[str], row: list[str]) -> bool:
    if any(cell.endswith("-") or cell in {"Abschnitt", "Kap."} for cell in prev if cell):
        return True
    first = next((cell for cell in row if cell), "")
    return bool(first) and first[:1].islower()


def _block_ok(block: dict) -> bool:
    if block["type"] == "table":
        return bool(block.get("rows"))
    if block["type"] in {"ul", "ol", "blick", "fehler"}:
        return bool(block.get("items") or block.get("text") or block.get("title"))
    return bool(block.get("text") or block.get("title") or block.get("items"))


def main() -> None:
    doc = pymupdf.open(PDF)
    chapters = postprocess(parse(doc))
    by_id = {c["id"]: c["slug"] for c in chapters}
    for part in PARTS:
        part["chapterSlugs"] = [by_id[cid] for cid in part["chapters"] if cid in by_id]
    course = {
        "title": "Privatrecht – Das Superbuch",
        "stand": "Herbst 2026",
        "jurisdiction": "Österreich",
        "parts": PARTS,
        "chapters": chapters,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(course, ensure_ascii=False, indent=2), encoding="utf-8")
    falls = sum(1 for c in chapters for s in c["sections"] for b in s["blocks"] if b["type"] == "fall")
    loes = sum(1 for c in chapters for s in c["sections"] for b in s["blocks"] if b["type"] == "loesung")
    defs = sum(1 for c in chapters for s in c["sections"] for b in s["blocks"] if b["type"] == "definition")
    print(f"chapters {len(chapters)} falls {falls} loesungen {loes} definitionen {defs}")
    for c in chapters:
        nsec = len(c["sections"])
        nblocks = sum(len(s["blocks"]) for s in c["sections"]) + len(c["intro"])
        print(f"  {c['id']:>3} {nsec:2} abschnitte {nblocks:3} bloecke  {c['title'][:60]}")


if __name__ == "__main__":
    main()
