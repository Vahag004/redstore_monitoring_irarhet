import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import {
    addProductToList,
    updateProductInList,
} from "../store/listsSlice";

const emptyValues = {
    title: "",
    model: "",
    redstoreUrl: "",
    links: [],
};

export function useProductForm({ listId }) {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const {
        register: baseRegister,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm({ defaultValues: emptyValues });

    const rules = {
        title: { required: "Պարտադիր դաշտ է" },
        model: {},
    };

    const register = (name) => {
        if (name.startsWith("links.")) {
            const field = name.split(".").pop();
            if (field === "url") {
                return baseRegister(name, {
                    required: "Հղումը պարտադիր է",
                    pattern: {
                        value: /^https?:\/\/.+/i,
                        message: "Հղումը պետք է սկսվի http(s):// -ով",
                    },
                });
            }
            if (field === "shopId") {
                return baseRegister(name, { required: "Ընտրեք խանութ" });
            }
            return baseRegister(name);
        }
        return baseRegister(name, rules[name] || {});
    };

    const openAddDialog = () => {
        setEditingId(null);
        reset(emptyValues);
        setOpen(true);
    };

    const openEditDialog = (product) => {
        setEditingId(product.id);
        reset({
            title: product.title || "",
            model: product.model || "",
            redstoreUrl: product.redstoreUrl || "",
            links: (product.links || []).map((l) => ({
                id: l.id,
                shopId: l.shopId,
                url: l.url,
            })),
        });
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
        setEditingId(null);
        reset(emptyValues);
    };

    const onSubmit = async (data) => {
        console.log(data)
        if (editingId) {
            await dispatch(
                updateProductInList({
                    listId,
                    productId: editingId,
                    product: data,
                }),
            );
        } else {
            await dispatch(addProductToList({ listId, product: data }));
        }
        closeDialog();
    };

    return {
        open,
        isEditing: Boolean(editingId),
        register,
        control,
        handleSubmit,
        onSubmit,
        errors,
        openAddDialog,
        openEditDialog,
        closeDialog,
    };
}
