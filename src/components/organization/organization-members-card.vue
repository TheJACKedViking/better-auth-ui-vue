<template>
    <SettingsCard
        v-if="!activeOrganization"
        :className="className"
        :classNames="classNames"
        :title="localization.MEMBERS"
        :description="localization.MEMBERS_DESCRIPTION"
        :instructions="localization.MEMBERS_INSTRUCTIONS"
        :actionLabel="localization.INVITE_MEMBER"
        :isPending="true"
        v-bind="$attrs"
    />
    <OrganizationMembersContent
        v-else
        :className="className"
        :classNames="classNames"
        :localization="localization"
        v-bind="$attrs"
    />
</template>

<script setup lang="ts">
import { computed, onMounted, watch, defineComponent, h } from 'vue'
import { useAuthUIContext } from '../../lib/auth-ui-provider'
import { cn } from '../../lib/utils'
import SettingsCard from '../settings/shared/settings-card.vue'
import InviteMemberDialog from './invite-member-dialog.vue'
import MemberCell from './member-cell.vue'

// Define props inline to avoid Vue compiler issue
const props = defineProps<{
    className?: string
    classNames?: any
    title?: any
    description?: any
    instructions?: any
    actionLabel?: any
    isSubmitting?: boolean
    disabled?: boolean
    isPending?: boolean
    optimistic?: boolean
    variant?: "default" | "destructive"
    localization?: any
    action?: () => Promise<unknown> | unknown
}>()

const {
    basePath,
    hooks: { useActiveOrganization },
    localization: contextLocalization,
    settings,
    replace,
    viewPaths
} = useAuthUIContext()

const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

const {
    data: activeOrganization,
    isPending: organizationPending,
    isRefetching: organizationFetching
} = useActiveOrganization()

onMounted(() => {
    const checkOrganization = () => {
        if (organizationPending || organizationFetching) return
        if (!activeOrganization)
            replace(`${settings?.basePath || basePath}/${viewPaths.SETTINGS}`)
    }

    const unwatch = watch(
        [activeOrganization, organizationPending, organizationFetching],
        checkOrganization,
        { immediate: true }
    )

    return unwatch
})

const OrganizationMembersContent = defineComponent({
    name: 'OrganizationMembersContent',
    props: {
        className: String,
        classNames: Object as () => any,
        localization: Object
    },
    setup(props: any) {
        const {
            hooks: { useActiveOrganization, useHasPermission },
            localization: contextLocalization
        } = useAuthUIContext()

        const localization = computed(() => ({ ...contextLocalization, ...props.localization }))

        const { data: activeOrganization } = useActiveOrganization()
        const { data: hasPermissionInvite, isPending: isPendingInvite } =
            useHasPermission({
                permissions: {
                    invitation: ['create']
                }
            })

        const {
            data: hasPermissionUpdateMember,
            isPending: isPendingUpdateMember
        } = useHasPermission({
            permission: {
                member: ['update']
            }
        })

        const isPending = computed(() => isPendingInvite || isPendingUpdateMember)

        const members = computed(() => activeOrganization?.members)

        const inviteDialogOpen = ref(false)

        return () => h(
            Fragment,
            [
                h(SettingsCard, {
                    className: props.className,
                    classNames: props.classNames,
                    title: localization.value.MEMBERS,
                    description: localization.value.MEMBERS_DESCRIPTION,
                    instructions: localization.value.MEMBERS_INSTRUCTIONS,
                    actionLabel: localization.value.INVITE_MEMBER,
                    action: () => inviteDialogOpen.value = true,
                    isPending: isPending.value,
                    disabled: !hasPermissionInvite?.success,
                    ...props
                }, {
                    default: () => !isPending.value && members.value && members.value.length > 0
                        ? h(
                            CardContent,
                            { class: cn('grid gap-4', props.classNames?.content) },
                            () => members.value
                                ?.sort(
                                    (a: any, b: any) =>
                                        new Date(a.createdAt).getTime() -
                                        new Date(b.createdAt).getTime()
                                )
                                .map((member: any) =>
                                    h(MemberCell, {
                                        key: member.id,
                                        classNames: props.classNames,
                                        member,
                                        localization: localization.value,
                                        hideActions: !hasPermissionUpdateMember?.success
                                    })
                                )
                        )
                        : null
                }),
                h(InviteMemberDialog, {
                    open: inviteDialogOpen.value,
                    'onUpdate:open': (value: boolean) => inviteDialogOpen.value = value,
                    classNames: props.classNames,
                    localization: localization.value
                })
            ]
        )
    }
})

import { Fragment, ref } from 'vue'
import { CardContent } from '../ui'
</script>