const express = require('express');
const router = express.Router();
const Estabelecimento = require('../models/estabelecimento');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json')

router.post('/register', async (req,res) =>{
    try {
        const existingUser = await Estabelecimento.findOne({ email: req.body.email });
        if (existingUser) {
                return res.json({ error:'E-mail já está em uso' });
        }

        const User = await new Estabelecimento(req.body).save();
        User.senha = undefined;
        const token=jwt.sign({
            id:User._id,
          
            
           
        }, authConfig.secret ,{
            expiresIn: 86400
        });
      
        return res.json({user:{id:User._id,nome:User.nome},token});
    } catch(err){
        res.json({error:true, message: err.message})
    }
});

router.post('/auth', async(req,res) => {
    try {
        const {email,senha} = req.body;
        const user = await Estabelecimento.findOne({ email }).select("+senha");
        if (!user) {
            return res.json({
                error: "Email nao encontrado",
               
            });
        }

        // Verifica se a senha fornecida está correta
        if (!await bcrypt.compare(senha, user.senha)) {
            return res.json({
                error: "Senha inválida"
               
            });
        }

        user.senha = undefined;

        const token=jwt.sign({
            id:user._id,
          
            
           
        }, authConfig.secret ,{
            expiresIn: 86400
        });
      
        return res.json({user:{id:user._id,nome:user.nome},token});
        
    } catch(err) {
        res.json({
            error:"Erro no servidor"
        })
    }
    
});


module.exports = router;