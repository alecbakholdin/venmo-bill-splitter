<script lang="ts">
  import BillFriendInviterContent from './BillFriendInviterContent.svelte';

	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import Icon from '@iconify/svelte';

	export let billId: string;
</script>

<Dialog>
	<DialogTrigger asChild let:builder>
		<Button builders={[builder]} class="h-8 w-8 text-lg" variant="ghost" size="icon">
			<Icon icon="material-symbols:share" />
		</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Invite Friends</DialogTitle>
		</DialogHeader>
		
			<BillFriendInviterContent {billId}/>
	</DialogContent>
</Dialog>
