const express = require('express');
const router = express.Router();

const moment = require('moment');
const Turno = require('../models/turno');
const util = require('../services/util');
const Cliente = require('../models/cliente');
const Servico = require('../models/servico');
const Horario = require('../models/horario');
const Agendamento = require('../models/agendamento');
const Profissional = require('../models/profissional');
const _ = require('lodash');

router.post('/', async (req, res) => {
    try {
        const { servicoId, profissionalId, data, estabelecimentoId } = req.body;
       
        // Verificar se o serviço existe
        const servico = await Servico.findById(servicoId);
        if (!servico) {
            return res.json({ error: true, message: 'Serviço não encontrado' });
        }
       
        // Verificar se o profissional existe, está ativo e pertence ao estabelecimento
        const profissional = await Profissional.findOne({
            _id: profissionalId,
            status: 'A',
            estabelecimentoId: estabelecimentoId
        });
       
        if (!profissional) {
            return res.json({ 
                error: true, 
                message: 'Profissional não encontrado, inativo ou não pertence a este estabelecimento' 
            });
        }
       
        // Verificar se o profissional oferece este serviço
        const temServico = profissional.servicosId && 
                          profissional.servicosId.some(id => id.toString() === servicoId.toString());
        if (!temServico) {
            return res.json({ error: true, message: 'Este profissional não oferece o serviço solicitado' });
        }
       
        // Calcular a duração do serviço em minutos
        const duracao = util.horaParaMinutos(moment(servico.duracao).format('HH:mm'));
       
        // Verificar se o profissional já está agendado neste horário
        const dataInicio = moment(data);
        const dataFim = moment(data).add(duracao, 'minutes');
       
        // Simplificar a verificação de conflitos
        const agendamentosConflitantes = await Agendamento.find({
            profissionalId,
            status: 'A',
            data: {
                $lt: dataFim.toDate(),
                $gt: moment(dataInicio).subtract(duracao, 'minutes').toDate()
            }
        });
       
        if (agendamentosConflitantes && agendamentosConflitantes.length > 0) {
            return res.json({
                error: true,
                message: 'O profissional já possui um agendamento neste horário',
                conflitos: agendamentosConflitantes
            });
        }
       
        // Se chegou até aqui, pode criar o agendamento
        const agendamento = new Agendamento({
            servicoId,
            profissionalId,
            estabelecimentoId,
            data,
            duracao,
            status: 'A'
        });
        
        await agendamento.save();
        res.json({ error: false, agendamento });
    } catch (err) {
        console.error(err);
        res.json({ error: true, message: err.message });
    }
});
router.post('/dias-disponiveis', async (req, res) => {
    try {
        const { data, estabelecimentoId, servicoId, clienteId } = req.body;
        
        // Verificar se o serviço existe
        const servico = await Servico.findById(servicoId).select('duracao');
        if (!servico) {
            return res.json({ error: true, message: 'Serviço não encontrado' });
        }
        
        // Calcular duração do serviço em minutos
        const servicoDuracao = util.horaParaMinutos(moment(servico.duracao).format('HH:mm'));
        const servicoPartes = util.partesMinutos(
            moment(servico.duracao),
            moment(servico.duracao).add(servicoDuracao, 'minutes'),
            util.DURACAO_SERVICO, false
        ).length;

        // Buscar a configuração de turno do estabelecimento (agora um único documento)
        const turnoConfig = await Turno.findOne({ estabelecimentoId });
        
        // Se não houver configuração cadastrada, retornamos erro
        if (!turnoConfig) {
            return res.json({ 
                error: true, 
                message: 'Não há horários cadastrados para este estabelecimento' 
            });
        }

     

        let agenda = [];
        let ultimoDia = moment(data);

        // Buscar dias disponíveis nos próximos 30 dias (limite de 7 dias na agenda)
        for (let i = 0; i <= 30 && agenda.length <= 7; i++) {
            const diaDaSemana = moment(ultimoDia).day(); // 0 = Domingo, 6 = Sábado
            
            // Buscar configuração do dia da semana no Map 'dias'
            const diaConfig = turnoConfig.dias.get(String(diaDaSemana));
            
            // Se existe configuração para este dia e está ativo
            if (diaConfig && diaConfig.ativo && diaConfig.periodos && diaConfig.periodos.length > 0) {
                let horariosDoDia = [];

                // Mapear todos os períodos disponíveis para este dia
                for (let periodo of diaConfig.periodos) {
                    if (periodo.ativo) {
                        horariosDoDia = [
                            ...horariosDoDia,
                            ...util.partesMinutos(
                                util.horariosDoDia(ultimoDia, periodo.inicio),
                                util.horariosDoDia(ultimoDia, periodo.fim),
                                util.DURACAO_SERVICO
                            )
                        ];
                    }
                }

                // Buscar agendamentos existentes para este dia
                const agendamentos = await Agendamento.find({
                    estabelecimentoId,
                    status: 'A',
                    data: {
                        $gte: moment(ultimoDia).startOf('day'),
                        $lte: moment(ultimoDia).endOf('day'),
                    },
                }).select('data duracao -_id');

                // Converter agendamentos para horários ocupados
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

                // Verificar se há slots suficientes para a duração do serviço
                horariosLivres = horariosLivres.filter((horario) => horario.length >= servicoPartes);
                           
                horariosLivres = horariosLivres.map((slot) =>
                    slot.filter(
                      (horario, index) => slot.length - index >= servicoPartes
                    )
                );
             
                const horariosSeparados = _.flatten(horariosLivres).map(horario => [horario]);
                
                // Adicionar à agenda apenas se houver horários disponíveis
                if (horariosSeparados.length > 0) {
                    agenda.push({ [ultimoDia.format('YYYY-MM-DD')]: horariosSeparados });
                }
            }
            ultimoDia = moment(ultimoDia).add(1, 'day');
        }
        
        res.json({ error: false, agenda });
    } catch (err) {
        console.error('Erro ao buscar horários disponíveis do estabelecimento:', err);
        res.json({ error: true, message: err.message });
    }
});

