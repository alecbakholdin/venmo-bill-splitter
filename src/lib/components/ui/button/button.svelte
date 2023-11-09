<script lang="ts">
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import { buttonVariants, type Props, type Events } from '.';
	import Icon from '@iconify/svelte';
	import type { SvelteComponent } from 'svelte';

	type $$Props = Props & { loading?: boolean };
	type $$Events = Events;

	let className: $$Props['class'] = undefined;
	export let variant: $$Props['variant'] = 'default';
	export let size: $$Props['size'] = 'default';
	export let builders: $$Props['builders'] = [];
	export let loading = false;
	export { className as class };

	let buttonEl: SvelteComponent;
	let divEl: HTMLDivElement;
	let width: string | undefined;
	let height: string | undefined;
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(buttonVariants({ variant, size, className }))}
	{...$$restProps}
	on:click
	on:keydown
>
	{#if loading}
		<div class="w-full h-full grid place-items-center">
			<Icon icon="mingcute:loading-fill" class="animate-spin" />
		</div>
	{:else}
		<slot />
	{/if}
</ButtonPrimitive.Root>
