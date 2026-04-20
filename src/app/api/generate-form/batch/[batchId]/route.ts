import { NextRequest, NextResponse } from "next/server";
import { generationBatchQueue } from "@/lib/generationBatchQueue";
import { readGenerationBatchSnapshot } from "@/lib/generationBatchRegistry";

interface RouteContext {
  params: Promise<{
    batchId: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { batchId } = await context.params;
    const batch = generationBatchQueue.getBatch(batchId) ?? (await readGenerationBatchSnapshot(batchId));

    if (!batch) {
      return NextResponse.json({ error: "Batch not found." }, { status: 404 });
    }

    return NextResponse.json({ batch });
  } catch (error: any) {
    console.error("Error loading batch status:", error);
    return NextResponse.json(
      { error: error.message || "Unable to load batch status." },
      { status: 500 }
    );
  }
}
