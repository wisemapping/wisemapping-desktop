# Placeholder for app icons

This directory should contain:
- `icon.icns` - macOS icon (512x512)
- `icon.ico` - Windows icon (256x256)
- `icon.png` - Linux icon (512x512)

You can generate these from a source image using tools like:
- https://cloudconvert.com/png-to-icns
- https://cloudconvert.com/png-to-ico

Or use electron-icon-builder:
```bash
npm install -g electron-icon-builder
electron-icon-builder --input=./icon-source.png --output=./resources
```
