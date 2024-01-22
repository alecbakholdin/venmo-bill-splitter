<script context="module" lang="ts">
	import { writable } from 'svelte/store';
	export const itemIndex = writable(-1);

	export const selectedItems = writable<number[]>([]);
</script>

<script lang="ts">
	import {
		Dialog,
		DialogClose,
		DialogContent,
		DialogFooter,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { slide } from 'svelte/transition';
	import { getBillFormConfig } from '../utils';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import ItemDialog from './ItemDialog.svelte';
	import { cn } from '$lib/utils';
	import { BillSchema } from '$lib/firestore/schemas/Bill';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';

	const config = getBillFormConfig();
	$: ({ form } = config.form);

	let open = false;
</script>

{#each $form.items as item, i (`${item.title}`)}
	{@const missingFriends = !item.friends.length}
	{@const borderColor = missingFriends ? 'border-destructive' : 'border-transparent'}
	<div transition:slide class="flex items-center gap-2">
		<Checkbox
			checked={$selectedItems.includes(i)}
			on:click ={() =>
				selectedItems.update(($items) => {
					if ($items.includes(i)) {
						return $items.filter((x) => x !== i);
					} else {
						return [...$items, i];
					}
				})}
		/>
		<Button
			type="button"
			variant="ghost"
			class="w-full flex gap-2 px-2 justify-between border {borderColor}"
			on:click={() => {
				itemIndex.set(i);
				open = true;
			}}
		>
			<div class="text-start">
				<p class="font-bold">{item.title}</p>
				<p class="text-muted-foreground text-sm">
					{item.quantity} @ ${item.unitPrice.toFixed(2)}
				</p>
			</div>
			<span class="font-bold">${item.total.toFixed(2)}</span>
		</Button>
	</div>
{:else}
	<span class="text-muted-foreground">No items</span>
{/each}
<Dialog
	bind:open
	onOpenChange={(open) => !open && setTimeout(() => ($form = BillSchema.parse($form)), 300)}
>
	<DialogContent>
		<DialogTitle>Item Editor</DialogTitle>
		<ItemDialog
			on:enter={() => {
				open = false;
				itemIndex.set(-1);
			}}
		/>

		<DialogFooter>
			<DialogClose
				class={cn(buttonVariants({ variant: 'destructive' }))}
				on:click={() =>
					form.update(($form) => {
						$form.items.splice($itemIndex, 1);
						return BillSchema.parse(form);
					})}
			>
				Delete
			</DialogClose>
			<DialogClose class={cn(buttonVariants({ variant: 'outline' }))}>Close</DialogClose>
		</DialogFooter>
	</DialogContent>
</Dialog>
