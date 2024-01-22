<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';

	export let data;

	const timeout = writable<NodeJS.Timeout>();
	onMount(() => {
		console.log('mounted');
		timeout.set(setInterval(async () => {
			if(typeof window === 'undefined') return;
			console.log(data);
			if(data.status === 'running') {
				await invalidateAll();
			}
		}, 1000))
	});
	onDestroy(() => {
		console.log('destroyed');
		clearTimeout($timeout);
	});
</script>

<pre>{JSON.stringify(data.receipt, null, 2)}</pre>
