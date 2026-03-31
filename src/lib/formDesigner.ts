import { z } from "zod";

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

export interface DesignerSelection {
  type: "step" | "section" | "field";
  stepId: string;
  sectionId?: string;
  fieldId?: string;
}

export interface DevicePreset {
  id: string;
  label: string;
  frameClassName: string;
  shellClassName: string;
  resolutionLabel: string;
}

export interface DesignerComponentTemplate {
  type: DesignerFieldComponent;
  label: string;
  description: string;
  createField: () => DesignerField;
}

const designerFieldOptionSchema = z.object({
  id: z.string().min(1, "Option id is required."),
  label: z.string(),
  value: z.string(),
});

const inputDesignerFieldSchema = z.object({
  id: z.string().min(1, "Field id is required."),
  key: z.string().min(1, "Field key is required."),
  label: z.string().min(1, "Field label is required."),
  helperText: z.string().optional(),
  required: z.boolean().optional(),
  component: z.enum(["text", "email", "tel", "date"]),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
});

const quantityDesignerFieldSchema = z.object({
  id: z.string().min(1, "Field id is required."),
  key: z.string().min(1, "Field key is required."),
  label: z.string().min(1, "Field label is required."),
  helperText: z.string().optional(),
  required: z.boolean().optional(),
  component: z.literal("quantity"),
  min: z.number().optional(),
  max: z.number().optional(),
  defaultValue: z.number().optional(),
});

const radioDesignerFieldSchema = z.object({
  id: z.string().min(1, "Field id is required."),
  key: z.string().min(1, "Field key is required."),
  label: z.string().min(1, "Field label is required."),
  helperText: z.string().optional(),
  required: z.boolean().optional(),
  component: z.literal("radio"),
  options: z.array(designerFieldOptionSchema),
  defaultValue: z.string().optional(),
});

const checkboxDesignerFieldSchema = z.object({
  id: z.string().min(1, "Field id is required."),
  key: z.string().min(1, "Field key is required."),
  label: z.string().min(1, "Field label is required."),
  helperText: z.string().optional(),
  required: z.boolean().optional(),
  component: z.literal("checkbox"),
  checkboxLabel: z.string().min(1, "Checkbox label is required."),
  defaultValue: z.boolean().optional(),
});

const declarationDesignerFieldSchema = z.object({
  id: z.string().min(1, "Field id is required."),
  key: z.string().min(1, "Field key is required."),
  label: z.string().min(1, "Field label is required."),
  helperText: z.string().optional(),
  required: z.boolean().optional(),
  component: z.literal("declaration"),
  checkboxLabel: z.string().min(1, "Declaration checkbox label is required."),
  documentTitle: z.string().optional(),
  defaultValue: z.boolean().optional(),
  requireScroll: z.boolean().optional(),
});

const designerFieldSchema = z.discriminatedUnion("component", [
  inputDesignerFieldSchema,
  quantityDesignerFieldSchema,
  radioDesignerFieldSchema,
  checkboxDesignerFieldSchema,
  declarationDesignerFieldSchema,
]);

const designerSectionSchema = z.object({
  id: z.string().min(1, "Section id is required."),
  title: z.string().min(1, "Section title is required."),
  subtitle: z.string().optional(),
  fields: z.array(designerFieldSchema),
});

const designerStepSchema = z.object({
  id: z.string().min(1, "Step id is required."),
  title: z.string().min(1, "Step title is required."),
  description: z.string().optional(),
  sections: z.array(designerSectionSchema),
});

const designerThemeSchema = z.object({
  appTitle: z.string(),
  appSubtitle: z.string(),
  submitLabel: z.string(),
  accentLabel: z.string(),
});

const formDesignerDocumentSchema = z.object({
  id: z.string().min(1, "Designer id is required."),
  name: z.string().min(1, "Designer name is required."),
  summary: z.string(),
  theme: designerThemeSchema,
  steps: z.array(designerStepSchema),
});

let idCounter = 0;

function createId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function collectMaxIdSuffix(value: string, currentMax: number) {
  const match = value.match(/-(\d+)$/);

  if (!match) {
    return currentMax;
  }

  return Math.max(currentMax, Number(match[1]));
}

export const DEVICE_PRESETS: DevicePreset[] = [
  {
    id: "pixel-7",
    label: "Pixel 7",
    frameClassName: "h-[780px] w-[375px]",
    shellClassName: "rounded-[3.5rem] border-[12px]",
    resolutionLabel: "1080 x 2400",
  },
  {
    id: "iphone-14",
    label: "iPhone 14",
    frameClassName: "h-[760px] w-[390px]",
    shellClassName: "rounded-[3.75rem] border-[13px]",
    resolutionLabel: "1170 x 2532",
  },
  {
    id: "compact",
    label: "Compact",
    frameClassName: "h-[700px] w-[360px]",
    shellClassName: "rounded-[3.25rem] border-[11px]",
    resolutionLabel: "1080 x 2280",
  },
];

