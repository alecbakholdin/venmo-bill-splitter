<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { FormField, FormInput, FormLabel, FormValidation } from '$lib/components/ui/form';
	import FormSwitch from '$lib/components/ui/form/form-switch.svelte';
	import { Tabs, TabsContent } from '$lib/components/ui/tabs';
	import TabsList from '$lib/components/ui/tabs/tabs-list.svelte';
	import TabsTrigger from '$lib/components/ui/tabs/tabs-trigger.svelte';
	import { BillItemSchema, BillSchema } from '$lib/firestore/schemas/Bill';
	import { cn } from '$lib/utils.js';
	import Icon from '@iconify/svelte';
	import { getForm } from 'formsnap';
	import type { z } from 'zod';
	import BillItemFriendAdder from './BillItemFriendAdder.svelte';
	import VenmoPersonRow from './VenmoPersonRow.svelte';
	import { slide } from 'svelte/transition';

	type T = z.input<typeof BillItemSchema>;
	export let i: number;
	export let item: T;

	const formContext = getForm<z.ZodEffects<typeof BillSchema>>();
	const config = { schema: BillSchema, form: formContext };
	$: ({ allErrors, form } = formContext);
	$: total = item.quantity * item.unitPrice;
	$: itemValid = !$allErrors.filter((err) => err.path.startsWith(`items[${i}]`)).length;
</script>

<Dialog.Root closeOnOutsideClick={false}>
	<Dialog.Trigger class={cn(buttonVariants({ variant: 'ghost', class: 'w-full' }))}>
		<div class="grid grid-cols-[1fr_auto] w-full">
			<span class="font-bold text-start">{item.title}</span>
			<span class="row-span-2 place-self-center font-bold text-md">
				${total.toFixed(2)}
			</span>
			<span class="text-sm text-muted-foreground text-start">
				{item.quantity} @ ${item.unitPrice?.toFixed?.(2)}
			</span>
		</div>
	</Dialog.Trigger>
	<Dialog.Content let:openStore on:load={console.error}>
		{@const onEnter = () => itemValid && openStore.set(false)}
		<Dialog.Header><Dialog.Title>Edit Item</Dialog.Title></Dialog.Header>
		<Tabs value="item">
			<TabsList class="w-full [&>*]:flex-grow">
				<TabsTrigger value="item">Item</TabsTrigger>
				<TabsTrigger value="splitting">Splitting</TabsTrigger>
			</TabsList>
			<TabsContent value="item">
				<div class="flex flex-col gap-2">
					<FormField {config} name="items[{i}].title">
						<FormLabel>Title</FormLabel>
						<FormInput placeholder="Title" on:enter={onEnter} />
						<FormValidation />
					</FormField>
					<FormField {config} name="items[{i}].quantity">
						<FormLabel>Quantity</FormLabel>
						<FormInput
							type="number"
							inputmode="numeric"
							placeholder="Quantity"
							on:enter={onEnter}
						/>
						<FormValidation />
					</FormField>
					<FormField {config} name="items[{i}].unitPrice">
						<FormLabel>Unit Price</FormLabel>
						<FormInput
							type="number"
							inputmode="numeric"
							step="0.01"
							placeholder="Unit Price"
							on:enter={onEnter}
						/>
						<FormValidation />
					</FormField>
				</div>
			</TabsContent>
			<TabsContent value="splitting">
				<div class="flex flex-col gap-8">
					<div class="flex justify-between">
						<FormField {config} name="items[{i}].addNewFriends">
							<div class="flex items-center gap-2">
								<FormSwitch />
								<FormLabel>Include Friends Added Later</FormLabel>
							</div>
						</FormField>
						<BillItemFriendAdder {item} {i} />
					</div>
					<div class="flex flex-col gap-4">
						{#each item.friends as friend, friendI (friend.venmo)}
							<div>
								<FormField {config} name="items[{i}].friends[{friendI}].splitValue">
									<div class="flex items-center gap-1" transition:slide>
										<div class="flex-grow">
											<VenmoPersonRow venmo={friend.venmo} />
										</div>
										<FormInput
											type="number"
											inputmode="numeric"
											step="0.01"
											placeholder="Shares"
											class="p-0 text-center w-12 sm:w-20"
										/>
										<div>
											<Button
												type="button"
												size="icon"
												class="w-4 apect-square"
												on:click={() => {
													form.update(($form) => {
														$form.items[i].friends.splice(friendI, 1);
														return BillSchema.parse($form);
													});
												}}
											>
												<Icon icon="mdi:remove" />
											</Button>
										</div>
									</div>
									<FormValidation />
								</FormField>
							</div>
						{:else}
							<span class="text-muted-foreground" in:slide>No friends added to this item yet</span>
						{/each}
					</div>
				</div>
			</TabsContent>
		</Tabs>
		<Dialog.Footer class="gap-2">
			<Dialog.Close
				class={cn(buttonVariants({ variant: 'outline' }))}
				on:click={() =>
					setTimeout(
						() =>
							form.update(($form) => {
								$form.items = $form.items.filter((_, index) => i !== index);
								return $form;
							}),
						300
					)}
			>
				Delete
			</Dialog.Close>
			<Dialog.Close disabled={!itemValid} class={cn(buttonVariants())}>Submit</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
