export default function() {
		
	const url ='https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-33/sparql';
	
	const query = `
	PREFIX dc: <http://purl.org/dc/elements/1.1/>
	PREFIX dct: <http://purl.org/dc/terms/>
	PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
	PREFIX edm: <http://www.europeana.eu/schemas/edm/>
	PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
	
	SELECT ?cho (SAMPLE(?title) AS ?uniqueTitle) (SAMPLE(?img) AS ?uniqueImg) (SAMPLE(?periode) AS ?Unique_Periode) (SAMPLE(?herkomstLabel) AS ?Unique_HerkomstLabel) (SAMPLE(?jaartal) AS ?Unique_Jaartal) WHERE {
	   <https://hdl.handle.net/20.500.11840/termmaster4400> skos:narrower* ?concept .
	   ?concept skos:prefLabel ?periode .
	   VALUES ?periode { "Edo (Japanse periode)" }
	  
	   ?cho dc:title ?title .
	   ?cho edm:isShownBy ?img .
	  
	   ?cho dct:created ?jaartal .
	   filter(xsd:integer(?jaartal) >= 1611 && xsd:integer(?jaartal) <= 1868)
	  
	   ?cho dct:spatial ?herkomst .
	   ?herkomst skos:prefLabel ?herkomstLabel .
	   VALUES ?herkomstLabel { "Japan" } .
	  
	   FILTER langMatches(lang(?title), "ned")
	} GROUP BY ?cho LIMIT 1
	`;

	function runQuery(url, query){
		return fetch(url+'?query='+ encodeURIComponent(query) +'&format=json')
			.then(res => res.json()) //array van objecten, hier moet overheen gelooped worden voor html, in een loop img create element die je append met een src van een van de objecten met de link 
			.then(json => {
				console.log(json);
				console.table(json.results);
				return json.results.bindings;
			});
	} //de JSON sla je op een een var bijvoorbeeld, dan loop je hierovereen (for each budda in buddas)

	return runQuery(url, query);
}