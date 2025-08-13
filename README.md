# Holy Grail (Diablo II: Resurrected)

Automatic tracker for the Diablo 2 Resurrected **Holy Grail** challenge (offline characters).  
Built with **Electron**, **React**, and **TypeScript**.

> **Modified by PyroSplat** – includes persistence, badges, and UI tweaks.

---

## ✨ Features

- **Sundered charms** are included in the grail tracker.
- **Persistent found items** (optional):  
  Toggle in **Settings → “Persist found on drop”** to count items you’ve found historically—no need to keep them on mules or in stash.
- **“Previously found” badge** + subtle grey checkmark beside items that are counted due to history (not currently in stash).
- **“Only missing” filter** respects history when persistence is ON (hides items previously found).
- **Summary totals** reflect historically found items when persistence is ON.
- **Clear persistent history** (with confirmation dialog):  
  Wipes the “Previously found” history and updates totals/badges instantly.  
  > ⚠️ **Warning:** This is **permanent**. Your stash is not touched.
- **Theme & font tweaks** for a cleaner look.

For more info about the original project, see **[holygrail.link](https://holygrail.link)**.

---

## 🧰 How to enable persistence

1. Open **Settings** (gear icon in the top bar).  
   _Screenshot placeholder:_  
   ![Open Settings](docs/images/settings-open.png "Open Settings")

2. Toggle **Persist found on drop**.  
   _Screenshot placeholder:_  
   ![Persist found on drop toggle](docs/images/persist-toggle.png "Enable persistence")

3. When enabled:
   - Items you’ve found before show a **“Previously found”** badge and a **grey check**.
   - These items **count toward your grail totals** and are **hidden by “Only missing”**.

   _Screenshot: badges in the list view_  
   ![Previously found badge and grey check](docs/images/previously-found-badge.png "‘Previously found’ badge + grey check")

4. To remove historical counts/badges:
   - Click **Clear persistent history…** in Settings and confirm.  
     _Screenshot placeholder:_  
     ![Clear persistent history](docs/images/clear-history.png "Clear persistence with confirmation")

> Tip: Persistence is great if you mule/sell items but still want credit for prior drops.

---

## 🛠 Info for Developers

### Installation

```bash
## Usage

Just run start script.

bash
yarn start



## Packaging

To generate the project package based on the OS you're running on, just run:

bash
yarn package



## Contributing

Pull requests are always welcome 😃.

## License

[ISC](https://choosealicense.com/licenses/isc/)
