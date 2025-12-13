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