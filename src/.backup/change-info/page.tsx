"use client";

import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeInfoFormSchema, type ChangeInfoFormData } from "@/lib/schemas/changeInfoForm";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioGroup, RadioButton } from "@/components/ui/RadioGroup";
import { FieldTitle } from "@/components/ui/FieldTitle";
import { MobileStatusBar } from "@/components/ui/MobileStatusBar";
import { Stepper } from "@/components/ui/Stepper";
import { ChevronLeft } from "lucide-react";

const STEPS = [
  "Policy & Identity",
  "Personal Details",
  "Employment",
  "Contact Info",
  "Declaration"
];

export default function ChangeInfoPage() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ChangeInfoFormData>({
    resolver: zodResolver(changeInfoFormSchema),
    defaultValues: {
      idType: "HKID",
      customerType: ["Policyholder"],
      mobileCountryCode: "+852",
      addressType: ["Residential"],
      updateScope: "All",
      isTaxResidentChanged: false,
      declarationAccepted: false,
    },
  });

  const [hasScrolledToBottom, setHasScrolledToBottom] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (element) {
      const { scrollTop, scrollHeight, clientHeight } = element;
      // Standardized tolerance to 10px
      if (Math.abs(scrollHeight - clientHeight - scrollTop) < 10) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const onSubmit: SubmitHandler<ChangeInfoFormData> = (data) => {
    console.log("Form Data Submitted:", data);
    alert("Form submitted successfully!");
  };

  const nextStep = async () => {
    const fieldsToValidate: Record<number, (keyof ChangeInfoFormData)[]> = {
      0: ["policyholderName", "policyNumber", "customerType", "fullName", "idType", "idNumber"],
      1: ["dateOfBirth", "nationality1"],
      2: ["employmentStatus"],
      3: ["mobileNumber", "emailAddress", "addressType"],
    };

    if (fieldsToValidate[currentStep]) {
      const isValid = await trigger(fieldsToValidate[currentStep]);
      if (!isValid) return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const declarationAccepted = watch("declarationAccepted");
  const isOverseas = watch("isOverseas");

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans relative w-full max-w-md mx-auto">
      <MobileStatusBar />
      
      {/* App Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-[40px] z-40 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button type="button" onClick={prevStep} className="p-1 -ml-1 text-gray-900 transition-transform active:scale-90">
              <ChevronLeft size={24} />
          </button>
        </div>
        <h1 className="text-sm font-bold text-gray-900 tracking-tight absolute left-1/2 -translate-x-1/2">Change Info</h1>
        <button type="button" className="text-sm font-bold text-hsbc-red uppercase tracking-wider">Cancel</button>
      </header>

      {/* Standardized Stepper Component */}
      <Stepper steps={STEPS} currentStep={currentStep} className="border-none" />

      <main className="flex-1 w-full px-4 pb-24 overflow-x-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="h-full">
          
          {/* Step 0: Policy & Core Identity */}
          {currentStep === 0 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <section>
                <SectionHeader title="Policy Information" className="mt-0" />
                <div className="grid grid-cols-1 gap-6">
                  <Input
                    label="Name of Policyholder (English)"
                    placeholder="As shown on policy"
                    required
                    {...register("policyholderName")}
                    error={errors.policyholderName?.message}
                  />
                  <Input
                    label="Policy Number"
                    placeholder="e.g. 12345678"
                    required
                    {...register("policyNumber")}
                    error={errors.policyNumber?.message}
                  />
                </div>
              </section>

              <section>
                <SectionHeader title="1. Personal Details Change" />
                <div className="space-y-4">
                  <FieldTitle>I am the:</FieldTitle>
                  <div className="grid grid-cols-2 gap-2">
                    {["Insured", "Policyholder", "Payor"].map((type) => (
                      <Checkbox
                        key={type}
                        label={type}
                        value={type}
                        {...register("customerType")}
                      />
                    ))}
                  </div>
                  {errors.customerType && <p className="text-hsbc-red text-xs mt-1">{errors.customerType.message}</p>}
                </div>

                <div className="grid grid-cols-1 gap-6 mt-6">
                  <Input
                    label="Full Name (English)"
                    placeholder="Full name as per ID"
                    {...register("fullName")}
                    error={errors.fullName?.message}
                  />
                  <div className="space-y-4">
                    <FieldTitle>Identification Type</FieldTitle>
                    <RadioGroup>
                      {["HKID", "Passport", "Birth Certificate"].map((option) => (
                        <RadioButton
                          key={option}
                          label={option}
                          value={option}
                          {...register("idType")}
                        />
                      ))}
                    </RadioGroup>
                  </div>
                  <Input
                    label="ID / Passport / BC No."
                    placeholder="e.g. A123456(7)"
                    {...register("idNumber")}
                    error={errors.idNumber?.message}
                  />
                </div>
              </section>
            </div>
          )}

          {/* Step 1: Extended Personal Details */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <section>
                <SectionHeader title="Additional Details" className="mt-0" />
                <div className="grid grid-cols-1 gap-6">
                  <Input
                    label="Former Name / Alias"
                    placeholder="If any"
                    {...register("formerName")}
                  />
                  <Input
                    label="Trading As Name"
                    placeholder="If different from full name"
                    {...register("tradingAs")}
                  />
                  <Input
                    type="date"
                    label="Date of Birth / Incorporation"
                    {...register("dateOfBirth")}
                    error={errors.dateOfBirth?.message}
                  />
                  <Input
                    label="Place of Birth"
                    placeholder="Country/Region"
                    {...register("placeOfBirth")}
                  />
                  <Input
                    label="Nationality (Country/Region) 1"
                    placeholder="Primary Nationality"
                    {...register("nationality1")}
                    error={errors.nationality1?.message}
                  />
                </div>
              </section>

              <section>
                <SectionHeader title="Tax Information" />
                <div className="grid grid-cols-1 gap-6">
                  <Input
                    label="US Tax ID (where applicable)"
                    placeholder="e.g. SSN / TIN"
                    {...register("usTaxId")}
                  />
                  <Input
                    label="Local Tax ID"
                    placeholder="e.g. HKID for HK"
                    {...register("localTaxId")}
                  />
                  <Input
                    label="Country/Region of Local Tax ID"
                    {...register("localTaxCountry")}
                  />
                </div>
              </section>
            </div>
          )}

          {/* Step 2: Employment Details */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <section>
                <SectionHeader title="Employment Status" className="mt-0" />
                <div className="space-y-4">
                  <FieldTitle>Current Status</FieldTitle>
                  <RadioGroup className="grid grid-cols-1">
                    {[
                      "Self-Employed",
                      "Full-time Employed",
                      "Part-time Employed",
                      "Not Currently Employed",
                      "Student",
                      "Housewife",
                      "Retired"
                    ].map((status) => (
                      <RadioButton
                        key={status}
                        label={status}
                        value={status}
                        {...register("employmentStatus")}
                      />
                    ))}
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 gap-6 mt-6">
                  <Input
                    label="Industry"
                    placeholder="e.g. Banking, Education"
                    {...register("industry")}
                  />
                  <Input
                    label="Occupation"
                    {...register("occupation")}
                  />
                  <Input
                    label="Job Title"
                    {...register("jobTitle")}
                  />
                  <Input
                    label="Employer Name"
                    {...register("employerName")}
                  />
                  <Input
                    label="Monthly Salary (HKD)"
                    placeholder="e.g. 30,000"
                    suffix="HKD"
                    {...register("monthlySalary")}
                  />
                </div>
              </section>
            </div>
          )}

          {/* Step 3: Contact & Address */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <section>
                <SectionHeader title="2. Contact Information" className="mt-0" />
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center gap-2 bg-hsbc-gray-100 p-4 rounded">
                    <Checkbox
                      label="Apply this change to ALL my life insurance policies"
                      {...register("applyToAllPolicies")}
                    />
                  </div>
                  
                  <Input
                    label="Mobile Number"
                    placeholder="8 digits"
                    {...register("mobileNumber")}
                    error={errors.mobileNumber?.message}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="example@domain.com"
                    {...register("emailAddress")}
                    error={errors.emailAddress?.message}
                  />
                </div>
              </section>

              <section>
                <SectionHeader title="Address Details" />
                <div className="space-y-4 mb-6">
                  <FieldTitle>Address Type</FieldTitle>
                  <div className="grid grid-cols-2 gap-2">
                    {["Correspondence", "Residential", "Permanent", "Business"].map((type) => (
                      <Checkbox
                        key={type}
                        label={type}
                        value={type}
                        {...register("addressType")}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Room/Flat" {...register("roomFlat")} />
                  <Input label="Floor" {...register("floor")} />
                  <Input label="Block" {...register("block")} />
                </div>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <Input label="Building Name" {...register("buildingName")} />
                  <Input label="Estate Name" {...register("estateName")} />
                  <Input label="Street & Road" {...register("streetDetails")} />
                  <div className="space-y-4">
                    <FieldTitle>District</FieldTitle>
                    <RadioGroup>
                      {["Hong Kong", "Kowloon", "New Territories"].map((d) => (
                        <RadioButton
                          key={d}
                          label={d}
                          value={d}
                          {...register("district")}
                        />
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Checkbox
                    label="This is an overseas address"
                    {...register("isOverseas")}
                  />
                  {isOverseas && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <Input label="Country/Region" {...register("overseasCountry")} />
                      <Input label="Postal Code" {...register("postalCode")} />
                      <Input label="Reason for new address" {...register("overseasReason")} />
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Step 4: Declaration */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <Card>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-hsbc-black mb-1 tracking-tight">Declaration</h2>
                  <p className="text-xs text-hsbc-gray-400 font-medium uppercase tracking-widest">Review and Authorise</p>
                </div>

                <div className="space-y-6">
                  <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="bg-gray-50 p-6 rounded-lg h-96 overflow-y-auto text-[11px] text-gray-700 leading-relaxed border border-gray-200"
                  >
                    <p className="mb-4 font-bold">Declaration and Authorisation 聲明及授權書</p>
                    <p className="mb-4">By signing below, I/we confirm the above application and agree that the Company may use and disclose all personal data about me/us that the Company currently or subsequently hold for the purposes as set out in the Notice relating to the Personal Data (Privacy) Ordinance (which may otherwise be referred to as 'Personal Information Collection Statement') that HSBC Life have most recently notified me of, and I understand I can scan the QR code below for review or else I can request a copy by visiting my local HSBC Branch or through the Life Insurance Service Hotline: (852) 2583 8000.</p>
                    <p className="mb-4">I/we agree that if I am/we are a customer(s) of The Hongkong and Shanghai Banking Corporation Limited (the "Bank"), HSBC Life (International) Limited may share this form with the Bank for the purpose of updating certain of my/our information retained by the relevant business line(s) of the Bank.</p>
                    <p className="mb-4 font-bold italic">Important Notice 重要事項:</p>
                    <ul className="list-disc pl-4 space-y-2 mb-4">
                      <li>Your request will be processed within approximate 5 working days upon receipt of the form.</li>
                      <li>To comply with the Foreign Account Tax Compliance Act (FATCA) regulations issued by the United States Department of the Treasury and Internal Revenue Service (IRS), we are required to establish the status of Policyholder and connected person.</li>
                      <li>If there are any changes in my/our tax residency status, I/we am/are required to notify the Bank within 30 days.</li>
                    </ul>
                    <div className="text-center font-black text-gray-300 mt-10 pt-4 border-t border-gray-200 uppercase tracking-tighter">
                        End of Document
                    </div>
                  </div>

                  <div className={`transition-all duration-500 ${hasScrolledToBottom ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'}`}>
                    <Checkbox
                      {...register("declarationAccepted")}
                      disabled={!hasScrolledToBottom}
                      label="I/We confirm and accept the declaration above and authorize the changes."
                      id="agree"
                      error={!!errors.declarationAccepted}
                    />
                    {!hasScrolledToBottom && (
                         <div className="text-[10px] text-hsbc-red font-bold mt-2 animate-pulse uppercase tracking-widest text-center py-2 bg-red-50 rounded">
                            Please scroll to the bottom of the declaration
                         </div>
                    )}
                    {errors.declarationAccepted && (
                      <p className="text-hsbc-red text-sm mt-1 ml-9">{errors.declarationAccepted.message}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Sticky Bottom Action Bar - Standardized rounding and z-index */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-hsbc-gray-200 p-4 z-30 flex gap-4 max-w-md mx-auto rounded-b-[2.8rem]">
            {currentStep > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                className="flex-1"
              >
                Back
              </Button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <Button 
                type="button" 
                variant="primary"
                onClick={nextStep}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button 
                type="submit" 
                variant="primary"
                disabled={!declarationAccepted}
                className="flex-1 transition-all duration-300"
              >
                Submit Request
              </Button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
