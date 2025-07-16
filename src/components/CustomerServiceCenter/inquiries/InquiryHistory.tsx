"use client"

import type React from "react"
import { useEffect } from "react"
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Pagination,
    Chip,
    Fade
} from "@mui/material"
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// 타입 및 스토어 import
import {
    InquiryListResponseDTO,
    InquiryDetailResponseDTO,
    InquiryStatus,
    InquiryPageParams
} from '@/types/inquiry'
import {
    useInquiryListStore,
    useInquiryDetailStore
} from '@/service/support/inquiry/inquiryStore'

// 컴포넌트 import
import InquiryDetail from "./InquiryDetail"

const InquiryHistory: React.FC = () => {
    // Zustand 스토어
    const {
        inquiries,
        totalElements,
        totalPages,
        currentPage,
        loading: listLoading,
        error: listError,
        fetchInquiries,
        setPage
    } = useInquiryListStore()

    const {
        inquiry: selectedInquiry,
        loading: detailLoading,
        error: detailError,
        fetchInquiryDetail,
        clearInquiryDetail
    } = useInquiryDetailStore()

    const pageSize = 10

    useEffect(() => {
        const params: InquiryPageParams = {
            page: 0,
            size: pageSize,
            sort: 'createdAt',
            direction: 'desc'
        }
        fetchInquiries(params)
    }, [fetchInquiries])

    const handleSelectInquiry = async (inquiry: InquiryListResponseDTO) => {
        if (selectedInquiry?.inquiryId === inquiry.inquiryId) {
            clearInquiryDetail()
            return
        }

        try {
            await fetchInquiryDetail(inquiry.inquiryId)
        } catch (error) {
            console.error('문의 상세 조회 실패:', error)
        }
    }

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setPage(page - 1)
        clearInquiryDetail()
    }

    // 상태별 스타일 개선
    const getStatusStyle = (status: string) => {
        switch (status) {
            case '답변 대기중':
            case 'PENDING':
                return {
                    color: "#dc2626",
                    bgcolor: "#fee2e2",
                    icon: <AccessTimeIcon sx={{ fontSize: 14 }} />
                }
            case '답변 완료':
            case 'ANSWERED':
                return {
                    color: "#059669",
                    bgcolor: "#d1fae5",
                    icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                }
            case '추가 문의':
            case 'FOLLOWUP':
                return {
                    color: "#d97706",
                    bgcolor: "#fed7aa"
                }
            case '종료':
            case 'CLOSED':
            case '강제 종료':
            case 'FORCE_CLOSED':
                return {
                    color: "#6b7280",
                    bgcolor: "#f3f4f6"
                }
            default:
                return {
                    color: "text.secondary",
                    bgcolor: "grey.100"
                }
        }
    }

    const getStatusText = (status: string) => {
        return status || "알 수 없음"
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* 헤더 영역 */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" fontWeight={600} sx={{ color: "text.primary" }}>
                    문의 내역
                    {totalElements > 0 && (
                        <Typography component="span" sx={{ ml: 1, color: "text.secondary", fontSize: "0.875rem" }}>
                            총 {totalElements}건
                        </Typography>
                    )}
                </Typography>
            </Box>

            {/* 에러 메시지 */}
            {listError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {listError}
                </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
                {/* 문의 목록 영역 */}
                <Fade in timeout={300}>
                    <Paper
                        elevation={0}
                        sx={{
                            width: { xs: "100%", md: "350px" },
                            border: "1px solid",
                            borderColor: "grey.100",
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            height: { md: "600px" },
                            transition: "all 0.3s ease",
                            "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            },
                        }}
                    >
                        {/* 목록 헤더 */}
                        <Box
                            sx={{
                                p: 2.5,
                                borderBottom: "1px solid",
                                borderBottomColor: "grey.100",
                                bgcolor: "grey.50"
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={600} sx={{ color: "text.primary" }}>
                                전체 문의
                            </Typography>
                        </Box>

                        {/* 로딩 상태 */}
                        {listLoading && (
                            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                                <CircularProgress size={32} sx={{ color: "primary.main" }} />
                            </Box>
                        )}

                        {/* 목록이 비어있는 경우 */}
                        {!listLoading && inquiries.length === 0 && (
                            <Box sx={{ p: 4, textAlign: "center" }}>
                                <Typography sx={{ color: "text.secondary" }}>
                                    등록된 문의가 없습니다.
                                </Typography>
                            </Box>
                        )}

                        {/* 문의 목록 */}
                        {!listLoading && inquiries.length > 0 && (
                            <Box
                                sx={{
                                    overflowY: "auto",
                                    flexGrow: 1,
                                    "&::-webkit-scrollbar": {
                                        width: "8px",
                                    },
                                    "&::-webkit-scrollbar-track": {
                                        backgroundColor: "transparent",
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        backgroundColor: "grey.300",
                                        borderRadius: "4px",
                                        "&:hover": {
                                            backgroundColor: "grey.400",
                                        },
                                    },
                                }}
                            >
                                {inquiries.map((inquiry) => {
                                    const statusStyle = getStatusStyle(inquiry.inquiryStatus)
                                    const isSelected = selectedInquiry?.inquiryId === inquiry.inquiryId

                                    return (
                                        <Box
                                            key={inquiry.inquiryId}
                                            sx={{
                                                p: 2.5,
                                                cursor: "pointer",
                                                bgcolor: isSelected ? "primary.50" : "transparent",
                                                borderLeft: "3px solid",
                                                borderLeftColor: isSelected ? "primary.main" : "transparent",
                                                borderBottom: "1px solid",
                                                borderBottomColor: "grey.100",
                                                transition: "all 0.2s ease",
                                                "&:hover": {
                                                    bgcolor: isSelected ? "primary.50" : "grey.50",
                                                    transform: "translateX(2px)",
                                                },
                                            }}
                                            onClick={() => handleSelectInquiry(inquiry)}
                                        >
                                            {/* 제목과 날짜 */}
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={isSelected ? 600 : 500}
                                                    sx={{
                                                        color: "text.primary",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        flex: 1,
                                                        mr: 1,
                                                    }}
                                                >
                                                    {inquiry.title}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "text.secondary",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {new Date(inquiry.createdAt).toLocaleDateString('ko-KR', {
                                                        month: 'numeric',
                                                        day: 'numeric'
                                                    })}
                                                </Typography>
                                            </Box>

                                            {/* 내용 미리보기 */}
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "text.secondary",
                                                    display: "block",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    mb: 1.5,
                                                }}
                                            >
                                                {inquiry.contentPreview}
                                            </Typography>

                                            {/* 상태 태그 */}
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <Chip
                                                    size="small"
                                                    label={getStatusText(inquiry.inquiryStatus)}
                                                    icon={statusStyle.icon}
                                                    sx={{
                                                        height: 24,
                                                        fontSize: "0.75rem",
                                                        fontWeight: 600,
                                                        color: statusStyle.color,
                                                        bgcolor: statusStyle.bgcolor,
                                                        border: "none",
                                                        "& .MuiChip-icon": {
                                                            color: statusStyle.color,
                                                        },
                                                    }}
                                                />
                                                {inquiry.hasReply && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "success.main",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        답변 완료
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    )
                                })}
                            </Box>
                        )}
                    </Paper>
                </Fade>

                {/* 상세 내역 영역 */}
                <Fade in timeout={500}>
                    <Paper
                        elevation={0}
                        sx={{
                            flex: 1,
                            border: "1px solid",
                            borderColor: "grey.100",
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            overflow: "auto",
                            maxHeight: { md: "600px" },
                            transition: "all 0.3s ease",
                            "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            },
                        }}
                    >
                        {detailLoading && (
                            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                                <CircularProgress size={32} sx={{ color: "primary.main" }} />
                            </Box>
                        )}

                        {detailError && (
                            <Box sx={{ p: 3 }}>
                                <Alert severity="error">
                                    {detailError}
                                </Alert>
                            </Box>
                        )}

                        {!detailLoading && !detailError && selectedInquiry && (
                            <InquiryDetail inquiry={selectedInquiry} />
                        )}

                        {!detailLoading && !detailError && !selectedInquiry && (
                            <Box sx={{
                                p: 4,
                                textAlign: "center",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                minHeight: 300,
                            }}>
                                <Typography sx={{ color: "text.secondary", mb: 1 }}>
                                    왼쪽 목록에서 문의를 선택해주세요
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.disabled" }}>
                                    문의 내용과 답변을 확인할 수 있습니다
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Fade>
            </Box>

            {/* 페이지네이션 */}
            {!listLoading && totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage + 1}
                        onChange={handlePageChange}
                        color="primary"
                        sx={{
                            "& .MuiPaginationItem-root": {
                                borderRadius: 1,
                                "&:hover": {
                                    backgroundColor: "primary.50",
                                },
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    )
}

export default InquiryHistory