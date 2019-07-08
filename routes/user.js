const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/User');
const User = mongoose.model('users');

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

    }
    
});

module.exports = router;