import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/listsApi";

export const fetchLists = createAsyncThunk("lists/fetchLists", async () => {
    return api.getLists();
});

export const createList = createAsyncThunk(
    "lists/createList",
    async (title) => {
        return api.createList(title);
    },
);

export const removeList = createAsyncThunk(
    "lists/removeList",
    async (listId) => {
        return api.deleteList(listId);
    },
);

export const editList = createAsyncThunk("lists/editList", async (data) => {
    return await api.editList(data)
})

export const addProductToList = createAsyncThunk(
    "lists/addProductToList",
    async ({ listId, product }) => {
        const newProduct = await api.addProduct(listId, product);
        return { listId, product: newProduct };
    },
);

export const updateProductInList = createAsyncThunk(
    "lists/updateProductInList",
    async ({ listId, productId, product }) => {
        const updated = await api.updateProduct(listId, productId, product);
        return { listId, product: updated };
    },
);

export const removeProductFromList = createAsyncThunk(
    "lists/removeProductFromList",
    async ({ listId, productId }) => {
        await api.removeProduct(listId, productId);
        return { listId, productId };
    },
);

const listsSlice = createSlice({
    name: "lists",
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLists.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLists.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchLists.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(createList.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(removeList.fulfilled, (state, action) => {
                state.items = state.items.filter(
                    (l) => l.id !== action.payload,
                );
            })
            .addCase(editList.fulfilled, (state, action) => {
                state.items = state.items.map((item) => item.id === action.payload.id ? action.payload : item)
            })
            .addCase(addProductToList.fulfilled, (state, action) => {
                const list = state.items.find(
                    (l) => l.id === action.payload.listId,
                );
                if (list) list.products.push(action.payload.product);
            })
            .addCase(updateProductInList.fulfilled, (state, action) => {
                const list = state.items.find(
                    (l) => l.id === action.payload.listId,
                );
                if (list) {
                    list.products = list.products.map((p) =>
                        p.id === action.payload.product.id
                            ? action.payload.product
                            : p,
                    );
                }
            })
            .addCase(removeProductFromList.fulfilled, (state, action) => {
                const list = state.items.find(
                    (l) => l.id === action.payload.listId,
                );
                if (list) {
                    list.products = list.products.filter(
                        (p) => p.id !== action.payload.productId,
                    );
                }
            });
    },
});

export default listsSlice.reducer;
