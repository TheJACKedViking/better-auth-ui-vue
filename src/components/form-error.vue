<template>
    <Alert
        v-if="error"
        variant="destructive"
        :class="cn(classNames?.error)"
    >
        <AlertCircle class="self-center" />
        <AlertTitle>{{ title || 'Error' }}</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
    </Alert>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import { cn } from '../lib/utils'
import type { AuthFormClassNames } from './auth/auth-form.vue'

export interface FormErrorProps {
    title?: string
    error?: string | null
    classNames?: AuthFormClassNames
}

defineProps<FormErrorProps>()
</script>