// src/components/Account/OrderItem.tsx
"use client";

import React from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    Avatar,
    IconButton,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from "@mui/material";
import { ChevronRight, MoreVert } from "@mui/icons-material";
import type { Order } from "@/types/buyerOrder.types";

interface OrderItemProps {
    order: Order;
    handleOrderAction: (action: string, order: Order) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, handleOrderAction }) => {
    // 상태별 한글 레이블 매핑
    const statusLabel = (() => {
        const st = order.shippingStatus?.toLowerCase() || order.shippingStatus?.toLowerCase();
        if (st === "delivered") return "배송완료";
        if (st === "in_delivery" || st === "in_transit") return "배송중";
        if (st === "preparing") return "상품준비중";
        if (st === "ready_for_delivery") return "배송 준비 완료";
        return "결제완료";
    })();

    // 도착일 요일 한글
    const weekdayKor = ["일", "월", "화", "수", "목", "금", "토"];

    // 주문일자 안전 처리
    const orderDateStr = order.orderDate?.split("T")[0] || order.date?.split("T")[0] || "날짜 정보 없음";

    // 도착일 표시 문자열 생성
    const deliveredDate = order.deliveredAt || order.arrivalDate || order.deliveredAt;
    const deliveredStr = deliveredDate
        ? (() => {
            const d = new Date(deliveredDate);
            return `${d.getMonth() + 1}/${d.getDate()}(${weekdayKor[d.getDay()]}) 도착`;
        })()
        : "배송완료";

    // 상품 정보 처리 (API 데이터 또는 기존 형식)
    const products = order.products ||
        (order.orderItemsInfo ? order.orderItemsInfo.map((item: any) => ({
            id: item.orderItemId,
            name: item.productName,
            price: item.unitPrice,
            quantity: item.quantity,
            image: item.productImage,
        })) : []);

    return (
        <Paper style={{ marginBottom: 16 }}>
            <Box style={{ padding: 24 }}>
                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <Typography variant="h6" style={{ fontWeight: 600 }}>
                        {orderDateStr}
                    </Typography>
                    <Button
                        variant="text"
                        color="primary"
                        size="small"
                        endIcon={<ChevronRight />}
                        onClick={() => handleOrderAction("detail", order)}
                    >
                        주문 상세보기
                    </Button>
                </Box>
                <Divider style={{ marginBottom: 16 }} />

                <TableContainer>
                    <Table style={{ minWidth: 650, borderCollapse: "separate" }}>
                        <TableBody>
                            <TableRow>
                                <TableCell style={{ verticalAlign: "top", width: "70%", borderBottom: "none" }}>
                                    <Box
                                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}
                                    >
                                        <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <Typography variant="h6" style={{ fontWeight: 600, color: "#111111" }}>
                                                {statusLabel}
                                            </Typography>
                                            {statusLabel === "배송완료" && (
                                                <Typography variant="body2" style={{ color: "#008C00" }}>
                                                    {deliveredStr}
                                                </Typography>
                                            )}
                                        </Box>
                                        <IconButton size="small">
                                            <MoreVert />
                                        </IconButton>
                                    </Box>

                                    {products.length > 0 ? (
                                        products.map((product: any, index: number) => (
                                            <Box key={product.id || index}>
                                                <Box style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 24 }}>
                                                    <Avatar
                                                        src={product.image}
                                                        variant="rounded"
                                                        style={{ width: 80, height: 80, backgroundColor: "#f5f5f5" }}
                                                    />
                                                    <Box
                                                        style={{
                                                            flexGrow: 1,
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            justifyContent: "space-between",
                                                            minHeight: "80px",
                                                        }}
                                                    >
                                                        <Box>
                                                            <Box style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                                <Typography variant="body1" style={{ fontWeight: 500 }}>
                                                                    {product.name}
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {product.price > 0 ? `${product.price.toLocaleString()}원` : "0원"} {product.quantity}개
                                                            </Typography>
                                                        </Box>
                                                        <Box style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                style={{
                                                                    borderColor: "#ff9800",
                                                                    color: "#ff9800",
                                                                }}
                                                            >
                                                                장바구니 담기
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                {index < products.length - 1 && <Divider style={{ marginBottom: 16 }} />}
                                            </Box>
                                        ))
                                    ) : (
                                        // 기존 단일 상품 표시 방식 (API 데이터가 없는 경우)
                                        <Box style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 24 }}>
                                            <Box
                                                style={{
                                                    width: 80,
                                                    height: 80,
                                                    backgroundColor: "#f5f5f5",
                                                    borderRadius: 8,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Box
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        backgroundColor: "#ddd",
                                                        borderRadius: 4,
                                                    }}
                                                />
                                            </Box>
                                            <Box
                                                style={{
                                                    flexGrow: 1,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent: "space-between",
                                                    minHeight: "80px",
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="body1" style={{ fontWeight: 500, marginBottom: 8 }}>
                                                        {order.orderItemsInfo || order.productName || "상품명 정보 없음"}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {order.totalAmount
                                                            ? `${order.totalAmount.toLocaleString()}원 ${order.quantity || 1}개`
                                                            : order.amount
                                                                ? `${order.amount.toLocaleString()}원 ${order.quantity || 1}개`
                                                                : order.total
                                                                    ? `${order.total.toLocaleString()}원 ${order.quantity || 1}개`
                                                                    : "금액 정보 없음"}
                                                    </Typography>
                                                </Box>
                                                <Box style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        style={{
                                                            borderColor: "#ff9800",
                                                            color: "#ff9800",
                                                        }}
                                                    >
                                                        장바구니 담기
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                </TableCell>

                                <TableCell
                                    style={{
                                        verticalAlign: "middle",
                                        width: "30%",
                                        borderLeft: "1px solid rgba(224, 224, 224, 1)",
                                        paddingLeft: 24,
                                        borderBottom: "none",
                                    }}
                                >
                                    <Box style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleOrderAction("shipping", order)}
                                            style={{
                                                borderColor: "#ff9800",
                                                color: "#ff9800",
                                                padding: "8px 16px",
                                            }}
                                        >
                                            배송조회
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleOrderAction("return", order)}
                                            style={{
                                                borderColor: "#ff9800",
                                                color: "#ff9800",
                                                padding: "8px 16px",
                                            }}
                                        >
                                            교환, 반품 신청
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleOrderAction("review", order)}
                                            style={{
                                                borderColor: "#ff9800",
                                                color: "#ff9800",
                                                padding: "8px 16px",
                                            }}
                                        >
                                            리뷰 작성하기
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Paper>
    );
};

export default OrderItem;