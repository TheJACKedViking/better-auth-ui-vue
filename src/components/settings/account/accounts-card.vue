<template>
  <SettingsCard
    :title="localization.ACCOUNTS || 'Accounts'"
    :description="localization.ACCOUNTS_DESCRIPTION || 'Manage your linked accounts'"
    :classNames="classNames"
  >
    <template #content>
      <Skeleton v-if="isPending" class="h-12 w-full" />
      
      <div v-else-if="error" class="text-sm text-red-500">
        {{ getErrorMessage(error) }}
      </div>
      
      <div v-else-if="accounts?.length === 0" class="text-sm text-muted-foreground">
        {{ localization.ACCOUNTS || 'No linked accounts' }}
      </div>
      
      <div v-else class="space-y-2">
        <div
          v-for="account in accounts"
          :key="account.accountId"
          class="flex items-center justify-between rounded-lg border p-3"
          :class="classNames?.account"
        >
          <div class="flex items-center gap-3">
            <component
              v-if="getProviderIcon(account.provider)"
              :is="getProviderIcon(account.provider)"
              class="h-5 w-5"
            />
            <div class="space-y-1">
              <p class="text-sm font-medium leading-none">
                {{ getProviderName(account.provider) }}
              </p>
            </div>
          </div>
          
          <button
            @click="handleUnlinkAccount(account)"
            :disabled="unlinkLoading === account.accountId"
            class="text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
            :class="classNames?.unlinkButton"
          >
            {{ localization.UNLINK || 'Unlink' }}
          </button>
        </div>
      </div>
    </template>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { toast } from 'vue-sonner'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { socialProviders } from '../../../lib/social-providers'
import { getErrorMessage } from '../../../lib/utils'
import SettingsCard from '../shared/settings-card.vue'
import type { SettingsCardClassNames } from '../shared/settings-card.vue'

interface AccountsCardClassNames extends SettingsCardClassNames {
  account?: string
  unlinkButton?: string
}

interface Props {
  classNames?: AccountsCardClassNames
}

defineProps<Props>()

const auth = inject(AuthUIContextKey)
if (!auth) throw new Error('AccountsCard must be used within AuthUIProvider')

const { localization, social, hooks, mutators } = auth
const unlinkLoading = ref<string | null>(null)

// Get accounts list
const { data: accounts, isPending, error } = hooks.useListAccounts()

// Get provider info
function getProviderIcon(providerId: string) {
  const provider = socialProviders.find(p => p.provider === providerId)
  return provider?.icon
}

function getProviderName(providerId: string) {
  const provider = socialProviders.find(p => p.provider === providerId)
  return provider?.name || providerId
}

// Handle unlink account
async function handleUnlinkAccount(account: any) {
  if (!mutators?.unlinkAccount) return
  
  unlinkLoading.value = account.accountId
  
  try {
    await mutators.unlinkAccount({ 
      providerId: account.providerId,
      accountId: account.accountId 
    })
    toast.success('Account unlinked successfully')
  } catch (error: any) {
    toast.error(getErrorMessage(error, localization))
  } finally {
    unlinkLoading.value = null
  }
}
</script>