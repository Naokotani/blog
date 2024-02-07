const express = require('express')
const app = express()
const fs = require('node:fs').promises;
const path = require('path');
const Sqrl = require('squirrelly');
const cheerio = require('cheerio');
require('dotenv').config();

const PORT = process.env.PORT;
const API_URL = process.env.API_URL;
const POSTS = path.join(__dirname, '/posts/');

app.use(express.static('src'));

app.get('/cards', async function (req, res) {
	const cards = await makeCards();
  res.send(cards);
})

app.get('/blog', async function (req, res) {
	const files = await fs.readdir(POSTS)

	let labels = []

	for (file of files) {
		labels.push(makeTitle(file));
	}

	const data = {
		files: files,
		labels: labels,
	}

	const links = Sqrl.render(getTemplate(), data);
  res.send(links);
})

app.get('/blog/*', async function (req, res) {
	const slug = req.params[0];
	if (req.headers["hx-request"] === "true") {
		const data = await fs.readFile(POSTS+slug, 'utf8')
		res.send(data);
	} else {
		const route = [slug]

		const data = {
			route: route,
		}

		const html = Sqrl.render(newRoute(), data);
		res.send(html);
	}
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

function makeTitle(slug) {
	let words = slug.split('.');
  words = words[0].split('-');

  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    words[i] = word.charAt(0).toUpperCase() + word.slice(1);
  }

  return words.join(' ');
}

async function makeCards() {
	let summaries = [];
	let titles = [];
	let links = [];
	let images = [];

	const files = await fs.readdir(POSTS);

	for (file of files) {
		const img = file.split(".");
		const data = await fs.readFile(POSTS+file, 'utf8');
		links.push(file);
		titles.push(makeTitle(file));
		images.push(img[0] + ".png")
		const $ = cheerio.load(data);
		summaries.push($('div.summary p').text());
	}

	const data = {
		links: links,
		titles: titles,
		summaries: summaries,
		images: images,
	}

	return Sqrl.render(cardTemp(), data);
}

function getTemplate() {
	return anchorList = `
<nav>
<h2 class="post-header">Projects</h2>
		<ul>
				{{@each(it.files) => val, index}}
				<li>
						<a href="#" hx-push-url="true" hx-get="${API_URL}blog/{{val}}" hx-target="#contentDiv" hx-swap="innerHTML">
						{{it.labels[index]}}
						</a>
				</li>
				{{/each}}
		</ul>
</nav>
`
}

function cardTemp () {
	return `
<div class="home">
<p class="intro">
I am a full stack developer based in Cape Breton, Nova Scotia, specializing in React, Svelte, HTML/CSS, Node.js, Rust,
and SQL. With a passion for creating innovative and efficient solutions, I bring a wealth of experience and knowledge
to every project. My dedication to quality and attention to detail ensures that I deliver exceptional results that
meet and exceed client expectations. With a unique blend of technical skills and creative problem-solving abilities,
I am well-equipped to tackle a wide range of development challenges. I studied IT programming at NSCC, have a BA in
anthropology from Trent University and studied Editing at George Brown College.
<a href="https://github.com/Naokotani/"> Check out my Github</a> to see more projects.
</p>
<div class="cards">
{{@each(it.links) => val, index}}
<div class="cards-grid">
<div class="card">
<a href="#" hx-get="${API_URL}blog/{{val}}" hx-push-url="true" hx-target="#contentDiv" hx-swap="innerHTML">
<img alt="{{it.titles[index]}} picture" src="/images/{{it.images[index]}}"/>
<div class="card-content">
<h2>{{it.titles[index]}}</h2>
<p>{{it.summaries[index]}}</p>
</div>
</a>
</div>
</div>
{{/each}}
</div>
</div>
`
}

function newRoute() {
	return `
<!doctype html>
<html lang="en>
		<head	>
				<meta charset="UTF-8"/>
				<title>Chris Hughes dot Dev</title>
				<link href="/css/normalize.css" rel="stylesheet"/>
				<link href="/css/styles.css" rel="stylesheet"/>
				<meta
						name="description"
						content="A Developer blog for Chris Hughes. Specializes in JavaScript, Rust, Web development, SQL" />
				<script src="https://unpkg.com/htmx.org@1.9.10" integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC" crossorigin="anonymous"></script>
		</head>
		<body>
				<header>
						<a href="#"
							 hx-get="${API_URL}cards"
							 hx-swap="innerHTML"
							 hx-push-url="${API_URL}"
							 hx-target="#contentDiv">
						<h1>Chris Hughes dot Dev</h1>
						</a>
						<a href="https://github.com/Naokotani/">
								<img class="git-logo" alt="github logo" src="/images/github-mark-white.svg"/>
								Github
						</a>
				</header>
				<nav hx-get="${API_URL}blog"
						 hx-trigger="load delay:300ms"
						 class="linksBar"
						 hx-swap="outerHTML">
						<h2 class="post-header">Projects</h2>
				</nav>
				<div id="contentDiv"
						 hx-get="${API_URL}blog/{{it.route}}"
						 hx-trigger="load delay:300ms"
						 hx-swap="innerHTML"
						 hx-target="#contentDiv"></div>
		</body>
</html>
`
}
