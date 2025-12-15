import { NextResponse } from "next/server";
import { updateRow, deleteRow } from "@/lib/google-sheets";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await updateRow("Content_Calendar", "slot_id", id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating calendar slot:", error);
    return NextResponse.json(
      { error: "Failed to update slot" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await deleteRow("Content_Calendar", "slot_id", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return NextResponse.json(
      { error: "Failed to delete slot" },
      { status: 500 }
    );
  }
}