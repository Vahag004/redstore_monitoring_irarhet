import {
    Box,
    Stack,
    Button,
    Dialog,
    TextField,
    DialogTitle,
    DialogContent,
} from "@mui/material";

const AddDialog = ({
    open,
    onToggle,
    register,
    handleSubmit,
    onSubmit,
    errors,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onToggle}
            fullWidth
            maxWidth="xs"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        p: 0.5,
                    },
                },
            }}
        >
            <DialogTitle>Ավելացնել ցուցակ</DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2.5} sx={{ alignItems: "center" }}>
                        <TextField
                            {...register?.("listName")}
                            label="Ցուցակի անվանումը"
                            placeholder="օր․՝ Նոթբուքեր"
                            error={!!errors?.listName}
                            helperText={errors?.listName?.message}
                            autoFocus
                            fullWidth
                            variant="outlined"
                        />

                        <Stack direction="row" spacing={1.5}>
                            <Button onClick={onToggle} variant="outlined">
                                Չեղարկել
                            </Button>

                            <Button type="submit" variant="contained">
                                Ստեղծել
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AddDialog;
