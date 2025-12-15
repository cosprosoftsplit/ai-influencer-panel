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

export async function getPersonaPrompts(personaId: string) {
  const data = await getSheetData("Persona_Prompts!A:H");
  if (!data || data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows
    .map((row) => {
      const prompt: Record<string, string> = {};
      headers.forEach((header, index) => {
        prompt[header] = row[index] || "";
      });
      return prompt;
    })
    .filter((prompt) => prompt.persona_id === personaId);
}

export async function getVoiceProfiles(personaId: string) {
  const data = await getSheetData("Voice_Profiles!A:J");
  if (!data || data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows
    .map((row) => {
      const voice: Record<string, string> = {};
      headers.forEach((header, index) => {
        voice[header] = row[index] || "";
      });
      return voice;
    })
    .filter((voice) => voice.persona_id === personaId);
}

export async function getSocialAccounts(personaId: string) {
  const data = await getSheetData("Social_Accounts!A:G");
  if (!data || data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows
    .map((row) => {
      const account: Record<string, string> = {};
      headers.forEach((header, index) => {
        account[header] = row[index] || "";
      });
      return account;
    })
    .filter((account) => account.persona_id === personaId);
}

export async function getJobQueue(personaId?: string) {
  const data = await getSheetData("Job_Queue!A:L");
  if (!data || data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  const jobs = rows.map((row) => {
    const job: Record<string, string> = {};
    headers.forEach((header, index) => {
      job[header] = row[index] || "";
    });
    return job;
  });

  if (personaId) {
    return jobs.filter((job) => job.persona_id === personaId);
  }
  return jobs;
}

export async function addJob(job: Record<string, string>) {
  const values = [
    job.job_id,
    job.persona_id,
    job.job_type,
    job.priority,
    job.status,
    job.scheduled_for,
    job.parameters,
    job.created_at,
    job.started_at || "",
    job.completed_at || "",
    job.result || "",
    job.error || "",
  ];
  await appendRow("Job_Queue", values);
}

export async function getCronSchedules(personaId?: string) {
  const data = await getSheetData("Cron_Schedules!A:I");
  if (!data || data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  const schedules = rows.map((row) => {
    const schedule: Record<string, string> = {};
    headers.forEach((header, index) => {
      schedule[header] = row[index] || "";
    });
    return schedule;
  });

  if (personaId) {
    return schedules.filter((s) => s.persona_id === personaId || s.persona_id === "*");
  }
  return schedules;
}

export async function getContentCalendar(personaId?: string) {
  const data = await getSheetData("Content_Calendar!A:L");
  if (!data || data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  const items = rows.map((row) => {
    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      item[header] = row[index] || "";
    });
    return item;
  });

  if (personaId) {
    return items.filter((item) => item.persona_id === personaId);
  }
  return items;
}

export async function addContentSlot(slot: Record<string, string>) {
  const values = [
    slot.slot_id,
    slot.persona_id,
    slot.scheduled_date,
    slot.scheduled_time,
    slot.platform,
    slot.content_type,
    slot.title,
    slot.description,
    slot.asset_ids || "",
    slot.status,
    slot.publish_url || "",
    slot.notes || "",
  ];
  await appendRow("Content_Calendar", values);
}

export async function getPersonaProfile(personaId: string) {
  const data = await getSheetData("Persona_Profiles!A:C");
  if (!data || data.length < 2) return null;

  const headers = data[0];
  const rows = data.slice(1);

  for (const row of rows) {
    if (row[0] === personaId) {
      try {
        return JSON.parse(row[1]);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export async function updateRow(
  sheetName: string,
  searchColumn: string,
  searchValue: string,
  updates: Record<string, string>
) {
  const sheetId = process.env.GOOGLE_SHEET_ID;

  // First, get all data to find the row
  const data = await getSheetData(`${sheetName}!A:Z`);
  if (!data || data.length < 2) {
    throw new Error("Sheet is empty or not found");
  }

  const headers = data[0];
  const searchColIndex = headers.indexOf(searchColumn);

  if (searchColIndex === -1) {
    throw new Error(`Column ${searchColumn} not found`);
  }

  // Find the row index (add 1 for header, add 1 for 1-based index)
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][searchColIndex] === searchValue) {
      rowIndex = i + 1; // 1-based index for Sheets API
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error(`Row with ${searchColumn}=${searchValue} not found`);
  }

  // Build the update values array
  const currentRow = data[rowIndex - 1];
  const newRow = headers.map((header, index) => {
    if (updates.hasOwnProperty(header)) {
      return updates[header];
    }
    return currentRow[index] || "";
  });

  // Update the row
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

export async function deleteRow(
  sheetName: string,
  searchColumn: string,
  searchValue: string
) {
  const sheetId = process.env.GOOGLE_SHEET_ID;

  // Get sheet metadata to find the sheet's gid
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
  });

  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );

  if (!sheet?.properties?.sheetId) {
    throw new Error(`Sheet ${sheetName} not found`);
  }

  // Find the row
  const data = await getSheetData(`${sheetName}!A:Z`);
  if (!data || data.length < 2) {
    throw new Error("Sheet is empty");
  }

  const headers = data[0];
  const searchColIndex = headers.indexOf(searchColumn);

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][searchColIndex] === searchValue) {
      rowIndex = i; // 0-based for delete request
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error(`Row not found`);
  }

  // Delete the row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });

  return { success: true };
}