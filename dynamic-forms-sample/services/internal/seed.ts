import type { ChoiceOption, FormDefinition } from '@/services/universal/form/types'
import { GRADE_LEVELS } from '@/services/universal/grade-levels'

const absenceReasons = [
  { label: 'Illness', value: 'illness' },
  { label: 'Family matter', value: 'family' },
  { label: 'Appointment', value: 'appointment' },
  { label: 'Other', value: 'other' },
] satisfies readonly ChoiceOption[]

const permissionOptions = [
  { label: 'Yes, my child may participate', value: 'yes' },
  { label: 'No, my child may not participate', value: 'no' },
] satisfies readonly ChoiceOption[]

const contactMethods = [
  { label: 'Phone', value: 'phone' },
  { label: 'Email', value: 'email' },
] satisfies readonly ChoiceOption[]

export const FORM_DEFINITION_SEEDS = [
  {
    type: 'absence-report',
    title: 'Student absence report',
    description: 'Let the school know when your student will be away.',
    fields: [
      {
        name: 'student',
        label: 'Student',
        type: 'group',
        fields: [
          { name: 'name', label: 'Student name', type: 'text', required: true },
          { name: 'grade', label: 'Grade', type: 'select', options: GRADE_LEVELS, required: true },
        ],
      },
      {
        name: 'guardian',
        label: 'Parent or guardian',
        type: 'group',
        fields: [
          { name: 'name', label: 'Parent or guardian name', type: 'text', required: true },
          { name: 'email', label: 'Email address', type: 'email', required: true },
        ],
      },
      { name: 'startDate', label: 'First day absent', type: 'date', required: true },
      { name: 'endDate', label: 'Last day absent', type: 'date', required: true },
      { name: 'reason', label: 'Reason for absence', type: 'radio', options: absenceReasons, required: true },
      {
        name: 'reasonDetails',
        label: 'Please describe',
        type: 'textarea',
        required: true,
        visibleWhen: { field: 'reason', equals: 'other' },
      },
    ],
  },
  {
    type: 'field-trip-permission',
    title: 'Field trip permission',
    description: 'Review a trip and let the school know whether your student can attend.',
    fields: [
      {
        name: 'student',
        label: 'Student',
        type: 'group',
        fields: [
          { name: 'name', label: 'Student name', type: 'text', required: true },
          { name: 'grade', label: 'Grade', type: 'select', options: GRADE_LEVELS, required: true },
        ],
      },
      {
        name: 'guardian',
        label: 'Parent or guardian',
        type: 'group',
        fields: [
          { name: 'name', label: 'Parent or guardian name', type: 'text', required: true },
          { name: 'phone', label: 'Daytime phone', type: 'phone', required: true },
        ],
      },
      { name: 'tripName', label: 'Field trip', type: 'text', required: true },
      { name: 'tripDate', label: 'Trip date', type: 'date', required: true },
      { name: 'permission', label: 'May your student attend?', type: 'radio', options: permissionOptions, required: true },
      { name: 'hasMedicalNeeds', label: 'Does your student have medical needs the school should know about?', type: 'switch', required: true },
      {
        name: 'medicalDetails',
        label: 'Medical details',
        type: 'textarea',
        required: true,
        visibleWhen: { field: 'hasMedicalNeeds', equals: true },
      },
      { name: 'acknowledged', label: 'I confirm this permission choice', type: 'checkbox', required: true },
    ],
  },
  {
    type: 'emergency-contacts',
    title: 'Emergency contacts',
    description: 'Provide the people the school may contact if needed.',
    fields: [
      {
        name: 'student',
        label: 'Student',
        type: 'group',
        fields: [
          { name: 'name', label: 'Student name', type: 'text', required: true },
          { name: 'grade', label: 'Grade', type: 'select', options: GRADE_LEVELS, required: true },
        ],
      },
      {
        name: 'contacts',
        label: 'Emergency contacts',
        type: 'repeater',
        minItems: 1,
        fields: [
          { name: 'name', label: 'Contact name', type: 'text', required: true },
          { name: 'relationship', label: 'Relationship to student', type: 'text', required: true },
          { name: 'phone', label: 'Phone number', type: 'phone', required: true },
          { name: 'preferredMethod', label: 'Preferred contact method', type: 'radio', options: contactMethods, required: true },
          {
            name: 'email',
            label: 'Email address',
            type: 'email',
            required: true,
            visibleWhen: { field: 'preferredMethod', equals: 'email' },
          },
        ],
      },
    ],
  },
] satisfies readonly FormDefinition[]
