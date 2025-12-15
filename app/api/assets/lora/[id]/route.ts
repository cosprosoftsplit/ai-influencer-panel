import { NextResponse } from "next/server";
import { updateAssetsRow } from "@/lib/google-sheets-assets";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await updateAssetsRow("LoRA_Training", "image_id", id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating LoRA image:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}