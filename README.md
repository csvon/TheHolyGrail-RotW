# The Holy Grail (Diablo II: Resurrected - Reign of the Warlock)

Fork of [pyrosplat/TheHolyGrail](https://github.com/pyrosplat/TheHolyGrail) with additional support and quality-of-life improvements for **Reign of the Warlock (RotW)**.

This desktop app scans your Diablo II: Resurrected offline save files and tracks your **Holy Grail** progress.
Built with **Electron**, **React**, and **TypeScript**.

Also check out [TheHolyGrail Public Tracker](https://github.com/pyrosplat/TheHolyGrail-Public-Tracker) (web app integration project).

<p align="center">
  <img src="docs/images/app-hero.png" alt="Holy Grail App Overview" width="900" />
</p>

## What's New In This Fork

### RotW Support
- Adds support for the new **Warlock** character.
- Adds basic **shared stash** parsing for RotW:
  - Reads all 5 shared stash pages.
  - Reads rune presence from the runes tab (limited support).

### New Features
- Recent finds accordion on the app home screen.
- Item browser to inspect owned items and see which character holds each item (click on the char name when inspecting your owned items).

  <img src="docs/images/item-hero.png" alt="Holy Grail Item Browser" width="350" />

### Current Limitations
- Materials tab is not parsed.
- Rune quantities are not decoded (presence only).
- Newly added RotW items are not supported yet.

## Core Features of [pyrosplat/TheHolyGrail](https://github.com/pyrosplat/TheHolyGrail)

- Include **Sunder charms** in grail tracking.
- Optional **persistent found items** mode:
  - Enable in **Settings -> Persist found on drop**.
  - Lets you count items found historically, even if no longer stored.
- **Previously found** indicators for history-counted items.
- Ability to clear persistent history with confirmation.
- Display live grail progress over the game window without alt-tabbing.
  - Compact, high-contrast design.
  - Adjustable size in settings.
  - Optional recent finds list.
- **Sound notifications** for newly found items:
  - Audio alerts can be configured for newly found items.
  - Volume control
  - Custom sound file support (`.wav`, `.mp3`, `.ogg`)
- Theme and font customization options.

## Getting Started

### Install

```bash
yarn install
```

### Run (Development)

```bash
yarn start
```

### Package App

```bash
yarn package
```

### Build Windows Installer

```bash
yarn build
```

## Available Scripts

- `yarn start` - Starts Electron app in development mode.
- `yarn package` - Packages app using Electron Forge.
- `yarn build` - Packages app and builds Windows installer with Electron Builder.
- `yarn build-win` - Builds Windows installer.
- `yarn make` - Builds distributables via Electron Forge makers.
- `yarn release` - Publishes release artifacts via Electron Forge.
- `yarn lint` - Runs ESLint.

## License

[ISC](https://choosealicense.com/licenses/isc/)
