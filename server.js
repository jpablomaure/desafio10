

import express from "express";
import session from "express-session";
import exphbs from 'express-handlebars';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const app = express();


app.use(express.urlencoded({extended: true}));
app.use(express.json());



app.set('views', 'src/views');
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');


app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 600000  // 10 minutos
    }
}))


const usuariosDB = [];

app.get('/', (req, res)=>{
    if (req.session.nombre) {
        res.redirect('/datos');
    } else {
        res.redirect('/login');
    }
})

app.get('/login', (req, res)=>{
    res.render('login.hbs');
})

app.get('/register', (req, res)=>{
    res.render('registro.hbs');
})

app.post('/login', (req, res)=>{
    const {nombre, password} = req.body;
    const existeUsuario = usuariosDB.find(usuario => usuario.nombre == nombre && usuario.password == password);

    if (!existeUsuario) {
        res.render('login-error.hbs')
    } else {
        req.session.nombre = nombre;
        res.redirect('/datos');
    }
})

app.get('/datos', (req, res)=>{
    if (req.session.nombre) {
        const datosUsuario = usuariosDB.find(usuario=>{
            return usuario.nombre == req.session.nombre
        })

        res.render('datos', {
            datos: datosUsuario,
        })
    } else {
        res.redirect('/login')
    }
})


app.post('/register', (req, res)=>{
    const {nombre, password, direccion } = req.body;
    
    const usuario = usuariosDB.find(usr => usr.nombre == nombre);
    if (usuario) {
        res.render('registro-error.hbs')
    } else {
        usuariosDB.push({nombre, password, direccion});
        res.render('login.hbs')
    }
})

app.get('/logout', (req, res)=> {
    req.session.destroy(err => {
        if (err) {
            throw err
        }
        res.redirect('/login');
    })
})


const PORT = process.env.PORT;
const server = app.listen(PORT, ()=>{
    console.log(`Servidor escuchando en puerto ${PORT}`);
})
server.on('error', error=>{
    console.error(`Error en el servidor ${error}`);
});

