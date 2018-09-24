var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var mysql = require('mysql');
var db = require("./data/data");
var _URL = require("./data/comics");
var bodyParser = require('body-parser');
var path = require("path");
var mkdirp = require('mkdirp');
var Sitemapper = require('sitemapper');
 


var con = mysql.createConnection(db);
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);

  });
};

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));


app.get('/getAllComics', function (req, res) {
    con.query('SELECT * FROM all_comics_url', function (error, results, fields) {
        if (error) throw error;
        return res.send({ data: results});
    });
});

app.get('/getAllComicsUrl', function (req, res) {
    con.query('SELECT * FROM all_comics_url', function (error, results, fields) {
        if (error) throw error;
        return res.send({ data: results});
    });
});


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

app.get('/checktable/:id', function (req, res) {
    con.query('show tables like "'+req.params.id+'"', function (error, results, fields) {
      
        if (error){
          return res.send({ "status": false});
         throw error; 
        }else{
          if(results.length > 0){
              return res.send({ "status": true});
          }else{
              return res.send({ "status": false});
          }
          
        }
        
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





app.get('/all_comics/:id', function(req, res){
  if(req.params.id === 'all'){
    url = _URL.siteUrl
  }else{
  url = _URL.siteUrl+"/page/"+req.params.id  
  }
  
  console.log(url)

var _PAGECOUNT,_IMAGEURL, _IMAGETITLE, _IMAGETHUMB;

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);
      

$('.page_nav_wrap ul li:nth-last-child(2)').filter(function(){
        if($(this).children('a').attr('href')){
          var pageNum = $(this).children('a').attr('href').split('/page/');
          _PAGECOUNT = pageNum[1].split('/');
          _PAGECOUNT = _PAGECOUNT[0];
        }
        
      })

      $('.two_column_item article').filter(function(){
        if($(this).children('a').attr('href')){
          _IMAGEURL = $(this).children('a').attr('href').split(".com/");
          _IMAGEURL = _IMAGEURL[1];
          _IMAGETITLE = $(this).children('a').attr('title').split('to:');
          _IMAGETITLE = _IMAGETITLE[1];
          _IMAGETHUMB = $(this).children("a").children("figure").children("img").attr("src").split("?resize");
          _IMAGETHUMB = _IMAGETHUMB[0];
          var post = {
            src:_IMAGETHUMB,
            title: _IMAGETITLE,
            url:_IMAGEURL,
            total_rows: _PAGECOUNT
          }; 
          
        var query = con.query('INSERT INTO all_comics SET ?', post, function(err, result) {console.log(result); });

        }
        
      })

      
    }

  })
  res.send({'msg':'done'})
})






app.get('/all_comics_url/', function(req, res){
  url = _URL.allUrl;
console.log(url)

var sitemap = new Sitemapper();
 
sitemap.fetch(url).then(function(sites) {
  for(var i=0; i < sites.sites.length; i++){
  
  var sitesUrl = sites.sites[i].split(".com/");
      sitesUrl = sitesUrl[1];
      console.log(sitesUrl)

          var post = {
            url:sitesUrl
          }; 
    
    var query = con.query('INSERT INTO all_comics_url SET ?', post, function(err, result) {console.log(result); });
    
  }
});
//con.end();

})
       





















  app.get('/getcom/:id/:comic', function(req, res){

      let id = _URL.siteUrl+req.params.id;
      let url = _URL.siteUrl+req.params.comic;
      var _pathURL = "downloaded_comics/"+req.params.comic;
      //var _IMAGE_FOLDER = mkdirp(_pathURL);    
 
      //res.send(_IMAGE_FOLDER);
 
if (!fs.existsSync(_pathURL)){
    fs.mkdirSync(_pathURL);
    console.log("done dire")
}


  
      var sql = "CREATE TABLE `comics`.`"+req.params.id+"` ( `id` INT NOT NULL AUTO_INCREMENT , `img` TEXT NOT NULL, PRIMARY KEY (`id`))";
     con.query(sql, function(err, result){
      if(err){
        res.send(err);
        //con.end()

      }

     });

console.log(url)

   request(url, function(error, response, html){
     if(!error){
       var $ = cheerio.load(html);

       
       
       
       $('.gallery .gallery-item a img').filter(function(){
         var srcLength = $(this).length;
         var $imgSrc = $(this).attr('src');
             $imgSrc = $imgSrc.split('?');
         var $comma = ",";
         for(var i=0; i < srcLength; i++){
          var post = {
            img: $imgSrc[0]
            }  
         var _IMAGE_NAME = path.basename($imgSrc[0]);
         var query = con.query('INSERT INTO `'+req.params.id+'` SET ?', post, function(err, result) {
          if(!err){

          }
         });
        
          download($imgSrc[0], _pathURL+"/"+_IMAGE_NAME, function(){
           console.log('done');
            //con.end();
          });

         }
        })
     }
//     con.end();
  res.send({"msg":"done"})
   })
 })


app.listen('8080')
console.log('Magic happens on port 8080');
exports = module.exports = app;
