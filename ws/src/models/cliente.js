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
    },
    email: {
        type: String,
        default:null,
    },
    senha: {
        type: String,
        default: null,
    },
   
    
    status:{
        type:String,
        enum:['A','I','E'],
        default:'A',
    },
    
    endereco: {
        cidade:String,
        uf:String,
        cep:String,
        numero:String,
        pais:String,
        bairo:String,
        rua:String,
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