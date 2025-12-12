import { NextResponse } from "next/server";
import { getPersonas } from "@/lib/google-sheets";

export async function GET() {
  try {
    const personas = await getPersonas();
    return NextResponse.json(personas);
  } catch (error) {
    console.error("Error fetching personas:", error);
    return NextResponse.json(
      { error: "Failed to fetch personas" },
      { status: 500 }
    );
  }
}