import { z } from "zod";

export const claimFormSchema = z.object({
  // Section 1: Policy Details
  policyNo: z.string().min(1, "Policy No. is required"),
  claimNo: z.string().optional(),
  nameOfInsured: z.string().min(1, "Name of Insured is required"),
  phoneNo: z.string().min(1, "Phone No. is required"),
  address: z.string().min(1, "Address is required"),

  // Section 2: Insured Person Details
  insuredPersonName: z.string().min(1, "Name of Insured Person is required"),
  age: z.number().min(0, "Age must be a positive number"),
  sex: z.enum(["Male", "Female", "Other"]),
  occupation: z.string().min(1, "Occupation is required"),
  relationshipToInsured: z.string().min(1, "Relationship is required"),

  // Section 3: Accident Details
  accidentDate: z.string().min(1, "Date of accident is required"),
  accidentTime: z.string().min(1, "Time of accident is required"),
  accidentPlace: z.string().min(1, "Place of accident is required"),
  accidentCause: z.string().min(1, "Description of cause and injuries is required"),

  // Section 4: Doctor Details
  doctorNameAndAddress: z.string().min(1, "Doctor's name and address is required"),
  doctorCertifyName: z.string().optional(),
  doctorInjuryDate: z.string().optional(),
  doctorInjuries: z.string().optional(),
  doctorComplicationDetails: z.string().optional(),
  doctorDisabilityType: z.enum(["totally", "partially"]).optional(),
  doctorDisabledUntil: z.string().optional(),
  doctorSignatureDate: z.string().optional(),
  doctorQualifications: z.string().optional(),

  // Section 5: Disability
  disabledFrom: z.string().optional(),
  disabledTo: z.string().optional(),
  isStillDisabled: z.boolean().default(false),
  partialDisabilityDate: z.string().optional(),

  // Section 6: Hospitalization
  isHospitalized: z.boolean().default(false),
  hospitalName: z.string().optional(),
  hospitalAddress: z.string().optional(),
  admissionDate: z.string().optional(),
  admissionTime: z.string().optional(),
  dischargeDate: z.string().optional(),
  dischargeTime: z.string().optional(),

  // Section 7: Other Claims
  hasConcurrentClaim: z.boolean().default(false),
  concurrentClaimDetails: z.string().optional(),

  // Payment Method
  paymentMethod: z.enum(["Cheque", "Autopay"]),
  
  // Bank Details (if Autopay)
  bankName: z.string().optional(),
  accountHolderName: z.string().optional(),
  bankCode: z.string().optional(),
  branchCode: z.string().optional(),
  accountNo: z.string().optional(),
});

export type ClaimFormData = z.infer<typeof claimFormSchema>;
