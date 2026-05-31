import React from "react";
import { cx } from "../lib/classNames";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md";
};

export function Button({
    variant = "primary",
    size = "md",
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cx("button", `button--${variant}`, `button--${size}`, className)}
            {...props}
        />
    );
}
