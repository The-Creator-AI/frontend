import { useEffect, useState } from "react";
import { Store } from "./store";

const useStore = <S, A>(
  subject: Store<S, A>,
  subscribedKeys?: Array<keyof S>
): S => {
  const [state, setState] = useState<S>(subject.getValue());

  useEffect(() => {
    const subscription = subject.subscribe((newState) => {
      const isAnyKeyChanged = subscribedKeys?.some((key) => newState[key] !== state[key]);
      if (isAnyKeyChanged || !subscribedKeys) {
        setState(newState);
      }
    });

    return () => subscription.unsubscribe();
  }, [subject, subscribedKeys]);

  return state as S;
};

export default useStore;
