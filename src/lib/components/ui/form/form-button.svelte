<script lang="ts">
	import * as Button from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { getForm } from 'formsnap';
	type $$Props = Button.Props;
	type $$Events = Button.Events;

	let divEl: HTMLDivElement
	let width: string | undefined;
	let height: string | undefined;
	const { submitting } = getForm();
	submitting.subscribe($submitting => {
		width = $submitting ? divEl?.clientWidth + 'px' : undefined;
		height = $submitting ? divEl?.clientHeight + 'px' : undefined;
	})
</script>

<Button.Root type="submit" {...$$restProps} disabled={$submitting || $$restProps.disabled}  on:click on:keydown>
	<div bind:this={divEl} style:width style:height>
		{#if $submitting}
			<div class="w-full h-full grid place-items-center">
				<Icon icon="mingcute:loading-fill" class="animate-spin" />
			</div>
		{:else}
			<slot />
		{/if}
	</div>
</Button.Root>
