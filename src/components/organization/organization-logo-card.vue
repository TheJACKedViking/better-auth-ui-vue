<template>
    <Card
        v-if="!activeOrganization"
        :class="cn(
            'w-full pb-0 text-start',
            className,
            classNames?.base
        )"
        v-bind="$attrs"
    >
        <div class="flex justify-between">
            <SettingsCardHeader
                class="grow self-start"
                :title="localization.LOGO"
                :description="localization.LOGO_DESCRIPTION"
                :isPending="true"
                :classNames="classNames"
            />

            <Button
                type="button"
                class="me-6 size-fit rounded-full"
                size="icon"
                variant="ghost"
                :disabled="true"
            >
                <OrganizationLogo
                    :isPending="true"
                    class="size-20 text-2xl"
                    :classNames="classNames?.avatar"
                    :localization="localization"
                />
            </Button>
        </div>

        <SettingsCardFooter
            class="!py-5"
            :instructions="localization.LOGO_INSTRUCTIONS"
            :classNames="classNames"
            :isPending="true"
            :isSubmitting="false"
        />
    </Card>
    <OrganizationLogoForm
        v-else
        :className="className"
        :classNames="classNames"
        :localization="localization"
        v-bind="$attrs"
    />
</template>

<script setup lang="ts">
import { Trash2Icon, UploadCloudIcon } from 'lucide-vue-next'
import { ref, computed, defineComponent, h } from 'vue'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { fileToBase64, resizeAndCropImage } from '../../lib/image-utils'
import { cn, getLocalizedError } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import type { SettingsCardClassNames } from '../settings/shared/settings-card.vue'
import SettingsCardFooter from '../settings/shared/settings-card-footer.vue'
import SettingsCardHeader from '../settings/shared/settings-card-header.vue'
import OrganizationLogo from './organization-logo.vue'
import { Button, Card, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui'

export interface OrganizationLogoCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
}

const props = defineProps<OrganizationLogoCardProps>()

const {
    hooks: { useActiveOrganization },
    localization: authLocalization
} = useAuthUIContext()

const localization = computed(() => ({ ...authLocalization, ...props.localization }))

const { data: activeOrganization } = useActiveOrganization()

const OrganizationLogoForm = defineComponent({
    name: 'OrganizationLogoForm',
    props: {
        className: String,
        classNames: Object as () => SettingsCardClassNames,
        localization: Object as () => AuthLocalization
    },
    setup(props: OrganizationLogoCardProps) {
        const {
            authClient,
            hooks: {
                useActiveOrganization,
                useListOrganizations,
                useHasPermission
            },
            localization: authLocalization,
            optimistic,
            organization,
            toast
        } = useAuthUIContext()

        const localization = computed(() => ({ ...authLocalization, ...props.localization }))

        const { data: activeOrganization, refetch: refetchActiveOrganization } =
            useActiveOrganization()
        const { refetch: refetchOrganizations } = useListOrganizations()
        const { data: hasPermission, isPending: permissionPending } =
            useHasPermission({
                permissions: {
                    organization: ['update']
                }
            })

        const isPending = computed(() => !activeOrganization || permissionPending)

        const fileInputRef = ref<HTMLInputElement | null>(null)
        const loading = ref(false)

        const handleFileChange = async (event: Event) => {
            const target = event.target as HTMLInputElement
            const file = target.files?.[0]
            if (file) await handleLogoChange(file)
            
            // Clear the input value to allow selecting the same file again
            target.value = ''
        }

        const handleLogoChange = async (file: File) => {
            if (
                !activeOrganization ||
                !organization?.logo ||
                !hasPermission?.success
            )
                return

            loading.value = true
            const resizedFile = await resizeAndCropImage(
                file,
                crypto.randomUUID(),
                organization.logo.size,
                organization.logo.extension
            )

            let image: string | undefined | null

            if (organization.logo.upload) {
                image = await organization.logo.upload(resizedFile)
            } else {
                image = await fileToBase64(resizedFile)
            }

            if (!image) {
                loading.value = false
                return
            }

            if (optimistic && !organization.logo.upload) loading.value = false

            try {
                await authClient.organization.update({
                    organizationId: activeOrganization.id,
                    data: { logo: image },
                    fetchOptions: { throw: true }
                })

                await refetchActiveOrganization?.()
                await refetchOrganizations?.()
            } catch (error) {
                toast({
                    variant: 'error',
                    message: getLocalizedError({ error, localization: localization.value })
                })
            }

            loading.value = false
        }

        const handleDeleteLogo = async () => {
            if (!activeOrganization || !hasPermission?.success) return

            loading.value = true

            try {
                await authClient.organization.update({
                    organizationId: activeOrganization.id,
                    data: { logo: '' },
                    fetchOptions: { throw: true }
                })

                await refetchActiveOrganization?.()
                await refetchOrganizations?.()
            } catch (error) {
                toast({
                    variant: 'error',
                    message: getLocalizedError({ error, localization: localization.value })
                })
            }

            loading.value = false
        }

        const openFileDialog = () => {
            if (hasPermission?.success) {
                fileInputRef.value?.click()
            }
        }

        return () => h(
            Card,
            {
                class: cn(
                    'w-full pb-0 text-start',
                    props.className,
                    props.classNames?.base
                )
            },
            () => [
                h('div', { class: 'flex justify-between' }, [
                    h(SettingsCardHeader, {
                        class: 'grow self-start',
                        title: localization.value.LOGO,
                        description: localization.value.LOGO_DESCRIPTION,
                        isPending: isPending.value,
                        classNames: props.classNames
                    }),
                    h(DropdownMenu, {}, {
                        default: () => [
                            h(DropdownMenuTrigger, { asChild: true }, () =>
                                h(
                                    Button,
                                    {
                                        type: 'button',
                                        class: 'me-6 size-fit rounded-full',
                                        size: 'icon',
                                        variant: 'ghost',
                                        disabled:
                                            isPending.value ||
                                            loading.value ||
                                            !hasPermission?.success
                                    },
                                    () =>
                                        h(OrganizationLogo, {
                                            key: activeOrganization?.logo || undefined,
                                            organization: activeOrganization,
                                            isPending: isPending.value || loading.value,
                                            className: 'size-20 text-2xl',
                                            classNames: props.classNames?.avatar,
                                            localization: localization.value
                                        })
                                )
                            ),
                            h(DropdownMenuContent, {
                                onCloseAutoFocus: (e: Event) => e.preventDefault()
                            }, () => [
                                h(
                                    DropdownMenuItem,
                                    { onClick: openFileDialog },
                                    () => [
                                        h(UploadCloudIcon, { class: props.classNames?.icon }),
                                        localization.value.UPLOAD_LOGO
                                    ]
                                ),
                                activeOrganization?.logo &&
                                    h(
                                        DropdownMenuItem,
                                        {
                                            onClick: handleDeleteLogo,
                                            variant: 'destructive'
                                        },
                                        () => [
                                            h(Trash2Icon, { class: props.classNames?.icon }),
                                            localization.value.DELETE_LOGO
                                        ]
                                    )
                            ])
                        ]
                    })
                ]),
                h('input', {
                    ref: fileInputRef,
                    type: 'file',
                    accept: 'image/*',
                    class: 'hidden',
                    onChange: handleFileChange
                }),
                h(SettingsCardFooter, {
                    class: '!py-5',
                    instructions: localization.value.LOGO_INSTRUCTIONS,
                    classNames: props.classNames,
                    isPending: isPending.value,
                    isSubmitting: loading.value
                })
            ]
        )
    }
})
</script>

<script lang="ts">
export default {
    name: 'OrganizationLogoCard'
}
</script>