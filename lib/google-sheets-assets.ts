import { google } from "googleapis";

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export const ASSETS_SHEET_ID = process.env.GOOGLE_ASSETS_SHEET_ID;

export async function getAssetsSheetData(range: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: ASSETS_SHEET_ID,
    range,
  });
  return response.data.values;
}

export async function appendAssetsRow(sheetName: string, values: string[]) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: ASSETS_SHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });
}

export async function updateAssetsRow(
  sheetName: string,
  searchColumn: string,
  searchValue: string,
  updates: Record<string, string>
) {
  const sheetId = ASSETS_SHEET_ID;

  const data = await getAssetsSheetData(`${sheetName}!A:Z`);
  if (!data || data.length < 2) {
    throw new Error("Sheet is empty or not found");
  }

  const headers = data[0];
  const searchColIndex = headers.indexOf(searchColumn);

  if (searchColIndex === -1) {
    throw new Error(`Column ${searchColumn} not found`);
  }

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][searchColIndex] === searchValue) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error(`Row with ${searchColumn}=${searchValue} not found`);
  }

  const currentRow = data[rowIndex - 1];
  const newRow = headers.map((header, index) => {
    if (updates.hasOwnProperty(header)) {
      return updates[header];
    }
    return currentRow[index] || "";
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${sheetName}!A${rowIndex}:${String.fromCharCode(65 + headers.length - 1)}${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [newRow],
    },
  });

  return { success: true, rowIndex };
}

// LoRA Training functions
export async function getLoRATrainingImages(personaId?: string) {
  const data = await getAssetsSheetData("LoRA_Training!A:M");
  if (!data || data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  const images = rows.map((row) => {
    const image: Record<string, string> = {};
    headers.forEach((header, index) => {
      image[header] = row[index] || "";
    });
    return image;
  });

  if (personaId) {
    return images.filter((img) => img.persona_id === personaId);
  }
  return images;
}

export async function addLoRATrainingImage(image: Record<string, string>) {
  const values = [
    image.image_id,
    image.persona_id,
    image.bucket,
    image.prompt,
    image.caption,
    image.drive_url || "",
    image.drive_file_id || "",
    image.version_target,
    image.status || "generated",
    image.score_identity || "",
    image.score_style || "",
    image.notes || "",
    image.created_at || new Date().toISOString().split("T")[0],
  ];
  await appendAssetsRow("LoRA_Training", values);
}

// Generated Content functions
export async function getGeneratedContent(personaId?: string) {
  const data = await getAssetsSheetData("Generated_Content!A:K");
  if (!data || data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  const content = rows.map((row) => {
    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      item[header] = row[index] || "";
    });
    return item;
  });

  if (personaId) {
    return content.filter((c) => c.persona_id === personaId);
  }
  return content;
}

export async function addGeneratedContent(content: Record<string, string>) {
  const values = [
    content.content_id,
    content.persona_id,
    content.content_type,
    content.prompt,
    content.drive_url || "",
    content.drive_file_id || "",
    content.platform || "",
    content.calendar_slot_id || "",
    content.status || "generated",
    content.created_at || new Date().toISOString().split("T")[0],
    content.notes || "",
  ];
  await appendAssetsRow("Generated_Content", values);
}

// Assets Index functions
export async function getAssetsIndex(personaId?: string) {
  const data = await getAssetsSheetData("Assets_Index!A:H");
  if (!data || data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  const assets = rows.map((row) => {
    const asset: Record<string, string> = {};
    headers.forEach((header, index) => {
      asset[header] = row[index] || "";
    });
    return asset;
  });

  if (personaId) {
    return assets.filter((a) => a.persona_id === personaId);
  }
  return assets;
}