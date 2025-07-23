<template>
    <!-- No separators -->
    <InputOTPGroup v-if="otpSeparators === 0">
        <InputOTPSlot :index="0" />
        <InputOTPSlot :index="1" />
        <InputOTPSlot :index="2" />
        <InputOTPSlot :index="3" />
        <InputOTPSlot :index="4" />
        <InputOTPSlot :index="5" />
    </InputOTPGroup>

    <!-- One separator (3-3) -->
    <template v-else-if="otpSeparators === 1">
        <InputOTPGroup>
            <InputOTPSlot :index="0" />
            <InputOTPSlot :index="1" />
            <InputOTPSlot :index="2" />
        </InputOTPGroup>

        <InputOTPSeparator />

        <InputOTPGroup>
            <InputOTPSlot :index="3" />
            <InputOTPSlot :index="4" />
            <InputOTPSlot :index="5" />
        </InputOTPGroup>
    </template>

    <!-- Two separators (2-2-2) -->
    <template v-else>
        <InputOTPGroup>
            <InputOTPSlot :index="0" />
            <InputOTPSlot :index="1" />
        </InputOTPGroup>

        <InputOTPSeparator />

        <InputOTPGroup>
            <InputOTPSlot :index="2" />
            <InputOTPSlot :index="3" />
        </InputOTPGroup>

        <InputOTPSeparator />

        <InputOTPGroup>
            <InputOTPSlot :index="4" />
            <InputOTPSlot :index="5" />
        </InputOTPGroup>
    </template>
</template>

<script setup lang="ts">

interface Props {
    otpSeparators?: 0 | 1 | 2
}

withDefaults(defineProps<Props>(), {
    otpSeparators: 0
})
</script>