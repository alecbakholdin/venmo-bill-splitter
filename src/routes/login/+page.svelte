<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';

	export let data;
</script>

{#if data.session}
	<span class="signedInText">
		<small>Signed in as</small><br />
		<strong>{data.session.user?.name ?? 'User'}</strong>
	</span>
	<button on:click={() => signOut()} class="button">Sign out</button>
{:else}
	<span class="notSignedInText">You are not signed in</span>
	<button on:click={() => signIn('google')}>Sign In with Google</button>
{/if}
