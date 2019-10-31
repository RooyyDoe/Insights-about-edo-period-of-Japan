<script>
	import { Router, Route } from "svelte-routing";
	import * as Collection from "./main.js";
	export let url = "";
</script>

<style>
	:global(body) {
		background-image: url("images/Japanese_Pattern_34.jpg");
		background-repeat: repeat;
		background-size: contain;
		font-family: fantasy;
		position: relative!important;
	}

	:global(h1) {
		font-weight: bold;
		font-size: 1.3em;
		color: black;
		font-family: fantasy;
		text-align: center;
		padding: 0;
		margin: 0 0 0 17em;
	}

	:global(a:hover) {
		text-decoration: none;
	}

	:global(a) {
		color: black!important;
	}

</style>


<Router url="{url}">
  <div>
	<Route path="/" component="{Collection.Home}" />
    <Route path="Gokomyo" component="{Collection.Gokomyo}" />
    <Route path="Gomizunoo" component="{Collection.Gomizunoo}" />
	<Route path="Gomomozono" component="{Collection.Gomomozono}" />
    <Route path="Gosai" component="{Collection.Gosai}" />
    <Route path="Gosakuramachi" component="{Collection.Gosakuramachi}" />
    <Route path="Higashiyama" component="{Collection.Higashiyama}" />
    <Route path="Kokaku" component="{Collection.Kokaku}" />
	<Route path="Komei" component="{Collection.Komei}" />
    <Route path="Meisho" component="{Collection.Meisho}" />
    <Route path="Momozono" component="{Collection.Momozono}" />
	<Route path="Ninko" component="{Collection.Ninko}" />
    <Route path="Reigen" component="{Collection.Reigen}" />
    <Route path="Sakuramachi" component="{Collection.Sakuramachi}" />
  </div>
</Router>

<!-- <Getdata let:data>
	{#each data as result}
		<div>
			<h3>Titel: {result.title.value}</h3>
			<p>Foto: <img src="{result.img.value}" alt="foto"></p>
			<p>Type: {result.type.value}</p>
			<p>Cultuur: {result.herkomstLabel.value}</p>
			<p>Jaartal: {result.jaartal.value}</p>
		</div>
	{/each}
</Getdata> -->
