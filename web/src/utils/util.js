export default {
    horaParaMinutos: (horaMinuto) => {
        
        
        const [hora, minuto] = horaMinuto.split(':');
        return parseInt(parseInt(hora)*60 + parseInt(minuto));
        
    },

}