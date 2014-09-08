# Election

This is a typical MEAN (mongodb, express, angualar, node) application ( minus the angualar )
and as such it is run in the normal way.

## Get code and dependencies

Clone or download the code.

Rename _config.js.dist_ to _config.js_ and configure it.

Get NodeJS packages with [NPM](http://en.wikipedia.org/wiki/Npm_(software))

    $ npm install

Get resources with [Bower](http://bower.io/)

    $ bower install

## RUN

Make sure you have [MongoDB](https://www.mongodb.org/) installed and running. I like to run this command
from the root project directory

    $ mongod --dbpath data/

This makes MongoDB use the _data/_ directory in this project to store the BSON objects.

Now, you can 1) run the app.js file, 2) run the bin/www file or 3) use NPM, all will fire upt the application.

    $ node app.js
        //or
    $ bin/www
        //or
    $ npm start

![Alt Text](http://upload.wikimedia.org/wikipedia/en/1/1e/Election_1999film.jpg)

Maybe someday this application can convert video files, and the I will need this

    $ brew install ffmpeg --with-libvpx --with-libvorbis --with-fdk-aacc

## Some random resources and links

* http://cwbuecheler.com/web/tutorials/2013/node-express-mongo/
* http://paularmstrong.github.io/swig/docs/

### Content source

* http://kosningasaga.wordpress.com/sveitarstjornarkosningar/sveitarstjornarkosningar-2014-frettayfirlit/
* http://en.wikipedia.org/wiki/Election_(1999_film)


### Range header

* http://blog.begriffs.com/2014/03/beyond-http-header-links.html
* http://otac0n.com/blog/2012/11/21/range-header-i-choose-you.html
* http://javiersaldana.com/2013/04/29/pagination-with-activeresource.html
* http://tools.ietf.org/html/rfc6648
* http://blog.begriffs.com/2014/03/beyond-http-header-links.html
* http://en.wikipedia.org/wiki/List_of_HTTP_header_fields

### Social media

* http://davidwalsh.name/facebook-meta-tags
* http://www.iacquire.com/blog/18-meta-tags-every-webpage-should-have-in-2013
