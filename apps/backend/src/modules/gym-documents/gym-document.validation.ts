import { z } from 'zod';

export const documentTypeEnum = z.enum([
  'business_license',
  'owner_id_proof',
  'gym_photo',
  'utility_bill',
  'other',
]);

export const updateDocumentStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export type DocumentType = z.infer<typeof documentTypeEnum>;
