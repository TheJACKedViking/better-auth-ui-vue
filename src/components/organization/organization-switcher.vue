<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        class="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
        :class="classNames?.trigger"
      >
        <Building2 class="h-4 w-4" />
        <span v-if="activeOrganization">{{ activeOrganization.name }}</span>
        <span v-else>{{ localization.ORGANIZATIONS || 'Select Organization' }}</span>
        <ChevronDown class="ml-auto h-4 w-4 opacity-50" />
      </button>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent align="end" :class="classNames?.content">
      <DropdownMenuItem
        v-if="!activeOrganization || organizationsLength > 0"
        @click="handleSwitchToPersonal"
        class="cursor-pointer"
        :class="classNames?.item"
      >
        <User class="mr-2 h-4 w-4" />
        {{ localization.PERSONAL_ACCOUNT || 'Personal Account' }}
      </DropdownMenuItem>
      
      <DropdownMenuSeparator v-if="organizationsLength > 0" />
      
      <div v-if="isPending">
        <DropdownMenuItem disabled>
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          {{ localization.SIGN_IN_ACTION || 'Loading...' }}
        </DropdownMenuItem>
      </div>
      
      <div v-else-if="error">
        <DropdownMenuItem disabled class="text-red-500">
          {{ getErrorMessage(error) }}
        </DropdownMenuItem>
      </div>
      
      <div v-else-if="organizationsLength > 0">
        <DropdownMenuItem
          v-for="org in organizations"
          :key="org.id"
          @click="handleSwitchOrganization(org.id)"
          class="cursor-pointer"
          :class="[
            activeOrganization?.id === org.id && 'bg-accent',
            classNames?.item
          ]"
        >
          <Building2 class="mr-2 h-4 w-4" />
          <div class="flex flex-col">
            <span>{{ org.name }}</span>
            <span v-if="(org as any).role" class="text-xs text-muted-foreground">
              {{ (org as any).role }}
            </span>
          </div>
          <Check
            v-if="activeOrganization?.id === org.id"
            class="ml-auto h-4 w-4"
          />
        </DropdownMenuItem>
      </div>
      
      <div v-else>
        <DropdownMenuItem disabled>
          {{ localization.ORGANIZATIONS || 'No organizations' }}
        </DropdownMenuItem>
      </div>
      
      <DropdownMenuSeparator v-if="showCreateOption" />
      
      <DropdownMenuItem
        v-if="showCreateOption"
        @click="handleCreateOrganization"
        class="cursor-pointer"
        :class="classNames?.createItem"
      >
        <Plus class="mr-2 h-4 w-4" />
        {{ localization.CREATE_ORGANIZATION || 'Create Organization' }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Building2, ChevronDown, User, Check, Plus, Loader2 } from 'lucide-vue-next'
import { AuthUIContextKey } from '../../lib/auth-ui-provider'
import { cn, getErrorMessage } from '../../lib/utils'

interface OrganizationSwitcherClassNames {
  trigger?: string
  content?: string
  item?: string
  createItem?: string
}

interface Props {
  classNames?: OrganizationSwitcherClassNames
  showCreateOption?: boolean
  onCreateClick?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  showCreateOption: true
})

const auth = inject(AuthUIContextKey)
if (!auth) throw new Error('OrganizationSwitcher must be used within AuthUIProvider')

const { localization, authClient } = auth
const router = useRouter()

// Get organizations data
const { data: organizations, isPending, error } = auth.hooks.useListOrganizations?.() || {
  data: null,
  isPending: false,
  error: null
}

const { data: activeOrganization } = auth.hooks.useActiveOrganization?.() || {
  data: null
}

// Computed property for organizations length
const organizationsLength = computed(() => organizations?.length || 0)

async function handleSwitchOrganization(organizationId: string) {
  if (!authClient.organization?.setActive) return
  
  try {
    const { error } = await authClient.organization.setActive({
      organizationId
    })
    
    if (error) {
      throw error
    }
    
    toast.success('Switched organization successfully')
    
    // Optionally reload the page or update the UI
    await auth?.onSessionChange?.()
  } catch (error) {
    toast.error(getErrorMessage(error, localization))
  }
}

async function handleSwitchToPersonal() {
  if (!authClient.organization?.setActive) return
  
  try {
    const { error } = await authClient.organization.setActive({
      organizationId: null
    })
    
    if (error) {
      throw error
    }
    
    toast.success('Switched to personal account')
    
    // Optionally reload the page or update the UI
    await auth?.onSessionChange?.()
  } catch (error) {
    toast.error(getErrorMessage(error, localization))
  }
}

function handleCreateOrganization() {
  if (props.onCreateClick) {
    props.onCreateClick()
  } else {
    // Navigate to create organization page
    router.push('/organizations/new')
  }
}
</script>