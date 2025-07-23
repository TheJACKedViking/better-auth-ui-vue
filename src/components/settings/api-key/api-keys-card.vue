<template>
    <div>
        <!-- API Keys Card will be added here -->
        <div>API Keys Card - To be implemented</div>
    </div>
</template>

<script setup lang="ts">
import type { AuthLocalization } from '../../../localization/auth-localization'
import type { SettingsCardClassNames } from '../shared/settings-card.vue'

interface Props {
    classNames?: SettingsCardClassNames
    localization: Partial<AuthLocalization>
}

defineProps<Props>()
</script>