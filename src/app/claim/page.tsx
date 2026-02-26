"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
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

export default function ClaimPage() {
  const {
    register,
    handleSubmit,
    control,
    watch,
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
    },
  });

  const onSubmit = (data: ClaimFormData) => {
    console.log("Form Data Submitted:", data);
    alert("Form submitted successfully! Check console for data.");
  };

  const isHospitalized = watch("isHospitalized");
  const paymentMethod = watch("paymentMethod");

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 px-4 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-hsbc-red flex items-center justify-center">
              <span className="text-white font-bold text-2xl">H</span>
            </div>
            <h1 className="text-2xl font-bold text-hsbc-black uppercase tracking-tight">HSBC 滙豐</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-hsbc-gray-400 font-medium">INAH018R10 (0225) W</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        <Card className="p-8 border-t-4 border-t-hsbc-red shadow-lg">
          {/* Main Title & Intro */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-hsbc-black mb-6">AccidentSurance Claim Form 意外萬全保索償書</h2>
            <div className="space-y-6 text-base text-hsbc-black leading-relaxed">
              <div className="border-l-4 border-hsbc-gray-300 pl-4">
                <p>
                  In the event that you or your insured family members have a serious accident that entitles you to benefit payments under the Accident Surance plan, simply fill out this Claim Form and return it to AXA General Insurance Hong Kong Limited.
                </p>
                <p className="text-hsbc-gray-400 mt-1">
                  當閣下或受保之家人在本保險單保障範圍內，遇到意外，祇需填妥此索償申請書，寄回安盛保險(香港)有限公司。
                </p>
              </div>
              <div className="border-l-4 border-hsbc-gray-300 pl-4">
                <p>
                  To ensure fast payment of your claim, check that you have filled out and signed all sections, and that you have attached all the original necessary supporting documents.
                </p>
                <p className="text-hsbc-gray-400 mt-1">
                  祇要閣下清楚填寫及簽署下列各項，並附上所有有關證明文件之正本，閣下的索償申請將會儘速處理。
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-16">
            {/* Section 1: Policy Details */}
            <section>
              <SectionHeader 
                title="1. POLICY & INSURED DETAILS 保單編號及受保人資料" 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Policy No. 保單編號"
                  placeholder="Enter policy number"
                  required
                  {...register("policyNo")}
                  error={errors.policyNo?.message}
                />
                <Input
                  label="Claim No. 索償編號 (For office use only 供本公司填寫之用)"
                  placeholder="Leave blank"
                  {...register("claimNo")}
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
                <div className="md:col-span-2">
                  <Input
                    label="Address 地址"
                    placeholder="Full correspondence address"
                    required
                    {...register("address")}
                    error={errors.address?.message}
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Insured Person Details */}
            <section>
              <SectionHeader 
                title="2. DETAILS OF PERSON INJURED 受傷人資料" 
                subtitle="(Please attach documentary evidence such as Birth Certificate or Marriage Certificate to show the relationship. 請附上有效之證明文件，如出生證明書或結婚證書，以茲證明受傷／死亡者與投保人之關係。)"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Name of Insured Person / Eligible Person Injured / Deceased 受傷／死亡之受保人／合資格人士姓名"
                    placeholder="Full name"
                    required
                    {...register("insuredPersonName")}
                    error={errors.insuredPersonName?.message}
                  />
                </div>
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
                <div className="flex flex-col">
                  <FieldTitle>Sex 性別</FieldTitle>
                  <RadioGroup className="h-11 items-center">
                    {["Male", "Female", "Other"].map((option) => (
                      <RadioButton
                        key={option}
                        label={option}
                        value={option}
                        {...register("sex")}
                      />
                    ))}
                  </RadioGroup>
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

            {/* Section 3: Accident Details */}
            <section>
              <SectionHeader title="3. ACCIDENT DETAILS 意外詳情" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <Input
                  label="Place of Accident 地點"
                  placeholder="City, Country, Specific location"
                  required
                  {...register("accidentPlace")}
                  error={errors.accidentPlace?.message}
                />
                <div className="md:col-span-3">
                  <Input
                    label="Give particulars of the cause, and injuries sustained 意外發生的原因及傷勢"
                    placeholder="Provide full particulars..."
                    required
                    {...register("accidentCause")}
                    error={errors.accidentCause?.message}
                  />
                </div>
              </div>
            </section>

            {/* Medical Certificate Section (Section 4 Wrapper) */}
            <section>
              <SectionHeader 
                title="Medical Certificate 醫療證明" 
                subtitle="(To be completed by Insured Person’s Doctor 由受保人主診醫生填寫) It is understood that this certificate will be completed on the basis of your existing knowledge and without undertaking any further examination. 此醫療證明是閣下根據本身之醫學常識填報，並沒有進行任何檢驗。"
              />
              
              <div className="space-y-6">
                <Input
                  label="Name and address of attending doctor 診症醫生姓名及地址"
                  placeholder="Doctor / Clinic name and full address"
                  {...register("doctorNameAndAddress")}
                  error={errors.doctorNameAndAddress?.message}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Checkbox
                    label="Whether the insured person was hospitalized as a result of the accident? 傷者有否就此次意外而住院?"
                    {...register("isHospitalized")}
                  />
                </div>

                {isHospitalized && (
                  <Card className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-hsbc-gray-100/30 animate-in fade-in slide-in-from-top-4">
                    <Input label="Name of Hospital 醫院名稱" {...register("hospitalName")} />
                    <Input label="Hospital Address 地址" {...register("hospitalAddress")} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="date" label="Admission Date 入院日期" {...register("admissionDate")} />
                      <Input type="time" label="Time 時間" {...register("admissionTime")} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="date" label="Discharge Date 離院日期" {...register("dischargeDate")} />
                      <Input type="time" label="Time 時間" {...register("dischargeTime")} />
                    </div>
                  </Card>
                )}
              </div>
            </section>

            {/* Payment Method Instructions */}
            <section>
              <SectionHeader title="CLAIM PAYMENT METHOD 賠償支付方式" />
              <div className="mb-6 p-4 bg-hsbc-gray-100 border-l-4 border-hsbc-red text-xs text-hsbc-black space-y-3">
                <p>
                  1. If the claim payment method “Autopay to bank account” is chosen, please provide Insured/Insured Person/Eligible Person/Claimant’s bank account proof showing account holder name and account number (e.g. copy of bank book, ATM card or bank statement etc).
                  <br/>
                  <span className="text-hsbc-gray-400">凡選擇以「自動轉賬至銀行戶口」方式收取索償款項，請同時提交印有投保人/受保人/合資格人士/索償人士全名及銀行戶口號碼之戶口證明。</span>
                </p>
                <p>
                  2. AXA will only pay/transfer Hong Kong Dollars to the designated bank account.
                  <br/>
                  <span className="text-hsbc-gray-400">安盛將祇支付/轉賬港元到指定之銀行戶口。</span>
                </p>
              </div>

              <div className="space-y-6">
                <RadioGroup>
                  <RadioButton
                    label="Cheque (To be drawn in Hong Kong Dollar) 支票 (以港幣結算)"
                    value="Cheque"
                    {...register("paymentMethod")}
                  />
                  <RadioButton
                    label="Autopay to bank account (By Hong Kong Dollar) 自動轉賬至銀行戶口 (以港幣結算)"
                    value="Autopay"
                    {...register("paymentMethod")}
                  />
                </RadioGroup>

                {paymentMethod === "Autopay" && (
                  <Card className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-hsbc-gray-100/30 animate-in fade-in slide-in-from-top-4">
                    <div className="md:col-span-2">
                      <h4 className="text-base font-medium text-hsbc-black font-hsbc border-b border-hsbc-gray-300 pb-2 mb-4 uppercase">Bank Account Information 銀行戶口資料</h4>
                    </div>
                    <Input label="Name of Bank 銀行名稱" {...register("bankName")} />
                    <Input label="Full Name in English of Account Holder(s) 銀行戶口持有人的英文姓名" {...register("accountHolderName")} />
                    <div className="grid grid-cols-3 gap-4 md:col-span-2">
                      <Input label="Bank Code 銀行編號" maxLength={3} {...register("bankCode")} />
                      <Input label="Branch Code 分行編號" maxLength={3} {...register("branchCode")} />
                      <Input label="Account No. 戶口號碼" {...register("accountNo")} />
                    </div>
                  </Card>
                )}
              </div>
            </section>

            {/* Declaration & Authorization */}
            <section className="bg-hsbc-gray-100 p-6 border-t border-hsbc-black">
              <h3 className="text-xl font-medium text-hsbc-black font-hsbc mb-4 uppercase">DECLARATION AND AUTHORIZATION 聲明及授權書</h3>
              <div className="text-[11px] leading-relaxed text-hsbc-black space-y-4 max-h-60 overflow-y-auto pr-4 custom-scrollbar">
                <p>
                  1. I/WE HEREBY DECLARE AND AGREE THAT (1) all statements and answers to all questions whether or not written by my/our own hand are to the best of my/our knowledge and belief complete and true; (2) AXA General Insurance Hong Kong Limited (the “Company”) is not bound by and is not required to rely on any statement which I/we may have made to any person if not written or printed here.
                </p>
                <p className="text-hsbc-gray-400">
                  本人／我們謹此聲明及同意(1)上述一切陳述及問題的所有答案，不論是否本人／我們親手所寫，就本人／我們所知悉，均為事實全部並確實無訛；(2)貴公司(「安盛」)不須受本人／我們對任何人士所作出之任何口頭聲明之約束。
                </p>
                <p>
                  2. I/WE, HEREBY AUTHORIZE (1) any employer, medical practitioner, paramedical examiners, hospital, clinic, insurance company, bank, financial institution, police, government institution, or other organization, institution or person, that has any records or knowledge of me/us to disclose such information to the Company (2) the Company or any of its appointed medical examiners, paramedical examiners or laboratories to perform the necessary medical assessments and tests to evaluate in relation to this claim. 
                </p>
                <p className="text-hsbc-gray-400">
                  本人／我們茲授權(1)任何僱主、註冊西醫、醫療人員、醫院、診所、保險公司、銀行、財務機構、警察、政府機構、或其他組織、人仕、凡知道或持有任何有關本人／我們之紀錄或資料，均可將該等資料提供給貴公司；(2)貴公司或任何其指定之醫生或化驗所，可就此索償申請替本人／我們進行所需之醫療評估及測試。
                </p>
                <p>
                  3. I/WE ACKNOWLEDGE AND CONFIRM THAT I/we have read and understood the Personal Information Collection Statement (“PICS”). I/we confirm that I/we have been advised to read carefully the PICS, and I/we have read it carefully its effect and impact in respect of my/our personal data collected or held by the Company.
                </p>
                <p className="text-hsbc-gray-400">
                  本人／我們確認認人／我們已閱讀並明白自收集個人資料的聲明(《該聲明》)。本人／我們已獲通知本人／我們已通過該通知本人／我們獲通知本人／我們獲通知。
                </p>
              </div>
              <div className="mt-6">
                <Checkbox
                  required
                  label="I/WE have read, understood and agree to the above Declaration and Authorization. 本人／我們已閱讀、明白及同意上述聲明及授權書。"
                  id="agree"
                />
              </div>
            </section>

            <div className="pt-8 border-t flex flex-col md:flex-row flex-wrap justify-between items-center gap-6">
              <p className="text-[10px] text-hsbc-gray-400 max-w-sm">
                The above policy is underwritten by AXA General Insurance Hong Kong Limited ("AXA"). AXA is responsible for providing your insurance coverage and handling claims under your policy. 
              </p>
              <div className="flex gap-4 w-full md:w-auto">
                <Button type="button" variant="outline" className="flex-1 md:flex-none">Save Draft 儲存草稿</Button>
                <Button type="submit" className="flex-1 md:flex-none">Submit Claim 提交索償</Button>
              </div>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
