/**
 * Google Apps Script backend for the Game Night Competition web app.
 *
 * This version supports the updated 11-round flow:
 * Gra 1, Kącik muzyczny 1, Gra 2, Odegraj postać 1, Gra 3,
 * Kącik muzyczny 2, Gra 4, Odegraj postać 2, Gra 5,
 * Kącik muzyczny 3, Gra 6, plus TOTAL.
 */

const SPREADSHEET_ID = "1V9lKiKYTT5y0NlUx3odXsulqN3QhA1ptknZTxA7d2cw";
const SHEET_NAME = "Sheet1";
const ROUND_HEADERS = [
  "Gra 1",
  "Kącik muzyczny 1",
  "Gra 2",
  "Odegraj postać 1",
  "Gra 3",
  "Kącik muzyczny 2",
  "Gra 4",
  "Odegraj postać 2",
  "Gra 5",
  "Kącik muzyczny 3",
  "Gra 6"
];
const TOTAL_ROUNDS = ROUND_HEADERS.length;
const TOTAL_COLUMN = TOTAL_ROUNDS + 2; // Column A = team name

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
        message: `Round ${payload.roundIndex} score saved successfully.`
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
  const headerRow = ["Team Name"].concat(ROUND_HEADERS).concat(["TOTAL"]);

  sheet.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
  sheet.getRange("A2").setValue(payload.team1Name || "Team 1");
  sheet.getRange("A3").setValue(payload.team2Name || "Team 2");
  sheet.getRange(2, 2, 2, TOTAL_ROUNDS + 1).setValues([
    Array(TOTAL_ROUNDS + 1).fill(0),
    Array(TOTAL_ROUNDS + 1).fill(0)
  ]);
}

function saveScore_(payload) {
  const roundIndex = Number(payload.roundIndex);

  if (!roundIndex || roundIndex < 1 || roundIndex > TOTAL_ROUNDS) {
    throw new Error(`Round index must be between 1 and ${TOTAL_ROUNDS}.`);
  }

  const sheet = getSheet_();
  const scoreColumn = roundIndex + 1; // Column B = first scoring round

  sheet.getRange("A2").setValue(payload.team1Name || "Team 1");
  sheet.getRange("A3").setValue(payload.team2Name || "Team 2");

  sheet.getRange(2, scoreColumn).setValue(toScore_(payload.team1Score));
  sheet.getRange(3, scoreColumn).setValue(toScore_(payload.team2Score));

  const row2Scores = sheet.getRange(2, 2, 1, TOTAL_ROUNDS).getValues()[0];
  const row3Scores = sheet.getRange(3, 2, 1, TOTAL_ROUNDS).getValues()[0];

  sheet.getRange(2, TOTAL_COLUMN).setValue(row2Scores.reduce(sumNumbers_, 0));
  sheet.getRange(3, TOTAL_COLUMN).setValue(row3Scores.reduce(sumNumbers_, 0));
}

function sumNumbers_(sum, value) {
  return sum + toScore_(value);
}

function toScore_(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
