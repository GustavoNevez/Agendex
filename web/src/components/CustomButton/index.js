import React from 'react';
import { Button, Icon } from 'rsuite';

const CustomButton = ({
    label,
    icon,
    appearance = 'ghost',
    size = 'xs',
    color,
    gradient,
    block,
    disabled,
    loading,
    onClick,
    className = '',
    style,
}) => {
    const getButtonStyle = () => {
        if (gradient) {
            return {
                background: gradient === 'primary'
                    ? 'linear-gradient(45deg, #4f46e5, #7c3aed)'
                    : gradient,
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.3s ease',
                transform: 'translateY(0)',
                
                ...style
            };
        }

        return {
            ...style,
            ...(color ? {
                backgroundColor: appearance === 'primary' ? color : 'transparent',
                color: appearance === 'primary' ? 'white' : color,
                borderColor: color,
                transition: 'all 0.3s ease',
            } : {})
        };
    };

    return (
        <Button
            appearance={appearance}
            size={size}
            style={getButtonStyle()}
            disabled={disabled}
            loading={loading}
            block={block}
            onClick={onClick}
            className={`custom-button hover:shadow-lg hover:translate-y-[-2px] h-6  ${className}`}
        >
            {icon && <Icon icon={icon} className="mr-2" />}
            {label}
        </Button>
    );
};

export default CustomButton;
