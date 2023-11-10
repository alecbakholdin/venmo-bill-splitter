<script lang="ts">
	import {
		Form,
		FormButton,
		FormField,
		FormInput,
		FormLabel,
		FormValidation
	} from '$lib/components/ui/form';
	import FormDescription from '$lib/components/ui/form/form-description.svelte';
	import { localStorageStore } from '$lib/localStorageStore';
	import { slide } from 'svelte/transition';
	import VenmoPersonRow from '../__route/VenmoPersonRow.svelte';
	import { InviteSchema } from './__route/inviteForm.js';

	export let data;

	const email = localStorageStore('inviteEmail', '');
	const venmo = localStorageStore('inviteVenmo', '');
	data.inviteForm.data.email = $email;
	data.inviteForm.data.venmo = $venmo;
</script>

<svelte:head>
	<meta property="og:title" content={data.bill.title} />
	<meta property="og:description" content="You've been invited to join {data.bill.title}" />
</svelte:head>

<div class="h-10" />
<span class="text-muted-foreground text-sm">You've been invited to</span>
<p class="text-xl font-bold">{data.bill.title}</p>
<Form
	form={data.inviteForm}
	options={{ dataType: 'json' }}
	schema={InviteSchema}
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

	<FormButton>Submit</FormButton>
</Form>
