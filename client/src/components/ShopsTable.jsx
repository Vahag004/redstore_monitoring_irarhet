import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Stack, Button, Container, CircularProgress } from "@mui/material";

import DataTable from "./DataTable";
import Heading from "./Heading";
import ShopFormDialog from "./ShopFormDialog";
import { useShopForm } from "../hooks";
import { fetchShops, removeShop } from "../store/shopsSlice";

const ShopsTable = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { items: rows, loading } = useSelector((state) => state.shops);

    useEffect(() => {
        dispatch(fetchShops());
    }, [dispatch]);

    const {
        open,
        isEditing,
        register,
        control,
        handleSubmit,
        onSubmit,
        errors,
        openAddDialog,
        openEditDialog,
        closeDialog,
    } = useShopForm();

    const handleView = (id) => {
        navigate(`/shops/${id}`);
    };

    const handleDelete = (id) => {
        dispatch(removeShop(id));
    };

    const columns = [
        {
            key: "title",
            label: "Խանութի անվանումը",
            render: (row) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <span>{row.title}</span>
                    {row.isOwn && (
                        <Box
                            component="span"
                            sx={{
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                bgcolor: "primary.main",
                                color: "primary.contrastText",
                                fontSize: 12,
                            }}
                        >
                            RedStore
                        </Box>
                    )}
                </Stack>
            ),
        },
        { key: "priceSelector", label: "Գնի սելեքթոր" },
        {
            key: "actions",
            label: "Գործողություններ",
            align: "right",
            render: (row) => (
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: "flex-end" }}
                >
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openEditDialog(row)}
                    >
                        Փոփոխել
                    </Button>
                    <Button
                        size="small"
                        color="error"
                        variant="contained"
                        onClick={() => handleDelete(row.id)}
                    >
                        Ջնջել
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleView(row.id)}
                    >
                        Դիտել
                    </Button>
                </Stack>
            ),
        },
    ];

    return (
        <Box component="section" sx={{ paddingTop: 6, paddingBottom: 6 }}>
            <Container maxWidth="lg">
                <Stack
                    direction="column"
                    spacing={4}
                    sx={{ alignItems: "flex-start" }}
                >
                    <Heading title="Խանութներ" />

                    <Button variant="contained" onClick={openAddDialog}>
                        Ավելացնել
                    </Button>

                    <Box sx={{ width: "100%" }}>
                        {loading ? (
                            <Stack sx={{ alignItems: "center", py: 4 }}>
                                <CircularProgress />
                            </Stack>
                        ) : (
                            <DataTable
                                columns={columns}
                                rows={rows}
                                emptyMessage="Խանութներ դեռ չկան"
                            />
                        )}
                    </Box>
                </Stack>
            </Container>

            <ShopFormDialog
                open={open}
                isEditing={isEditing}
                onClose={closeDialog}
                register={register}
                control={control}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                errors={errors}
            />
        </Box>
    );
};

export default ShopsTable;