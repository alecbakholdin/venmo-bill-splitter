<script lang="ts">
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { tick } from 'svelte';
	import Icon from '@iconify/svelte';
	import { writable } from 'svelte/store';
	import { debounce } from 'svelte-reactive-debounce';
	import Friend, { searchFriends } from './friend.svelte';

	const frameworks = [
		{
			value: 'sveltekit',
			label: 'SvelteKit'
		},
		{
			value: 'next.js',
			label: 'Next.js'
		},
		{
			value: 'nuxt.js',
			label: 'Nuxt.js'
		},
		{
			value: 'remix',
			label: 'Remix'
		},
		{
			value: 'astro',
			label: 'Astro'
		}
	];

	let open = false;
	let value = '';

	$: selectedValue = frameworks.find((f) => f.value === value)?.label ?? 'Select a framework...';

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	function handleSelect(triggerId: string) {
		return (currentValue: any) => {
			value = currentValue;
			closeAndFocusTrigger(triggerId);
		};
	}

	let selected: string[] = [];
	const searchValue = writable<string>('');
	const debouncedSearch = debounce(searchValue, 150);
	$: searchPromise = searchFriends($debouncedSearch);

	const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
</script>

{$searchValue}
{$searchValue?.match(emailRegex)}

<Command.Root>
	<Command.Input
		placeholder="Search friends..."
		class="h-9"
		bind:value={$searchValue}
		on:input={console.log}
	/>
	<Command.List class="h-52 overflow-y-auto">
		<!-- <Command.Empty>No framework found.</Command.Empty> -->
		<Command.Group heading="Friends">
			{#await searchPromise}
				<Command.Loading />
			{:then friends}
				{JSON.stringify(friends)}
				{#each friends as friend}
					<Command.Item value={friend.email}>{friend.email}</Command.Item>
				{:else}
					Empty list
				{/each}
			{:catch}
				testing
			{/await}
		</Command.Group>
		<Command.Separator />
		{#if $searchValue?.match(emailRegex)}
			<Command.Group heading="Actions">
				<Command.Item value={$searchValue}>
					<Icon icon="mdi:add" class="h-4 w-4 mr-2" />
					<span>Create Friend '{$searchValue}'</span>
				</Command.Item>
			</Command.Group>
		{/if}
	</Command.List>
</Command.Root>
