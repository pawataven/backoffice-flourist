/**
 * §9: dates and numbers through Intl in the chosen locale. Thai uses the Gregorian year
 * (ค.ศ., §8 proposal) — plain 'th-TH' would switch to the Buddhist calendar.
 */
export function useFormat() {
  const { locale } = useI18n()
  const intlLocale = computed(() => (locale.value === 'th' ? 'th-TH-u-ca-gregory' : 'en-GB'))

  const dateFmt = computed(
    () =>
      new Intl.DateTimeFormat(intlLocale.value, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
  )
  const numberFmt = computed(() => new Intl.NumberFormat(intlLocale.value))
  const shortDateFmt = computed(
    () => new Intl.DateTimeFormat(intlLocale.value, { day: 'numeric', month: 'short' }),
  )

  return {
    locale,
    date: (iso: unknown) => (iso ? dateFmt.value.format(new Date(String(iso))) : '—'),
    number: (n: unknown) => (typeof n === 'number' ? numberFmt.value.format(n) : '—'),
    /** Day and month only (chart axes), e.g. 7 ต.ค. */
    shortDate: (iso: unknown) => (iso ? shortDateFmt.value.format(new Date(String(iso))) : '—'),
  }
}
