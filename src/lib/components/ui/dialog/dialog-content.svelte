<script lang="ts">
	import { cn, flyAndScale } from '$lib/utils';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { X } from 'lucide-svelte';
	import { createEventDispatcher, getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import * as Dialog from '.';

	type $$Props = DialogPrimitive.ContentProps;

	const dispatch = createEventDispatcher<{ close: void }>();

	let className: $$Props['class'] = undefined;
	export let transition: $$Props['transition'] = flyAndScale;
	export let transitionConfig: $$Props['transitionConfig'] = {
		duration: 200
	};
	export { className as class };

	const dialogContext: any = getContext('dialog');
	$: openStore = dialogContext?.states?.open as Writable<boolean>;
	$: openStore?.subscribe((open) => !open && dispatch('close'));
</script>

<Dialog.Portal>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		{transition}
		{transitionConfig}
		class={cn(
			'fixed left-[50%] top-[50%] z-50 grid w-full max-w-[95vw] sm:max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg rounded-lg md:w-full max-h-[90vh] overflow-y-auto',
			className
		)}
		{...$$restProps}
	>
		<slot {openStore} />
		<DialogPrimitive.Close
			class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
		>
			<X class="h-4 w-4" />
			<span class="sr-only">Close</span>
		</DialogPrimitive.Close>
	</DialogPrimitive.Content>
</Dialog.Portal>
