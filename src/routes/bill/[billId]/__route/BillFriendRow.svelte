<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogClose,
		DialogContent,
		DialogHeader,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import { FormField } from '$lib/components/ui/form';
	import FormValidation from '$lib/components/ui/form/form-validation.svelte';
	import { Friend } from '$lib/components/ui/friend';
	import { BillSchema, type BillFriendSchema } from '$lib/firestore/schemas/Bill';
	import { cn } from '$lib/utils';
	import { getForm } from 'formsnap';
	import type { z } from 'zod';

	export let friend: z.infer<typeof BillFriendSchema>;
	export let i: number;

	const formContext = getForm<z.ZodEffects<typeof BillSchema>>();
	$: ({ form } = formContext);
	const config = { form: formContext, schema: BillSchema };
</script>

<Dialog>
	<DialogTrigger class={cn(buttonVariants({ variant: 'ghost', class: 'w-full' }))}>
		<div class="grid grid-cols-[1fr_auto] max-w-full w-full">
			<Friend email={friend.email} />
			<span class="font-bold place-self-center">
				${friend.total.toFixed(2)}
			</span>
			<FormField {config} name="friends[{i}].email">
				<FormValidation />
			</FormField>
		</div>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Edit Person</DialogTitle>
		</DialogHeader>

		<Friend email={friend.email} />
		<div class="flex flex-col">
			{#each friend.items ?? [] as item}
				<div class="w-full flex justify-between">
					<span>{item.title}</span>
					<span class="font-bold">${item.totalOwed.toFixed(2)}</span>
				</div>
			{:else}
				<div class="text-muted-foreground">Friend is not assigned to any items</div>
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
					setTimeout(
						() =>
							form.update(($form) => {
								$form.friends = $form.friends.filter((_, idx) => idx !== i);
								for (const item of $form.items) {
									item.friends = item.friends.filter(({ email }) => email !== friend.email);
								}
								return $form;
							}),
						300
					)}
			>
				Delete
			</DialogClose>
			<DialogClose class={cn(buttonVariants({ variant: 'outline' }))}>Close</DialogClose>
		</DialogFooter>
	</DialogContent>
</Dialog>
