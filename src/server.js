var express = require('express');
var path = require('path');
var exphbs  = require('express-handlebars');

const userRouter = require('./routers/user')

const port = process.env.port || 3000;
 
var app = express();

//Serves static files (we need it to import a css file)
app.use(express.static(path.join(__dirname, '/public')))

// view engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'))

app.engine( 'hbs', exphbs( {
  extname: 'hbs',
  defaultView: 'default',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));

// var router = express.Router();
 
// router.get('/', function(req, res, next) {
//     res.render('home', {layout: 'default', template: 'home-template'});
//   });

app.get('', (req, res)=>{
    res.render('home', {layout: 'main', data: {
      title : 'Home'
    }});
});

app.use('/user', userRouter)
 
//Makes the app listen to port 3000
app.listen(port, () => console.log(`App listening to port ${port}`));