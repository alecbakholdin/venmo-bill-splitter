<script lang="ts">
	import type { HTMLSpanAttributes } from 'bits-ui/dist/internal';
	import { getForm } from 'formsnap';

	type $$Props = HTMLSpanAttributes;

	const { message } = getForm();
</script>

<span {...$$restProps}>
	{#if $message && typeof $message === 'object'}
		{#if $message.message}
			{$message.message ?? ''}
		{:else}
			{JSON.stringify($message)}
		{/if}
	{:else}
		{$message ?? ''}
	{/if}
</span>
