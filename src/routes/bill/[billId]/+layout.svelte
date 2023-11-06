<script>
	import { page } from '$app/stores';

	$: bill = $page.data.bill;
</script>

<svelte:head>
	{#if bill}
		<title>{bill.title}</title>
	{/if}
</svelte:head>

<slot/>