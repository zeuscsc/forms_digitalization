import { NextResponse } from "next/server";
import type { FormDesignerDocument } from "@/lib/formDesigner";
import { listGeneratedForms, saveGeneratedFormDesigner } from "@/lib/generatedFormsRegistry";

interface SaveGeneratedFormRequest {
  slug?: string;
  route?: string;
  pdfPath?: string;
  originalFileName?: string;
  displayName?: string;
  designer?: FormDesignerDocument;
}

function isDesignerDocument(value: unknown): value is FormDesignerDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<FormDesignerDocument>;
  return typeof candidate.id === "string" && typeof candidate.name === "string" && Array.isArray(candidate.steps);
}

export async function GET() {
  try {
    const forms = await listGeneratedForms();
    return NextResponse.json({ forms });
  } catch (error) {
    console.error("Error loading generated forms:", error);
    return NextResponse.json({ error: "Unable to load previously uploaded forms." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaveGeneratedFormRequest;

    if (!isDesignerDocument(body.designer)) {
      return NextResponse.json({ error: "A valid designer document is required." }, { status: 400 });
    }

    const saved = await saveGeneratedFormDesigner({
      slug: body.slug,
      route: body.route,
      pdfPath: body.pdfPath,
      originalFileName: body.originalFileName,
      displayName: body.displayName,
      designer: body.designer,
    });
    const forms = await listGeneratedForms();
    const form = forms.find((entry) => entry.slug === saved.slug) ?? null;

    return NextResponse.json({ form });
  } catch (error) {
    console.error("Error saving generated form:", error);
    return NextResponse.json({ error: "Unable to save the current form designer draft." }, { status: 500 });
  }
}