# Culture insights in the Edo period of Japan

This visualization provides a clarification of Japanese articles in the Edo period. This imperial period takes place from 1600 to 1868 in Japan. The objects are displayed scattered on a timeline and arranged in the Early, Middle or Late Edo period. The various emperors who have ruled in this period will also be indicated on this timeline. In this way the users can clearly see from which government period the various objects come. The timeline can be used interactively because a time period can be clicked and the Japanese objects will come forward that belong to this period.

The whole process that I made within this project will all be documented in the [wiki](https://github.com/RooyyDoe/frontend-applications/wiki) of my repository

## Screenshots

![Imgur](https://i.imgur.com/geEyLOZ.jpg)

- [Culture insights in the Edo period of Japan](#culture-insights-in-the-edo-period-of-japan)
  - [Screenshots](#screenshots)
  - [Assignment](#assignment)
  - [Installation](#installation)
    - [Usage](#usage)
    - [API](#api)
  - [Sources](#sources)
  - [Communication](#communication)
- [License](#license)

## Assignment

In this front-end course I needed to create a client-side application in JavaScript which dynamically renders data to views using either a front-end framework or system created by you. Reflect on the merits and costs of frameworks together.

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
This API allows you to get data of different historical events. This can be objects or pictures that are comming out of the history of this world. We have all gotten an invidual endpoint to use this database and get certain data from this database. 

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

In this query I am asking for different kinds of data. The most important data that I need from this database is the **year period(jaartal)** between 1611 - 1868. In this period I need every **Title** and **Image**. I am also filtering on the origin and period, so I want every object that is in this database that has the origin: 'Japan' and period: 'Edo (Japanse periode)'. 

As main concept I wanted to give an explaination about different objects out of this database, but with lack of certain database fields by some objects. A lot of objects don't have any description or just missing some extra information. When the new database is updated and developed more this can always change. I made it so the users only can see the Title, Year and Image for now..


## Sources
* [Svelte Documentation](https://svelte.dev/tutorial/basics) - Basic documentation of Svelte.
* [Svelte Darkside Docs](https://svelte.dev/docs#Before_we_begin) - Here they go in way deeper on what Svelte can do.
* [Styling idea's](https://freefrontend.com/) - Where I got most of my styling idea's from.
* [Svelte Documentation](https://objectcomputing.com/resources/publications/sett/july-2019-web-dev-simplified-with-svelte) - recommended by Svelte developers (Discord).
* [Svelte Discord](https://discord.gg/yy75DKs) — For questions and updates on the framework.

## Credits

* [Help from Thijs Spijker](https://github.com/iSirThijs) - Explained a lot of difficult programming stuff and good guy to talk against when u have a problem or when ur stuck.
* [Help from Kris Kuijpers](https://github.com/kriskuiper) — Tried to explain to me how fetch works and how I need to use the reduce function. Also lets you see things from another perspective.
* [Help from Stefan Gerrits](https://github.com/StefanGerrits2) — Did alot of programming together and watched in each other code to fix certain things. Also did the deploying of our apps together.
* [Help from Leroy van Biljouw](https://github.com/SqueezyDough) - He helpt me look on a different way to my project while I was thinking way to hard for what I needed to do. Also showed me how he did he's map structure and I got inspired

## Upcoming features
- [ ] A detail page with extra information about the object.
- [ ] Sharing option for social media or liking option.
- [ ] Search option on the homepage where you can search for a specific year period
- [ ] Making it more dynamic so that a developer can load in a different query and it will still work.

# License

More information over [License](https://help.github.com/en/articles/licensing-a-repository)

[MIT](https://github.com/RooyyDoe/frontend-applications/blob/master/LICENSE.txt) © [Roy Kuijper](https://github.com/RooyyDoe)
