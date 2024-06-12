const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const Schema = mongoose.Schema;

const estabelecimento = new Schema ({
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
        select:false,
    },
    telefone: {type: String,
        default:null,
    },
 
    
    dataCadastro: {
        type: Date,
        default: Date.now,
    }
})

estabelecimento.pre("save", async function(next)  {
    const hash = await bcryptjs.hash(this.senha, 10);
    this.senha = hash;
    
})

module.exports = mongoose.model('Estabelecimento', estabelecimento)