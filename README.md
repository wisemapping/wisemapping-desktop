# WiseMapping Desktop

<p align="center">
  <img src="https://www.wisemapping.com/images/logo-small.svg" alt="WiseMapping" width="200"/>
</p>

<p align="center">
  <strong>Offline Desktop Application for WiseMapping</strong>
</p>

<p align="center">
  WiseMapping Desktop is the offline companion to <a href="https://www.wisemapping.com">WiseMapping</a>, the free and open-source mind mapping tool. Create, edit, and manage your mind maps locally without an internet connection.
</p>

---

## About WiseMapping

[WiseMapping](https://www.wisemapping.com) is a free, web-based mind mapping service that lets you create, share, and collaborate on mind maps. WiseMapping Desktop extends this experience to your desktop, providing:

- **Offline Access**: Work on your mind maps without internet connectivity
- **Local Storage**: Keep your data private and secure on your machine
- **Cross-Platform**: Available for macOS, Windows, and Linux
- **Full Feature Set**: All the power of WiseMapping, on your desktop

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Development with Local Packages

If you are developing properly locally and have the `wisemapping-frontend` repository in the parent directory, you can easily setup the environment:

```bash
yarn deps
```

This command will:
1. Build the local `wisemapping-frontend` packages
2. Pack them into tarballs
3. Install them into `node_modules` without modifying `package.json`

Then you can run:

```bash
yarn dev
```

## Features

- **Fully Offline**: All mind maps stored locally in `~/Documents/WiseMapping/`
- **Cross-Platform**: Native builds for macOS, Windows, and Linux
- **Secure**: Context isolation, sandboxed renderer, whitelisted IPC
- **Modern Stack**: Built with TypeScript, React 19, Electron 28, and Vite 7
- **Auto-Save**: Your work is automatically saved as you edit
- **Native Menus**: Platform-native menu bars and keyboard shortcuts

## Development

### Available Commands

```bash
yarn deps       # Setup local development dependencies
yarn dev        # Start development mode
yarn build      # Build for production
yarn dist       # Create distributables for all platforms
yarn dist:mac   # Create macOS distributable
yarn dist:win   # Create Windows distributable
yarn dist:linux # Create Linux distributable
yarn clean      # Clean build artifacts and dependencies
```

### Project Structure

```
wisemapping-desktop/
├── src/
│   ├── main/                      # Electron main process
│   │   ├── main.ts                # Application entry point
│   │   └── fileManager.ts         # Local file operations
│   ├── preload/                   # Secure IPC bridge
│   │   ├── preload.ts             # Context bridge
│   │   └── index.d.ts             # TypeScript definitions
│   └── renderer/                  # React UI
│       ├── src/
│       │   ├── screens/           # UI screens
│       │   ├── persistence/       # Local persistence layer
│       │   └── styles/            # CSS styles
│       └── index.html
├── resources/                     # App icons and assets
├── .github/workflows/build.yml    # CI/CD pipeline
├── electron-builder.yml           # Build configuration
└── package.json
```

## Storage

Mind maps are stored locally in:
- **macOS/Linux**: `~/Documents/WiseMapping/`
- **Windows**: `%USERPROFILE%\Documents\WiseMapping\`

Directory structure:
```
WiseMapping/
├── metadata.json          # Index with timestamps
└── maps/
    ├── {uuid}.wxml       # Mind map files
    └── {uuid}.wxml
```

## Building for Distribution

### Prerequisites for Distribution

- **macOS**: Xcode Command Line Tools
- **Windows**: Windows SDK (for code signing)
- **Linux**: Standard build tools

### Create Distributables

```bash
# Build for all platforms
yarn dist

# Platform-specific builds
yarn dist:mac    # Creates .dmg and .zip
yarn dist:win    # Creates .exe installer
yarn dist:linux  # Creates .AppImage and .deb
```

### Code Signing (Optional)

For production releases, configure code signing in `electron-builder.yml`:

**macOS:**
```yaml
mac:
  identity: "Developer ID Application: Your Name (TEAM_ID)"
```

**Windows:**
```yaml
win:
  certificateFile: path/to/cert.pfx
  certificatePassword: ${CERT_PASSWORD}
```

## CI/CD

GitHub Actions workflow automatically:
- Builds for all platforms on push to `main`/`develop`
- Creates releases for version tags (`v*`)
- Uploads platform-specific artifacts

## Contributing

WiseMapping Desktop is part of the WiseMapping project. Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](https://github.com/wisemapping/wisemapping-frontend/blob/develop/CONTRIBUTING.md) for details on our code of conduct and development process.

## Related Projects

- [wisemapping-frontend](https://github.com/wisemapping/wisemapping-frontend) - WiseMapping web application and core packages
- [wisemapping-backend](https://github.com/wisemapping/wisemapping-backend) - WiseMapping server backend

## Support

- **Website**: [www.wisemapping.com](https://www.wisemapping.com)
- **Documentation**: [wisemapping.atlassian.net](https://wisemapping.atlassian.net/wiki/spaces/WS/overview)
- **Issues**: [GitHub Issues](https://github.com/wisemapping/wisemapping-desktop/issues)
- **Community**: [WiseMapping Community](https://groups.google.com/g/wisemapping)

## License

WiseMapping Desktop is licensed under the **WiseMapping Public License (WPL)**.

The WiseMapping Public License is a modified version of the Apache License 2.0 that includes additional terms specific to the WiseMapping project. See the [LICENSE](LICENSE) file for the full license text.

### Key Points

- ✅ Free to use for personal and commercial purposes
- ✅ Modify and distribute
- ✅ Patent grant included
- ⚠️ Must retain copyright notices
- ⚠️ Must include license and notice files

For the complete license terms, see [LICENSE](LICENSE) or visit [www.wisemapping.org/license](http://www.wisemapping.org/license).

## Authors

**WiseMapping Desktop** is developed and maintained by the WiseMapping team.

- **Project Lead**: Paulo Veiga ([@pveiga](https://github.com/pveiga))
- **Contributors**: See [CONTRIBUTORS](https://github.com/wisemapping/wisemapping-frontend/graphs/contributors)

---

<p align="center">
  Made with ❤️ by the <a href="https://www.wisemapping.com">WiseMapping</a> team
</p>
