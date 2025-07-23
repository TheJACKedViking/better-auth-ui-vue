import type { SettingsCardClassNames } from '../components/settings/shared/settings-card.vue'

export const settingsViews = [
    'SETTINGS',
    'SECURITY',
    'API_KEYS',
    'ORGANIZATION',
    'ORGANIZATIONS',
    'MEMBERS'
] as const

export type SettingsView = typeof settingsViews[number]

export type SettingsCardsClassNames = {
    base?: string
    card?: SettingsCardClassNames
    cards?: string
    icon?: string
    drawer?: {
        base?: string
        trigger?: string
        content?: string
        menuIcon?: string
        menuItem?: string
    }
    sidebar?: {
        base?: string
        button?: string
        buttonActive?: string
    }
}