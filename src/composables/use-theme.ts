import { ref, onMounted, onUnmounted } from 'vue'

export function useTheme() {
    const theme = ref<'light' | 'dark'>('light')
    
    const checkTheme = () => {
        const isDark =
            document.documentElement.classList.contains('dark') ||
            document.documentElement
                .getAttribute('style')
                ?.includes('color-scheme: dark')
        theme.value = isDark ? 'dark' : 'light'
    }
    
    onMounted(() => {
        // Initial check
        checkTheme()
        
        // Listen for changes to html tag
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (
                    mutation.attributeName === 'style' ||
                    mutation.attributeName === 'class'
                ) {
                    checkTheme()
                }
            }
        })
        
        observer.observe(document.documentElement, { attributes: true })
        
        onUnmounted(() => {
            observer.disconnect()
        })
    })
    
    return { theme }
}