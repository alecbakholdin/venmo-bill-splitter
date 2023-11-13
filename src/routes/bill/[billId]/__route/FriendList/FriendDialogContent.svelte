<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		DialogClose,
		DialogContent,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Friend } from '$lib/components/ui/friend';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { BillItemFriendSchema, BillSchema } from '$lib/firestore/schemas/Bill';
	import { cn, getDefaults } from '$lib/utils';
	import { getBillFormConfig } from '../utils';
	import { friendIndex } from './friendIndex';

	const config = getBillFormConfig();
	$: ({ form } = config.form);
	$: friend = $friendIndex >= 0 ? $form.friends[$friendIndex] : undefined;
</script>

{#if friend}
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Edit Person</DialogTitle>
		</DialogHeader>

		<Friend email={friend.email} />
		<div class="flex flex-col">
			{#each $form.items as item, i}
				{@const checkboxId = `${friend.email}-item-${i}`}
				{@const selected = !!item.friends.find((fr) => fr.email === friend?.email)}
				<Label for={checkboxId} class="grid grid-flow-col grid-cols-[auto_1fr_auto] gap-2">
					<Checkbox
						id={checkboxId}
						checked={selected}
						class="row-span-2 place-self-center"
						on:click={() => {
							if (selected) {
								item.friends = item.friends.filter((fr) => fr.email !== friend?.email);
							} else if (friend?.email) {
								item.friends = [
									...item.friends,
									{ ...getDefaults(BillItemFriendSchema), email: friend.email }
								];
							}
							$form = BillSchema.parse($form);
						}}
					/>
					<span>{item.title}</span>
					<span class="text-muted-foreground">{item.quantity} @ ${item.unitPrice.toFixed(2)}</span>
					<span class="font-bold row-span-full">${item.total.toFixed(2)}</span>
				</Label>
				<Separator class="last:hidden my-2" />
			{:else}
				<div class="text-muted-foreground">No items to assign</div>
			{/each}
		</div>
		{#if friend.subtotal !== friend.total}
			<div class="w-full flex justify-between">
				<span>Subtotal</span>
				<span class="font-bold">${friend.subtotal.toFixed(2)}</span>
			</div>
		{/if}
		<div class="w-full flex justify-between">
			<span>Total</span>
			<span class="font-bold">${friend.total.toFixed(2)}</span>
		</div>

		<DialogFooter class="gap-1">
			<DialogClose
				class={cn(buttonVariants({ variant: 'destructive' }))}
				on:click={() =>
					form.update(($form) => {
						$form.friends = $form.friends.filter((_, idx) => idx !== $friendIndex);
                        console.log(friend);
						for (const item of $form.items) {
							item.friends = item.friends.filter(({ email }) => email !== friend?.email);
						}
						return $form;
					})}
			>
				Delete
			</DialogClose>
			<DialogClose class={cn(buttonVariants({ variant: 'outline' }))}>Close</DialogClose>
		</DialogFooter>
	</DialogContent>
{/if}
