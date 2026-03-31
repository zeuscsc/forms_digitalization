import { promises as fs } from "fs";
import path from "path";
import type {
  DesignerField,
  FormDesignerDocument,
} from "@/lib/formDesigner";

interface ParsedSchemaField {
  key: string;
  schema: string;
  sectionTitle: string;
}

function createId(prefix: string, slug: string, index: number) {
  return `${prefix}-${slug}-${index}`;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function humanizeKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/\bId\b/g, "ID")
    .replace(/\bDob\b/g, "DOB")
    .replace(/\bNo\b/g, "No")
    .trim()
    .replace(/^./, (value) => value.toUpperCase());
}

function inferComponent(key: string, schema: string): "text" | "email" | "tel" | "date" | "checkbox" {
  const normalizedKey = key.toLowerCase();
  const normalizedSchema = schema.toLowerCase();

  if (normalizedSchema.includes("z.boolean")) {
    return "checkbox";
  }

  if (normalizedSchema.includes("email(")) {
    return "email";
  }

  if (normalizedKey.includes("date") || normalizedKey === "dob") {
    return "date";
  }

  if (
    normalizedKey.includes("phone") ||
    normalizedKey.includes("tel") ||
    normalizedKey.includes("mobile") ||
    normalizedKey.includes("contactno")
  ) {
    return "tel";
  }

  return "text";
}

function inferRequired(schema: string) {
  return schema.includes(".min(1") || schema.includes("refine((val) => val === true") || schema.includes("refine((value) => value === true");
}

function buildField(slug: string, index: number, entry: ParsedSchemaField): DesignerField {
  const label = humanizeKey(entry.key);
  const component = inferComponent(entry.key, entry.schema);
  const required = inferRequired(entry.schema);

  if (component === "checkbox") {
    return {
      id: createId("field", slug, index),
      key: entry.key,
      label,
      component,
      required,
      helperText: required ? "Required confirmation loaded from the generated schema." : "Loaded from the generated schema.",
      checkboxLabel: label,
      defaultValue: false,
    };
  }

  const helperText = entry.schema.includes("z.array(z.string())")
    ? "Generated schema expects multiple values. Use comma-separated values in this studio preview."
    : required
      ? "Required field loaded from the generated schema."
      : "Optional field loaded from the generated schema.";

  return {
    id: createId("field", slug, index),
    key: entry.key,
    label,
    component,
    required,
    helperText,
    placeholder: label,
    defaultValue: "",
  };
}

function parseSchemaFields(source: string) {
  const lines = source.split(/\r?\n/);
  const fields: ParsedSchemaField[] = [];
  let currentSectionTitle = "Generated fields";

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line.startsWith("//")) {
      currentSectionTitle = line.replace(/^\/\/\s*/, "").replace(/^Section\s+\d+\s*:\s*/i, "").trim() || currentSectionTitle;
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_]+):\s*(.+),$/);

    if (!match) {
      continue;
    }

    fields.push({
      key: match[1],
      schema: match[2],
      sectionTitle: currentSectionTitle,
    });
  }

  return fields;
}

export async function hydrateGeneratedFormDesigner(slug: string, originalFileName?: string): Promise<FormDesignerDocument | null> {
  const schemaPath = path.join(process.cwd(), "src", "lib", "schemas", "generated", `${slug}.ts`);

  try {
    const schemaSource = await fs.readFile(schemaPath, "utf8");
    const parsedFields = parseSchemaFields(schemaSource);

    if (parsedFields.length === 0) {
      return null;
    }

    const groupedSections = new Map<string, ParsedSchemaField[]>();

    for (const field of parsedFields) {
      const bucket = groupedSections.get(field.sectionTitle) ?? [];
      bucket.push(field);
      groupedSections.set(field.sectionTitle, bucket);
    }

    const displayName = sanitizeFileName(originalFileName ?? slug);
    let sectionIndex = 0;
    let fieldIndex = 0;

    return {
      id: `designer-${slug}`,
      name: displayName || slug,
      summary: `Loaded from generated schema ${slug}. You can now refine the structure and preview in the studio.`,
      theme: {
        appTitle: displayName || "Generated Form",
        appSubtitle: "Loaded from a previously uploaded form. Adjust sections, labels, and validation here.",
        submitLabel: "Submit Test Payload",
        accentLabel: "Loaded form",
      },
      steps: Array.from(groupedSections.entries()).map(([sectionTitle, fields]) => {
        sectionIndex += 1;

        return {
          id: createId("step", slug, sectionIndex),
          title: humanizeKey(sectionTitle),
          description: `Generated from the saved schema section: ${sectionTitle}.`,
          sections: [
            {
              id: createId("section", slug, sectionIndex),
              title: humanizeKey(sectionTitle),
              subtitle: "Mapped into the studio editor for in-place review and iteration.",
              fields: fields.map((field) => {
                fieldIndex += 1;
                return buildField(slug, fieldIndex, field);
              }),
            },
          ],
        };
      }),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}