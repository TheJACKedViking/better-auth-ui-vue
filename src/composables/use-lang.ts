import { ref, onMounted, onUnmounted } from 'vue'

export function useLang() {
    const lang = ref<string | undefined>()
    
    const checkLang = () => {
        const currentLang = document.documentElement.getAttribute('lang')
        lang.value = currentLang ?? undefined
    }
    
    onMounted(() => {
        // Initial check
        checkLang()
        
        // Listen for changes to lang attribute on html tag
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'lang') {
                    checkLang()
                }
            }
        })
        
        observer.observe(document.documentElement, { attributes: true })
        
        onUnmounted(() => {
            observer.disconnect()
        })
    })
    
    return { lang }
}