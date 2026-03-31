import type {
  DesignerField,
  DesignerSelection,
  DesignerStep,
  FormDesignerDocument,
} from "@/lib/formDesigner";

export interface ActivityLogEntry {
  id: string;
  message: string;
  time: string;
}

export interface RecentGeneratedForm {
  slug: string;
  route: string;
  pdfPath: string;
  pdfFileName: string;
  originalFileName: string;
  displayName: string;
  uploadedAt: string;
  lastSavedAt?: string;
  lastUpdatedAt: string;
  hasGeneratedPage: boolean;
  hasSchema: boolean;
  hasSavedDesigner: boolean;
}

export interface GeneratedFormHydrationResult {
  designer: FormDesignerDocument;
  form: RecentGeneratedForm;
}

export interface SaveGeneratedFormResponse {
  form?: RecentGeneratedForm | null;
  error?: string;
}

export interface SelectionSnapshot {
  step: DesignerStep | null;
  section: FormDesignerDocument["steps"][number]["sections"][number] | null;
  field: DesignerField | null;
}

export function timestampLabel(date: Date = new Date()) {
  const hours = date.getHours();
  const displayHour = hours % 12 || 12;
  const minutes = date.getMinutes();
  const meridiem = hours >= 12 ? "PM" : "AM";

  return `${String(displayHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${meridiem}`;
}

export function sanitizeFileName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim();
}

export function createLogEntry(message: string): ActivityLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    time: timestampLabel(),
  };
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= items.length) {
    return;
  }

  const [item] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, item);
}

export function getFirstSelection(document: FormDesignerDocument): DesignerSelection | null {
  const firstStep = document.steps[0];

  if (!firstStep) {
    return null;
  }

  const firstSection = firstStep.sections[0];

  if (!firstSection) {
    return { type: "step", stepId: firstStep.id };
  }

  const firstField = firstSection.fields[0];

  if (!firstField) {
    return { type: "section", stepId: firstStep.id, sectionId: firstSection.id };
  }

  return {
    type: "field",
    stepId: firstStep.id,
    sectionId: firstSection.id,
    fieldId: firstField.id,
  };
}

export function findStep(document: FormDesignerDocument, stepId: string) {
  return document.steps.find((step) => step.id === stepId) ?? null;
}

export function ensureSelection(
  document: FormDesignerDocument,
  candidate: DesignerSelection | null
): DesignerSelection | null {
  if (document.steps.length === 0) {
    return null;
  }

  if (!candidate) {
    return getFirstSelection(document);
  }

  const step = findStep(document, candidate.stepId);

  if (!step) {
    return getFirstSelection(document);
  }

  if (candidate.type === "step") {
    return candidate;
  }

  const section = step.sections.find((entry) => entry.id === candidate.sectionId);

  if (!section) {
    return { type: "step", stepId: step.id };
  }

  if (candidate.type === "section") {
    return candidate;
  }

  const field = section.fields.find((entry) => entry.id === candidate.fieldId);

  if (!field) {
    return { type: "section", stepId: step.id, sectionId: section.id };
  }

  return candidate;
}

export function getSelectionSnapshot(
  document: FormDesignerDocument,
  selection: DesignerSelection | null
): SelectionSnapshot {
  if (!selection) {
    return { step: null, section: null, field: null };
  }

  const step = findStep(document, selection.stepId);
  const section = step?.sections.find((entry) => entry.id === selection.sectionId) ?? null;
  const field = section?.fields.find((entry) => entry.id === selection.fieldId) ?? null;

  return { step, section, field };
}

export function getActiveSectionSelection(document: FormDesignerDocument, selection: DesignerSelection | null) {
  const snapshot = getSelectionSnapshot(document, selection);

  if (snapshot.section) {
    return { stepId: snapshot.step?.id ?? document.steps[0]?.id ?? "", sectionId: snapshot.section.id };
  }

  const step = snapshot.step ?? document.steps[0];
  const firstSection = step?.sections[0];

  if (!step || !firstSection) {
    return null;
  }

  return { stepId: step.id, sectionId: firstSection.id };
}

export function textAreaClassName() {
  return "min-h-[104px] w-full rounded-none border border-hsbc-gray-300 bg-white px-4 py-3 text-sm text-hsbc-black placeholder:text-hsbc-gray-400 focus:border-b-2 focus:border-b-hsbc-black focus:outline-none";
}

export function formatUploadedAt(value: string) {
  const parsed = Date.parse(value);

  if (Number.isNaN(parsed)) {
    return "Unknown upload time";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(parsed));
}

export function getRecentFormState(form: RecentGeneratedForm) {
  if (form.hasSavedDesigner) {
    return {
      badgeClassName: "bg-green-500",
      label: "Saved draft",
      canLoad: true,
    };
  }

  if (form.hasGeneratedPage && form.hasSchema) {
    return {
      badgeClassName: "bg-blue-500",
      label: "Generated form",
      canLoad: true,
    };
  }

  return {
    badgeClassName: "bg-amber-400",
    label: "Unavailable",
    canLoad: false,
  };
}