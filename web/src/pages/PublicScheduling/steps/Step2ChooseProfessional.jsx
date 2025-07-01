import React from "react";
import { Icon } from "rsuite";
import CustomCard from "../../../components/Card/CustomCard";

const Step2ChooseProfessional = ({
  publicData,
  formState,
  setFormState,
  setStep,
  fetchAvailableDates,
}) => (
  <div className="p-4" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
    <h2 className="text-xl text-gray-900 font-bold mb-3 text-center">
      Escolha um profissional
    </h2>
    <div className="space-y-4">
      {publicData.profissionais.map((professional) => (
        <CustomCard
          key={professional.id}
          image={professional.foto}
          title={professional.nome}
          subtitle={professional.especialidade}
          onClick={() => {
            setFormState({ ...formState, profissionalId: professional.id });
            setStep(3);
            fetchAvailableDates();
          }}
          rightIcon={<Icon icon="angle-right" />}
          placeholder={<Icon icon="user" style={{ fontSize: 36 }} />}
        />
      ))}
    </div>
  </div>
);

export default Step2ChooseProfessional;
