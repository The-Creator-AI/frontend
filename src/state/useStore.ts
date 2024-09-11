import { useEffect, useState } from "react";
import { Store } from "./store";

type KeyPaths<T> = T extends object
  ? {
      [K in keyof Required<T>]: `${Exclude<K, symbol>}${
        | ""
        | (Required<T>[K] extends Array<infer U>
            ? ""
            : Required<T>[K] extends object
            ? `.${KeyPaths<Required<T>[K]>}`
            : "")}`;
    }[keyof T]
  : "";

// Helper function to get nested value
const getNestedValue = <T>(obj: T, path: string): any => {
  return path
    .split(".")
    .reduce((acc: any, part: string) => acc && acc[part], obj);
};

const useStore = <S, A>(
  subject: Store<S, A>,
  selector?: Array<KeyPaths<S>> | ((state: S) => any)
): S => {
  const [state, setState] = useState<S>(subject.getValue());

  useEffect(() => {
    const subscription = subject.subscribe((newState) => {
      const isAnyKeyChanged =
        typeof selector === "function"
          ? selector(newState) !== selector(state)
          : selector?.some((key) => {
              const oldValue = getNestedValue(state, key as string);
              const newValue = getNestedValue(newState, key as string);
              return oldValue !== newValue;
            });
      if (isAnyKeyChanged || !selector) {
        setState(newState);
      }
    });

    return () => subscription.unsubscribe();
  }, [subject, selector]);

  return state;
};

export default useStore;
