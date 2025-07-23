import { ref, onMounted } from 'vue'

export function useIsHydrated() {
    const isHydrated = ref(false)
    
    onMounted(() => {
        isHydrated.value = true
    })
    
    return isHydrated
}