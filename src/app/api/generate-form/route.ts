import { NextRequest, NextResponse } from "next/server";
import { processUploadedFile } from "../../../lib/formGeneration";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const generated = await processUploadedFile(file);

    return NextResponse.json({ 
      success: true, 
      message: "Form generated successfully",
      route: generated.route,
      slug: generated.slug,
      pdfPath: generated.pdfPath,
      uploadedAt: generated.uploadedAt,
      originalFileName: generated.originalFileName,
      designer: generated.designer,
    });

  } catch (error: any) {
    console.error("Error generating form:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during form generation" },
      { status: 500 }
    );
  }
}
