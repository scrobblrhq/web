import type { Locales, TranslationFunctions } from '#lib/i18n/i18n-types'
import { i18nObject } from '#lib/i18n/i18n-util'
import { loadLocale } from '#lib/i18n/i18n-util.sync'
import { locales } from '#lib/i18n/i18n-util'

export function serverLL(locale?: string): TranslationFunctions {
	const lang = (locale && locales.includes(locale as Locales) ? locale : 'en') as Locales
	loadLocale(lang)
	return i18nObject(lang)
}
