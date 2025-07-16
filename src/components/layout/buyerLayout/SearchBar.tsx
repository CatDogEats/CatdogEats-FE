"use client"

import type React from "react"
import { Box, TextField, InputAdornment, IconButton } from "@mui/material"
import { Search as SearchIcon } from "@mui/icons-material"

interface SearchBarProps {
    searchQuery: string
    setSearchQuery: (query: string) => void
    onSearch: (e: React.FormEvent) => void
    isSmall?: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, onSearch, isSmall = false }) => {
    if (isSmall) {
        return (
            <IconButton
                size="small"
                sx={{
                    color: "text.secondary",
                    "&:hover": {
                        color: "primary.main",
                        backgroundColor: "grey.50",
                    },
                }}
            >
                <SearchIcon fontSize="small" />
            </IconButton>
        )
    }

    return (
        <Box component="form" onSubmit={onSearch}>
            <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="간식 검색..."
                size="small"
                sx={{
                    width: { sm: 200, md: 250 },
                    "& .MuiOutlinedInput-root": {
                        backgroundColor: "#f5f5f5",
                        borderRadius: "20px",
                        fontSize: "0.875rem",
                        "& fieldset": {
                            border: "none",
                        },
                        "&:hover fieldset": {
                            border: "none",
                        },
                        "&.Mui-focused fieldset": {
                            border: "1px solid #e89830",
                        },
                        "& input": {
                            fontSize: "0.875rem",
                            py: "8px",
                        },
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: "18px", color: "#999" }} />
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    )
}

export default SearchBar
