<template>
    <button
        :class="cn(
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-8 px-3 md:ms-auto',
            variant === 'destructive' 
                ? 'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
            classNames?.button,
            variant === 'default' && classNames?.primaryButton,
            variant === 'destructive' && classNames?.destructiveButton
        )"
        :disabled="isSubmitting || disabled"
        :type="type"
        @click="handleClick"
        v-bind="$attrs"
        data-slot="button"
    >
        <Loader2 v-if="isSubmitting" class="animate-spin" />
        <slot>{{ actionLabel }}</slot>
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { cn } from '../../../lib/utils'
import type { SettingsCardClassNames } from './settings-card.vue'

interface Props {
    classNames?: SettingsCardClassNames
    actionLabel: any
    disabled?: boolean
    isSubmitting?: boolean
    variant?: "default" | "destructive"
    onClick?: () => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
    click: []
}>()

defineOptions({
    inheritAttrs: false
})

const type = computed(() => props.onClick ? 'button' : 'submit')

const handleClick = () => {
    if (props.onClick) {
        props.onClick()
    }
    emit('click')
}
</script>