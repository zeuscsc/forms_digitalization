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
  const hasConcurrentClaim = watch("hasConcurrentClaim");

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 px-4 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-hsbc-red flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <h1 className="text-xl font-bold text-hsbc-black uppercase tracking-tight">HSBC 滙豐</h1>
            </div>
            <div className="h-8 w-px bg-gray-300 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#00008f] flex items-center justify-center">
                <span className="text-white font-bold text-xl italic">AXA</span>
              </div>
              <h1 className="text-xl font-bold text-[#00008f] uppercase tracking-tight">安盛</h1>
            </div>
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
              <SectionHeader title="3. DATE, TIME AND PLACE OF ACCIDENT 意外發生的日期、時間和地點" />
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

            {/* Section 4: Medical Certificate */}
            <section>
              <SectionHeader 
                title="4. MEDICAL CERTIFICATE 醫療證明" 
                subtitle="(To be completed by Insured Person’s Doctor 由受保人主診醫生填寫) It is understood that this certificate will be completed on the basis of your existing knowledge and without undertaking any further examination. 此醫療證明是閣下根據本身之醫學常識填報，並沒有進行任何檢驗。"
              />
              <div className="space-y-8">
                <Input
                  label="Name and address of attending doctor 診症醫生姓名及地址"
                  placeholder="Doctor / Clinic name and full address"
                  {...register("doctorNameAndAddress")}
                  error={errors.doctorNameAndAddress?.message}
                />
                
                <Card className="p-6 bg-hsbc-gray-100/30 border-dashed border-2 border-hsbc-gray-300">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="I CERTIFY THAT 本人茲證明" {...register("doctorCertifyName")} />
                      <Input type="date" label="was injured on Day 於此日期受傷" {...register("doctorInjuryDate")} />
                    </div>
                    <Input label="His/Her injuries are 其傷勢為" {...register("doctorInjuries")} />
                    <Input label="If his/her injuries are complicated by any other conditions, give details 如病人的傷勢因某些情況而令病情更複雜，請列明詳情" {...register("doctorComplicationDetails")} />
                    
                    <div className="space-y-4">
                      <FieldTitle>He/She is solely and directly totally/partially disabled* as a result of the injuries and will be so disabled until 病人因這次受傷而致完全／部份殘廢*，直至</FieldTitle>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RadioGroup>
                          <RadioButton label="Totally disabled 完全殘廢" value="totally" {...register("doctorDisabilityType")} />
                          <RadioButton label="Partially disabled 部份殘廢" value="partially" {...register("doctorDisabilityType")} />
                        </RadioGroup>
                        <Input type="date" label="Until Day 直至此日期" {...register("doctorDisabledUntil")} />
                      </div>
                      <p className="text-[10px] text-hsbc-gray-400 italic">* Total Disablement occurs when the insured person is wholly prevented from attending to his business or occupation. Partial Disablement occurs when the insured person is prevented from attending to a substantial portion thereof. <br/> * 完全殘廢即受保人完全失去工作能力。部份殘廢即受保人不能從事大部份原來之工作。</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-hsbc-gray-300">
                      <Input type="date" label="Date 日期" {...register("doctorSignatureDate")} />
                      <Input label="Qualifications 資歷" {...register("doctorQualifications")} />
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Section 5: Disability */}
            <section>
              <SectionHeader 
                title="5. DISABILITY 傷殘狀況" 
              />
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <FieldTitle>(a) State the period during which the injured person has been totally disabled from attending to his/her normal occupation. 傷者完全失去工作能力的期間</FieldTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <Input type="date" label="From 由" {...register("disabledFrom")} />
                      <Input type="date" label="To 至" {...register("disabledTo")} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <FieldTitle>(b) Is the injured person still totally disabled? 傷者現時是否仍然完全喪失工作能力?</FieldTitle>
                  <Checkbox
                    label="Yes 是"
                    {...register("isStillDisabled")}
                  />
                  {!watch("isStillDisabled") && (
                    <div className="pl-6 pt-2 animate-in fade-in slide-in-from-top-2">
                      <Input 
                        type="date" 
                        label="If not, from what date was the injured person able to attend to some part of his/her occupation? 如答案是「否定」, 傷者恢復工作能力的日期是" 
                        {...register("partialDisabilityDate")}
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 6: Hospitalization */}
            <section>
              <SectionHeader 
                title="6. HOSPITALIZATION 住院情況" 
              />
              <div className="space-y-6">
                <div className="space-y-4">
                  <FieldTitle>Whether the injured person is or was hospitalized as a result of the accident? 傷者有否就此次意外而住院?</FieldTitle>
                  <Checkbox
                    label="Yes 是"
                    {...register("isHospitalized")}
                  />
                </div>

                {isHospitalized && (
                  <Card className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-hsbc-gray-100/30 animate-in fade-in slide-in-from-top-4">
                    <div className="md:col-span-2">
                      <FieldTitle>If Yes, please state 如有，請說明</FieldTitle>
                    </div>
                    <Input label="(a) Name of Hospital 醫院名稱" {...register("hospitalName")} />
                    <Input label="Address 地址" {...register("hospitalAddress")} />
                    <div className="md:col-span-2">
                      <FieldTitle>(b) Period of Hospital Confinement 住院期間</FieldTitle>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <Input type="date" label="Date of Admission 入院日期" {...register("admissionDate")} />
                          <Input type="time" label="Time 時間" {...register("admissionTime")} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input type="date" label="Date of Discharge 離院日期" {...register("dischargeDate")} />
                          <Input type="time" label="Time 時間" {...register("dischargeTime")} />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </section>

            {/* Section 7: Concurrent Claim */}
            <section>
              <SectionHeader 
                title="7. CONCURRENT CLAIM 同時索償" 
              />
              <div className="space-y-6">
                <div className="space-y-4">
                  <FieldTitle>Any concurrent claim about this accident with other insurance companies? 有否就此意外同時向其他保險公司提出索償?</FieldTitle>
                  <Checkbox
                    label="Yes 是"
                    {...register("hasConcurrentClaim")}
                  />
                </div>

                {hasConcurrentClaim && (
                  <div className="pl-6 animate-in fade-in slide-in-from-top-2">
                    <Input 
                      label="If Yes, please state the name of the company and the policy number 如有，請列明其公司名稱及保單編號" 
                      placeholder="Enter company name and policy number"
                      {...register("concurrentClaimDetails")}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Payment Method Instructions */}
            <section>
              <SectionHeader title="CLAIM PAYMENT METHOD 賠償支付方式" />
              <div className="mb-6 p-6 bg-hsbc-gray-100 border-l-4 border-hsbc-red text-[11px] text-hsbc-black space-y-4 leading-relaxed">
                <div className="space-y-2">
                  <p>
                    1. (a) If the claim payment method “Autopay to bank account” is chosen, please provide Insured/Insured Person/Eligible Person/Claimant’s bank account proof showing account holder name and account number (e.g. copy of bank book, ATM card or bank statement etc).
                    <br/>
                    <span className="text-hsbc-gray-400">凡選擇以「自動轉賬至銀行戶口」方式收取索償款項，請同時提交印有投保人/受保人/合資格人士/索償人士全名及銀行戶口號碼之戶口證明。</span>
                  </p>
                  <p>
                    (b) For Insured/Insured Person/Eligible Person/Claimant who is an individual, only personal banking saving/current accounts will be accepted by AXA General Insurance Hong Kong Limited (“AXA”).
                    <br/>
                    <span className="text-hsbc-gray-400">投保人 / 受保人 / 合資格人士 / 索償人士是個人客戶，安盛保險有限公司（「AXA 安盛」）只接受個人銀行儲蓄 / 支票戶口。</span>
                  </p>
                  <p>
                    (c) For Insured/Insured Person/Eligible Person/Claimant who is a corporate entity, only commercial banking saving/current accounts will be accepted by AXA.
                    <br/>
                    <span className="text-hsbc-gray-400">投保人 / 受保人 / 合資格人士 / 索償人士是公司客戶，AXA 安盛只接受公司銀行儲蓄 / 支票戶口。</span>
                  </p>
                  <p>
                    (d) AXA will only pay/transfer Hong Kong Dollars to the designated bank account.
                    <br/>
                    <span className="text-hsbc-gray-400">AXA 安盛將只支付 / 轉賬港元到指定之銀行戶口。</span>
                  </p>
                  <p>
                    (e) If the bank transfer payment is rejected, declined or unsuccessful, a cheque will be issued to Insured/Insured Person/Eligible Person/Claimant and posted to address stated on the claim form instead without further notice.
                    <br/>
                    <span className="text-hsbc-gray-400">如銀行轉賬被拒絕或不成功，款項將以支票形式寄予投保人 / 受保人 / 合資格人士 / 索償人士於索償書上所提供的地址，而恕不另行通知。</span>
                  </p>
                </div>
                <p>
                  2. If the claim payments are settled in currencies other than the policy currency(ies), the payment amounts would be subject to change according to the prevailing exchange rate determined by AXA from time to time. The fluctuation in exchange rates may have impact on the payment amounts. You are subject to exchange rate risks. Exchange rate fluctuates from time to time. You may suffer a loss of your benefit values as a result of the exchange rate fluctuations.
                  <br/>
                  <span className="text-hsbc-gray-400">如索償款項的貨幣不是保單貨幣，該款項可能曾受 AXA 安盛不時釐定的匯率而改變。匯率之波動會對索償款項構成影響。您須承受匯率風險。匯率會不時波動，您可能因匯率之波動而損失部分的利益價值。</span>
                </p>
                <p>
                  3. AXA reserves the right to determine the claim payment method at its absolute discretion.
                  <br/>
                  <span className="text-hsbc-gray-400">AXA 安盛保留權利自行決定其索償款項的付款方式。</span>
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
                    <div className="space-y-4 md:col-span-2">
                      <FieldTitle>Full Name in English of Account Holder(s) 銀行戶口持有人的英文姓名</FieldTitle>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="(1)" placeholder="Primary holder" {...register("accountHolderName")} />
                        <Input label="(2)" placeholder="Joint holder (if applicable)" />
                      </div>
                    </div>
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
                  1. 本人／我們謹此聲明及同意(1)上述一切陳述及問題的所有答案，不論是否本人／我們親手所寫，就本人／我們所知悉，均為事實全部並確實無訛；(2)貴公司(「安盛」)不須受本人／我們對任何人士所作出之任何口頭聲明之約束。
                </p>
                <p>
                  2. I/WE, HEREBY AUTHORIZE (1) any employer, medical practitioner, paramedical examiners, hospital, clinic, insurance company, bank, financial institution, police, government institution, or other organization, institution or person, that has any records or knowledge of me/us to disclose such information to the Company (2) the Company or any of its appointed medical examiners, paramedical examiners or laboratories to perform the necessary medical assessments and tests to evaluate in relation to this claim. 
                </p>
                <p className="text-hsbc-gray-400">
                  2. 本人／我們茲授權(1)任何僱主、註冊西醫、醫療人員、醫院、診所、保險公司、銀行、財務機構、警察、政府機構、或其他組織、人仕、凡知道或持有任何有關本人／我們之紀錄或資料，均可將該等資料提供給貴公司；(2)貴公司或任何其指定之醫生或化驗所，可就此索償申請替本人／我們進行所需之醫療評估及測試。
                </p>
                <p>
                  3. I/WE ACKNOWLEDGE AND CONFIRM THAT I/we have read and understood the Personal Information Collection Statement (“PICS”). I/we confirm that I/we have been advised to read carefully the PICS, and I/we have read it carefully its effect and impact in respect of my/our personal data collected or held by the Company.
                </p>
                <p className="text-hsbc-gray-400">
                  3. 本人／我們確認認人／我們已閱讀並明白自收集個人資料的聲明(《該聲明》)。本人／我們確認本人／我們已獲建議仔細閱讀該聲明，且本人／我們已仔細閱讀該聲明就貴公司收集或持有的本人／我們個人資料的影響及衝擊。
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

            {/* PICS Section */}
            <section className="p-6 border border-gray-200 rounded-md">
              <h3 className="text-lg font-bold text-hsbc-black mb-4 uppercase">PERSONAL INFORMATION COLLECTION STATEMENT 收集個人資料聲明</h3>
              <div className="text-[10px] leading-relaxed text-hsbc-gray-400 space-y-3 max-h-48 overflow-y-auto pr-4 custom-scrollbar">
                <p>
                  AXA General Insurance Hong Kong Limited (referred to hereinafter as the "Company") recognises its responsibilities in relation to the collection, holding, processing, use and/or transfer of personal data under the Personal Data (Privacy) Ordinance (Cap. 486) ("PDPO"). Personal data will be collected only for lawful and relevant purposes and all practicable steps will be taken to ensure that personal data held by the Company is accurate. The Company will take all practicable steps to ensure security of the personal data and to avoid unauthorised or accidental access, erasure or other use.
                </p>
                <p>
                  安盛保險有限公司（下稱「本公司」）明白其就《個人資料（私隱）條例》（香港法例第 486 章）（「條例」）收集、持有、處理、使用及／或轉移個人資料所負有的責任。本公司僅將為合法及相關的目的收集個人資料，並將採取一切切實可行的步驟，確保本公司所持個人資料準確無訛。本公司將採取一切切實可行的步驟，確保個人資料的安全，及避免發生未經授權或出於意外的查閱、刪除或另行使用個人資料的情況。
                </p>
                <p>
                  Purpose: From time to time it is necessary for the Company to collect your personal data (including credit information and claims history) which may be used, stored, processed, transferred, disclosed or shared by us for purposes (“Purposes”), including:
                </p>
                <p>
                  目的：本公司不時有必要收集閣下的個人資料（包括信貸資料及以往索償紀錄），並可能因下列各項目的（「有關目的」）而被本公司使用、貯存、處理、轉移、披露或共享該等個人資料：
                </p>
                <ul className="list-decimal pl-4 space-y-1">
                  <li>offering, providing and marketing to you the products/services of the Company...</li>
                  <li>processing and evaluating any applications or requests made by you for products/services...</li>
                  <li>providing subsequent services to you, including but not limited to administering the policies issued...</li>
                  <li>any purposes in connection with any claims made by or against or otherwise involving you...</li>
                  {/* Truncated for brevity in this example, but in a real app would include all points */}
                </ul>
              </div>
            </section>

            <div className="pt-8 border-t flex flex-col gap-6">
              <div className="space-y-4">
                <p className="text-[10px] text-hsbc-gray-400">
                  <strong>Important Notes 重要事項：</strong>
                </p>
                <div className="text-[10px] text-hsbc-gray-400 leading-relaxed space-y-2">
                  <p>
                    The above policy is underwritten by AXA General Insurance Hong Kong Limited ("AXA"). AXA is authorised and regulated by the Insurance Authority of the Hong Kong SAR. AXA is responsible for providing your insurance coverage and handling claims under your policy. 
                  </p>
                  <p>
                    上述保單由安盛保險(香港)有限公司(「AXA 安盛」)承保。AXA 安盛已獲香港特別行政區保險業監管局授權及受其監管。AXA 安盛負責提供保險保障及處理保單項下的索償。
                  </p>
                  <p>
                    The Hongkong and Shanghai Banking Corporation Limited is registered in the Insurance Ordinance (Cap. 41 of the Laws of Hong Kong) as an insurance agent of AXA for distribution of general insurance products in the Hong Kong SAR.
                  </p>
                  <p>
                    香港上海滙豐銀行有限公司已根據《保險業條例》（香港法例第 41 章）註冊為 AXA 安盛於香港特別行政區分銷一般保險產品的保險代理。
                  </p>
                  <p>
                    In the event of any inconsistency between the English version and the Chinese version, the English version shall prevail. 如中英文版本有任何歧義，以此英文版本為準。
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[9px] text-hsbc-gray-400">
                  Issued by AXA General Insurance Hong Kong Limited 由安盛保險有限公司刊發
                </p>
                <div className="flex gap-4 w-full md:w-auto">
                  <Button type="button" variant="outline" className="flex-1 md:flex-none">Save Draft 儲存草稿</Button>
                  <Button type="submit" className="flex-1 md:flex-none">Submit Claim 提交索償</Button>
                </div>
              </div>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
