<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import Icon from '@iconify/svelte';
	import { getBillForm } from './utils';

	const formContext = getBillForm();
	$: ({ form } = formContext);
</script>

<DropdownMenu>
	<DropdownMenuTrigger asChild let:builder>
		<Button builders={[builder]} variant="ghost" size="icon" class="w-6 h-6">
			<Icon icon="pepicons-pencil:dots-y" class="text-2xl" />
		</Button>
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		{#if $form.tax === undefined}
			<DropdownMenuItem on:click={() => ($form.tax = 0)}>Add Tax</DropdownMenuItem>
		{:else}
			<DropdownMenuItem on:click={() => ($form.tax = undefined)}>Remove Tax</DropdownMenuItem>
		{/if}
		{#if $form.tip === undefined}
			<DropdownMenuItem on:click={() => ($form.tip = 0)}>Add Tip</DropdownMenuItem>
		{:else}
			<DropdownMenuItem on:click={() => ($form.tip = undefined)}>Remove Tip</DropdownMenuItem>
		{/if}
	</DropdownMenuContent>
</DropdownMenu>
