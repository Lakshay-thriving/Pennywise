import React, { createContext, useContext, useState } from 'react';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
    // Balances
    const [balance, setBalance] = useState(0);
    const [owedToYou, setOwedToYou] = useState(0);
    const [youOwe, setYouOwe] = useState(0);

    // Feed Data
    const [activityFeed, setActivityFeed] = useState([]);
    
    // Modules Data
    const [goals, setGoals] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    
    return (
        <FinanceContext.Provider value={{
            balance, setBalance,
            owedToYou, setOwedToYou,
            youOwe, setYouOwe,
            activityFeed, setActivityFeed,
            goals, setGoals,
            subscriptions, setSubscriptions
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => useContext(FinanceContext);
