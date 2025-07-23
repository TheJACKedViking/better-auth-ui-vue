import type { TriplitClient } from "@triplit/client"
import { computed, ref, watchEffect } from "vue"

export function useTriplitToken(triplit: TriplitClient) {
    // Note: Triplit doesn't have Vue bindings for connection status
    // We'll use the token directly
    const token = ref(triplit.token)

    // Watch for token changes
    watchEffect(() => {
        token.value = triplit.token
    })

    const payload = computed(() =>
        token.value
            ? (decodeJWT(token.value) as Record<string, unknown> & {
                  exp: number
                  iat: number
                  sub?: string
                  email?: string
                  name?: string
              })
            : undefined
    )

    return { 
        token: computed(() => payload.value && token.value), 
        payload 
    }
}

function decodeJWT(token: string) {
    try {
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((char) => {
                    return `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`
                })
                .join("")
        )

        return JSON.parse(jsonPayload)
    } catch (error) {
        console.error("Failed to decode JWT:", error)
        return null
    }
}
