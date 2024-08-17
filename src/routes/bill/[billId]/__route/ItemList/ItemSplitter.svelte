<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		Dialog,
		DialogClose,
		DialogContent,
		DialogFooter,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Friend } from '$lib/components/ui/friend';
	import { Label } from '$lib/components/ui/label';
	import { BillItemFriendSchema } from '$lib/firestore/schemas/Bill';
	import { cn, getDefaults } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import { slide } from 'svelte/transition';
	import { getBillForm, getBillFormConfig } from '../utils';
	import { itemIndex } from './ItemList.svelte';

	const config = getBillFormConfig();
	const formContext = getBillForm();
	console.log(formContext);
	$: ({ form } = formContext);
	$: item = $form.items[$itemIndex];
	$: availableFriends = $form.friends.filter(
		(fr) => !item.friends.find((iFr) => iFr.email === fr.email)
	);
	let selectedFriends: boolean[];
	function addFriends() {
		const emailsToAdd = availableFriends.filter((_, i) => selectedFriends[i]).map((fr) => fr.email);
		item.friends.push(
			...emailsToAdd.map((email) => ({ ...getDefaults(BillItemFriendSchema), email }))
		);
		item = item;
	}
</script>

<div class="mt-8" />

<div class="flex flex-col gap-2">
	{#each item.friends as friend, i (friend.email)}
		<div class="flex gap-2 items-center justify-between" transition:slide>
			<Friend email={friend.email} />
			<span>{friend.splitValue}</span>
			<Button
				type="button"
				variant="secondary"
				size="icon"
				class="w-6 h-6 flex-shrink-0"
				on:click={() => {
					item.friends.splice(i, 1);
					item = item;
				}}
			>
				<Icon icon="mdi:remove" />
			</Button>
		</div>
	{/each}
</div>
<Dialog>
	<DialogTrigger
		class={cn(buttonVariants({ variant: 'secondary', class: 'items-center gap-1 mt-3' }))}
		on:click={() => (selectedFriends = availableFriends.map(() => false))}
	>
		<Icon icon="mdi:people" />
		<span>Add People</span>
	</DialogTrigger>
	<DialogContent>
		{#each availableFriends as friend, i}
			<Label class="flex items-center gap-1">
				<Checkbox
					checked={selectedFriends[i]}
					on:click={() => (selectedFriends[i] = !selectedFriends[i])}
				/>
				<Friend email={friend.email} />
			</Label>
		{/each}
		<DialogFooter>
			<DialogClose class={cn(buttonVariants({ class: 'gap-1' }))} on:click={addFriends}>
				Add
			</DialogClose>
			<DialogClose class={cn(buttonVariants({ variant: 'outline' }))}>Cancel</DialogClose>
		</DialogFooter>
	</DialogContent>
</Dialog>
