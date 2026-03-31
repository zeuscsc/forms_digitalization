import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";
import { LEGACY_UPLOADED_FORMS_DIR_NAME, registerGeneratedForm, UPLOADED_FORMS_DIR_NAME } from "@/lib/generatedFormsRegistry";

interface GeminiRunResult {
  stdout: string;
  stderr: string;
}

function trimOutput(output: string) {
  const normalized = output.trim();

  if (normalized.length <= 1200) {
    return normalized;
  }

  return `${normalized.slice(-1200)}`;
}

function escapePromptPath(filePath: string) {
  return filePath.split(path.sep).join("/");
}

async function buildGeminiPrompt(relativePdfPath: string, slug: string) {
  const promptPath = path.join(process.cwd(), "prompts", "init.llm.prompt");
  const basePrompt = await fs.readFile(promptPath, "utf8");
  const normalizedPdfPath = escapePromptPath(relativePdfPath);
  const generatedPagePath = `src/app/generated/${slug}/page.tsx`;
  const generatedSchemaPath = `src/lib/schemas/generated/${slug}.ts`;
  const updatedBasePrompt = basePrompt.replace(
    new RegExp(`(${LEGACY_UPLOADED_FORMS_DIR_NAME}|${UPLOADED_FORMS_DIR_NAME})[\\\\/]+AccidentSuranceClaimForm\\.pdf`, "g"),
    normalizedPdfPath
  );

  return [
    `Work inside this Next.js repository and digitalize the uploaded PDF at \"${normalizedPdfPath}\".`,
    `Create or update these files for the new generated route:`,
    `- ${generatedPagePath}`,
    `- ${generatedSchemaPath}`,
    `The generated page must import its schema from \"@/lib/schemas/generated/${slug}\".`,
    `Reuse the shared components under src/components/ui and match the styling guidance in the figma folder.`,
    `Do not modify unrelated files unless a small import or route fix is required for the generated page to compile.`,
    `When you finish, make sure the generated route path is /generated/${slug}.`,
    "",
    updatedBasePrompt,
  ].join("\n");
}

async function runGemini(prompt: string): Promise<GeminiRunResult> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === "win32";
    const command = isWindows ? "powershell.exe" : "gemini";
    const args = isWindows
      ? [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          path.join(process.env.APPDATA ?? "", "npm", "gemini.ps1"),
          "-p",
          "stdin",
          "-y",
          "-o",
          "text",
        ]
      : ["-p", "stdin", "-y", "-o", "text"];

    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      shell: false,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.stdin.write(prompt);
    child.stdin.end();

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const failure = new Error(trimOutput(stderr || stdout) || `Gemini CLI exited with code ${code}`);
      reject(failure);
    });
  });
}

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
    const uploadDir = path.join(process.cwd(), UPLOADED_FORMS_DIR_NAME);
    const pdfPath = path.join(uploadDir, `uploaded-${timestamp}.pdf`);
    const relativePdfPath = path.posix.join(UPLOADED_FORMS_DIR_NAME, `uploaded-${timestamp}.pdf`);

    await fs.mkdir(uploadDir, { recursive: true });
    
    // Save PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(pdfPath, buffer);

    const prompt = await buildGeminiPrompt(relativePdfPath, slug);
    console.log(`Executing Gemini CLI for ${slug}`);

    const { stdout, stderr } = await runGemini(prompt);

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

    const uploadedAt = new Date(timestamp).toISOString();

    await registerGeneratedForm({
      slug,
      route: `/generated/${slug}`,
      pdfPath: relativePdfPath,
      originalFileName: file.name,
      uploadedAt,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Form generated successfully",
      route: `/generated/${slug}`,
      slug: slug,
      pdfPath: relativePdfPath,
      uploadedAt,
      originalFileName: file.name
    });

  } catch (error: any) {
    console.error("Error generating form:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during form generation" },
      { status: 500 }
    );
  }
}
