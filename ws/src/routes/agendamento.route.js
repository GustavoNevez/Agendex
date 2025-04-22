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
        const { servicoId, profissionalId, data, estabelecimentoId, clienteId } = req.body;
       
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
            clienteId,
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
        const { data, estabelecimentoId, servicoId, clienteId, profissionalId } = req.body;
        console.log('1. Dados recebidos:', { data, estabelecimentoId, servicoId, clienteId, profissionalId });
        
        // Verificar se o serviço existe
        const servico = await Servico.findById(servicoId).select('duracao');
        if (!servico) {
            console.log('Serviço não encontrado');
            return res.json({ error: true, message: 'Serviço não encontrado' });
        }
        
        console.log('2. Serviço encontrado:', servico);
        
        // Calcular duração do serviço em minutos
        const servicoDuracao = util.horaParaMinutos(moment(servico.duracao).format('HH:mm'));
        console.log('3. Duração do serviço em minutos:', servicoDuracao);
        
        const servicoPartes = util.partesMinutos(
            moment(servico.duracao),
            moment(servico.duracao).add(servicoDuracao, 'minutes'),
            util.DURACAO_SERVICO, false
        ).length;
        console.log('4. Número de slots necessários para o serviço:', servicoPartes);

        // Buscar a configuração de turno do estabelecimento
        const turnoConfig = await Turno.findOne({ estabelecimentoId });
        
        // Se não houver configuração cadastrada, retornamos erro
        if (!turnoConfig) {
            console.log('Configuração de turno não encontrada');
            return res.json({ 
                error: true, 
                message: 'Não há horários cadastrados para este estabelecimento' 
            });
        }
        
        console.log('5. Configuração de turno encontrada para o estabelecimento');

        let agenda = [];
        let ultimoDia = moment(data);
        console.log('6. Data inicial de busca:', ultimoDia.format('YYYY-MM-DD'));

        // Buscar dias disponíveis nos próximos 30 dias (limite de 7 dias na agenda)
        for (let i = 0; i <= 30 && agenda.length <= 7; i++) {
            const dataFormatada = ultimoDia.format('YYYY-MM-DD');
            const diaDaSemana = moment(ultimoDia).day(); // 0 = Domingo, 6 = Sábado
            
            // Buscar configuração do dia da semana no Map 'dias'
            const diaConfig = turnoConfig.dias.get(String(diaDaSemana));
            
            // Se existe configuração para este dia e está ativo
            if (diaConfig && diaConfig.ativo && diaConfig.periodos && diaConfig.periodos.length > 0) {
                console.log(`\n7. Processando dia: ${dataFormatada} (${diaDaSemana})`);
                
                let horariosDoDia = [];

                // Mapear todos os períodos disponíveis para este dia
                for (let periodo of diaConfig.periodos) {
                    if (periodo.ativo) {
                        const inicioHorarios = util.horariosDoDia(ultimoDia, periodo.inicio);
                        const fimHorarios = util.horariosDoDia(ultimoDia, periodo.fim);
                        const ultimoHorarioPossivel = moment(fimHorarios).subtract(servicoDuracao, 'minutes');
                        
                        const horariosPeriodo = util.partesMinutos(
                            inicioHorarios,
                            ultimoHorarioPossivel,
                            util.DURACAO_SERVICO,
                            true
                        );
                        
                        horariosDoDia = [...horariosDoDia, ...horariosPeriodo];
                    }
                }
                
                console.log('8. Total de horários possíveis no dia:', horariosDoDia.length);

                // Buscar agendamentos existentes para este dia
                const query = {
                    estabelecimentoId,
                    status: 'A',
                    data: {
                        $gte: moment(ultimoDia).startOf('day'),
                        $lte: moment(ultimoDia).endOf('day'),
                    }
                };
                
                if (profissionalId) {
                    query.profissionalId = profissionalId;
                }
                
                const agendamentos = await Agendamento.find(query).select('data duracao -_id');
                console.log('9. Agendamentos encontrados:', agendamentos.length);
                
                // Log de cada agendamento - sem entrar em loop
                if (agendamentos.length > 0) {
                    const resumoAgendamentos = agendamentos.map(a => ({
                        horario: moment(a.data).format('HH:mm'),
                        duracao: a.duracao,
                        fim: moment(a.data).add(a.duracao, 'minutes').format('HH:mm')
                    }));
                    console.log('10. Detalhes dos agendamentos:', resumoAgendamentos);
                }

                // Converter agendamentos para horários ocupados
                let horariosOcupados = agendamentos.map((agendamento) => ({
                    inicio: moment(agendamento.data),
                    final: moment(agendamento.data).add(agendamento.duracao, 'minutes'), 
                }));

                const horariosOcupadosExpanded = horariosOcupados.map((horario) =>
                    util.partesMinutos(horario.inicio, horario.final, util.DURACAO_SERVICO)
                ).flat();
                
                console.log('11. Total de slots ocupados:', horariosOcupadosExpanded.length);

                // Filtrar horários livres
                let horariosLivres = util.splitByValue(horariosDoDia.map((horario) => {
                    return horariosOcupadosExpanded.includes(horario) ? '-' : horario;
                }), '-').filter(space => space.length > 0);
                
                console.log('12. Grupos de horários livres encontrados:', horariosLivres.length);
                
                // Resumo dos grupos de horários livres
                const resumoGrupos = horariosLivres.map(grupo => ({
                    tamanho: grupo.length,
                    inicio: moment(grupo[0]).format('HH:mm'),
                    fim: moment(grupo[grupo.length - 1]).format('HH:mm'),
                    suficiente: grupo.length >= servicoPartes ? 'Sim' : 'Não'
                }));
                console.log('13. Resumo dos grupos livres:', resumoGrupos);

                // Verificar se há slots suficientes para a duração do serviço
                horariosLivres = horariosLivres.filter((horario) => horario.length >= servicoPartes);
                console.log('14. Grupos com tamanho suficiente:', horariosLivres.length);
                           
                // Filtrar para horários iniciais válidos
                horariosLivres = horariosLivres.map((slot) =>
                    slot.filter(
                        (horario, index) => slot.length - index >= servicoPartes
                    )
                );
                
                // Teste de conflito para cada horário inicial considerado válido
                const todosFlatSlots = _.flatten(horariosLivres);
                console.log('15. Total de horários iniciais considerados válidos:', todosFlatSlots.length);
                
                // Verificar se cada horário inicial pode acomodar o serviço sem conflitos
                const conflitos = todosFlatSlots.filter(horarioInicial => {
                    // Verificar se todos os slots necessários para este horário estão realmente livres
                    for (let j = 0; j < servicoPartes; j++) {
                        const horarioSlot = moment(horarioInicial).add(j * util.DURACAO_SERVICO, 'minutes');
                        if (horariosOcupadosExpanded.some(ocupado => 
                            moment(ocupado).isSame(horarioSlot)
                        )) {
                            return true; // Encontrou conflito
                        }
                    }
                    return false; // Não há conflitos
                });
                
                if (conflitos.length > 0) {
                    console.log('⚠️ ALERTA: Encontrados ' + conflitos.length + ' horários com possíveis conflitos!');
                    console.log('Exemplos de conflitos:', conflitos.slice(0, 3).map(h => moment(h).format('HH:mm')));
                }
             
                const horariosSeparados = _.flatten(horariosLivres).map(horario => [horario]);
                
                // Adicionar à agenda apenas se houver horários disponíveis
                if (horariosSeparados.length > 0) {
                    console.log('16. Horários finais disponíveis:', horariosSeparados.length);
                    console.log('Exemplos:', horariosSeparados.slice(0, 5).map(h => moment(h[0]).format('HH:mm')));
                    
                    agenda.push({ [ultimoDia.format('YYYY-MM-DD')]: horariosSeparados });
                } else {
                    console.log('16. Nenhum horário disponível para este dia');
                }
            }
            
            ultimoDia = moment(ultimoDia).add(1, 'day');
        }
        
        console.log('\n17. RESULTADO FINAL: ' + agenda.length + ' dias na agenda');
        
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

