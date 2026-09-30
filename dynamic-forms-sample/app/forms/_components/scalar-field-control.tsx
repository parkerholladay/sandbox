'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type {
  CheckboxField,
  DateField,
  EmailField,
  MultiSelectField,
  NumberField,
  PhoneField,
  RadioField,
  ScalarField,
  SelectField,
  SwitchField,
  TextareaField,
  TextField,
} from '@/services/universal/form/types'
import { format, parseISO } from 'date-fns'
import { useContext, useState, type Ref } from 'react'
import { FormDisabledContext } from './form-disabled-context'

type FieldControlProps<Field extends ScalarField> = {
  describedBy?: string
  field: Field
  id: string
  inputRef?: Ref<HTMLElement>
  isInvalid: boolean
  isDisabled: boolean
  onBlur: () => void
  onChange: (value: unknown) => void
  value: unknown
}

const TextControl = ({
  describedBy,
  field,
  id,
  inputRef,
  isInvalid,
  isDisabled,
  onBlur,
  onChange,
  value,
}: FieldControlProps<TextField | EmailField | PhoneField>) => {
  const type = field.type === 'phone' ? 'tel' : field.type

  return (
    <Input
      disabled={isDisabled}
      aria-describedby={describedBy}
      aria-invalid={isInvalid}
      aria-required={field.required}
      id={id}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder}
      ref={inputRef as Ref<HTMLInputElement>}
      type={type}
      value={typeof value === 'string' ? value : ''}
    />
  )
}

const TextareaControl = ({
  describedBy,
  field,
  id,
  inputRef,
  isInvalid,
  isDisabled,
  onBlur,
  onChange,
  value,
}: FieldControlProps<TextareaField>) => (
  <Textarea
    disabled={isDisabled}
    aria-describedby={describedBy}
    aria-invalid={isInvalid}
    aria-required={field.required}
    id={id}
    onBlur={onBlur}
    onChange={(event) => onChange(event.target.value)}
    placeholder={field.placeholder}
    ref={inputRef as Ref<HTMLTextAreaElement>}
    value={typeof value === 'string' ? value : ''}
  />
)

const NumberControl = ({
  describedBy,
  field,
  id,
  inputRef,
  isInvalid,
  isDisabled,
  onBlur,
  onChange,
  value,
}: FieldControlProps<NumberField>) => (
  <Input
    disabled={isDisabled}
    aria-describedby={describedBy}
    aria-invalid={isInvalid}
    aria-required={field.required}
    id={id}
    onBlur={onBlur}
    onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
    ref={inputRef as Ref<HTMLInputElement>}
    type="number"
    value={typeof value === 'number' ? value : ''}
  />
)

const SelectControl = ({
  describedBy,
  field,
  id,
  inputRef,
  isInvalid,
  isDisabled,
  onBlur,
  onChange,
  value,
}: FieldControlProps<SelectField>) => {
  const labels = new Map(field.options.map((option) => [option.value, option.label]))

  return (
    <Combobox
      disabled={isDisabled}
      itemToStringLabel={(optionValue) => labels.get(optionValue) ?? optionValue}
      itemToStringValue={(optionValue) => optionValue}
      onValueChange={onChange}
      value={typeof value === 'string' && value ? value : null}
    >
      <ComboboxInput
        aria-describedby={describedBy}
        aria-invalid={isInvalid}
        aria-required={field.required}
        id={id}
        onBlur={onBlur}
        placeholder="Choose an option"
        ref={inputRef as Ref<HTMLInputElement>}
        showClear
      />
      <ComboboxContent>
        <ComboboxList>
          {field.options.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              {option.label}
            </ComboboxItem>
          ))}
          {field.options.length === 0 && (
            <ComboboxEmpty>No options found.</ComboboxEmpty>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

const MultiSelectControl = ({
  describedBy,
  field,
  id,
  inputRef,
  isInvalid,
  isDisabled,
  onBlur,
  onChange,
  value,
}: FieldControlProps<MultiSelectField>) => {
  const labels = new Map(field.options.map((option) => [option.value, option.label]))

  return (
    <Combobox
      disabled={isDisabled}
      itemToStringLabel={(optionValue) => labels.get(optionValue) ?? optionValue}
      itemToStringValue={(optionValue) => optionValue}
      multiple
      onValueChange={onChange}
      value={Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []}
    >
      <ComboboxInput
        aria-describedby={describedBy}
        aria-invalid={isInvalid}
        aria-required={field.required}
        id={id}
        onBlur={onBlur}
        placeholder="Choose one or more options"
        ref={inputRef as Ref<HTMLInputElement>}
        showClear
      />
      <ComboboxContent>
        <ComboboxList>
          {field.options.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              {option.label}
            </ComboboxItem>
          ))}
          {field.options.length === 0 && (
            <ComboboxEmpty>No options found.</ComboboxEmpty>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

const RadioControl = ({
  describedBy,
  field,
  id,
  inputRef,
  isInvalid,
  isDisabled,
  onBlur,
  onChange,
  value,
}: FieldControlProps<RadioField>) => (
  <RadioGroup
    disabled={isDisabled}
    aria-describedby={describedBy}
    aria-invalid={isInvalid}
    aria-label={field.label}
    aria-required={field.required}
    id={id}
    onBlur={onBlur}
    onValueChange={onChange}
    ref={inputRef as Ref<HTMLDivElement>}
    value={typeof value === 'string' ? value : ''}
  >
    {field.options.map((option) => {
      const optionId = `${id}-${option.value}`

      return (
        <FieldLabel className="text-sm" htmlFor={optionId} key={option.value}>
          <RadioGroupItem id={optionId} value={option.value} />
          {option.label}
        </FieldLabel>
      )
    })}
  </RadioGroup>
)

const CheckboxControl = ({
  describedBy,
  field,
  id,
  inputRef,
  isInvalid,
  isDisabled,
  onBlur,
  onChange,
  value,
}: FieldControlProps<CheckboxField>) => (
  <div className="flex items-center gap-2">
    <Checkbox
      disabled={isDisabled}
      aria-describedby={describedBy}
      aria-invalid={isInvalid}
      aria-required={field.required}
      checked={value === true}
      id={id}
      onBlur={onBlur}
      onCheckedChange={(checked) => onChange(checked === true)}
      ref={inputRef}
    />
    <FieldLabel className="text-sm" htmlFor={id}>{field.label}</FieldLabel>
  </div>
)

const SwitchControl = ({
  describedBy,
  field,
  id,
  inputRef,
  isInvalid,
  isDisabled,
  onBlur,
  onChange,
  value,
}: FieldControlProps<SwitchField>) => (
  <div className="flex items-center gap-2">
    <Switch
      disabled={isDisabled}
      aria-describedby={describedBy}
      aria-invalid={isInvalid}
      aria-required={field.required}
      checked={value === true}
      id={id}
      onBlur={onBlur}
      onCheckedChange={onChange}
      ref={inputRef}
    />
    <FieldLabel className="text-sm" htmlFor={id}>{field.label}</FieldLabel>
  </div>
)

const DateControl = ({
  describedBy,
  field,
  id,
  inputRef,
  isInvalid,
  isDisabled,
  onBlur,
  onChange,
  value,
}: FieldControlProps<DateField>) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedDate = typeof value === 'string' && value ? parseISO(value) : undefined
  const displayValue = selectedDate && !Number.isNaN(selectedDate.getTime())
    ? format(selectedDate, 'MMMM d, yyyy')
    : 'Choose a date'

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen && !isDisabled}>
      <PopoverTrigger
        aria-describedby={describedBy}
        aria-invalid={isInvalid}
        aria-required={field.required}
        className="w-full justify-start font-normal"
        disabled={isDisabled}
        id={id}
        onBlur={onBlur}
        ref={inputRef as Ref<HTMLButtonElement>}
        render={<Button variant="outline" />}
      >
        {displayValue}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          autoFocus
          mode="single"
          onSelect={(date) => {
            if (isDisabled) return
            onChange(date ? format(date, 'yyyy-MM-dd') : '')
            if (date) setIsOpen(false)
          }}
          selected={selectedDate}
        />
      </PopoverContent>
    </Popover>
  )
}

function assertNever(field: never): never {
  throw new Error(`Unsupported form field type: ${JSON.stringify(field)}`)
}

export const ScalarFieldControl = ({ field, ...props }: Omit<FieldControlProps<ScalarField>, 'isDisabled'>) => {
  const isDisabled = useContext(FormDisabledContext)
  const controlProps = { ...props, isDisabled }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
      return <TextControl {...controlProps} field={field} />
    case 'textarea':
      return <TextareaControl {...controlProps} field={field} />
    case 'number':
      return <NumberControl {...controlProps} field={field} />
    case 'select':
      return <SelectControl {...controlProps} field={field} />
    case 'multi-select':
      return <MultiSelectControl {...controlProps} field={field} />
    case 'radio':
      return <RadioControl {...controlProps} field={field} />
    case 'checkbox':
      return <CheckboxControl {...controlProps} field={field} />
    case 'switch':
      return <SwitchControl {...controlProps} field={field} />
    case 'date':
      return <DateControl {...controlProps} field={field} />
    default:
      return assertNever(field)
  }
}
