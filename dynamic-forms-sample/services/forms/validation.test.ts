import { describe, expect, it } from 'vitest'

import { FORM_DEFINITION_SEEDS } from './seed'
import type { FormDefinition } from './types'
import { validateFormSubmission } from './validation'

const absence = FORM_DEFINITION_SEEDS.find((form) => form.type === 'absence-report')!
const permission = FORM_DEFINITION_SEEDS.find((form) => form.type === 'field-trip-permission')!
const contacts = FORM_DEFINITION_SEEDS.find((form) => form.type === 'emergency-contacts')!

function issuePaths(result: ReturnType<typeof validateFormSubmission>) {
  return result.success ? [] : result.error.issues.map((issue) => issue.path)
}

describe('#validateFormSubmission', () => {
  it('checks absence fields, conditionals, and chronological dates without mutating input', () => {
    const submission = {
      student: { name: 'Jamie Rivera', grade: '4' },
      guardian: { name: 'Alex Rivera', email: 'alex@example.test' },
      startDate: '2026-09-28',
      endDate: '2026-09-29',
      reason: 'illness',
      reasonDetails: 'Stale hidden value',
      extra: 'Discarded unknown value',
    }
    const original = structuredClone(submission)
    const parsed = validateFormSubmission(absence, submission)

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty('reasonDetails')
      expect(parsed.data).not.toHaveProperty('extra')
    }
    expect(submission).toEqual(original)

    const absenceWithoutDetails: Record<string, unknown> = structuredClone(submission)
    delete absenceWithoutDetails.reasonDetails
    const missingDetails = validateFormSubmission(absence, {
      ...absenceWithoutDetails,
      reason: 'other',
    })
    expect(issuePaths(missingDetails)).toContainEqual(['reasonDetails'])

    const reversedDates = validateFormSubmission(absence, {
      ...submission,
      startDate: '2026-09-30',
      endDate: '2026-09-29',
    })
    expect(issuePaths(reversedDates)).toContainEqual(['endDate'])
  })

  it('allows either permission choice and validates conditional medical details and acknowledgment', () => {
    const submission = {
      student: { name: 'Taylor Morgan', grade: '5' },
      guardian: { name: 'Casey Morgan', phone: '555-0100' },
      tripName: 'Science museum',
      tripDate: '2026-10-12',
      permission: 'no',
      hasMedicalNeeds: false,
      medicalDetails: 'Stale hidden value',
      acknowledged: true,
    }
    const declined = validateFormSubmission(permission, submission)

    expect(declined.success).toBe(true)
    if (declined.success) {
      expect(declined.data).not.toHaveProperty('medicalDetails')
    }

    const permissionWithoutDetails: Record<string, unknown> = structuredClone(submission)
    delete permissionWithoutDetails.medicalDetails
    const missingDetails = validateFormSubmission(permission, {
      ...permissionWithoutDetails,
      permission: 'yes',
      hasMedicalNeeds: true,
    })
    expect(issuePaths(missingDetails)).toContainEqual(['medicalDetails'])

    const missingConsent = validateFormSubmission(permission, { ...submission, acknowledged: false })
    expect(issuePaths(missingConsent)).toContainEqual(['acknowledged'])
  })

  it('requires contacts and applies the email condition separately to each entry', () => {
    const student = { name: 'Jordan Lee', grade: '3' }
    const missingContacts = validateFormSubmission(contacts, { student, contacts: [] })
    expect(issuePaths(missingContacts)).toContainEqual(['contacts'])

    const invalidEmail = validateFormSubmission(contacts, {
      student,
      contacts: [
        { name: 'Sam Lee', relationship: 'Parent', phone: '555-0101', preferredMethod: 'phone' },
        { name: 'Avery Lee', relationship: 'Aunt', phone: '555-0102', preferredMethod: 'email' },
      ],
    })
    expect(issuePaths(invalidEmail)).toContainEqual(['contacts', 1, 'email'])

    const parsed = validateFormSubmission(contacts, {
      student,
      contacts: [
        {
          name: 'Sam Lee',
          relationship: 'Parent',
          phone: '555-0101',
          preferredMethod: 'phone',
          email: 'hidden@example.test',
        },
        {
          name: 'Avery Lee',
          relationship: 'Aunt',
          phone: '555-0102',
          preferredMethod: 'email',
          email: 'avery@example.test',
        },
      ],
    })
    expect(parsed.success).toBe(true)
    if (parsed.success && 'contacts' in parsed.data) {
      expect(parsed.data.contacts[0]).not.toHaveProperty('email')
      expect(parsed.data.contacts[1].email).toBe('avery@example.test')
    }
  })

  it('rejects definitions without a matching submission schema', () => {
    const definition: FormDefinition = { type: 'unregistered', title: 'Example', fields: [] }

    expect(() => validateFormSubmission(definition, {})).toThrow(/No submission schema/)
  })
})
