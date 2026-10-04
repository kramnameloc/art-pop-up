"""Audit Chromium PDFs from printing.spec.ts. Requires pdfplumber; no app dependency.

Usage: python3 scripts/verify-print-pdfs.py test-results/phase-3-print
Render and visually inspect the PDFs as well; this cannot verify physical folds.
"""

import math
from pathlib import Path
import sys

import pdfplumber


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def is_white(color):
    if isinstance(color, (int, float)):
        return color == 1
    return color in ((1, 1, 1), (1,))


root = Path(sys.argv[1] if len(sys.argv) > 1 else "test-results/phase-3-print")
expected = {
    f"{artwork}-{paper}.pdf"
    for artwork in ("picnic-cooler", "cozy-gift", "tiny-garden")
    for paper in ("letter", "a4")
} | {"tiny-garden-a4-clean.pdf", "tiny-garden-a4-direct-print.pdf"}
paths = {path.name: path for path in root.rglob("*.pdf")}
require(expected <= paths.keys(), f"Missing PDF evidence: {expected - paths.keys()}")

for name in sorted(expected):
    clean = "clean" in name or "direct-print" in name
    width, height = (612, 792) if "letter" in name else (210 * 72 / 25.4, 297 * 72 / 25.4)
    scale = min((width - 72) / 612, (height - 120) / 792)
    art_height = 792 * scale
    fold_positions = (height / 2, (height - art_height) / 2 + art_height / 4)
    with pdfplumber.open(paths[name]) as pdf:
        require(len(pdf.pages) == (1 if clean else 2), f"{name}: unexpected page count")
        for page in pdf.pages:
            # Chromium rounds its MediaBox; allow <0.18 mm, far below the 2 mm seam target.
            require(abs(page.width - width) < 0.5 and abs(page.height - height) < 0.5,
                    f"{name}: incorrect paper size")
            require(not page.images, f"{name}: raster image found; vector art expected")
            require(len(page.curves) > 40, f"{name}: missing vector artwork")
            ink = list(page.chars)
            for obj in page.curves + page.lines + page.rects:
                if ((obj.get("fill") and not is_white(obj.get("non_stroking_color")))
                        or (obj.get("stroke") and not is_white(obj.get("stroking_color")))):
                    ink.append(obj)
            for obj in ink:
                require(obj["x0"] >= 35.5 and obj["top"] >= 35.5
                        and obj["x1"] <= width - 35.5 and obj["bottom"] <= height - 35.5,
                        f"{name}: ink outside conservative margins: {obj}")
            text = page.extract_text() or ""
            for unwanted in ("Print / Save as PDF", "Back to playing", "MAKE ROOM FOR WONDER", "http://"):
                require(unwanted not in text, f"{name}: browser controls/header leaked into PDF")
        first_text = " ".join((pdf.pages[0].extract_text() or "").split())
        require(first_text == ("" if clean else "2 2 1 1 50 mm - check with a ruler"),
                f"{name}: unexpected coloring-page annotations: {first_text}")
        if not clean:
            ruler = [line for line in pdf.pages[0].lines
                     if abs(line["top"] - (height - 49)) < 0.1 and line["width"] > 100]
            require(len(ruler) == 1, f"{name}: calibration ruler missing")
            require(math.isclose(ruler[0]["width"] * 25.4 / 72, 50, abs_tol=0.01),
                    f"{name}: calibration ruler has been scaled")
            instructions = pdf.pages[1].extract_text()
            require("Color. Fold. Surprise!" in instructions, f"{name}: instructions missing")
            for position in fold_positions:
                distance = f"{position * 25.4 / 72:.1f} mm ({position / 72:.2f} in)"
                require(distance in instructions, f"{name}: incorrect crease measurement")
        print(f"PASS {name}: {len(pdf.pages)} page(s), correct paper, vector art, safe margins"
              + (", clean art" if clean else ", 50 mm ruler and matching instructions"))

print("PDF checks passed. Physical folding and family usability still need hands-on review.")
