import { useMemo, useState, useEffect } from "react";

export function useTable(rows, initialRowsPerPage = 5) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

    // Keep page in range if the underlying data shrinks (e.g. after a delete)
    useEffect(() => {
        const maxPage =
            rowsPerPage > 0 ? Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1) : 0;
        if (page > maxPage) setPage(maxPage);
    }, [rows.length, rowsPerPage, page]);

    const paginatedRows = useMemo(() => {
        if (rowsPerPage === -1) return rows;
        const start = page * rowsPerPage;
        return rows.slice(start, start + rowsPerPage);
    }, [rows, page, rowsPerPage]);

    const emptyRows =
        rowsPerPage === -1
            ? 0
            : Math.max(0, (1 + page) * rowsPerPage - rows.length) -
              (rows.length === 0 ? 0 : 0);

    const handleChangePage = (event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFirstPageButtonClick = () => setPage(0);

    const handleBackButtonClick = () => setPage((p) => Math.max(0, p - 1));

    const handleNextButtonClick = () => setPage((p) => p + 1);

    const handleLastPageButtonClick = () => {
        setPage(
            rowsPerPage > 0 ? Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1) : 0,
        );
    };

    return {
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
    };
}
