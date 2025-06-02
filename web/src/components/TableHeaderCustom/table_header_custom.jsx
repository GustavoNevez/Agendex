import React from "react";
import { InputGroup, Input, Icon } from "rsuite";
import CustomButton from "../Button/button_custom";

const TableHeaderCustom = ({
  title,
  searchPlaceholder = "Buscar...",
  searchKeyword,
  onSearchChange,
  buttonLabel,
  buttonIcon,
  onButtonClick,
  isMobile,
}) => {
  return (
    <div className="px-6 py-4 bg-gray-50 border-b">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <h2 className="font-semibold text-gray-800 text-xl">{title}</h2>
          <div className="w-full md:w-80">
            <InputGroup inside>
              <Input
                placeholder={searchPlaceholder}
                value={searchKeyword}
                onChange={onSearchChange}
                className="w-full"
              />
              <InputGroup.Button>
                <Icon icon="search" />
              </InputGroup.Button>
            </InputGroup>
          </div>
        </div>
        {buttonLabel && (
          <CustomButton
            label={buttonLabel}
            icon={buttonIcon}
            appearance="primary"
            gradient="primary"
            className="h-9 text-lg"
            block={isMobile}
            onClick={onButtonClick}
          />
        )}
      </div>
    </div>
  );
};

export default TableHeaderCustom;
