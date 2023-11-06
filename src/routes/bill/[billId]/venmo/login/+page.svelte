<script lang="ts">
	import {
		Form,
		FormButton,
		FormField,
		FormInput,
		FormLabel,
		FormValidation
	} from '$lib/components/ui/form';
	import { LoginSchema } from './__route/schemas/loginSchema.js';

	export let data;
</script>

<div class="w-full py-10 px-4">
	<p class="text-2xl font-bold">Sign into Venmo</p>
	<p class="text-muted-foreground text-sm pb-4">
		Sign in using your Venmo credentials. No credentials are stored by this app.
	</p>
	<Form form={data.form} schema={LoginSchema} let:config>
		<div class="flex flex-col gap-2">
			<FormField {config} name="usernameOrEmail">
				<FormLabel>Username or Email</FormLabel>
				<FormInput placeholder="Username or Email" />
				<FormValidation />
			</FormField>
			<FormField {config} name="password">
				<FormLabel>Password</FormLabel>
				<FormInput placeholder="Password" type="password" />
				<FormValidation />
			</FormField>
			<FormButton>Submit</FormButton>
		</div>
	</Form>
</div>
