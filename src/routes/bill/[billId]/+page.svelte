<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { BillSchema } from '$lib/firestore/schemas/Bill';
	import Icon from '@iconify/svelte';
	import BillCreateFriend from './__route/BillCreateFriend.svelte';
	import BillExtraActions from './__route/BillExtraActions.svelte';
	import BillFriendInviter from './__route/BillFriendInviter/BillFriendInviter.svelte';
	import BillTitle from './__route/BillTitle.svelte';
	import FriendList from './__route/FriendList/FriendList.svelte';
	import ItemList from './__route/ItemList/ItemList.svelte';
	import PercentAmountEditor from './__route/PercentAmountEditor.svelte';
	import ItemListExtraActions from './__route/ItemList/ItemListExtraActions.svelte';

	export let data;
</script>

<p class="w-full p-2 text-center font-bold">Your Bill</p>
<Form.Root
	form={data.editBillForm}
	schema={BillSchema}
	options={{
		dataType: 'json'
	}}
	action="?/editBill"
	let:formValues
	let:formStore
	let:tainted
>
	{@const taxOrTip = formValues.tax !== undefined || formValues.tip !== undefined}
	<Card.Root class="rounded-lg mx-2 sm:mx-0">
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<div class="flex-grow">
					<BillTitle />
					<p class="text-muted-foreground text-md font-thin">
						{new Date(data.bill.dateCreated).toLocaleDateString()}
					</p>
				</div>
				<BillExtraActions />
			</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if taxOrTip}
				<div class="flex w-full pr-8">
					<span class="flex-grow">Subtotal</span>
					<span class="font-bold">${formValues.subtotal.toFixed(2)}</span>
				</div>
				<PercentAmountEditor taxOrTip="tax" />
				<PercentAmountEditor taxOrTip="tip" />
			{/if}
			<div class="flex w-full" class:pr-8={taxOrTip}>
				<span class="flex-grow">Total</span>
				<span class="font-bold">${formValues.total.toFixed(2)}</span>
			</div>
		</Card.Content>
	</Card.Root>
	<Card.Root class="rounded-lg mx-2 sm:mx-0 mt-4">
		<Card.Header>
			<Card.Title class="flex items-center gap-2 h-6">
				<span class="flex-grow">Items</span>
				<ItemListExtraActions />
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<ItemList />
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
			<div class="absolute top-4 right-8 flex gap-1 items-center">
				<BillFriendInviter billId={data.billId} billSlug={data.bill.slug} />
			</div>
		</Card.Header>
		<Card.Content>
			<FriendList />
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

	{#if tainted}
		
	{/if}
</Form.Root>
