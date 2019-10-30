<script>
import { Router, Link } from "svelte-routing";
export let url = "";
</script>

<style>

/* Blocks with 6 by 5 cm: */

.gomizunoo {
    transition: transform .3s; 
    position: absolute;
	top: 465px;
	left: 0;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 9.8125em;
    height: 11.5em;
}

.reigen {
    transition: transform .3s; 
    position: absolute;
	top: 150px;
	left: 450px;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 9.8125em;
    height: 11.5em;
}

.sakuramachi {
    transition: transform .3s; 
    position: absolute;
	top: 460px;
	left: 820px;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 9.8125em;
    height: 11.5em;
}

.gosakuramachi {
    transition: transform .3s; 
    position: absolute;
	top: 400px;
	left: 1100px;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 9.8125em;
    height: 11.5em;
}

.komei {
    transition: transform .3s; 
    position: absolute;
	top: 450px;
	left: 1550px;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 9.8125em;
    height: 11.5em;
}
/* Blocks with 7 by 8 cm: */

.meisho {
    transition: transform .3s; 
    position: absolute;
	top: 150px;
	left: 10px;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 14em;
    height: 15em;
}

.gosai {
    transition: transform .3s; 
    position: absolute;
	top: 410px;
	left: 400px;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 14em;
    height: 15em;
}

.nakamikado {
    transition: transform .3s; 
    position: absolute;
	top: 133px;
	left: 700px;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 14em;
    height: 15em;
}

.gomomozono {
    transition: transform .3s; 
    position: absolute;
	top: 130px;
	left: 1150px;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 14em;
    height: 15em;
}

/* Blocks with 6 by 9 cm: */

.gokomyo {
    transition: transform .3s; 
    position: absolute;
	top: 280px;
	left: 200px;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 19.25em;
    height: 12.1875em;
}

.higashiyama {
    transition: transform .3s; 
    position: absolute;
	top: 390px;
	left: 580px;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 19.25em;
    height: 12.1875em;
}

.momozono {
    transition: transform .3s; 
    position: absolute;
	top: 230px;
	left: 860px;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 19.25em;
    height: 12.1875em;
}

.kokaku {
    transition: transform .3s; 
    position: absolute;
	top: 300px;
	left: 1280px;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 19.25em;
    height: 12.1875em;
}

.ninko {
    transition: transform .3s; 
    position: absolute;
	top: 150px;
	left: 1500px;
    border: 4px ridge #383326;
    background-color: black;
    color: white;
    width: 19.25em;
    height: 12.1875em;
}

.animate:hover {
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2);
    transform: scale(1.1);
    z-index: 1;
}

.title {
    position: absolute;
    margin: 0.3em 0 0 0.6em;
    font-size: 0.8em;
    font-family: fantasy;
}

img {
    object-fit: cover;
    display: block;
    width: 100%;
    height: 100%;
}

.bottom {
    object-position: bottom;
}

.top {
    object-position: top;
}

.center {
    object-position: center;
}



</style>
<div class="wrapper"></div>
<Router url="{url}">
  <nav> 
    <div class="animate gomizunoo">
        <Link to="Gomizunoo">
            <p class="title">1611–1629 Go-Mizunoo</p>
            <img class="bottom" src="images/Emperor_Go-Mizunoo.jpg" alt="Go-Mizunoo" />
        </Link>
    </div>
    <div class="animate meisho">
        <Link to="Meisho">
            <p class="title">1629–1643 Meishō</p>
            <img class="" src="images/Meisho_of_Japan.jpg" alt="Meishō" />
        </Link>
    </div>
    <div class="animate gokomyo">
        <Link to="Gokomyo">
            <p class="title">1643–1654 Go-Kōmyō</p>
            <img class="top" src="images/Emperor_Go-Kōmyō.jpg" alt="Go-Kōmyō" />
        </Link>
    </div>
    <div class="animate gosai">
        <Link to="Gosai">
            <p class="title">1655–1663 Go-Sai</p>
            <img class="" src="images/Emperor_Go-Sai.jpg" alt="Go-Sai" />
        </Link>
    </div>
    <div class="animate reigen">
        <Link to="Reigen">
            <p class="title">1663–1687 Reigen</p>
            <img class="" src="images/Emperor_Reigen.jpg" alt="Reigen" />
        </Link>
    </div>
    <div class="animate higashiyama">
        <Link to="Higashiyama">
            <p class="title">1687–1709 Higashiyama</p>
            <img class="top" src="images/800px-Emperor_Higashiyama.jpg" alt="Higashiyama" />
        </Link>
    </div>
    <div class="animate nakamikado">
        <Link to="Nakamikado">
            <p class="title">1709–1735 Nakamikado</p>
            <img class="top" src="images/Emperor_Nakamikado.jpg" alt="Nakamikado" />
        </Link>
    </div>
    <div class="animate sakuramachi">
        <Link to="Sakuramachi">
            <p class="title">1735–1747 Sakuramachi</p>
            <img class="" src="images/Emperor_Sakuramachi.jpg" alt="Sakuramachi" />
        </Link>
    </div>
    <div class="animate momozono">
        <Link to="Momozono">
            <p class="title">1747–1762 Momozono</p>
            <img class="top" src="images/1280px-Emperor_Momozono.jpg" alt="Momozono" />
        </Link>
    </div>
    <div class="animate gosakuramachi">
        <Link to="Gosakuramachi">
            <p class="title">1762–1771 Go-Sakuramachi</p>
            <img class="top" src="images/Empress_Go-Sakuramachi.jpg" alt="Go-Sakuramachi" />
        </Link>
    </div>
    <div class="animate gomomozono">
        <Link to="Gomomozono">
            <p class="title">1771–1779 Go-Momozono</p>
            <img class="" src="images/1024px-Emperor_Go-Momozono.jpg" alt="Go-Momozono" />
        </Link>
    </div>
    <div class="animate kokaku">
        <Link to="Kokaku">
            <p class="title">1780–1817 Kōkaku</p>
            <img class="top" src="images/Emperor_Kōkaku.jpg" alt="Kōkaku" />
        </Link>
    </div>
    <div class="animate ninko">
        <Link to="Ninko">
            <p class="title">1817–1846 Ninkō</p>
            <img class="top" src="images/Emperor_Ninkō.jpg" alt="Ninkō" />
        </Link>
    </div>
    <div class="animate komei">
        <Link to="Komei">
            <p class="title" style="color:white;">1846–1867 Kōmei</p>
            <img class="" src="images/800px-The_Emperor_Komei.jpg" alt="Kōmei" />
        </Link>
    </div>
  </nav>
</Router>