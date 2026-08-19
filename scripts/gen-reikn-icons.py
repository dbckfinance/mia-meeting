from pathlib import Path
import shutil
from PIL import Image

SRC = Path(r"C:\Users\chafi\Desktop\m-ia\src\assets\brand\mia-hex-logo-8bit.png")
PUBLIC = Path(r"C:\Users\chafi\Desktop\mia-meeting\frontend\public")
ICONS = Path(r"C:\Users\chafi\Desktop\mia-meeting\frontend\src-tauri\icons")

logo = Image.open(SRC).convert("RGBA")
print("source", SRC.name, logo.size)

# Keep the original 795px file — never serve a 64px downsample in the UI
shutil.copy(SRC, PUBLIC / "reikn-hex.png")
shutil.copy(SRC, PUBLIC / "logo.png")
shutil.copy(SRC, PUBLIC / "logo-collapsed.png")
shutil.copy(SRC, PUBLIC / "icon_128x128.png")
print("copied original to public/")


def resize(size: int) -> Image.Image:
    # Pixel-art mark: nearest neighbor stays sharp; lanczos turns it to mush
    return logo.resize((size, size), Image.Resampling.NEAREST)


sizes = {
    "icon.png": 512,
    "icon_16x16.png": 16,
    "icon_16x16@2x.png": 32,
    "icon_32x32.png": 32,
    "icon_32x32@2x.png": 64,
    "icon_128x128.png": 128,
    "icon_128x128@2x.png": 256,
    "icon_256x256.png": 256,
    "icon_256x256@2x.png": 512,
    "icon_512x512.png": 512,
    "icon_512x512@2x.png": 795,
    "32x32.png": 32,
    "128x128.png": 128,
    "128x128@2x.png": 256,
    "Square30x30Logo.png": 30,
    "Square44x44Logo.png": 44,
    "Square71x71Logo.png": 71,
    "Square89x89Logo.png": 89,
    "Square107x107Logo.png": 107,
    "Square142x142Logo.png": 142,
    "Square150x150Logo.png": 150,
    "Square284x284Logo.png": 284,
    "Square310x310Logo.png": 310,
    "StoreLogo.png": 50,
}
for name, size in sizes.items():
    resize(size).save(ICONS / name)
    print("icon", name, size)

ico = resize(256)
ico.save(
    ICONS / "icon.ico",
    format="ICO",
    sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)
shutil.copy(ICONS / "icon.ico", ICONS / "app_icon.ico")
print("ico ok")
