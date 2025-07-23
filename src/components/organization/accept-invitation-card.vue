<template>
    <AcceptInvitationSkeleton
        v-if="!sessionData || !invitationId"
        :className="className"
        :classNames="classNames"
        :localization="localization"
    />
    <AcceptInvitationContent
        v-else
        :className="className"
        :classNames="classNames"
        :localization="localization"
        :invitationId="invitationId"
    />
</template>

<script setup lang="ts">
import { CheckIcon, Loader2Icon, XIcon } from 'lucide-vue-next'
import { computed, onMounted, ref, h, watch, defineComponent } from 'vue'
import { useAuthenticate } from '../../composables/use-authenticate'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { cn, getLocalizedError, getSearchParam } from '../../lib/utils'
import type { AuthLocalization } from '../../localization/auth-localization'
import type { SettingsCardClassNames } from '../settings/shared/settings-card.vue'
import OrganizationView from './organization-view.vue'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '../ui'

export interface AcceptInvitationCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<AuthLocalization>
}

const props = defineProps<AcceptInvitationCardProps>()

const {
    hooks: { useSession },
    localization: contextLocalization,
    toast,
    redirectTo,
    replace
} = useAuthUIContext()

const localization = computed(
    () => ({ ...contextLocalization, ...props.localization })
)

const { data: sessionData } = useSession()
const invitationId = ref<string | null>(null)

onMounted(() => {
    const invitationIdParam = getSearchParam('invitationId')

    if (!invitationIdParam) {
        toast({
            variant: 'error',
            message: localization.value.INVITATION_NOT_FOUND
        })

        replace(redirectTo)
        return
    }

    invitationId.value = invitationIdParam
})

// If session is not loaded yet, use authenticate hook to check
useAuthenticate()

interface AcceptInvitationContentProps extends AcceptInvitationCardProps {
    invitationId: string
}

const AcceptInvitationContent = defineComponent({
    name: 'AcceptInvitationContent',
    props: {
        className: String,
        classNames: Object as () => SettingsCardClassNames,
        localization: Object as () => Partial<AuthLocalization>,
        invitationId: {
            type: String,
            required: true
        }
    },
    setup(props: AcceptInvitationContentProps) {
        const {
            authClient,
            localization: contextLocalization,
            toast,
            redirectTo,
            replace,
            organization,
            hooks: { useInvitation }
        } = useAuthUIContext()

        const localization = computed(
            () => ({ ...contextLocalization, ...props.localization })
        )

        const isRejecting = ref(false)
        const isAccepting = ref(false)
        const isProcessing = computed(() => isRejecting.value || isAccepting.value)

        const { data: invitation, isPending } = useInvitation({
            query: {
                id: props.invitationId
            }
        })

        onMounted(() => {
            const checkInvitation = () => {
                if (isPending || !props.invitationId) return

                if (!invitation) {
                    toast({
                        variant: 'error',
                        message: localization.value.INVITATION_NOT_FOUND
                    })

                    replace(redirectTo)
                    return
                }

                if (
                    invitation.status !== 'pending' ||
                    new Date(invitation.expiresAt) < new Date()
                ) {
                    toast({
                        variant: 'error',
                        message:
                            new Date(invitation.expiresAt) < new Date()
                                ? localization.value.INVITATION_EXPIRED
                                : localization.value.INVITATION_NOT_FOUND
                    })

                    replace(redirectTo)
                }
            }

            // Watch for invitation changes
            const unwatch = watch([invitation, isPending], checkInvitation, { immediate: true })
            return unwatch
        })

        const acceptInvitation = async () => {
            if (!props.invitationId) return

            isAccepting.value = true

            try {
                await authClient.organization.acceptInvitation({
                    invitationId: props.invitationId,
                    fetchOptions: { throw: true }
                })

                toast({
                    variant: 'success',
                    message:
                        localization.value.INVITATION_ACCEPTED || 'Invitation accepted'
                })

                replace(redirectTo)
            } catch (error) {
                toast({
                    variant: 'error',
                    message: getLocalizedError({ error, localization: localization.value })
                })
                isAccepting.value = false
            }
        }

        const rejectInvitation = async () => {
            if (!props.invitationId) return

            isRejecting.value = true

            try {
                await authClient.organization.rejectInvitation({
                    invitationId: props.invitationId,
                    fetchOptions: { throw: true }
                })

                toast({
                    variant: 'success',
                    message: localization.value.INVITATION_REJECTED
                })

                replace(redirectTo)
            } catch (error) {
                toast({
                    variant: 'error',
                    message: getLocalizedError({ error, localization: localization.value })
                })

                isRejecting.value = false
            }
        }

        const builtInRoles = [
            { role: 'owner', label: localization.value.OWNER },
            { role: 'admin', label: localization.value.ADMIN },
            { role: 'member', label: localization.value.MEMBER }
        ]

        const roles = computed(() => [...builtInRoles, ...(organization?.customRoles || [])])
        const roleLabel = computed(() =>
            roles.value.find((r) => r.role === invitation?.role)?.label ||
            invitation?.role
        )

        return () => {
            if (isPending)
                return h(AcceptInvitationSkeleton, {
                    className: props.className,
                    classNames: props.classNames
                })

            return h(
                Card,
                { class: cn('w-full max-w-sm', props.className, props.classNames?.base) },
                () => [
                    h(
                        CardHeader,
                        {
                            class: cn(
                                'justify-items-center text-center',
                                props.classNames?.header
                            )
                        },
                        () => [
                            h(
                                CardTitle,
                                {
                                    class: cn('text-lg md:text-xl', props.classNames?.title)
                                },
                                () => localization.value.ACCEPT_INVITATION
                            ),
                            h(
                                CardDescription,
                                {
                                    class: cn(
                                        'text-xs md:text-sm',
                                        props.classNames?.description
                                    )
                                },
                                () => localization.value.ACCEPT_INVITATION_DESCRIPTION
                            )
                        ]
                    ),
                    h(
                        CardContent,
                        {
                            class: cn(
                                'flex flex-col gap-6 truncate',
                                props.classNames?.content
                            )
                        },
                        () => [
                            h(
                                Card,
                                { class: cn('flex-row items-center p-4') },
                                () => [
                                    h(OrganizationView, {
                                        organization: invitation
                                            ? {
                                                  id: invitation.organizationId,
                                                  name: invitation.organizationName,
                                                  slug: invitation.organizationSlug,
                                                  logo: invitation.organizationLogo,
                                                  createdAt: new Date()
                                              }
                                            : null,
                                        localization: localization.value
                                    }),
                                    h(
                                        'p',
                                        { class: 'ml-auto text-muted-foreground text-sm' },
                                        roleLabel.value
                                    )
                                ]
                            ),
                            h(
                                'div',
                                { class: 'grid grid-cols-2 gap-3' },
                                [
                                    h(
                                        Button,
                                        {
                                            variant: 'outline',
                                            class: cn(
                                                props.classNames?.button,
                                                props.classNames?.outlineButton
                                            ),
                                            onClick: rejectInvitation,
                                            disabled: isProcessing.value
                                        },
                                        () => [
                                            isRejecting.value
                                                ? h(Loader2Icon, { class: 'animate-spin' })
                                                : h(XIcon),
                                            localization.value.REJECT
                                        ]
                                    ),
                                    h(
                                        Button,
                                        {
                                            class: cn(
                                                props.classNames?.button,
                                                props.classNames?.primaryButton
                                            ),
                                            onClick: acceptInvitation,
                                            disabled: isProcessing.value
                                        },
                                        () => [
                                            isAccepting.value
                                                ? h(Loader2Icon, { class: 'animate-spin' })
                                                : h(CheckIcon),
                                            localization.value.ACCEPT
                                        ]
                                    )
                                ]
                            )
                        ]
                    )
                ]
            )
        }
    }
})

