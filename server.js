var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";
var dbo;

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
 var dbo = db.db("comics");
 var myobj = {"src":"imgSrc[0]", "title": "imgTitle[1]", "url":"imgUrl"};
  dbo.collection("hero_comics").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
 });
});



function lalit(_myobj){
 console.log(url, _myobj)
 MongoClient.connect(url, function(err, db) {
   if (err) throw err;
  var dbo = db.db("comics");
   dbo.collection("hero_comics").insertOne(_myobj, function(err, res) {
       if (err) throw err;
       console.log("1 document inserted");
       db.close();
  });
 });



}

app.get('/com', function(req, res){
  // Let's scrape Anchorman 2
  url = 'http://www.sjcomics.com/category/raj-comics/bankelal-comics/';

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      var title, release, rating;
      var json = {img:"", src:""};
      //var json = [];
      var html="";
      $('.two_column_item a').filter(function(){
         var imgUrl = $(this).attr('href');
         var imgSrc = $(this).children().children().attr("src")
         var imgTitle = $(this).attr("title")

         if(imgSrc){
         imgSrc = imgSrc.split("?").map(function (val) {
          return val;
         });
         imgTitle = imgTitle.split("to: ").map(function (val) {
          return val;
         });
         html += {"src":imgSrc[0], "title": imgTitle[1], "url":imgUrl};

         }
         lalit(html)
       })
       json.img=html;

       console.log(json)
    }
res.send(html)
    fs.writeFile('com.json', JSON.stringify(html, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
    })

    //res.send('Check your console!')
  })
})



app.get('/comics', function(req, res){
  // Let's scrape Anchorman 2
  url = 'http://www.sjcomics.com/main-nahin-sudhrunga-bankelal-rc-0731/';

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      var title, release, rating;
      var json = {items:""};
      //var json = [];
var html="";
      $('.gallery .gallery-item a img').filter(function(){
        var srcLength = $(this).length;
        //console.log(srcLength);

        for(var i=0; i < srcLength; i++){
         json.items = {'imgSrc':'"+$(this).attr("src")+"'};
        }

        //console.log(JSON.parse(html))
        json = html;



         //json = data.children().children().children().children();
      //   title = data.children().first().text().trim();
      //   release = data.children().last().children().last().text().trim();
      //
      //   json.title = title;
      //   json.release = release;
       })
      //
      // $('.ratingValue').filter(function(){
      //   var data = $(this);
      //   rating = data.text().trim();
      //
      //   json.rating = rating;
      // })
    }

    fs.writeFile('comics.json', JSON.stringify(json, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
    })

    res.send('Check your console!')
  })
})



app.get('/scrape', function(req, res){
  // Let's scrape Anchorman 2
  url = 'http://www.imdb.com/title/tt1229340/';

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      var title, release, rating;
      var json = { title : "", release : "", rating : ""};

      $('.title_wrapper').filter(function(){
        var data = $(this);
        title = data.children().first().text().trim();
        release = data.children().last().children().last().text().trim();

        json.title = title;
        json.release = release;
      })

      $('.ratingValue').filter(function(){
        var data = $(this);
        rating = data.text().trim();

        json.rating = rating;
      })
    }

    fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
    })

    res.send('Check your console!')
  })
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;
