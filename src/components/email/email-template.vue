<template>
    <div>
        <!-- Email Template - Server-side rendering component -->
        <p>Email template component for server-side email generation</p>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '../../lib/utils'

export interface EmailTemplateClassNames {
    body?: string
    button?: string
    container?: string
    image?: string
    content?: string
    footer?: string
    heading?: string
    hr?: string
    link?: string
}

export interface EmailTemplateProps {
    classNames?: EmailTemplateClassNames
    action?: string
    baseUrl?: string
    content: string
    heading: string
    imageUrl?: string
    preview?: string
    siteName?: string
    url?: string
    variant?: "vercel"
}

const props = withDefaults(defineProps<EmailTemplateProps>(), {
    variant: 'vercel'
})

// Note: In a real implementation, this would be a server-side component
// that generates HTML email templates. Vue doesn't have an equivalent
// to @react-email/components, so this would need to be handled differently
// based on your email service provider.

const computedBaseUrl = computed(() => 
    props.baseUrl || process.env.BASE_URL || process.env.VITE_BASE_URL
)

const computedImageUrl = computed(() => 
    props.imageUrl || `${computedBaseUrl.value}/apple-touch-icon.png`
)

const computedSiteName = computed(() => 
    props.siteName || process.env.SITE_NAME || process.env.VITE_SITE_NAME
)

const computedPreview = computed(() => 
    props.preview || props.heading
)

// Note: The email generation function is exported from a separate file
// See: src/lib/email-template-generator.ts
</script>