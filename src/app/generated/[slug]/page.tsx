import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { FormDesignerDocument } from "@/lib/formDesigner";
import { DynamicGeneratedForm } from "./DynamicGeneratedForm";
import { listGeneratedForms, readSavedGeneratedFormDesigner } from "@/lib/generatedFormsRegistry";
import { hydrateGeneratedFormDesigner } from "@/lib/generatedFormHydration";

export default async function GeneratedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let designerDoc: FormDesignerDocument | null = await readSavedGeneratedFormDesigner(slug);

  if (!designerDoc) {
    const forms = await listGeneratedForms();
    const form = forms.find((entry) => entry.slug === slug) ?? null;

    if (form) {
      designerDoc = await hydrateGeneratedFormDesigner(slug, form.originalFileName || form.pdfFileName);
    }
  }

  if (!designerDoc) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[480px]">
        <DynamicGeneratedForm designer={designerDoc} />
      </div>
    </div>
  );
}