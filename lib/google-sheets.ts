import { google } from "googleapis";

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function getSheetData(range: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });
  return response.data.values;
}

export async function appendRow(sheetName: string, values: string[]) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });
}

export async function getPersonas() {
  const data = await getSheetData("Personas!A:J");
  if (!data || data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map((row) => {
    const persona: Record<string, string> = {};
    headers.forEach((header, index) => {
      persona[header] = row[index] || "";
    });
    return persona;
  });
}