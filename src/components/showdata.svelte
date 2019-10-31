<script>
    export let Showdata;
</script>

<style>
p {
	color: black;
}

.card {
	position: relative;
	margin-bottom: 20px;
	padding-bottom: 30px;
	background: #fefff9;
	color: #363636;
	text-decoration: none;
	-moz-box-shadow: rgba(0, 0, 0, 0.19) 0 0 8px 0;
	-webkit-box-shadow: rgba(0, 0, 0, 0.19) 0 0 8px 0;
	box-shadow: rgba(0, 0, 0, 0.19) 0 0 8px 0;
	-moz-border-radius: 4px;
	-webkit-border-radius: 4px;
	border-radius: 4px;
}

.card span {
    display: block;
}
.card .card-summary {
     padding: 5% 5% 3% 5%;
}
.card .card-header {
    position: relative;
    height: 220px;
    overflow: hidden;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    background-color: rgba(255, 255, 255, 0.15);
    background-blend-mode: overlay;
    -moz-border-radius: 4px 4px 0 0;
    -webkit-border-radius: 4px;
    border-radius: 4px 4px 0 0;
}
.card .card-header:hover, .card .card-header:focus {
    background-color: rgba(255, 255, 255, 0);
}
.card .card-title {
    background: rgba(220, 197, 119, 0.85);
    padding: 3.5% 0 2.5% 0;
    color: white;
    font-family: fantasy;
    text-transform: uppercase;
    position: absolute;
    bottom: 0;
    width: 100%;
}
.card .card-title h3 {
    font-size: 0.8em;
    line-height: 1.2;
    padding: 0 3.5%;
    margin: 0;
}
.card .card-meta {
    max-height: 0;
    overflow: hidden;
    color: #666;
    font-size: .78em;
    text-transform: uppercase;
    position: absolute;
    bottom: 5%;
    padding: 0 5%;
    -moz-transition-property: max-height;
    -o-transition-property: max-height;
    -webkit-transition-property: max-height;
    transition-property: max-height;
    -moz-transition-duration: 0.4s;
    -o-transition-duration: 0.4s;
    -webkit-transition-duration: 0.4s;
    transition-duration: 0.4s;
    -moz-transition-timing-function: ease-in-out;
    -o-transition-timing-function: ease-in-out;
    -webkit-transition-timing-function: ease-in-out;
    transition-timing-function: ease-in-out;
}
.card:hover, .card:focus {
    background: white;
    -moz-box-shadow: rgba(0, 0, 0, 0.45) 0px 0px 20px 0px;
    -webkit-box-shadow: rgba(0, 0, 0, 0.45) 0px 0px 20px 0px;
    box-shadow: rgba(0, 0, 0, 0.45) 0px 0px 20px 0px;
}
.card:hover .card-title, .card:focus .card-title {
    background: rgba(220, 197, 119, 0.95);
}
.card:hover .card-meta, .card:focus .card-meta {
  max-height: 1.5em;
}

img {
  max-width: 100%;
}

@media (max-width: 700px) {
  .card {
    width: 100%;
  }
}
@media (min-width: 700px) {
  .card {
    max-width: 320px;
    margin-right: 20px;
    margin-bottom: 20px;
  }
  .card:nth-child(even) {
    margin-right: 0;
  }
}
@media (min-width: 980px) {
  .card:nth-child(even) {
    margin-right: 20px;
  }
  .card:nth-child(3n) {
    margin-right: 0;
  }
}

</style>

<a class="card" href="/">
  <span class="card-header" style="background-image: url({Showdata.uniqueImage.value});">
  <span class="card-title">
    <h3>{Showdata.uniqueTitle.value}</h3>
  </span>
  </span>
  <span class="card-summary">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.
  </span>
  <span class="card-meta">
    Founded at: {Showdata.uniqueJaartal.value}
  </span>
</a>