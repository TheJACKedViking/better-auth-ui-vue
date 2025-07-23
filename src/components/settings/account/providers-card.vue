<template>
  <SettingsCard
    :title="localization.PROVIDERS || 'Social Providers'"
    :description="localization.PROVIDERS_DESCRIPTION || 'Connect your social accounts for easy sign-in'"
    :classNames="classNames"
  >
    <template #content>
      <Skeleton v-if="isPending" class="h-32 w-full" />
      
      <div v-else-if="error" class="text-sm text-red-500">
        {{ getErrorMessage(error) }}
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="provider in availableProviders"
          :key="provider.provider"
          class="rounded-lg border p-4"
          :class="classNames?.provider"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <component
                v-if="provider.icon"
                :is="provider.icon"
                class="h-5 w-5"
              />
              <div class="space-y-1">
                <p class="text-sm font-medium">
                  {{ provider.name }}
                </p>
                <p v-if="isLinked(provider.provider)" class="text-xs text-green-600 dark:text-green-400">
                  {{ localization.CONNECTED || 'Connected' }}
                </p>
              </div>
            </div>
            
            <button
              v-if="!isLinked(provider.provider)"
              @click="handleLinkProvider(provider.provider)"
              :disabled="linkingProvider === provider.provider"
              :class="cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3',
                classNames?.button,
                classNames?.outlineButton
              )"
              data-slot="button"
            >
              <Loader2 v-if="linkingProvider === provider.provider" class="animate-spin" />
              <LinkIcon v-else />
              {{ localization.LINK || 'Link' }}
            </button>
            
            <button
              v-else
              @click="handleUnlinkProvider(provider.provider)"
              :disabled="unlinkingProvider === provider.provider"
              class="text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
              :class="classNames?.unlinkButton"
            >
              <Loader2 v-if="unlinkingProvider === provider.provider" class="h-4 w-4 animate-spin" />
              <span v-else>{{ localization.UNLINK || 'Unlink' }}</span>
            </button>
          </div>
        </div>
      </div>
      
      <p v-if="availableProviders.length === 0" class="text-sm text-muted-foreground">
        {{ localization.NO_PROVIDERS_AVAILABLE || 'No additional providers available' }}
      </p>
    </template>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { toast } from 'vue-sonner'
import { Link as LinkIcon, Loader2 } from 'lucide-vue-next'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { cn, getErrorMessage, getCallbackURL } from '../../../lib/utils'
import { socialProviders } from '../../../lib/social-providers'
import SettingsCard from '../shared/settings-card.vue'
import type { SettingsCardClassNames } from '../shared/settings-card.vue'

interface ProvidersCardClassNames extends SettingsCardClassNames {
  provider?: string
  unlinkButton?: string
}

interface Props {
  classNames?: ProvidersCardClassNames
}

defineProps<Props>()

const auth = inject(AuthUIContextKey)
if (!auth) throw new Error('ProvidersCard must be used within AuthUIProvider')

const { localization, authClient, social, baseURL, basePath, persistClient } = auth

// Get linked accounts data
const { data: accounts, isPending, error, refetch } = auth.hooks.useListAccounts?.() || {
  data: null,
  isPending: false,
  error: null,
  refetch: () => {}
}

const linkingProvider = ref<string | null>(null)
const unlinkingProvider = ref<string | null>(null)

// Get available providers based on what's configured in social prop
const availableProviders = computed(() => {
  if (!social) return []
  
  const configuredProviders = Array.isArray(social) 
    ? social 
    : Object.keys(social).filter(key => (social as any)[key] === true)
  
  return socialProviders.filter(provider => 
    configuredProviders.includes(provider.provider)
  )
})

// Check if a provider is already linked
function isLinked(providerId: string) {
  return accounts?.some((account: any) => 
    account.provider === providerId || account.providerId === providerId
  )
}

// Handle linking a provider
async function handleLinkProvider(providerId: string) {
  if (!authClient.signIn?.social) return
  
  linkingProvider.value = providerId
  
  try {
    const callbackURL = getCallbackURL({
      baseURL,
      basePath,
      persistClient,
      redirectTo: window.location.href
    })
    
    await authClient.signIn.social({
      provider: providerId,
      callbackURL
    })
  } catch (error) {
    toast.error(getErrorMessage(error, localization))
    linkingProvider.value = null
  }
}

// Handle unlinking a provider
async function handleUnlinkProvider(providerId: string) {
  if (!auth?.mutators?.unlinkAccount) return
  
  const account = accounts?.find((acc: any) => 
    acc.provider === providerId || acc.providerId === providerId
  )
  
  if (!account) return
  
  unlinkingProvider.value = providerId
  
  try {
    await auth.mutators.unlinkAccount({
      providerId: providerId,
      accountId: account.accountId
    })
    toast.success(localization.ACCOUNT_UNLINKED || 'Account unlinked successfully')
    refetch?.()
  } catch (error) {
    toast.error(getErrorMessage(error, localization))
  } finally {
    unlinkingProvider.value = null
  }
}
</script>