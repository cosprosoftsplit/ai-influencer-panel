import { NextResponse } from "next/server";
import { getPersonas } from "@/lib/google-sheets";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const personas = await getPersonas();
    const persona = personas.find((p) => p.persona_id === id);

    if (!persona) {
      return NextResponse.json(
        { error: "Persona not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(persona);
  } catch (error) {
    console.error("Error fetching persona:", error);
    return NextResponse.json(
      { error: "Failed to fetch persona" },
      { status: 500 }
    );
  }
}