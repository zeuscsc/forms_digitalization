import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Prepare paths
    const timestamp = Date.now();
    const slug = `generated-${timestamp}`;
    const uploadDir = path.join(process.cwd(), "raw_forms");
    const pdfPath = path.join(uploadDir, `uploaded-${timestamp}.pdf`);
    
    // Save PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(pdfPath, buffer);

    const relativePdfPath = `raw_forms\\uploaded-${timestamp}.pdf`;
    const commandArgs = `PDF: ${relativePdfPath}, Slug: ${slug}`;

    const isWin = process.platform === "win32";
    
    let command = `gemini digitalize "${commandArgs}" -y`;

    console.log(`Executing: ${command}`);
    
    // Wait for the CLI to finish generating the files
    const { stdout, stderr } = await execPromise(command, { 
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer just in case
    });

    console.log("gemini-cli output:", stdout);
    if (stderr) {
      console.error("gemini-cli stderr:", stderr);
    }

    // After generation, verify the expected page file was created
    const expectedPageFile = path.join(process.cwd(), "src", "app", "generated", slug, "page.tsx");
    try {
      await fs.access(expectedPageFile);
    } catch {
      console.error(`Expected file was not created: ${expectedPageFile}`);
      return NextResponse.json(
        { error: "Generation completed, but the expected page file was not found." },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Form generated successfully",
      route: `/generated/${slug}`,
      slug: slug,
      pdfPath: relativePdfPath
    });

  } catch (error: any) {
    console.error("Error generating form:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during form generation" },
      { status: 500 }
    );
  }
}
