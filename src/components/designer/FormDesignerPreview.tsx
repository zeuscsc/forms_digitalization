"use client";

import React from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DeclarationStep } from "@/components/ui/DeclarationStep";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { MobileStatusBar } from "@/components/ui/MobileStatusBar";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { RadioButton, RadioGroup } from "@/components/ui/RadioGroup";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stepper } from "@/components/ui/Stepper";
import type {
  CheckboxDesignerField,
  DeclarationDesignerField,
  DesignerField,
  DevicePreset,
  FormDesignerDocument,
  InputDesignerField,
  QuantityDesignerField,
  RadioDesignerField,
} from "@/lib/formDesigner";

type PreviewValues = Record<string, string | number | boolean | undefined>;

interface FormDesignerPreviewProps {
  designer: FormDesignerDocument;
  devicePreset: DevicePreset;
  validationMode: "manual" | "live";
  onPayloadChange: (payload: PreviewValues) => void;
  onSubmitPayload: (payload: PreviewValues) => void;
}

function buildFieldSchema(field: DesignerField) {
  switch (field.component) {
    case "text":
    case "tel":
    case "date": {
      let schema = z.string();

      if (field.required) {
        schema = schema.min(1, `${field.label} is required`);
      }

      return schema;
    }
    case "email": {
      if (!field.required) {
        return z.string().email("Enter a valid email address").optional().or(z.literal(""));
      }

      return z
        .string()
        .min(1, `${field.label} is required`)
        .email("Enter a valid email address");
    }
    case "quantity": {
      const quantityField = field as QuantityDesignerField;
      let schema = z.number({ invalid_type_error: `${field.label} must be a number` });

      if (typeof quantityField.min === "number") {
        schema = schema.min(quantityField.min, `${field.label} must be at least ${quantityField.min}`);
      }

      if (typeof quantityField.max === "number") {
        schema = schema.max(quantityField.max, `${field.label} must be ${quantityField.max} or less`);
      }

      return schema;
    }
    case "radio": {
      let schema = z.string();

      if (field.required) {
        schema = schema.min(1, `Select ${field.label.toLowerCase()}`);
      }

      return schema;
    }
    case "checkbox": {
      if (field.required) {
        return z.boolean().refine((value) => value === true, {
          message: `${field.label} must be accepted`,
        });
      }

      return z.boolean();
    }
    case "declaration": {
      if (field.required) {
        return z.boolean().refine((value) => value === true, {
          message: `${field.label} must be accepted`,
        });
      }

      return z.boolean();
    }
    default:
      return z.any();
  }
}

function buildPreviewSchema(designer: FormDesignerDocument) {
  const entries = designer.steps.flatMap((step) =>
    step.sections.flatMap((section) => section.fields.map((field) => [field.key, buildFieldSchema(field)] as const))
  );

  return z.object(Object.fromEntries(entries));
}

function buildDefaultValues(designer: FormDesignerDocument): PreviewValues {
  return designer.steps.reduce<PreviewValues>((accumulator, step) => {
    step.sections.forEach((section) => {
      section.fields.forEach((field) => {
        switch (field.component) {
          case "quantity":
            accumulator[field.key] = field.defaultValue ?? field.min ?? 0;
            break;
          case "checkbox":
          case "declaration":
            accumulator[field.key] = field.defaultValue ?? false;
            break;
          case "radio":
            accumulator[field.key] = field.defaultValue ?? field.options[0]?.value ?? "";
            break;
          default:
            accumulator[field.key] = field.defaultValue ?? "";
            break;
        }
      });
    });

    return accumulator;
  }, {});
}

function getStepFieldKeys(designer: FormDesignerDocument, stepIndex: number) {
  return designer.steps[stepIndex]?.sections.flatMap((section) => section.fields.map((field) => field.key)) ?? [];
}

