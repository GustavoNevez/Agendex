moment = require('moment');

module.exports = {
    DURACAO_SERVICO:30,

    horaParaMinutos: (horaMinuto) => {
        
        
        const [hora, minuto] = horaMinuto.split(':');
        return parseInt(parseInt(hora)*60 + parseInt(minuto));
        
    },

    partesMinutos: (inicio, fim,duracao) => {
        const partes = [];
        let count = 0;
        inicio = moment(inicio);
        fim = moment(fim)     
        while(fim > inicio) {
            partes.push(inicio.format('HH:mm'));
            inicio = inicio.add(duracao, 'minutes');
            count++;
        }
        return partes;
    },
    

    horariosDoDia: (data, hora) => {
        // Properly parse the time string using a specific format
        // hora is expected to be in "HH:MM" format (e.g., "08:00")
        const formattedDate = moment(data).format('YYYY-MM-DD');
        return moment(`${formattedDate} ${hora}`, 'YYYY-MM-DD HH:mm');
    },

    splitByValue: (array, value) => {
        let newArray = [[]];
        array.forEach((item) => {
          if (item !== value) {
            newArray[newArray.length - 1].push(item);
          } else {
            newArray.push([]);
          }
        });
        return newArray;
      },
};