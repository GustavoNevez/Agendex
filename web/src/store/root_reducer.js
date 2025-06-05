import { combineReducers } from "redux";
import agendamento from "./modules/schedule/schedule_reducer";
import clientes from "./modules/client/client_reducer";
import servico from "./modules/service/service_reducer";
import relatorio from "./modules/report/report_reducer";
import profissional from "./modules/professional/professional_reducer";
import turno from "./modules/shift/shift_reducer";
import publicReducer from "./modules/public/reducer";
import establishment from "./modules/establishment/establishment_reducer";

export default combineReducers({
  agendamento,
  clientes,
  servico,
  relatorio,
  profissional,
  turno,
  public: publicReducer,
  establishment,
});
