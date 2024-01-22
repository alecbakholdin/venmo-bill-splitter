<script lang="ts">
	
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { BillSchema } from '$lib/firestore/schemas/Bill';
	import { cn } from '$lib/utils.js';
	import { getForm } from 'formsnap';

	const form = getForm();
	$: ({form: formValues, errors} = form)
	const config = {form, schema: BillSchema};
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<div class="flex items-center gap-1">
			<p class="text-xl font-bold text-left">{$formValues.title}</p>
			<Form.Field {config} name="title">
				<Form.Validation />
			</Form.Field>
		</div>
	</Dialog.Trigger>
	<Dialog.Content let:openStore>
		<Dialog.Title>Edit Title</Dialog.Title>
		<Form.Field {config} name="title">
			<Form.Input on:enter={() => openStore.set(false)} />
			<Form.Validation />
		</Form.Field>
		<Dialog.Close disabled={Boolean($errors.title)} class={cn(buttonVariants())}>
			Submit
		</Dialog.Close>
	</Dialog.Content>
</Dialog.Root>
