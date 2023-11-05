<script lang='ts'>
	import Icon from "@iconify/svelte";

    export let icon: string;
</script>

<div class="grid place-items-center p-4 rounded-xl bg-primary">
    <Icon {icon}/>
</div>