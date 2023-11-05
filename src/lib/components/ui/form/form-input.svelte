<script lang="ts">
	import { Input, type InputEvents } from '$lib/components/ui/input';
	import { getForm, getFormField } from 'formsnap';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { numberProxy } from 'sveltekit-superforms/client';

	type $$Props = HTMLInputAttributes;
	type $$Events = InputEvents;

	export let type: $$Props['type'] = 'text';
	const { form } = getForm();
	const { attrStore, value, name } = getFormField();

	const numValue = numberProxy(form, name);
	$: isNumberInput = type === 'number' || type === 'range';
</script>

{#if isNumberInput}
	<Input
		{type}
		{...$attrStore}
		bind:value={$numValue}
		{...$$restProps}
		on:blur
		on:change
		on:click
		on:focus
		on:keydown
		on:keypress
		on:enter
		on:keyup
		on:mouseover
		on:mouseenter
		on:mouseleave
		on:paste
		on:input
	/>
{:else}
	<Input
		{type}
		{...$attrStore}
		bind:value={$value}
		{...$$restProps}
		on:blur
		on:change
		on:click
		on:focus
		on:keydown
		on:keypress
		on:enter
		on:keyup
		on:mouseover
		on:mouseenter
		on:mouseleave
		on:paste
		on:input
	/>
{/if}
