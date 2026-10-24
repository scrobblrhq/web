import type { Locales, TranslationFunctions } from '#lib/i18n/i18n-types'
import { i18nObject } from '#lib/i18n/i18n-util'
import { loadLocale } from '#lib/i18n/i18n-util.sync'

let _locale = $state<Locales>('es')

export function getLL(): TranslationFunctions {
	return i18nObject(_locale)
}

export function getLocale(): Locales {
	return _locale
}

export function setLocale(newLocale: Locales) {
	loadLocale(newLocale)
	_locale = newLocale
}