router.post('/filtro', async (req,res) =>{
    try {
        const { periodo, estabelecimentoId } = req.body;
        const startDate = moment(periodo.inicio).startOf('day');
        const endDate = moment(periodo.final).endOf('day');
    
        const agendamentos = await Agendamento.find({ estabelecimentoId })
            .where('data').gte(startDate).lte(endDate)
            .populate([
                { path: 'servicoId', select: 'titulo duracao' },
                { path: 'clienteId', select: 'nome' }
            ]);
    
        res.json({ error: false, agendamentos });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});
router.delete('/:agendamentoId', async (req, res) => {
    try {
        const { agendamentoId } = req.params;
        if (!agendamentoId) {
            return res.json({ error: true, message: 'ID do agendamento não fornecido.' });
        }
        const agendamento = await Agendamento.findByIdAndUpdate(agendamentoId, {status:'E'});
        if (!agendamento) {
            return res.json({ error: true, message: 'Agendamento não encontrado.' });
        }
        res.json({ error: false, message: 'Agendamento excluído com sucesso.' });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.put('/concluido/:agendamentoId', async (req, res) => {
    try {
        const { agendamentoId } = req.params;
        if (!agendamentoId) {
            return res.json({ error: true, message: 'ID do agendamento não fornecido.' });
        }
        const agendamento = await Agendamento.findByIdAndUpdate(agendamentoId, {status:'F'});
        if (!agendamento) {
            return res.json({ error: true, message: 'Agendamento não encontrado.' });
        }
        res.json({ error: false, message: 'Agendamento finalizado com sucesso.' });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});


router.post('/relatorio', async (req, res) => {
    try {
        const { periodo, estabelecimentoId } = req.body;
        const startDate = moment(periodo.inicio).startOf('day');
        const endDate = moment(periodo.final).endOf('day');

        // Filtra agendamentos com status 'F' dentro do período especificado
        const agendamentos = await Agendamento.find({ 
            estabelecimentoId,
            status: 'F',  // Filtra apenas agendamentos com status 'F'
            data: {
                $gte: startDate.toDate(),
                $lte: endDate.toDate()
            }
        }).select('data duracao valor').populate([
            { path: 'servicoId', select: 'titulo duracao' },
            { path: 'clienteId', select: 'nome' }
        ]);

        // Calcula o total de dinheiro
        const totalDinheiro = agendamentos.reduce((sum, agendamento) => sum + agendamento.valor, 0);

        // Monta o objeto relatorio
        const relatorio = {
            numeroAgendamentos: agendamentos.length,
            totalDinheiro,
            agendamentos,
        };

        res.json({ error: false, relatorio });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

module.exports = router;