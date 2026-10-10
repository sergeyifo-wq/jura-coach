#!/usr/bin/env python3
"""Build a short narrated explainer film for each numbered chapter."""

from __future__ import annotations

import asyncio
import json
import re
import subprocess
from pathlib import Path

import edge_tts

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
    draw.text((72, H - 48), "Jura Coach  ·  mit gesprochener Erklärung", font=foot, fill=BURGUNDY)
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


VOICE = "de-AT-JonasNeural"


def speakable(text: str) -> str:
    text = text.replace("→", ", dann ")
    text = text.replace("·", ". ")
    text = text.replace("§§", "die Paragraphen ")
    text = text.replace("§", "Paragraph ")
    text = re.sub(r"\bAbs\.\s*", "Absatz ", text)
    text = re.sub(r"\bAbs\s+", "Absatz ", text)
    text = re.sub(r"\bff\.?", "folgende", text)
    text = text.replace("zB", "zum Beispiel")
    text = text.replace("bzw.", "beziehungsweise")
    text = text.replace("ABGB", "A B G B")
    text = text.replace("UGB", "U G B")
    text = text.replace("KSchG", "Konsumentenschutzgesetz")
    text = text.replace("CISG", "UN-Kaufrecht")
    text = text.replace("ZPO", "Zivilprozessordnung")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def trim_spoken(text: str, limit: int = 520) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    cut = text[:limit]
    end = max(cut.rfind(". "), cut.rfind("; "), cut.rfind("? "), cut.rfind("! "))
    if end > 180:
        return cut[: end + 1].strip()
    return cut.rstrip(" ,;:") + "."


def intro_sentence(chapter: dict) -> str:
    for block in chapter.get("intro") or []:
        text = (block.get("text") or "").strip()
        if text:
            cut = text.split(". ")[0]
            return cut if cut.endswith(".") else cut + "."
    return "Die Regeln dieses Kapitels tragen die späteren Fälle."


def slide_script(kind: str, title: str, sentence: str, heading: str, body: str) -> str:
    if kind == "title":
        return speakable(f"Kapitel {title}. {sentence}")
    spoken = trim_spoken(body)
    if heading and heading.lower() not in spoken[:48].lower():
        spoken = f"{heading}. {spoken}"
    return speakable(spoken)


async def synthesize(text: str, dest: Path) -> None:
    await edge_tts.Communicate(text, VOICE, rate="-6%").save(str(dest))


def media_duration(path: Path) -> float:
    raw = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "csv=p=0",
            str(path),
        ],
        text=True,
    )
    return float(raw.strip())


def render_chapter(chapter: dict, part_title: str) -> None:
    sentence = intro_sentence(chapter)
    points = points_for(chapter) or [("Lesen", sentence)]
    slides: list[Image.Image] = [
        title_slide(f"{part_title}  ·  Kapitel {chapter['id']}", chapter["title"], sentence)
    ]
    scripts = [slide_script("title", f"{chapter['id']}. {chapter['title']}", sentence, "", "")]
    for index, (heading, body) in enumerate(points, start=1):
        shown = trim_spoken(body)
        slides.append(point_slide(index, len(points), heading, shown))
        scripts.append(slide_script("point", "", "", heading, shown))
    folder = TMP / chapter["id"]
    folder.mkdir(parents=True, exist_ok=True)
    images: list[Path] = []
    for index, slide in enumerate(slides):
        path = folder / f"{index:02d}.png"
        slide.save(path, "PNG")
        images.append(path)
    slides[0].save(POSTER_DIR / f"kapitel-{chapter['id']}.jpg", "JPEG", quality=86)
    voices = asyncio.run(speak_all(scripts, folder))
    encode(images, voices, OUT_DIR / f"kapitel-{chapter['id']}.mp4")


async def speak_all(scripts: list[str], folder: Path) -> list[Path]:
    paths: list[Path] = []
    for index, text in enumerate(scripts):
        dest = folder / f"{index:02d}.mp3"
        await synthesize(text, dest)
        paths.append(dest)
    return paths


def encode(images: list[Path], voices: list[Path], dest: Path) -> None:
    folder = images[0].parent
    segments: list[Path] = []
    for index, (image, voice) in enumerate(zip(images, voices)):
        segment = folder / f"seg-{index:02d}.mp4"
        span = media_duration(voice) + 0.7
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-loop",
                "1",
                "-framerate",
                "24",
                "-i",
                str(image),
                "-i",
                str(voice),
                "-filter_complex",
                f"[1:a]apad=pad_dur=0.7,afade=t=in:st=0:d=0.05,afade=t=out:st={max(span - 0.22, 0.1):.2f}:d=0.18[a]",
                "-map",
                "0:v",
                "-map",
                "[a]",
                "-t",
                f"{span:.3f}",
                "-r",
                "24",
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                "-ac",
                "2",
                "-ar",
                "48000",
                "-shortest",
                str(segment),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        segments.append(segment)
    listing = folder / "list.txt"
    listing.write_text("".join(f"file '{path}'\n" for path in segments), encoding="utf-8")
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(listing),
            "-c",
            "copy",
            "-movflags",
            "+faststart",
            str(dest),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


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
