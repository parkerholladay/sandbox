import { z } from 'zod'

const requiredText = z.string().trim().min(1, 'This field is required.')
const email = z.email('Enter a valid email address.')
const date = z.iso.date('Enter a valid date.')

const studentSchema = z.strictObject({
  name: requiredText,
  grade: requiredText,
})

const guardianWithEmailSchema = z.strictObject({
  name: requiredText,
  email,
})

const guardianWithPhoneSchema = z.strictObject({
  name: requiredText,
  phone: requiredText,
})

const absenceSchema = z
  .strictObject({
    student: studentSchema,
    guardian: guardianWithEmailSchema,
    startDate: date,
    endDate: date,
    reason: z.enum(['illness', 'family', 'appointment', 'other']),
    reasonDetails: requiredText.optional(),
  })
  .refine((submission) => submission.endDate >= submission.startDate, {
    message: 'The last day absent must be the same as or after the first day.',
    path: ['endDate'],
  })
  .refine((submission) => submission.reason !== 'other' || Boolean(submission.reasonDetails?.trim()), {
    message: 'Please describe the reason for the absence.',
    path: ['reasonDetails'],
  })

const permissionSchema = z
  .strictObject({
    student: studentSchema,
    guardian: guardianWithPhoneSchema,
    tripName: requiredText,
    tripDate: date,
    permission: z.enum(['yes', 'no']),
    hasMedicalNeeds: z.boolean(),
    medicalDetails: requiredText.optional(),
    acknowledged: z.literal(true, 'Please confirm your permission choice.'),
  })
  .refine(
    (submission) => !submission.hasMedicalNeeds || Boolean(submission.medicalDetails?.trim()),
    {
      message: 'Please provide the relevant medical details.',
      path: ['medicalDetails'],
    },
  )

const contactSchema = z
  .strictObject({
    name: requiredText,
    relationship: requiredText,
    phone: requiredText,
    preferredMethod: z.enum(['phone', 'email']),
    email: email.optional(),
  })
  .refine((contact) => contact.preferredMethod !== 'email' || contact.email !== undefined, {
    message: 'Email is required for your preferred contact method.',
    path: ['email'],
  })

const emergencyContactsSchema = z.strictObject({
  student: studentSchema,
  contacts: z.array(contactSchema).min(1, 'Add at least one emergency contact.'),
})

export const FORM_SUBMISSION_SCHEMAS = {
  'absence-report': absenceSchema,
  'field-trip-permission': permissionSchema,
  'emergency-contacts': emergencyContactsSchema,
}

export type FormType = keyof typeof FORM_SUBMISSION_SCHEMAS;

export type FormSubmissionByType = {
  [Type in FormType]: z.infer<(typeof FORM_SUBMISSION_SCHEMAS)[Type]>;
};
