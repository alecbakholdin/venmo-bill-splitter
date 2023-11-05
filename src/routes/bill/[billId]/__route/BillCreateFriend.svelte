<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogClose,
		DialogContent,
		DialogFooter,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { BillFriendSchema, BillSchema } from '$lib/firestore/schemas/Bill';
	import { cn, getDefaults } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import { getForm } from 'formsnap';
	import type { z } from 'zod';
	import VenmoPersonRow, { formatVenmo } from './VenmoPersonRow.svelte';

	const form = getForm<z.ZodEffects<typeof BillSchema>>();
	/* const config = { form, schema: BillSchema }; */

	let venmo: string = '';
	let valid = false;
</script>

<Dialog>
	<DialogTrigger class={cn(buttonVariants({ class: 'flex items-center gap-1 w-full' }))}>
		<Icon icon="mdi:person" />
		<span>New Person</span>
	</DialogTrigger>
	<DialogContent let:openStore>
		<DialogHeader><DialogTitle>Add Person</DialogTitle></DialogHeader>
		<div class="relative">
			<span class="absolute text-muted-foreground left-2 top-1/2 -translate-y-1/2">@</span>
			<Input
				class="pl-7"
				placeholder="Venmo"
				bind:value={venmo}
				on:enter={() => valid && openStore.set(false)}
			/>
		</div>
		<VenmoPersonRow {venmo} bind:valid />
		<DialogFooter>
			<DialogClose
				disabled={!valid}
				class={cn(buttonVariants({ class: 'w-full' }))}
				on:click={() => {
					form.form.update(($form) => {
						if (!$form.friends.find((x) => x.venmo === formatVenmo(venmo))) {
							console.log(getDefaults(BillFriendSchema))
							$form.friends.push({
								total: 0,
								venmo,
								items: [],
								subtotal: 0
							});
						}
						for (const item of $form.items) {
							if (item.addNewFriends) {
								item.friends.push({
									venmo,
									splitValue: 1,
									totalOwed: 0
								});
							}
						}
						return BillSchema.parse($form);
					});
				}}
			>
				Create
			</DialogClose>
		</DialogFooter>
	</DialogContent>
</Dialog>
