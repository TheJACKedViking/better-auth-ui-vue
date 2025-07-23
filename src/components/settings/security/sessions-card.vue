<template>
  <SettingsCard
    :title="localization.SESSIONS || 'Sessions'"
    :description="localization.SESSIONS_DESCRIPTION || 'Manage your active sessions'"
    :classNames="classNames"
  >
    <template #content>
      <Skeleton v-if="isPending" class="h-32 w-full" />
      
      <div v-else-if="error" class="text-sm text-red-500">
        {{ getErrorMessage(error) }}
      </div>
      
      <div v-else-if="!sessions || sessions.length === 0" class="text-sm text-muted-foreground">
        No active sessions
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="rounded-lg border p-4"
          :class="[
            session.id === currentSessionId && 'border-primary bg-primary/5',
            classNames?.session
          ]"
        >
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <Monitor v-if="session.userAgent && isDesktop(session.userAgent)" class="h-4 w-4" />
                <Smartphone v-else class="h-4 w-4" />
                <p class="text-sm font-medium">
                  {{ getDeviceName(session.userAgent || undefined) }}
                  <span v-if="session.id === currentSessionId" class="ml-2 text-xs text-primary">
                    ({{ localization.CURRENT_SESSION || 'Current Session' }})
                  </span>
                </p>
              </div>
              
              <p v-if="session.ipAddress" class="text-xs text-muted-foreground">
                IP: {{ session.ipAddress }}
              </p>
              
              <p class="text-xs text-muted-foreground">
                Last Active: {{ formatDate(session.updatedAt) }}
              </p>
            </div>
            
            <button
              v-if="session.id !== currentSessionId"
              @click="handleRevokeSession(session.id)"
              :disabled="revokeLoading === session.id"
              class="text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
              :class="classNames?.revokeButton"
            >
              <Loader2 v-if="revokeLoading === session.id" class="h-4 w-4 animate-spin" />
              <span v-else>{{ localization.REVOKE || 'Revoke' }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { toast } from 'vue-sonner'
import { Monitor, Smartphone, Loader2 } from 'lucide-vue-next'
import { UAParser } from 'ua-parser-js'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { getErrorMessage } from '../../../lib/utils'
import SettingsCard from '../shared/settings-card.vue'
import type { SettingsCardClassNames } from '../shared/settings-card.vue'

interface SessionsCardClassNames extends SettingsCardClassNames {
  session?: string
  revokeButton?: string
}

interface Props {
  classNames?: SessionsCardClassNames
}

defineProps<Props>()

const auth = inject(AuthUIContextKey)
if (!auth) throw new Error('SessionsCard must be used within AuthUIProvider')

const { localization, authClient } = auth
const { data: currentSession } = auth.hooks.useSession()
const currentSessionId = currentSession?.session?.id

const { data: sessions, isPending, error } = auth.hooks.useListSessions()
const revokeLoading = ref<string | null>(null)

function isDesktop(userAgent?: string) {
  if (!userAgent) return true
  const parser = new UAParser(userAgent)
  const device = parser.getDevice()
  return device.type !== 'mobile' && device.type !== 'tablet'
}

function getDeviceName(userAgent?: string) {
  if (!userAgent) return 'Unknown Device'
  
  const parser = new UAParser(userAgent)
  const browser = parser.getBrowser()
  const os = parser.getOS()
  
  return `${browser.name || 'Unknown'} on ${os.name || 'Unknown'}`
}

function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(d)
}

async function handleRevokeSession(sessionId: string) {
  if (!auth?.mutators?.revokeSession) return
  
  revokeLoading.value = sessionId
  
  try {
    await auth?.mutators?.revokeSession?.({ token: sessionId })
    toast.success('Session revoked successfully')
  } catch (error) {
    toast.error(getErrorMessage(error, localization))
  } finally {
    revokeLoading.value = null
  }
}
</script>