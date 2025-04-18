const express = require('express');
const router = express.Router();
const Turno = require('../models/turno');
const moment = require('moment');

// Função auxiliar para criar turnos padrão
const createDefaultTurnos = async (estabelecimentoId) => {
    try {
        // Turnos padrão: Segunda à sexta (8h às 12h, 13h às 18h) e Sábado (8h às 12h)
        const defaultTurnos = [
            {
                estabelecimentoId,
                nome: 'Manhã (Seg-Sex)',
                dias: [1, 2, 3, 4, 5], // Segunda a sexta
                inicio: new Date('2025-01-01T08:00:00.000Z'),
                fim: new Date('2025-01-01T12:00:00.000Z'),
                status: 'A'
            },
            {
                estabelecimentoId,
                nome: 'Tarde (Seg-Sex)',
                dias: [1, 2, 3, 4, 5], // Segunda a sexta
                inicio: new Date('2025-01-01T13:00:00.000Z'),
                fim: new Date('2025-01-01T18:00:00.000Z'),
                status: 'A'
            },
            {
                estabelecimentoId,
                nome: 'Manhã (Sábado)',
                dias: [6], // Sábado
                inicio: new Date('2025-01-01T08:00:00.000Z'),
                fim: new Date('2025-01-01T12:00:00.000Z'),
                status: 'A'
            }
        ];
        
        return await Turno.insertMany(defaultTurnos);
    } catch (error) {
        console.error('Erro ao criar turnos padrão:', error);
        throw error;
    }
};

// Função auxiliar para verificar conflitos de turnos
const verificarConflitosTurno = async (novoTurno) => {
    // Se o turno não estiver ativo, não precisa verificar conflitos
    if (novoTurno.status !== 'A') {
        return { temConflito: false };
    }
    
    console.log('Verificando conflitos para turno:', JSON.stringify(novoTurno));
    
    // Definir o escopo (apenas por estabelecimento)
    const escopo = { estabelecimentoId: novoTurno.estabelecimentoId };
    
    // Buscar todos os turnos ativos do mesmo estabelecimento
    const turnosAtivos = await Turno.find({
        ...escopo,
        status: 'A',
        // Excluir o próprio turno se estiver sendo atualizado
        ...(novoTurno._id ? { _id: { $ne: novoTurno._id } } : {})
    });
    
    console.log(`Encontrados ${turnosAtivos.length} turnos ativos no mesmo estabelecimento`);
    
    // Não estamos verificando conflitos de tempo para turnos, apenas garantindo
    // que não existam múltiplos turnos com o mesmo nome
    for (const turno of turnosAtivos) {
        if (turno.nome === novoTurno.nome) {
            console.log(`Conflito encontrado: turno com nome "${novoTurno.nome}" já existe`);
            return { 
                temConflito: true, 
                mensagem: `Já existe um turno com o nome "${novoTurno.nome}"`
            };
        }
    }
    
    console.log('Nenhum conflito encontrado');
    return { temConflito: false };
};

// Obter todos os turnos de um estabelecimento
router.get('/estabelecimento/:estabelecimentoId', async (req, res) => {
    try {
        const { estabelecimentoId } = req.params;
        const turnos = await Turno.find({
            estabelecimentoId,
        });
        
        // Se não houver turnos, criar turnos padrão
        if (turnos.length === 0) {
            console.log(`Nenhum turno encontrado para o estabelecimento ${estabelecimentoId}. Criando turnos padrão.`);
            try {
                const defaultTurnos = await createDefaultTurnos(estabelecimentoId);
                return res.json({ error: false, turnos: defaultTurnos });
            } catch (defaultError) {
                console.error('Erro ao criar turnos padrão:', defaultError);
                // Continuar com array vazio em caso de erro
                return res.json({ error: true, message: defaultError.message });
            }
        }
        
        res.json({ error: false, turnos });
    } catch (err) {
        console.error('Erro ao buscar turnos:', err);
        res.json({ error: true, message: err.message });
    }
});

// Criar um novo turno
router.post('/', async (req, res) => {
    try {
        const novoTurno = req.body;
        
        // Verificar conflitos de turnos
        const { temConflito, mensagem } = await verificarConflitosTurno(novoTurno);
        
        if (temConflito) {
            return res.json({ 
                error: true, 
                message: mensagem
            });
        }
        
        const turno = await new Turno(novoTurno).save();
        res.json({ error: false, turno });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

// Atualizar um turno existente
router.put('/:turnoId', async (req, res) => {
    try {
        const { turnoId } = req.params;
        const turno = req.body;
        
        // Verificar conflitos se o turno estiver ativo
        if (turno.status === 'A') {
            const { temConflito, mensagem } = await verificarConflitosTurno({ ...turno, _id: turnoId });
            
            if (temConflito) {
                return res.json({ 
                    error: true, 
                    message: mensagem
                });
            }
        }

        await Turno.findByIdAndUpdate(turnoId, turno);
        res.json({ error: false, message: 'Turno atualizado com sucesso' });
    } catch (err) {
        console.error('Erro ao atualizar turno:', err);
        res.json({ error: true, message: err.message });
    }
});

// Excluir um turno
router.delete('/:turnoId', async (req, res) => {
    try {
        const { turnoId } = req.params;
        await Turno.findByIdAndDelete(turnoId);
        res.json({ error: false, message: "Turno excluído com sucesso!" });
    } catch (err) {
        console.error('Erro ao excluir turno:', err);
        res.json({ error: true, message: err.message });
    }
});

// Ativar/desativar um turno
router.put('/status/:turnoId', async (req, res) => {
    try {
        const { turnoId } = req.params;
        const { status } = req.body;
        
        if (!['A', 'I'].includes(status)) {
            return res.json({ error: true, message: 'Status inválido. Use A para ativo ou I para inativo.' });
        }
        
        const turno = await Turno.findById(turnoId);
        if (!turno) {
            return res.json({ error: true, message: 'Turno não encontrado' });
        }
        
        // Se estiver ativando o turno, verificar conflitos
        if (status === 'A') {
            const novoTurno = { ...turno.toObject(), status: 'A' };
            const { temConflito, mensagem } = await verificarConflitosTurno(novoTurno);
            
            if (temConflito) {
                return res.json({ 
                    error: true, 
                    message: mensagem
                });
            }
        }
        
        await Turno.findByIdAndUpdate(turnoId, { status });
        res.json({ error: false, message: `Turno ${status === 'A' ? 'ativado' : 'desativado'} com sucesso` });
    } catch (err) {
        console.error('Erro ao alterar status do turno:', err);
        res.json({ error: true, message: err.message });
    }
});

module.exports = router;