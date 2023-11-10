<script lang="ts">
	import {
		Form,
		FormButton,
		FormField,
		FormInput,
		FormLabel,
		FormValidation
	} from '$lib/components/ui/form';
	import { ConfirmSmsSchema } from '../__route/schemas/confirmSmsSchema.js';

	export let data;
</script>

<div class="w-full py-10 px-4">
	<p class="font-bold text-2xl">Confirm SMS Code</p>
	<p class="text-muted-foreground text-sm pb-4">Check your phone for a text message</p>
	<Form form={data.form} schema={ConfirmSmsSchema} let:config>
		<FormField {config} name="csrfToken">
			<FormInput type="hidden" value={data.csrfToken}/>
		</FormField>
		<FormField {config} name="otpSecret">
			<FormInput type="hidden" value={data.otpSecret}/>
		</FormField>
		<div class="flex flex-col gap-2">
			<FormField {config} name="code">
				<FormLabel>Code</FormLabel>
				<FormInput
					inputmode="numeric"
					placeholder="- - - - - -"
					class="text-center text-4xl h-16 align-middle tracking-widest"
					maxlength={6}
				/>
				<FormValidation />
			</FormField>
			<FormButton>Submit</FormButton>
		</div>
	</Form>
</div>
