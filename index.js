const express = require('express')
const app = express()
const port = 3322
const fs = require('node:fs');


app.get('/blog', (req, res) => {
fs.readdir('/home/naokotani/Documents/denote/blog/', function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 

    let links = ""
    for (file in files) {
      links += `<a href="http://localhost:3322/blog/${files[file]}">${files[file]}</a>`
    }
    console.log(links);
    res.send(links)
});

})

app.get('/blog/*', (req, res) => {
  const slug = req.params[0];
  const path = '/home/naokotani/Documents/denote/blog/'

  fs.readFile(path+slug, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    res.send(data);
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

