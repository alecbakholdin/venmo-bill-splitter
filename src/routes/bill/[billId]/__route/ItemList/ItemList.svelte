<script context="module" lang="ts">
	import { writable } from 'svelte/store';
	export const itemIndex = writable(-1);
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

	const config = getBillFormConfig();
	$: ({ form } = config.form);

	let open = false;
</script>

{#each $form.items as item, i}
	{@const missingFriends = !item.friends.length}
	{@const borderColor = missingFriends ? 'border-destructive' : 'border-transparent'}
	<div transition:slide>
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
<Dialog bind:open onOpenChange={(open) => !open && setTimeout(() => ($form = BillSchema.parse($form)), 300)}>
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
