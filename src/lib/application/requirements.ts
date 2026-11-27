import { z } from "zod";

export const fleetSupportEmail = "support@fastmet.com.ph";

// These names also identify the document slots in the backend upload contract.
export const requirementFields = [
  "logo",
  "repGovernmentId",
  "registrationDocument",
  "businessPermit",
  "birCertificate",
] as const;
export const requirementLabels = {
  logo: "Company logo",
  repGovernmentId: "Representative government ID",
  registrationDocument: "Business registration",
  businessPermit: "Business permit",
  birCertificate: "BIR certificate",
};
export const maxRequirementBytes = 10 * 1024 ** 2;

export const requirementsSchema = z.object({
  status: z.enum(["needs_update", "under_review"]),
  round: z.number().int().positive(),
  documents: z.array(
    z.object({
      field: z.enum(requirementFields),
      originalName: z.string().optional(),
      revision: z.number().int().positive(),
      canPreview: z.boolean().optional(),
      status: z.enum(["pending", "approved", "needs_update"]),
      reason: z.string().optional(),
    }),
  ),
});

export type Requirements = z.infer<typeof requirementsSchema>;
export type Requirement = Requirements["documents"][number];
export type RequirementField = Requirement["field"];
export const requirementsApi = "/api/fleet/application/requirements";
