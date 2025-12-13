import { NextResponse } from "next/server";
import { getContentCalendar, addContentSlot } from "@/lib/google-sheets";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get("persona_id") || undefined;
    const items = await getContentCalendar(personaId);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const slot = {
      slot_id: `slot_${Date.now()}`,
      persona_id: body.persona_id,
      scheduled_date: body.scheduled_date,
      scheduled_time: body.scheduled_time || "",
      platform: body.platform,
      content_type: body.content_type,
      title: body.title,
      description: body.description || "",
      asset_ids: body.asset_ids || "",
      status: body.status || "draft",
      publish_url: "",
      notes: body.notes || "",
    };

    await addContentSlot(slot);
    return NextResponse.json({ success: true, slot });
  } catch (error) {
    console.error("Error creating content slot:", error);
    return NextResponse.json(
      { error: "Failed to create content slot" },
      { status: 500 }
    );
  }
}