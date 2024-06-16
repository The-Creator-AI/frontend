import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

const useStore = <T>(
  observable$: Observable<T>,
  initialState?: T
): T => {
  const [state, setState] = useState<T | {}>(initialState || ({} as T));

  useEffect(() => {
    const subscription = observable$.subscribe((newState) => {
      setState(newState);
    });

    return () => subscription.unsubscribe();
  }, [observable$]); 

  return state as T;
};

export default useStore;
