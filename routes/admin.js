const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Category');
const Category = mongoose.model('categories');
require('../models/Post');
const Post = mongoose.model('posts');
const {eAdmin} = require('../helpers/eAdmin');

router.get('/', eAdmin, (req, res) => {
    res.render('admin/index');
});

router.get('/categories', eAdmin, (req, res) => {
    Category.find().sort({date: 'desc'}).then((categories) => {
        res.render('admin/categories', {categories: categories});
    }) .catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias');
        res.redirect('/admin');
    });    
});

router.get('/categories/add', eAdmin, (req, res) => {
    res.render('admin/addcategories');
});

router.post('/categories/new', eAdmin, (req, res) => {
    
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({text: 'Nome inválido.'});
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({text: 'Slug inválido.'});
    }
    if(req.body.nome.length < 2) {
        erros.push({text: 'Nome da categoria é muito pequeno.'});
    }
    if(erros.length > 0) {
        res.render('admin/addcategories', {erros: erros});
    } else {
        const newCategory = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Category( newCategory ).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!');
            res.redirect('/admin/categories')        
        }).catch((err) => {
            req.flash('error_msg', 'Ocorreu um erro ao salvar a categoria, tente novamente.')
            res.redirect('/admin');            
        });
    }    
});

router.get('/categories/edit/:id', eAdmin, (req, res) => {
    Category.findOne({_id: req.params.id}).then((category) => {
        res.render('admin/editcategories', {category: category});
    }).catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe.');
        res.redirect('/admin/categories');
    });    
}); 

router.post('/categories/edit', eAdmin, (req, res) => {    
    let erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({text: 'Nome inválido.'});
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({text: 'Slug inválido.'});
    }
    if(req.body.nome.length < 2) {
        erros.push({text: 'Nome da categoria é muito pequeno.'});
    }
    if(erros.length > 0) {
        res.render('admin/editcategories', {erros: erros});
    } else { 
        Category.findOne({_id: req.body.id}).then((category) => {
            category.nome = req.body.nome;
            category.slug = req.body.slug;    

            category.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso.');
                res.redirect('/admin/categories');
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao editar categoria.');
                res.redirect('/admin/categories')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao editar categoria.');
            res.redirect('/admin/categories');
        });  
    }          
}); 

router.post('/categories/delete', eAdmin, (req, res) => {
    Category.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria excluida com sucesso!');
        res.redirect('/admin/categories');
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao excluir categoria.');
        res.redirect('/admin/categories');
    })
});

router.get('/posts', eAdmin, (req, res) => {
    Post.find().populate('categoria').sort({data: 'desc'}).then((posts) => {
        res.render('admin/posts', {posts: posts});
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao listar postagens');
        res.redirect('/admin');
    });    
});

router.get('/posts/add', eAdmin, (req, res) => {
    Category.find().then((categories) => {
        res.render('admin/addposts', {categories: categories});
    }) .catch((err) => {
        req.flash('error_msg', 'Erro ao carregar formulário.');
        res.redirect('/admin');
    });    
});

router.post('/posts/new', eAdmin, (req, res) => {
    var erros = [];

    if(req.body.categoria == '0') {
        erros.push({text: 'Categoria inválida, registre uma categoria.'});
    }

    if(erros.length > 0) {
        res.render('admin/addposts', {erros: erros});
    } else {
        const newPost = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Post(newPost).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso.');
            res.redirect('/admin/posts');
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao salvar postagem.');
            res.redirect('admin/posts');
        });
    }
});

router.get('/posts/edit/:id', eAdmin, (req, res) => {
    Post.findOne({_id: req.params.id}).then((post) => {

        Category.find().then((categories) => {
            res.render('admin/editposts', {categories: categories, post: post});
        }).catch((err) => {
            req.flash('error.msg', 'Erro ao listar as categorias.');
            res.redirect('/admin/posts');
        });

    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar formulário de edição');
        res.redirect('/admin/posts');
    });    
});

router.post('/posts/edit', eAdmin, (req, res) => {
    Post.findOne({_id: req.body.id}).then((post) => {
        post.titulo = req.body.titulo;
        post.slug = req.body.slug;
        post.descricao = req.body.descricao;
        post.conteudo = req.body.conteudo;
        post.categoria = req.body.categoria;

        post.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso.');
            res.redirect('/admin/posts');
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao editar postagem.');
            res.redirect('/admin/posts');
        });

    }).catch((err) => {
        req.flash('error_msg', 'Erro ao salvar edição.');
        req.redirect('/admin/posts');
    });
});

router.get('/posts/delete/:id', eAdmin, (req, res) => {
    Post.remove({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem exluida com sucesso.')
        res.redirect('/admin/posts');
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao excluir postagem.');
        res.redirect('/admin/posts');
    });
});

module.exports = router;