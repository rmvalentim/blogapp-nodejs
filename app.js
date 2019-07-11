// Modulos
    const express = require('express');
    const handlebars = require('express-handlebars');
    const bodyParser = require('body-parser');
    const mongoose = require('mongoose');
    const path = require('path');
    const session = require('express-session');
    const flash = require('connect-flash');
    const passport = require('passport');
    require('./config/auth')(passport);
    require('./models/Post');
    const Post = mongoose.model('posts');
    require('./models/Category');
    const Category = mongoose.model('categories');

    const app = express();

    const admin = require('./routes/admin');
    const user = require('./routes/user');

// Configuracoes
    // Sessão
    app.use(session({
        secret: 'asdf1234lkjh0987',
        resave: true,
        saveUninitialized: true
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(flash());
    // Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        res.locals.error = req.flash('error');
        res.locals.user = req.user || null;
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
    app.get('/', (req, res) => {

        Post.find().populate('categoria').sort({date: 'desc'}).then((posts) => {
            res.render('index', {posts: posts});
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno.');
            res.redirect('/404');
        });
    });

    app.get('/posts/:slug', (req, res) => {
        Post.findOne({slug: req.params.slug}).then((post) => {
            if(post) {
                res.render('posts/index', {post: post});
            } else {
                req.flash('error_msg', 'Postagem não existe.');
                res.redirect('/');
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno');
            res.redirect('/');
        });
    });

    app.get('/categories', (req, res) => {
        Category.find().then((categories) => {
            res.render('categories/index', {categories: categories});
        }).catch((err) => {
            req.flash('error_msg', 'Erro interno ao listar categorias.');
            res.redirect('/');
        });
    });

    app.get('/categories/:slug', (req, res) => {
        Category.findOne({slug: req.params.slug}).then((category) => {
            if(category) {
                Post.find({categoria: category._id}).then((posts) => {
                    res.render('categories/posts', {posts: posts, category: category});
                }).catch((err) => {
                    req.flash('error_msg', 'Erro ao listar postagens.');
                    res.redirect('/');
                });
            } else{
                req.flash('error_msg', 'Categoria não existe.');
                res.redirect('/');
            }
        }).catch((err) => {
            req.flash('error_msg', 'Erro interno ao carregar página da categoria.');
            res.redirect('/');
        })
    });

    app.get('/404', (req, res) => {
        res.send('Erro 404!');
    });

    app.use('/admin', admin);
    app.use('/users', user);

// Outros
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server listen on port 3000.')    
});
