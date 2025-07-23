<template>
  <SettingsCard
    :title="localization.CHANGE_PASSWORD || 'Change Password'"
    :description="localization.CHANGE_PASSWORD_DESCRIPTION || 'Update your account password'"
    :classNames="classNames"
  >
    <template #content>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="space-y-2">
          <label for="currentPassword" class="text-sm font-medium">
            {{ localization.CURRENT_PASSWORD || 'Current Password' }}
          </label>
          <PasswordInput
            id="currentPassword"
            v-model="currentPassword"
            required
            :placeholder="localization.CURRENT_PASSWORD_PLACEHOLDER || 'Enter your current password'"
            :class="classNames?.input"
          />
        </div>
        
        <div class="space-y-2">
          <label for="newPassword" class="text-sm font-medium">
            {{ localization.NEW_PASSWORD || 'New Password' }}
          </label>
          <PasswordInput
            id="newPassword"
            v-model="newPassword"
            required
            :placeholder="localization.NEW_PASSWORD_PLACEHOLDER || 'Enter your new password'"
            :class="classNames?.input"
          />
        </div>
        
        <div class="space-y-2">
          <label for="confirmPassword" class="text-sm font-medium">
            {{ localization.CONFIRM_PASSWORD || 'Confirm Password' }}
          </label>
          <PasswordInput
            id="confirmPassword"
            v-model="confirmPassword"
            required
            :placeholder="localization.CONFIRM_PASSWORD_PLACEHOLDER || 'Confirm your new password'"
            :class="classNames?.input"
          />
        </div>
        
        <div v-if="error" class="text-sm text-red-500">
          {{ error }}
        </div>
        
        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          :class="classNames?.button"
        >
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          {{ localization.CHANGE_PASSWORD || 'Change Password' }}
        </button>
      </form>
    </template>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { toast } from 'vue-sonner'
import { Loader2 } from 'lucide-vue-next'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { getErrorMessage } from '../../../lib/utils'
import SettingsCard from '../shared/settings-card.vue'
import PasswordInput from '../../password-input.vue'

interface ChangePasswordCardClassNames {
  root?: string
  input?: string
  button?: string
}

interface Props {
  classNames?: ChangePasswordCardClassNames
}

defineProps<Props>()

const auth = inject(AuthUIContextKey)
if (!auth) throw new Error('ChangePasswordCard must be used within AuthUIProvider')

const { localization, authClient } = auth

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const isLoading = ref(false)

const isFormValid = computed(() => {
  return currentPassword.value && newPassword.value && confirmPassword.value && newPassword.value === confirmPassword.value
})

async function onSubmit() {
  if (!authClient.changePassword || !isFormValid.value) return
  
  error.value = ''
  
  if (newPassword.value !== confirmPassword.value) {
    error.value = localization.PASSWORDS_DO_NOT_MATCH || 'Passwords do not match'
    return
  }
  
  isLoading.value = true
  
  try {
    const { error: changeError } = await authClient.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    }, {
      onRequest: () => {},
      onSuccess: () => {
        toast.success('Password changed successfully')
        currentPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
      },
      onError: (ctx) => {
        error.value = getErrorMessage(ctx.error, localization)
      }
    })
    
    if (changeError) {
      throw changeError
    }
  } catch (err) {
    error.value = getErrorMessage(err, localization)
  } finally {
    isLoading.value = false
  }
}
</script>