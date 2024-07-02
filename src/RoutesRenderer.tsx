import { Suspense } from "react";
import { modules } from "./modules/modules.index";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
} from "react-router-dom";

function RoutesRenderer() {
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