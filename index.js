const express = require('express');
const path = require('path');
const mongoose =require('mongoose');
const fileupload = require('express-fileupload');
var bodyParser = require('body-parser');
const app = express();
const fs = require('fs');

var session = require('express-session');


//esquema pra pegar table especifica
const Posts = require('./Posts.js');
const users = require('./users.js');
//conectando com banco de dados
mongoose.connect('mongodb+srv://root:zUgJh5DLiHbrGhA5@cluster0.832we.mongodb.net/Portal?retryWrites=true&w=majority',{useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
    console.log("conectado com sucesso");
}).catch((error)=>{
    console.log(error.message)
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
 extended:true
}));

app.engine('html',require('ejs').renderFile)
app.set('view engine','html')
app.use('/assets',express.static(path.join(__dirname,'assets')))
app.set('views',path.join(__dirname,'/views'))

app.get('/',(req,res)=>{

    if(req.query.busca == null){
    //pegando dados da db
    Posts.find({}).sort({'_id':-1}).exec((err,posts)=>{
      posts = posts.map(function(val){
          return {
              titulo:val.titulo,
              conteudo:val.conteudo,
              descricao:val.conteudo,
              imagem:val.imagem,
              slug:val.slug,
              categoria:val.categoria,
              author:val.author,
              views:val.views,
          }
      })
    //pegando dados mais limitando
      Posts.find({}).sort({'_id':-1}).limit(3).exec((err,postsTop)=>{
        postsTop = postsTop.map(function(val){
            return {
                titulo:val.titulo,
                conteudo:val.conteudo,
                descricao:val.conteudo,
                imagem:val.imagem,
                slug:val.slug,
                categoria:val.categoria,
                author:val.author,
                views:val.views,
            }
        })
        res.render('home',{posts:posts,postsTop:postsTop})    

    })
})
    }else{
 //pegando query
        Posts.find({titulo:{$regex:req.query.busca,$options:"i"}},(err ,posts)=>{
            //foreach
            posts = posts.map((val)=>{
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricao:val.conteudo,
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria,
                    views: val.views
                    
                }
        })

    res.render('busca',{posts:posts,contagem:posts.length});

    })
} 
});

//deletar por id 
app.get('/admin/deletar/:id',(req,res)=>{
    Posts.deleteOne({_id:req.params.id}).then(()=>{
            res.redirect('/admin/home')
    })
})


//cadastrar no mongo
app.get('/admin/cadastro',(req,res)=>{
    let formato = req.files.arquivo.name.split('.');
    var img = "";
    if(formato[formato.length - 1] == "jpg"){
        img = new Date().getTime()+'.jpg'
        req.files.arquivo.mv(__dirname+ "/assets/images/"+img)
    }else{
        fs.unlinkSync(req.files.arquivo.tempFilePath)
    }



//cadastrar no mongo
    Posts.create({
        titulo:req.body.titulo_noticia,
        imagem:'http:/localhost:5000/public/images/'+img,
        categoria:"nenhuma",
        conteudo:req.body.noticia,
        slug:req.body.slug,
        author:"admin",
        views:0,
    })
    
      res.redirect('/admin/home')

})
   app.get('/:slug',(req,res)=>{
       //procurando um aquivo especifico pelo slug
    Posts.findOneAndUpdate({slug: req.params.slug},{$inc: {views:1}},{new:true},(err,resposta)=>{

        if(resposta != null){
            //puxando do banco de dados
            Posts.find({}).sort({'_id':-1}).limit(3).exec((err,postsTop)=>{
                postsTop = postsTop.map(function(val){
                    return {
                        titulo:val.titulo,
                        conteudo:val.conteudo,
                        descricao:val.conteudo,
                        imagem:val.imagem,
                        slug:val.slug,
                        categoria:val.categoria,
                        author:val.author,
                        views:val.views,
                    }
                })
      
        res.render('single',{noticias:resposta,postsTop:postsTop});
    })

    }else{
        //reidirecionar para home 
        res.redirect('/')
    }

   })
})

app.use(session({
    secret:'dhfjsdhfjshdfjjh99u',
    cookie:{maxAge:60000}
}))



//fazer login com a db
app.post('/admin/login',(req,res)=>{
    users.find({}).sort({'_id':-1}).exec((err,users)=>{
        users = users.map(function(val){
            if(val.user == req.body.user && val.password == req.body.password){
                 req.session.login = "matheus";
            }        
        })
            res.redirect('/admin/login')
    })
})

//verificao de login
app.get('/admin/login',(req,res)=>{
    if(req.session.login == null){
       res.render('login')
       
    }else{
     res.redirect('/admin/home')
    }
})


//pergar todos os dados

app.get('/admin/home',(req,res)=>{
    Posts.find({}).sort({'_id':-1}).exec((err,posts)=>{
        posts = posts.map(function(val){
            return {
                id:val._id,
                titulo:val.titulo,
                conteudo:val.conteudo,
                descricao:val.conteudo,
                imagem:val.imagem,
                slug:val.slug,
                categoria:val.categoria,
                author:val.author,
                views:val.views,
            }
        })
        res.render('painel',{posts:posts})    

    })
})



app.listen(3000,()=>{
    console.log('server rodando');
})