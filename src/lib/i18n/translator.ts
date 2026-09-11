import type { Dictionary, MessageKey, MessageSource } from '@/lib/i18n/dictionaries/en'

/** Extracts every `{placeholder}` name from an English source string. */
type Placeholder<Message extends string> = Message extends `${string}{${infer Name}}${infer Rest}`
  ? Name | Placeholder<Rest>
  : never

/**
 * The tuple wrapper around `extends never` stops the conditional distributing over `never`, which
 * is what makes "this message takes no values" resolve to an empty argument list.
 */
export type Translator<Allowed extends MessageKey = MessageKey> = <Key extends Allowed>(
  key: Key,
  ...values: [Placeholder<MessageSource[Key]>] extends [never]
    ? []
    : [values: Record<Placeholder<MessageSource[Key]>, string | number>]
) => string

/**
 * Total by construction: a missing template yields an empty string rather than throwing. Stored
 * message keys outlive deployments (see the offline outbox), so a key the running dictionary no
 * longer has must degrade, not crash.
 */
export function interpolate(
  template: string | undefined,
  values?: Record<string, string | number>,
): string {
  if (!template) return ''
  if (!values) return template
  return template.replace(/\{(\w+)\}/g, (token, name: string) =>
    name in values ? String(values[name]) : token,
  )
}

export function createTranslator<Allowed extends MessageKey = MessageKey>(
  dictionary: Partial<Dictionary>,
): Translator<Allowed> {
  return ((key: MessageKey, values?: Record<string, string | number>) =>
    interpolate(dictionary[key] ?? key, values)) as Translator<Allowed>
}
