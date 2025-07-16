import React from "react";
import {
    Box,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import { ChevronRight as ChevronRightIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface SubItem {
    label: string;
    path?: string;
    subItems?: SubItem[];
}

interface NavigationItem {
    label: string;
    path?: string;
    action?: () => void;
    subItems?: SubItem[];
}

interface DropdownMenuProps {
    navigationItems: NavigationItem[];
    menuOpen: boolean;
    hoveredCategory: string | null;
    hoveredSubCategory: string | null;
    setHoveredCategory: (category: string | null) => void;
    setHoveredSubCategory: (subCategory: string | null) => void;
    setMenuOpen: (open: boolean) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
                                                       navigationItems,
                                                       menuOpen,
                                                       hoveredCategory,
                                                       hoveredSubCategory,
                                                       setHoveredCategory,
                                                       setHoveredSubCategory,
                                                       setMenuOpen,
                                                   }) => {
    const navigate = useNavigate();

    if (!menuOpen) return null;

    return (
        <Box
            sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                minWidth: "180px",
                backgroundColor: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 1000,
                borderTop: "1px solid",
                borderTopColor: "grey.200",
                borderRadius: "0 0 8px 8px",
            }}
        >
            <List sx={{ py: 0 }}>
                {navigationItems.map((item, index) => (
                    <Box key={item.label} sx={{ position: "relative" }}>
                        {/* 1차 메뉴 */}
                        <ListItem
                            onClick={() => {
                                if (item.action) item.action();
                                if (item.path) {
                                    navigate(item.path);
                                }
                                setMenuOpen(false);
                                setHoveredCategory(null);
                                setHoveredSubCategory(null);
                            }}
                            onMouseEnter={() => {
                                if (item.subItems) setHoveredCategory(item.label);
                            }}
                            onMouseLeave={() => {
                                if (item.subItems) {
                                    setHoveredCategory(null);
                                    setHoveredSubCategory(null);
                                }
                            }}
                            sx={{
                                cursor: "pointer",
                                py: 2,
                                px: 3,
                                borderBottom: index < navigationItems.length - 1 ? "1px solid" : "none",
                                borderBottomColor: "grey.100",
                                "&:hover": { backgroundColor: "grey.50" },
                                whiteSpace: "nowrap",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontSize: "0.875rem",
                                    fontWeight: 400,
                                    color: "text.primary",
                                }}
                            />
                            {item.subItems && (
                                <ChevronRightIcon sx={{ fontSize: "16px", color: "#999" }} />
                            )}
                        </ListItem>

                        {/* 1차 서브메뉴 */}
                        {hoveredCategory === item.label && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: "100%",
                                    minWidth: "150px",
                                    backgroundColor: "white",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    zIndex: 1001,
                                    borderRadius: "8px",
                                    border: "1px solid",
                                    borderColor: "grey.200",
                                }}
                                onMouseEnter={() => setHoveredCategory(item.label)}
                                onMouseLeave={() => {
                                    setHoveredCategory(null);
                                    setHoveredSubCategory(null);
                                }}
                            >
                                <List sx={{ py: 0 }}>
                                    {(item.subItems || []).map((subItem, subIndex) => (
                                        <Box key={subItem.label} sx={{ position: "relative" }}>
                                            <ListItem
                                                onClick={() => {
                                                    if (subItem.path) {
                                                        navigate(subItem.path);
                                                    }
                                                    setMenuOpen(false);
                                                    setHoveredCategory(null);
                                                    setHoveredSubCategory(null);
                                                }}
                                                onMouseEnter={() => {
                                                    if (subItem.subItems) setHoveredSubCategory(subItem.label);
                                                }}
                                                onMouseLeave={() => {
                                                    if (subItem.subItems) setHoveredSubCategory(null);
                                                }}
                                                sx={{
                                                    cursor: "pointer",
                                                    py: 1.5,
                                                    px: 2.5,
                                                    borderBottom: subIndex < (item.subItems || []).length - 1
                                                        ? "1px solid" : "none",
                                                    borderBottomColor: "grey.100",
                                                    "&:hover": { backgroundColor: "grey.50" },
                                                    whiteSpace: "nowrap",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <ListItemText
                                                    primary={subItem.label}
                                                    primaryTypographyProps={{
                                                        fontSize: "0.8rem",
                                                        fontWeight: 400,
                                                        color: "text.primary",
                                                    }}
                                                />
                                                {subItem.subItems && (
                                                    <ChevronRightIcon
                                                        sx={{ fontSize: "14px", color: "#999" }}
                                                    />
                                                )}
                                            </ListItem>
                                            {/* 2차 서브메뉴 */}
                                            {hoveredSubCategory === subItem.label && (
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        top: 0,
                                                        left: "100%",
                                                        minWidth: "120px",
                                                        backgroundColor: "white",
                                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                        zIndex: 1002,
                                                        borderRadius: "8px",
                                                        border: "1px solid",
                                                        borderColor: "grey.200",
                                                    }}
                                                    onMouseEnter={() =>
                                                        setHoveredSubCategory(subItem.label)
                                                    }
                                                    onMouseLeave={() =>
                                                        setHoveredSubCategory(null)
                                                    }
                                                >
                                                    <List sx={{ py: 0 }}>
                                                        {(subItem.subItems || []).map(
                                                            (subSubItem, subSubIndex) => (
                                                                <ListItem
                                                                    key={subSubItem.label}
                                                                    onClick={() => {
                                                                        if (subSubItem.path) {
                                                                            navigate(subSubItem.path);
                                                                        }
                                                                        setMenuOpen(false);
                                                                        setHoveredCategory(null);
                                                                        setHoveredSubCategory(null);
                                                                    }}
                                                                    sx={{
                                                                        cursor: "pointer",
                                                                        py: 1.5,
                                                                        px: 2,
                                                                        borderBottom:
                                                                            subSubIndex <
                                                                            (subItem.subItems || []).length - 1
                                                                                ? "1px solid"
                                                                                : "none",
                                                                        borderBottomColor: "grey.100",
                                                                        "&:hover": {
                                                                            backgroundColor: "grey.50",
                                                                        },
                                                                        whiteSpace: "nowrap",
                                                                    }}
                                                                >
                                                                    <ListItemText
                                                                        primary={subSubItem.label}
                                                                        primaryTypographyProps={{
                                                                            fontSize: "0.75rem",
                                                                            fontWeight: 400,
                                                                            color: "text.primary",
                                                                        }}
                                                                    />
                                                                </ListItem>
                                                            )
                                                        )}
                                                    </List>
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </List>
                            </Box>
                        )}
                    </Box>
                ))}
            </List>
        </Box>
    );
};

export default DropdownMenu;
