<template>
    <button
        :class="cn(
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 h-9 px-4 py-2 has-[>svg]:px-3 w-full',
            classNames?.form?.button,
            classNames?.form?.secondaryButton
        )"
        :disabled="isSubmitting"
        type="button"
        @click="handleClick"
        data-slot="button"
    >
        <LockIcon v-if="view === 'MAGIC_LINK'" :class="classNames?.form?.icon" />
        <MailIcon v-else :class="classNames?.form?.icon" />
        
        {{ localization.SIGN_IN_WITH }}
        {{ view === 'MAGIC_LINK' ? localization.PASSWORD : localization.MAGIC_LINK }}
    </button>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { LockIcon, MailIcon } from 'lucide-vue-next'

import { AuthUIContextKey } from '../../lib/auth-ui-provider'
import type { AuthView } from '../../lib/auth-view-paths'
import { cn } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import type { AuthCardClassNames } from './auth-card.vue'

interface Props {
    classNames?: AuthCardClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    view: AuthView
}

const props = defineProps<Props>()

const context = inject(AuthUIContextKey)
if (!context) {
    throw new Error('MagicLinkButton must be used within AuthUIProvider')
}

const { viewPaths, navigate, basePath, credentials } = context

const handleClick = () => {
    const searchParams = typeof window !== 'undefined' ? window.location.search : ''
    navigate(
        `${basePath}/${props.view === 'MAGIC_LINK' || !credentials ? viewPaths.SIGN_IN : viewPaths.MAGIC_LINK}${searchParams}`
    )
}
</script>