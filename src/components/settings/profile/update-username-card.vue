<template>
  <SettingsCard
    :title="localization.USERNAME || 'Username'"
    :description="localization.USERNAME_DESCRIPTION || 'Your unique username'"
    :instructions="localization.USERNAME_INSTRUCTIONS || 'Username must be 3-20 characters, lowercase letters, numbers, and underscores only'"
    :classNames="classNames"
    :action="handleUpdate"
    :action-label="localization.UPDATE_USERNAME || 'Update Username'"
    :is-submitting="isUpdating || isChecking"
    :disabled="!hasChanges || !!error || isChecking"
  >
    <template #content>
      <div class="space-y-2">
        <label for="username" :class="classNames?.label">
          {{ localization.USERNAME || 'Username' }}
        </label>
        
        <div class="relative">
          <input
            id="username"
            v-model="username"
            type="text"
            :placeholder="localization.USERNAME_PLACEHOLDER || 'Enter your username'"
            :disabled="isUpdating || !usernameEnabled"
            :maxlength="20"
            :aria-invalid="!!error"
            :class="cn(
              'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
              classNames?.input
            )"
            data-slot="input"
            @input="handleInput"
          />
          
          <div v-if="isChecking" class="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 class="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
          
          <div v-else-if="username && !error && hasChanges" class="absolute right-2 top-1/2 -translate-y-1/2">
            <Check class="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div class="flex justify-between items-center">
          <span v-if="error" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
            {{ error }}
          </span>
          <span v-else-if="!usernameEnabled" class="text-sm text-muted-foreground">
            {{ localization.USERNAME_DISABLED || 'Username changes are disabled' }}
          </span>
          <span v-else class="text-xs text-muted-foreground">
            {{ username.length }} / 20
          </span>
        </div>
      </div>
    </template>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, inject, computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Check, Loader2 } from 'lucide-vue-next'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { cn, getErrorMessage } from '../../../lib/utils'
import SettingsCard from '../shared/settings-card.vue'
import type { SettingsCardClassNames } from '../shared/settings-card.vue'

interface UpdateUsernameCardClassNames extends SettingsCardClassNames {
}

interface Props {
  classNames?: UpdateUsernameCardClassNames
  checkAvailability?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  checkAvailability: true
})

const auth = inject(AuthUIContextKey)
if (!auth) throw new Error('UpdateUsernameCard must be used within AuthUIProvider')

const { localization, authClient, credentials } = auth
const usernameEnabled = credentials?.username || false

// Get current user data
const { data: sessionData } = auth.hooks.useSession()
const currentUser = computed(() => sessionData?.user)

// State
const username = ref<string>('')
const isUpdating = ref(false)
const isChecking = ref(false)
const error = ref<string>('')
let checkTimeout: NodeJS.Timeout

// Initialize username from current user
watch(currentUser, (user) => {
  if (user) {
    // Check for username in various possible fields
    username.value = (user as any).username || (user as any).displayUsername || ''
  }
}, { immediate: true })

// Computed
const hasChanges = computed(() => {
  if (!currentUser.value) return false
  const currentUsername = (currentUser.value as any).username || (currentUser.value as any).displayUsername || ''
  return username.value !== currentUsername
})

// Validation
const validateUsername = (): boolean => {
  error.value = ''
  
  if (!username.value.trim()) {
    error.value = localization.USERNAME_REQUIRED || 'Username is required'
    return false
  }
  
  if (username.value.length < 3) {
    error.value = localization.USERNAME_TOO_SHORT || 'Username must be at least 3 characters'
    return false
  }
  
  if (username.value.length > 20) {
    error.value = localization.USERNAME_TOO_LONG || 'Username must be 20 characters or less'
    return false
  }
  
  // Username format validation (lowercase letters, numbers, underscores)
  const usernameRegex = /^[a-z0-9_]+$/
  if (!usernameRegex.test(username.value)) {
    error.value = localization.USERNAME_INVALID || 'Username can only contain lowercase letters, numbers, and underscores'
    return false
  }
  
  // Check for reserved usernames
  const reserved = ['admin', 'root', 'user', 'api', 'system', 'support']
  if (reserved.includes(username.value.toLowerCase())) {
    error.value = localization.USERNAME_RESERVED || 'This username is reserved'
    return false
  }
  
  return true
}

// Check username availability (debounced)
const checkAvailability = async () => {
  if (!props.checkAvailability || !(authClient as any).username?.checkAvailability) return
  
  isChecking.value = true
  
  try {
    const result = await (authClient as any).username.checkAvailability({
      username: username.value
    })
    
    if (!result.available) {
      error.value = localization.USERNAME_IS_ALREADY_TAKEN || 'Username is already taken'
    }
  } catch (err) {
    // If the endpoint doesn't exist, just skip availability check
    console.warn('Username availability check failed:', err)
  } finally {
    isChecking.value = false
  }
}

// Handle input with debounced validation and availability check
const handleInput = () => {
  clearTimeout(checkTimeout)
  
  if (validateUsername() && hasChanges.value) {
    checkTimeout = setTimeout(() => {
      checkAvailability()
    }, 500)
  }
}

// Handle update
const handleUpdate = async () => {
  if (!authClient.updateUser || !hasChanges.value) return
  
  // Validate before updating
  if (!validateUsername()) return
  
  isUpdating.value = true
  
  try {
    await authClient.updateUser({
      username: username.value.toLowerCase()
    })
    
    toast.success(localization.USERNAME_UPDATED || 'Username updated successfully')
  } catch (err: any) {
    // Handle specific username errors
    if (err.message?.includes('taken') || err.message?.includes('exists')) {
      error.value = localization.USERNAME_IS_ALREADY_TAKEN || 'Username is already taken'
    } else {
      toast.error(getErrorMessage(err, localization))
    }
  } finally {
    isUpdating.value = false
  }
}
</script>