var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/com', function(req, res){
  url = 'http://www.sjcomics.com/category/raj-comics/bankelal-comics/';

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      var title, release, rating;
      var json = {"comicsTitle":[]};
      //var json = [];
      var html='';
      var counter = 1;
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

         jsonTitle = counter;
         console.log(jsonTitle);
         //jsonTitle = jsonTitle[1];

         json.comicsTitle.push({"src":imgSrc[0], "title": imgTitle[1], "url":imgUrl})

         getDataForComics(imgUrl, jsonTitle);
         counter++

         }
       })
    }
res.send(json)
    fs.writeFile('com.json', JSON.stringify(json, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
    })

  })
})


function getDataForComics($url, $title){
 //
 // app.get('/comics', function(req, res){
  url = $url;
  comicTitle = $title;

console.log($url,comicTitle)
   request(url, function(error, response, html){
     if(!error){
       var $ = cheerio.load(html);

       var title, release, rating;
       var json = {"comics":[]};
       var html="";
       $('.gallery .gallery-item a img').filter(function(){
         var srcLength = $(this).length;
         console.log(srcLength);
         var $imgSrc = $(this).attr('src');
             $imgSrc = $imgSrc.split('?');
         var $comma = ",";
         for(var i=0; i < srcLength; i++){
          json.comics.push({"imgSrc":$imgSrc[0]});
         }
        })
     }
 //res.send(json)
     fs.writeFile(comicTitle+'.json', JSON.stringify(json, null, 4), function(err){
       console.log('File successfully written! - Check your project directory for the '+comicTitle+'.json file');
     })


   })
 //})

}




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
