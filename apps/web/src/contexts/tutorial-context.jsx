import { createContext, useContext, useState } from 'react';

export const TutorialContext = createContext();
export function useTutorial() {
    return useContext(TutorialContext);
}

export function TutorialProvider({ children }) {
    const [tutorialAction, setTutorialAction] = useState(null);
    return (
        <TutorialContext.Provider value={{ tutorialAction, setTutorialAction }}>
            {children}
        </TutorialContext.Provider>
    );
} 