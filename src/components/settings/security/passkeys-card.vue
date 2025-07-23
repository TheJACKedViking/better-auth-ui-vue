<template>
  <SettingsCard
    :title="localization.PASSKEYS || 'Passkeys'"
    :description="localization.PASSKEYS_DESCRIPTION || 'Manage your passkeys for secure access'"
    :classNames="classNames"
  >
    <template #content>
      <Skeleton v-if="isPending" class="h-32 w-full" />
      
      <div v-else-if="error" class="text-sm text-red-500">
        {{ getErrorMessage(error) }}
      </div>
      
      <div v-else-if="!passkeys || passkeys.length === 0" class="text-sm text-muted-foreground">
        {{ localization.NO_PASSKEYS || 'No passkeys registered' }}
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="passkey in passkeys"
          :key="passkey.id"
          class="rounded-lg border p-4"
          :class="classNames?.passkey"
        >
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <Key class="h-4 w-4" />
                <p class="text-sm font-medium">
                  {{ passkey.name || localization.UNNAMED_PASSKEY || 'Unnamed Passkey' }}
                </p>
              </div>
              
              <p v-if="passkey.createdAt" class="text-xs text-muted-foreground">
                {{ localization.ADDED || 'Added' }}: {{ formatDate(passkey.createdAt) }}
              </p>
              
              <div v-if="passkey.deviceType" class="flex items-center gap-1 text-xs text-muted-foreground">
                <Monitor v-if="(passkey.deviceType as string) === 'platform'" class="h-3 w-3" />
                <Usb v-else class="h-3 w-3" />
                {{ getDeviceTypeName(passkey.deviceType as string) }}
              </div>
            </div>
            
            <button
              @click="handleDeletePasskey(passkey.id)"
              :disabled="deleteLoading === passkey.id"
              class="text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
              :class="classNames?.deleteButton"
            >
              <Loader2 v-if="deleteLoading === passkey.id" class="h-4 w-4 animate-spin" />
              <span v-else>{{ localization.DELETE || 'Delete' }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>
    
    <template #footer>
      <div class="flex items-center justify-between">
        <p v-if="showInstructions" class="text-sm text-muted-foreground">
          {{ localization.PASSKEY_INSTRUCTIONS || 'Passkeys provide a secure, passwordless way to sign in' }}
        </p>
        
        <button
          @click="handleAddPasskey"
          :disabled="addLoading"
          :class="cn(
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3',
            classNames?.button,
            classNames?.primaryButton
          )"
          data-slot="button"
        >
          <Loader2 v-if="addLoading" class="animate-spin" />
          <Plus v-else />
          {{ localization.ADD_PASSKEY || 'Add Passkey' }}
        </button>
      </div>
    </template>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { toast } from 'vue-sonner'
import { Key, Monitor, Usb, Plus, Loader2 } from 'lucide-vue-next'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { cn, getErrorMessage } from '../../../lib/utils'
import SettingsCard from '../shared/settings-card.vue'
import type { SettingsCardClassNames } from '../shared/settings-card.vue'

interface PasskeysCardClassNames extends SettingsCardClassNames {
  passkey?: string
  deleteButton?: string
}

interface Props {
  classNames?: PasskeysCardClassNames
  showInstructions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showInstructions: true
})

const auth = inject(AuthUIContextKey)
if (!auth) throw new Error('PasskeysCard must be used within AuthUIProvider')

const { localization, authClient } = auth

// Get passkeys data
const { data: passkeys, isPending, error, refetch } = auth.hooks.useListPasskeys?.() || {
  data: null,
  isPending: false,
  error: null,
  refetch: () => {}
}

const deleteLoading = ref<string | null>(null)
const addLoading = ref(false)

function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(d)
}

function getDeviceTypeName(deviceType: string) {
  if (deviceType === 'platform') {
    return localization.PLATFORM_AUTHENTICATOR || 'Built-in authenticator'
  }
  return localization.CROSS_PLATFORM_AUTHENTICATOR || 'Security key'
}

async function handleDeletePasskey(passkeyId: string) {
  if (!auth?.mutators?.deletePasskey) return
  
  deleteLoading.value = passkeyId
  
  try {
    await auth.mutators.deletePasskey({ id: passkeyId })
    toast.success(localization.PASSKEY_DELETED || 'Passkey deleted successfully')
    refetch?.()
  } catch (error) {
    toast.error(getErrorMessage(error, localization))
  } finally {
    deleteLoading.value = null
  }
}

async function handleAddPasskey() {
  if (!authClient.passkey?.addPasskey) return
  
  addLoading.value = true
  
  try {
    // First, check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      throw new Error(localization.WEBAUTHN_NOT_SUPPORTED || 'WebAuthn is not supported in this browser')
    }
    
    // Add the passkey
    await authClient.passkey.addPasskey({
      authenticatorAttachment: 'platform' // Default to platform authenticator
    })
    
    toast.success(localization.PASSKEY_ADDED || 'Passkey added successfully')
    refetch?.()
  } catch (error: any) {
    // Handle specific WebAuthn errors
    if (error.name === 'NotAllowedError') {
      toast.error(localization.PASSKEY_REGISTRATION_CANCELLED || 'Passkey registration was cancelled')
    } else if (error.name === 'NotSupportedError') {
      toast.error(localization.WEBAUTHN_NOT_SUPPORTED || 'WebAuthn is not supported in this browser')
    } else {
      toast.error(getErrorMessage(error, localization))
    }
  } finally {
    addLoading.value = false
  }
}
</script>