<script lang="ts">
	import { FormField, FormLabel, FormValidation } from '$lib/components/ui/form';
	import { getBillForm } from './utils';
	import { BillSchema } from '$lib/firestore/schemas/Bill';
	import {
		Dialog,
		DialogTrigger,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
		DialogClose
	} from '$lib/components/ui/dialog';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import FormInput from '$lib/components/ui/form/form-input.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';

	export let taxOrTip: 'tax' | 'tip';
	const formContext = getBillForm();
	$: ({ form } = formContext);
	$: config = { form: formContext, schema: BillSchema };
	$: title = taxOrTip.slice(0, 1).toUpperCase() + taxOrTip.slice(1);
    
    $: subtotal = $form.subtotal;
	$: amount = $form[taxOrTip];
	$: percent = Math.round(((amount && amount / subtotal) ?? 0) * 100000)/1000;
</script>

{#if amount !== undefined}
	<div class="w-full flex items-center gap-2 py-1">
		<span class="flex-grow">{title}</span>
		<span class="font-bold">${amount.toFixed(2)}</span>

		<Dialog>
			<DialogTrigger
				class={cn(buttonVariants({ size: 'icon', variant: 'secondary', class: 'w-6 h-6' }))}
			>
				<Icon icon="mdi:edit" />
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Edit {title}
					</DialogTitle>
					<DialogDescription>
						Change your {taxOrTip} by setting a percent (relative to subtotal) or by editing the raw
						amount. Close this dialog when done editing.
					</DialogDescription>
				</DialogHeader>
				<Label for="{taxOrTip}-percent">Percent</Label>
				<Input
					type="number"
					inputmode="numeric"
					step="0.01"
					id="{taxOrTip}-percent"
					leadIcon="material-symbols:percent"
					placeholder="Percent"
					value={percent}
                    on:input={e => {
                        const val = e.currentTarget.value;
                        const percentNum = parseFloat(val);
                        $form[taxOrTip] = subtotal * percentNum / 100;
                    }}
				/>
				<FormField {config} name={taxOrTip}>
					<FormLabel>Amount</FormLabel>
					<FormInput
						type="number"
						inputmode="numeric"
						step="0.01"
						leadIcon="mdi:dollar"
						placeholder="Amount"
					/>
					<FormValidation />
				</FormField>
				<DialogFooter>
					<DialogClose class={cn(buttonVariants({ variant: 'outline' }))}>Close</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	</div>
{/if}
