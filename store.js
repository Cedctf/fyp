import { configureStore } from '@reduxjs/toolkit';
import { keplerGlReducer } from '@kepler.gl/reducers';
import { taskMiddleware } from 'react-palm/tasks';

// Reducer configuration
const reducer = {
    keplerGl: keplerGlReducer
};

const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: false
        }).concat(taskMiddleware)
});

export default store;
