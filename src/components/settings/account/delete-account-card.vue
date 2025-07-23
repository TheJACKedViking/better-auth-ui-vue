<template>
  <SettingsCard
    :title="localization.DELETE_ACCOUNT || 'Delete Account'"
    :description="localization.DELETE_ACCOUNT_DESCRIPTION || 'Permanently delete your account'"
    :classNames="classNames"
  >
    <template #content>
      <div class="space-y-4">
        <Alert variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            {{ localization.DELETE_ACCOUNT_DESCRIPTION || 'This action cannot be undone. This will permanently delete your account and remove your data from our servers.' }}
          </AlertDescription>
        </Alert>
        
        <div v-if="showConfirmation" class="space-y-4">
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium">
              {{ localization.CONFIRM_PASSWORD || 'Confirm Password' }}
            </label>
            <PasswordInput
              id="password"
              v-model="password"
              required
              :placeholder="localization.PASSWORD_PLACEHOLDER || 'Enter your password'"
              :class="classNames?.input"
            />
          </div>
          
          <div class="space-y-2">
            <label for="confirmText" class="text-sm font-medium">
              Type DELETE to confirm
            </label>
            <input
              id="confirmText"
              v-model="confirmText"
              type="text"
              required
              placeholder="DELETE"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              :class="classNames?.input"
            />
          </div>
          
          <div v-if="error" class="text-sm text-red-500">
            {{ error }}
          </div>
          
          <div class="flex gap-2">
            <button
              @click="handleDelete"
              :disabled="isLoading || !isConfirmValid"
              class="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              :class="classNames?.deleteButton"
            >
              <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
              {{ localization.DELETE_ACCOUNT || 'Delete Account' }}
            </button>
            
            <button
              @click="cancelDelete"
              type="button"
              class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              :class="classNames?.cancelButton"
            >
              {{ localization.CANCEL || 'Cancel' }}
            </button>
          </div>
        </div>
        
        <button
          v-else
          @click="showConfirmation = true"
          class="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          :class="classNames?.button"
        >
          {{ localization.DELETE_ACCOUNT || 'Delete Account' }}
        </button>
      </div>
    </template>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Loader2, AlertCircle } from 'lucide-vue-next'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { getErrorMessage } from '../../../lib/utils'
import SettingsCard from '../shared/settings-card.vue'
import PasswordInput from '../../password-input.vue'

interface DeleteAccountCardClassNames {
  root?: string
  input?: string
  button?: string
  deleteButton?: string
  cancelButton?: string
}

interface Props {
  classNames?: DeleteAccountCardClassNames
}

defineProps<Props>()

const auth = inject(AuthUIContextKey)
if (!auth) throw new Error('DeleteAccountCard must be used within AuthUIProvider')

const { localization, authClient, viewPaths } = auth
const router = useRouter()

const showConfirmation = ref(false)
const password = ref('')
const confirmText = ref('')
const error = ref('')
const isLoading = ref(false)

const isConfirmValid = computed(() => {
  return password.value && confirmText.value === 'DELETE'
})

function cancelDelete() {
  showConfirmation.value = false
  password.value = ''
  confirmText.value = ''
  error.value = ''
}

async function handleDelete() {
  if (!authClient.deleteUser || !isConfirmValid.value) return
  
  error.value = ''
  isLoading.value = true
  
  try {
    const { error: deleteError } = await authClient.deleteUser({
      password: password.value
    }, {
      onRequest: () => {},
      onSuccess: () => {
        toast.success('Account deleted successfully')
        // Redirect to sign-in page after deletion
        router.push(viewPaths.SIGN_IN)
      },
      onError: (ctx) => {
        error.value = getErrorMessage(ctx.error, localization)
      }
    })
    
    if (deleteError) {
      throw deleteError
    }
  } catch (err) {
    error.value = getErrorMessage(err, localization)
  } finally {
    isLoading.value = false
  }
}
</script>