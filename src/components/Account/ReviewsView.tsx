"use client"

import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Avatar,
    CircularProgress,
} from "@mui/material";
import { Settings } from "@mui/icons-material";
import Pagination from "../common/Pagination";
import WrittenReviewsView from "./WrittenReviewsView";
import { getDeliveredProducts } from "@/service/product/DeliveredProductAPI";
import ReviewWriteView from "./ReviewWriteView";

interface DeliveredProduct {
    productId: string;
    productImage: string;
    productName: string;
    deliveredAt: string;
}

interface DeliveredProductsResponse {
    success: boolean;
    message: string;
    data: {
        content: DeliveredProduct[];
        last: boolean;
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
        first: boolean;
        numberOfElements: number;
        empty: boolean;
    };
}

const ReviewsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [products, setProducts] = useState<DeliveredProduct[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [writingProduct, setWritingProduct] = useState<DeliveredProduct | null>(null);

    const itemsPerPage = 10;

    const fetchData = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const res: DeliveredProductsResponse = await getDeliveredProducts(page - 1, itemsPerPage);
            setProducts(res.data.content);
            setTotalItems(res.data.totalElements);
        } catch (err: any) {
            setError("상품 정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 0) fetchData(currentPage);
    }, [currentPage, activeTab]);

    const handlePageChange = (page: number) => setCurrentPage(page);

    // 리뷰 등록 완료 콜백
    const handleReviewComplete = () => {
        alert("리뷰 등록이 완료되었습니다!");
        setWritingProduct(null);
        fetchData(currentPage);
    };

    return (
        <Box>
            <Typography variant="h4" style={{ fontWeight: "bold", marginBottom: 32, color: "text.primary" }}>
                리뷰 관리
            </Typography>
            <Box style={{ borderBottom: "1px solid #e0e0e0", marginBottom: 24 }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label="리뷰 작성" />
                    <Tab label="작성한 리뷰" />
                </Tabs>
            </Box>
            {activeTab === 0 ? (
                writingProduct ? (
                    <ReviewWriteView
                        product={writingProduct}
                        setDetailView={() => setWritingProduct(null)}
                        onComplete={handleReviewComplete}
                    />
                ) : (
                    <>
                        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <Typography variant="body2" color="text.secondary">
                                작성 가능한 리뷰 {totalItems}건이 있습니다.
                            </Typography>
                            <Box>
                                <Button variant="text" color="primary" size="small">
                                    리뷰 운영원칙
                                </Button>
                                <Button variant="text" color="primary" size="small" startIcon={<Settings />}>
                                    리뷰 설정
                                </Button>
                            </Box>
                        </Box>
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Typography color="error">{error}</Typography>
                        ) : products.length === 0 ? (
                            <Typography>작성 가능한 상품이 없습니다.</Typography>
                        ) : (
                            products.map((product) => (
                                <Paper key={product.productId} style={{ marginBottom: 24, padding: 24 }}>
                                    <TableContainer>
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell style={{ width: 120 }}>
                                                        <Avatar
                                                            src={`https://${product.productImage}`}
                                                            variant="rounded"
                                                            style={{ width: 100, height: 100 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 8 }}>
                                                            {product.productName}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {product.deliveredAt.split("T")[0]} 배송
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right" style={{ width: 200 }}>
                                                        <Box style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                            <Button
                                                                variant="outlined"
                                                                color="primary"
                                                                style={{ marginBottom: 8 }}
                                                                onClick={() => setWritingProduct(product)}
                                                            >
                                                                리뷰 작성하기
                                                            </Button>
                                                            <Button variant="text" color="primary" size="small">
                                                                숨기기
                                                            </Button>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            ))
                        )}
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                        />
                    </>
                )
            ) : (
                <WrittenReviewsView />
            )}
        </Box>
    );
};

export default ReviewsView;
