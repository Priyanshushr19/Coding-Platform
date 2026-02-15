import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../slices/authSlice';
import problemsReducer from '../slices/problemSlice';
import currentProblemReducer from '../slices/currentProblemSlice';

export const store = configureStore({
    reducer:{
        auth:authReducer,
        problems: problemsReducer,
        currentProblem: currentProblemReducer,
    }
})