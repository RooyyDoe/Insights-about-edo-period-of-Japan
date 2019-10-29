export default function() {
		
	const url ='https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-33/sparql';
	
	const query = `
	PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
	PREFIX dc: <http://purl.org/dc/elements/1.1/>
	PREFIX dct: <http://purl.org/dc/terms/>
	PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
	PREFIX edm: <http://www.europeana.eu/schemas/edm/>
	PREFIX foaf: <http://xmlns.com/foaf/0.1/>
	PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

	SELECT ?cho ?title ?description ?materiaalLabel ?type ?img ?periode ?herkomstLabel ?jaartal WHERE {
		<https://hdl.handle.net/20.500.11840/termmaster4400> skos:narrower* ?concept .
		?concept skos:prefLabel ?periode .
		VALUES ?periode { "Edo (Japanse periode)" }
		
		?cho dct:created ?jaartal .
		filter(xsd:integer(?jaartal) >= 1600 && xsd:integer(?jaartal) <= 1868)
		
		OPTIONAL {?cho dc:description ?description} .
		
		?cho dct:medium* ?materiaal .
		?materiaal skos:prefLabel ?materiaalLabel .
		
		?cho dc:type ?type .
		?cho dc:title ?title .
		?cho edm:isShownBy ?img .
		
		?cho dct:spatial ?herkomst .
		?herkomst skos:prefLabel ?herkomstLabel .
		VALUES ?herkomstLabel { "Japan" } .
		
		FILTER langMatches(lang(?title), "ned")
    } LIMIT 50`;


	
	function runQuery(url, query){
		fetch(url+'?query='+ encodeURIComponent(query) +'&format=json')
			.then(res => res.json()) //array van objecten, hier moet overheen gelooped worden voor html, in een loop img create element die je append met een src van een van de objecten met de link 
			.then(json => {
				console.log(json);
				console.table(json.results);
				return json.results.bindings;
			});
	} //de JSON sla je op een een var bijvoorbeeld, dan loop je hierovereen (for each budda in buddas)

	return runQuery(url, query);
}