import { z } from "zod";

export const generatedSchema = z.object({
  // Policy Information
  policyNumber: z.string().min(1, "Policy Number is required"),
  policyholderName: z.string().min(1, "Policyholder Name is required"),

  // Section 1: Change or correction of personal details
  relationToPolicy: z.array(z.string()).min(1, "Please select at least one relation"),
  fullName: z.string().min(1, "Full Name is required"),
  formerName: z.string().optional(),
  tradingAs: z.string().optional(),
  idTypeAndNo: z.string().min(1, "ID Type & No is required"),
  giinNo: z.string().optional(),
  dob: z.string().min(1, "Date of Birth is required"),
  placeOfBirth: z.string().min(1, "Place of Birth is required"),
  nationality1: z.string().min(1, "Nationality 1 is required"),
  nationality2: z.string().optional(),
  nationality3: z.string().optional(),
  usTaxId: z.string().optional(),
  localTaxId: z.string().optional(),
  countryOfLocalTaxId: z.string().optional(),
  employmentStatus: z.string().min(1, "Employment Status is required"),
  industry: z.string().optional(),
  occupation: z.string().optional(),
  jobTitle: z.string().optional(),
  employmentStartDate: z.string().optional(),
  employerName: z.string().optional(),
  monthlySalary: z.string().optional(),

  // Section 2: Change of Contact Information
  homeTelCountry: z.string().optional(),
  homeTelNo: z.string().optional(),
  workTelCountry: z.string().optional(),
  workTelNo: z.string().optional(),
  mobileTelCountry: z.string().optional(),
  mobileTelNo: z.string().optional(),
  emailAddress: z.string().email("Invalid email address").optional().or(z.literal("")),

  // Address
  addressType: z.array(z.string()).min(1, "Please select at least one address type"),
  roomFlatBlock: z.string().optional(),
  floor: z.string().optional(),
  block: z.string().optional(),
  buildingName: z.string().optional(),
  estateName: z.string().optional(),
  streetName: z.string().optional(),
  district: z.string().optional(),
  overseasCountry: z.string().optional(),
  overseasPostalCode: z.string().optional(),
  overseasReason: z.string().optional(),

  // Section 4: Contingent Policyholder
  contingentNameEnglish: z.string().optional(),
  contingentNameChinese: z.string().optional(),
  contingentIdNo: z.string().optional(),
  contingentDob: z.string().optional(),
  contingentRelationship: z.string().optional(),
  contingentContactNo: z.string().optional(),
  contingentAddress: z.string().optional(),

  // Section 5: Update Occupation Details
  occUpdateEmploymentStatus: z.string().optional(),
  occUpdateIndustry: z.string().optional(),
  occUpdateOccupation: z.string().optional(),
  occUpdateStartDate: z.string().optional(),
  occUpdateEmployerName: z.string().optional(),
  occUpdateMonthlySalary: z.string().optional(),
  mainSourceOfIncome: z.array(z.string()).optional(),
  otherSourceOfIncome: z.string().optional(),

  // Declaration
  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the declaration to proceed",
  }),
});

export type GeneratedFormData = z.infer<typeof generatedSchema>;
