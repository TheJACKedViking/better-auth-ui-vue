<template>
    <div class="flex w-full flex-col gap-4 md:gap-6">
        <!-- Security Settings Components will be added here -->
        <div>Security Settings Cards - To be implemented</div>
    </div>
</template>

<script setup lang="ts">
import type { AuthLocalization } from '../../localization/auth-localization'
import type { SettingsCardsClassNames } from '../../lib/settings-constants'

interface Props {
    classNames?: SettingsCardsClassNames
    localization: Partial<AuthLocalization>
}

defineProps<Props>()
</script>