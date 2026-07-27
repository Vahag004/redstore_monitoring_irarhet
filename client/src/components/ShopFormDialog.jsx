import {
    Box,
    Stack,
    Alert,
    Button,
    Dialog,
    Checkbox,
    Divider,
    TextField,
    Typography,
    DialogTitle,
    DialogContent,
    FormControlLabel,
} from "@mui/material";
import { Controller, useWatch } from "react-hook-form";

const ShopFormDialog = ({
    open,
    isEditing,
    onClose,
    register,
    control,
    handleSubmit,
    onSubmit,
    errors,
}) => {
    const isOwnValue = useWatch({ control, name: "isOwn" });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{ paper: { sx: { borderRadius: 3, p: 0.5 } } }}
        >
            <DialogTitle>
                {isEditing ? "Փոփոխել խանութը" : "Ավելացնել խանութ"}
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2.5}>
                        <TextField
                            {...register("title")}
                            label="Խանութի անվանումը"
                            placeholder="օր․՝ MobileCentre կամ RedStore"
                            error={!!errors?.title}
                            helperText={errors?.title?.message}
                            autoFocus
                            fullWidth
                            variant="outlined"
                        />

                        <Controller
                            name="isOwn"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={Boolean(field.value)}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                    }
                                    label="Սա մեր՝ RedStore-ի սեփական խանութն է"
                                />
                            )}
                        />

                        {isOwnValue && (
                            <Alert severity="info">
                                Այս խանութի գինը կօգտագործվի որպես
                                համեմատության հենակետ («մեր գին») մյուս բոլոր
                                խանութների գների հետ։
                            </Alert>
                        )}

                        <Divider />

                        <Typography variant="subtitle2" color="text.secondary">
                            Playwright-ի կարգավորումներ (ապրանքի էջի սելեքթորներ)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Այս սելեքթորները կիրառվում են ուղիղ ապրանքի էջի
                            վրա. հղումը նշվում է ամեն ապրանքի ձևում։ Եթե սա
                            RedStore-ի խանութն է, նույն սելեքթորները
                            կկիրառվեն ապրանքի «Ռեդսթորի հղում» դաշտի վրա։
                        </Typography>

                        <TextField
                            {...register("titleSelector")}
                            label="Անվանման (title) սելեքթոր (ոչ պարտադիր)"
                            placeholder=".product-title, h1.name"
                            error={!!errors?.titleSelector}
                            helperText={
                                errors?.titleSelector?.message ||
                                "Օգտագործվում է միայն հաստատելու համար, որ էջը ճիշտ է բացվել"
                            }
                            fullWidth
                            variant="outlined"
                        />

                        <TextField
                            {...register("priceSelector")}
                            label="Գնի (price) սելեքթոր"
                            placeholder=".product-card__price, span.price"
                            error={!!errors?.priceSelector}
                            helperText={errors?.priceSelector?.message}
                            fullWidth
                            variant="outlined"
                        />

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

export default ShopFormDialog;