// Auth components
export * from "./components/auth/auth-callback.vue"
export * from "./components/auth/auth-card.vue"
export * from "./components/auth/auth-form.vue"
export * from "./components/auth/forms/forgot-password-form.vue"
export * from "./components/auth/forms/magic-link-form.vue"
export * from "./components/auth/forms/recover-account-form.vue"
export * from "./components/auth/forms/reset-password-form.vue"
export * from "./components/auth/forms/sign-in-form.vue"
export * from "./components/auth/forms/sign-up-form.vue"
export * from "./components/auth/forms/two-factor-form.vue"
export * from "./components/auth/forms/email-otp-form.vue"
export * from "./components/auth/sign-out.vue"

// Utility components
export * from "./components/auth-loading.vue"
export * from "./components/password-input.vue"
export * from "./components/provider-icons.vue"
export * from "./components/signed-in.vue"
export * from "./components/signed-out.vue"
export * from "./components/redirect-to-sign-in.vue"
export * from "./components/redirect-to-sign-up.vue"

// User components
export * from "./components/user-avatar.vue"
export * from "./components/user-button.vue"
export * from "./components/user-view.vue"

// Settings components
export * from "./components/settings/account-settings-cards.vue"
export * from "./components/settings/account/accounts-card.vue"
export * from "./components/settings/account/change-email-card.vue"
export * from "./components/settings/account/change-password-card.vue"
export * from "./components/settings/account/delete-account-card.vue"
export * from "./components/settings/api-key/api-keys-card.vue"
export * from "./components/settings/security-settings-cards.vue"
export * from "./components/settings/security/sessions-card.vue"
export * from "./components/settings/shared/settings-card.vue"
export * from "./components/settings/settings-cards.vue"

// Email components
export * from "./components/email/email-template.vue"

// Organization components
export * from "./components/organization/accept-invitation-card.vue"
export * from "./components/organization/organization-invitations-card.vue"
export * from "./components/organization/organization-members-card.vue"
export * from "./components/organization/organization-settings-cards.vue"
export * from "./components/organization/organization-switcher.vue"
export * from "./components/organization/organizations-card.vue"

// Composables
export * from "./composables/use-authenticate"
export * from "./composables/use-auth-data"

// Localization
export * from "./localization/auth-localization"

// Library core
export * from "./lib/auth-ui-provider"
export * from "./lib/auth-view-paths"
export * from "./lib/social-providers"

// Types
export * from "./types/auth-hooks"
export * from "./types/auth-mutators"