<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { getFriend } from '$lib/components/ui/friend/friend.svelte';
	import { Friend } from '$lib/components/ui/friend/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import type { BillFriendSchema } from '$lib/firestore/schemas/Bill.js';
	import { cn } from '$lib/utils.js';
	import { slide } from 'svelte/transition';
	import type { z } from 'zod';
	import type { SendInvoiceSchema } from '../../../api/friend/[email]/sendInvoice/schema.js';
	import type { VenmoRequestSchema } from '../../../api/venmo/request/schema.js';
	import { fetchVenmo } from '../__route/VenmoPersonRow.svelte';

	export let data;

	let selected: boolean[] = data.bill.friends.map(() => false);

	$: allSelected = selected.find((s) => s === false) === undefined;
	$: atLeastSomeSelected = Boolean(selected.find((s) => s));
	$: selectAllStatus = (allSelected ? true : atLeastSomeSelected ? 'indeterminate' : false) as
		| boolean
		| 'indeterminate';
	function setAll(val: boolean) {
		selected = selected.map((s) => val);
	}

	let sendItemizedInvoice = true;
	let requestDescription = data.bill.title;
	$: requestTotal = data.bill.friends
		.filter((_, i) => selected[i])
		.reduce((t, { total }) => t + total, 0);

	let loading: boolean[] = data.bill.friends.map(() => false);
	$: anyLoading = Boolean(loading.find((l) => l));
	async function sendRequests() {
		selected.forEach((x, i) => x && (loading[i] = true));
		try {
			const peopleToRequest = data.bill.friends.filter((_, i) => selected[i]);
			for (let i = 0; i < data.bill.friends.length; i++) {
				if (!selected[i]) continue;
				const friend = data.bill.friends[i];
				const friendObj = await getFriend(friend.email);
				if (friendObj?.venmo) {
					await sendRequest(friendObj.venmo, friend);
				}
				if (friendObj?.email && sendItemizedInvoice) {
					await sendInvoice(friend);
				}
			}
		} finally {
			loading = data.bill.friends.map(() => false);
		}
	}

	async function sendRequest(venmo: string, friend: z.infer<typeof BillFriendSchema>) {
		const description = requestDescription ?? data.bill.title;
		const venmoPerson = await fetchVenmo(venmo);
		if (!venmoPerson) {
			console.error('Could not fetch venmo person');
			return;
		}
		const payload: z.infer<typeof VenmoRequestSchema> = {
			amountInCents: Math.ceil(friend.total * 100),
			description,
			id: venmoPerson.id
		};
		await fetch('/api/venmo/request', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify(payload)
		});
	}

	async function sendInvoice(friend: z.infer<typeof BillFriendSchema>) {
		const payload: z.infer<typeof SendInvoiceSchema> = {
			billTitle: data.bill.title,
			items: data.bill.items.map((item) => ({
				title: item.title,
				amountOwed: (item.friends.find((fr) => fr.email === friend.email)?.totalOwed ?? 0).toFixed(
					2
				),
				itemTotal: item.total.toFixed(2)
			})),
			subtotal: friend.subtotal.toFixed(2),
			tipAndTax: (friend.total - friend.subtotal).toFixed(2),
			total: friend.total.toFixed(2)
		};
		await fetch(`/api/friend/${friend.email}/sendInvoice`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify(payload)
		});
	}
</script>

<div class="px-4 pt-12 flex flex-col gap-2">
	<Label class="flex items-center w-full gap-2 font-bold mb-3">
		<Checkbox checked={selectAllStatus} on:click={() => setAll(!allSelected)} />
		<span class="font-bold">Select All</span>
	</Label>
	{#each data.bill.friends as friend, i}
		<Label
			class={cn('flex items-center w-full gap-2', loading[i] && 'grayscale pointer-events-none')}
		>
			<Checkbox checked={selected[i]} on:click={() => (selected[i] = !selected[i])} />
			<div class="flex-grow">
				<Friend email={friend.email} />
			</div>
			<span class="text-lg font-bold">${friend.total.toFixed(2)}</span>
		</Label>
	{/each}
</div>

{#if selected.find((x) => x)}
	<div transition:slide={{ duration: 100 }} class="py-4 flex flex-col gap-3 px-4">
		<Label class="flex items-center gap-2">
			<Checkbox bind:checked={sendItemizedInvoice} disabled={anyLoading} />
			<span>Send Email with Itemized Invoice</span>
		</Label>
		<Label class="flex flex-col gap-1">
			<p>Request Description</p>
			<Textarea placeholder="Description" bind:value={requestDescription} disabled={anyLoading} />
			<p class="text-muted-foreground text-sm">
				The note in the Venmo request. It defaults to the title of the bill ("{data.bill.title}")
			</p>
		</Label>
		<Button type="button" on:click={sendRequests} disabled={anyLoading}>
			<span>Send Requests for Total ${requestTotal.toFixed(2)}</span>
		</Button>
	</div>
{/if}
