import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Stack, Button, Container, CircularProgress } from "@mui/material";

import DataTable from "./DataTable";
import Heading from "./Heading";
import AddDialog from "./AddDialog";
import { useList } from "../hooks";
import { fetchLists, removeList } from "../store/listsSlice";

const ListsTable = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { open, onToggle, register, handleSubmit, onSubmit, errors } =
        useList();

    const { items: rows, loading } = useSelector((state) => state.lists);

    useEffect(() => {
        dispatch(fetchLists());
    }, [dispatch]);

    const handleView = (id) => {
        navigate(`/lists/${id}`);
    };

    const handleDelete = (id) => {
        dispatch(removeList(id));
    };

    const columns = [
        { key: "title", label: "Ցուցակի անվանումը" },
        {
            key: "productsCount",
            label: "Ապրանքների քանակը",
            align: "center",
            render: (row) => row.products?.length ?? 0,
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
                        variant="contained"
                        onClick={() => handleView(row.id)}
                    >
                        Դիտել
                    </Button>
                    <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => handleDelete(row.id)}
                    >
                        Ջնջել
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
                    <Heading title="Ցուցակներ" />

                    <Button variant="contained" onClick={onToggle}>
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
                                emptyMessage="Ցուցակներ դեռ չկան"
                            />
                        )}
                    </Box>
                </Stack>
            </Container>

            <AddDialog
                open={open}
                onToggle={onToggle}
                register={register}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                errors={errors}
            />
        </Box>
    );
};

export default ListsTable;
