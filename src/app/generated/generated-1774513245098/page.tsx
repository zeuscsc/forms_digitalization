"use client";

import React, { useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generatedSchema, type GeneratedFormData } from "@/lib/schemas/generated/generated-1774513245098";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioGroup, RadioButton } from "@/components/ui/RadioGroup";
import { Stepper } from "@/components/ui/Stepper";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MobileStatusBar } from "@/components/ui/MobileStatusBar";

const STEPS = [
  "Policy & Basic Info",
  "Personal Details",
  "Tax & Employment",
  "Contact & Address",
  "Additional & Review",
];

export default function GeneratedFormPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
    watch,
  } = useForm<GeneratedFormData>({
    resolver: zodResolver(generatedSchema),
    defaultValues: {
      relationToPolicy: [],
      addressType: [],
      mainSourceOfIncome: [],
      declarationAccepted: false,
    },
  });

  const onSubmit: SubmitHandler<GeneratedFormData> = (data) => {
    console.log("Form Submitted:", data);
    alert("Form submitted successfully!");
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0:
        return ["policyNumber", "policyholderName", "relationToPolicy", "fullName", "formerName", "tradingAs"];
      case 1:
        return ["idTypeAndNo", "dob", "placeOfBirth", "nationality1"];
      case 2:
        return ["employmentStatus"];
      case 3:
        return ["addressType"];
      case 4:
        return ["declarationAccepted"];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-hsbc-gray-100 pb-24">
      <MobileStatusBar />
      
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-hsbc-gray-200">
        <div className="flex items-center gap-2">
          <img src="/hsbc-logo.webp" alt="HSBC" className="h-6" />
        </div>
        <button className="text-hsbc-red font-bold text-sm">Cancel</button>
      </header>

      <Stepper steps={STEPS} currentStep={currentStep} />

      <main className="p-4 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 0 && (
            <Card className="p-6 space-y-6">
              <SectionHeader title="Policy Information" />
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Policy Number"
                  {...register("policyNumber")}
                  error={errors.policyNumber?.message}
                  required
                />
                <Input
                  label="Policyholder Name"
                  {...register("policyholderName")}
                  error={errors.policyholderName?.message}
                  required
                />
              </div>

              <SectionHeader title="Relation to Policy" />
              <div className="space-y-2">
                <div className="flex flex-col gap-2">
                  <Controller
                    name="relationToPolicy"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Checkbox
                          label="(a) Insured"
                          checked={field.value?.includes("Insured")}
                          onChange={(e) => {
                            const val = e.target.checked
                              ? [...(field.value || []), "Insured"]
                              : field.value?.filter((v: string) => v !== "Insured");
                            field.onChange(val);
                          }}
                        />
                        <Checkbox
                          label="(b) Policyholder"
                          checked={field.value?.includes("Policyholder")}
                          onChange={(e) => {
                            const val = e.target.checked
                              ? [...(field.value || []), "Policyholder"]
                              : field.value?.filter((v: string) => v !== "Policyholder");
                            field.onChange(val);
                          }}
                        />
                        <Checkbox
                          label="(c) Payor"
                          checked={field.value?.includes("Payor")}
                          onChange={(e) => {
                            const val = e.target.checked
                              ? [...(field.value || []), "Payor"]
                              : field.value?.filter((v: string) => v !== "Payor");
                            field.onChange(val);
                          }}
                        />
                      </>
                    )}
                  />
                </div>
                {errors.relationToPolicy && (
                  <p className="text-sm text-hsbc-red">{errors.relationToPolicy.message}</p>
                )}
              </div>

              <SectionHeader title="Personal Details" />
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Full Name (as per ID/Passport)"
                  {...register("fullName")}
                  error={errors.fullName?.message}
                  required
                />
                <Input
                  label="Former Name / Alias"
                  {...register("formerName")}
                />
                <Input
                  label="Trading As Name"
                  {...register("tradingAs")}
                />
              </div>
            </Card>
          )}

          {currentStep === 1 && (
            <Card className="p-6 space-y-6">
              <SectionHeader title="Identification" />
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="ID Type & No."
                  {...register("idTypeAndNo")}
                  error={errors.idTypeAndNo?.message}
                  required
                />
                <Input
                  label="GIIN No. (if applicable)"
                  {...register("giinNo")}
                />
                <Input
                  label="Date of Birth (DD/MM/YYYY)"
                  {...register("dob")}
                  error={errors.dob?.message}
                  required
                />
                <Input
                  label="Place of Birth"
                  {...register("placeOfBirth")}
                  error={errors.placeOfBirth?.message}
                  required
                />
                <Input
                  label="Nationality 1"
                  {...register("nationality1")}
                  error={errors.nationality1?.message}
                  required
                />
                <Input
                  label="Nationality 2"
                  {...register("nationality2")}
                />
                <Input
                  label="Nationality 3"
                  {...register("nationality3")}
                />
              </div>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="p-6 space-y-6">
              <SectionHeader title="Tax Information" />
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="US Tax ID (if applicable)"
                  {...register("usTaxId")}
                />
                <Input
                  label="Local Tax ID"
                  {...register("localTaxId")}
                />
                <Input
                  label="Country/Region of Local Tax ID"
                  {...register("countryOfLocalTaxId")}
                />
              </div>

              <SectionHeader title="Employment Information" />
              <Controller
                name="employmentStatus"
                control={control}
                render={({ field }) => (
                  <RadioGroup error={errors.employmentStatus?.message}>
                    <RadioButton
                      label="Self-Employed"
                      checked={field.value === "Self-Employed"}
                      onChange={() => field.onChange("Self-Employed")}
                    />
                    <RadioButton
                      label="Full-Time Employed"
                      checked={field.value === "Full-Time Employed"}
                      onChange={() => field.onChange("Full-Time Employed")}
                    />
                    <RadioButton
                      label="Part-Time Employed"
                      checked={field.value === "Part-Time Employed"}
                      onChange={() => field.onChange("Part-Time Employed")}
                    />
                    <RadioButton
                      label="Not Currently Employed"
                      checked={field.value === "Not Currently Employed"}
                      onChange={() => field.onChange("Not Currently Employed")}
                    />
                    <RadioButton
                      label="Student"
                      checked={field.value === "Student"}
                      onChange={() => field.onChange("Student")}
                    />
                    <RadioButton
                      label="Housewife"
                      checked={field.value === "Housewife"}
                      onChange={() => field.onChange("Housewife")}
                    />
                    <RadioButton
                      label="Retired"
                      checked={field.value === "Retired"}
                      onChange={() => field.onChange("Retired")}
                    />
                  </RadioGroup>
                )}
              />

              <div className="grid grid-cols-1 gap-4 mt-4">
                <Input label="Industry" {...register("industry")} />
                <Input label="Occupation" {...register("occupation")} />
                <Input label="Job Title" {...register("jobTitle")} />
                <Input label="Employer Name" {...register("employerName")} />
                <Input label="Monthly Salary" {...register("monthlySalary")} />
              </div>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="p-6 space-y-6">
              <SectionHeader title="Contact Information" />
              <div className="grid grid-cols-1 gap-4">
                <div className="flex gap-2">
                  <div className="w-24">
                    <Input label="Country" {...register("mobileTelCountry")} placeholder="+852" />
                  </div>
                  <div className="flex-1">
                    <Input label="Mobile Telephone" {...register("mobileTelNo")} />
                  </div>
                </div>
                <Input label="Email Address" {...register("emailAddress")} error={errors.emailAddress?.message} />
              </div>

              <SectionHeader title="Address Details" />
              <div className="space-y-2">
                <p className="text-sm font-bold text-hsbc-black">Address Type</p>
                <Controller
                  name="addressType"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      {["Correspondence", "Residential", "Permanent", "Business", "Registered Office"].map((type) => (
                        <Checkbox
                          key={type}
                          label={type}
                          checked={field.value?.includes(type)}
                          onChange={(e) => {
                            const val = e.target.checked
                              ? [...(field.value || []), type]
                              : field.value?.filter((v: string) => v !== type);
                            field.onChange(val);
                          }}
                        />
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4">
                <div className="grid grid-cols-3 gap-2">
                  <Input label="Room/Flat" {...register("roomFlatBlock")} />
                  <Input label="Floor" {...register("floor")} />
                  <Input label="Block" {...register("block")} />
                </div>
                <Input label="Building Name" {...register("buildingName")} />
                <Input label="Estate Name" {...register("estateName")} />
                <Input label="Street Name" {...register("streetName")} />
                <Input label="District" {...register("district")} />
              </div>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="p-6 space-y-6">
              <SectionHeader title="Contingent Policyholder" />
              <div className="grid grid-cols-1 gap-4">
                <Input label="Name (English)" {...register("contingentNameEnglish")} />
                <Input label="Name (Chinese)" {...register("contingentNameChinese")} />
                <Input label="HKID/Passport No." {...register("contingentIdNo")} />
                <Input label="Relationship" {...register("contingentRelationship")} />
              </div>

              <SectionHeader title="Declaration" />
              <div className="bg-hsbc-gray-100 p-4 text-sm text-hsbc-gray-600 space-y-4">
                <p>I/we agree that if I/we am/are a customer(s) of The Hongkong and Shanghai Banking Corporation Limited (the "Bank")...</p>
                <Controller
                  name="declarationAccepted"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      label="I accept the declaration and terms above"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      error={!!errors.declarationAccepted}
                    />
                  )}
                />
                {errors.declarationAccepted && (
                  <p className="text-sm text-hsbc-red">{errors.declarationAccepted.message}</p>
                )}
              </div>
            </Card>
          )}

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-hsbc-gray-200 p-4 flex gap-4 max-w-2xl mx-auto">
            {currentStep > 0 && (
              <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
                Back
              </Button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep} className="flex-1">
                Next Step
              </Button>
            ) : (
              <Button type="submit" className="flex-1">
                Submit
              </Button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
