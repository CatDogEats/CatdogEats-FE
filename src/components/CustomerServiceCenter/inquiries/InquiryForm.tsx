"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
    Box,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Paper,
    InputAdornment,
    IconButton,
    Radio,
    RadioGroup,
    FormControlLabel,
    Divider,
    Alert,
    CircularProgress,
} from "@mui/material"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import CloseIcon from "@mui/icons-material/Close"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"

// 타입 및 스토어 import
import {
    InquiryType,
    InquiryReceiveMethod,
    InquiryFormData,
    InquiryFormErrors
} from '@/types/inquiry'
import { useInquiryFormStore } from '@/service/support/inquiry/inquiryStore'
import { fileUtils } from '@/service/support/inquiry/inquiryApi'

interface FilePreview {
    file: File
    name: string
    url: string
}

const InquiryForm: React.FC = () => {
    // Zustand 스토어
    const {
        loading,
        success,
        error,
        createInquiry,
        resetFormState
    } = useInquiryFormStore()

    // 폼 상태
    const [formData, setFormData] = useState<InquiryFormData>({
        title: '',
        content: '',
        inquiryType: InquiryType.PRODUCT,
        inquiryReceiveMethod: InquiryReceiveMethod.WEB,
        orderId: '',
        imageFiles: []
    })

    // 파일 미리보기 상태
    const [fileList, setFileList] = useState<FilePreview[]>([])

    // 폼 검증 에러
    const [formErrors, setFormErrors] = useState<InquiryFormErrors>({})

    // 제출 완료 후 리셋
    useEffect(() => {
        if (success) {
            // 성공 메시지 표시 후 폼 리셋
            const timer = setTimeout(() => {
                handleReset()
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // 폼 데이터 변경 핸들러
    const handleInputChange = (field: keyof InquiryFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
    ) => {
        const value = event.target.value
        setFormData(prev => ({ ...prev, [field]: value }))

        // 에러 상태 클리어
        if (formErrors[field as keyof InquiryFormErrors]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    // 파일 변경 핸들러
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        const newFiles: FilePreview[] = []
        const maxFiles = 3
        const currentCount = fileList.length

        for (let i = 0; i < files.length; i++) {
            if (currentCount + newFiles.length >= maxFiles) break

            const file = files[i]

            // 파일 크기 검증 (5MB)
            if (!fileUtils.validateFileSize(file, 5)) {
                setFormErrors(prev => ({
                    ...prev,
                    imageFiles: `파일 크기는 5MB 이하여야 합니다: ${file.name}`
                }))
                continue
            }

            // 파일 타입 검증
            if (!fileUtils.validateFileType(file)) {
                setFormErrors(prev => ({
                    ...prev,
                    imageFiles: `지원하지 않는 파일 형식입니다: ${file.name}`
                }))
                continue
            }

            newFiles.push({
                file,
                name: file.name,
                url: URL.createObjectURL(file),
            })
        }

        const updatedFileList = [...fileList, ...newFiles]
        setFileList(updatedFileList)

        // 폼 데이터 업데이트
        setFormData(prev => ({
            ...prev,
            imageFiles: updatedFileList.map(f => f.file)
        }))

        // 파일 관련 에러 클리어 (성공적으로 추가된 경우)
        if (newFiles.length > 0) {
            setFormErrors(prev => ({ ...prev, imageFiles: undefined }))
        }
    }

    // 파일 제거 핸들러
    const handleRemoveFile = (index: number) => {
        const newFileList = [...fileList]
        URL.revokeObjectURL(newFileList[index].url)
        newFileList.splice(index, 1)
        setFileList(newFileList)

        setFormData(prev => ({
            ...prev,
            imageFiles: newFileList.map(f => f.file)
        }))
    }

    // 폼 검증
    const validateForm = (): boolean => {
        const errors: InquiryFormErrors = {}

        if (!formData.title.trim()) {
            errors.title = '제목을 입력해주세요.'
        } else if (formData.title.trim().length < 5) {
            errors.title = '제목은 최소 5자 이상 입력해주세요.'
        }

        if (!formData.content.trim()) {
            errors.content = '내용을 입력해주세요.'
        } else if (formData.content.trim().length < 10) {
            errors.content = '내용은 최소 10자 이상 입력해주세요.'
        }

        if (!formData.inquiryType) {
            errors.inquiryType = '문의 유형을 선택해주세요.'
        }

        if (!formData.inquiryReceiveMethod) {
            errors.inquiryReceiveMethod = '답변 받을 방법을 선택해주세요.'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // 폼 제출 핸들러
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            // API 호출
            const result = await createInquiry({
                title: formData.title.trim(),
                content: formData.content.trim(),
                inquiryType: formData.inquiryType,
                inquiryReceiveMethod: formData.inquiryReceiveMethod,
                orderId: formData.orderId.trim() || null,
                imageFiles: formData.imageFiles
            })

            if (result) {
                console.log('문의 등록 성공:', result)
            }
        } catch (err) {
            console.error('문의 등록 실패:', err)
        }
    }

    // 폼 리셋
    const handleReset = () => {
        setFormData({
            title: '',
            content: '',
            inquiryType: InquiryType.PRODUCT,
            inquiryReceiveMethod: InquiryReceiveMethod.WEB,
            orderId: '',
            imageFiles: []
        })

        // 파일 미리보기 정리
        fileList.forEach(file => URL.revokeObjectURL(file.url))
        setFileList([])

        setFormErrors({})
        resetFormState()
    }

    // 문의 유형 옵션
    const inquiryTypeOptions = [
        { value: InquiryType.PRODUCT, label: '제품 문의' },
        { value: InquiryType.ORDER, label: '주문 문의' },
        { value: InquiryType.PAYMENT, label: '결제 문의' },
        { value: InquiryType.DELIVERY, label: '배송 문의' },
        { value: InquiryType.RETURN, label: '반품/교환 문의' },
        { value: InquiryType.ACCOUNT, label: '계정 문의' },
        { value: InquiryType.ETC, label: '기타 문의' },
    ]

    // 답변 방법 옵션
    const replyMethodOptions = [
        { value: InquiryReceiveMethod.WEB, label: '문의내역' },
        { value: InquiryReceiveMethod.CALL, label: '전화' },
        { value: InquiryReceiveMethod.SMS, label: '문자' },
        { value: InquiryReceiveMethod.NONE, label: '답변 불필요' },
    ]

    return (
        <Box
            component={Paper}
            sx={{
                bgcolor: "white",
                p: { xs: 3, sm: 4 },
                borderRadius: 2,
                border: "1px solid #e8dbce",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
        >
            {/* 성공 메시지 */}
            {success && (
                <Alert
                    severity="success"
                    icon={<CheckCircleIcon />}
                    sx={{ mb: 3 }}
                >
                    문의가 성공적으로 등록되었습니다. 빠른 시일 내에 답변드리겠습니다.
                </Alert>
            )}

            {/* 에러 메시지 */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box
                    sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 2fr" }, gap: 2, alignItems: "flex-end" }}
                >
                    <FormControl fullWidth error={!!formErrors.inquiryType}>
                        <InputLabel id="inquiry-type-label" sx={{ color: "#1c140d" }}>
                            유형
                            <Box component="span" sx={{ color: "#ef4444" }}>*</Box>
                        </InputLabel>
                        <Select
                            labelId="inquiry-type-label"
                            id="inquiry-type"
                            label="유형*"
                            value={formData.inquiryType}
                            onChange={handleInputChange('inquiryType')}
                            sx={{
                                height: 44,
                                borderRadius: 1,
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: formErrors.inquiryType ? "#ef4444" : "#e8dbce",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: formErrors.inquiryType ? "#ef4444" : "#e8dbce",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: formErrors.inquiryType ? "#ef4444" : "#f38b24",
                                },
                            }}
                        >
                            {inquiryTypeOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                        {formErrors.inquiryType && (
                            <Typography variant="caption" sx={{ color: "#ef4444", mt: 0.5 }}>
                                {formErrors.inquiryType}
                            </Typography>
                        )}
                    </FormControl>

                    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                        <TextField
                            fullWidth
                            id="order-details"
                            label="주문번호"
                            placeholder="주문번호를 입력해주세요 (선택)"
                            value={formData.orderId}
                            onChange={handleInputChange('orderId')}
                            InputProps={{
                                endAdornment: formData.orderId && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            sx={{ color: "#9c7349" }}
                                            onClick={() => setFormData(prev => ({ ...prev, orderId: '' }))}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 1,
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#e8dbce",
                                    },
                                },
                            }}
                            sx={{
                                "& .MuiInputLabel-root": {
                                    color: "#1c140d",
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: "#f38b24",
                                },
                            }}
                        />
                    </Box>
                </Box>

                <TextField
                    fullWidth
                    required
                    id="inquiry-title"
                    label="제목"
                    placeholder="제목을 입력해주세요."
                    value={formData.title}
                    onChange={handleInputChange('title')}
                    error={!!formErrors.title}
                    helperText={formErrors.title}
                    InputProps={{
                        sx: {
                            borderRadius: 1,
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: formErrors.title ? "#ef4444" : "#e8dbce",
                            },
                        },
                    }}
                    sx={{
                        "& .MuiInputLabel-root": {
                            color: "#1c140d",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                            color: formErrors.title ? "#ef4444" : "#f38b24",
                        },
                    }}
                />

                <Box>
                    <TextField
                        fullWidth
                        required
                        id="inquiry-content"
                        label="내용"
                        placeholder="문의하실 내용을 자세히 적어주세요."
                        multiline
                        rows={8}
                        value={formData.content}
                        onChange={handleInputChange('content')}
                        error={!!formErrors.content}
                        helperText={formErrors.content}
                        InputProps={{
                            sx: {
                                borderRadius: 1,
                                "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: formErrors.content ? "#ef4444" : "#e8dbce",
                                },
                            },
                        }}
                        sx={{
                            "& .MuiInputLabel-root": {
                                color: "#1c140d",
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                                color: formErrors.content ? "#ef4444" : "#f38b24",
                            },
                        }}
                    />
                    <Typography variant="caption" sx={{ mt: 1, display: "block", color: "#9c7349" }}>
                        ※ 외국어로 문의하실 경우, 답변은 자동 번역으로 제공될 수 있습니다. 번역이 정확하지 않을 수 있으니, 이 경우
                        다시 문의해 주시면 최대한 정확한 답변을 드리도록 노력하겠습니다.
                    </Typography>
                </Box>

                <Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                        <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{ color: "#1c140d", display: "flex", alignItems: "center" }}
                        >
                            <CameraAltIcon sx={{ fontSize: "1.25rem", mr: 0.5, color: "#f38b24" }} />
                            이미지 첨부
                            <Typography variant="caption" sx={{ color: "#9c7349", ml: 0.5 }}>
                                (선택) JPG, PNG, WebP 파일 / 최대 5MB / 최대 3개
                            </Typography>
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#9c7349" }}>
                            {fileList.length}/3
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            mt: 1,
                            display: "flex",
                            justifyContent: "center",
                            px: 3,
                            py: 2.5,
                            border: "2px dashed #e8dbce",
                            borderRadius: 1,
                            bgcolor: "#fcfaf8",
                        }}
                    >
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <CloudUploadIcon sx={{ fontSize: "2.5rem", color: "#d1c5b8", mb: 1 }} />
                            <Box sx={{ display: "flex", alignItems: "center", fontSize: "0.875rem", color: "#9c7349" }}>
                                <Button
                                    component="label"
                                    disabled={loading || fileList.length >= 3}
                                    sx={{
                                        color: "#f38b24",
                                        "&:hover": { color: "#e07b1a", bgcolor: "transparent" },
                                        "&.Mui-disabled": { color: "#d1c5b8" },
                                        p: 0,
                                        minWidth: "auto",
                                        fontWeight: 500,
                                        textTransform: "none",
                                        fontSize: "0.875rem",
                                    }}
                                >
                                    파일 선택
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                </Button>
                                <Typography variant="body2" sx={{ ml: 0.5 }}>
                                    또는 파일을 여기로 드래그하세요.
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#9c7349", mt: 0.5 }}>
                                이미지 파일을 첨부해주세요.
                            </Typography>
                        </Box>
                    </Box>

                    {formErrors.imageFiles && (
                        <Typography variant="caption" sx={{ color: "#ef4444", mt: 1, display: "block" }}>
                            {formErrors.imageFiles}
                        </Typography>
                    )}

                    {fileList.length > 0 && (
                        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                            {fileList.map((file, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        p: 1,
                                        bgcolor: "#f4ede7",
                                        borderRadius: 1,
                                        fontSize: "0.875rem",
                                        color: "#1c140d",
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {file.name} ({fileUtils.formatFileSize(file.file.size)})
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveFile(index)}
                                        disabled={loading}
                                        sx={{ color: "#9c7349", "&:hover": { color: "#1c140d" } }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}

                    <Typography variant="caption" sx={{ mt: 2, display: "block", color: "#9c7349" }}>
                        ※ 문의 내용 및 첨부 파일에 개인정보(계좌번호, 카드번호, 주민등록번호 등)가 포함되지 않도록 주의해주세요.
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: "#e8dbce", my: 1 }} />

                <Box>
                    <Typography variant="body2" align="center" sx={{ color: "#1c140d", mb: 2 }}>
                        답변 받으실 방법을 선택해주세요.
                        <Typography variant="caption" component="span" sx={{ color: "#9c7349", ml: 0.5 }}>
                            (미선택 시 문의내역으로 답변)
                        </Typography>
                    </Typography>

                    <RadioGroup
                        row
                        value={formData.inquiryReceiveMethod}
                        onChange={handleInputChange('inquiryReceiveMethod')}
                        sx={{
                            justifyContent: "center",
                            gap: { xs: 2, sm: 3 },
                            mb: 2,
                        }}
                    >
                        {replyMethodOptions.map((option) => (
                            <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={
                                    <Radio
                                        sx={{
                                            color: "#e8dbce",
                                            "&.Mui-checked": {
                                                color: "#f38b24",
                                            },
                                        }}
                                    />
                                }
                                label={
                                    <Typography variant="body2" sx={{ color: "#1c140d" }}>
                                        {option.label}
                                    </Typography>
                                }
                            />
                        ))}
                    </RadioGroup>

                    {formErrors.inquiryReceiveMethod && (
                        <Typography variant="caption" sx={{ color: "#ef4444", display: "block", textAlign: "center" }}>
                            {formErrors.inquiryReceiveMethod}
                        </Typography>
                    )}

                    <Typography variant="caption" align="center" sx={{ display: "block", color: "#9c7349" }}>
                        ※ 추가적인 내용 확인 및 정보제공 동의가 필요한 경우 전화로 연락드릴 수 있습니다.
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", pt: 1, gap: 2 }}>
                    {!success && (
                        <Button
                            variant="outlined"
                            onClick={handleReset}
                            disabled={loading}
                            sx={{
                                borderColor: "#e8dbce",
                                color: "#9c7349",
                                "&:hover": {
                                    borderColor: "#d1c5b8",
                                    bgcolor: "rgba(156, 115, 73, 0.1)"
                                },
                                px: 3,
                                py: 1.5,
                                borderRadius: 2,
                                fontSize: "1rem",
                                fontWeight: 600,
                            }}
                        >
                            초기화
                        </Button>
                    )}

                    <Button
                        variant="contained"
                        type="submit"
                        disabled={loading || success}
                        sx={{
                            bgcolor: "#f38b24",
                            color: "white",
                            "&:hover": { bgcolor: "#e07b1a" },
                            "&.Mui-disabled": { bgcolor: "#d1c5b8" },
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            fontSize: "1rem",
                            fontWeight: 600,
                            position: "relative",
                        }}
                    >
                        {loading && (
                            <CircularProgress
                                size={20}
                                sx={{
                                    color: "white",
                                    position: "absolute",
                                    left: "50%",
                                    marginLeft: "-10px"
                                }}
                            />
                        )}
                        {loading ? "등록 중..." : success ? "등록 완료!" : "문의 등록"}
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default InquiryForm