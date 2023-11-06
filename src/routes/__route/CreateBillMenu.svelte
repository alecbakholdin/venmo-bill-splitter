<script lang="ts">
	import BubbleIcon from '$lib/components/BubbleIcon.svelte';
	import * as Button from '$lib/components/ui/button';
	import * as Form from '$lib/components/ui/form';
	import * as Sheet from '$lib/components/ui/sheet';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { CreateBillSchema } from './schemas.js';
	import Icon from '@iconify/svelte';

	export let form: SuperValidated<typeof CreateBillSchema>;

	const uploadOptions: {
		name: 'receiptPicture' | 'receiptFile';
		icon: string;
		text: string;
		capture: boolean;
	}[] = [
		{ name: 'receiptPicture', icon: 'mdi:camera', text: 'Take a Picture', capture: true },
		{ name: 'receiptFile', icon: 'mdi:upload', text: 'Upload an Image', capture: false }
	];
</script>

<Sheet.Root>
	<Sheet.Trigger asChild let:builder>
		<Button.Root builders={[builder]} variant="secondary">Open camera or upload bill</Button.Root>
	</Sheet.Trigger>
	<Sheet.Content side="bottom" class="grid place-items-center rounded-t-2xl">
		<Form.Root
			{form}
			schema={CreateBillSchema}
			action="?/createBill"
			let:config
			class="w-full max-w-md"
			enctype="multipart/form-data"
			options={{ onUpdate: console.log }}
			let:submitting
		>
			{#if submitting}
				<div class="w-full grid place-items-center h-20">
					<Icon icon="mingcute:loading-fill" class="text-xl animate-spin" />
				</div>
			{:else}
				{#each uploadOptions as { name, icon, text, capture }}
					<Form.Field {config} {name}>
						<Form.Label
							class="w-full cursor-pointer p-2 rounded-md hover:bg-muted flex items-center gap-2"
						>
							<BubbleIcon {icon} />
							<span class="text-lg">{text}</span>
						</Form.Label>
						<Form.Input
							type="file"
							accept="image/*"
							class="hidden"
							capture={capture || undefined}
							on:change={(e) => console.log(e.currentTarget.form?.requestSubmit())}
						/>
					</Form.Field>
				{/each}
				<Form.Button
					variant="ghost"
					class="w-full h-[62px] p-2 rounded-md hover:bg-muted flex justify-start"
				>
					<div class="flex gap-2 items-center">
						<BubbleIcon icon="mdi:edit" />
						<span class="text-lg">Custom</span>
					</div>
				</Form.Button>
			{/if}
		</Form.Root>
	</Sheet.Content>
</Sheet.Root>

<style>
</style>
