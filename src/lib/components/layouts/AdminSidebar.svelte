<script lang="ts">
    import HermesLogo from "$lib/components/ui/HermesLogo.svelte";

    interface Props {
        user?: { id: string; username: string; role: string } | null;
        currentPath?: string;
        collapsed?: boolean;
        ontoggle?: () => void;
    }

    let {
        user = null,
        currentPath = "/admin",
        collapsed = true,
        ontoggle = () => {},
    }: Props = $props();

    type Role = "SUPERADMIN" | "EDITOR" | "AUTHOR";

    interface NavItem {
        href: string;
        label: string;
        icon: string;
        roles: Role[];
    }

    const navItems: NavItem[] = [
        {
            href: "/admin",
            label: "Dashboard",
            icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
            roles: ["SUPERADMIN", "EDITOR", "AUTHOR"],
        },
        {
            href: "/admin/articles",
            label: "Articles",
            icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
            roles: ["SUPERADMIN", "EDITOR", "AUTHOR"],
        },
        {
            href: "/admin/tags",
            label: "Tags",
            icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
            roles: ["SUPERADMIN", "EDITOR"],
        },
        {
            href: "/admin/uploads",
            label: "Uploads",
            icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
            roles: ["SUPERADMIN"],
        },
        {
            href: "/admin/analytics",
            label: "Analytics",
            icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
            roles: ["SUPERADMIN", "EDITOR"],
        },
        {
            href: "/admin/users",
            label: "Users",
            icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
            roles: ["SUPERADMIN"],
        },
        {
            href: "/admin/settings",
            label: "Settings",
            icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
            roles: ["SUPERADMIN"],
        },
        {
            href: "/admin/ai",
            label: "AI Queue",
            icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
            roles: ["SUPERADMIN"],
        },
    ];

    const visibleItems = $derived(
        navItems.filter((item) => item.roles.includes(user?.role as Role)),
    );

    function isActive(href: string): boolean {
        if (href === "/admin") return currentPath === "/admin";
        return currentPath.startsWith(href);
    }
</script>

<!-- Mobile overlay -->
{#if !collapsed}
    <div
        class="fixed inset-0 z-30 bg-black/50 lg:hidden"
        onclick={ontoggle}
        role="presentation"
    ></div>
{/if}

<aside
    class="fixed left-0 top-0 z-30 flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-200 dark:border-slate-700 dark:bg-slate-900
			{collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-64'}
			lg:sticky lg:top-0 lg:h-screen"
>
    <!-- Logo -->
    <div
        class="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-700"
    >
        {#if !collapsed}
            <a href="/admin" class="flex items-center">
                <HermesLogo size="sm" />
            </a>
        {/if}
        <button
            onclick={ontoggle}
            class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle sidebar"
        >
            <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                />
            </svg>
        </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto px-3 py-4">
        <ul class="space-y-1">
            {#each visibleItems as item}
                <li>
                    <a
                        href={item.href}
                        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
								{isActive(item.href)
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}"
                    >
                        <svg
                            class="h-5 w-5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d={item.icon}
                            />
                        </svg>
                        {#if !collapsed}
                            {item.label}
                        {/if}
                    </a>
                </li>
            {/each}
        </ul>
    </nav>

    <!-- User info -->
    {#if user}
        <div class="border-t border-slate-200 p-4 dark:border-slate-700">
            <div class="flex items-center gap-3">
                <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white"
                >
                    {user.username.charAt(0).toUpperCase()}
                </div>
                {#if !collapsed}
                    <div class="min-w-0 flex-1">
                        <p
                            class="truncate text-sm font-medium text-slate-900 dark:text-white"
                        >
                            {user.username}
                        </p>
                        <p class="text-xs text-slate-500 dark:text-slate-500">
                            {user.role}
                        </p>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</aside>