export function FormDesignerPreview({
  designer,
  devicePreset,
  validationMode,
  onPayloadChange,
  onSubmitPayload,
}: FormDesignerPreviewProps) {
  const schema = React.useMemo(() => buildPreviewSchema(designer), [designer]);
  const defaultValues = React.useMemo(() => buildDefaultValues(designer), [designer]);
  const [currentStep, setCurrentStep] = React.useState(0);
  const hasSteps = designer.steps.length > 0;

  const {
    register,
    control,
    handleSubmit,
    trigger,
    reset,
    watch,
    formState: { errors },
  } = useForm<PreviewValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: validationMode === "live" ? "onChange" : "onSubmit",
  });

  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  React.useEffect(() => {
    setCurrentStep((previous) => Math.min(previous, Math.max(designer.steps.length - 1, 0)));
  }, [designer.steps.length]);

  React.useEffect(() => {
    const subscription = watch((value) => {
      onPayloadChange(value as PreviewValues);
    });

    return () => subscription.unsubscribe();
  }, [onPayloadChange, watch]);

  const onSubmit: SubmitHandler<PreviewValues> = (values) => {
    onSubmitPayload(values);
  };

  const goNext = async () => {
    if (!hasSteps) {
      return;
    }

    const fieldsToValidate = getStepFieldKeys(designer, currentStep);
    const isValid = await trigger(fieldsToValidate as never[]);

    if (isValid) {
      setCurrentStep((previous) => Math.min(previous + 1, designer.steps.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    setCurrentStep((previous) => Math.max(previous - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const current = designer.steps[currentStep];

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div
        className={`relative border-gray-900 bg-gray-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.28)] ${devicePreset.frameClassName} ${devicePreset.shellClassName}`}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl z-50 flex items-center justify-center">
          <div className="w-12 h-1.5 bg-gray-800 rounded-full"></div>
        </div>
        <div className="h-[46px] w-[3px] bg-gray-900 absolute -start-[15px] top-[124px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-900 absolute -start-[15px] top-[178px] rounded-s-lg"></div>
        <div className="h-[64px] w-[3px] bg-gray-900 absolute -end-[15px] top-[142px] rounded-e-lg"></div>

        <div className="rounded-[2.8rem] overflow-hidden w-full h-full bg-hsbc-gray-100 relative">
          <div className="absolute inset-0 flex flex-col bg-hsbc-gray-100">
            <MobileStatusBar />
            <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-[40px] z-40 border-b border-hsbc-gray-200">
              <button
                type="button"
                onClick={goBack}
                className="p-1 -ml-1 text-hsbc-black transition-transform active:scale-90 disabled:opacity-40"
                disabled={currentStep === 0}
              >
                <ChevronLeft size={22} />
              </button>
              <div className="text-center px-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-hsbc-red">
                  {designer.theme.accentLabel}
                </div>
                <h1 className="text-sm font-bold text-hsbc-black tracking-tight">{designer.theme.appTitle}</h1>
              </div>
              <button
                type="button"
                onClick={() => reset(defaultValues)}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-hsbc-red"
              >
                Reset
              </button>
            </header>

            {hasSteps ? <Stepper steps={designer.steps.map((step) => step.title)} currentStep={currentStep} /> : null}

            <main className="flex-1 overflow-y-auto px-4 pb-28">
              <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-6">
                {current ? (
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-hsbc-black">{current.title}</h2>
                    {current.description ? (
                      <p className="text-sm text-hsbc-gray-400 leading-relaxed">{current.description}</p>
                    ) : null}
                  </div>
                ) : (
                  <Card className="p-6 md:p-6 shadow-none">
                    <div className="space-y-3 text-center">
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-hsbc-red">
                        Blank canvas
                      </div>
                      <h2 className="text-xl font-bold text-hsbc-black">No steps in this form yet</h2>
                      <p className="text-sm leading-relaxed text-hsbc-gray-400">
                        Add a step from the blueprint panel to start composing the mobile flow and testing it here.
                      </p>
                    </div>
                  </Card>
                )}

                {current?.sections.map((section) => (
                  <Card key={section.id} className="p-5 md:p-5 space-y-5 shadow-none">
                    <SectionHeader title={section.title} subtitle={section.subtitle} className="mt-0" />
                    <div className="space-y-5">
                      {section.fields.map((field) => {
                        const errorMessage = errors[field.key]?.message;

                        if (field.component === "checkbox") {
                          const checkboxField = field as CheckboxDesignerField;

                          return (
                            <div key={field.id} className="space-y-1">
                              {field.helperText ? (
                                <p className="text-xs text-hsbc-gray-400 leading-relaxed">{field.helperText}</p>
                              ) : null}
                              <Controller
                                name={field.key}
                                control={control}
                                render={({ field: controllerField }) => (
                                  <Checkbox
                                    label={checkboxField.checkboxLabel}
                                    checked={Boolean(controllerField.value)}
                                    onChange={(event) => controllerField.onChange(event.target.checked)}
                                    error={Boolean(errorMessage)}
                                  />
                                )}
                              />
                              {typeof errorMessage === "string" ? (
                                <p className="text-xs text-hsbc-red">{errorMessage}</p>
                              ) : null}
                            </div>
                          );
                        }

                        if (field.component === "declaration") {
                          const declarationField = field as DeclarationDesignerField;

                          return (
                            <div key={field.id} className="space-y-3">
                              {field.helperText ? (
                                <p className="text-xs text-hsbc-gray-400 leading-relaxed">{field.helperText}</p>
                              ) : null}
                              <Controller
                                name={field.key}
                                control={control}
                                render={({ field: controllerField }) => (
                                  <DeclarationStep
                                    title={declarationField.label}
                                    documentTitle={declarationField.documentTitle}
                                    checkboxLabel={declarationField.checkboxLabel}
                                    checked={Boolean(controllerField.value)}
                                    onCheckedChange={controllerField.onChange}
                                    error={typeof errorMessage === "string" ? errorMessage : undefined}
                                    requireScroll={declarationField.requireScroll}
                                    framed={false}
                                    animated={false}
                                  />
                                )}
                              />
                            </div>
                          );
                        }

                        if (field.component === "radio") {
                          const radioField = field as RadioDesignerField;

                          return (
                            <div key={field.id} className="space-y-2">
                              <SectionHeader title={field.label} subtitle={field.helperText} className="mt-0 mb-2 pb-0 border-none" />
                              <Controller
                                name={field.key}
                                control={control}
                                render={({ field: controllerField }) => (
                                  <RadioGroup error={typeof errorMessage === "string" ? errorMessage : undefined}>
                                    {radioField.options.map((option) => (
                                      <RadioButton
                                        key={option.id}
                                        label={option.label}
                                        checked={controllerField.value === option.value}
                                        onChange={() => controllerField.onChange(option.value)}
                                      />
                                    ))}
                                  </RadioGroup>
                                )}
                              />
                            </div>
                          );
                        }

                        if (field.component === "quantity") {
                          const quantityField = field as QuantityDesignerField;

                          return (
                            <Controller
                              key={field.id}
                              name={field.key}
                              control={control}
                              render={({ field: controllerField }) => (
                                <QuantitySelector
                                  label={quantityField.label}
                                  value={Number(controllerField.value ?? quantityField.defaultValue ?? 0)}
                                  onChange={controllerField.onChange}
                                  min={quantityField.min}
                                  max={quantityField.max}
                                  required={quantityField.required}
                                  error={typeof errorMessage === "string" ? errorMessage : undefined}
                                />
                              )}
                            />
                          );
                        }

                        const inputField = field as InputDesignerField;

                        return (
                          <Input
                            key={field.id}
                            type={inputField.component}
                            label={inputField.label}
                            placeholder={inputField.placeholder}
                            helperText={inputField.helperText}
                            required={inputField.required}
                            error={typeof errorMessage === "string" ? errorMessage : undefined}
                            {...register(inputField.key)}
                          />
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </form>
            </main>

            <div className="absolute bottom-0 inset-x-0 bg-white border-t border-hsbc-gray-200 p-4 flex items-center gap-3">
              <Button variant="outline" onClick={goBack} disabled={!hasSteps || currentStep === 0} className="flex-1 md:w-full">
                Back
              </Button>
              {hasSteps && currentStep < designer.steps.length - 1 ? (
                <Button onClick={goNext} className="flex-1 md:w-full">
                  Next
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit(onSubmit)} disabled={!hasSteps} className="flex-1 md:w-full">
                  {designer.theme.submitLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex gap-8">
        <div className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-300 rounded-full"></div> {devicePreset.resolutionLabel}</div>
        <div className="flex items-center gap-2"><div className="w-1 h-1 bg-gray-300 rounded-full"></div> Mode {validationMode}</div>
      </div>
    </div>
  );
}