// Novo endpoint para buscar agendamentos dos próximos 7 dias
router.get('/proximos-sete-dias/:estabelecimentoId', async (req, res) => {
    try {
        const { estabelecimentoId } = req.params;
        
        // Calcular datas: hoje até 7 dias depois
        const startDate = moment().startOf('day');
        const endDate = moment().add(7, 'days').endOf('day');
        
        // Buscar agendamentos ativos no período, populando cliente, serviço e profissional
        const agendamentos = await Agendamento.find({ 
            estabelecimentoId: estabelecimentoId, // Corrigido: sem usar $elemMatch
            status: 'A',
            data: {
                $gte: startDate.toDate(),
                $lte: endDate.toDate()
            }
        })
        .populate('clienteId', 'nome')
        .populate('servicoId', 'titulo duracao')
        .populate('profissionalId', 'nome')
        .sort({ data: 1 }); // Ordenar por data crescente
        
        // Formata a resposta para retornar apenas os nomes/títulos em vez de arrays
        const formattedAgendamentos = agendamentos.map(agendamento => {
            const plainAgendamento = agendamento.toObject();
            
            // Extrair os dados do cliente, serviço e profissional
            let cliente = null;
            if (plainAgendamento.clienteId && plainAgendamento.clienteId.length > 0) {
                cliente = {
                    nome: plainAgendamento.clienteId[0].nome,
                    _id: plainAgendamento.clienteId[0]._id
                };
            }
            
            let servico = null;
            if (plainAgendamento.servicoId && plainAgendamento.servicoId.length > 0) {
                servico = {
                    titulo: plainAgendamento.servicoId[0].titulo,
                    duracao: plainAgendamento.servicoId[0].duracao,
                    _id: plainAgendamento.servicoId[0]._id
                };
            }
            
            let profissional = null;
            if (plainAgendamento.profissionalId && plainAgendamento.profissionalId.length > 0) {
                profissional = {
                    nome: plainAgendamento.profissionalId[0].nome,
                    _id: plainAgendamento.profissionalId[0]._id
                };
            }
            
            return {
                _id: plainAgendamento._id,
                cliente: cliente,
                servico: servico,
                profissional: profissional,
                data: plainAgendamento.data,
                valor: plainAgendamento.valor,
                duracao: plainAgendamento.duracao,
                status: plainAgendamento.status,
                dataCadastro: plainAgendamento.dataCadastro
            };
        });
        console.log(formattedAgendamentos);
        
        res.json({ error: false, agendamentos: formattedAgendamentos });
    } catch (err) {
        console.error('Erro ao buscar agendamentos dos próximos 7 dias:', err);
        res.json({ error: true, message: err.message });
    }
});

module.exports = router;