import { lazy } from "react";
import { ModulConfig } from "../modules.types";
import { routesPaths } from "../routes-paths";
import { onAgents, onBotMessage, onChats, onPlans, oneBotMessageChunk } from "./store/code-chat-store.logic";

const moduleConfigs: ModulConfig[] = [{
  route: {
    path: routesPaths['/'],
    menu: {
      label: "Home",
    },
  },
  component: lazy(() => import("./Code-Chat")),
}, {
    route: {
      path: routesPaths['/chat'],
      menu: {
        label: "Chat",
      },
    },
    component: lazy(() => import("./Code-Chat")),
    gatewayListeners: [oneBotMessageChunk, onBotMessage, onPlans, onChats, onAgents]
  }];

export default moduleConfigs;