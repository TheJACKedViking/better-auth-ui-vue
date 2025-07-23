<template>
  <SettingsCard
    :title="localization.EMAIL || 'Email'"
    :description="localization.EMAIL_DESCRIPTION || 'Change your email address'"
    :classNames="classNames"
  >
    <template #content>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium">
            {{ localization.EMAIL || 'Email' }}
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            :placeholder="localization.EMAIL_PLACEHOLDER || 'Enter your new email'"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            :class="classNames?.input"
          />
        </div>
        
        <button
          type="submit"
          :disabled="isLoading || !email || email === user?.email"
          class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          :class="classNames?.button"
        >
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          {{ localization.EMAIL || 'Email' }}
        </button>
      </form>
    </template>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { toast } from 'vue-sonner'
import { Loader2 } from 'lucide-vue-next'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { getErrorMessage } from '../../../lib/utils'
import SettingsCard from '../shared/settings-card.vue'

interface ChangeEmailCardClassNames {
  root?: string
  input?: string
  button?: string
}

interface Props {
  classNames?: ChangeEmailCardClassNames
}

defineProps<Props>()

const auth = inject(AuthUIContextKey)
if (!auth) throw new Error('ChangeEmailCard must be used within AuthUIProvider')

const { localization, authClient, hooks } = auth
const { data: session } = hooks.useSession()
const user = session?.user

const email = ref(user?.email || '')
const isLoading = ref(false)

async function onSubmit() {
  if (!authClient.changeEmail || !email.value || email.value === user?.email) return
  
  isLoading.value = true
  
  try {
    const { error } = await authClient.changeEmail({
      newEmail: email.value
    }, {
      onRequest: () => {},
      onSuccess: () => {
        toast.success(localization.EMAIL_OTP_VERIFICATION_SENT || 'Verification email sent')
      },
      onError: (ctx: any) => {
        toast.error(getErrorMessage(ctx.error, localization))
      }
    })
    
    if (error) {
      throw error
    }
  } catch (error: any) {
    toast.error(getErrorMessage(error, localization))
  } finally {
    isLoading.value = false
  }
}
</script>