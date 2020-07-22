var express = require('express');
var path = require('path');
var exphbs  = require('express-handlebars');
var bodyParser  = require('body-parser');
var cookieParser = require('cookie-parser')
var moment = require('moment')

const userRouter = require('./routers/user')
const homeRouter = require('./routers/home')
const doctorRouter = require('./routers/doctor')
const appointmentRouter = require('./routers/appointment')

const port = process.env.port || 3000;
 
var app = express();

app.use(cookieParser())

//Serves static files (we need it to import a css file)
app.use(express.static(path.join(__dirname, '/public')))

// view engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'))

// var hbs = exphbs.create({
//   extname: 'hbs',
//   defaultView: 'default',
//   layoutsDir: __dirname + '/views/layouts/',
//   partialsDir: __dirname + '/views/partials/',
//   // Specify helpers which are only registered on this instance.
//   helpers: {
//       foo: function () { return 'FOO!'; },
//       bar: function () { return 'BAR!'; }
//   }
// });

app.engine( 'hbs', exphbs({
  extname: 'hbs',
  defaultView: 'default',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/',
  helpers: {
    formatDate: function (date, format) {
        return moment(date).format(format);
    }
  }
}));

//app.engine('hbs', hbs.engine);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

require('./db/config')

// app.get('', auth, (req, res)=>{
//     res.render('home',  
//     { 
//       layout: 'main', 
//       title : 'Dashboard',
//       user : req.user.toJSON()});
// });

app.use('/', homeRouter)
app.use('/user', userRouter)
app.use('/doctor', doctorRouter)
app.use('/appointment', appointmentRouter)
 
//Makes the app listen to port 3000
app.listen(port, () => console.log(`App listening to port ${port}`));