import { all } from "redux-saga/effects";
import agendamento from "./modules/schedule/schedule_saga";
import clientes from "./modules/client/client_sagas";
import servico from "./modules/service/service_sagas";
import relatorio from "./modules/report/report_sagas";
import profissional from "./modules/professional/professional_sagas";
import turno from "./modules/shift/shift_sagas";
import publicSagas from "./modules/public/sagas";
import establishmentSagas from "./modules/establishment/establishment_sagas";

export default function* rootSaga() {
  return yield all([
    agendamento,
    clientes,
    servico,
    relatorio,
    profissional,
    turno,
    publicSagas,
    establishmentSagas,
  ]);
}
