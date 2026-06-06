<script lang="ts">
    import { goto } from "$app/navigation";
    import UserTable from "$lib/components/admin/UserTable.svelte";
    import { confirm } from "$lib/stores/confirm.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import type { UserRole } from "$lib/types";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
    }

    let props: Props = $props();

    let searchTerm = $state(props.data.search ?? "");

    // Reset password modal state
    let resetTarget = $state<{ id: string; username: string } | null>(null);
    let newPassword = $state("");
    let resetting = $state(false);
    let resetError = $state("");

    function applySearch() {
        const params = new URLSearchParams();
        if (searchTerm) params.set("search", searchTerm);
        goto(`/admin/users?${params}`);
    }

    async function handleRoleChange(userId: string, newRole: UserRole) {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (res.ok) {
                location.reload();
            } else {
                alert("Failed to update user role");
            }
        } catch {
            alert("Network error");
        }
    }

    async function handleDelete(userId: string, username: string) {
        confirm.show({
            title: "Delete User",
            message: `"${username}" will be permanently removed along with all their articles. This action cannot be undone.`,
            variant: "danger",
            confirmLabel: "Delete",
            onConfirm: async () => {
                const res = await fetch(`/api/admin/users/${userId}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    toast.success("Deleted", `"${username}" has been deleted`);
                    location.reload();
                } else {
                    toast.error("Failed", "Could not delete user. Try again.");
                }
            },
        });
    }

    function handleResetPassword(userId: string, username: string) {
        resetTarget = { id: userId, username };
        newPassword = "";
        resetError = "";
    }

    function closeResetModal() {
        resetTarget = null;
        newPassword = "";
        resetError = "";
    }

    async function confirmReset() {
        if (!resetTarget || newPassword.length < 8) {
            resetError = "Password must be at least 8 characters";
            return;
        }

        resetting = true;
        resetError = "";

        try {
            const res = await fetch(
                `/api/admin/users/${resetTarget.id}/reset-password`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: newPassword }),
                },
            );

            if (res.ok) {
                toast.success(
                    "Password reset",
                    `Password for "${resetTarget.username}" has been changed`,
                );
                closeResetModal();
            } else {
                const data = await res.json();
                resetError = data.error || "Failed to reset password";
            }
        } catch {
            resetError = "Network error";
        } finally {
            resetting = false;
        }
    }

    function handlePageChange(page: number) {
        const params = new URLSearchParams({ page: String(page) });
        if (searchTerm) params.set("search", searchTerm);
        goto(`/admin/users?${params}`);
    }
</script>

<svelte:head>
    <title>Users — Hermes Admin</title>
</svelte:head>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-white">Users</h1>
        <p class="text-sm text-slate-400">{props.data.total} users</p>
    </div>

    <!-- Search -->
    <div class="max-w-sm">
        <form
            onsubmit={(e) => {
                e.preventDefault();
                applySearch();
            }}
        >
            <input
                type="text"
                bind:value={searchTerm}
                placeholder="Search by username or email..."
                class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
        </form>
    </div>

    <UserTable
        users={props.data.users}
        onrolechange={handleRoleChange}
        ondelete={handleDelete}
        onresetpassword={handleResetPassword}
    />

    <!-- Pagination -->
    {#if props.data.totalPages > 1}
        <div class="flex items-center justify-between text-sm text-slate-400">
            <p>
                Showing {(props.data.page - 1) * props.data.perPage +
                    1}&ndash;{Math.min(
                    props.data.page * props.data.perPage,
                    props.data.total,
                )} of {props.data.total}
            </p>
            <div class="flex items-center gap-1">
                <button
                    class="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-700 disabled:opacity-40"
                    disabled={props.data.page <= 1}
                    onclick={() => handlePageChange(props.data.page - 1)}
                >
                    Previous
                </button>
                <button
                    class="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-700 disabled:opacity-40"
                    disabled={props.data.page >= props.data.totalPages}
                    onclick={() => handlePageChange(props.data.page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    {/if}
</div>

<!-- Reset Password Modal -->
{#if resetTarget}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onclick={closeResetModal}
        role="dialog"
        aria-modal="true"
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
            class="w-full max-w-md rounded-xl border border-slate-700/50 bg-slate-800 p-6 shadow-2xl"
            onclick={(e) => e.stopPropagation()}
        >
            <div
                class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10"
            >
                <svg
                    class="h-6 w-6 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                </svg>
            </div>

            <h2 class="text-center text-lg font-semibold text-white">
                Reset Password
            </h2>
            <p class="mt-2 text-center text-sm text-slate-400">
                Set new password for <strong class="text-white"
                    >{resetTarget.username}</strong
                >
            </p>

            <div class="mt-4">
                <label
                    for="new-password"
                    class="mb-1.5 block text-sm font-medium text-slate-300"
                    >New Password</label
                >
                <input
                    id="new-password"
                    type="password"
                    bind:value={newPassword}
                    placeholder="Min. 8 characters"
                    class="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 {resetError
                        ? 'border-red-500'
                        : ''}"
                />
                {#if resetError}
                    <p class="mt-1 text-xs text-red-400">{resetError}</p>
                {/if}
            </div>

            <div class="mt-6 flex gap-3">
                <button
                    type="button"
                    class="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600"
                    onclick={closeResetModal}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    class="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onclick={confirmReset}
                    disabled={resetting}
                >
                    {#if resetting}
                        <svg
                            class="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="3"
                                class="opacity-25"
                            />
                            <path
                                d="M4 12a8 8 0 018-8"
                                stroke="currentColor"
                                stroke-width="3"
                                stroke-linecap="round"
                                class="opacity-75"
                            />
                        </svg>
                    {/if}
                    Reset Password
                </button>
            </div>
        </div>
    </div>
{/if}
