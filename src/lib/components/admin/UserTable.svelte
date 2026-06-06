<script lang="ts">
    import type { UserRole } from "$lib/types";
    import { ROLES } from "$lib/constants";

    interface User {
        id: string;
        username: string;
        email: string;
        role: UserRole;
        emailVerified: boolean;
        articles?: { id: string }[];
        createdAt: string;
    }

    interface Props {
        users: User[];
        onrolechange: (userId: string, newRole: UserRole) => void;
        ondelete: (userId: string, username: string) => void;
        onresetpassword: (userId: string, username: string) => void;
    }

    let { users, onrolechange, ondelete, onresetpassword }: Props = $props();

    const roleOptions = [ROLES.SUPERADMIN, ROLES.EDITOR, ROLES.AUTHOR];

    function confirmDelete(userId: string, username: string) {
        ondelete(userId, username);
    }
</script>

<div
    class="w-full overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/50"
>
    <table class="w-full min-w-[700px] text-left text-sm">
        <thead>
            <tr class="border-b border-slate-700/50">
                <th class="px-4 py-3 font-semibold text-slate-300">Username</th>
                <th class="px-4 py-3 font-semibold text-slate-300">Email</th>
                <th class="px-4 py-3 font-semibold text-slate-300">Role</th>
                <th class="px-4 py-3 font-semibold text-slate-300">Verified</th>
                <th class="px-4 py-3 font-semibold text-slate-300">Articles</th>
                <th class="px-4 py-3 font-semibold text-slate-300 text-right"
                    >Actions</th
                >
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-700/30">
            {#if users.length === 0}
                <tr>
                    <td
                        colspan="6"
                        class="px-4 py-12 text-center text-slate-500"
                        >No users found</td
                    >
                </tr>
            {:else}
                {#each users as user}
                    <tr class="transition-colors hover:bg-slate-700/30">
                        <td class="px-4 py-3">
                            <div class="font-medium text-white">
                                {user.username}
                            </div>
                        </td>
                        <td class="px-4 py-3 text-slate-400">{user.email}</td>
                        <td class="px-4 py-3">
                            <select
                                class="rounded-md border border-slate-600 bg-slate-700 px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={user.role}
                                onchange={(e) =>
                                    onrolechange(
                                        user.id,
                                        (e.target as HTMLSelectElement)
                                            .value as UserRole,
                                    )}
                            >
                                {#each roleOptions as role}
                                    <option value={role}>{role}</option>
                                {/each}
                            </select>
                        </td>
                        <td class="px-4 py-3">
                            {#if user.emailVerified}
                                <span
                                    class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400"
                                >
                                    <svg
                                        class="h-3 w-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                    Verified
                                </span>
                            {:else}
                                <span
                                    class="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400"
                                >
                                    <svg
                                        class="h-3 w-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                    Pending
                                </span>
                            {/if}
                        </td>
                        <td class="px-4 py-3 text-slate-400"
                            >{user.articles?.length ?? 0}</td
                        >
                        <td class="px-4 py-3 text-right">
                            <div class="flex items-center justify-end gap-1">
                                <!-- Reset Password -->
                                <button
                                    type="button"
                                    class="rounded-md p-1.5 text-slate-500 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                                    onclick={() =>
                                        onresetpassword(user.id, user.username)}
                                    aria-label={`Reset password for ${user.username}`}
                                    title="Reset password"
                                >
                                    <svg
                                        class="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        stroke-width="2"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                        />
                                    </svg>
                                </button>

                                <!-- Delete -->
                                {#if user.role !== "SUPERADMIN"}
                                    <button
                                        type="button"
                                        class="rounded-md p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                        onclick={() =>
                                            confirmDelete(
                                                user.id,
                                                user.username,
                                            )}
                                        aria-label={`Delete ${user.username}`}
                                    >
                                        <svg
                                            class="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            stroke-width="2"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.934-2.907l-1.67-.212a28.342 28.342 0 00-6.13 0l-1.67.212M11.475 2.605L10.69 5.745M13.31 5.745l-.776-3.14M14.25 5.745h-4.5m4.5 0l1.304 3.907m-1.304-3.907L10.69 2.605a1.124 1.124 0 00-1.107.752L8.25 5.745"
                                            />
                                        </svg>
                                    </button>
                                {/if}
                            </div>
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
