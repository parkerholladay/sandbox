export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ConditionValue = string | number | boolean;

export type FieldCondition = {
  field: string;
  equals: ConditionValue;
}

type BaseField = {
  name: string;
  label: string;
  description?: string;
  visibleWhen?: FieldCondition;
}

type TextFieldProperties = {
  placeholder?: string;
  defaultValue?: string;
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
  type: 'number';
  defaultValue?: number;
  required?: boolean;
}

export type DateField = BaseField & {
  type: 'date';
  defaultValue?: string;
  required?: boolean;
}

type ChoiceFieldProperties = {
  options: readonly ChoiceOption[];
  defaultValue?: string;
  required?: boolean;
}

export type SelectField = BaseField & ChoiceFieldProperties & {
  type: 'select';
}

export type RadioField = BaseField & ChoiceFieldProperties & {
  type: 'radio';
}

export type MultiSelectField = BaseField & {
  type: 'multi-select';
  options: readonly ChoiceOption[];
  defaultValue?: string[];
  required?: boolean;
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
  type: 'group';
  fields: readonly FormField[];
}

export type RepeaterField = BaseField & {
  type: 'repeater';
  fields: readonly FormField[];
  minItems?: number;
  maxItems?: number;
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
  type: string;
  title: string;
  description?: string;
  fields: readonly FormField[];
}
