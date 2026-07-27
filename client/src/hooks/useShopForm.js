import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import { addShop, editShop } from "../store/shopsSlice";

const emptyValues = {
    title: "",
    titleSelector: "",
    priceSelector: "",
    isOwn: false,
};

export function useShopForm() {
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
        priceSelector: { required: "Պարտադիր դաշտ է" },
        titleSelector: {},
        isOwn: {},
    };

    const register = (name) => baseRegister(name, rules[name] || {});

    const openAddDialog = () => {
        setEditingId(null);
        reset(emptyValues);
        setOpen(true);
    };

    const openEditDialog = (shop) => {
        setEditingId(shop.id);
        reset({
            title: shop.title || "",
            titleSelector: shop.titleSelector || "",
            priceSelector: shop.priceSelector || "",
            isOwn: Boolean(shop.isOwn),
        });
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
        setEditingId(null);
        reset(emptyValues);
    };

    const onSubmit = async (data) => {
        if (editingId) {
            await dispatch(editShop({ shopId: editingId, shop: data }));
        } else {
            await dispatch(addShop(data));
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