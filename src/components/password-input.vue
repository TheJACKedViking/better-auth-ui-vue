<template>
    <div class="relative">
        <input
            :type="isVisible && enableToggle ? 'text' : 'password'"
            :class="cn(enableToggle && 'pr-10', className, 
                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
            )"
            :value="modelValue"
            @input="handleInput"
            v-bind="$attrs"
            data-slot="input"
        />

        <button
            v-if="enableToggle"
            type="button"
            :class="cn(
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9',
                '!bg-transparent absolute top-0 right-0'
            )"
            :disabled="disabled"
            @click="toggleVisibility"
            data-slot="button"
        >
            <EyeIcon v-if="isVisible" />
            <EyeOffIcon v-else />
        </button>

        <style v-if="enableToggle">
            .hide-password-toggle::-ms-reveal,
            .hide-password-toggle::-ms-clear {
                visibility: hidden;
                pointer-events: none;
                display: none;
            }
        </style>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import { cn } from '../lib/utils'

interface Props {
    modelValue?: string
    className?: string
    enableToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    enableToggle: false
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

defineOptions({
    inheritAttrs: false
})

const isVisible = ref(false)
const disabled = computed(() => !props.modelValue)

const handleInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    emit('update:modelValue', value)
}

const toggleVisibility = () => {
    isVisible.value = !isVisible.value
}
</script>