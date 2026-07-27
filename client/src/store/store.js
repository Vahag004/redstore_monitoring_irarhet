import { configureStore } from "@reduxjs/toolkit";
import listsReducer from "./listsSlice";
import shopsReducer from "./shopsSlice";

export const store = configureStore({
    reducer: {
        lists: listsReducer,
        shops: shopsReducer,
    },
});
