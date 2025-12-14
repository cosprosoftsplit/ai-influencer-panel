import { NextResponse } from "next/server";
import { getSheetData, appendRow } from "@/lib/google-sheets";

export async function GET() {
  try {
    const data = await getSheetData("Platform_Accounts!A:L");
    if (!data || data.length < 2) return NextResponse.json([]);

    const headers = data[0];
    const rows = data.slice(1);

    const accounts = rows.map((row) => {
      const account: Record<string, string> = {};
      headers.forEach((header, index) => {
        account[header] = row[index] || "";
      });
      return account;
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const values = [
      `acc_${Date.now()}`,
      body.persona_id,
      body.platform,
      body.email || "",
      body.handle || "",
      body.password_ref || "",
      body.gologin_profile_id || "",
      body.proxy_region || "",
      body.status || "planned",
      "0",
      new Date().toISOString().split("T")[0],
      body.notes || "",
    ];

    await appendRow("Platform_Accounts", values);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}