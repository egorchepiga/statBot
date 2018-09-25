import React from 'react';

const SwitchButton = ({ id, labelLeft, labelRight, isChecked, action, disabled, theme, className}) => (
    <div className={className + (disabled ? ' switch-button disabled' : ' switch-button')}>
        {labelLeft &&
        ((typeof labelLeft === 'string') ? <Label id={id} name={labelLeft} /> : labelLeft)}
        <Toggle
            id={id}
            isChecked={isChecked}
            action={action}
            disabled={disabled}
            theme={theme}/>
        {labelRight &&
        ((typeof labelRight === 'string') ? <Label id={id} name={labelRight} /> : labelRight)}
    </div>
);

SwitchButton.defaultProps = {
    isChecked: false,
    disabled: false,
};

const Toggle = ({ id, isChecked, action, disabled, theme }) => (
    <div className="toggle-container">
        <input
            id={id}
            className="input"
            type="checkbox"
            disabled={disabled}
            checked={isChecked}
            onChange={action}
        />
        <label className={"toggle "+ (theme? theme : "")} htmlFor={id}></label>
    </div>
);

Toggle.defaultProps = {
    action: () => {},
    isChecked: false,
    disabled: false,
};


const Label = ({ name, id }) => (
    <label className="label" htmlFor={id}>{name}</label>
);

export default SwitchButton;
