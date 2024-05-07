<script lang="ts">
	export let data;
</script>

<div class="flex flex-col items-center max-w-md mx-auto text-center mt-12 gap-3">
	<p class="text-xl">The receipt-parsing process is currently <span class="text-primary">{data.status}</span></p>
	<p class="text-gray-700">Please refresh the page periodically until it loads</p>
</div>