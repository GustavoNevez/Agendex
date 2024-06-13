const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cliente = new Schema ({
    estabelecimentoId: {
        type: mongoose.Types.ObjectId,
        ref: 'Estabelecimento',
    },
    nome: {
        type: String,
        default:null,
        required:true,
    },
    email: {
        type: String,
        default:null,
        required:true,
    },
    senha: {
        type: String,
        default: null,
        required:true,
    },
   
    
    status:{
        type:String,
        enum:['A','I','E'],
        default:'A',
        required:true,
    },
    
    endereco: {
        cidade:String,
        uf:String,
        cep:String,
        numero:String,
        pais:String,
        bairo:String,
        rua:String,
        required:true,
    },
    documento: {
        tipo: {
            type: String,
            enum: ['rg', 'cpf'],
            default: 'cpf',
            required:true,
        },
        numero: {
            type: String,
            required:true,
        },
    },
    dataCadastro: {
        type:Date,
        default:Date.now,
    },
    telefone: String,
   
})



module.exports = mongoose.model('Cliente', cliente)