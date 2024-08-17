<script lang="ts">
	import {
		Form,
		FormButton,
		FormCheckbox,
		FormField,
		FormInput,
		FormLabel,
		FormValidation
	} from '$lib/components/ui/form';
	import FormDescription from '$lib/components/ui/form/form-description.svelte';
	import { Switch } from '$lib/components/ui/switch';
	import { Separator } from '$lib/components/ui/separator';
	import { localStorageStore } from '$lib/localStorageStore';
	import { slide } from 'svelte/transition';
	import VenmoPersonRow from '../__route/VenmoPersonRow.svelte';
	import { SplitBillSchema } from './__route/splitForm.js';
	import type { Writable } from 'svelte/store';

	export let data;
	function getSelected(email: string) {
		return data.bill.items.map(
			(item) => item.friends.find((fr) => fr.email === email.toLowerCase())?.splitValue ?? 0
		);
	}

	const email = localStorageStore('inviteEmail', '');
	const venmo = localStorageStore('inviteVenmo', '');
	data.splitForm.data.email = $email;
	data.splitForm.data.items = getSelected($email);
	data.splitForm.data.venmo = $venmo;

	const splitByItemFraction: Writable<boolean> = localStorageStore(
		'_splitByItemFraction_key',
		false
	);
</script>

<svelte:head>
	<meta property="og:title" content={data.bill.title} />
	<meta property="og:description" content="You've been invited to join {data.bill.title}" />
</svelte:head>

<div class="h-10" />
<span class="text-muted-foreground text-sm">You've been invited to</span>
<p class="text-xl font-bold">{data.bill.title}</p>
<Form
	form={data.splitForm}
	options={{ dataType: 'json' }}
	schema={SplitBillSchema}
	let:config
	let:form
	let:formValues
	class="flex flex-col gap-2 pt-6"
>
	<div class="text-lg font-bold">Personal Info</div>
	<FormField {config} name="email">
		<FormLabel>Email</FormLabel>
		<FormInput
			type="email"
			placeholder="email@example.com"
			on:input={(e) => {
				email.set(e.currentTarget.value);
				form.form.update(($form) => ({
					...$form,
					items: getSelected(e.currentTarget.value)
				}));
			}}
		/>
		<FormDescription>Required</FormDescription>
		<FormValidation />
	</FormField>
	<FormField {config} name="venmo">
		<FormLabel>Venmo (optional)</FormLabel>
		<FormInput
			leadIcon="mdi:at"
			placeholder="your-venmo"
			on:input={(e) => venmo.set(e.currentTarget.value)}
		/>
		<FormDescription>If possible, please include your Venmo.</FormDescription>
		<FormValidation />
		{#if formValues.venmo}
			<div class="border border-muted/20 rounded-md p-2" transition:slide>
				<VenmoPersonRow venmo={formValues.venmo} />
			</div>
		{/if}
	</FormField>

	<div class="flex flex-col gap-1 pt-6">
		<div class="text-lg font-bold">Items</div>
		<p class="text-muted-foreground text-sm pb-2">
			Select the items that you are responsible for. If you split an item with another person, both
			of you will need to select the item on your own devices.
		</p>
		<div class="flex w-full justify-end gap-2 pb-2">
			<span>Choose custom amount</span>
			<Switch bind:checked={$splitByItemFraction} />
		</div>
		{#each data.bill.items as item, i}
			{@const shares = formValues.items[i]}
			<FormField {config} name="items[{i}]">
				<div class="flex items-center gap-x-2 w-full">
					{#if $splitByItemFraction}
						<FormInput
							type="number"
							value="shares"
							on:change={(x) =>
								form.form.update(($data) => {
									const newCount = x.currentTarget.valueAsNumber;
									$data.items.splice(i, 1, newCount);
									return $data;
								})}
						/>
					{:else}
						<FormCheckbox
							checked={shares === 1 || (shares > 0 && 'indeterminate')}
							on:click={() =>
								setTimeout(() =>
									form.form.update(($data) => {
										const newCount = shares > 0 ? 0 : 1;
										$data.items.splice(i, 1, newCount);
										return $data;
									})
								)}
						/>
					{/if}
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

	<FormButton>Submit</FormButton>
</Form>
