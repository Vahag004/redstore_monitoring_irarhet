import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom"

import {
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
import ExcelJS from "exceljs";

import DataTable from "./DataTable";
import { fetchLists } from "../store/listsSlice";
import { fetchShops } from "../store/shopsSlice";
import { useMonitoringSearch } from "../hooks";
const HomeContent = () => {
    const dispatch = useDispatch();

    const { items: listsData } = useSelector((state) => state.lists);
    const { items: shopsData } = useSelector((state) => state.shops);
    const { loading, results, runSearch } = useMonitoringSearch();

    // Local state for which list is selected
    const [selectedListId, setSelectedListId] = useState("");

    useEffect(() => {
        dispatch(fetchLists());
        dispatch(fetchShops());
    }, [dispatch]);

    const selectedList = listsData.find(
        (l) => String(l.id) === String(selectedListId),
    );

    const handleRunSearch = () => {
        if (!selectedList) return;
        runSearch(selectedList.id);
    };

    const handleDownloadExcel = async () => {
        if (!results?.length) return;

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Արդյունքներ");

        // Columns (4 սյունակ՝ Ապրանք / Մոդել / Գին / Խանութներ)
        sheet.columns = [
            { header: "Ապրանք", key: "product", width: 25 },
            { header: "Մոդել", key: "model", width: 18 },
            { header: "Գին (RedStore)", key: "price", width: 16 },
            { header: "Խանութներ", key: "shops", width: 90 },
        ];

        // ===== HEADER STYLE =====
        const headerRow = sheet.getRow(1);

        headerRow.eachCell((cell) => {
            cell.font = {
                bold: true,
                size: 12,
            };

            cell.alignment = {
                vertical: "middle",
                horizontal: "center",
            };

            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // ===== DATA =====
        results.forEach((row) => {
            const excelRow = sheet.addRow({
                product: row.productTitle,
                model: row.model || "—",
                price:
                    row.ourPrice != null
                        ? `${row.ourPrice.toLocaleString("hy-AM")}դր`
                        : "—",
                shops: "",
            });

            // ===== BORDER for all cells =====
            excelRow.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };

                // 👉 CENTER ALIGN for product / model / price columns
                if (colNumber === 1 || colNumber === 2 || colNumber === 3) {
                    cell.alignment = {
                        vertical: "middle",
                        horizontal: "center",
                    };
                }

                // 👉 shops column left align
                if (colNumber === 4) {
                    cell.alignment = {
                        vertical: "middle",
                        horizontal: "left",
                        wrapText: true,
                    };
                }
            });

            // shops is now the 4th column (Ապրանք, Մոդել, Գին, Խանութներ)
            const shopsCell = excelRow.getCell(4);

            if (!row.prices?.length) {
                shopsCell.value = "—";
                return;
            }

            const richText = [];

            row.prices.forEach((p, index) => {
                let color = "FF008000"; // green (cheapest)

                if (row.ourPrice != null && row.ourPrice > p.price) {
                    color = "FFFF0000"; // red (RedStore is pricier than this shop)
                } else if (row.ourPrice === p.price) {
                    color = "FFFFA500"; // orange (tied)
                }

                richText.push({
                    text: `${p.shop}: ${p.price.toLocaleString("hy-AM")}դր`,
                    hyperlink: p.url,
                    font: {
                        bold: false,
                        color: { argb: color },
                    },
                });

                if (index < row.prices.length - 1) {
                    richText.push({
                        text: " | ",
                        font: { color: { argb: "FF000000" } },
                    });
                }
            });

            shopsCell.value = { richText };

            // border for shops cell
            shopsCell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // ===== DOWNLOAD =====
        const fileName = `monitoring-${selectedList?.title || "results"
            }-${new Date().toISOString().slice(0, 10)}.xlsx`;

        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = fileName;
        a.click();

        window.URL.revokeObjectURL(url);
    };

    const columns = [
        { key: "productTitle", label: "Ապրանք" },
        {
            key: "model",
            label: "Մոդել",
            align: "center",
            render: (row) => row.model || "—",
        },
        {
            key: "price",
            label: "Գին (RedStore)",
            align: "center",
            render: (row) =>
                row.ourPrice != null
                    ? <Link to={row.ourUrl} target="_blank" style={{ color: "#000" }}>{row.ourPrice.toLocaleString("hy-AM")}դր</Link>
                    : "—"

        },
        {
            key: "shops",
            label: "Խանութներ",
            align: "center",
            render: (row) =>
                row.prices?.length ? (
                    row.prices.map((p, index) => (
                        <Typography
                            key={p.shop}
                            component="span"
                            sx={{
                                color:
                                    row.ourPrice != null &&
                                        row.ourPrice > p.price
                                        ? "red"
                                        : row.ourPrice === p.price
                                            ? "orange"
                                            : "green",
                            }}
                        >
                            <a
                                href={p.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "inherit" }}
                            >
                                {p.shop}: {p.price.toLocaleString("hy-AM")}դր
                            </a>
                            {index < row.prices.length - 1 ? " | " : ""}
                        </Typography>
                    ))
                ) : (
                    "—"
                ),
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack spacing={3}>
                <Card sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                        <Typography variant="h6">
                            Մոնիթորինգ՝ ընտրեք ցուցակը և սկսեք որոնումը
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Յուրաքանչյուր ապրանքի համար ստուգվում է RedStore
                            կայքում դրա գինը, ապա համեմատվում է մրցակից
                            խանութների գների հետ (հղումները կցվում են
                            ապրանքի քարտում՝ «Ցուցակներ» բաժնում)։
                        </Typography>

                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            sx={{ alignItems: { sm: "center" } }}
                        >
                            <FormControl sx={{ minWidth: 260 }}>
                                <InputLabel id="home-list-select-label">
                                    Ցուցակ
                                </InputLabel>
                                <Select
                                    labelId="home-list-select-label"
                                    label="Ցուցակ"
                                    value={selectedListId}
                                    onChange={(e) =>
                                        setSelectedListId(e.target.value)
                                    }
                                >
                                    {listsData.map((l) => (
                                        <MenuItem key={l.id} value={l.id}>
                                            {l.title} ({l.products.length}{" "}
                                            ապրանք)
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

                            <Button
                                variant="outlined"
                                disabled={!results?.length}
                                onClick={handleDownloadExcel}
                            >
                                Ներբեռնել
                            </Button>
                        </Stack>

                        {shopsData.length === 0 && (
                            <Typography variant="body2" color="error">
                                Դեռ չկա որևէ խանութ։ Ավելացրեք խանութ
                                «Խանութներ» բաժնում, ապա ապրանքին կցեք
                                խանութի հղումը «Ցուցակներ» բաժնում։
                            </Typography>
                        )}
                    </Stack>
                </Card>

                <DataTable
                    columns={columns}
                    rows={results || []}
                    emptyMessage="Արդյունքներ չկան․ ընտրեք ցուցակ և սկսեք որոնումը"
                />
            </Stack>
        </Container>
    );
};

export default HomeContent;