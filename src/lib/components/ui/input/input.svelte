<script lang="ts">
	import { cn } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import type { FormInputEvent } from 'formsnap/dist/internal';
	import { createEventDispatcher } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { InputEvents } from '.';

	type $$Props = HTMLInputAttributes & { leadIcon?: string };
	type $$Events = InputEvents;

	let className: $$Props['class'] = undefined;
	export let value: $$Props['value'] = undefined;
	export let leadIcon: $$Props['leadIcon'] = undefined;
	export { className as class };

	const dispatch = createEventDispatcher<{ enter: void; keypress: FormInputEvent }>();
	function handleKeyPress(e: FormInputEvent) {
		(e as any).key === 'Enter' && dispatch('enter');
		dispatch('keypress', e);
	}
</script>

<div class="relative">
	{#if leadIcon}
		<span class="absolute text-muted-foreground text-md left-2 top-1/2 -translate-y-1/2">
			<Icon icon={leadIcon} />
		</span>
	{/if}
	<input
		class={cn(
			'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0  file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
			className,
			leadIcon ? 'pl-7' : ''
		)}
		bind:value
		on:blur
		on:change
		on:click
		on:focus
		on:keydown
		on:keypress={handleKeyPress}
		on:keyup
		on:mouseover
		on:mouseenter
		on:mouseleave
		on:paste
		on:input
		{...$$restProps}
	/>
</div>
