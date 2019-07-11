const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/User');
const User = mongoose.model('users');
const Bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/register', (req, res) =>{
    res.render('users/register');
});

router.post('/register', (req, res) => {
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({text: 'Nome inválido.'});
    } 

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({text: 'E-mail inválido.'});
    } 
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({text: 'Senha inválido.'});
    } 

    if(req.body.senha.length < 4) {
        erros.push({text: 'Senha muito curta.'});
    } 

    if(req.body.senha != req.body.senha2 ) {
        erros.push({text: 'Senhas não coincidem.'});
    } 

    if(erros.length > 0) {
        res.render('users/register', {erros: erros});
    } else {
        User.findOne({email: req.body.email}).then((user) => {
            if(user) {
                req.flash('error_msg', 'Conta já existente com este e-mail.');
                res.redirect('/users/register');
            } else {

                const newUser = new User({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });

                Bcrypt.genSalt(10, (err, salt) => {
                    Bcrypt.hash(newUser.senha, salt, (err, hash) => {
                        if(err) {
                            req.flash('error_msg', 'Erro ao salvar usuário');
                            res.redirect('/');
                        }

                        newUser.senha = hash;

                        newUser.save().then(() => {
                            req.flash('success_msg', 'Usuário criado com sucesso!');
                            res.redirect('/');
                        }).catch((err) => {
                            req.flash('error_msg', 'Erro ao criar usuário, tente novamente.');
                            res.redirect('/');
                        });
                    });
                });
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno.');
            res.redirect('/');
        });
    }
    
});

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Logout realizado com sucesso.');
    res.redirect('/');
});

module.exports = router;