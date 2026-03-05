"use client";

import React from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { claimFormSchema, type ClaimFormData } from "@/lib/schemas/claimForm";
import { Input } from "@/components/ui/Input";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioGroup, RadioButton } from "@/components/ui/RadioGroup";
import { FieldTitle } from "@/components/ui/FieldTitle";
import { MobileStatusBar } from "@/components/ui/MobileStatusBar";
import { ChevronLeft } from "lucide-react";

const STEPS = [
  "Policy Details",
  "Accident Info",
  "Medical Cert",
  "Disability",
  "Hospitalization",
  "Payment",
  "Declaration"
];

export default function ClaimPage() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      age: 30,
      sex: "Male",
      paymentMethod: "Cheque",
      isStillDisabled: false,
      isHospitalized: false,
      hasConcurrentClaim: false,
      declarationAccepted: false,
    },
  });

  const [hasScrolledToBottom, setHasScrolledToBottom] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (element) {
      const { scrollTop, scrollHeight, clientHeight } = element;
      // Check if scrolled to bottom with a small tolerance (e.g. 5px)
      if (Math.abs(scrollHeight - clientHeight - scrollTop) < 5) {
        setHasScrolledToBottom(true);
      }
    }
  };


  const onSubmit: SubmitHandler<ClaimFormData> = (data) => {
    console.log("Form Data Submitted:", data);
    alert("Form submitted successfully! Check console for data.");
  };

  const nextStep = async () => {
    const fieldsToValidate: any = {
      0: ["policyNo", "nameOfInsured", "phoneNo", "address", "insuredPersonName", "age", "sex", "occupation", "relationshipToInsured"],
      1: ["accidentDate", "accidentTime", "accidentPlace", "accidentCause"],
      // Add more as needed
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

  const isHospitalized = watch("isHospitalized");
  const paymentMethod = watch("paymentMethod");
  const hasConcurrentClaim = watch("hasConcurrentClaim");

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <MobileStatusBar />
      
      {/* App Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-[38px] z-40 border-b border-gray-100">
        <button type="button" onClick={prevStep} className="p-1 -ml-1 text-gray-900">
            <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">File a Claim</h1>
        <button type="button" className="text-base font-medium text-gray-900">Cancel</button>
      </header>

      {/* Stepper */}
      <div className="px-4 pt-4 pb-2 bg-white">
          <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium text-hsbc-red">Step {currentStep + 1} of {STEPS.length}</span>
          </div>
          <div className="h-1 bg-gray-200 w-full mb-6">
              <div 
                  className="h-full bg-hsbc-red transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              ></div>
          </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pb-24">
        <form onSubmit={handleSubmit(onSubmit)} className="h-full">
          {/* Section 1: Policy Details */}
          {currentStep === 0 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              
              <div className="space-y-10">
                  <section>
                    <SectionHeader title="1. Policy Details" className="mt-0" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Policy No. 保單編號"
                        placeholder="e.g. 12345678"
                        required
                        {...register("policyNo")}
                        error={errors.policyNo?.message}
                      />
                      <Input
                        label="Name of Insured 投保人姓名"
                        placeholder="Full name"
                        required
                        {...register("nameOfInsured")}
                        error={errors.nameOfInsured?.message}
                      />
                      <Input
                        label="Phone No. 電話"
                        placeholder="Contact number"
                        required
                        {...register("phoneNo")}
                        error={errors.phoneNo?.message}
                      />
                      <Input
                        label="Address 地址"
                        placeholder="Full correspondence address"
                        required
                        {...register("address")}
                        error={errors.address?.message}
                      />
                    </div>
                  </section>

                  <section>
                    <SectionHeader title="2. Person Injured" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Name of Person Injured 受傷人士姓名"
                        placeholder="Full name"
                        required
                        {...register("insuredPersonName")}
                        error={errors.insuredPersonName?.message}
                      />
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Controller
                            name="age"
                            control={control}
                            render={({ field }) => (
                              <QuantitySelector
                                label="Age 年齡"
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.age?.message}
                              />
                            )}
                          />
                        </div>
                        <div className="flex-1">
                          <FieldTitle>Sex 性別</FieldTitle>
                          <RadioGroup className="mt-1">
                            {["Male", "Female"].map((option) => (
                              <RadioButton
                                key={option}
                                label={option}
                                value={option}
                                {...register("sex")}
                              />
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                      <Input
                        label="Occupation 職業"
                        placeholder="Current occupation"
                        required
                        {...register("occupation")}
                        error={errors.occupation?.message}
                      />
                      <Input
                        label="Relationship to the insured 與投保人之關係"
                        placeholder="e.g. Self, Spouse, Child"
                        required
                        {...register("relationshipToInsured")}
                        error={errors.relationshipToInsured?.message}
                      />
                    </div>
                  </section>
                </div>
            </div>
          )}

          {/* Section 2: Accident Details */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <Card>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-hsbc-black mb-2">Accident Details</h2>
                  <p className="text-sm text-hsbc-gray-400 italic">DATE, TIME AND PLACE OF ACCIDENT 意外發生的日期、時間和地點</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="date"
                      label="Date of Accident 意外發生日期"
                      required
                      {...register("accidentDate")}
                      error={errors.accidentDate?.message}
                    />
                    <Input
                      type="time"
                      label="Time of Accident 時間"
                      required
                      {...register("accidentTime")}
                      error={errors.accidentTime?.message}
                    />
                  </div>
                  <Input
                    label="Place of Accident 地點"
                    placeholder="City, Country, Specific location"
                    required
                    {...register("accidentPlace")}
                    error={errors.accidentPlace?.message}
                  />
                  <Input
                    label="Particulars of the cause, and injuries sustained 意外發生的原因及傷勢"
                    placeholder="Provide full particulars..."
                    required
                    {...register("accidentCause")}
                    error={errors.accidentCause?.message}
                  />
                </div>
              </Card>
            </div>
          )}

          {/* Section 3: Medical Cert */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <Card>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-hsbc-black mb-2">Medical Certificate</h2>
                  <p className="text-sm text-hsbc-gray-400 italic">To be completed by Insured Person’s Doctor 由受保人主診醫生填寫</p>
                </div>

                <div className="space-y-8">
                  <Input
                    label="Name and address of attending doctor 診症醫生姓名及地址"
                    placeholder="Doctor / Clinic name and full address"
                    {...register("doctorNameAndAddress")}
                    error={errors.doctorNameAndAddress?.message}
                  />
                  
                  <div className="p-4 bg-hsbc-gray-100 rounded-lg space-y-6 border border-hsbc-gray-200">
                    <Input label="I CERTIFY THAT 本人茲證明" {...register("doctorCertifyName")} />
                    <Input type="date" label="was injured on Day 於此日期受傷" {...register("doctorInjuryDate")} />
                    <Input label="His/Her injuries are 其傷勢為" {...register("doctorInjuries")} />
                    
                    <div className="space-y-4">
                      <FieldTitle>Disability Level 殘廢程度</FieldTitle>
                      <RadioGroup>
                        <RadioButton label="Totally disabled 完全殘廢" value="totally" {...register("doctorDisabilityType")} />
                        <RadioButton label="Partially disabled 部份殘廢" value="partially" {...register("doctorDisabilityType")} />
                      </RadioGroup>
                      <Input type="date" label="Until Day 直至此日期" {...register("doctorDisabledUntil")} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Section 4: Disability */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <Card>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-hsbc-black mb-2">Disability Period</h2>
                </div>

                <div className="space-y-8">
                  <div>
                    <FieldTitle>Period of total disability 傷者完全失去工作能力的期間</FieldTitle>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Input type="date" label="From 由" {...register("disabledFrom")} />
                      <Input type="date" label="To 至" {...register("disabledTo")} />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-hsbc-gray-200">
                    <FieldTitle>Is the injured person still totally disabled? 傷者現時是否仍然完全喪失工作能力?</FieldTitle>
                    <div className="flex gap-4">
                      <Checkbox
                        label="Yes 是"
                        {...register("isStillDisabled")}
                      />
                    </div>
                    {!watch("isStillDisabled") && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <Input 
                          type="date" 
                          label="Return to work date 恢復工作能力的日期" 
                          {...register("partialDisabilityDate")}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Section 5: Hospitalization */}
          {currentStep === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <Card>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-hsbc-black mb-2">Hospitalization & Others</h2>
                </div>

                <div className="space-y-10">
                  <section className="space-y-4">
                    <FieldTitle>Was the injured person hospitalized? 傷者有否就此次意外而住院?</FieldTitle>
                    <Checkbox label="Yes 是" {...register("isHospitalized")} />
                    
                    {isHospitalized && (
                      <div className="mt-4 p-4 bg-hsbc-gray-50 border border-hsbc-gray-200 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-4">
                        <Input label="Name of Hospital 醫院名稱" {...register("hospitalName")} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input type="date" label="Admission Date 入院日期" {...register("admissionDate")} />
                          <Input type="date" label="Discharge Date 離院日期" {...register("dischargeDate")} />
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="space-y-4 pt-6 border-t border-hsbc-gray-200">
                    <FieldTitle>Any concurrent insurance claim? 有否同時向其他保險公司提出索償?</FieldTitle>
                    <Checkbox label="Yes 是" {...register("hasConcurrentClaim")} />
                    
                    {hasConcurrentClaim && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                        <Input 
                          label="Company Name & Policy No. 公司名稱及保單編號" 
                          {...register("concurrentClaimDetails")}
                        />
                      </div>
                    )}
                  </section>
                </div>
              </Card>
            </div>
          )}

          {/* Section 6: Payment */}
          {currentStep === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <Card>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-hsbc-black mb-2">Payment Method</h2>
                </div>

                <div className="space-y-8">
                  <RadioGroup>
                    <RadioButton
                      label="Cheque (HKD) 支票 (港幣)"
                      value="Cheque"
                      {...register("paymentMethod")}
                    />
                    <RadioButton
                      label="Autopay (HKD) 自動轉賬 (港幣)"
                      value="Autopay"
                      {...register("paymentMethod")}
                    />
                  </RadioGroup>

                  {paymentMethod === "Autopay" && (
                    <div className="p-4 bg-hsbc-gray-50 border border-hsbc-gray-200 rounded-lg space-y-6 animate-in fade-in slide-in-from-top-4">
                      <Input label="Bank Name 銀行名稱" {...register("bankName")} />
                      <Input label="Account Holder Name 戶口持有人姓名" {...register("accountHolderName")} />
                      <div className="grid grid-cols-3 gap-2">
                        <Input label="Bank" maxLength={3} {...register("bankCode")} />
                        <Input label="Branch" maxLength={3} {...register("branchCode")} />
                        <Input label="Account" {...register("accountNo")} />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Section 7: Declaration */}
          {currentStep === 6 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <Card>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-hsbc-black mb-2">Review</h2>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <div 
                      ref={scrollRef}
                      onScroll={handleScroll}
                      className="bg-gray-50 p-6 rounded-lg h-96 overflow-y-auto text-sm text-gray-700 leading-relaxed border border-gray-200"
                    >
                      <div className="text-center font-medium text-gray-500 mb-6 border-b border-gray-200 pb-2">--- Start of content ---</div>

                      <h3 className="font-bold text-lg mb-4">Sample Terms and Conditions</h3>
                      <p className="mb-4 text-xs text-gray-500">Please read these terms and conditions ("terms and conditions", "terms") carefully before using [website URL] website ("website", "service") operated by [company name] ("us", "we", "our").</p>
                      
                      <h4 className="font-bold mb-2 mt-6">Conditions of use</h4>
                      <p className="mb-4">By using this website, you certify that you have read and reviewed this Agreement and that you agree to comply with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to stop using the website accordingly. [company name] only grants use and access of this website, its products, and its services to those who have accepted its terms.</p>

                      <h4 className="font-bold mb-2 mt-6">Privacy policy</h4>
                      <p className="mb-4">Before you continue using our website, we advise you to read our privacy policy [link to privacy policy] regarding our user data collection. It will help you better understand our practices.</p>

                      <h4 className="font-bold mb-2 mt-6">Age restriction</h4>
                      <p className="mb-4">You must be at least 18 (eighteen) years of age before you can use this website. By using this website, you warrant that you are at least 18 years of age and you may legally adhere to this Agreement. [company name] assumes no responsibility for liabilities related to age misrepresentation.</p>

                      <h4 className="font-bold mb-2 mt-6">Intellectual property</h4>
                      <p className="mb-4">You agree that all materials, products, and services provided on this website are the property of [company name], its affiliates, directors, officers, employees, agents, suppliers, or licensors including all copyrights, trade secrets, trademarks, patents, and other intellectual property. You also agree that you will not reproduce or redistribute the [company name]'s intellectual property in any way, including electronic, digital, or new trademark registrations.</p>
                      
                      <h4 className="font-bold mb-2 mt-6">Applicable law</h4>
                      <p className="mb-4">By using this website, you agree that the laws of the [your location], without regard to principles of conflict laws, will govern these terms and conditions, or any dispute of any sort that might come between [company name] and you, or its business partners and associates.</p>

                      <h4 className="font-bold mb-2 mt-6">Disputes</h4>
                      <p className="mb-4">Any dispute related in any way to your use of this website or to products you purchase from us shall be arbitrated by state or federal court [your location] and you consent to exclusive jurisdiction and venue of such courts.</p>

                      <h4 className="font-bold mb-2 mt-6">Indemnification</h4>
                      <p className="mb-4">You agree to indemnify [company name] and its affiliates and hold [company name] harmless against legal claims and demands that may arise from your use or misuse of our services. We reserve the right to select our own legal counsel.</p>

                      <h4 className="font-bold mb-2 mt-6">Limitation on liability</h4>
                      <p className="mb-4">[company name] is not liable for any damages that may occur to you as a result of your misuse of our website.</p>
                      <p className="mb-4">[company name] reserves the right to edit, modify, and change this Agreement at any time. We shall let our users know of these changes through electronic mail. This Agreement is an understanding between [company name] and the user, and this supersedes and replaces all prior agreements regarding the use of this website.</p>

                      <div className="text-center font-medium text-gray-500 mt-10 pt-4 border-t border-gray-200">
                          --- End of content ---
                      </div>
                    </div>
                  </div>
                  
                  <div className={`transition-opacity duration-300 ${hasScrolledToBottom ? 'opacity-100' : 'opacity-50'}`}>
                    <Checkbox
                      // @ts-ignore
                      {...register("declarationAccepted")}
                      disabled={!hasScrolledToBottom}
                      label="I have read and accepted the terms and conditions."
                      id="agree"
                    />
                    {!hasScrolledToBottom && (
                         <div className="text-sm text-hsbc-red font-medium mt-2 animate-pulse">
                            Scroll to the bottom of the terms to continue
                         </div>
                    )}
                    {/* @ts-ignore */}
                    {errors.declarationAccepted && (
                      // @ts-ignore
                      <p className="text-hsbc-red text-sm mt-1 ml-9">{errors.declarationAccepted.message}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Sticky Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-hsbc-gray-200 p-4 z-30 md:static md:bg-transparent md:border-none md:p-0 md:mt-8">
            <div className="max-w-4xl mx-auto flex gap-4">
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
                  onClick={nextStep}
                  className="flex-1"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  // @ts-ignore
                  disabled={!watch("declarationAccepted")}
                  className="flex-1 transition-all duration-300"
                >
                  Submit Claim
                </Button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
