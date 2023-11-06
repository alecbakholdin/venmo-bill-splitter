<script lang="ts">
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
import { Button } from '$lib/components/ui/button';
	import Label from '$lib/components/ui/label/label.svelte';
	import QrCodeComponent from '$lib/components/ui/qrcode/QrCodeComponent.svelte';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import type { CreateInviteLinkSchema } from '$lib/types/inviteAuth.server';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import type { z } from 'zod';

	export let billId: string;

	let useSplitUrl = true;

	let billSplitUrl: Promise<string>;
	let billInviteUrl: Promise<string>;
	$: urlPromise = useSplitUrl ? billSplitUrl : billInviteUrl;
    async function fetchUrl(action: 'split' | 'invite') {
        const payload: z.infer<typeof CreateInviteLinkSchema> = {
            action,
            billId
        }
        console.log('fetching', payload);
        const response = await fetch('/api/invite/create', {method: 'POST', body: JSON.stringify(payload)});
        if(response.status !== 200) {
            throw Error("Error generating link")
        }
        const {shortInviteLink} = await response.json();
        console.log(action, 'link', shortInviteLink);
        return shortInviteLink;
    }
    $: if(useSplitUrl && !billSplitUrl) {
        billSplitUrl = fetchUrl('split');
    } else if(!billInviteUrl) {
        billInviteUrl = fetchUrl('invite');
    }

	function handleCopy(url: string) {
		if (typeof navigator !== 'undefined') navigator?.clipboard?.writeText?.(url);
	}
	function canShare(url: string) {
		return typeof navigator !== 'undefined' && navigator.canShare({ url });
	}
	function handleShare(url: string) {
		canShare(url) && navigator.share({ url });
	}
</script>

<div class="grid place-items-center gap-2">
	<Label for="share-or-invite-link" class="flex items-center gap-2">
		<Switch id="share-or-invite-link" bind:checked={useSplitUrl} />
		<span>Allow users to select their items</span>
	</Label>
	{#await urlPromise}
		<Icon icon="mingcute-loading-fill" class="text-xl animate-spin" />
	{:then url}
		<QrCodeComponent value={url} />
		<div class="bg-muted max-w-xs md:max-w-sm rounded-sm pt-2 p-4">
			<div class="flex w-full flex-row-reverse">
				{#if canShare(url)}
					<Button
						class="w-6 h-6"
						type="button"
						variant="ghost"
						aria-label="copy"
						size="icon"
						on:click={() => handleShare(url)}
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
					on:click={() => handleCopy(url)}
				>
					<Icon icon="ph:copy-bold" />
				</Button>
			</div>
			<span class="break-words">
				{url}
			</span>
		</div>
    {:catch}
        <Alert variant="destructive">
            <Icon icon="mdi:error"/>
            <AlertDescription>
                Error generating link
            </AlertDescription>
        </Alert>
	{/await}
</div>
