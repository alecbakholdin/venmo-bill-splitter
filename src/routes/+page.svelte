<script lang="ts">
	import CreateBill from './__route/CreateBillMenu.svelte';

	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import Button from '$lib/components/ui/button/button.svelte';
	import Icon from '@iconify/svelte';
	import { signOut } from '@auth/sveltekit/client';
	import { goto } from '$app/navigation';

	export let data;

	$: firstName = data.session?.user?.name?.split(' ')[0];
</script>

<Card.Root class="bg-muted rounded-t-none">
	<Card.Header class="relative">
		<Card.Title>
			<p class="text-sm text-muted-foreground">Hello, {firstName}!</p>
			<p class="text-3xl">Split a Bill</p>
		</Card.Title>
		<DropdownMenu>
			<DropdownMenuTrigger asChild let:builder>
				<Button
					builders={[builder]}
					type="button"
					variant="ghost"
					size="icon"
					class="w-8 h-8 absolute top-5 right-5"
				>
					<Icon icon="pepicons-pencil:dots-y" class="text-xl" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem
					on:click={async () => {
						await signOut();
						await goto('/login');
					}}
				>
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	</Card.Header>
	<Card.Content>
		<Card.Root class="pt-8 pb-4 px-3 bg-primary">
			<Card.Content class="flex flex-col items-center justify-center gap-2">
				<span>Need to Divide amount?</span>
				<CreateBill form={data.createBillForm} />
			</Card.Content>
		</Card.Root>
	</Card.Content>
</Card.Root>

<div class="w-full flex flex-col p-2 gap-2">
	<span class="text-muted-foreground text-lg">Recent Bills</span>

	{#await data.promises.recentBills}
		{#each { length: 4 } as _}
			<Skeleton class="w-full h-16 rounded-lg" />
		{/each}
	{:then recentBills}
		{#each recentBills as bill}
			<a href="/bill/{bill.slug}" class="grid grid-cols-[1fr_auto] rounded-lg bg-muted p-2">
				<span class="font-bold">{bill.title}</span>
				<span class="font-bold place-self-end">${bill.total?.toFixed(2)}</span>
				<span class="text-muted-foreground">{new Date(bill.dateCreated).toLocaleDateString()}</span>
				<span class="text-muted-foreground place-self-end">{bill.items.length || 'No'} items</span>
			</a>
		{:else}
			<span class="text-muted-foreground">You have no recent bills</span>
		{/each}
	{/await}
</div>
