export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ConditionValue = string | number | boolean;

export type FieldCondition = {
  equals: ConditionValue;
  field: string;
}

type BaseField = {
  description?: string;
  label: string;
  name: string;
  visibleWhen?: FieldCondition;
}

type TextFieldProperties = {
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

export type TextField = BaseField & TextFieldProperties & {
  type: 'text';
}

export type TextareaField = BaseField & TextFieldProperties & {
  type: 'textarea';
}

export type EmailField = BaseField & TextFieldProperties & {
  type: 'email';
}

export type PhoneField = BaseField & TextFieldProperties & {
  type: 'phone';
}

export type NumberField = BaseField & {
  defaultValue?: number;
  required?: boolean;
  type: 'number';
}

export type DateField = BaseField & {
  defaultValue?: string;
  required?: boolean;
  type: 'date';
}

type ChoiceFieldProperties = {
  defaultValue?: string;
  options: readonly ChoiceOption[];
  required?: boolean;
}

export type SelectField = BaseField & ChoiceFieldProperties & {
  type: 'select';
}

export type RadioField = BaseField & ChoiceFieldProperties & {
  type: 'radio';
}

export type MultiSelectField = BaseField & {
  defaultValue?: string[];
  options: readonly ChoiceOption[];
  required?: boolean;
  type: 'multi-select';
}

type BooleanFieldProperties = {
  defaultValue?: boolean;
  required?: boolean;
}

export type CheckboxField = BaseField & BooleanFieldProperties & {
  type: 'checkbox';
}

export type SwitchField = BaseField & BooleanFieldProperties & {
  type: 'switch';
}

export type GroupField = BaseField & {
  fields: readonly FormField[];
  type: 'group';
}

export type RepeaterField = BaseField & {
  fields: readonly FormField[];
  maxItems?: number;
  minItems?: number;
  type: 'repeater';
}

export type FormField =
  | TextField
  | TextareaField
  | EmailField
  | PhoneField
  | NumberField
  | DateField
  | SelectField
  | RadioField
  | MultiSelectField
  | CheckboxField
  | SwitchField
  | GroupField
  | RepeaterField;

export type CompositeField = GroupField | RepeaterField;
export type ScalarField = Exclude<FormField, CompositeField>;

export type ChoiceOption = {
  label: string;
  value: string;
}

export type FormDefinition = {
  description?: string;
  fields: readonly FormField[];
  title: string;
  type: string;
}

export type SubmissionReceipt = {
  id: string
  submittedAt: string
  type: string
}

export type SubmitFormInput = {
  type: string
  values: unknown
}

export type SubmissionIssue = {
  message: string
  path: (string | number)[]
}

export type SubmitFormResult =
  | { receipt: SubmissionReceipt; status: 'success' }
  | { issues: SubmissionIssue[]; message: string; status: 'validation_error' }
  | { message: string; status: 'form_not_found' | 'server_error' }

export type SubmitFormAction = (input: SubmitFormInput) => Promise<SubmitFormResult>
