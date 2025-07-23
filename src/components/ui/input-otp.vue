<template>
    <div
        :class="cn(
            'flex items-center gap-2 has-disabled:opacity-50',
            containerClassName
        )"
        data-slot="input-otp"
    >
        <input
            ref="hiddenInput"
            v-model="internalValue"
            type="text"
            :maxlength="maxLength"
            :disabled="disabled"
            class="sr-only"
            @input="handleInput"
            @keydown="handleKeyDown"
        />
        <slot />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, watch } from 'vue'
import { cn } from '../../lib/utils'

interface Props {
    modelValue?: string
    maxLength?: number
    containerClassName?: string
    className?: string
    disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    maxLength: 6,
    disabled: false
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
    'change': [value: string]
}>()

const hiddenInput = ref<HTMLInputElement>()
const internalValue = ref(props.modelValue)
const activeIndex = ref(0)

// Update internal value when prop changes
watch(() => props.modelValue, (newValue) => {
    internalValue.value = newValue
    activeIndex.value = Math.min(newValue.length, props.maxLength - 1)
})

// Provide context for child components
const slots = computed(() => {
    return Array.from({ length: props.maxLength }, (_, index) => ({
        char: internalValue.value[index] || '',
        hasFakeCaret: activeIndex.value === index && !props.disabled,
        isActive: activeIndex.value === index
    }))
})

provide('OTPInputContext', {
    slots,
    focus: (index: number) => {
        activeIndex.value = index
        hiddenInput.value?.focus()
    }
})

const handleInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    const sanitized = value.replace(/[^0-9]/g, '').slice(0, props.maxLength)
    
    internalValue.value = sanitized
    activeIndex.value = Math.min(sanitized.length, props.maxLength - 1)
    
    emit('update:modelValue', sanitized)
    emit('change', sanitized)
}

const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Backspace' && internalValue.value.length > 0) {
        event.preventDefault()
        const newValue = internalValue.value.slice(0, -1)
        internalValue.value = newValue
        activeIndex.value = Math.max(0, newValue.length - 1)
        
        emit('update:modelValue', newValue)
        emit('change', newValue)
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        activeIndex.value = Math.max(0, activeIndex.value - 1)
    } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        activeIndex.value = Math.min(props.maxLength - 1, activeIndex.value + 1)
    }
}

// Focus the hidden input when component is clicked
const focus = () => {
    hiddenInput.value?.focus()
}

defineExpose({
    focus
})
</script>