<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';
	import { BillItemSchema } from '$lib/firestore/schemas/Bill';
	import Icon from '@iconify/svelte';
	import _ from 'lodash';
	import { getBillFormConfig } from '../utils';
	import { selectedItems } from './ItemList.svelte';

    const config = getBillFormConfig();
	$: ({ form } = config.form);
    $: items = $form.items

    function handleMerge() {
        $selectedItems.sort();
        const [keepIdx, ...dropIdxs] = $selectedItems;
        const keepItem = items[keepIdx];
        const mergeItems = $selectedItems.map(i => items[i]);
        const sameUnitPrice = !mergeItems.find(item => Math.abs(item.unitPrice - keepItem.unitPrice) > 0.01)
        if(sameUnitPrice) {
            keepItem.quantity = _.sumBy(mergeItems, x => x.quantity);
        } else {
            keepItem.quantity = 1;
            keepItem.unitPrice = _.sumBy(mergeItems, x => x.total);
        }
        console.log(mergeItems, keepItem);
        items[keepIdx] = BillItemSchema.parse(keepItem);
        $form.items = items.filter((_, i) => !dropIdxs.includes(i));
        $selectedItems = [];
    }
</script>

{#if $selectedItems.length > 1}
	<Tooltip openDelay={0}>
		<TooltipTrigger asChild={true}>
			<Button type="button" variant="ghost" size="icon" class="h-6 w-6" on:click={handleMerge}>
				<Icon icon="mdi:merge" />
			</Button>
		</TooltipTrigger>
		<TooltipContent>Merge Items</TooltipContent>
	</Tooltip>
{/if}
