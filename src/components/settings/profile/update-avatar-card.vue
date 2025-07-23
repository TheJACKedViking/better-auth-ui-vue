<template>
  <SettingsCard
    :title="localization.AVATAR || 'Avatar'"
    :description="localization.AVATAR_DESCRIPTION || 'Click on the avatar to upload a custom one from your files'"
    :instructions="localization.AVATAR_INSTRUCTIONS || 'An avatar is optional but strongly recommended'"
    :classNames="classNames"
    :action="handleUpdate"
    :action-label="localization.UPDATE_AVATAR || 'Update Avatar'"
    :is-submitting="isUpdating"
    :disabled="!hasChanges"
  >
    <template #content>
      <div class="flex items-center gap-6">
        <input
          ref="fileInputRef"
          accept="image/*"
          :disabled="isUpdating"
          hidden
          type="file"
          @change="handleFileChange"
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              class="relative rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:opacity-80"
              type="button"
              data-slot="button"
              :disabled="isUpdating"
            >
              <UserAvatar
                :is-pending="isUpdating"
                class="size-20"
                :classNames="classNames?.avatar"
                :user="previewUser"
                :localization="localization"
              />
              
              <div v-if="isUpdating" class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <Loader2 class="h-6 w-6 animate-spin text-white" />
              </div>
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            align="start"
            @close-auto-focus="(e) => e.preventDefault()"
          >
            <DropdownMenuItem
              @click="openFileDialog"
              :disabled="isUpdating"
            >
              <UploadCloudIcon />
              {{ localization.UPLOAD_AVATAR || 'Upload Avatar' }}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              v-if="currentUser?.image || previewImage"
              @click="handleDeleteAvatar"
              :disabled="isUpdating"
              variant="destructive"
            >
              <Trash2Icon />
              {{ localization.DELETE_AVATAR || 'Delete Avatar' }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">
            {{ localization.AVATAR_UPLOAD_INSTRUCTIONS || 'Click on the avatar to upload a new image' }}
          </p>
          <p v-if="avatar" class="text-xs text-muted-foreground">
            {{ localization.RECOMMENDED_SIZE || 'Recommended size' }}: {{ avatar.size }}x{{ avatar.size }}px
          </p>
        </div>
      </div>
      
      <div v-if="error" class="mt-4">
        <p class="text-sm text-destructive">{{ error }}</p>
      </div>
    </template>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { toast } from 'vue-sonner'
import { UploadCloudIcon, Trash2Icon, Loader2 } from 'lucide-vue-next'
import { AuthUIContextKey } from '../../../lib/auth-ui-provider'
import { fileToBase64, resizeAndCropImage } from '../../../lib/image-utils'
import { getLocalizedError } from '../../../lib/utils'
import UserAvatar from '../../user-avatar.vue'
import SettingsCard from '../shared/settings-card.vue'
import type { SettingsCardClassNames } from '../shared/settings-card.vue'

interface UpdateAvatarCardClassNames extends SettingsCardClassNames {
}

interface Props {
  classNames?: UpdateAvatarCardClassNames
}

defineProps<Props>()

const auth = inject(AuthUIContextKey)
if (!auth) throw new Error('UpdateAvatarCard must be used within AuthUIProvider')

const { localization, authClient, avatar } = auth

// Get current user data
const { data: sessionData } = auth.hooks.useSession()
const currentUser = computed(() => sessionData?.user)

// State
const fileInputRef = ref<HTMLInputElement>()
const previewImage = ref<string | null>(null)
const isUpdating = ref(false)
const error = ref<string>('')

// Computed
const previewUser = computed(() => {
  if (!currentUser.value) return null
  
  return {
    ...currentUser.value,
    image: previewImage.value || currentUser.value.image
  }
})

const hasChanges = computed(() => {
  if (!currentUser.value) return false
  
  // Has changes if:
  // 1. New image is selected (previewImage is set)
  // 2. Current image is being deleted (previewImage is '' but currentUser has image)
  return previewImage.value !== null && previewImage.value !== currentUser.value.image
})

// Methods
const openFileDialog = () => fileInputRef.value?.click()

const handleFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.item(0)
  if (!file) return
  
  await handleAvatarChange(file)
  ;(event.target as HTMLInputElement).value = ''
}

const handleAvatarChange = async (file: File) => {
  isUpdating.value = true
  error.value = ''
  
  try {
    let imageResult: string | undefined | null
    
    if (avatar) {
      // Resize and crop the image
      const resizedFile = await resizeAndCropImage(
        file,
        crypto.randomUUID(),
        avatar.size,
        avatar.extension
      )
      
      // Upload or convert to base64
      if (avatar.upload) {
        imageResult = await avatar.upload(resizedFile)
      } else {
        imageResult = await fileToBase64(resizedFile)
      }
    } else {
      // No avatar config, just convert to base64
      imageResult = await fileToBase64(file)
    }
    
    if (imageResult) {
      previewImage.value = imageResult
    } else {
      throw new Error(localization.FAILED_TO_UPLOAD_IMAGE || 'Failed to upload image')
    }
  } catch (err) {
    console.error(err)
    error.value = getLocalizedError({ error: err, localization })
  } finally {
    isUpdating.value = false
  }
}

const handleDeleteAvatar = () => {
  previewImage.value = ''
  error.value = ''
}

const handleUpdate = async () => {
  if (!authClient.updateUser || !hasChanges.value) return
  
  isUpdating.value = true
  error.value = ''
  
  try {
    await authClient.updateUser({
      image: previewImage.value || null
    })
    
    toast.success(localization.AVATAR_UPDATED || 'Avatar updated successfully')
    
    // Reset preview to match new state
    previewImage.value = null
  } catch (err) {
    error.value = getLocalizedError({ error: err, localization })
    toast.error(error.value)
  } finally {
    isUpdating.value = false
  }
}
</script>