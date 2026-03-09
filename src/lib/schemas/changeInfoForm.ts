import { z } from "zod";

export const changeInfoFormSchema = z.object({
  // Policy Information
  policyholderName: z.string().min(1, "Policyholder Name is required"),
  policyNumber: z.string().min(1, "Policy Number is required"),

  // Section 1: Customer Details
  customerType: z.array(z.enum(["Insured", "Policyholder", "Payor"])).optional(),
  fullName: z.string().optional(),
  formerName: z.string().optional(),
  tradingAs: z.string().optional(),
  idType: z.enum(["HKID", "Passport", "Birth Certificate"]).optional(),
  idNumber: z.string().optional(),
  giinNo: z.string().optional(),
  dateOfBirth: z.string().optional(),
  placeOfBirth: z.string().optional(),
  nationality1: z.string().optional(),
  nationality2: z.string().optional(),
  nationality3: z.string().optional(),
  
  // Tax Info
  usTaxId: z.string().optional(),
  localTaxId: z.string().optional(),
  localTaxCountry: z.string().optional(),

  // Employment Details
  employmentStatus: z.enum([
    "Self-Employed",
    "Full-time Employed",
    "Part-time Employed",
    "Not Currently Employed",
    "Student",
    "Housewife",
    "Retired"
  ]).optional(),
  industry: z.string().optional(),
  occupation: z.string().optional(),
  jobTitle: z.string().optional(),
  employmentStartDate: z.string().optional(),
  employerName: z.string().optional(),
  monthlySalary: z.string().optional(),

  // Section 2: Contact Information
  applyToAllPolicies: z.boolean().default(false),
  homeNumber: z.string().optional(),
  homeCountryCode: z.string().optional(),
  workNumber: z.string().optional(),
  workCountryCode: z.string().optional(),
  mobileNumber: z.string().optional().refine((val) => !val || val.length >= 8, {
    message: "Mobile number must be at least 8 digits",
  }),
  mobileCountryCode: z.string().default("+852"),
  emailAddress: z.string().optional().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: "Invalid email address",
  }),

  // Address Details
  addressType: z.array(z.string()).optional(),
  roomFlat: z.string().optional(),
  floor: z.string().optional(),
  block: z.string().optional(),
  buildingName: z.string().optional(),
  estateName: z.string().optional(),
  streetDetails: z.string().optional(),
  district: z.enum(["Hong Kong", "Kowloon", "New Territories"]).optional(),
  
  // Overseas Address
  isOverseas: z.boolean().default(false),
  overseasCountry: z.string().optional(),
  postalCode: z.string().optional(),
  overseasReason: z.string().optional(),

  // Section 3: Accounts to be Updated (Retaining existing logic if applicable)
  updateScope: z.enum(["All", "Specified"]).default("All"),
  specifiedAccounts: z.string().optional(),

  // Section 4: Regulatory (Retaining)
  isTaxResidentChanged: z.boolean().default(false),

  // Section 5: Declaration
  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the declaration to proceed",
  }),
});

export type ChangeInfoFormData = z.infer<typeof changeInfoFormSchema>;