export const COMPONENT_LIBRARY: DesignerComponentTemplate[] = [
  {
    type: "text",
    label: "Input",
    description: "Single-line text field using the shared Input component.",
    createField: () => ({
      id: createId("field"),
      key: createId("text_value"),
      label: "New text field",
      component: "text",
      placeholder: "Type here",
      helperText: "Captured as free text.",
      required: false,
      defaultValue: "",
    }),
  },
  {
    type: "email",
    label: "Email",
    description: "Email input with keyboard optimization and validation.",
    createField: () => ({
      id: createId("field"),
      key: createId("email_value"),
      label: "Email address",
      component: "email",
      placeholder: "name@example.com",
      helperText: "Used for confirmations and follow-up.",
      required: true,
      defaultValue: "",
    }),
  },
  {
    type: "tel",
    label: "Phone",
    description: "Telephone input using the shared Input component.",
    createField: () => ({
      id: createId("field"),
      key: createId("phone_value"),
      label: "Phone number",
      component: "tel",
      placeholder: "+852 1234 5678",
      helperText: "Supports local and international formats.",
      required: true,
      defaultValue: "",
    }),
  },
  {
    type: "date",
    label: "Date",
    description: "Date picker input for milestone or policy dates.",
    createField: () => ({
      id: createId("field"),
      key: createId("date_value"),
      label: "Effective date",
      component: "date",
      helperText: "Use the customer-facing effective date.",
      required: true,
      defaultValue: "",
    }),
  },
  {
    type: "quantity",
    label: "Quantity Selector",
    description: "Counter control backed by the shared QuantitySelector component.",
    createField: () => ({
      id: createId("field"),
      key: createId("quantity_value"),
      label: "Number of dependants",
      component: "quantity",
      helperText: "Keeps values between an allowed minimum and maximum.",
      required: true,
      min: 0,
      max: 10,
      defaultValue: 1,
    }),
  },
  {
    type: "radio",
    label: "Radio Group",
    description: "Single-choice options using the shared RadioGroup component.",
    createField: () => ({
      id: createId("field"),
      key: createId("radio_value"),
      label: "Preferred contact method",
      component: "radio",
      helperText: "Select one of the approved communication channels.",
      required: true,
      defaultValue: "email",
      options: [
        { id: createId("option"), label: "Email", value: "email" },
        { id: createId("option"), label: "Phone", value: "phone" },
        { id: createId("option"), label: "SMS", value: "sms" },
      ],
    }),
  },
  {
    type: "checkbox",
    label: "Checkbox",
    description: "Consent toggle using the shared Checkbox component.",
    createField: () => ({
      id: createId("field"),
      key: createId("checkbox_value"),
      label: "Consent",
      component: "checkbox",
      helperText: "Use this for terms, declarations, or optional consent.",
      required: true,
      checkboxLabel: "I confirm the information provided is accurate.",
      defaultValue: false,
    }),
  },
  {
    type: "declaration",
    label: "Declaration",
    description: "Scrollable terms block with gated acceptance using the shared Declaration component.",
    createField: () => ({
      id: createId("field"),
      key: createId("declaration_value"),
      label: "Review and declaration",
      component: "declaration",
      helperText: "Customers must review the declaration before submitting.",
      required: true,
      checkboxLabel: "I confirm the information provided is true and complete.",
      documentTitle: "Declaration and Consent",
      defaultValue: false,
      requireScroll: true,
    }),
  },
];

export function createBlankDesigner(): FormDesignerDocument {
  return {
    id: createId("designer"),
    name: "Untitled mobile form",
    summary: "Start from a blank workspace and compose the mobile journey step by step.",
    theme: {
      appTitle: "New Form",
      appSubtitle: "Add your first step to start building the mobile experience.",
      submitLabel: "Submit Test Payload",
      accentLabel: "Blank canvas",
    },
    steps: [],
  };
}

