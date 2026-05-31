import React from "react";
import { cx } from "../lib/classNames";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
    tone?: "neutral" | "success" | "warning" | "danger";
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
    return <span className={cx("badge", tone !== "neutral" && `badge--${tone}`, className)} {...props} />;
}
