<script lang="ts">
	import { FormField, FormInput, FormLabel, FormValidation } from '$lib/components/ui/form';
	import { getBillFormConfig } from '../utils';
	import { itemIndex } from './ItemList.svelte';

	const config = getBillFormConfig();
    $: i = $itemIndex
</script>

<div class="flex flex-col">
	<div>
        <FormField {config} name="items[{i}].title">
            <FormLabel>Title</FormLabel>
            <FormInput on:enter />
            <FormValidation />
        </FormField>
    </div>

	<div class="flex flex-col sm:flex-row sm:gap-2 [&>*]:flex-grow">
		<div>
			<FormField {config} name="items[{i}].quantity">
				<FormLabel>Quantity</FormLabel>
				<FormInput
					type="number"
					inputmode="numeric"
					step="1"
					leadIcon="material-symbols:numbers"
					placeholder="Quantity"
					on:enter
				/>
				<FormValidation />
			</FormField>
		</div>
		<div>
			<FormField {config} name="items[{i}].unitPrice">
				<FormLabel>Unit Price</FormLabel>
				<FormInput
					type="number"
					inputmode="numeric"
					step="0.01"
					leadIcon="mdi:dollar"
					placeholder="Unit Price"
					on:enter
				/>
				<FormValidation />
			</FormField>
		</div>
	</div>
</div>
