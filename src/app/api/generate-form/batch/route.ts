import { NextRequest, NextResponse } from "next/server";
import { generationBatchQueue, type EnqueueUploadFile } from "@/lib/generationBatchQueue";

function isSupportedType(mimeType: string) {
  return mimeType === "application/pdf" || mimeType === "image/jpeg" || mimeType === "image/png";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const multiFiles = formData.getAll("files");
    const singleFile = formData.get("file");

    const files = (multiFiles.length > 0 ? multiFiles : singleFile ? [singleFile] : []).filter(
      (entry): entry is File => entry instanceof File
    );

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }

    const invalidFile = files.find((file) => !isSupportedType(file.type || "application/pdf"));

    if (invalidFile) {
      return NextResponse.json(
        { error: `Unsupported file type for ${invalidFile.name}.` },
        { status: 400 }
      );
    }

    const uploadFiles: EnqueueUploadFile[] = await Promise.all(
      files.map(async (file) => ({
        originalFileName: file.name,
        mimeType: file.type || "application/pdf",
        buffer: Buffer.from(await file.arrayBuffer()),
      }))
    );

    const batch = generationBatchQueue.enqueueBatch(uploadFiles);

    return NextResponse.json({
      success: true,
      message: "Batch accepted for processing.",
      batch,
      polling: {
        statusUrl: `/api/generate-form/batch/${batch?.id}`,
      },
      limits: generationBatchQueue.getConfig(),
    });
  } catch (error: any) {
    console.error("Error creating generation batch:", error);
    return NextResponse.json(
      { error: error.message || "Unable to create generation batch." },
      { status: 500 }
    );
  }
}
