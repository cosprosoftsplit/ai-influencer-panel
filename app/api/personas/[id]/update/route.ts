import { NextResponse } from "next/server";
import { updateRow } from "@/lib/google-sheets";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Update basic persona info
    if (body.basic) {
      await updateRow("Personas", "persona_id", id, body.basic);
    }

    // Update full profile JSON
    if (body.profile) {
      await updateRow("Persona_Profiles", "persona_id", id, {
        profile_json: JSON.stringify(body.profile),
        updated_at: new Date().toISOString().split("T")[0],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating persona:", error);
    return NextResponse.json(
      { error: "Failed to update persona" },
      { status: 500 }
    );
  }
}