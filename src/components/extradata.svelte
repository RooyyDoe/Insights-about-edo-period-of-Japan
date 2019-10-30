<script>

export let title;
export let name;
export let years;
export let description;
export let image;

</script>

<style>
.wrapper {
    padding: 1em;
    background-color: rgba(255, 255, 255, 0.6);
    width: 60%;
    margin: 0 auto;
}

.innerwrapper {
    display: flex;
    justify-content: space-between;
}

h1 {
    margin: 0;
}

.wrapper > p:first-of-type {
    margin-top: -0.5em;
}

img {
    float: left;
    width: 15em;
    height: 15em;
    margin: 0 1em 1em 0;
}

p {
    white-space:pre
}

</style>

<div class="wrapper">
    <div class="innerwrapper" >
        <h1>{title}</h1>
        <h1>{years}</h1>
    </div>
    <p>{name}</p>
    <img src="{image}" alt="{title}" />
    <p>{description}</p>
</div>