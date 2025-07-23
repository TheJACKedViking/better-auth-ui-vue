<template>
  <SettingsCard
    :title="localization.NAME || 'Name'"
    :description="localization.NAME_DESCRIPTION || 'Your display name'"
    :instructions="localization.NAME_INSTRUCTIONS || 'Please use 32 characters maximum'"
    :classNames="classNames"
    :action="handleUpdate"
    :action-label="localization.UPDATE_NAME || 'Update Name'"
    :is-submitting="isUpdating"
    :disabled="!hasChanges || !!error"
  >
    <template #content>
      <div class="space-y-2">
        <label for="name" :class="classNames?.label">
          {{ localization.NAME || 'Name' }}
        </label>
        
        <input
          id="name"
          v-model="name"
          type="text"
          :placeholder="localization.NAME_PLACEHOLDER || 'Enter your name'"
          :disabled="isUpdating"
          :required="nameRequired"
          :maxlength="32"
          :aria-invalid="!!error"
          :class="cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            classNames?.input
          )"
          data-slot="input"
          @input="validateName"
        />
        
        <div class="flex justify-between items-center">
          <span v-if="error" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
            {{ error }}
          </span>
          <span v-else class="text-xs text-muted-foreground">
            {{ name.length }} / 32
          </span>
        </div>
      </div>
    </template>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, inject, computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { cn, getErrorMessage } from '../../../lib/utils'
import SettingsCard from '../shared/settings-card.vue'
import type { SettingsCardClassNames } from '../shared/settings-card.vue'

interface UpdateNameCardClassNames extends SettingsCardClassNames {
}

interface Props {
  classNames?: UpdateNameCardClassNames
}

defineProps<Props>()

const auth = inject(AuthUIContextKey)
if (!auth) throw new Error('UpdateNameCard must be used within AuthUIProvider')

const { localization, authClient, nameRequired } = auth

// Get current user data
const { data: sessionData } = auth.hooks.useSession()
const currentUser = computed(() => sessionData?.user)

// State
const name = ref<string>('')
const isUpdating = ref(false)
const error = ref<string>('')

// Initialize name from current user
watch(currentUser, (user) => {
  if (user) {
    name.value = user.name || ''
  }
}, { immediate: true })

// Computed
const hasChanges = computed(() => {
  if (!currentUser.value) return false
  return name.value !== (currentUser.value.name || '')
})

// Validation
const validateName = () => {
  error.value = ''
  
  if (nameRequired && !name.value.trim()) {
    error.value = localization.NAME_REQUIRED || 'Name is required'
    return false
  }
  
  if (name.value.length > 32) {
    error.value = localization.NAME_TOO_LONG || 'Name must be 32 characters or less'
    return false
  }
  
  // Optional: Add more validation rules
  // For example, check for valid characters
  const nameRegex = /^[a-zA-Z0-9\s\-'.]+$/
  if (name.value && !nameRegex.test(name.value)) {
    error.value = localization.NAME_INVALID || 'Name contains invalid characters'
    return false
  }
  
  return true
}

// Handle update
const handleUpdate = async () => {
  if (!authClient.updateUser || !hasChanges.value) return
  
  // Validate before updating
  if (!validateName()) return
  
  isUpdating.value = true
  
  try {
    await authClient.updateUser({
      name: name.value.trim() || undefined
    })
    
    toast.success(localization.NAME_UPDATED || 'Name updated successfully')
  } catch (err) {
    toast.error(getErrorMessage(err, localization))
  } finally {
    isUpdating.value = false
  }
}
</script>