<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Dialog } from '$lib/components/ui/dialog';
	import { Friend } from '$lib/components/ui/friend';
	import { slide } from 'svelte/transition';
	import { getBillFormConfig } from '../utils';
	import FriendDialogContent from './FriendDialogContent.svelte';
	import { friendIndex } from './friendIndex';

	const config = getBillFormConfig();
	$: ({ form } = config.form);
	let open = false;
</script>

{#each $form.friends as friend, i (friend.email)}
	<div transition:slide>
		<Button
			class="w-full flex justify-between items-center gap-2 px-2"
			type="button"
			variant="ghost"
			on:click={() => {
				friendIndex.set(i);
				open = true;
			}}
		>
			<Friend email={friend.email} />
			<span class="font-bold">
				${friend.total.toFixed(2)}
			</span>
		</Button>
	</div>
{:else}
	<span class="text-muted-foreground">No people</span>
{/each}

<Dialog bind:open>
	<FriendDialogContent />
</Dialog>
