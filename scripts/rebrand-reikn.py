"""Replace user-facing Meetily / M&IA Meeting branding with Reikn."""
from pathlib import Path

ROOT = Path(r"C:\Users\chafi\Desktop\mia-meeting")
SKIP_DIRS = {
    ".git",
    "node_modules",
    "target",
    "binaries",
    ".next",
    "out",
    "__pycache__",
}
SKIP_FILES = {
    "LICENSE.md",
    "NOTICE",
    "package-lock.json",
    "pnpm-lock.yaml",
    "Cargo.lock",
    "gen-reikn-icons.py",
    "rebrand-reikn.py",
}
SKIP_SUFFIXES = {".png", ".ico", ".icns", ".exe", ".dll", ".woff", ".woff2", ".ttf"}
TEXT_SUFFIXES = {
    ".ts", ".tsx", ".js", ".jsx", ".json", ".toml", ".md", ".rs", ".yml", ".yaml",
    ".html", ".css", ".txt", ".ps1", ".bat", ".sh", ".plist", ".svg",
}

PROTECT = [
    ("https://meetily.towardsgeneralintelligence.com", "___CDN_MEETILY___"),
    ("https://github.com/Zackriya-Solutions/ffmpeg-binaries", "___FFMPEG_UPSTREAM___"),
    ("/opt/homebrew/var/meetily/", "___HB_ARM___"),
    ("/usr/local/var/meetily/", "___HB_INTEL___"),
]


def should_skip(path: Path) -> bool:
    if path.name in SKIP_FILES:
        return True
    if path.suffix.lower() in SKIP_SUFFIXES:
        return True
    if path.suffix.lower() not in TEXT_SUFFIXES and path.name not in {"NOTICE"}:
        return True
    parts = set(path.parts)
    return bool(parts & SKIP_DIRS)


def transform(text: str) -> str:
    for src, token in PROTECT:
        text = text.replace(src, token)
    text = text.replace("M&IA Meeting", "Reikn")
    text = text.replace("Meetily", "Reikn")
    text = text.replace("meetily", "reikn")
    text = text.replace("MEETILY", "REIKN")
    for src, token in PROTECT:
        text = text.replace(token, src)
    return text


changed = []
for path in ROOT.rglob("*"):
    if not path.is_file() or should_skip(path):
        continue
    try:
        original = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    updated = transform(original)
    if updated != original:
        path.write_text(updated, encoding="utf-8")
        changed.append(str(path.relative_to(ROOT)))

print(f"updated {len(changed)} files")
for p in changed:
    print(" ", p)
