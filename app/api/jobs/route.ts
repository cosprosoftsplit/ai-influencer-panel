import { NextResponse } from "next/server";
import { getJobQueue, addJob } from "@/lib/google-sheets";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get("persona_id") || undefined;
    const jobs = await getJobQueue(personaId);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const job = {
      job_id: `job_${Date.now()}`,
      persona_id: body.persona_id,
      job_type: body.job_type,
      priority: body.priority || "3",
      status: "queued",
      scheduled_for: body.scheduled_for || "",
      parameters: JSON.stringify(body.parameters || {}),
      created_at: new Date().toISOString(),
    };

    await addJob(job);
    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}