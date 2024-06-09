import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

// Utility type to extract keys from an object whose values are not functions
type ValuesOf<T> = T[keyof T];

const useObservableState = <T>(
  observable$: Observable<T>,
): T => {
  const [state, setState] = useState<T | {}>({});

  useEffect(() => {
    const subscription = observable$.subscribe((newState) => {
      setState(newState);
    });

    return () => subscription.unsubscribe();
  }, [observable$]); 

  return state as T;
};

export default useObservableState;
