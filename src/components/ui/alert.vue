<template>
    <div
        :class="cn(alertVariants({ variant }), className)"
        role="alert"
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const alertVariants = cva(
    'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-3.5 [&>svg]:text-foreground [&>svg~*]:pl-8',
    {
        variants: {
            variant: {
                default: 'bg-background text-foreground',
                destructive:
                    'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

type AlertVariants = VariantProps<typeof alertVariants>

interface Props extends /* @vue-ignore */ AlertVariants {
    className?: string
}

withDefaults(defineProps<Props>(), {
    variant: 'default'
})
</script>