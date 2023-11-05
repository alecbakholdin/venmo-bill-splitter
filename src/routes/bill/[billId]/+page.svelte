<script lang="ts">
	import BillTitle from './__route/BillTitle.svelte';
	import BillItemRow from './__route/BillItemRow.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Icon from '@iconify/svelte';
	import { slide } from 'svelte/transition';
	import { BillSchema } from '$lib/firestore/schemas/Bill';
	import BillFriendRow from './__route/BillFriendRow.svelte';
	import BillCreateFriend from './__route/BillCreateFriend.svelte';
	import BillFriendInviter from './__route/BillFriendInviter.svelte';

	export let data;
</script>

<p class="w-full p-2 text-center font-bold">Your Bill</p>
<Form.Root
	form={data.editBillForm}
	schema={BillSchema}
	options={{
		dataType: 'json',
		onUpdate(update) {
			update.form.data = BillSchema.parse(update.form.data);
		}
	}}
	action="?/editBill"
	let:config
	let:formValues
	let:formStore
	let:tainted
>
	<Card.Root class="rounded-lg mx-2 sm:mx-0">
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<div class="flex-grow">
					<BillTitle />
					<p class="text-muted-foreground text-md font-thin">{data.bill.dateCreated}</p>
				</div>
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex w-full">
				<span class="flex-grow">Subtotal</span>
				<span>${formValues.subtotal.toFixed(2)}</span>
			</div>
			{#if formValues.tax !== undefined}
				<Form.Field {config} name="tax">
					<Form.Label>Tax</Form.Label>
					<Form.Input type="number" inputmode="numeric" placeholder="Tax" step="0.01" />
					<Form.Validation />
				</Form.Field>
			{/if}
			{#if formValues.tip !== undefined}
				<Form.Field {config} name="tip">
					<Form.Label>Tip</Form.Label>
					<Form.Input type="number" inputmode="numeric" placeholder="Tip" step="0.01" />
					<Form.Validation />
				</Form.Field>
			{/if}
			<div class="flex w-full">
				<span class="flex-grow">Total</span>
				<span>${formValues.total.toFixed(2)}</span>
			</div>
		</Card.Content>
	</Card.Root>
	<Card.Root class="rounded-lg mx-2 sm:mx-0 mt-4">
		<Card.Header>
			<Card.Title class="flex items-center gap-2">Items</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-1">
				{#each formValues.items as item, i ((item.title, i))}
					<div class="w-full" transition:slide>
						<BillItemRow {item} {i} />
					</div>
					<!-- <Separator class="last:hidden" /> -->
				{:else}
					<span class="text-muted-foreground text-md pt-3">No Items</span>
				{/each}
			</div>
		</Card.Content>
		<Card.Footer>
			<Button
				type="button"
				class="flex gap-1 w-full"
				on:click={async () =>
					formStore.update(($form) => {
						$form.items.push({
							title: 'New Item',
							quantity: 1,
							unitPrice: 0,
							splitType: 'shares',
							friends: [],
							total: 0
						});
						return $form;
					})}
			>
				<Icon icon="mdi:add" />
				<span>New Item</span>
			</Button>
		</Card.Footer>
	</Card.Root>

	<Card.Root class="rounded-lg mx-2 sm:mx-0 mt-4">
		<Card.Header class="relative">
			<Card.Title>People</Card.Title>
			<div class="absolute top-4 right-8">
				<BillFriendInviter billInviteUrl={data.billInviteUrl} billSplitUrl={data.billSplitUrl} />
			</div>
		</Card.Header>
		<Card.Content>
			{#each formValues.friends as friend, i (friend.venmo)}
				<div class="w-full" transition:slide>
					<BillFriendRow {friend} {i} />
				</div>
			{:else}
				<span class="text-muted-foreground">There are no people</span>
			{/each}
		</Card.Content>
		<Card.Footer>
			<BillCreateFriend />
		</Card.Footer>
	</Card.Root>

	<Card.Root class="rounded-lg mx-2 sm:mx-0 my-4">
		<Card.Content class="p-4">
			<Form.Button disabled={!tainted} class="w-full">
				<div class="flex items-center gap-1">
					<Icon icon="mdi:check" />
					<span>Submit Changes</span>
				</div>
			</Form.Button>
		</Card.Content>
	</Card.Root>
</Form.Root>
