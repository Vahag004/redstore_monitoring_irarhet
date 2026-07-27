import { Card, Typography } from "@mui/material";

const Heading = ({ title }) => {
    return (
        <Card sx={{ p: 3, textAlign: "center", width: "100%" }}>
            <Typography variant="h3">{title}</Typography>
        </Card>
    );
};

export default Heading;
