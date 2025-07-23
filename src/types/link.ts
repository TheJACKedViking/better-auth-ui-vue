import type { Component } from "vue"

export type Link = Component<{
    href: string
    className?: string
}>