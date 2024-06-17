import { useRef } from "react";

const useDebounce = <T, K>(cb: (...args: T[]) => Promise<K>, delay: number) => {
    const timer = useRef<NodeJS.Timeout>();

    return (...args: T[]): Promise<K> => {
        return new Promise((resolve) => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
    
            timer.current = setTimeout(() => {
                cb(...args).then(resolve);
            }, delay); 
        });
    };
};

export default useDebounce;