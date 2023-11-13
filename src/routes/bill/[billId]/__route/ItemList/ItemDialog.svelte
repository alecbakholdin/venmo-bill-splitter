<script lang="ts">
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Tabs, TabsList } from '$lib/components/ui/tabs';
	import TabsContent from '$lib/components/ui/tabs/tabs-content.svelte';
	import TabsTrigger from '$lib/components/ui/tabs/tabs-trigger.svelte';
	import Icon from '@iconify/svelte';
	import { getBillForm } from '../utils';
	import ItemEditor from './ItemEditor.svelte';

	import { itemIndex } from './ItemList.svelte';
	import ItemSplitter from './ItemSplitter.svelte';

	const formContext = getBillForm();
	$: ({ form } = formContext);
	$: item = $form.items[$itemIndex];
</script>

{#if $itemIndex >= 0}
	{#if !item.friends.length}
		<Alert variant="destructive">
			<Icon icon="mdi:alert" />
			<AlertDescription>Nobody is assigned to this item</AlertDescription>
		</Alert>
	{/if}
	<Tabs value="editor">
		<TabsList>
			<TabsTrigger value="editor">Editor</TabsTrigger>
			<TabsTrigger value="splitter">Splitter</TabsTrigger>
		</TabsList>
		<TabsContent value="editor">
			<ItemEditor on:enter />
		</TabsContent>
		<TabsContent value="splitter">
			<ItemSplitter />
		</TabsContent>
	</Tabs>
{/if}
