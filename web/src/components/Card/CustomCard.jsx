import React from "react";
import { Icon } from "rsuite";

const CustomCard = ({
  image,
  title,
  subtitle,
  price,
  onClick,
  rightIcon = <Icon icon="angle-right" />,
  placeholder,
  style = {},
  className = "",
}) => (
  <div
    onClick={onClick}
    className={
      "flex items-stretch justify-between p-0 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md active:bg-gray-100 transition overflow-hidden " +
      className
    }
    style={{ minHeight: 110, height: 128, maxHeight: 144, ...style }}
  >
    {image ? (
      <div
        className="flex-shrink-0"
        style={{ width: 112, minWidth: 112, height: "100%" }}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          style={{ display: "block", height: "100%" }}
          draggable={false}
        />
      </div>
    ) : (
      <div
        className="flex-shrink-0 bg-gray-200 flex items-center justify-center text-gray-600 text-3xl font-bold"
        style={{ width: 112, minWidth: 112, height: "100%" }}
      >
        {placeholder || (title && title.charAt(0))}
      </div>
    )}
    <div className="flex flex-col justify-center flex-1 px-4 py-2 min-w-0">
      <div className="font-bold pb-1 truncate">{title}</div>
      {subtitle && (
        <div className="text-sm text-gray-500 pb-1 truncate">{subtitle}</div>
      )}
      {price !== undefined && (
        <div className="text-sm truncate">R$ {Number(price).toFixed(2)}</div>
      )}
    </div>
    <div className="flex items-center pr-4">{rightIcon}</div>
  </div>
);

export default CustomCard;
