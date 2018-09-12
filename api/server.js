var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var mysql = require('mysql');
var db = require("./data/data");
var _URL = require("./data/comics");
var bodyParser = require('body-parser');

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

app.get('/getComics/:id', function (req, res) {
    con.query('SELECT * FROM '+req.params.id, function (error, results, fields) {
        if (error) throw error;
        return res.send({ data: results});
    });
});



app.get('/com', function(req, res){
  url = _URL.mainUrl;

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      var title, release, rating;
      var json = {"comicsTitle":[]};
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
         return false;
         }
         
       })
    }
res.send(json)

  })
})

  app.get('/getcom/:id/:comic', function(req, res){

      let id = _URL.siteUrl+req.params.id;
      let url = _URL.siteUrl+req.params.comic;
      var sql = "CREATE TABLE `comics`.`"+req.params.id+"` ( `id` INT NOT NULL AUTO_INCREMENT , `img` TEXT NOT NULL, PRIMARY KEY (`id`))";
     con.query(sql);
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
          var post = {
            img: $imgSrc[0]
          } 
          console.log('INSERT INTO `'+req.params.id+'` SET ?', post) 
          var query = con.query('INSERT INTO `'+req.params.id+'` SET ?', post, function(err, result) {console.log(result); });
         }
        })
     }
 res.send(json)
   })
 })


app.listen('8080')
console.log('Magic happens on port 8080');
exports = module.exports = app;
