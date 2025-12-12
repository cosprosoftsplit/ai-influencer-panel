import { NextResponse } from "next/server";
import { getVoiceProfiles } from "@/lib/google-sheets";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const voices = await getVoiceProfiles(id);
    return NextResponse.json(voices);
  } catch (error) {
    console.error("Error fetching voice profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch voice profiles" },
      { status: 500 }
    );
  }
}