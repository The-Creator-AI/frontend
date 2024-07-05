import { Listener } from "./gateway/types";

export type ModulConfig = {
    route: {
        path: string;
        menu?: {
            label: string;
        };
    };
    // component: () => import("./module-two.tsx"),
    // type instead of import
    component: React.LazyExoticComponent<React.ComponentType>;
    gatewayListeners?: Listener[];
};
