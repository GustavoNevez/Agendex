const express = require('express');
const router = express.Router();
const Profissional = require('../models/profissional');
const Horario = require('../models/horario');
const Agendamento = require('../models/agendamento');
const Servico = require('../models/servico');
const moment = require('moment');
const util = require('../services/util');
const _ = require('lodash');

router.post("/", async (req, res) => {
    try {
        const { email, estabelecimentoId } = req.body;
        
        // Check if professional already exists with this email in this establishment
        const existingProfissional = await Profissional.findOne({ 
            email, 
            estabelecimentoId
        });

        if (existingProfissional) {
            return res.json({ error: true, message: 'Este e-mail já está cadastrado para este estabelecimento!' });
        }

        const profissional = await new Profissional(req.body).save();
        res.json({ error: false, profissional });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.get('/estabelecimento/:estabelecimentoId', async (req, res) => {
    try {
        const profissionais = await Profissional.find({
            estabelecimentoId: req.params.estabelecimentoId,
            status: { $ne: 'E' },
        });
        
        res.json({
            error: false, 
            profissionais: profissionais.map((p) => ({
                id: p._id,
                nome: p.nome,
                email: p.email,
                telefone: p.telefone,
                especialidade: p.especialidade,
                servicosId: p.servicosId,
                status: p.status,
                dataCadastro: p.dataCadastro
            }))
        });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.get('/servico/:servicoId', async (req, res) => {
    try {
        const profissionais = await Profissional.find({
            servicosId: req.params.servicoId,
            status: 'A'
        });
        
        res.json({
            error: false, 
            profissionais: profissionais.map((p) => ({
                id: p._id,
                nome: p.nome,
                especialidade: p.especialidade
            }))
        });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.put("/:id/:estabelecimentoId", async (req, res) => {
    try {
        const { id, estabelecimentoId } = req.params;
     
        const profissional = await Profissional.findOne({ 
            _id: id, 
            estabelecimentoId 
        });
  
        if (!profissional) {
            return res.json({ 
                error: true, 
                message: 'Profissional não encontrado ou não pertence ao estabelecimento.' 
            });
        }
        
        await Profissional.findByIdAndUpdate(id, req.body);
        res.json({ error: false, message: 'Profissional atualizado com sucesso!' });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.delete('/remove/:id', async (req, res) => {
    try {
        await Profissional.findByIdAndUpdate(req.params.id, { status: 'E' });
        res.json({ error: false });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.post('/dias-disponiveis', async (req, res) => {
    try {
        const { data, profissionalId, servicoId, estabelecimentoId } = req.body;
        
        // Verificar se o profissional existe e está ativo
        const profissional = await Profissional.findOne({
            _id: profissionalId,
            status: 'A'
        });
        
        if (!profissional) {
            return res.json({ error: true, message: 'Profissional não encontrado ou inativo' });
        }
        
        // Verificar se o profissional oferece este serviço
        if (!profissional.servicosId.includes(servicoId)) {
            return res.json({ error: true, message: 'Este profissional não oferece o serviço solicitado' });
        }
        
        // Buscar o serviço para obter a duração
        const servico = await Servico.findById(servicoId).select('duracao');
        if (!servico) {
            return res.json({ error: true, message: 'Serviço não encontrado' });
        }
        
        // Primeiro, buscar TODOS os horários disponíveis para o serviço no estabelecimento
        const horariosServico = await Horario.find({ 
            estabelecimentoId,
            tipoServico: { $in: [servicoId] }
        });
        
        // Se não tiver nenhum horário para o serviço, buscar todos os horários
        let horarios = horariosServico.length > 0 ? horariosServico : await Horario.find({ estabelecimentoId });
        
        // Filtrar apenas os horários que o profissional pode atender
        // (ou retornando todos se não houver configuração específica para o profissional)
        const horariosProfissional = await Horario.find({ 
            estabelecimentoId,
            profissionalId
        });
        
        // Se o profissional tem horários específicos, filtrar por eles
        if (horariosProfissional.length > 0) {
            horarios = horarios.filter(horario => {
                // Se o horário é específico para este profissional
                if (horario.profissionalId && horario.profissionalId.toString() === profissionalId) {
                    return true;
                }
                
                // Se o horário não tem profissional específico, verificar se existe
                // um horário do profissional que coincida com este período
                return horariosProfissional.some(hp => {
                    const mesmosDias = hp.dias.some(dia => horario.dias.includes(dia));
                    const horarioInicio = moment(hp.inicio);
                    const horarioFim = moment(hp.fim);
                    const servicoInicio = moment(horario.inicio);
                    const servicoFim = moment(horario.fim);
                    
                    return mesmosDias && 
                           ((horarioInicio <= servicoFim) && (horarioFim >= servicoInicio));
                });
            });
        }
        
        let agenda = [];
        let ultimoDia = moment(data);
        
        // Calcular duração do serviço em minutos
        const servicoDuracao = util.horaParaMinutos(moment(servico.duracao).format('HH:mm'));
        const servicoPartes = util.partesMinutos(
            moment(servico.duracao),
            moment(servico.duracao).add(servicoDuracao, 'minutes'),
            util.DURACAO_SERVICO, 
            false
        ).length;
        
        // Procurar horários disponíveis pelos próximos 365 dias ou até encontrar 7 dias com horários
        for (let i = 0; i <= 365 && agenda.length <= 7; i++) {
            const partesValidos = horarios.filter((horario) => {
                const diaSemanaDisponivel = horario.dias.includes(moment(ultimoDia).day());
                return diaSemanaDisponivel;
            });
            
            if (partesValidos.length > 0) {
                let horariosDoDia = [];
                
                // Calcular todos os slots disponíveis para o dia
                for (let espaco of partesValidos) {
                    const inicio = util.horariosDoDia(ultimoDia, espaco.inicio);
                    const fim = util.horariosDoDia(ultimoDia, espaco.fim);
                    const partes = util.partesMinutos(inicio, fim, util.DURACAO_SERVICO);
                    
                    horariosDoDia = [
                        ...horariosDoDia,
                        ...partes
                    ];
                }
                
                // Buscar agendamentos deste profissional para este dia
                const agendamentos = await Agendamento.find({
                    profissionalId,
                    estabelecimentoId,
                    status: 'A',
                    data: {
                        $gte: moment(ultimoDia).startOf('day'),
                        $lte: moment(ultimoDia).endOf('day'),
                    },
                }).select('data duracao -_id');
                
                // Mapear horários ocupados
                let horariosOcupados = agendamentos.map((agendamento) => ({
                    inicio: moment(agendamento.data),
                    final: moment(agendamento.data).add(agendamento.duracao, 'minutes'), 
                }));
                
                horariosOcupados = horariosOcupados.map((horario) =>
                    util.partesMinutos(horario.inicio, horario.final, util.DURACAO_SERVICO)
                ).flat();
                
                // Filtrar horários livres
                let horariosLivres = util.splitByValue(horariosDoDia.map((horario) => {
                    return horariosOcupados.includes(horario) ? '-' : horario;
                }), '-').filter(space => space.length > 0);
                
                // Garantir que só retorne slots com duração suficiente para o serviço
                horariosLivres = horariosLivres.filter((horario) => horario.length >= servicoPartes);
                horariosLivres = horariosLivres.map((slot) =>
                    slot.filter(
                        (horario, index) => slot.length - index >= servicoPartes
                    )
                );
                
                // Formatar para retornar ao cliente
                const horariosSeparados = _.flatten(horariosLivres).map(horario => [horario]);
                agenda.push({ [ultimoDia.format('YYYY-MM-DD')]: horariosSeparados });
            }
            
            ultimoDia = moment(ultimoDia).add(1, 'day');
        }
        
        res.json({ error: false, agenda });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

module.exports = router;