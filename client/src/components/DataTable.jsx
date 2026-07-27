import {
    Paper,
    Table,
    TableRow,
    TableBody,
    TableCell,
    TableHead,
    TableFooter,
    TableContainer,
    TablePagination,
} from "@mui/material";

import { useTable } from "../hooks";
import TablePaginationActions from "./TablePaginationActions";

const DataTable = ({
    rows,
    columns,
    initialRowsPerPage = 5,
    emptyMessage = "Տվյալներ չկան",
}) => {
    const {
        page,
        emptyRows,
        rowsPerPage,
        paginatedRows,
        handleChangePage,
        handleNextButtonClick,
        handleBackButtonClick,
        handleChangeRowsPerPage,
        handleLastPageButtonClick,
        handleFirstPageButtonClick,
    } = useTable(rows, initialRowsPerPage);

    const columnCount = columns.length;

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell
                                key={column.key}
                                align={column.align || "left"}
                            >
                                {column.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columnCount}
                                align="center"
                                sx={{ py: 4, color: "text.secondary" }}
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedRows.map((row) => (
                            <TableRow key={row.id}>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        align={column.align || "left"}
                                    >
                                        {column.render
                                            ? column.render(row)
                                            : row[column.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}

                    {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={columnCount} />
                        </TableRow>
                    )}
                </TableBody>

                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[
                                5,
                                10,
                                25,
                                { label: "Բոլորը", value: -1 },
                            ]}
                            colSpan={columnCount}
                            count={rows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            labelRowsPerPage="Տողերի քանակը:"
                            slotProps={{
                                select: {
                                    inputProps: {
                                        "aria-label": "Տողերի քանակը:",
                                    },
                                    native: true,
                                },
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={(props) => (
                                <TablePaginationActions
                                    {...props}
                                    handleFirstPageButtonClick={
                                        handleFirstPageButtonClick
                                    }
                                    handleBackButtonClick={
                                        handleBackButtonClick
                                    }
                                    handleNextButtonClick={
                                        handleNextButtonClick
                                    }
                                    handleLastPageButtonClick={
                                        handleLastPageButtonClick
                                    }
                                />
                            )}
                        />
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    );
};

export default DataTable;
