import React from "react";
import { cx } from "../lib/classNames";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
    error?: string;
};

export function Input({ label, hint, error, className, ...props }: InputProps) {
    return (
        <label className="input-group">
            {label && <span className="input-label">{label}</span>}
            <input className={cx("input-field", className)} {...props} />
            {error ? <span className="input-error">{error}</span> : null}
            {hint && !error ? <span className="input-hint">{hint}</span> : null}
        </label>
    );
}
