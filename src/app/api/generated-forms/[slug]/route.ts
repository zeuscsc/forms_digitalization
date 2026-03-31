import { NextRequest, NextResponse } from "next/server";
import { hydrateGeneratedFormDesigner } from "@/lib/generatedFormHydration";
import { listGeneratedForms, readSavedGeneratedFormDesigner } from "@/lib/generatedFormsRegistry";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const forms = await listGeneratedForms();
    const form = forms.find((entry) => entry.slug === slug) ?? null;

    if (!form) {
      return NextResponse.json({ error: "Generated form not found." }, { status: 404 });
    }

    const savedDesigner = await readSavedGeneratedFormDesigner(slug);
    const designer = savedDesigner ?? (await hydrateGeneratedFormDesigner(slug, form.originalFileName || form.pdfFileName));

    if (!designer) {
      return NextResponse.json({ error: "Unable to hydrate the saved form into the studio." }, { status: 404 });
    }

    return NextResponse.json({ designer, form });
  } catch (error) {
    console.error("Error hydrating generated form:", error);
    return NextResponse.json({ error: "Unable to load the selected form into the studio." }, { status: 500 });
  }
}