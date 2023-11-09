<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogFooter,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Tabs } from '$lib/components/ui/tabs';
	import { BillFriendSchema, BillItemFriendSchema, BillSchema } from '$lib/firestore/schemas/Bill';
	import { cn, getDefaults } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import { getForm } from 'formsnap';
	import type { Writable } from 'svelte/store';
	import type { z } from 'zod';
	import VenmoPersonRow from './VenmoPersonRow.svelte';
	import { createFried as createFriend } from '$lib/components/ui/friend/friend.svelte';
	import { FriendSchema } from '$lib/firestore/schemas/Friend';

	const billForm = getForm<z.ZodEffects<typeof BillSchema>>();
	const config = { form: billForm, schema: BillSchema };

	let email: string = '';
	let venmo: string = '';
	let validVenmo = false;
	const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
	let loading = false;
	$: invalidForm = loading || !email.match(emailRegex) || !!(venmo && !validVenmo);

	async function handleAddPerson(openStore: Writable<boolean>) {
		if (invalidForm) return;
		loading = true;
		try {
			const friend = await createFriend({ ...getDefaults(FriendSchema), email, venmo });
			if (friend) {
				const { email } = friend;
				billForm.form.update(($form) => {
					if($form.friends.find(fr => fr.email === email)) return $form;
					$form.friends.push({ ...getDefaults(BillFriendSchema), email });
					$form.items.forEach(
						(item) =>
							item.addNewFriends &&
							item.friends.push({ ...getDefaults(BillItemFriendSchema), email })
					);
					return $form;
				});
			}
		} finally {
			loading = false;
		}
	}
</script>

<Dialog>
	<DialogTrigger class={cn(buttonVariants({ class: 'flex items-center gap-1 w-full' }))}>
		<Icon icon="mdi:person" />
		<span>New Person</span>
	</DialogTrigger>
	<DialogContent let:openStore>
		<DialogHeader><DialogTitle>Add Person</DialogTitle></DialogHeader>

		<Tabs />
		<Label for="createFfEmail">Email</Label>
		<Input id="createFriendEmail" type="email" placeholder="email@example.com" bind:value={email} />

		<Label for="createFriendVenmo">Venmo (optional)</Label>
		<Input id="createFriendVenmo" leadIcon="mdi:at" bind:value={venmo} />
		{#if venmo}
			<VenmoPersonRow {venmo} bind:valid={validVenmo} />
		{/if}

		<DialogFooter>
			<Button {loading} on:click={() => handleAddPerson(openStore)} disabled={invalidForm}>
				<Icon icon="mdi:add" />
				<span>Add</span>
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
