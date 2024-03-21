import {createContext, useContext, useEffect, useReducer} from 'react';

const ValueContext = createContext(null);

const ValueDispatchContext = createContext(null);

export function ValueProvider({ children , init}) {
    const [value, dispatch] = useReducer(
        ValueReducer,
        init
    );

    useEffect(() => {
        // console.log(value)
    }, [value]);

    return (
        <ValueContext.Provider value={value}>
            <ValueDispatchContext.Provider value={dispatch}>
                {children}
            </ValueDispatchContext.Provider>
        </ValueContext.Provider>
    );
}

function ValueReducer(value, action) {
    switch (action.type) {
        case 'setStartColor': {
            return {
                ...value,
                startColor: action.newValue === undefined? value.startColor: action.newValue}
        }
        case 'setEndColor': {
            return {
                ...value,
                endColor: action.newValue === undefined ? value.endColor: action.newValue}
        }
        case 'setTime': {
            return {
                ...value,
                time: action.newValue}
        }
        case 'setSelectedId': {
            return {
                ...value,
                selectedId: action.newValue === value.selectedId ? "++" : action.newValue}
        }
        case 'setDetailNodeInfo': {
            return {
                ...value,
                detail_node_info: action.newValue
            }
        }
        case 'setHoveredLocation': {
            return {
                ...value,
                hovered_location: action.newValue
            }
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

export function useValue() {
    return useContext(ValueContext);
}

export function useValueDispatch() {
    return useContext(ValueDispatchContext);
}