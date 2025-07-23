<template>
  <SettingsCard
    :title="localization.TWO_FACTOR || 'Two-Factor Authentication'"
    :description="localization.TWO_FACTOR_DESCRIPTION || 'Add an extra layer of security to your account'"
    :classNames="classNames"
  >
    <template #content>
      <Skeleton v-if="sessionPending" class="h-24 w-full" />
      
      <div v-else-if="!isEnabled" class="space-y-4">
        <p class="text-sm text-muted-foreground">
          {{ localization.TWO_FACTOR_NOT_ENABLED || 'Two-factor authentication is not enabled' }}
        </p>
        
        <div v-if="showPassword" class="space-y-2">
          <label for="password" class="text-sm font-medium">
            {{ localization.PASSWORD || 'Password' }}
          </label>
          <PasswordInput
            id="password"
            v-model="password"
            :placeholder="localization.PASSWORD_PLACEHOLDER || 'Enter your password'"
            :class="classNames?.input"
            @keydown.enter="handleEnable"
          />
          <p v-if="instructions" class="text-sm text-muted-foreground">
            {{ localization.TWO_FACTOR_ENABLE_INSTRUCTIONS || 'Please enter your password to enable 2FA' }}
          </p>
        </div>
      </div>
      
      <div v-else class="space-y-4">
        <div class="flex items-center gap-2">
          <ShieldCheck class="h-5 w-5 text-green-600 dark:text-green-400" />
          <p class="text-sm font-medium">
            {{ localization.TWO_FACTOR_ENABLED_STATUS || 'Two-factor authentication is enabled' }}
          </p>
        </div>
        
        <div v-if="showBackupCodes && backupCodes.length > 0" class="space-y-3">
          <Alert>
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>{{ localization.BACKUP_CODES_TITLE || 'Backup Codes' }}</AlertTitle>
            <AlertDescription>
              {{ localization.BACKUP_CODES_INSTRUCTIONS || 'Save these backup codes in a secure place. You can use them to access your account if you lose your two-factor authentication method.' }}
            </AlertDescription>
          </Alert>
          
          <div class="grid grid-cols-2 gap-2 rounded-lg border p-4 font-mono text-sm">
            <div v-for="code in backupCodes" :key="code" class="break-all">
              {{ code }}
            </div>
          </div>
          
          <button
            @click="handleCopyBackupCodes"
            :class="cn(
              'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3',
              classNames?.button,
              classNames?.outlineButton
            )"
            data-slot="button"
          >
            <Copy class="h-4 w-4" />
            {{ localization.COPY_BACKUP_CODES || 'Copy Backup Codes' }}
          </button>
        </div>
        
        <div v-if="showDisablePassword" class="space-y-2">
          <label for="disablePassword" class="text-sm font-medium">
            {{ localization.PASSWORD || 'Password' }}
          </label>
          <PasswordInput
            id="disablePassword"
            v-model="disablePassword"
            :placeholder="localization.PASSWORD_PLACEHOLDER || 'Enter your password'"
            :class="classNames?.input"
            @keydown.enter="handleDisable"
          />
          <p v-if="instructions" class="text-sm text-muted-foreground">
            {{ localization.TWO_FACTOR_DISABLE_INSTRUCTIONS || 'Please enter your password to disable 2FA' }}
          </p>
        </div>
      </div>
    </template>
    
    <template #footer v-if="!sessionPending">
      <div class="flex justify-end">
        <button
          v-if="!isEnabled"
          @click="showPassword ? handleEnable() : showPassword = true"
          :disabled="isLoading || (showPassword && !password)"
          :class="cn(
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3',
            classNames?.button,
            classNames?.primaryButton
          )"
          data-slot="button"
        >
          <Loader2 v-if="isLoading" class="animate-spin" />
          <ShieldCheck v-else />
          {{ localization.ENABLE_TWO_FACTOR || 'Enable Two-Factor' }}
        </button>
        
        <button
          v-else
          @click="showDisablePassword ? handleDisable() : showDisablePassword = true"
          :disabled="isLoading || (showDisablePassword && !disablePassword)"
          :class="cn(
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 h-9 px-4 py-2 has-[>svg]:px-3',
            classNames?.button,
            classNames?.destructiveButton
          )"
          data-slot="button"
        >
          <Loader2 v-if="isLoading" class="animate-spin" />
          <ShieldOff v-else />
          {{ localization.DISABLE_TWO_FACTOR || 'Disable Two-Factor' }}
        </button>
      </div>
    </template>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { toast } from 'vue-sonner'
import { ShieldCheck, ShieldOff, AlertCircle, Copy, Loader2 } from 'lucide-vue-next'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { cn, getErrorMessage } from '../../../lib/utils'
import SettingsCard from '../shared/settings-card.vue'
import type { SettingsCardClassNames } from '../shared/settings-card.vue'
import PasswordInput from '../../password-input.vue'

interface TwoFactorCardClassNames extends SettingsCardClassNames {
}

interface Props {
  classNames?: TwoFactorCardClassNames
  instructions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  instructions: true
})

const auth = inject(AuthUIContextKey)
if (!auth) throw new Error('TwoFactorCard must be used within AuthUIProvider')

const { localization, authClient, basePath, viewPaths, navigate } = auth

// Get session data to check if 2FA is enabled
const { data: sessionData, isPending: sessionPending } = auth.hooks.useSession()

const isEnabled = computed(() => (sessionData?.user as any)?.twoFactorEnabled || false)

const password = ref('')
const disablePassword = ref('')
const showPassword = ref(false)
const showDisablePassword = ref(false)
const isLoading = ref(false)
const backupCodes = ref<string[]>([])
const showBackupCodes = ref(false)

async function handleEnable() {
  if (!authClient.twoFactor?.enable || !password.value) return
  
  isLoading.value = true
  
  try {
    const response = await authClient.twoFactor.enable({
      password: password.value
    })
    
    // Show backup codes if returned
    if ('backupCodes' in response && response.backupCodes) {
      backupCodes.value = response.backupCodes as string[]
      showBackupCodes.value = true
    }
    
    // If TOTP URI is returned, redirect to 2FA setup page
    if ('totpURI' in response && response.totpURI) {
      navigate(`${basePath}/${viewPaths.TWO_FACTOR}?totpURI=${encodeURIComponent(response.totpURI as string)}`)
    } else {
      toast.success(localization.TWO_FACTOR_ENABLED || 'Two-factor authentication has been enabled')
    }
    
    password.value = ''
    showPassword.value = false
  } catch (error) {
    toast.error(getErrorMessage(error, localization))
  } finally {
    isLoading.value = false
  }
}

async function handleDisable() {
  if (!authClient.twoFactor?.disable || !disablePassword.value) return
  
  isLoading.value = true
  
  try {
    await authClient.twoFactor.disable({
      password: disablePassword.value
    })
    
    toast.success(localization.TWO_FACTOR_DISABLED || 'Two-factor authentication has been disabled')
    disablePassword.value = ''
    showDisablePassword.value = false
    backupCodes.value = []
    showBackupCodes.value = false
  } catch (error) {
    toast.error(getErrorMessage(error, localization))
  } finally {
    isLoading.value = false
  }
}

async function handleCopyBackupCodes() {
  if (backupCodes.value.length === 0) return
  
  try {
    await navigator.clipboard.writeText(backupCodes.value.join('\n'))
    toast.success(localization.BACKUP_CODES_COPIED || 'Backup codes copied to clipboard')
  } catch (error) {
    toast.error(localization.FAILED_TO_COPY || 'Failed to copy backup codes')
  }
}
</script>