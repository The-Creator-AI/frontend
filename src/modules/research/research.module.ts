import { lazy } from "react";
import { ModulConfig } from "../modules.types";
import { routesPaths } from "../routes-paths";

const moduleConfigs: ModulConfig[] = [{
    route: {
        path: routesPaths['/research'],
        menu: {
            label: "Research",
        },
    },
    component: lazy(() => import("./Research")),
}];

export default moduleConfigs;
