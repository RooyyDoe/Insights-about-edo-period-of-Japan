<script>
    export let Showdata;
</script>

<style>
p {
    color: black;
}

.wrapper {
    display: flex;
    align-self: center;
}

img {
    height: 2em;
    width: 2em;
}
</style>
<div class="wrapper">
    <p>{ Showdata.uniqueTitle.value }</p>
    <img src={Showdata.uniqueImg.value} alt={ Showdata.uniqueTitle.value } />
</div>