<template>
  <SettingsCard
    :title="title"
    :description="description"
    :instructions="instructions"
    :classNames="classNames"
    :action="handleUpdate"
    :action-label="actionLabel || localization.UPDATE || 'Update'"
    :is-submitting="isUpdating"
    :disabled="!hasChanges || !!validationError"
  >
    <template #content>
      <div class="space-y-2">
        <label v-if="label" :for="fieldId" :class="classNames?.label">
          {{ label }}
        </label>
        
        <input
          v-if="type !== 'textarea'"
          :id="fieldId"
          v-model="fieldValue"
          :type="type"
          :placeholder="placeholder"
          :disabled="isUpdating || disabled"
          :required="required"
          :maxlength="maxLength"
          :aria-invalid="!!validationError"
          :class="cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            classNames?.input
          )"
          data-slot="input"
          @input="handleInput"
        />
        
        <textarea
          v-else
          :id="fieldId"
          v-model="fieldValue"
          :placeholder="placeholder"
          :disabled="isUpdating || disabled"
          :required="required"
          :maxlength="maxLength"
          :rows="rows"
          :aria-invalid="!!validationError"
          :class="cn(
            'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive resize-none',
            classNames?.input
          )"
          data-slot="textarea"
          @input="handleInput"
        />
        
        <div v-if="showCharacterCount && maxLength" class="flex justify-end">
          <span class="text-xs text-muted-foreground">
            {{ fieldValue.length }} / {{ maxLength }}
          </span>
        </div>
        
        <span v-if="validationError" :class="cn('text-sm font-medium text-destructive', classNames?.error)">
          {{ validationError }}
        </span>
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

interface UpdateFieldCardClassNames extends SettingsCardClassNames {
}

interface Props {
  classNames?: UpdateFieldCardClassNames
  
  // Field configuration
  field: string
  title?: string
  description?: string
  instructions?: string
  label?: string
  placeholder?: string
  actionLabel?: string
  
  // Field type and validation
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'textarea'
  required?: boolean
  disabled?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  rows?: number // for textarea
  showCharacterCount?: boolean
  
  // Custom validation
  validate?: (value: string) => string | null | Promise<string | null>
  
  // Transform value before updating
  transform?: (value: string) => string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  rows: 3,
  showCharacterCount: false
})

const auth = inject(AuthUIContextKey)
if (!auth) throw new Error('UpdateFieldCard must be used within AuthUIProvider')

const { localization, authClient } = auth

// Get current user data
const { data: sessionData } = auth.hooks.useSession()
const currentUser = computed(() => sessionData?.user)

// Generate unique field ID
const fieldId = `field-${props.field}-${Math.random().toString(36).substr(2, 9)}`

// State
const fieldValue = ref<string>('')
const isUpdating = ref(false)
const validationError = ref<string | null>(null)

// Initialize field value from current user
watch(currentUser, (user) => {
  if (user && props.field in user) {
    fieldValue.value = String((user as any)[props.field] || '')
  }
}, { immediate: true })

// Computed
const hasChanges = computed(() => {
  if (!currentUser.value) return false
  const currentValue = (currentUser.value as any)[props.field]
  return fieldValue.value !== String(currentValue || '')
})

// Validation
const validateField = async (): Promise<boolean> => {
  validationError.value = null
  
  // Required validation
  if (props.required && !fieldValue.value.trim()) {
    validationError.value = `${props.title || props.field} ${localization.IS_REQUIRED || 'is required'}`
    return false
  }
  
  // Length validation
  if (props.minLength && fieldValue.value.length < props.minLength) {
    validationError.value = `${props.title || props.field} ${localization.TOO_SHORT || 'is too short'}`
    return false
  }
  
  if (props.maxLength && fieldValue.value.length > props.maxLength) {
    validationError.value = `${props.title || props.field} ${localization.TOO_LONG || 'is too long'}`
    return false
  }
  
  // Pattern validation
  if (props.pattern && !new RegExp(props.pattern).test(fieldValue.value)) {
    validationError.value = `${props.title || props.field} ${localization.IS_INVALID || 'is invalid'}`
    return false
  }
  
  // Type-specific validation
  if (props.type === 'email' && fieldValue.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(fieldValue.value)) {
      validationError.value = localization.INVALID_EMAIL || 'Invalid email address'
      return false
    }
  }
  
  if (props.type === 'url' && fieldValue.value) {
    try {
      new URL(fieldValue.value)
    } catch {
      validationError.value = localization.INVALID_URL || 'Invalid URL'
      return false
    }
  }
  
  // Custom validation
  if (props.validate) {
    const customError = await props.validate(fieldValue.value)
    if (customError) {
      validationError.value = customError
      return false
    }
  }
  
  return true
}

// Handle input with debounced validation
const handleInput = async () => {
  if (fieldValue.value || props.required) {
    await validateField()
  } else {
    validationError.value = null
  }
}

// Handle update
const handleUpdate = async () => {
  if (!authClient.updateUser || !hasChanges.value) return
  
  // Validate before updating
  const isValid = await validateField()
  if (!isValid) return
  
  isUpdating.value = true
  
  try {
    const value = props.transform 
      ? props.transform(fieldValue.value)
      : fieldValue.value
    
    await authClient.updateUser({
      [props.field]: value || null
    })
    
    toast.success(
      `${props.title || props.field} ${localization.UPDATED || 'updated successfully'}`
    )
  } catch (error) {
    toast.error(getErrorMessage(error, localization))
  } finally {
    isUpdating.value = false
  }
}
</script>