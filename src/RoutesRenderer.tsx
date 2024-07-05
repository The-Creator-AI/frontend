import { Suspense, useEffect } from "react";
import {
    Route,
    BrowserRouter as Router,
    Routes
} from "react-router-dom";
import { modules } from "./modules/modules.index";
import { connectSocket, disconnectSocket } from "./modules/gateway/store/gateway.logic";

function RoutesRenderer() {
    useEffect(() => {
        connectSocket();

        return () => {
            disconnectSocket();
        };
    }, []);
    return (
        <Router>
            <Routes>
                {modules.map(({ route, component: Component }) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        // lazy={module.component}
                        element={
                            <Suspense fallback={<div>Loading...</div>}>
                                <Component />
                            </Suspense>
                        }
                    />
                ))}
            </Routes>
        </Router>
    );
}

export default RoutesRenderer;