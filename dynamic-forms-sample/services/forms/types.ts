export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ConditionValue = string | number | boolean;

export interface FieldCondition {
  field: string;
  equals: ConditionValue;
}

interface BaseField {
  name: string;
  label: string;
  description?: string;
  visibleWhen?: FieldCondition;
}

export interface TextField extends BaseField {
  type: 'text' | 'textarea' | 'email' | 'phone';
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

export interface NumberField extends BaseField {
  type: 'number';
  defaultValue?: number;
  required?: boolean;
}

export interface DateField extends BaseField {
  type: 'date';
  defaultValue?: string;
  required?: boolean;
}

export interface ChoiceField extends BaseField {
  type: 'select' | 'radio';
  options: readonly ChoiceOption[];
  defaultValue?: string;
  required?: boolean;
}

export interface MultiSelectField extends BaseField {
  type: 'multi-select';
  options: readonly ChoiceOption[];
  defaultValue?: string[];
  required?: boolean;
}

export interface BooleanField extends BaseField {
  type: 'checkbox' | 'switch';
  defaultValue?: boolean;
  required?: boolean;
}

export interface GroupField extends BaseField {
  type: 'group';
  fields: readonly FormField[];
}

export interface RepeaterField extends BaseField {
  type: 'repeater';
  fields: readonly FormField[];
  minItems?: number;
  maxItems?: number;
}

export type FormField =
  | TextField
  | NumberField
  | DateField
  | ChoiceField
  | MultiSelectField
  | BooleanField
  | GroupField
  | RepeaterField;

export interface ChoiceOption {
  label: string;
  value: string;
}

export interface FormDefinition {
  type: string;
  title: string;
  description?: string;
  fields: readonly FormField[];
}
