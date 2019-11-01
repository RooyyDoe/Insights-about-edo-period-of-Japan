<script>
    import {onMount} from 'svelte';
    import results from '../../data/getdata.js';
    import Showdata from '../components/showdata.svelte';
    import Extradata from '../components/extradata.svelte';

    let data = [];
    let filteredData = [];

    onMount( async () => {
        // Wacht op de data die doorkomt en dan stopt hij het in de lege array genaamd 'data'
        data = await results();

        const getDates = (dates) => {
            // Check of de/het jaartal(len) die je wilt checken een streepje heeft.
            // Wanneer het een streepje heeft, is het een periode in plaats van een
            // specifiek jaartal
            if (/^(\d+(|\s))-((|\s)\d+)$/.test(dates)) {

                // split de twee jaartallen op het streepje, en cast beide jaartallen
                // naar een integer, zodat deze later vergeleken kunnen worden met de jaar- 
                // tallen van de resultaten
                // Array.map() loopt over alle waarden in de array heen en muteert de waarde (e)
                // op die plek in de array. Bij deze loop worden whitespaces weggehaald en
                // van strings dus integers gemaakt
                // ["100 ", "200"] wordt dan [100, 200]
                return dates.split('-').map(e => parseInt(e.trim()));
            } else if (!isNaN(dates)) {
                // Wanneer er geen streepje in het jaartal, moet deze in ieder geval een 
                // valide getal zijn. isNan() checkt daar op (is Not A Number)
                // en als het een getal is, cast hij hem naar een getal
                return [parseInt(dates.trim())];
            }

            // geen jaartal, met of zonder streepje. Someone fucked it up
            return [];
        }

        // jaartallen die je wilt checken
        const yearToCheck = getDates("1846 - 1867");

        filteredData = data.filter(el => {
            // zet jaartallen van het artikel in een array, zoals boven beschreven
            const dates = getDates(el.uniqueJaartal.value);
            // Wanneer er geen streepje is
            if (dates.length === 1) {
                // kijk of de te checken jaartal een streepje heeft
                return yearToCheck.length === 1 ? 
                    // geen streepje, dan gewoon 1-op-1 checken
                    yearToCheck[0] === dates[0] :
                    // wel een streepje? Dan moet het begin van de te checken periode minder zijn dan 
                    // het jaartal van het artikel, en het einde van de te checken periode meer.
                    // Dus -> "1828 - 1856" filteren -> 1828 is minder dan bijv. 1855 en 1856 is meer, dus 1855 
                    // wordt meegenomen in de filtering
                    yearToCheck[0] <= dates[0] && yearToCheck[1] >= dates[0];
            } else if (dates.length === 2) {
                // Check van een periode, aangezien er een streepje zit in het jaartal van het artikel
                return yearToCheck.length === 1 ? 
                    // er wordt gecheckt op 1 jaartal, dan moet deze binnen de periode liggen van het artikel
                    // dus meer dan de begin van die periode, en minder dan het einde van die periode 
                    yearToCheck[0] >= dates[0] && yearToCheck[0] <= dates[1] :
                    // Er zit ee nstreepje in beide jaartallen, dan moeten de jaartallen van de te checken periode
                    // binnen de jaartallen van de periode van het artikelliggen.
                    yearToCheck[0] >= dates[0] && yearToCheck[1] <= dates[1];
            }
            // wanneer dates.length >= 3 of 0 is, is dit geen valide datum of periode, waardoor 
            // dit artikel sowieso niet meegenomen wordt in de filtering. 
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
    title="Emperor Kōmei"
    years="1846–1867"
    name="Osahito"
    image="images/800px-The_Emperor_Komei.jpg"
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