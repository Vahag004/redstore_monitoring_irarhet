import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/shopsApi";

export const fetchShops = createAsyncThunk("shops/fetchShops", async () => {
    return api.getShops();
});

export const addShop = createAsyncThunk("shops/addShop", async (shop) => {
    return api.createShop(shop);
});

export const editShop = createAsyncThunk(
    "shops/editShop",
    async ({ shopId, shop }) => {
        await api.updateShop(shopId, shop);
        return { id: shopId, ...shop };
    },
);

export const removeShop = createAsyncThunk(
    "shops/removeShop",
    async (shopId) => {
        return api.deleteShop(shopId);
    },
);

const shopsSlice = createSlice({
    name: "shops",
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchShops.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShops.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchShops.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(addShop.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(editShop.fulfilled, (state, action) => {
                state.items = state.items.map((s) =>
                    s.id === action.payload.id
                        ? { ...s, ...action.payload }
                        : s,
                );
            })
            .addCase(removeShop.fulfilled, (state, action) => {
                state.items = state.items.filter(
                    (s) => s.id !== action.payload,
                );
            });
    },
});

export default shopsSlice.reducer;
