import {
    Box,
    Stack,
    Button,
    Dialog,
    Select,
    Divider,
    TextField,
    Typography,
    IconButton,
    InputLabel,
    FormControl,
    DialogTitle,
    DialogContent,
} from "@mui/material";
import { useFieldArray } from "react-hook-form";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const ProductDialog = ({
    open,
    isEditing,
    onClose,
    register,
    control,
    handleSubmit,
    onSubmit,
    errors,
    shops = [],
}) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "links",
    });
    const sortedShops = shops.sort((a, b) => a.title.localeCompare(b.title))
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0.5 } } }}
        >
            <DialogTitle>
                {isEditing ? "Փոփոխել ապրանքը" : "Ավելացնել ապրանք"}
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2.5}>
                        <TextField
                            {...register("title")}
                            label="Ապրանքի անունը"
                            placeholder="օր․՝ Asus Vivobook 15"
                            error={!!errors?.title}
                            helperText={errors?.title?.message}
                            autoFocus
                            fullWidth
                            variant="outlined"
                        />

                        <TextField
                            {...register("model")}
                            label="Մոդել (ոչ պարտադիր)"
                            placeholder="օր․՝ X1504VA"
                            error={!!errors?.model}
                            helperText={errors?.model?.message}
                            fullWidth
                            variant="outlined"
                        />

                        <TextField
                            {...register("redstoreUrl")}
                            label="Ապրանքի հղումը RedStore կայքում"
                            placeholder="https://redstore.am/product/12345"
                            error={!!errors?.redstoreUrl}
                            helperText={
                                errors?.redstoreUrl?.message ||
                                "Այս գինը կծառայի որպես համեմատության հենակետ («մեր գին»)"
                            }
                            fullWidth
                            variant="outlined"
                        />

                        <Divider />

                        <Stack
                            direction="row"
                            sx={{
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                            >
                                Մրցակից խանութների էջի հղումներ
                            </Typography>
                            <Button
                                size="small"
                                startIcon={<AddIcon />}
                                disabled={shops.length === 0}
                                onClick={() =>
                                    append({ shopId: "", url: "" })
                                }
                            >
                                Ավելացնել
                            </Button>
                        </Stack>

                        {shops.length === 0 && (
                            <Typography variant="body2" color="error">
                                Նախ ավելացրեք գոնե մեկ խանութ «Խանութներ»
                                էջում, որպեսզի կարողանաք հղումներ կցել։
                            </Typography>
                        )}

                        {shops.length > 0 && fields.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                Հղումներ դեռ չկան։ Ավելացրեք գոնե մեկ խանութի
                                հղում, որպեսզի այս ապրանքը մասնակցի
                                մոնիթորինգին։
                            </Typography>
                        )}

                        {fields.map((field, index) => (
                            <Stack
                                key={field.id}
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1.5}
                                sx={{ alignItems: { sm: "flex-start" } }}
                            >
                                <FormControl sx={{ minWidth: 170 }}>
                                    <InputLabel
                                        htmlFor={`shop-select-${field.id}`}
                                        shrink
                                    >
                                        Խանութ
                                    </InputLabel>
                                    <Select
                                        native
                                        label="Խանութ"
                                        defaultValue={field.shopId}
                                        error={
                                            !!errors?.links?.[index]?.shopId
                                        }
                                        inputProps={{
                                            id: `shop-select-${field.id}`,
                                            ...register(
                                                `links.${index}.shopId`,
                                            ),
                                        }}
                                    >
                                        <option value="" disabled>
                                            -- ընտրեք խանութ --
                                        </option>
                                        {sortedShops.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.title}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    {...register(`links.${index}.url`)}
                                    label="Ապրանքի էջի հղումը"
                                    placeholder="https://shop.am/product/12345"
                                    error={!!errors?.links?.[index]?.url}
                                    helperText={
                                        errors?.links?.[index]?.url?.message
                                    }
                                    fullWidth
                                    variant="outlined"
                                />

                                <IconButton
                                    aria-label="հեռացնել հղումը"
                                    color="error"
                                    onClick={() => remove(index)}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Stack>
                        ))}

                        <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ justifyContent: "flex-end" }}
                        >
                            <Button onClick={onClose} variant="outlined">
                                Չեղարկել
                            </Button>
                            <Button type="submit" variant="contained">
                                {isEditing ? "Պահպանել" : "Ստեղծել"}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDialog;