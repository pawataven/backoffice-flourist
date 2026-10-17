import { z } from 'zod'

// §6: validation rules belong to the kind of data, not to the field name.
// Error messages are i18n keys (e.g. 'validation.phone.tooLong'); the UI translates them.

export const FIELD_TYPES = [
  'personName',
  'phoneTH',
  'email',
  'text',
  'slug',
  'number',
  'url',
  'date',
] as const
export type FieldType = (typeof FIELD_TYPES)[number]

export interface FieldRules {
  required?: boolean
  /** `text` only. */
  maxLength?: number
  /** `number` only. */
  min?: number
  /** `number` only. */
  max?: number
  /** `number` only: whole numbers. */
  integer?: boolean
}

export interface I18nError {
  key: string
  params: Record<string, unknown>
}

// Thai consonants, vowels and tone marks (U+0E01–U+0E4E) minus the baht sign. Thai digits (U+0E50+) are excluded.
const THAI_LETTERS = '\\u0E01-\\u0E3A\\u0E40-\\u0E4E'
const PERSON_NAME_CHAR = new RegExp(`[${THAI_LETTERS}A-Za-z .'-]`, 'u')
const PERSON_NAME = new RegExp(`^[${THAI_LETTERS}A-Za-z .'-]+$`, 'u')

/** Characters a user may type into each type. Types without an entry accept anything. */
const ALLOWED_CHAR: Partial<Record<FieldType, RegExp>> = {
  personName: PERSON_NAME_CHAR,
  phoneTH: /[0-9]/,
  slug: /[a-z0-9-]/,
  number: /[0-9.-]/,
  date: /[0-9-]/,
}

/**
 * Drops characters the type does not allow, so they never appear while typing or pasting.
 * `number` also keeps only a leading minus and the first decimal point.
 */
export function sanitizeFieldInput(type: FieldType, value: string): string {
  const allowed = ALLOWED_CHAR[type]
  if (!allowed) return value
  let out = ''
  for (const ch of value) {
    if (!allowed.test(ch)) continue
    if (type === 'number') {
      if (ch === '-' && out.length > 0) continue
      if (ch === '.' && out.includes('.')) continue
    }
    out += ch
  }
  return out
}

function valueSchema(type: FieldType, rules: FieldRules): z.ZodType {
  switch (type) {
    case 'personName':
      return z.string().regex(PERSON_NAME, { error: 'validation.personName.invalid' })
    case 'phoneTH':
      return z
        .string()
        .startsWith('0', { error: 'validation.phone.startsWithZero' })
        .min(9, { error: 'validation.phone.tooShort' })
        .max(10, { error: 'validation.phone.tooLong' })
    case 'email':
      return z.email({ error: 'validation.email.invalid' })
    case 'text':
      return rules.maxLength === undefined
        ? z.string()
        : z.string().max(rules.maxLength, { error: 'validation.text.tooLong' })
    case 'slug':
      return z.string().regex(/^[a-z0-9-]+$/, { error: 'validation.slug.invalid' })
    case 'number': {
      let num = z.number()
      if (rules.integer) num = num.int({ error: 'validation.number.notInteger' })
      if (rules.min !== undefined) num = num.min(rules.min, { error: 'validation.number.tooSmall' })
      if (rules.max !== undefined) num = num.max(rules.max, { error: 'validation.number.tooBig' })
      return z
        .string()
        .regex(/^-?\d+(\.\d+)?$/, { error: 'validation.number.invalid' })
        .transform(Number)
        .pipe(num)
    }
    case 'url':
      return z.url({ protocol: /^https?$/, error: 'validation.url.invalid' })
    case 'date':
      return z.iso.date({ error: 'validation.date.invalid' })
  }
}

/**
 * Schema for one form field. Input is the raw string from the field; an empty string counts as
 * "not filled" and becomes `null` when the field is optional.
 */
export function fieldSchema(type: FieldType, rules: FieldRules = {}): z.ZodType {
  const value = valueSchema(type, rules)
  return z.string().transform((raw, ctx) => {
    if (raw === '') {
      if (rules.required) ctx.addIssue({ code: 'custom', message: 'validation.required' })
      return null
    }
    const result = value.safeParse(raw)
    if (result.success) return result.data
    for (const issue of result.error.issues) ctx.addIssue(issue as z.core.$ZodRawIssue)
    return z.NEVER
  })
}

/** Turns a Zod issue into an i18n key plus the params its message needs ({min}, {max}). */
export function toI18nError(issue: z.core.$ZodIssue): I18nError {
  const params: Record<string, unknown> = {}
  if ('minimum' in issue) params.min = issue.minimum
  if ('maximum' in issue) params.max = issue.maximum
  return { key: issue.message, params }
}

/** First error of a field, or null when the value is valid. */
export function validateField(
  type: FieldType,
  value: string,
  rules: FieldRules = {},
): I18nError | null {
  const result = fieldSchema(type, rules).safeParse(value)
  const first = result.success ? undefined : result.error.issues[0]
  return first ? toI18nError(first) : null
}
