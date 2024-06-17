import { useRef } from "react";

const useDebounce = <T>(cb: (...args: T[]) => void, delay: number) => {
    const timer = useRef<NodeJS.Timeout>();

    return (...args: T[]) => {
        if (timer.current) {
            clearTimeout(timer.current);
        }

        timer.current = setTimeout(() => {
            cb(...args);
        }, delay);
    };
};

export default useDebounce;