export function createDefaultDesigner(): FormDesignerDocument {
  return {
    id: createId("designer"),
    name: "Mobile Claim Intake",
    summary: "High-confidence mobile form workspace for review, editing, and testing.",
    theme: {
      appTitle: "Claim Intake",
      appSubtitle: "Design the mobile flow, copy, and validation before publishing.",
      submitLabel: "Submit Test Payload",
      accentLabel: "Live preview",
    },
    steps: [
      {
        id: createId("step"),
        title: "Customer details",
        description: "Collect identity and contact details needed to start the claim.",
        sections: [
          {
            id: createId("section"),
            title: "Primary contact",
            subtitle: "Core information shown on the first mobile screen.",
            fields: [
              {
                id: createId("field"),
                key: "fullName",
                label: "Full name",
                component: "text",
                placeholder: "As shown on official ID",
                helperText: "Use the policy holder or claimant's legal name.",
                required: true,
                defaultValue: "",
              },
              {
                id: createId("field"),
                key: "emailAddress",
                label: "Email address",
                component: "email",
                placeholder: "name@example.com",
                helperText: "Used to send claim updates.",
                required: true,
                defaultValue: "",
              },
              {
                id: createId("field"),
                key: "phoneNumber",
                label: "Phone number",
                component: "tel",
                placeholder: "+852 1234 5678",
                helperText: "Needed if the servicing team has follow-up questions.",
                required: true,
                defaultValue: "",
              },
            ],
          },
        ],
      },
      {
        id: createId("step"),
        title: "Claim specifics",
        description: "Set the information and declarations the reviewer will test.",
        sections: [
          {
            id: createId("section"),
            title: "Claim setup",
            subtitle: "Example controls from the shared component library.",
            fields: [
              {
                id: createId("field"),
                key: "incidentDate",
                label: "Incident date",
                component: "date",
                helperText: "Required to anchor the claim timeline.",
                required: true,
                defaultValue: "",
              },
              {
                id: createId("field"),
                key: "dependants",
                label: "Number of dependants",
                component: "quantity",
                helperText: "Demonstrates a specialized mobile control.",
                required: true,
                min: 0,
                max: 8,
                defaultValue: 1,
              },
              {
                id: createId("field"),
                key: "contactPreference",
                label: "Preferred contact method",
                component: "radio",
                helperText: "This uses the shared RadioGroup component.",
                required: true,
                defaultValue: "email",
                options: [
                  { id: createId("option"), label: "Email", value: "email" },
                  { id: createId("option"), label: "Phone", value: "phone" },
                  { id: createId("option"), label: "SMS", value: "sms" },
                ],
              },
              {
                id: createId("field"),
                key: "declarationAccepted",
                label: "Declaration",
                component: "declaration",
                helperText: "Required before testers can submit the payload.",
                required: true,
                checkboxLabel: "I confirm the claim information is correct.",
                documentTitle: "Claim declaration",
                defaultValue: false,
                requireScroll: true,
              },
            ],
          },
        ],
      },
    ],
  };
}

export function createEmptyStep(): DesignerStep {
  return {
    id: createId("step"),
    title: "New step",
    description: "Describe the purpose of this mobile screen.",
    sections: [createEmptySection()],
  };
}

export function createEmptySection(): DesignerSection {
  return {
    id: createId("section"),
    title: "New section",
    subtitle: "Add guidance for the section content.",
    fields: [],
  };
}

export function createFieldFromComponent(type: DesignerFieldComponent): DesignerField {
  const template = COMPONENT_LIBRARY.find((entry) => entry.type === type);

  if (!template) {
    throw new Error(`Unknown component type: ${type}`);
  }

  return template.createField();
}

export function cloneDesigner(document: FormDesignerDocument): FormDesignerDocument {
  return structuredClone(document);
}

export function parseDesignerDocument(value: unknown): FormDesignerDocument {
  return formDesignerDocumentSchema.parse(value);
}

export function synchronizeDesignerIdCounter(document: FormDesignerDocument) {
  let maxIdSuffix = 0;

  maxIdSuffix = collectMaxIdSuffix(document.id, maxIdSuffix);

  for (const step of document.steps) {
    maxIdSuffix = collectMaxIdSuffix(step.id, maxIdSuffix);

    for (const section of step.sections) {
      maxIdSuffix = collectMaxIdSuffix(section.id, maxIdSuffix);

      for (const field of section.fields) {
        maxIdSuffix = collectMaxIdSuffix(field.id, maxIdSuffix);
        maxIdSuffix = collectMaxIdSuffix(field.key, maxIdSuffix);

        if (field.component === "radio") {
          for (const option of field.options) {
            maxIdSuffix = collectMaxIdSuffix(option.id, maxIdSuffix);
            maxIdSuffix = collectMaxIdSuffix(option.value, maxIdSuffix);
          }
        }
      }
    }
  }

  idCounter = Math.max(idCounter, maxIdSuffix);
}