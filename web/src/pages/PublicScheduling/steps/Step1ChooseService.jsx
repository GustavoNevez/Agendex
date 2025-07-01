import React from "react";
import { Icon } from "rsuite";
import moment from "moment";
import CustomCard from "../../../components/Card/CustomCard"; // import CustomCard

function getServiceDurationFromUtc(utcDateString) {
  if (!utcDateString) return "";
  const end = moment(utcDateString);
  const start = moment(utcDateString).startOf("day");
  const diffMinutes = end.diff(start, "minutes");
  if (diffMinutes < 60) return `${diffMinutes}min`;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  let result = [];
  if (hours > 0) result.push(`${hours}h`);
  if (minutes > 0) result.push(`${minutes}min`);
  return result.length > 0 ? result.join(" ") : "0min";
}

const Step1ChooseService = ({
  publicData,
  formState,
  setFormState,
  setStep,
  type,
}) => (
  <div className="p-4" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
    <h2 className="text-xl text-gray-900 font-bold mb-3 text-center">
      Escolha um serviço
    </h2>
    <div className="space-y-4">
      {publicData.servicos.map((service) => (
        <CustomCard
          key={service.id}
          image={service.foto}
          title={service.titulo}
          subtitle={`Duração: ${getServiceDurationFromUtc(service.duracao)}`}
          price={service.preco}
          onClick={() => {
            setFormState({ ...formState, servicoId: service.id });
            setStep(type === "p" ? 3 : 2);
          }}
          rightIcon={<Icon icon="angle-right" />}
          placeholder={service.titulo.charAt(0)}
        />
      ))}
    </div>
  </div>
);

export default Step1ChooseService;
