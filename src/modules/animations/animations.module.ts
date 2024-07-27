// File path: frontend/src/modules/animations/animations.module.ts
import { lazy } from "react";
import { ModulConfig } from "../modules.types";
import { routesPaths } from "../routes-paths";
import {} from "./store/animations.logic";

const moduleConfigs: ModulConfig[] = [
  {
    route: {
      path: routesPaths["/animations"],
      menu: {
        label: "Animations",
      },
    },
    component: lazy(() => import("./Animations")),
  },
];

export default moduleConfigs;
