import React from "react";
import { cx } from "../lib/classNames";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    action?: React.ReactNode;
};

export function Card({ title, action, className, children, ...props }: CardProps) {
    return (
        <div className={cx("card", className)} {...props}>
            {title ? (
                <div className="card-header">
                    <h3>{title}</h3>
                    {action}
                </div>
            ) : null}
            {children}
        </div>
    );
}
