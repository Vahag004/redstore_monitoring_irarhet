import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import { createList, editList } from "../store/listsSlice";
export function useList() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(null)
    const {
        register: baseRegister,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: { listName: "" } });

    // Wrap register so the component doesn't need to know the validation rules
    const register = (name) => {
        if (name === "listName") {
            return baseRegister("listName", {
                required: "Պարտադիր դաշտ է",
                minLength: { value: 2, message: "Նվազագույնը 2 նիշ" },
            });
        }
        return baseRegister(name);
    };

    const openListChange = (list) => {
        setIsEditing(list?.id)
        reset({
            listName: list?.title || ""
        });
        setOpen(true)
    }

    const handleEdit = async (data) => {
        try {
            const promise = await editList({ id: isEditing, data });
            dispatch(promise)
            setOpen(false);
            setIsEditing(null);
        } catch (err) {
            alert(err?.message || err);
        }
    };

    const onToggle = () => {
        if (open) reset();
        setOpen((prev) => !prev);
    };

    const onSubmit = async (data) => {
        if (!data.listName?.trim()) return;
        await dispatch(createList(data.listName.trim()));
        reset();
        setOpen(false);
    };

    return { open, onToggle, register, handleSubmit, onSubmit, errors, openListChange, isEditing, handleEdit };
}
