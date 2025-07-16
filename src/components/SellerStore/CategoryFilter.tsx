import React from 'react';
import {
    Box,
    Chip,
    Stack,
    Typography,
} from '@mui/material';

interface CategoryFilterProps {
    selectedCategories: {
        dog: boolean;
        cat: boolean;
        handmade: boolean;
        finished: boolean;
    };
    onCategoryChange: (category: string, selected: boolean) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
                                                           selectedCategories,
                                                           onCategoryChange,
                                                       }) => {
    const allCategories = [
        {
            key: 'dog',
            label: '강아지',
            color: '#ff9800' as const,
        },
        {
            key: 'cat',
            label: '고양이',
            color: '#ff9800' as const,
        },
        {
            key: 'handmade',
            label: '수제품',
            color: '#ff9800' as const,
        },
        {
            key: 'finished',
            label: '완제품',
            color: '#ff9800' as const,
        },
    ];

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.875rem' }}>
                카테고리
            </Typography>

            {/* 모든 카테고리를 한 줄로 배치 */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {allCategories.map((category) => (
                    <Chip
                        key={category.key}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span>{category.label}</span>
                            </Box>
                        }
                        variant={selectedCategories[category.key as keyof typeof selectedCategories] ? 'filled' : 'outlined'}
                        onClick={() => onCategoryChange(category.key, !selectedCategories[category.key as keyof typeof selectedCategories])}
                        sx={{
                            borderColor: category.color,
                            color: selectedCategories[category.key as keyof typeof selectedCategories] ? 'white' : category.color,
                            backgroundColor: selectedCategories[category.key as keyof typeof selectedCategories] ? category.color : 'transparent',
                            '&:hover': {
                                backgroundColor: selectedCategories[category.key as keyof typeof selectedCategories]
                                    ? category.color
                                    : `${category.color}15`,
                            },
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minHeight: 32,
                            fontSize: '0.875rem',
                        }}
                    />
                ))}
            </Stack>
        </Box>
    );
};

export default CategoryFilter;