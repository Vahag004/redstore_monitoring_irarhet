import { NavLink } from "react-router-dom";
import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";

const navLinkStyle = ({ isActive }) => ({
    color: "#fff",
    opacity: isActive ? 1 : 0.75,
    fontWeight: isActive ? 700 : 400,
});

const Navbar = () => {
    return (
        <AppBar position="static" component="nav">
            <Toolbar>
                <Stack
                    direction="row"
                    sx={{
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography variant="h6" component="div">
                        RedStore Monitoring
                    </Typography>
                    <Box>
                        <Button
                            component={NavLink}
                            to="/"
                            end
                            style={navLinkStyle}
                            sx={{ color: "#fff" }}
                        >
                            Աղյուսակ
                        </Button>
                        <Button
                            component={NavLink}
                            to="/lists"
                            style={navLinkStyle}
                            sx={{ color: "#fff" }}
                        >
                            Ցուցակներ
                        </Button>
                        <Button
                            component={NavLink}
                            to="/shops"
                            style={navLinkStyle}
                            sx={{ color: "#fff" }}
                        >
                            Խանութներ
                        </Button>
                    </Box>
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
