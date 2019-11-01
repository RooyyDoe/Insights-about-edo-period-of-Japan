<script>
    import {onMount} from 'svelte';
    import results from '../../data/getdata.js';
    import Showdata from '../components/showdata.svelte';
    import Extradata from '../components/extradata.svelte';

    let data = [];
    let filteredData = [];

    onMount( async () => {

        data = await results();

        const getDates = (dates) => {

            if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                return dates.split('-').map(e => parseInt(e.trim()));
            } else if (!isNaN(dates)) {

                return [parseInt(dates.trim())];
            }

            return [];
        }

        // jaartallen die je wilt checken
        const yearToCheck = getDates("1636");

        filteredData = data.filter(el => {

            const dates = getDates(el.uniqueJaartal.value);

            if (dates.length === 1) {

                return yearToCheck.length === 1 ? 

                    yearToCheck[0] === dates[0] :

                    yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
            } else if (dates.length === 2) {

                return yearToCheck.length === 1 ? 
 
                    yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :

                    yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
            }

            return false;
        });

        console.log(filteredData);
        console.log("test2", filteredData);
    })

</script>

<style>

	.container {
		max-width: 1100px;
		margin: 0 auto;
	}

	.cards {
		display: flex;
		-webkit-justify-content: center;
		justify-content: center;
		-webkit-flex-wrap: wrap;
		flex-wrap: wrap;
		margin-top: 15px;
		padding: 1.5%;
		-webkit-box-sizing: border-box;
		-moz-box-sizing: border-box;
		box-sizing: border-box;
	}
</style>

<Extradata 
    title="Empress Meishō"
    years="1629–1643"
    name="Okiko"
    image="images/Meisho_of_Japan.jpg"
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

<div class="container">
    <div class="cards">
        {#each filteredData as Showdata}
                <Showdata {Showdata}/>
            {:else}

            Loading...
        {/each}
    </div>
</div>