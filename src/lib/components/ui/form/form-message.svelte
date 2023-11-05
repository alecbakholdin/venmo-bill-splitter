<script lang="ts">
	import type { HTMLSpanAttributes } from 'bits-ui/dist/internal';
	import { getForm } from 'formsnap';

	type $$Props = HTMLSpanAttributes;

	const { message } = getForm();
</script>

<span {...$$restProps}>
	{$message}
</span>
