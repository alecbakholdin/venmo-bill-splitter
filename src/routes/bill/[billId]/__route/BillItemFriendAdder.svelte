<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import {
		Dialog,
		DialogClose,
		DialogContent,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { BillSchema, type BillItemSchema } from '$lib/firestore/schemas/Bill';
	import { cn } from '$lib/utils';
	import { getForm } from 'formsnap';
	import type { z } from 'zod';
	import VenmoPersonRow from './VenmoPersonRow.svelte';
	import { writable } from 'svelte/store';
	import Icon from '@iconify/svelte';

	export let item: z.infer<typeof BillItemSchema>;
	export let i: number;

	const formContext = getForm<z.ZodEffects<typeof BillSchema>>();
	$: ({ form } = formContext);
	$: itemFriends = item.friends.map((x) => x.venmo);
	$: availableFriends = $form.friends.filter((friend) => !itemFriends.includes(friend.venmo));
	const selected = writable<boolean[]>([]);
	$: {
		selected.set(availableFriends.map((_) => false));
	}
</script>

<Dialog>
	<DialogTrigger
        disabled={!availableFriends.length}
		class={cn(buttonVariants({ variant: 'ghost', class: 'w-fit' }))}
		on:click={() => selected.update(($s) => $s.map((_) => false))}
	>
		<Icon icon="mdi:people-add" class="text-2xl"/>
	</DialogTrigger>
	<DialogContent let:openStore>
		<DialogHeader>
			<DialogTitle>Add Friends to Item</DialogTitle>
		</DialogHeader>
		{#each availableFriends as friend, idx}
			{@const id = `item-friend-adder-${idx}`}
			<label for={id} class="flex items-center gap-2">
				<Checkbox {id} bind:checked={$selected[idx]} />
				<VenmoPersonRow venmo={friend.venmo} />
			</label>
		{/each}
		<DialogFooter class="gap-2">
			<DialogClose class={cn(buttonVariants({ variant: 'outline' }))}>Cancel</DialogClose>
			<DialogClose
				class={cn(buttonVariants())}
				on:click={() => {
					const addedFriends = availableFriends.filter((_, idx) => $selected[idx]);
					form.update(($form) => {
						$form.items[i].friends.push(
							...addedFriends.map((x) => ({ totalOwed: 0, splitValue: 1, venmo: x.venmo }))
						);
						return BillSchema.parse($form);
					});
				}}
			>
				Confirm
			</DialogClose>
		</DialogFooter>
	</DialogContent>
</Dialog>
