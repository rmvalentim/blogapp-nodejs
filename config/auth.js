const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Bcrypt = require('bcryptjs');

// Model de usuario
require('../models/User');
const User = mongoose.model('users');

module.exports = (passport) => {
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done)=> {
        User.findOne({email: email}).then((user) => {
            if(!user) {
                return done(null, false, {message: 'Esta conta não existe'});
            }

            Bcrypt.compare(senha, user.senha, (err, batem) => {
                if(batem) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Senha incorreta'});
                }
            })
        })
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        })
    });
}