<script lang="ts">
	import { Form, FormButton, FormField, FormInput, FormValidation } from '$lib/components/ui/form';
	import { SendSmsSchema } from '../__route/schemas/sendSmsSchema.js';

	export let data;
	data.form.data.otpSecret = data.otpSecret;
</script>

<div class="w-full flex justify-center mt-12">
	<Form form={data.form} schema={SendSmsSchema} let:config>
		<FormField {config} name="otpSecret">
			<FormInput type="hidden" value={data.otpSecret} />
			<FormValidation />
		</FormField>
		<FormButton><span class="text-xl p-8">Send Sms</span></FormButton>
	</Form>
</div>
