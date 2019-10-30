<script>
    import {onMount} from 'svelte';
    import results from '../../data/getdata.js';
    import Showdata from '../components/showdata.svelte';
    import Extradata from '../components/extradata.svelte';

    let data = [];

    onMount( async () => {
        data = await results()
    })
</script>

<style>
	h1 {
		color: black;
        text-align: center;
	}
    p {
        color: gray;
        text-align: center;
    }
</style>

<Extradata 
    title="Emperor Go-Kōmyō"
    years="1643–1654"
    name="Tsuguhito"
    image="images/Emperor_Go-Kōmyō.jpg"
    description="    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo 
    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse 
    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non 
    proident, sunt in culpa qui officia deserunt mollit anim id est laborum. 
    
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo 
    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse 
    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non 
    proident, sunt in culpa qui officia deserunt mollit anim id est laborum."/>

<ul>
    {#each data as Showdata}
            <Showdata {Showdata}/>

        {:else}

        Loading...
    {/each}
</ul>