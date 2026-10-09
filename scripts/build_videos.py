#!/usr/bin/env python3
"""Build a short silent explainer film for each numbered chapter."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

COURSE = Path("/workspace/data/course.json")
OUT_DIR = Path("/workspace/public/media/videos")
POSTER_DIR = Path("/workspace/public/media/posters")
TMP = Path("/tmp/jura-slides")

SERIF = "/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf"
SERIF_BOLD = "/usr/share/fonts/truetype/noto/NotoSerifDisplay-Bold.ttf"
SANS = "/usr/share/fonts/truetype/macos/Inter-Regular.ttf"
SANS_MED = "/usr/share/fonts/truetype/macos/Inter-Medium.ttf"

W, H = 1280, 720
PAPER = (243, 238, 228)
INK = (20, 40, 75)
GOLD = (167, 127, 60)
BURGUNDY = (124, 31, 45)
MUTED = (90, 84, 74)


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def wrap(draw: ImageDraw.ImageDraw, text: str, face: ImageFont.FreeTypeFont, width: int) -> list[str]:
    words = text.replace("\n", " ").split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=face) <= width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, W, 10), fill=GOLD)
    draw.rectangle((0, H - 8, W, H), fill=INK)
    return image, draw


def draw_kicker(draw: ImageDraw.ImageDraw, text: str, y: int = 48) -> None:
    face = font(SANS_MED, 18)
    draw.text((72, y), text.upper(), font=face, fill=GOLD)


def title_slide(kicker: str, title: str, sentence: str) -> Image.Image:
    image, draw = canvas()
    draw_kicker(draw, kicker)
    face = font(SERIF_BOLD, 58)
    lines = wrap(draw, title, face, 1080)[:3]
    y = 140
    for line in lines:
        draw.text((72, y), line, font=face, fill=INK)
        y += 70
    small = font(SERIF, 28)
    y += 20
    for line in wrap(draw, sentence, small, 1040)[:4]:
        draw.text((72, y), line, font=small, fill=MUTED)
        y += 40
    foot = font(SANS, 18)
    draw.text((72, H - 48), "Jura Coach  ·  Erklärfilm ohne Ton", font=foot, fill=BURGUNDY)
    return image


def point_slide(index: int, total: int, heading: str, body: str) -> Image.Image:
    image, draw = canvas()
    draw_kicker(draw, f"Punkt {index} von {total}")
    num = font(SERIF_BOLD, 42)
    draw.text((72, 110), f"{index:02d}", font=num, fill=GOLD)
    face = font(SERIF, 36)
    y = 190
    lines = wrap(draw, body, face, 1080)[:6]
    for line in lines:
        draw.text((72, y), line, font=face, fill=INK)
        y += 52
    if heading:
        tag = font(SANS_MED, 18)
        draw.text((72, H - 52), heading, font=tag, fill=BURGUNDY)
    return image


def points_for(chapter: dict) -> list[tuple[str, str]]:
    found: list[tuple[str, str]] = []
    for section in chapter["sections"]:
        for block in section["blocks"]:
            if block["type"] == "blick":
                for item in block.get("items") or []:
                    found.append(("Auf einen Blick", item))
            elif block["type"] == "definition" and block.get("text"):
                label = block.get("title") or "Definition"
                found.append((label, block["text"]))
            elif block["type"] == "merke" and block.get("text") and len(found) < 6:
                found.append((block.get("title") or "Merke", block["text"]))
            if len(found) >= 4:
                return found[:4]
    return found[:4]


def intro_sentence(chapter: dict) -> str:
    for block in chapter.get("intro") or []:
        text = (block.get("text") or "").strip()
        if text:
            cut = text.split(". ")[0]
            return cut if cut.endswith(".") else cut + "."
    return "Die Regeln dieses Kapitels tragen die späteren Fälle."


def render_chapter(chapter: dict, part_title: str) -> None:
    points = points_for(chapter)
    slides = [title_slide(f"{part_title}  ·  Kapitel {chapter['id']}", chapter["title"], intro_sentence(chapter))]
    for index, (heading, body) in enumerate(points, start=1):
        slides.append(point_slide(index, len(points), heading, body))
    if not points:
        slides.append(point_slide(1, 1, "Lesen", intro_sentence(chapter)))
    folder = TMP / chapter["id"]
    folder.mkdir(parents=True, exist_ok=True)
    paths = []
    for index, slide in enumerate(slides):
        path = folder / f"{index:02d}.png"
        slide.save(path, "PNG")
        paths.append(path)
    slides[0].save(POSTER_DIR / f"kapitel-{chapter['id']}.jpg", "JPEG", quality=86)
    encode(paths, OUT_DIR / f"kapitel-{chapter['id']}.mp4")


def encode(paths: list[Path], dest: Path) -> None:
    duration = 6.4
    fade = 0.4
    cmd = ["ffmpeg", "-y"]
    for path in paths:
        cmd += ["-loop", "1", "-t", f"{duration}", "-i", str(path)]
    if len(paths) == 1:
        cmd += ["-i", str(paths[0]), "-frames:v", "1"]
    filters = []
    if len(paths) == 1:
        filters.append("[0]format=yuv420p[vout]")
    else:
        previous = "[0]"
        offset = duration - fade
        for index in range(1, len(paths)):
            label = "[vout]" if index == len(paths) - 1 else f"[v{index}]"
            filters.append(
                f"{previous}[{index}]xfade=transition=fade:duration={fade}:offset={offset:.2f}{label}"
            )
            previous = label
            offset += duration - fade
    cmd += [
        "-filter_complex",
        ";".join(filters),
        "-map",
        "[vout]",
        "-r",
        "24",
        "-pix_fmt",
        "yuv420p",
        "-c:v",
        "libx264",
        "-crf",
        "28",
        "-preset",
        "veryfast",
        "-movflags",
        "+faststart",
        str(dest),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main() -> None:
    course = json.loads(COURSE.read_text(encoding="utf-8"))
    part_of = {}
    for part in course["parts"]:
        for chapter_id in part["chapters"]:
            part_of[chapter_id] = part["title"]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    POSTER_DIR.mkdir(parents=True, exist_ok=True)
    numbered = [chapter for chapter in course["chapters"] if chapter["id"].isdigit()]
    for chapter in numbered:
        print("film", chapter["id"], chapter["title"][:40], flush=True)
        render_chapter(chapter, part_of.get(chapter["id"], "Privatrecht"))
    print("done", len(numbered))


if __name__ == "__main__":
    main()
