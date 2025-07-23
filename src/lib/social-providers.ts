import {
    AppleIcon,
    DiscordIcon,
    DropboxIcon,
    FacebookIcon,
    GitHubIcon,
    GitLabIcon,
    GoogleIcon,
    KickIcon,
    LinkedInIcon,
    MicrosoftIcon,
    RedditIcon,
    RobloxIcon,
    SpotifyIcon,
    TikTokIcon,
    TwitchIcon,
    VKIcon,
    XIcon,
    ZoomIcon
} from "../components/provider-icons.vue"

export type ProviderIcon = (props: { class?: string }) => any

export const socialProviders = [
    {
        provider: "apple",
        name: "Apple",
        icon: AppleIcon
    },
    {
        provider: "discord",
        name: "Discord",
        icon: DiscordIcon
    },
    {
        provider: "dropbox",
        name: "Dropbox",
        icon: DropboxIcon
    },
    {
        provider: "facebook",
        name: "Facebook",
        icon: FacebookIcon
    },
    {
        provider: "github",
        name: "GitHub",
        icon: GitHubIcon
    },
    {
        provider: "gitlab",
        name: "GitLab",
        icon: GitLabIcon
    },
    {
        provider: "google",
        name: "Google",
        icon: GoogleIcon
    },
    {
        provider: "kick",
        name: "Kick",
        icon: KickIcon
    },
    {
        provider: "linkedin",
        name: "LinkedIn",
        icon: LinkedInIcon
    },
    {
        provider: "microsoft",
        name: "Microsoft",
        icon: MicrosoftIcon
    },
    {
        provider: "reddit",
        name: "Reddit",
        icon: RedditIcon
    },
    {
        provider: "roblox",
        name: "Roblox",
        icon: RobloxIcon
    },
    {
        provider: "spotify",
        name: "Spotify",
        icon: SpotifyIcon
    },
    {
        provider: "tiktok",
        name: "TikTok",
        icon: TikTokIcon
    },
    {
        provider: "twitch",
        name: "Twitch",
        icon: TwitchIcon
    },
    {
        provider: "vk",
        name: "VK",
        icon: VKIcon
    },
    {
        provider: "twitter",
        name: "X",
        icon: XIcon
    },
    {
        provider: "zoom",
        name: "Zoom",
        icon: ZoomIcon
    }
] as const

export type Provider = {
    provider: string
    name: string
    icon?: ProviderIcon
}
