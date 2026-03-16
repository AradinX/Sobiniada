/**
 * Google Apps Script backend for the Game Night Competition web app.
 *
 * Paste this code into script.google.com, update SHEET_NAME if needed,
 * deploy as a Web App, then use the deployment URL inside script.js.
 */

const SPREADSHEET_ID = "1V9lKiKYTT5y0NlUx3odXsulqN3QhA1ptknZTxA7d2cw";
const SHEET_NAME = "Sheet1";
const TOTAL_GAMES = 7;

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");

    if (payload.action === "initializeTeams") {
      initializeTeams_(payload);
      return jsonResponse_({
        success: true,
        message: "Teams initialized successfully."
      });
    }

    if (payload.action === "saveScore") {
      saveScore_(payload);
      return jsonResponse_({
        success: true,
        message: `Game ${payload.game} score saved successfully.`
      });
    }

    return jsonResponse_({
      success: false,
      message: "Unknown action."
    });
  } catch (error) {
    return jsonResponse_({
      success: false,
      message: error.message
    });
  }
}

function initializeTeams_(payload) {
  const sheet = getSheet_();

  sheet.getRange("A2").setValue(payload.team1Name || "Team 1");
  sheet.getRange("A3").setValue(payload.team2Name || "Team 2");

  sheet.getRange(2, 2, 2, TOTAL_GAMES + 1).setValues([
    Array(TOTAL_GAMES + 1).fill(0),
    Array(TOTAL_GAMES + 1).fill(0)
  ]);
}

function saveScore_(payload) {
  const gameNumber = Number(payload.game);

  if (!gameNumber || gameNumber < 1 || gameNumber > TOTAL_GAMES) {
    throw new Error("Game number must be between 1 and 7.");
  }

  const sheet = getSheet_();
  const scoreColumn = gameNumber + 1;
  const totalColumn = 9;

  sheet.getRange("A2").setValue(payload.team1Name || "Team 1");
  sheet.getRange("A3").setValue(payload.team2Name || "Team 2");

  sheet.getRange(2, scoreColumn).setValue(Number(payload.team1Score) || 0);
  sheet.getRange(3, scoreColumn).setValue(Number(payload.team2Score) || 0);

  const row2Scores = sheet.getRange(2, 2, 1, TOTAL_GAMES).getValues()[0];
  const row3Scores = sheet.getRange(3, 2, 1, TOTAL_GAMES).getValues()[0];

  const team1Total = row2Scores.reduce(sumNumbers_, 0);
  const team2Total = row3Scores.reduce(sumNumbers_, 0);

  sheet.getRange(2, totalColumn).setValue(team1Total);
  sheet.getRange(3, totalColumn).setValue(team2Total);
}

function sumNumbers_(sum, value) {
  return sum + (Number(value) || 0);
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME}" not found.`);
  }

  return sheet;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
