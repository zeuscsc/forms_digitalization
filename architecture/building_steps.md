# Step-by-Step Conversion: PDF to Digital Form

This document outlines the systematic process used to convert the `raw_forms\Change_of_Customer_Information.pdf` into a functional, multi-step Next.js page (`src\app\change-info\page.tsx`).

---

## Phase 1: PDF Analysis & Data Extraction
**Goal:** Understand the structure, fields, and logic of the original paper form.

1.  **PDF Parsing (PDF MCP):**
    *   Utilize a PDF MCP server to extract text and identify form fields from `raw_forms\Change_of_Customer_Information.pdf`.
    *   Map out every field, including data types (string, date, boolean), optional/required status, and conditional logic (e.g., "If overseas, provide country").
    *   Extract legal text and declarations for use in the digital version.

2.  **Section Identification:**
    *   Divide the form into logical groups:
        *   Policy Information
        *   1. Personal Details Change
        *   2. Contact Information (Mobile/Email/Address)
        *   3. Accounts to be Updated
        *   4. Regulatory Requirements
        *   5. Declaration & Authorization

---

## Phase 2: Schema Definition (Zod)
**Goal:** Create a "source of truth" for data validation.

1.  **Drafting `changeInfoForm.ts`:**
    *   Create a Zod schema in `src\lib\schemas\changeInfoForm.ts` that mirrors the extracted fields.
    *   Implement specific validation rules (e.g., email regex, minimum length for mobile numbers, required boolean for declarations).
    *   Export the `ChangeInfoFormData` type for use in the frontend.

---

## Phase 3: Design Alignment (Figma MCP)
**Goal:** Ensure the UI follows HSBC's Global Design System (GDS) standards.

1.  **Token Extraction (Figma MCP):**
    *   Query the Figma MCP to retrieve official HSBC design tokens:
        *   **Colors:** `hsbc-red (#DB0011)`, `hsbc-black (#000000)`, `hsbc-gray-100/200/400`.
        *   **Typography:** Univers Next font weights and sizes.
        *   **Spacing:** Standard padding and margin increments.
    *   Reference existing mobile UI screenshots in `screenshots\mobile ui\` to ensure consistency with the "Mobile-First" strategy.

2.  **Component Selection:**
    *   Identify necessary UI components from the existing library (`src\components\ui\`):
        *   `Input`, `Checkbox`, `RadioGroup`, `SectionHeader`, `Button`, `MobileStatusBar`.

---

## Phase 4: Implementation (Next.js & React Hook Form)
**Goal:** Build the interactive, multi-step user experience.

1.  **Page Scaffolding:**
    *   Create `src\app\change-info\page.tsx` as a "use client" component.
    *   Initialize `useForm` with the `zodResolver` and the schema from Phase 2.

2.  **Multi-step Logic:**
    *   Define an array of `STEPS` (Policy, Personal, Employment, Contact, Declaration).
    *   Implement a `currentStep` state to handle navigation.
    *   Add validation triggers (`trigger()`) to ensure the user cannot proceed to the next step without completing required fields.

3.  **Component Mapping:**
    *   Map the fields from the Zod schema to the UI components.
    *   Implement conditional rendering (e.g., showing overseas address fields only when `isOverseas` is checked).

4.  **Declaration Interactivity:**
    *   Implement the "Scroll-to-Bottom" requirement for the declaration section using a `scrollRef` and scroll event listener to ensure legal compliance.

---

## Phase 5: Testing & Validation
**Goal:** Ensure technical and visual integrity.

1.  **Form Validation:**
    *   Test edge cases: partial data, invalid email formats, and un-ticked declarations.
    *   Verify that error messages appear correctly under the relevant fields.

2.  **UI Verification:**
    *   Compare the rendered output against the original PDF and the expected HSBC aesthetic.
    *   Check responsiveness on the `max-w-md` container (Mobile-First approach).

3.  **Build Check:**
    *   Run `npm run build` to ensure no TypeScript errors or linting issues exist in the final implementation.
