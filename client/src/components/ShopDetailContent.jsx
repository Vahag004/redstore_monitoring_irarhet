import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Card,
    Stack,
    Button,
    Select,
    MenuItem,
    Container,
    Typography,
    InputLabel,
    FormControl,
    CircularProgress,
} from "@mui/material";

import DataTable from "./DataTable";
import ShopFormDialog from "./ShopFormDialog";
import { useShopForm, useShopSearch } from "../hooks";
import { fetchShops } from "../store/shopsSlice";
import { fetchLists } from "../store/listsSlice";

const statusLabels = {
    found: { text: "Գտնվեց", color: "success.main" },
    not_found: { text: "Չգտնվեց", color: "error.main" },
    no_link: { text: "Հղում նշված չէ", color: "text.secondary" },
};

function ShopDetailContent() {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { items: shops, loading: shopsLoading } = useSelector(
        (state) => state.shops,
    );
    const { items: lists } = useSelector((state) => state.lists);

    const shop = shops.find((s) => String(s.id) === String(id));

    useEffect(() => {
        if (shops.length === 0) dispatch(fetchShops());
        if (lists.length === 0) dispatch(fetchLists());
    }, [dispatch, shops.length, lists.length]);

    const {
        open,
        isEditing,
        register,
        control,
        handleSubmit,
        onSubmit,
        errors,
        openEditDialog,
        closeDialog,
    } = useShopForm();

    const { loading, results, selectedListId, setSelectedListId, runSearch } =
        useShopSearch(shop);

    const selectedList = lists.find(
        (l) => String(l.id) === String(selectedListId),
    );

    const handleRunSearch = () => {
        if (!selectedList) return;
        runSearch();
    };

    const resultColumns = [
        { key: "productTitle", label: "Ապրանք (ցուցակից)" },
        {
            key: "status",
            label: "Կարգավիճակ",
            align: "center",
            render: (row) => (
                <Typography
                    variant="body2"
                    sx={{ color: statusLabels[row.status]?.color }}
                >
                    {statusLabels[row.status]?.text || "—"}
                </Typography>
            ),
        },
        {
            key: "price",
            label: "Գին",
            align: "right",
            render: (row) =>
                row.status === "found"
                    ? `${row.price?.toLocaleString("hy-AM")}դր`
                    : "—",
        },
        {
            key: "url",
            label: "Հղում",
            render: (row) =>
                row.url ? (
                    <a href={row.url} target="_blank" rel="noreferrer">
                        Բացել էջը
                    </a>
                ) : (
                    "—"
                ),
        },
    ];

    if (shopsLoading && !shop) {
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
                    <Card sx={{ p: 3 }}>
                        <Stack
                            direction="row"
                            sx={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 1,
                            }}
                        >
                            <Typography variant="h4">{shop?.title}</Typography>
                            <Button
                                variant="outlined"
                                onClick={() => openEditDialog(shop)}
                            >
                                Փոփոխել սելեքթորները
                            </Button>
                        </Stack>

                        <Stack spacing={0.5} sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Գնի (price) սելեքթոր՝ {shop?.priceSelector}
                            </Typography>
                            {shop?.titleSelector && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Անվանման (title) սելեքթոր՝{" "}
                                    {shop?.titleSelector}
                                </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                Ապրանքի էջի հղումները նշվում են ամեն ապրանքի
                                ձևում («Ցուցակներ» բաժնում)։
                            </Typography>
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3 }}>
                        <Stack spacing={2.5}>
                            <Typography variant="h6">
                                Մոնիթորինգ՝ ընտրեք ցուցակը և սկսեք որոնումը
                            </Typography>

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={2}
                                sx={{ alignItems: { sm: "center" } }}
                            >
                                <FormControl sx={{ minWidth: 260 }}>
                                    <InputLabel id="list-select-label">
                                        Ցուցակ
                                    </InputLabel>
                                    <Select
                                        labelId="list-select-label"
                                        label="Ցուցակ"
                                        value={selectedListId}
                                        onChange={(e) =>
                                            setSelectedListId(e.target.value)
                                        }
                                    >
                                        {lists.map((l) => (
                                            <MenuItem key={l.id} value={l.id}>
                                                {l.title} (
                                                {l.products.length} ապրանք)
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Button
                                    variant="contained"
                                    disabled={!selectedList || loading}
                                    onClick={handleRunSearch}
                                    startIcon={
                                        loading ? (
                                            <CircularProgress
                                                size={16}
                                                color="inherit"
                                            />
                                        ) : null
                                    }
                                >
                                    {loading ? "Ստուգում..." : "Ստուգել"}
                                </Button>
                            </Stack>

                            {results && (
                                <DataTable
                                    columns={resultColumns}
                                    rows={results}
                                    emptyMessage="Արդյունքներ չկան"
                                />
                            )}
                        </Stack>
                    </Card>
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
}

export default ShopDetailContent;