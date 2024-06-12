const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agendamento = new Schema ({

    clienteId: [{
        type: mongoose.Types.ObjectId,
        ref: 'Cliente',
        
    }],
    servicoId: [{
        type: mongoose.Types.ObjectId,
        ref: 'Servico',
        
    }],
    estabelecimentoId: [{
        type: mongoose.Types.ObjectId,
        ref: 'Estabelecimento',
        
    }],
    data: {
        type:Date,
        default:null,
    },
    valor: {
        type:Number,
        default:null,
    }, 
   
    dataCadastro: {
        type:Date,
        default:Date.now,
    }
  
    
})



module.exports = mongoose.model('Agendamento', agendamento)