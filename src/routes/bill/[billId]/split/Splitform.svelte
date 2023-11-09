<script lang="ts">
	import {
		FormButton,
		FormCheckbox,
		FormField,
		FormInput,
		FormLabel,
		FormValidation
	} from '$lib/components/ui/form';
	import type { BillSchema } from '$lib/firestore/schemas/Bill';
	import { localStorageStore } from '$lib/localStorageStore';
	import { getForm } from 'formsnap';
	import type { z } from 'zod';
	import VenmoPersonRow, { formatVenmo } from '../__route/VenmoPersonRow.svelte';
	import { SplitBillSchema } from './__route/splitForm';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	export let bill: z.input<typeof BillSchema>;

	const formContext = getForm<z.ZodEffects<typeof SplitBillSchema>>();
	const config = { form: formContext, schema: SplitBillSchema };
	$: ({ form } = formContext);
	const venmo = localStorageStore('inviteVenmo', '');
	$: $form.venmo = $venmo;
	/* const email = localStorageStore('inviteEmail', '');
	$: $form.email = $email; */

	$: $form.items = bill.items.map(
		(x) => !!x.friends.find((fr) => fr.email === formatVenmo($venmo))
	);
	$: subtotal = bill.items
		.map((item) => item.total)
		.filter((_, i) => $form.items[i])
		.reduce((total, itemTotal) => total + itemTotal, 0);
	$: tax = (bill.tax ?? 0) * (subtotal / bill.subtotal);
	$: tip = (bill.tip ?? 0) * (subtotal / bill.subtotal);
	$: total = subtotal + tax + tip;
</script>

<div class="flex flex-col py-4 gap-2">
	<FormField {config} name="email">
		<FormLabel aria-required="true">Email</FormLabel>
		<FormInput
			type="email"
			placeholder="email@example.com"
			autocomplete="email"
			required
		/>
		<FormValidation />
	</FormField>
	<FormField {config} name="venmo">
		<FormLabel>Venmo (optional)</FormLabel>
		<FormInput
			leadIcon="mdi:at"
			class="pl-7"
			placeholder="Venmo"
			required={false}
			on:input={(e) => venmo.set(e.currentTarget.value)}
		/>
		<FormValidation />
	</FormField>
	<!-- <VenmoPersonRow venmo={$form.venmo} /> -->
	<div class="text-lg font-bold">Items</div>
	<p class="text-muted-foreground text-sm pb-2">
		Select the items that you are responsible for. If you split an item with another person, both of
		you will need to select the item on your own devices.
	</p>
	<div class="flex flex-col gap-2 pb-4">
		{#each $form.items as selected, i}
			{@const item = bill.items[i]}
			<FormField {config} name="items[{i}]">
				<div class="flex items-center gap-x-2 w-full">
					<FormCheckbox
						checked={selected}
						on:click={() =>
							form.update(($data) => {
								$data.items.splice(i, 1, !selected);
								return $data;
							})}
					/>
					<FormLabel class="w-full flex justify-between">
						<div class="flex flex-col gap-1">
							<p>{item.title}</p>
							<p class="text-muted-foreground">{item.quantity} @ ${item.unitPrice.toFixed(2)}</p>
						</div>
						<span class="font-bold">${item.total.toFixed(2)}</span>
					</FormLabel>
				</div>
			</FormField>
			<Separator class="last:hidden" />
		{/each}
	</div>

	<Card class="bg-transparent">
		<CardHeader>
			<CardTitle>Estimated Cost</CardTitle>
			<CardDescription>
				Note that this is not the final number and is subject to change. For example, it doesn't
				account for splitting an item between multiple people. No request will be made until all
				totals are finalized.
			</CardDescription>
		</CardHeader>
		<CardContent
			class="grid grid-cols-[1fr_auto] [&>span:nth-child(even)]:text-right [&>span:nth-child(even)]:font-bold"
		>
			<span>Subtotal</span>
			<span>${subtotal.toFixed(2)}</span>
			<span>Tax</span>
			<span>${tax.toFixed(2)}</span>
			<span>Tip</span>
			<span>${tip.toFixed(2)}</span>
			<span class="mt-2">Total</span>
			<span class="mt-2">${total.toFixed(2)}</span>
		</CardContent>
	</Card>

	<FormButton disabled={!$form.email}>Submit</FormButton>
</div>
