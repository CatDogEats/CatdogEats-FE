import type React from "react"
import { useEffect, useState } from "react"
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Pagination
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import FAQItem from "./FAQItem"
import { useFaqStore, initializeFaqStore } from "@/service/support/faq/faqStore"
import { CATEGORY_DISPLAY_MAP } from "@/types/faq"

const FAQTab: React.FC = () => {
    // Zustand store 사용
    const {
        faqs,
        loading,
        error,
        selectedCategory,
        searchKeyword,
        popularKeywords,
        currentPage,
        totalPages,
        setCategory,
        searchFaqs,
        clearSearch,
        handlePopularKeywordClick,
        setPage
    } = useFaqStore();

    // 로컬 상태 (검색 입력값)
    const [searchInput, setSearchInput] = useState("");

    // 컴포넌트 마운트 시 초기 데이터 로드
    useEffect(() => {
        initializeFaqStore();
    }, []);

    // 검색 키워드가 변경되면 입력값 동기화
    useEffect(() => {
        setSearchInput(searchKeyword);
    }, [searchKeyword]);

    // 검색 핸들러
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            searchFaqs(searchInput);
        }
    };

    // 검색어 입력 핸들러
    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
        // 입력값이 비어있으면 검색 초기화
        if (!e.target.value.trim() && searchKeyword) {
            clearSearch();
        }
    };

    // Enter 키 핸들러
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(e as any);
        }
    };

    // 카테고리 버튼 렌더링
    const renderCategoryButtons = () => {
        return Object.values(CATEGORY_DISPLAY_MAP).map((category) => (
            <Button
                key={category.value}
                variant="contained"
                onClick={() => setCategory(category.value)}
                sx={{
                    bgcolor: selectedCategory === category.value ? "#f38b24" : "#f4ede7",
                    color: selectedCategory === category.value ? "white" : "#1c140d",
                    "&:hover": {
                        bgcolor: selectedCategory === category.value ? "#e07b1a" : "#e8dbce"
                    },
                    height: 40,
                    borderRadius: 2,
                    px: 2,
                    fontSize: "0.875rem",
                }}
            >
                {category.label}
            </Button>
        ));
    };

    // 페이지네이션 핸들러
    const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
        setPage(page - 1); // MUI Pagination은 1부터 시작, 백엔드는 0부터
    };

    return (
        <Box sx={{ pt: 3 }}>
            <Typography variant="h5" fontWeight={600} sx={{ color: "#1c140d", mb: 3 }}>
                자주 묻는 질문 (FAQ)
            </Typography>

            {/* 검색 입력 */}
            <Box
                component="form"
                onSubmit={handleSearch}
                sx={{ position: "relative", width: "100%", mb: 3 }}
            >
                <TextField
                    fullWidth
                    placeholder="궁금한 점을 검색해보세요"
                    value={searchInput}
                    onChange={handleSearchInputChange}
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

            {/* 인기 검색어 */}
            {popularKeywords.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ color: "#9c7349", mr: 1 }}>
                        인기 검색어:
                    </Typography>
                    {popularKeywords.map((keyword, index) => (
                        <Chip
                            key={index}
                            label={keyword}
                            size="small"
                            onClick={() => handlePopularKeywordClick(keyword)}
                            sx={{
                                bgcolor: "#f4ede7",
                                color: "#1c140d",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                "&:hover": { bgcolor: "#e8dbce" },
                            }}
                            clickable
                        />
                    ))}
                </Box>
            )}

            {/* 카테고리 필터 */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
                {renderCategoryButtons()}
            </Box>

            {/* 에러 메시지 */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* 로딩 상태 */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress sx={{ color: "#f38b24" }} />
                </Box>
            )}

            {/* FAQ 목록 */}
            {!loading && (
                <>
                    {/* 검색 결과 정보 */}
                    {searchKeyword && (
                        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" sx={{ color: "#9c7349" }}>
                                '{searchKeyword}' 검색 결과: {faqs.length}개
                            </Typography>
                            <Button
                                size="small"
                                onClick={clearSearch}
                                sx={{
                                    color: "#f38b24",
                                    minWidth: "auto",
                                    p: 0.5
                                }}
                            >
                                검색 초기화
                            </Button>
                        </Box>
                    )}

                    {/* FAQ 아이템 목록 */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pb: 3 }}>
                        {faqs.length > 0 ? (
                            faqs.map((faq) => (
                                <FAQItem key={faq.id} faq={faq} />
                            ))
                        ) : (
                            <Box sx={{ textAlign: "center", py: 4 }}>
                                <Typography variant="body1" sx={{ color: "#9c7349" }}>
                                    {searchKeyword
                                        ? "검색 결과가 없습니다."
                                        : "등록된 FAQ가 없습니다."}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <Box sx={{ display: "flex", justifyContent: "center", pb: 6 }}>
                            <Pagination
                                count={totalPages}
                                page={currentPage + 1} // MUI는 1부터 시작
                                onChange={handlePageChange}
                                color="primary"
                                sx={{
                                    "& .MuiPaginationItem-root": {
                                        color: "#9c7349",
                                    },
                                    "& .Mui-selected": {
                                        bgcolor: "#f38b24 !important",
                                        color: "white",
                                    },
                                }}
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    )
}

export default FAQTab