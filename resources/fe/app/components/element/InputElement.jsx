import React from "react";

const InputElement = ({style, type, placeholder, onChange, name, value, autoComplete, required}) => {
    return (
        <input
            className={style}
            type={type}
            placeholder={placeholder}
            onChange={onChange}
            name={name}
            value={value}
            autoComplete={autoComplete}
            required={required}

        />
    );
};

export default InputElement;
