import { Store } from "../../../state/store";
import { AnimationsActions } from "./animations.actions";

export interface AnimationsStoreState {
  currentAnimation: string;
}

export const initialState: AnimationsStoreState = {
  currentAnimation: new URL(window.location.href).searchParams.get("animation") || "",
};

export const animationsStoreStateSubject = new Store<
  AnimationsStoreState,
  AnimationsActions
>(initialState);
