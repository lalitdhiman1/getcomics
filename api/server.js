var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var mysql = require('mysql');
var db = require("./data/data");
const bodyParser = require('body-parser');

//console.log(db)


var con = mysql.createConnection(db);
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/getMainComics', function (req, res) {
    con.query('SELECT * FROM mainprofile', function (error, results, fields) {
        if (error) throw error;
        return res.send({ data: results});
    });
});




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
         var imgSrc = $(this).children().children().attr("src");
         var imgTitle = $(this).attr("title");

         if(imgSrc){
         imgSrc = imgSrc.split("?").map(function (val) {
          return val;
         });
         imgTitle = imgTitle.split("to: ").map(function (val) {
          return val;
         });
         if(imgUrl){
         imgUrl = imgUrl.split(".com").map(function (val) {
          return val;
         });
       }
          var post = {
            src:imgSrc[0],
            title: imgTitle[1],
            url:imgUrl[1]
          };
  
 
var query = con.query('INSERT INTO mainprofile SET ?', post, function(err, result) {console.log(result); });
         console.log(json);
         return false;
         //getDataForComics(imgUrl, jsonTitle);

         }
         
       })
    }
res.send(json)
    fs.writeFile('com.json', JSON.stringify(json, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
    })

  })
})


//function getDataForComics($url, $title){
 //
  app.get('/getcom/:id/:comic', function(req, res){
      let id = "http://www.sjcomics.com/"+req.params.id;
      let url = "http://www.sjcomics.com/"+req.params.comic;
     // var sql = "CREATE TABLE `comics`.`"+req.params.id+"` ( `id` INT NOT NULL AUTO_INCREMENT , `img` TEXT NOT NULL, PRIMARY KEY (`id`))";
     // con.query(sql)
  // url = $url;
  // comicTitle = $title;

//console.log($url,comicTitle)

   request(url, function(error, response, html){
     if(!error){
       var $ = cheerio.load(html);

       var title, release, rating;
       var json = {"comics":[]};
       var html="";
       $('.gallery .gallery-item a img').filter(function(){
         var srcLength = $(this).length;
         var $imgSrc = $(this).attr('src');
             $imgSrc = $imgSrc.split('?');
         var $comma = ",";
         for(var i=0; i < srcLength; i++){

          //json.comics.push({"imgSrc":$imgSrc[0]});
          var post = {
            img: $imgSrc[0]
          } 
          console.log(post) 
          var query = con.query('INSERT INTO `23` SET ?', post, function(err, result) {console.log(result); });
         }
        })
     }

       
       
       
     console.log(json)
     
 res.send(json)
     fs.writeFile("comicTitle", JSON.stringify(json, null, 4), function(err){
       console.log('File successfully written!');
     })


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
