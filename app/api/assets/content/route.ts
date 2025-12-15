import { NextResponse } from "next/server";
import { getGeneratedContent, addGeneratedContent } from "@/lib/google-sheets-assets";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get("persona_id") || undefined;
    const content = await getGeneratedContent(personaId);
    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const content = {
      content_id: `content_${Date.now()}`,
      persona_id: body.persona_id,
      content_type: body.content_type,
      prompt: body.prompt,
      drive_url: body.drive_url || "",
      drive_file_id: body.drive_file_id || "",
      platform: body.platform || "",
      calendar_slot_id: body.calendar_slot_id || "",
      status: body.status || "generated",
      created_at: new Date().toISOString().split("T")[0],
      notes: body.notes || "",
    };

    await addGeneratedContent(content);
    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Error adding content:", error);
    return NextResponse.json(
      { error: "Failed to add content" },
      { status: 500 }
    );
  }
}