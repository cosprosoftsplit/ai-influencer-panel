import { NextResponse } from "next/server";
import { getSocialAccounts } from "@/lib/google-sheets";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accounts = await getSocialAccounts(id);
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching social accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch social accounts" },
      { status: 500 }
    );
  }
}