"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Box, InputAdornment, TextField, Typography, Button, CircularProgress, Alert } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import AnnouncementItem from "./AnnouncementItem"
import AnnouncementDetail from "./AnnouncementDetail"
import { noticeApi } from "@/service/support/notice/noticeApi.ts"
import { convertNoticesToAnnouncements, Announcement } from "@/service/support/notice/noticeMapper.ts"

const AnnouncementsTab: React.FC = () => {
    // 상태 관리
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState<"latest" | "oldest" | "views">("latest")

    // 공지사항 목록 조회
    const fetchAnnouncements = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await noticeApi.getNotices({
                page: 0,
                size: 10, // 적당한 개수
                search: searchTerm || undefined,
                sortBy: sortBy
            })

            const convertedAnnouncements = convertNoticesToAnnouncements(response.notices)
            setAnnouncements(convertedAnnouncements)

            console.log('✅ 공지사항 목록 조회 성공:', response)
        } catch (err: any) {
            setError(`공지사항을 불러오는데 실패했습니다: ${err.message}`)
            console.error('❌ 공지사항 목록 조회 실패:', err)
        } finally {
            setLoading(false)
        }
    }

    // 공지사항 상세 조회 (조회수 증가)
    const fetchAnnouncementDetail = async (announcement: Announcement) => {
        try {
            // 백엔드에서 상세 정보 조회 (조회수 증가)
            const detailNotice = await noticeApi.getNotice(announcement.id.toString())

            // 변환해서 선택된 공지사항으로 설정
            const convertedDetail = convertNoticesToAnnouncements([detailNotice])[0]
            setSelectedAnnouncement(convertedDetail)

            // 목록도 업데이트 (조회수 반영)
            setAnnouncements(prev =>
                prev.map(item =>
                    item.id === announcement.id
                        ? { ...item, views: detailNotice.viewCount }
                        : item
                )
            )

            console.log('✅ 공지사항 상세 조회 성공:', detailNotice)
        } catch (err: any) {
            console.error('❌ 공지사항 상세 조회 실패:', err)
            // 실패해도 기존 데이터로라도 상세 페이지는 보여주기
            setSelectedAnnouncement(announcement)
        }
    }

    // 검색어 변경 핸들러
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value)
    }

    // 검색 실행 (엔터키 또는 디바운스)
    const handleSearchSubmit = () => {
        fetchAnnouncements()
    }

    // 정렬 변경 핸들러
    const handleSortChange = (newSortBy: "latest" | "oldest" | "views") => {
        setSortBy(newSortBy)
    }

    // 목록으로 돌아가기 핸들러
    const handleBackToList = () => {
        setSelectedAnnouncement(null)
    }

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchAnnouncements()
    }, []) // 빈 배열: 최초 1회만 실행

    // 정렬 방식 변경 시 재조회
    useEffect(() => {
        if (!loading) { // 최초 로딩이 아닐 때만
            fetchAnnouncements()
        }
    }, [sortBy])

    // 엔터키 핸들링
    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSearchSubmit()
        }
    }

    return (
        <Box sx={{ pt: 3 }}>
            <Typography variant="h5" fontWeight={600} sx={{ color: "#1c140d", mb: 3 }}>
                공지사항
            </Typography>

            {/* 에러 표시 */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                    <Button
                        size="small"
                        onClick={fetchAnnouncements}
                        sx={{ ml: 2 }}
                    >
                        다시 시도
                    </Button>
                </Alert>
            )}

            {selectedAnnouncement ? (
                // 공지사항 상세 보기
                <AnnouncementDetail announcement={selectedAnnouncement} onBack={handleBackToList} />
            ) : (
                // 공지사항 목록
                <>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Box sx={{ position: "relative", width: { xs: "100%", md: "66.666667%" }, mb: { xs: 2, md: 0 } }}>
                            <TextField
                                fullWidth
                                placeholder="공지사항 검색"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyPress={handleKeyPress}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: "#9c7349" }} />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        pl: 1,
                                        borderRadius: 4,
                                        bgcolor: "#fcfaf8",
                                        height: 48,
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#e8dbce",
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#e8dbce",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "#f38b24",
                                            borderWidth: 2,
                                        },
                                    },
                                }}
                            />
                        </Box>
                        <Typography variant="body2" sx={{ color: "#9c7349" }}>
                            총{" "}
                            <Box component="span" sx={{ fontWeight: 600, color: "#1c140d" }}>
                                {announcements.length}
                            </Box>
                            개
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
                        <Button
                            variant="contained"
                            onClick={() => handleSortChange("latest")}
                            sx={{
                                bgcolor: sortBy === "latest" ? "#f38b24" : "#f4ede7",
                                color: sortBy === "latest" ? "white" : "#1c140d",
                                "&:hover": {
                                    bgcolor: sortBy === "latest" ? "#e07b1a" : "#e8dbce"
                                },
                                height: 40,
                                borderRadius: 2,
                                px: 2,
                                fontSize: "0.875rem",
                            }}
                        >
                            최신순
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => handleSortChange("oldest")}
                            sx={{
                                bgcolor: sortBy === "oldest" ? "#f38b24" : "#f4ede7",
                                color: sortBy === "oldest" ? "white" : "#1c140d",
                                "&:hover": {
                                    bgcolor: sortBy === "oldest" ? "#e07b1a" : "#e8dbce"
                                },
                                height: 40,
                                borderRadius: 2,
                                px: 2,
                                fontSize: "0.875rem",
                            }}
                        >
                            오래된순
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => handleSortChange("views")}
                            sx={{
                                bgcolor: sortBy === "views" ? "#f38b24" : "#f4ede7",
                                color: sortBy === "views" ? "white" : "#1c140d",
                                "&:hover": {
                                    bgcolor: sortBy === "views" ? "#e07b1a" : "#e8dbce"
                                },
                                height: 40,
                                borderRadius: 2,
                                px: 2,
                                fontSize: "0.875rem",
                            }}
                        >
                            조회순
                        </Button>
                    </Box>

                    {/* 로딩 상태 */}
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                            <CircularProgress sx={{ color: "#f38b24" }} />
                        </Box>
                    ) : announcements.length === 0 ? (
                        /* 데이터 없음 */
                        <Box sx={{
                            textAlign: "center",
                            py: 8,
                            color: "#9c7349"
                        }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                공지사항이 없습니다
                            </Typography>
                            <Typography variant="body2">
                                {searchTerm ? '검색 결과가 없습니다' : '등록된 공지사항이 없습니다'}
                            </Typography>
                        </Box>
                    ) : (
                        /* 공지사항 목록 */
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 6 }}>
                            {announcements.map((announcement) => (
                                <AnnouncementItem
                                    key={announcement.id}
                                    announcement={announcement}
                                    onClick={() => fetchAnnouncementDetail(announcement)}
                                />
                            ))}
                        </Box>
                    )}
                </>
            )}
        </Box>
    )
}

export default AnnouncementsTab