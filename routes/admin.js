const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Category');
const Category = mongoose.model('categories');

router.get('/', (req, res) => {
    res.render('admin/index');
});

router.get('/categories', (req, res) => {
    Category.find().sort({date: 'desc'}).then((categories) => {
        res.render('admin/categories', {categories: categories});
    }) .catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias');
        res.redirect('/admin');
    });    
});

router.get('/categories/add', (req, res) => {
    res.render('admin/addcategories');
});

router.post('/categories/new', (req, res) => {
    
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

router.get('/categories/edit/:id', (req, res) => {
    Category.findOne({_id: req.params.id}).then((category) => {
        res.render('admin/editcategories', {category: category});
    }).catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe.');
        res.redirect('/admin/categories');
    });    
}); 

router.post('/categories/edit', (req, res) => {    
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

router.post('/categories/delete', (req, res) => {
    Category.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria excluida com sucesso!');
        res.redirect('/admin/categories');
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao excluir categoria.');
        res.redirect('/admin/categories');
    })
});

module.exports = router;