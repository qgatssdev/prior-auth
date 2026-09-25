// Plain-English labels for the billing codes used in this demo.
export const CODE_LABELS: Record<string, string> = {
  "67028": "intravitreal injection",
  J0178: "aflibercept",
  "66984": "cataract surgery with lens implant",
  "67210": "retina laser treatment",
  "H35.32": "wet age-related macular degeneration",
  "H25.9": "age-related cataract",
};

export const codeLabel = (code: string) => CODE_LABELS[code] ?? "";

// The treatments offered in the New request form, with the codes they fill in.
export const TREATMENTS = [
  {
    name: "Aflibercept injection",
    cptCode: "67028",
    extraCodes: ["J0178"],
    icd10Code: "H35.32",
  },
  {
    name: "Cataract surgery",
    cptCode: "66984",
    extraCodes: [],
    icd10Code: "H25.9",
  },
  {
    name: "Retina laser",
    cptCode: "67210",
    extraCodes: [],
    icd10Code: "H35.32",
  },
];

// Procedure codes for a case: the CPT code plus any drug code that goes with it (J0178).
export const procedureCodes = (treatmentName: string, cptCode: string) => [
  cptCode,
  ...(TREATMENTS.find((t) => t.name === treatmentName)?.extraCodes ?? []),
];
