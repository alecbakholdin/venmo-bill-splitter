<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import Label from '$lib/components/ui/label/label.svelte';
	import QrCodeComponent from '$lib/components/ui/qrcode/QrCodeComponent.svelte';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import Icon from '@iconify/svelte';

	export let billInviteUrl: string;
	export let billSplitUrl: string;

	let useSplitUrl = true;
	$: url = useSplitUrl ? billSplitUrl : billInviteUrl;

	function handleCopy() {
		if (typeof navigator !== 'undefined') navigator?.clipboard?.writeText?.(url);
	}
	$: canShare = typeof navigator !== 'undefined' && navigator.canShare({ url });
	function handleShare() {
		canShare && navigator.share({ url });
	}
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
		<div class="grid place-items-center gap-2">
			<Label for="share-or-invite-link" class="flex items-center gap-2">
				<Switch id="share-or-invite-link" bind:checked={useSplitUrl} />
				<span>Allow users to select their items</span>
			</Label>
			<QrCodeComponent value={url} />
			<div class="bg-muted max-w-xs md:max-w-sm rounded-sm pt-2 p-4">
				<div class="flex w-full flex-row-reverse">
					{#if canShare}
						<Button
							class="w-6 h-6"
							type="button"
							variant="ghost"
							aria-label="copy"
							size="icon"
							on:click={handleShare}
						>
							<Icon icon="mdi:share" />
						</Button>
					{/if}
					<Button
						class="w-6 h-6"
						type="button"
						variant="ghost"
						aria-label="copy"
						size="icon"
						on:click={handleCopy}
					>
						<Icon icon="ph:copy-bold" />
					</Button>
				</div>
				<span class="break-words">
					{url}
				</span>
			</div>
		</div>
	</DialogContent>
</Dialog>
