import { lazy } from "react";
import { ModulConfig } from "../modules.types";
import { routesPaths } from "../routes-paths";
import { onAgents, onBotMessage, onChats, onPlans, onBotMessageChunk } from "./store/code-chat.logic";

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
    gatewayListeners: [onBotMessageChunk, onBotMessage, onPlans, onChats, onAgents]
  }];

export default moduleConfigs;