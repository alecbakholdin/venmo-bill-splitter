<script lang="ts">
	import QRCode from 'qrcode';

	export let value: string;

	let qrCodeCanvas: HTMLCanvasElement;
	$: if (qrCodeCanvas) {
		QRCode.toCanvas(qrCodeCanvas, value, function (error: any) {
			if (error) console.error(error);
		});
	}
</script>

<canvas bind:this={qrCodeCanvas} />
