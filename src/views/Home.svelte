<script>
	import Getdata from '../functions/getdata.js';
	export let name;
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<Getdata let:data>
	{#each data as result}
		<div>
			<h3>Titel: {result.title.value}</h3>
			<p>Foto: <img src="{result.img.value}" alt="foto"></p>
			<p>Type: {result.type.value}</p>
			<p>Cultuur: {result.herkomstLabel.value}</p>
			<p>Jaartal: {result.jaartal.value}</p>
		</div>
	{/each}
</Getdata>
