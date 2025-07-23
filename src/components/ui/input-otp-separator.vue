<template>
    <div data-slot="input-otp-separator" role="separator" v-bind="$attrs">
        <MinusIcon />
    </div>
</template>

<script setup lang="ts">
import { MinusIcon } from 'lucide-vue-next'

defineOptions({
    inheritAttrs: false
})
</script>