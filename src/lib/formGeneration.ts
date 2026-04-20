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

export interface ProcessUploadedInput {
  originalFileName: string;
  mimeType: string;
  buffer: Buffer;
}

export interface ProcessUploadedResult {
  slug: string;
  route: string;
  pdfPath: string;
  uploadedAt: string;
  originalFileName: string;
  designer: unknown | null;
}

function toUploadExtension(mimeType: string) {
  if (mimeType === "image/jpeg") {
    return "jpg";
  }

  if (mimeType === "image/png") {
    return "png";
  }

  return "pdf";
}

function createEntityId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function callLiteLLM(fileBuffer: Buffer, mimeType: string = "application/pdf"): Promise<string> {
  const LITELLM_URL = process.env.LITELLM_URL || "http://localhost:4000";
  const LITELLM_API_KEY = process.env.LITELLM_API_KEY || "asdf";

  const base64Payload = fileBuffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64Payload}`;

  const response = await fetch(`${LITELLM_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LITELLM_API_KEY}`,
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

  content = content.replace(/^```json/gi, "").replace(/^```/gi, "").replace(/```$/g, "").trim();

  return content;
}

export async function processUploadedInput(input: ProcessUploadedInput): Promise<ProcessUploadedResult> {
  const timestamp = Date.now();
  const slug = createEntityId("generated");
  const uploadDir = path.join(process.cwd(), UPLOADED_FORMS_DIR_NAME);
  const extension = toUploadExtension(input.mimeType);
  const uploadFileName = `uploaded-${timestamp}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const uploadPath = path.join(uploadDir, uploadFileName);
  const relativeUploadPath = path.posix.join(UPLOADED_FORMS_DIR_NAME, uploadFileName);

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(uploadPath, input.buffer);

  const generatedJsonString = await callLiteLLM(input.buffer, input.mimeType || "application/pdf");

  const generatedDocumentPath = path.join(process.cwd(), "saved_digitalized_form", `${slug}.json`);
  await fs.mkdir(path.dirname(generatedDocumentPath), { recursive: true });
  await fs.writeFile(generatedDocumentPath, generatedJsonString, "utf8");

  const uploadedAt = new Date(timestamp).toISOString();

  await registerGeneratedForm({
    slug,
    route: `/generated/${slug}`,
    pdfPath: relativeUploadPath,
    originalFileName: input.originalFileName,
    uploadedAt,
  });

  let designer: unknown | null = null;

  try {
    designer = JSON.parse(generatedJsonString);
  } catch (error) {
    console.error("Failed to parse LLM generated JSON:", error);
  }

  return {
    slug,
    route: `/generated/${slug}`,
    pdfPath: relativeUploadPath,
    uploadedAt,
    originalFileName: input.originalFileName,
    designer,
  };
}

export async function processUploadedFile(file: File): Promise<ProcessUploadedResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return processUploadedInput({
    originalFileName: file.name,
    mimeType: file.type || "application/pdf",
    buffer,
  });
}
