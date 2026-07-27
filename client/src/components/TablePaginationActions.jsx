import { useTheme } from "@mui/material/styles";
import { Box, IconButton } from "@mui/material";
import {
    KeyboardArrowLeft,
    KeyboardArrowRight,
    FirstPage as FirstPageIcon,
    LastPage as LastPageIcon,
} from "@mui/icons-material";

function TablePaginationActions(props) {
    const theme = useTheme();
    const {
        count,
        page,
        rowsPerPage,
        handleBackButtonClick,
        handleNextButtonClick,
        handleLastPageButtonClick,
        handleFirstPageButtonClick,
    } = props;

    const isFirstPage = page === 0;
    const isLastPage =
        rowsPerPage <= 0 || page >= Math.ceil(count / rowsPerPage) - 1;

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={isFirstPage}
                aria-label="first page"
            >
                {theme.direction === "rtl" ? (
                    <LastPageIcon />
                ) : (
                    <FirstPageIcon />
                )}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={isFirstPage}
                aria-label="previous page"
            >
                {theme.direction === "rtl" ? (
                    <KeyboardArrowRight />
                ) : (
                    <KeyboardArrowLeft />
                )}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={isLastPage}
                aria-label="next page"
            >
                {theme.direction === "rtl" ? (
                    <KeyboardArrowLeft />
                ) : (
                    <KeyboardArrowRight />
                )}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={isLastPage}
                aria-label="last page"
            >
                {theme.direction === "rtl" ? (
                    <FirstPageIcon />
                ) : (
                    <LastPageIcon />
                )}
            </IconButton>
        </Box>
    );
}

export default TablePaginationActions;
