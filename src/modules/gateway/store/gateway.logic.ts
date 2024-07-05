import { Socket, io } from "socket.io-client";
import { gatewayStateSubject } from "./gateway.store";
import config from "../../../config";
import { GatewayActions } from "./gateway.actions";
import {
  ChannelBody,
  ToServer,
  sendToServer,
} from "@The-Creator-AI/fe-be-common";
import { Listener } from "../types";
import { modules } from "../../modules.index";

export const getSocket = () => {
  let socket = gatewayStateSubject.getValue().socket;
  if (!socket) {
    connectSocket();
    socket = gatewayStateSubject.getValue().socket;
  }
  return socket;
};

export const connectSocket = () => {
  if (gatewayStateSubject.getValue().socket) {
    return;
  }
  const socket: Socket = io(`${config.BASE_URL}`);
  console.log("connecting to socket", socket);
  gatewayStateSubject._next(
    {
      ...gatewayStateSubject.getValue(),
      socket,
    },
    GatewayActions.CONNECT_SOCKET
  );

  console.log("adding listeners");
  modules.forEach((module) => {
    addListeners(module.gatewayListeners || []);
  });

  socket.onAny((event, ...args) => {
    console.log("onAny", event, args);
    const listeners = gatewayStateSubject.getValue().listeners;
    listeners.forEach((listener) => {
      if (listener.channel === event) {
        listener.callback(args[0]);
      }
    });
  });
};

export const disconnectSocket = () => {
  getSocket()?.removeAllListeners();
  gatewayStateSubject._next(
    {
      ...gatewayStateSubject.getValue(),
      socket: undefined,
    },
    GatewayActions.DISCONNECT_SOCKET
  );
};

export const addListener = (listener: Listener) => {
  // if the listener is already in the listeners array, don't add it again
  if (
    gatewayStateSubject
      .getValue()
      .listeners.some(
        (l) =>
          l.callback === listener.callback && l.channel === listener.channel
      )
  ) {
    return;
  }

  gatewayStateSubject._next(
    {
      ...gatewayStateSubject.getValue(),
      listeners: [...gatewayStateSubject.getValue().listeners, listener],
    },
    GatewayActions.ADD_LISTENERS
  );
};

export const addListeners = (listeners: Listener[]) => {
  const newListeners = listeners.filter((listener) => {
    if (
      gatewayStateSubject
        .getValue()
        .listeners.some(
          (l) =>
            l.callback === listener.callback && l.channel === listener.channel
        )
    ) {
      return false;
    }
    return true;
  });
  gatewayStateSubject._next(
    {
      ...gatewayStateSubject.getValue(),
      listeners: [...gatewayStateSubject.getValue().listeners, ...newListeners],
    },
    GatewayActions.ADD_LISTENERS
  );
};

export const sendMessage = <T extends ToServer>(
  channel: T,
  message: ChannelBody<T>
) => {
  console.log("sendMessage", channel, message);
  const socket = getSocket();
  if (socket) {
    sendToServer(socket, channel, message);
  }
};