const AcceptInvitationSkeleton = defineComponent({
    name: 'AcceptInvitationSkeleton',
    props: {
        className: String,
        classNames: Object as () => SettingsCardClassNames,
        localization: Object as () => AuthLocalization
    },
    setup(props) {
        return () =>
            h(
                Card,
                { class: cn('w-full max-w-sm', props.className, props.classNames?.base) },
                () => [
                    h(
                        CardHeader,
                        {
                            class: cn('justify-items-center', props.classNames?.header)
                        },
                        () => [
                            h(Skeleton, {
                                class: cn(
                                    'my-1 h-5 w-full max-w-32 md:h-5.5 md:w-40',
                                    props.classNames?.skeleton
                                )
                            }),
                            h(Skeleton, {
                                class: cn(
                                    'my-0.5 h-3 w-full max-w-56 md:h-3.5 md:w-64',
                                    props.classNames?.skeleton
                                )
                            })
                        ]
                    ),
                    h(
                        CardContent,
                        {
                            class: cn(
                                'flex flex-col gap-6 truncate',
                                props.classNames?.content
                            )
                        },
                        () => [
                            h(
                                Card,
                                { class: cn('flex-row items-center p-4') },
                                () => [
                                    h(OrganizationView, {
                                        isPending: true,
                                        localization: props.localization
                                    }),
                                    h(Skeleton, {
                                        class: 'mt-0.5 ml-auto h-4 w-full max-w-14 shrink-2'
                                    })
                                ]
                            ),
                            h(
                                'div',
                                { class: 'grid grid-cols-2 gap-3' },
                                [
                                    h(Skeleton, { class: 'h-9 w-full' }),
                                    h(Skeleton, { class: 'h-9 w-full' })
                                ]
                            )
                        ]
                    )
                ]
            )
    }
})
</script>

<script lang="ts">
export default {
    name: 'AcceptInvitationCard'
}
</script>