<script>
	import { Router, Link, Route } from "svelte-routing";
	import * as Collection from "./main.js";
	export let name;
	export let url = "";
</script>

<style>
	h1 {
		color: purple;
	}

</style>

<h1>Hello {name}!</h1>

<Router url="{url}">
  <div>
	<Route path="/" component="{Collection.Home}" />
    <Route path="Gokomyo" component="{Collection.Gokomyo}" />
    <Route path="Gomizunoo" component="{Collection.Gomizunoo}" />
	<Route path="Gomomozono" component="{Collection.Gomomozono}" />
    <Route path="Gosai" component="{Collection.Gosai}" />
    <Route path="Gosakuramachi" component="{Collection.Gosakuramachi}" />
	<Route path="Goyozei" component="{Collection.Goyozei}" />
    <Route path="Higashiyama" component="{Collection.Higashiyama}" />
    <Route path="Kokaku" component="{Collection.Kokaku}" />
	<Route path="Komei" component="{Collection.Komei}" />
    <Route path="Meisho" component="{Collection.Meisho}" />
    <Route path="Momozono" component="{Collection.Momozono}" />
	<Route path="Niko" component="{Collection.Niko}" />
    <Route path="Reigen" component="{Collection.Reigen}" />
    <Route path="Sakuramachi" component="{Collection.Sakuramachi}" />
  </div>
</Router>

