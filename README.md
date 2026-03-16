# Game Night Competition

A single page web application built with HTML, CSS, and vanilla JavaScript for running a two-team game night competition on GitHub Pages.

## Files in this project

- `index.html` - SPA layout, navigation, welcome screen, game sections, and final scoreboard
- `style.css` - responsive game-show inspired styling, animations, cards, and mobile menu
- `script.js` - modular client-side app logic, localStorage handling, SPA navigation, score saving, and Google Apps Script communication
- `google-apps-script.gs` - example Google Apps Script backend for writing scores into Google Sheets

## Features

- Single Page Application with tab switching and no page reloads
- Welcome page with team setup
- Seven game tabs with placeholder `game-container` areas for future mini-games
- Local score persistence with `localStorage`
- Google Sheets sync via Apps Script POST requests
- Hidden scores until the Final Score page
- Winner highlight with subtle celebration animation
- Responsive layout with a hamburger menu for smaller screens

## Google Sheets structure

Use the existing spreadsheet:

`https://docs.google.com/spreadsheets/d/1V9lKiKYTT5y0NlUx3odXsulqN3QhA1ptknZTxA7d2cw/edit`

Expected columns:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Team Name | Game 1 | Game 2 | Game 3 | Game 4 | Game 5 | Game 6 | Game 7 | TOTAL |

Expected rows:

- Row 2: Team 1
- Row 3: Team 2

## Google Apps Script setup

### 1. Create the Apps Script project

1. Open `https://script.google.com/`
2. Create a new project
3. Replace the default code with the contents of `google-apps-script.gs`
4. If your sheet tab is not named `Sheet1`, update `SHEET_NAME` in the script
5. Save the project

### 2. Deploy the script as a web app

1. Click `Deploy`
2. Click `New deployment`
3. Choose `Web app`
4. Set:
   - Execute as: `Me`
   - Who has access: `Anyone`
5. Click `Deploy`
6. Copy the deployment URL

### 3. Connect the web app to the frontend

1. Open `script.js`
2. Find:

```js
const APPS_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

3. Replace the placeholder string with your deployed Apps Script URL

## Example request body sent from the website

```json
{
  "game": 1,
  "team1Name": "Team A",
  "team2Name": "Team B",
  "team1Score": 10,
  "team2Score": 8
}
```

The app also sends an `action` field:

- `initializeTeams` when the welcome form starts the competition
- `saveScore` when a game score is saved

## Running locally

Because this is a GitHub Pages style static site, you can test it very simply.

### Option 1: open directly

Open `index.html` in your browser.

### Option 2: use a simple local server

If you want cleaner browser behavior, run this in Git Bash from `/c/Soniniada`:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

## Deploying to GitHub Pages

1. Push the repository to GitHub
2. Open your GitHub repository
3. Go to `Settings` -> `Pages`
4. Under `Build and deployment`, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. Save
6. Wait for GitHub Pages to publish the site

## Git Bash commands to commit and push

Run these from `/c/Soniniada`:

```bash
git status
git add index.html style.css script.js google-apps-script.gs README.md
git commit -m "Build game night competition SPA"
git push origin main
```

## Notes for future expansion

- Each game page includes a `.game-container` placeholder for future game-specific logic
- Score entry and game navigation are already modular in `script.js`
- You can later extend the app by attaching separate game modules to each game section without changing the overall SPA structure
