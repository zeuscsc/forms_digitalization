import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { registerGeneratedForm, UPLOADED_FORMS_DIR_NAME } from "@/lib/generatedFormsRegistry";

const SYSTEM_PROMPT = `
You are an expert form digitalization assistant. Your task is to process a PDF form and convert it into a JSON blueprint that conforms to the FormDesignerDocument interface.

Previously, we generated Next.js React components and Zod schemas directly. For context on how to map form fields to UI components:
- Text inputs mapped to \`<Input>\` (often 'text', 'email', 'tel', or 'date').
- Multiple choice options mapped to \`<RadioGroup>\` with \`<RadioButton>\` elements.
- Multiple selections mapped to \`Checkbox\`.
- Number selection mapped to \`<QuantitySelector>\`.
- Declarations mapped to a \`<Checkbox>\` or a specific \`<DeclarationStep>\` component.
- Sections corresponded to a \`<Card>\` with \`<SectionHeader>\`.
- The whole structure was divided into steps via a \`<Stepper>\`.

Now, instead of generating code, you must return a pure JSON object representing the document blueprint.

Your output MUST STRICTLY follow, and only use the structures from, this TypeScript interface:

\`\`\`typescript
export type DesignerFieldComponent =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "quantity"
  | "radio"
  | "checkbox"
  | "declaration";

export interface DesignerFieldOption {
  id: string;
  label: string;
  value: string;
}

interface DesignerFieldBase {
  id: string;
  key: string;
  label: string;
  helperText?: string;
  required?: boolean;
  component: DesignerFieldComponent;
}

export interface InputDesignerField extends DesignerFieldBase {
  component: "text" | "email" | "tel" | "date";
  placeholder?: string;
  defaultValue?: string;
}

export interface QuantityDesignerField extends DesignerFieldBase {
  component: "quantity";
  min?: number;
  max?: number;
  defaultValue?: number;
}

export interface RadioDesignerField extends DesignerFieldBase {
  component: "radio";
  options: DesignerFieldOption[];
  defaultValue?: string;
}

export interface CheckboxDesignerField extends DesignerFieldBase {
  component: "checkbox";
  checkboxLabel: string;
  defaultValue?: boolean;
}

export interface DeclarationDesignerField extends DesignerFieldBase {
  component: "declaration";
  checkboxLabel: string;
  documentTitle?: string;
  defaultValue?: boolean;
  requireScroll?: boolean;
}

export type DesignerField =
  | InputDesignerField
  | QuantityDesignerField
  | RadioDesignerField
  | CheckboxDesignerField
  | DeclarationDesignerField;

export interface DesignerSection {
  id: string;
  title: string;
  subtitle?: string;
  fields: DesignerField[];
}

export interface DesignerStep {
  id: string;
  title: string;
  description?: string;
  sections: DesignerSection[];
}

export interface DesignerTheme {
  appTitle: string;
  appSubtitle: string;
  submitLabel: string;
  accentLabel: string;
}

export interface FormDesignerDocument {
  id: string;
  name: string;
  summary: string;
  theme: DesignerTheme;
  steps: DesignerStep[];
}
\`\`\`

Generate and return ONLY valid JSON representing the \`FormDesignerDocument\`. Do not wrap the response in markdown code formatting blocks if possible.
`;

async function callLiteLLM(fileBuffer: Buffer): Promise<string> {
  const LITELLM_URL = process.env.LITELLM_URL || "http://localhost:4000";
  const LITELLM_API_KEY = process.env.LITELLM_API_KEY || "asdf";

  const base64Pdf = fileBuffer.toString("base64");
  const dataUri = `data:application/pdf;base64,${base64Pdf}`;

  const response = await fetch(`${LITELLM_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LITELLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: "pro",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this PDF form and convert it into the FormDesignerDocument JSON structure.",
            },
            {
              type: "image_url",
              image_url: {
                url: dataUri,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LiteLLM Error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content || "{}";

  // Automatically clean markdown formatting if LLM wrapped the JSON
  content = content.replace(/^```json/gi, "").replace(/^```/gi, "").replace(/```$/g, "").trim();

  return content;
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

    console.log(`Executing LiteLLM for ${slug}`);

    const generatedJsonString = await callLiteLLM(buffer);

    // Save the JSON generated by LLM to the saved_digitalized_form folder
    const generatedDocumentPath = path.join(process.cwd(), "saved_digitalized_form", `${slug}.json`);
    await fs.mkdir(path.dirname(generatedDocumentPath), { recursive: true });
    await fs.writeFile(generatedDocumentPath, generatedJsonString, "utf8");

    const uploadedAt = new Date(timestamp).toISOString();

    await registerGeneratedForm({
      slug,
      route: `/generated/${slug}`,
      pdfPath: relativePdfPath,
      originalFileName: file.name,
      uploadedAt,
    });

    let designer = null;
    try {
      designer = JSON.parse(generatedJsonString);
    } catch (e) {
      console.error("Failed to parse LLM generated JSON:", e);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Form generated successfully",
      route: `/generated/${slug}`,
      slug: slug,
      pdfPath: relativePdfPath,
      uploadedAt,
      originalFileName: file.name,
      designer
    });

  } catch (error: any) {
    console.error("Error generating form:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during form generation" },
      { status: 500 }
    );
  }
}
