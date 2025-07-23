import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
    plugins: [
        vue(),
        dts({
            insertTypesEntry: true,
            include: ['src/**/*.ts', 'src/**/*.vue'],
            exclude: ['**/*.spec.ts', '**/*.test.ts']
        }),
        Components({
            dts: true,
            dirs: ['src/components'],
            extensions: ['vue', 'ts']
        })
    ],
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                server: resolve(__dirname, 'src/server.ts'),
                tanstack: resolve(__dirname, 'src/tanstack.ts'),
                instantdb: resolve(__dirname, 'src/instantdb.ts'),
                triplit: resolve(__dirname, 'src/triplit.ts')
            },
            name: 'BetterAuthUIVue',
            formats: ['es', 'cjs']
        },
        rollupOptions: {
            external: [
                'vue',
                'vue-router',
                'better-auth',
                '@tanstack/vue-query',
                '@triplit/client',
                '@vueuse/core',
                'vee-validate',
                '@vee-validate/zod',
                'zod',
                'lucide-vue-next',
                'vue-sonner',
                'radix-vue'
            ],
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    }
})