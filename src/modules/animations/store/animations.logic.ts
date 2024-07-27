// File path: frontend/src/modules/animations/store/animations-store.logic.ts
import { AnimationsActions } from "./animations.actions";
import {
  animationsStoreStateSubject,
  initialState
} from "./animations.store";

export const resetAnimationsStore = () => {
  animationsStoreStateSubject._next(
    initialState,
    AnimationsActions.RESET_ANIMATIONS_STORE
  );
};

export const updateCurrentAnimation = (newAnimation: string) => {
  animationsStoreStateSubject._next(
    {
      ...animationsStoreStateSubject.getValue(),
      currentAnimation: newAnimation,
    },
    AnimationsActions.UPDATE_CURRENT_ANIMATION
  );
};
