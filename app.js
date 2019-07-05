// Modulos
    const express = require('express');
    const handlebars = require('express-handlebars');
    const bodyParser = require('body-parser');
    const mongoose = require('mongoose');
    const path = require('path');
    const session = require('express-session');
    const flash = require('connect-flash');
    const app = express();

    const admin = require('./routes/admin');

// Configuracoes
    // Sessão
    app.use(session({
        secret: 'asdf1234lkjh0987',
        resave: true,
        saveUninitialized: true
    }));
    app.use(flash());
    // Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        next();
    });

    // BodyParser
    app.use(bodyParser.urlencoded({extendes: true}));
    app.use(bodyParser.json());
    // Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');
    // Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/blogapp').then(() => {
        console.log('MongoDb Database Connected.');    
    }).catch((err) => {
        console.log(`Error on MongoDb Connection: ${err}`);        
    });

    // Public
    app.use(express.static(path.join(__dirname, 'public')));

// Rotas
    app.use('/admin', admin);

// Outros
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server listen on port 3000.')    
});
