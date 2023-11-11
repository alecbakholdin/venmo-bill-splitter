<script lang="ts" context="module">
	import type { FriendSchema } from '$lib/firestore/schemas/Friend';
	import { json } from '@sveltejs/kit';
	import { get, writable } from 'svelte/store';
	import type { z } from 'zod';

	export type Friend = z.infer<typeof FriendSchema>;
	const friendCache = writable<Record<string, Friend>>({});

	async function getFriend(email: string | null | undefined) {
		if (!email) return undefined;

		email = email.trim().toLowerCase();
		const cached = get(friendCache)[email];
		if (cached) return cached;

		console.log(email);
		const resp = await fetch(`/api/friend/${email}`, { credentials: 'include' });
		if (resp.status !== 200) return undefined;

		const result = (await resp.json()) as Friend;
		addToCache(result);
		return result;
	}

	export async function searchFriends(query: string | null | undefined) {
		const q = query?.trim().toLowerCase() ?? '';
		const response = await fetch(`/api/search/friends?q=${q}`, { credentials: 'include' });
		if (response.status !== 200) return [];

		const { friends } = (await response.json()) as { friends: Friend[] };
		addToCache(...friends);
		return friends;
	}

	export async function createFried(friend: Omit<Friend, 'user'>) {
		const response = await fetch('/api/friend', { method: 'POST', body: JSON.stringify(friend) });
		if (response.status !== 200) return undefined;
		const createdFriend = (await response.json()) as Friend;
		addToCache(createdFriend);
		return createdFriend;
	}

	function addToCache(...friends: Friend[]) {
		friendCache.update((cache) => {
			for (const friend of friends) {
				cache[friend.email] = friend;
			}
			return cache;
		});
	}
</script>

<script lang="ts">
	import VenmoPersonRow from '../../../../routes/bill/[billId]/__route/VenmoPersonRow.svelte';
	import { Skeleton } from '../skeleton';
	import Icon from '@iconify/svelte';

	export let email: string | null | undefined = undefined;

	$: friendPromise = getFriend(email);
</script>

<div class="grid grid-cols-[auto_1fr] gap-x-3">
	{#await friendPromise}
		<Skeleton class="row-span-2 rounded-full aspect-square w-12" />
		<Skeleton class="rounded-full w-full mb-1" />
		<Skeleton class="rounded-full w-5/6 mt-1" />
	{:then friend}
		{#if false && friend?.venmo}
			<VenmoPersonRow venmo={friend!.venmo} />
		{:else if friend}
			<div
				class="row-span-2 rounded-full w-12 h-12 bg-muted grid place-items-center text-3xl place-self-center"
			>
				<Icon icon="mdi:person" />
			</div>
			<div class="row-span-2 flex h-full items-center">
				{friend.email}
			</div>
		{/if}
	{:catch friendError}
		{JSON.stringify(friendError)}
	{/await}
</div>
