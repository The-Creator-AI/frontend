
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useStore from '../../state/useStore';
import "./Animations.scss";
import { updateCurrentAnimation } from "./store/animations.logic";
import { animationsStoreStateSubject } from './store/animations.store';
import * as views from './views';



function Animations() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentAnimation } = useStore(animationsStoreStateSubject);
    const animations = Object.keys(views);

    useEffect(() => {
        const paramsObject = Object.fromEntries(searchParams.entries());
        setSearchParams({ ...paramsObject, animation: currentAnimation });
    }, [currentAnimation, searchParams, setSearchParams]);

    const CurrentAnimation = views[currentAnimation];

    return (
        <div className="Animations">
            {currentAnimation ? <div className="current-animation">
                <div className="back-to-home">
                    Go back to <a href={`/animations`}>Home</a>
                </div>
                <div className="current-animation-title">
                    {currentAnimation}
                </div>
                <CurrentAnimation />
            </div> : (
                <ul className="animations-list">
                    {animations.map((animation) => (
                        <li
                            key={animation}
                            onClick={() => {
                                updateCurrentAnimation(animation);
                            }}
                        >
                            {animation}
                        </li>
                    ))}
                </ul>
            )}
        </div>);
}

export default Animations;

