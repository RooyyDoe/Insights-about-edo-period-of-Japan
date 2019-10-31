# Cultural insights in the Edo period of Japan

This application provides a clarification of Japanese articles in the Edo period. This imperial period takes place from 1600 to 1868 in Japan. The objects are displayed scattered on a timeline and arranged in the Early, Middle or Late Edo period. The various emperors who have ruled in this period will also be indicated on this timeline. In this way the users can clearly see from which government period the various objects origin. The timeline can be used interactively by clicking on a time period. This will make the Japanese objects belonging to this period come forward. 

The whole process of creating this application will all be documented in the [wiki](https://github.com/RooyyDoe/frontend-applications/wiki) of my repository.

## Screenshots

![Imgur](https://i.imgur.com/geEyLOZ.jpg)

- [Culture insights in the Edo period of Japan](#culture-insights-in-the-edo-period-of-japan)
  - [Screenshots](#screenshots)
  - [Assignment](#assignment)
  - [Upcoming features](#upcoming-features)
  - [Installation](#installation)
    - [Usage](#usage)
    - [API](#api)
  - [Sources](#sources)
  - [Communication](#communication)
- [License](#license)

## Assignment

In this front-end course I needed to create a client-side application in JavaScript which dynamically renders data to views using either a front-end framework or a system created by you. Reflect on the merits and costs of frameworks together.

## Upcoming features
- [ ] A 'Details' page with extra information about the object.
- [ ] A sharing option for social media or a liking option.
- [ ] A search option on the homepage where you can search for a specific time period.
- [ ] Making the application more dynamic so that a developer can load in a different query and it will still work.

## Installation

**Clone the repository of the project**
```
git clone https://github.com/RooyyDoe/frontend-applications.git
```

**Npm packages installing**
```
npm install
```

### Usage

**Run code**
```
npm run dev
```

**Url for the application**

```
localhost:5000 // host is now available
```

**Demo** is also live at: https://frontend-applications-svelte.netlify.com/

## API
This API allows you to get data of different historical events. This can be for example historic objects or pictures from all over the world. We all have obtained an individual endpoint to substract certain data from this database. 

I made use of the following API:

* [GVN](https://data.netwerkdigitaalerfgoed.nl/)

<details>


```
	PREFIX dc: <http://purl.org/dc/elements/1.1/>
	PREFIX dct: <http://purl.org/dc/terms/>
	PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
	PREFIX edm: <http://www.europeana.eu/schemas/edm/>
	PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
	
	SELECT ?cho (SAMPLE(?title) AS ?uniqueTitle) (SAMPLE(?img) AS ?uniqueImage) (SAMPLE(?periode) AS ?uniquePeriod) (SAMPLE(?  herkomstLabel) AS ?uniqueHerkomstLabel) (SAMPLE(?jaartal) AS ?uniqueJaartal) WHERE {
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
	} GROUP BY ?cho
```
</details>

In this query I am asking for different types of data. The most important data that I need from this database is the data from the time period 1611-1868, which is obtained with the filter **year period(jaartal)**. In this period I need every **Title** and **Image**. I am also filtering on the origin and period, so I want every object that is in this database that has the origin: 'Japan' and period: 'Edo (Japanse periode)'. 

At first I wanted to give a detailed explanation of all the different objects that resulted from this query. However, due to the lack of information for certain objects, this was not possible. A lot of the objects did not have any description or some information was simply missing. When the database is further developed, more details can always be added to the visualization. For now the application will only include the title, the year and the image of the objects. 

## Sources
* [Svelte Documentation](https://svelte.dev/tutorial/basics) - Basic documentation of Svelte.
* [Svelte Darkside Docs](https://svelte.dev/docs#Before_we_begin) - Here they go in way deeper on what Svelte can do.
* [Styling idea's](https://freefrontend.com/) - Where I got most of my styling idea's from.
* [Svelte Documentation](https://objectcomputing.com/resources/publications/sett/july-2019-web-dev-simplified-with-svelte) - recommended by Svelte developers (Discord).
* [Svelte Discord](https://discord.gg/yy75DKs) — For questions and updates on the framework.

## Credits

* [Help from Thijs Spijker](https://github.com/iSirThijs) - Explained a lot of difficult programming stuff and was a good guy to speak with when you have a problem or when you're stuck.
* [Help from Kris Kuijpers](https://github.com/kriskuiper) — Tried to explain to me how fetch works and how I needed to use the reduce function. Also lets you see things from another perspective.
* [Help from Stefan Gerrits](https://github.com/StefanGerrits2) — We did a lot of programming together and looked at each others code to fix certain things. We also did the deploying of our apps together.
* [Help from Leroy van Biljouw](https://github.com/SqueezyDough) - He helped me look at my project in a different way when I was thinking way to difficult for what I needed to do. He also showed me how he did his map structure and I got inspired by that. 

# License

More information over [License](https://help.github.com/en/articles/licensing-a-repository)

[MIT](https://github.com/RooyyDoe/frontend-applications/blob/master/LICENSE.txt) © [Roy Kuijper](https://github.com/RooyyDoe)
