<script lang="ts">
	import {
		Form
	} from '$lib/components/ui/form';
	import Splitform from './Splitform.svelte';
	import { SplitBillSchema } from './__route/splitForm.js';

	export let data;
</script>


<svelte:head>
	<meta property="og:title" content={data.bill.title}>
	<meta property="og:description" content="You've been invited to join {data.bill.title}">
</svelte:head>

<div class="h-10" />
<span class="text-muted-foreground text-sm">You've been invited to</span>
<p class="text-xl font-bold">{data.bill.title}</p>
<Form
	form={data.splitForm}
	options={{ dataType: 'json', onUpdate: console.log }}
	schema={SplitBillSchema}
>
    <Splitform bill={data.bill} />
</Form>
