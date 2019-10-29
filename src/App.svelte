<script>
	import { Router, Link, Route } from "svelte-routing";
	import Gokomyo from "./views/Gokomyo.svelte";
	import Gomizunoo from "./views/Gomizunoo.svelte";
	export let name;
	export let url = "";
</script>

<style>
	h1 {
		color: purple;
	}

	div {
		border: 1px solid black;
		padding: 1em;
	}

	img {
		width: 64px;
		height: 64px;
	}
</style>

<h1>Hello {name}!</h1>



<Router url="{url}">
  <nav>
    <Link to="Gokomyo">Gokomyo</Link>
    <Link to="Gomizunoo">Gomizunoo</Link>
  </nav>
  <div>
    <Route path="Gokomyo" component="{Gokomyo}" />
    <Route path="Gomizunoo" component="{Gomizunoo}" />
  </div>
</Router>

