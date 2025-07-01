import React from "react";
import { Icon } from "rsuite";

const BottomNav = ({ currentScreen, setCurrentScreen }) => (
  <nav className="bg-white border-t border-gray-100 flex justify-around px-4 py-2 sticky bottom-0 shadow-sm lg:justify-center lg:gap-24">
    {[
      {
        screen: "inicio",
        icon: "home",
        label: "Início",
      },
      {
        screen: "agendar",
        icon: "clock-o",
        label: "Agendar",
      },
      {
        screen: "reservas",
        icon: "calendar",
        label: "Reservas",
      },
    ].map(({ screen, icon, label }) => {
      const isActive = currentScreen === screen;
      return (
        <button
          key={screen}
          onClick={() => setCurrentScreen(screen)}
          className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors duration-200 focus:outline-none
            ${
              isActive
                ? "text-violet-500"
                : "text-gray-500 hover:text-violet-400"
            }
          `}
        >
          <Icon icon={icon} className="text-[22px]" />
          <span className="text-[11px] font-medium mt-0.5">{label}</span>
        </button>
      );
    })}
  </nav>
);

export default BottomNav;
