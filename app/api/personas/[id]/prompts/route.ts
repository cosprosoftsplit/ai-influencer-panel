import { NextResponse } from "next/server";
import { getPersonaPrompts } from "@/lib/google-sheets";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prompts = await getPersonaPrompts(id);
    return NextResponse.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}