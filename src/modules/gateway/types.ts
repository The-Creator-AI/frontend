import { ChannelBody, ToClient } from "@The-Creator-AI/fe-be-common";
import { Socket } from "socket.io-client";

export interface GatewayState {
  socket?: Socket;
  listeners: Listener[];
}

export interface Listener {
    channel: ToClient;
    callback: (data: ChannelBody<any>) => void;
};
