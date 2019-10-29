<script>
	import { Router, Link, Route } from "svelte-routing";
	export let name;
	export let url = "";
</script>

<style>

	h1 {
		color: purple;
	}

</style>

<Router url="{url}">
  <nav>
    <Link to="Gokomyo"><p>Gokomyo</p></Link>
    <Link to="Gomizunoo"><p>Gomizunoo</p></Link>
	<Link to="Gomomozono"><p>Gomomozono</p></Link>
    <Link to="Gosai"><p>Gosai</p></Link>
	<Link to="Gosakuramachi"><p>Gosakuramachi</p></Link>
    <Link to="Goyozei"><p>Goyozei</p></Link>
	<Link to="Higashiyama"><p>Higashiyama</p></Link>
    <Link to="Kokaku"><p>Kokaku</p></Link>
	<Link to="Komei"><p>Komei</p></Link>
    <Link to="Meisho"><p>Meisho</p></Link>
	<Link to="Momozono"><p>Momozono</p></Link>
	<Link to="Niko"><p>Niko</p></Link>
    <Link to="Reigen"><p>Reigen</p></Link>
	<Link to="Sakuramachi"><p>Sakuramachi</p></Link>
  </nav>
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
