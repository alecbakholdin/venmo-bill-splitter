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

	export let bill: z.input<typeof BillSchema>;

	const venmo = localStorageStore('inviteVenmo', '');
	let validVenmo = false;
	const formContext = getForm<z.ZodEffects<typeof SplitBillSchema>>();
	$: ({ form } = formContext);
	const config = { form: formContext, schema: SplitBillSchema };
	$: $form.venmo = $venmo;
	$: $form.items = bill.items.map(
		(x) => !!x.friends.find((fr) => fr.venmo === formatVenmo($venmo))
	);
</script>

<div class="flex flex-col py-4 gap-2">
	<FormField {config} name="venmo">
		<FormLabel>Venmo</FormLabel>
		<div class="relative">
			<span class="absolute text-muted-foreground left-2 top-1/2 -translate-y-1/2">@</span>
			<FormInput
				class="pl-7"
				placeholder="Venmo"
				on:input={(e) => venmo.set(e.currentTarget.value)}
			/>
		</div>
		<FormValidation />
	</FormField>
	<VenmoPersonRow venmo={$form.venmo} bind:valid={validVenmo} />
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

	<FormButton disabled={!validVenmo}>Submit</FormButton>
</div>
