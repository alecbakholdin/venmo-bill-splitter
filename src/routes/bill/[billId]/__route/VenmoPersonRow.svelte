<script context="module" lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { VenmoPersonSchema } from '$lib/firestore/schemas/Venmo';
	import Icon from '@iconify/svelte';
	import { get, writable } from 'svelte/store';
	import type { z } from 'zod';
	import { debounce } from 'svelte-reactive-debounce';

	const venmoCache = writable<Record<string, z.infer<typeof VenmoPersonSchema>>>({});
	const venmoErrorCache = writable<string[]>([]);

	export function formatVenmo(venmo: string | null | undefined) {
		return venmo?.toLowerCase().replaceAll(/[^a-z0-9-_]/g, '') ?? '';
	}

	async function fetchVenmo(venmo: string | null | undefined) {
		if (typeof window === 'undefined') return undefined;
		const iVenmo = formatVenmo(venmo);

		// check cache
		if (iVenmo.length < 5 || get(venmoErrorCache).includes(iVenmo)) return undefined;
		const cachedVenmo = get(venmoCache)[iVenmo];
		if (cachedVenmo) return cachedVenmo;

		// fetch if not present
		const response = await fetch(`/api/venmo/u/${iVenmo.trim()}`);
		if (response.status !== 200) {
			venmoErrorCache.update(($cache) => [...$cache, iVenmo]);
			return undefined;
		}
		const result = await response.json();
		venmoCache.update(($cache) => ({ ...$cache, [iVenmo]: result }));
		return result;
	}
</script>

<script lang="ts">
	export let venmo: string | null | undefined;
	export let valid: boolean = false;
	export let venmoPerson: z.infer<typeof VenmoPersonSchema> | undefined = undefined;

	async function update(venmo: string | null | undefined) {
		valid = false;
		venmoPerson = undefined;

		const result = await fetchVenmo(venmo);

		valid = Boolean(result);
		venmoPerson = result;

		return result;
	}

	// debounced update venmo
	const venmoStore = writable<string | null | undefined>(venmo);
	$: {
		venmoStore.set(venmo);
		valid = false;
		venmoPerson = undefined;
	}
	const debouncedVenmo = debounce(venmoStore, 200);
	$: venmoPersonPromise = update($debouncedVenmo);
</script>

<div class="grid grid-cols-[auto_1fr] gap-x-3">
	{#await venmoPersonPromise}
		<Skeleton class="row-span-2 rounded-full aspect-square w-12" />
		<Skeleton class="rounded-full w-full mb-1" />
		<Skeleton class="rounded-full w-5/6 mt-1" />
	{:then data}
		{#if data?.avatar}
			<img
				src={data.avatar}
				alt={data.displayName}
				class="row-span-2 rounded-full aspect-square w-12"
			/>
		{:else}
			<div
				class="row-span-2 rounded-full w-12 h-12 bg-muted grid place-items-center text-3xl place-self-center"
			>
				<Icon icon="mdi:person" />
			</div>
		{/if}

		<span class="text-start font-bold text-ellipsis whitespace-nowrap">
			{data?.displayName ?? '--'}
		</span>
		<span class="text-start text-muted-foreground text-ellipsis whitespace-nowrap">
			{data?.venmo ? `@${data.venmo}` : '--'}
		</span>
	{/await}
</div>
