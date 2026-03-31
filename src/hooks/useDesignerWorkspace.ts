"use client";

import React from "react";
import {
  cloneDesigner,
  createBlankDesigner,
  createEmptySection,
  createEmptyStep,
  createFieldFromComponent,
  synchronizeDesignerIdCounter,
  type DesignerFieldComponent,
  type DesignerFieldOption,
  type DesignerSelection,
  type FormDesignerDocument,
} from "@/lib/formDesigner";
import {
  createLogEntry,
  ensureSelection,
  getActiveSectionSelection,
  getFirstSelection,
  getSelectionSnapshot,
  findStep,
  moveItem,
  type ActivityLogEntry,
} from "@/lib/designerWorkspace";

const INITIAL_ACTIVITY_LOG: ActivityLogEntry[] = [
  {
    id: "designer-workspace-initialized",
    message: "Designer workspace initialized",
    time: "Session start",
  },
  {
    id: "shared-mobile-components-loaded",
    message: "Loaded shared mobile components from src/components/ui",
    time: "Session start",
  },
];

export function useDesignerWorkspace() {
  const initialDesigner = React.useMemo(() => createBlankDesigner(), []);
  const [designer, setDesigner] = React.useState<FormDesignerDocument>(initialDesigner);
  const [selection, setSelection] = React.useState<DesignerSelection | null>(() => getFirstSelection(initialDesigner));
  const [activityLog, setActivityLog] = React.useState<ActivityLogEntry[]>(INITIAL_ACTIVITY_LOG);

  React.useEffect(() => {
    setSelection((current) => ensureSelection(designer, current));
  }, [designer]);

  const snapshot = React.useMemo(() => getSelectionSnapshot(designer, selection), [designer, selection]);
  const activeSectionSelection = React.useMemo(
    () => getActiveSectionSelection(designer, selection),
    [designer, selection]
  );

  const appendLog = React.useCallback((message: string) => {
    setActivityLog((current) => [createLogEntry(message), ...current].slice(0, 8));
  }, []);

  const resetActivityLog = React.useCallback(() => {
    setActivityLog(INITIAL_ACTIVITY_LOG);
  }, []);

  const replaceDesigner = React.useCallback((nextDesigner: FormDesignerDocument, nextSelection?: DesignerSelection | null) => {
    synchronizeDesignerIdCounter(nextDesigner);
    setDesigner(nextDesigner);
    setSelection(ensureSelection(nextDesigner, nextSelection ?? getFirstSelection(nextDesigner)));
  }, []);

  const commitDesigner = React.useCallback(
    (updater: (draft: FormDesignerDocument) => DesignerSelection | null | void) => {
      let nextSelection = selection;

      setDesigner((current) => {
        const draft = cloneDesigner(current);
        const candidate = updater(draft) ?? nextSelection;
        nextSelection = ensureSelection(draft, candidate);
        return draft;
      });

      setSelection(nextSelection);
    },
    [selection]
  );

  const addStep = React.useCallback(() => {
    commitDesigner((draft) => {
      const step = createEmptyStep();
      draft.steps.push(step);
      appendLog(`Added step ${step.title}`);
      return { type: "step", stepId: step.id };
    });
  }, [appendLog, commitDesigner]);

  const addSectionToStep = React.useCallback(
    (stepId: string) => {
      commitDesigner((draft) => {
        const step = findStep(draft, stepId);

        if (!step) {
          return;
        }

        const section = createEmptySection();
        step.sections.push(section);
        appendLog(`Added section ${section.title}`);
        return { type: "section", stepId, sectionId: section.id };
      });
    },
    [appendLog, commitDesigner]
  );

  const addField = React.useCallback(
    (component: DesignerFieldComponent) => {
      if (!activeSectionSelection) {
        return;
      }

      commitDesigner((draft) => {
        const step = findStep(draft, activeSectionSelection.stepId);
        const section = step?.sections.find((entry) => entry.id === activeSectionSelection.sectionId);

        if (!section) {
          return;
        }

        const field = createFieldFromComponent(component);
        section.fields.push(field);
        appendLog(`Added ${field.label} to ${section.title}`);
        return {
          type: "field",
          stepId: activeSectionSelection.stepId,
          sectionId: activeSectionSelection.sectionId,
          fieldId: field.id,
        };
      });
    },
    [activeSectionSelection, appendLog, commitDesigner]
  );

  const updateTheme = React.useCallback((key: keyof FormDesignerDocument["theme"], value: string) => {
    setDesigner((current) => ({
      ...current,
      theme: {
        ...current.theme,
        [key]: value,
      },
    }));
  }, []);

  const updateDesignerName = React.useCallback((value: string) => {
    setDesigner((current) => ({
      ...current,
      name: value,
    }));
  }, []);

  const updateStep = React.useCallback(
    (key: "title" | "description", value: string) => {
      if (!selection) {
        return;
      }

      commitDesigner((draft) => {
        const step = findStep(draft, selection.stepId);

        if (!step) {
          return;
        }

        step[key] = value;
        return { type: "step", stepId: step.id };
      });
    },
    [commitDesigner, selection]
  );

  const updateSection = React.useCallback(
    (key: "title" | "subtitle", value: string) => {
      if (!selection) {
        return;
      }

      commitDesigner((draft) => {
        const step = findStep(draft, selection.stepId);
        const section = step?.sections.find((entry) => entry.id === selection.sectionId);

        if (!step || !section) {
          return;
        }

        section[key] = value;
        return { type: "section", stepId: step.id, sectionId: section.id };
      });
    },
    [commitDesigner, selection]
  );

  const updateField = React.useCallback(
    (key: string, value: string | number | boolean | undefined) => {
      if (!selection) {
        return;
      }

      commitDesigner((draft) => {
        const step = findStep(draft, selection.stepId);
        const section = step?.sections.find((entry) => entry.id === selection.sectionId);
        const field = section?.fields.find((entry) => entry.id === selection.fieldId);

        if (!step || !section || !field) {
          return;
        }

          (field as unknown as Record<string, string | number | boolean | undefined>)[key] = value;
        return { type: "field", stepId: step.id, sectionId: section.id, fieldId: field.id };
      });
    },
    [commitDesigner, selection]
  );

  const updateRadioOption = React.useCallback(
    (optionId: string, key: keyof DesignerFieldOption, value: string) => {
      if (!selection) {
        return;
      }

      commitDesigner((draft) => {
        const step = findStep(draft, selection.stepId);
        const section = step?.sections.find((entry) => entry.id === selection.sectionId);
        const field = section?.fields.find((entry) => entry.id === selection.fieldId);

        if (!step || !section || !field || field.component !== "radio") {
          return;
        }

        const option = field.options.find((entry) => entry.id === optionId);

        if (!option) {
          return;
        }

        option[key] = value;
        return { type: "field", stepId: step.id, sectionId: section.id, fieldId: field.id };
      });
    },
    [commitDesigner, selection]
  );

  const addRadioOption = React.useCallback(() => {
    if (!selection) {
      return;
    }

    commitDesigner((draft) => {
      const step = findStep(draft, selection.stepId);
      const section = step?.sections.find((entry) => entry.id === selection.sectionId);
      const field = section?.fields.find((entry) => entry.id === selection.fieldId);

      if (!step || !section || !field || field.component !== "radio") {
        return;
      }

      const nextOption: DesignerFieldOption = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: "New option",
        value: `option-${field.options.length + 1}`,
      };

      field.options.push(nextOption);
      return { type: "field", stepId: step.id, sectionId: section.id, fieldId: field.id };
    });
  }, [commitDesigner, selection]);

  const removeRadioOption = React.useCallback(
    (optionId: string) => {
      if (!selection) {
        return;
      }

      commitDesigner((draft) => {
        const step = findStep(draft, selection.stepId);
        const section = step?.sections.find((entry) => entry.id === selection.sectionId);
        const field = section?.fields.find((entry) => entry.id === selection.fieldId);

        if (!step || !section || !field || field.component !== "radio") {
          return;
        }

        field.options = field.options.filter((entry) => entry.id !== optionId);
        return { type: "field", stepId: step.id, sectionId: section.id, fieldId: field.id };
      });
    },
    [commitDesigner, selection]
  );

  const moveStep = React.useCallback(
    (stepId: string, direction: -1 | 1) => {
      commitDesigner((draft) => {
        const index = draft.steps.findIndex((step) => step.id === stepId);

        if (index === -1) {
          return;
        }

        moveItem(draft.steps, index, index + direction);
        return { type: "step", stepId };
      });
    },
    [commitDesigner]
  );

  const moveSection = React.useCallback(
    (stepId: string, sectionId: string, direction: -1 | 1) => {
      commitDesigner((draft) => {
        const step = findStep(draft, stepId);
        const index = step?.sections.findIndex((section) => section.id === sectionId) ?? -1;

        if (!step || index === -1) {
          return;
        }

        moveItem(step.sections, index, index + direction);
        return { type: "section", stepId, sectionId };
      });
    },
    [commitDesigner]
  );

  const moveField = React.useCallback(
    (stepId: string, sectionId: string, fieldId: string, direction: -1 | 1) => {
      commitDesigner((draft) => {
        const step = findStep(draft, stepId);
        const section = step?.sections.find((entry) => entry.id === sectionId);
        const index = section?.fields.findIndex((field) => field.id === fieldId) ?? -1;

        if (!step || !section || index === -1) {
          return;
        }

        moveItem(section.fields, index, index + direction);
        return { type: "field", stepId, sectionId, fieldId };
      });
    },
    [commitDesigner]
  );

  const removeStep = React.useCallback(
    (stepId: string) => {
      if (designer.steps.length === 1) {
        return;
      }

      commitDesigner((draft) => {
        draft.steps = draft.steps.filter((step) => step.id !== stepId);
        appendLog("Removed a step from the flow");
        return getFirstSelection(draft);
      });
    },
    [appendLog, commitDesigner, designer.steps.length]
  );

  const removeSection = React.useCallback(
    (stepId: string, sectionId: string) => {
      commitDesigner((draft) => {
        const step = findStep(draft, stepId);

        if (!step || step.sections.length === 1) {
          return;
        }

        step.sections = step.sections.filter((section) => section.id !== sectionId);
        appendLog("Removed a section from the selected step");
        return { type: "step", stepId };
      });
    },
    [appendLog, commitDesigner]
  );

  const removeField = React.useCallback(
    (stepId: string, sectionId: string, fieldId: string) => {
      commitDesigner((draft) => {
        const step = findStep(draft, stepId);
        const section = step?.sections.find((entry) => entry.id === sectionId);

        if (!step || !section) {
          return;
        }

        section.fields = section.fields.filter((field) => field.id !== fieldId);
        appendLog("Removed a field from the selected section");
        return { type: "section", stepId, sectionId };
      });
    },
    [appendLog, commitDesigner]
  );

  return {
    designer,
    setDesigner,
    selection,
    setSelection,
    snapshot,
    activeSectionSelection,
    activityLog,
    appendLog,
    resetActivityLog,
    replaceDesigner,
    commitDesigner,
    addStep,
    addSectionToStep,
    addField,
    updateTheme,
    updateDesignerName,
    updateStep,
    updateSection,
    updateField,
    updateRadioOption,
    addRadioOption,
    removeRadioOption,
    moveStep,
    moveSection,
    moveField,
    removeStep,
    removeSection,
    removeField,
  };
}