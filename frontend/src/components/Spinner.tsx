import { cx } from "../lib/classNames";

type SpinnerProps = {
    size?: number;
    className?: string;
};

export function Spinner({ size = 24, className }: SpinnerProps) {
    return <div className={cx("spinner", className)} style={{ width: size, height: size }} />;
}
