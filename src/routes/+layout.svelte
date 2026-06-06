<script lang="ts">
    import { APP_NAME } from "$lib/constants";
    import { theme } from "$lib/stores/theme";
    import { auth } from "$lib/stores/auth";
    import Toast from "$lib/components/ui/Toast.svelte";
    import ConfirmDialog from "$lib/components/ui/ConfirmDialog.svelte";
    import "../app.css";

    interface Props {
        children: import("svelte").Snippet;
    }

    let { children }: Props = $props();

    $effect(() => {
        theme.init();
        auth.fetchUser();
    });
</script>

<svelte:head>
    <title>{APP_NAME}</title>
</svelte:head>

<div
    class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors"
>
    {@render children()}
</div>

<Toast />
<ConfirmDialog />
