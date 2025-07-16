// src/components/SellerDashboard/settlement/components/TableSkeleton.tsx
import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Skeleton,
    useTheme
} from '@mui/material';

interface TableSkeletonProps {
    columns: string[]; // 컬럼 헤더 배열
    rowCount?: number; // 표시할 스켈레톤 행 개수
    showHeader?: boolean; // 헤더 표시 여부
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
                                                         columns,
                                                         rowCount = 5,
                                                         showHeader = true
                                                     }) => {
    const theme = useTheme();

    return (
        <TableContainer
            component={Paper}
            sx={{
                mb: 3,
                maxHeight: 400,
                border: `1px solid ${theme.palette.grey[200]}`
            }}
        >
            <Table stickyHeader size="small">
                {showHeader && (
                    <TableHead>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableCell
                                    key={index}
                                    sx={{
                                        fontWeight: 600,
                                        backgroundColor: theme.palette.grey[100]
                                    }}
                                >
                                    {column}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                )}
                <TableBody>
                    {Array.from({ length: rowCount }).map((_, rowIndex) => (
                        <TableRow
                            key={rowIndex}
                            sx={{
                                '&:nth-of-type(odd)': {
                                    backgroundColor: theme.palette.background.default
                                }
                            }}
                        >
                            {columns.map((_, colIndex) => (
                                <TableCell key={colIndex}>
                                    <Skeleton
                                        variant="text"
                                        width={
                                            // 컬럼별로 다른 너비 적용
                                            colIndex === 0 ? '80%' : // 주문번호
                                                colIndex === 1 ? '90%' : // 상품명
                                                    colIndex === 2 || colIndex === 3 || colIndex === 4 ? '60%' : // 금액 관련
                                                        colIndex === 5 || colIndex === 6 || colIndex === 7 ? '70%' : // 날짜 (주문일, 배송완료일, 정산생성일)
                                                            '50%' // 상태
                                        }
                                        height={20}
                                        sx={{
                                            borderRadius: 1,
                                            // 애니메이션 지연으로 자연스러운 효과
                                            animationDelay: `${rowIndex * 100 + colIndex * 50}ms`
                                        }}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TableSkeleton;