import { NextResponse } from "next/server";
import { getLoRATrainingImages, addLoRATrainingImage, updateAssetsRow } from "@/lib/google-sheets-assets";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get("persona_id") || undefined;
    const images = await getLoRATrainingImages(personaId);
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching LoRA images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const image = {
      image_id: `img_${Date.now()}`,
      persona_id: body.persona_id,
      bucket: body.bucket,
      prompt: body.prompt,
      caption: body.caption || "",
      drive_url: body.drive_url || "",
      drive_file_id: body.drive_file_id || "",
      version_target: body.version_target || "v0.1",
      status: body.status || "generated",
      score_identity: body.score_identity || "",
      score_style: body.score_style || "",
      notes: body.notes || "",
      created_at: new Date().toISOString().split("T")[0],
    };

    await addLoRATrainingImage(image);
    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error("Error adding LoRA image:", error);
    return NextResponse.json(
      { error: "Failed to add image" },
      { status: 500 }
    );
  }
}