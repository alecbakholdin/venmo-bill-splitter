<script lang="ts">
	import {
		Form,
		FormButton,
		FormField,
		FormInput,
		FormLabel,
		FormValidation
	} from '$lib/components/ui/form';
	import { localStorageStore } from '$lib/localStorageStore';
	import VenmoPersonRow from '../__route/VenmoPersonRow.svelte';
	import { InviteSchema } from './__route/inviteForm.js';

	export let data;

	const venmo = localStorageStore('inviteVenmo', '');
	data.inviteForm.data.venmo = $venmo;
	let valid = false;
</script>

<svelte:head>
	<meta property="og:title" content={data.bill.title} />
	<meta property="og:description" content="You've been invited to join {data.bill.title}" />
</svelte:head>

<div class="h-10" />
<span class="text-muted-foreground text-sm">You've been invited to</span>
<p class="text-xl font-bold">{data.bill.title}</p>
<Form form={data.inviteForm} schema={InviteSchema} let:config let:formValues>
	<div class="flex flex-col py-4 gap-2">
		<FormField {config} name="venmo">
			<FormLabel>Venmo</FormLabel>
			<div class="relative">
				<span class="absolute text-muted-foreground left-2 top-1/2 -translate-y-1/2">@</span>
				<FormInput
					class="pl-7"
					placeholder="Venmo"
					on:change={(e) => venmo.set(e.currentTarget.value)}
				/>
			</div>
			<FormValidation />
		</FormField>
		<VenmoPersonRow venmo={formValues.venmo} bind:valid />
		<FormButton disabled={!valid}>Submit</FormButton>
	</div>
</Form>
