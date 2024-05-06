const express = require('express');
const cors = require('cors');
require('./db/config');
const User = require('./db/user');
const Product = require('./db/product');
const jwt = require('jsonwebtoken');
const jwtKey = 'e-comm';

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//     console.log("uaw");
//     next();
// })

app.post('/register',async(req,resp)=>{
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    jwt.sign({result},jwtKey,{expiresIn:'2h'},(err,token)=>{
        if(err){
            resp.send({result:"Something went wrong, Please try after some time."})
        }
        resp.send({result,auth:token});
    })
})

app.post('/login',async (req,resp)=>{
    if(req.body.password && req.body.email){
        let user =await User.findOne(req.body).select("-password");
        if(user){
            jwt.sign({user},jwtKey,{expiresIn:'2h'},(err,token)=>{
                if(err){
                    resp.send({result:"Something went wrong, Please try after some time."})
                }
                resp.send({user,auth:token});
            })
        }else{
            resp.send({result:'No user Found'});
        }
    }else{
        resp.send({result:'No user Found'});
    }
})

app.post('/add-product',async (req,resp)=>{
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result);
})

app.get('/products',async(req,resp)=>{
    try {
        let products = await Product.find();
        if (products.length > 0) {
            resp.send(products);
        } else {
            resp.send({ result: 'No Product Found' });
        }
    } catch (error) {
        console.error(error);
        resp.status(500).send({ error: 'Internal Server Error' });
    }
})

app.delete('/product/:id',async (req,resp)=>{
    const result = await Product.deleteOne({_id:req.params.id});
    resp.send(result);
})

app.get('/product/:id',async (req,resp)=>{
    const result = await Product.findById({_id:req.params.id});
    resp.send(result);
    // resp.render('UpdateProduct.js',{result})
})

app.put('/product/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { name, price ,category ,company } = req.body;
        const result = await Product.findByIdAndUpdate(id, { name, price ,category ,company }, { new: true });
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/search/:key',async (req,resp)=>{
    let result = await Product.find({
        "$or":[
            {name:{$regex: req.params.key}},
            {category:{$regex: req.params.key}},
            {company:{$regex: req.params.key}}
        ]
    });
    resp.send(result);
});

app.get("/update/:id", async (req, res) => {
    console.log("update")
    let id = req.params.id; // Corrected
    console.log("this is id " + id)
    const result = await Product.findById(id);
    console.log(result)
    res.send(result); // Sending the result object as response
});

// app.get('/profile/:id',async (req,res)=>{
//     try {
//         const userId = req.params.id;
//         const user = await User.findById(userId).select('-password');

//         if (user) {
//             res.send({ user });
//         } else {
//             res.status(404).send({ result: 'No user found' });
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).send({ result: 'Something went wrong, please try again later.' });
//     }
// })

app.get('/profile/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');

        if (user) {
            res.json({ user });
        } else {
            res.status(404).json({ result: 'No user found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ result: 'Something went wrong, please try again later.' });
    }
});

app.listen(3000);

