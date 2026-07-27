import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Stack,
    Button,
    Container,
    Typography,
    Card,
    Chip,
    CircularProgress,
} from "@mui/material";

import DataTable from "./DataTable";
import ProductDialog from "./ProductDialog";
import { useProductForm } from "../hooks";
import {
    fetchLists,
    removeList,
    removeProductFromList,
} from "../store/listsSlice";
import { fetchShops } from "../store/shopsSlice";

function ListContent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { items, loading } = useSelector((state) => state.lists);
    const { items: shops } = useSelector((state) => state.shops);
    const list = items.find((l) => String(l.id) === String(id));

    useEffect(() => {
        if (items.length === 0) {
            dispatch(fetchLists());
        }
        if (shops.length === 0) {
            dispatch(fetchShops());
        }
    }, [dispatch, items.length, shops.length]);

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
    } = useProductForm({ listId: id });

    const handleDeleteList = () => {
        dispatch(removeList(id));
        navigate("/lists");
    };

    const handleDeleteProduct = (productId) => {
        dispatch(removeProductFromList({ listId: id, productId }));
    };

    const shopsById = Object.fromEntries(shops.map((s) => [s.id, s]));
    const competitorShops = shops.filter((s) => !s.isOwn);
    
    const columns = [
        { key: "title", label: "Ապրանք" },
        { key: "model", label: "Մոդել", align: "center" },
        {
            key: "redstoreUrl",
            label: "RedStore հղում",
            render: (row) =>
                row.redstoreUrl ? (
                    <a href={row.redstoreUrl} target="_blank" rel="noreferrer">
                        Բացել էջը
                    </a>
                ) : (
                    <Typography variant="body2" color="error">
                        Նշված չէ
                    </Typography>
                ),
        },
        {
            key: "links",
            label: "Մրցակից խանութներ",
            render: (row) =>
                row.links?.length ? (
                    <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ flexWrap: "wrap", gap: 0.5 }}
                    >
                        {row.links.map((link) => (
                            <Chip
                                key={link.id}
                                size="small"
                                label={
                                    shopsById[link.shopId]?.title ||
                                    "Անհայտ խանութ"
                                }
                                component="a"
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                clickable
                            />
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Հղումներ չկան
                    </Typography>
                ),
        },
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
                        variant="outlined"
                        onClick={() => handleDeleteProduct(row.id)}
                    >
                        Հեռացնել
                    </Button>
                </Stack>
            ),
        },
    ];

    if (loading && !list) {
        return (
            <Stack sx={{ alignItems: "center", py: 8 }}>
                <CircularProgress />
            </Stack>
        );
    }

    return (
        <Box sx={{ py: 5 }}>
            <Container maxWidth="lg">
                <Stack spacing={4}>
                    <Card sx={{ p: 3, textAlign: "center" }}>
                        <Typography variant="h3">
                            {list?.title || "Ցուցակ"}
                        </Typography>
                    </Card>

                    <Stack
                        direction="row"
                        sx={{ justifyContent: "flex-end" }}
                        spacing={1}
                    >
                        <Button variant="contained" onClick={openAddDialog}>
                            Ավելացնել ապրանք
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={handleDeleteList}
                        >
                            Ջնջել ցուցակը
                        </Button>
                    </Stack>

                    {!shops.some((s) => s.isOwn) && (
                        <Typography variant="body2" color="error">
                            Դեռ նշված չէ RedStore խանութը։ Գնացեք
                            «Խանութներ» էջ և ավելացրեք խանութ՝ նշելով «Սա
                            մեր՝ RedStore-ի սեփական խանութն է» վանդակը։
                        </Typography>
                    )}

                    <DataTable
                        columns={columns}
                        rows={list?.products || []}
                        emptyMessage="Այս ցուցակում ապրանքներ չկան"
                    />
                </Stack>
            </Container>

            <ProductDialog
                open={open}
                isEditing={isEditing}
                onClose={closeDialog}
                register={register}
                control={control}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                errors={errors}
                shops={competitorShops}
            />
        </Box>
    );
}

export default ListContent;