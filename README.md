# Leads Tracker Chrome Extension

## Local Deployment (How to Run Locally)

To use this Chrome extension locally:

1. **Install dependencies:**
   ```
   npm install
   ```
2. **Build the extension for production:**
   ```
   npm run build
   ```
   This creates a `dist` folder with all static files.
3. **Load the extension in Chrome:**
   - Go to `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the `dist` folder
   - The extension will appear in your browser
4. **For changes:**
   - Re-run `npm run build` after making changes
   - Reload the extension in Chrome

---

## Overview

Leads Tracker is a modern, user-friendly Chrome extension designed to help sales professionals and anyone who collects web links to efficiently save, organize, and manage leads directly from their browser. The extension allows users to save URLs (either manually or from the current tab), add notes, assign and edit tags (including custom tags), group and filter leads by tags, and import/export their data as CSV files. The UI is clean, minimal, and responsive, with a color palette chosen for clarity and comfort.

## Features

- **Save Leads**: Add a URL manually or save the current browser tab with a single click.
- **Notes**: Attach a note to each lead, with validation and inline editing.
- **Tags**: Assign multiple tags (including custom tags) to each lead for flexible organization.
- **Tag Grouping & Filtering**: View leads grouped by tag and filter the list to focus on specific tags.
- **Edit & Remove**: Edit notes and tags inline, and delete individual leads or all leads at once.
- **Import/Export**: Import leads from a CSV file (with validation) and export your data for backup or sharing.
- **Modern UI**: Responsive, accessible, and visually appealing, with smooth animations and a well-balanced color palette.

## File Structure & Descriptions

- **manifest.json**: Chrome extension manifest (v3). Declares the extension's name, version, permissions (tabs), popup (index.html), and icon.
- **index.html**: The main popup UI. Contains the input fields for URL and note, action buttons (save, delete, import/export), and the list of saved leads. The tag filter dropdown is dynamically rendered above the list.
- **index.js**: The core logic for the extension. Handles saving, editing, deleting, importing/exporting leads, tag management, grouping/filtering, and all UI interactions. Uses localStorage for persistence.
- **index.css**: Custom styles for the extension. Implements the color palette, button and list item styles, animations, and responsive layout. Ensures a modern, minimal, and accessible look.
- **icon.png**: The extension's icon, shown in the Chrome toolbar and extension list.
- **vite.config.mjs**: Vite configuration file (ESM format) for building the extension. Ensures compatibility with modern tooling and Chrome extension requirements.
- **package.json**: Project metadata, scripts, and dependencies. Declares the project as an ES module and provides scripts for development and production builds.
- **README.md**: This documentation file.

## Design Choices & Rationale

### Chrome Extension Architecture
- **Manifest v3**: Chosen for future-proofing and compliance with Chrome's latest extension standards.
- **Popup UI**: All user interaction is handled in the popup for simplicity and focus. No background scripts are used, keeping the extension lightweight.

### UI/UX
- **Minimal, Responsive Design**: The UI is intentionally minimal, with clear separation between input, actions, and the leads list. Bootstrap is used for layout and form controls, with custom CSS for branding and animation.
- **Color Palette**: The palette (#5F6F52, #A9B388, #FEFAE0, #B99470) was chosen for a calm, professional look that is easy on the eyes and accessible.
- **Animations**: Subtle fade and bounce animations make adding/removing leads feel smooth and modern, improving perceived performance and user satisfaction.
- **Accessibility**: Button sizes, color contrast, and focus states are designed for accessibility and usability.

### Data Model & Functionality
- **Leads as Objects**: Each lead is an object with `url`, `note`, and `tags` (array). This allows for flexible extension (e.g., adding more metadata in the future).
- **Tag System**: Tags are stored as arrays, supporting both default sales tags and unlimited custom tags. Tag grouping and filtering are dynamic, reflecting all tags in use.
- **CSV Import/Export**: CSV is a universal, human-readable format. The import logic validates file type and format, and supports tags as a semicolon-separated field. Export includes all data for easy backup or migration.
- **LocalStorage**: Chosen for simplicity and privacy. All data stays on the user's device. (Syncing via Chrome storage could be added in the future.)

### Development & Build
- **Vite**: Chosen for fast development and modern build output. The config is ESM (`vite.config.mjs`) for compatibility with Vite and Chrome extension requirements.
- **Production Build for Chrome**: The extension must be loaded from the `dist` folder (static files) in Chrome, not from the Vite dev server. This is documented in the README.

### Debated Choices
- **Popup vs. Background/Options Page**: All features are in the popup for simplicity. An options page could be added for advanced settings or analytics.
- **LocalStorage vs. Chrome Sync**: LocalStorage is simpler and more private, but Chrome Sync could be added for cross-device support.
- **CSV vs. JSON Export**: CSV is more universal, but JSON export could be added for richer data interchange.

## How to Use

- Use the popup to add, edit, tag, group, filter, import, and export your leads.
- All data is stored locally in your browser.

## Future Improvements
- Chrome Sync support
- Advanced search/filter (by note, URL, date)
- Options page for settings
- Dark mode
- More import/export formats (JSON, HTML)
- Analytics (optional)

---

This project is designed to be a robust, extensible, and user-friendly tool for anyone who needs to track and organize leads in the browser. Contributions and suggestions are welcome!