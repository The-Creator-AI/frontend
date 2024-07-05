import { lazy } from "react";
import { ModulConfig } from "../modules.types";
import { routesPaths } from "../routes-paths";
import { onChunk, onComplete, onError, onProgress, onResult } from "./store/research-store.logic";

const moduleConfigs: ModulConfig[] = [{
    route: {
        path: routesPaths['/research'],
        menu: {
            label: "Research",
        },
    },
    component: lazy(() => import("./Research")),
    gatewayListeners: [
        onProgress,
        onError,
        onResult,
        onChunk,
        onComplete
    ],
}];

export default moduleConfigs;
