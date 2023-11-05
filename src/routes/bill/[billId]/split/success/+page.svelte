<script>
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import AlertTitle from '$lib/components/ui/alert/alert-title.svelte';
	import Icon from '@iconify/svelte';
</script>

<div class="pt-16">
	<Alert variant="default">
		<Icon icon="mdi:check" class="text-xl mt-2" />
		<AlertTitle>Success!</AlertTitle>
		<AlertDescription>Successfully joined. You can now close this page.</AlertDescription>
	</Alert>
</div>
