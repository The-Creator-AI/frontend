import { Store } from "../../../state/store";
import { GatewayState } from "../types";
import { GatewayActions } from "./gateway.actions";

// Initial state
export const initialState: GatewayState = {
  socket: undefined,
  listeners: [],
};

// Create the store
export const gatewayStateSubject = new Store<GatewayState, GatewayActions>(
  initialState
);
export const gatewayStore$ = gatewayStateSubject.asObservable();
