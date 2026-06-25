"""Extract scan-safe QR assets from the original social-media posters."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent.parent


def extract_douyin() -> None:
    source = Image.open(ROOT / "douyin.png").convert("RGBA")

    # The original white circular code occupies this area in the 1125px poster.
    crop_box = (188, 186, 937, 935)
    qr = source.crop(crop_box)

    # Supersampled circular matte keeps the anti-aliased white edge clean.
    scale = 4
    mask = Image.new("L", (qr.width * scale, qr.height * scale), 0)
    draw = ImageDraw.Draw(mask)
    center_x = (562.5 - crop_box[0]) * scale
    center_y = (560.5 - crop_box[1]) * scale
    radius = 355.0 * scale
    draw.ellipse(
        (
            center_x - radius,
            center_y - radius,
            center_x + radius,
            center_y + radius,
        ),
        fill=255,
    )
    mask = mask.resize(qr.size, Image.Resampling.LANCZOS)
    qr.putalpha(mask)
    qr.save(ROOT / "douyin-qr.png", optimize=True)


def extract_bilibili() -> None:
    source = Image.open(ROOT / "bilibili.jpg").convert("RGBA")

    # Preserve the complete white quiet zone; it is required for reliable scans.
    qr = source.crop((739, 752, 895, 908))

    # Remove only the outer poster area while retaining the QR's white card.
    scale = 4
    mask = Image.new("L", (qr.width * scale, qr.height * scale), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(
        (2 * scale, 2 * scale, 154 * scale, 154 * scale),
        radius=9 * scale,
        fill=255,
    )
    mask = mask.resize(qr.size, Image.Resampling.LANCZOS)
    qr.putalpha(mask)
    qr.save(ROOT / "bilibili-qr.png", optimize=True)


if __name__ == "__main__":
    extract_douyin()
    extract_bilibili()
    print("Created douyin-qr.png and bilibili-qr.png")
