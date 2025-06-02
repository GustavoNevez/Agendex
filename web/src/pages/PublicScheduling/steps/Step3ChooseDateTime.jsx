import React from 'react';
import moment from 'moment';

const Step3ChooseDateTime = ({
    publicData,
    formState,
    setFormState,
    availableHours,
    setAvailableHours,
    loading,
    setLoading,
    hasFetchedAvailability,
    setHasFetchedAvailability,
    renderDatePicker,
    renderTimeBlocks,
    renderUserForm,
    ServiceSummaryCard
}) => (
    <div className="p-4" style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
        {/* Date Selection */}
        <div className="mb-6">
            <h3 className="text-xl text-gray-900 font-bold mb-3">Escolha uma data:</h3>
            {renderDatePicker()}
        </div>
        {/* Time Slots */}
        {formState.data && (
            <div>
                <h3 className="text-xl text-gray-900 font-bold mb-3">Horários disponíveis:</h3>
                <p className="text-gray-500 mb-3">{moment(formState.data).format('dddd, DD [de] MMMM')}</p>
                {renderTimeBlocks()}
            </div>
        )}
    </div>
);

export default Step3ChooseDateTime;
