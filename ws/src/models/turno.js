const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const turno = new Schema({
    estabelecimentoId: {
        type: mongoose.Types.ObjectId,
        ref: 'Estabelecimento',
        required: true,
    },
    nome: {
        type: String,
        required: true,
    },
    dias: {
        type: [Number], // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        required: true,
    },
    inicio: {
        type: Date,
        required: true,
    },
    fim: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['A', 'I'],  // A = Ativo, I = Inativo
        default: 'A',
        required: true,
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Turno', turno);