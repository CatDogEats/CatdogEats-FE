"use client"

import type React from "react"
import { useState } from "react"
import {
    Box,
    Typography,
    Divider,
    Button,
    Paper,
    Chip,
    TextField,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton
} from "@mui/material"
import ReplyIcon from "@mui/icons-material/Reply"
import CloseIcon from "@mui/icons-material/Close"
import DownloadIcon from "@mui/icons-material/Download"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import SendIcon from "@mui/icons-material/Send"

// 타입 및 스토어 import
import {
    InquiryDetailResponseDTO,
    InquiryAttachmentDTO
} from '@/types/inquiry'
import {
    useInquiryFormStore,
    useFileDownloadStore
} from '@/service/support/inquiry/inquiryStore'
import { fileUtils } from '@/service/support/inquiry/inquiryApi'

interface InquiryDetailProps {
    inquiry: InquiryDetailResponseDTO  // ✅ 원본 타입 사용
}

const InquiryDetail: React.FC<InquiryDetailProps> = ({ inquiry }) => {
    // 🚨 강화된 디버깅 로그
    console.log('=================================');
    console.log('🔍 FULL InquiryDetail 데이터:', inquiry);
    console.log('🔍 inquiry keys:', Object.keys(inquiry || {}));
    console.log('🔍 inquiry.inquiryId:', inquiry?.inquiryId);
    console.log('🔍 inquiry.inquiryStatus:', inquiry?.inquiryStatus, typeof inquiry?.inquiryStatus);
    console.log('🔍 inquiry.createdAt:', inquiry?.createdAt, typeof inquiry?.createdAt);
    console.log('🔍 inquiry.messages:', inquiry?.messages);
    console.log('🔍 inquiry.attachments:', inquiry?.attachments);
    console.log('=================================');

    // ✅ 모든 hooks를 조건 없이 먼저 호출
    const {
        loading: formLoading,
        error: formError,
        createFollowup,
        closeInquiry,
        resetFormState
    } = useInquiryFormStore()

    const { downloadFile, isDownloading } = useFileDownloadStore()

    // 로컬 상태
    const [showReplyForm, setShowReplyForm] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [replyFiles, setReplyFiles] = useState<File[]>([])
    const [showCloseDialog, setShowCloseDialog] = useState(false)

    // ✅ hooks 호출 이후에 조건부 렌더링 (관대한 조건으로 수정)
    if (!inquiry) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    문의 데이터가 없습니다. (inquiry is null/undefined)
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    상위 컴포넌트에서 inquiry prop을 확인해주세요.
                </Typography>
            </Box>
        );
    }

    // 🚨 ID 필드 접근 방식 수정 (실제 백엔드 응답에 맞게)
    if (!inquiry.inquiryId && !inquiry.id) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" color="error">
                    문의 ID가 없습니다.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    inquiryId: {String(inquiry.inquiryId)} | id: {String(inquiry.id)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    전체 데이터: {JSON.stringify(inquiry, null, 2)}
                </Typography>
            </Box>
        );
    }

    // 안전한 날짜 포맷팅 함수 (개선)
    const formatDate = (dateString: any) => {
        console.log('🔍 formatDate - input:', dateString, typeof dateString);

        if (!dateString) {
            console.warn('🚨 날짜 데이터 없음');
            return '날짜 없음';
        }

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.warn('🚨 Invalid Date:', dateString);
                return `잘못된 날짜 (${dateString})`;
            }
            return date.toLocaleDateString('ko-KR');
        } catch (error) {
            console.error('🚨 Date parsing error:', error);
            return `날짜 오류 (${dateString})`;
        }
    };

    const formatDateTime = (dateString: any) => {
        console.log('🔍 formatDateTime - input:', dateString, typeof dateString);

        if (!dateString) {
            console.warn('🚨 날짜시간 데이터 없음');
            return '날짜 없음';
        }

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.warn('🚨 Invalid DateTime:', dateString);
                return `잘못된 날짜 (${dateString})`;
            }
            return date.toLocaleString('ko-KR');
        } catch (error) {
            console.error('🚨 DateTime parsing error:', error);
            return `날짜 오류 (${dateString})`;
        }
    };

    // 날짜와 시간을 분리하는 함수 추가
    const formatTime = (dateString: any) => {
        if (!dateString) return '';

        try {
            // "yyyy-MM-dd" 형식인 경우 시간 정보 없음
            if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return '';
            }

            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '';
            }

            return date.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            return '';
        }
    };

    // 상태 표시 헬퍼 (백엔드 문자열 응답에 맞게 수정)
    const getStatusDisplay = (status: any) => {
        console.log('🔍 getStatusDisplay - status:', status, typeof status);

        if (!status) {
            return { label: '상태 없음', color: 'default' as const };
        }

        // 백엔드에서 오는 실제 문자열과 매핑
        switch (status) {
            case '답변 대기':
            case '답변 대기중':
            case 'PENDING':
                return { label: '답변 대기중', color: 'warning' as const }
            case '답변 완료':
            case 'ANSWERED':
                return { label: '답변 완료', color: 'success' as const }
            case '추가 문의':
            case 'FOLLOWUP':
                return { label: '추가 문의', color: 'info' as const }
            case '종료':
            case 'CLOSED':
                return { label: '종료', color: 'default' as const }
            case '강제 종료':
            case 'FORCE_CLOSED':
                return { label: '강제 종료', color: 'error' as const }
            default:
                console.warn('🚨 알 수 없는 상태:', status);
                return { label: `${status}`, color: 'default' as const }
        }
    }

    // 메시지 타입별 표시 (색상 개선 - 오렌지 톤 통일)
    const getMessageTypeDisplay = (messageType: string) => {
        console.log('🔍 getMessageTypeDisplay - messageType:', messageType);

        // 고객 문의는 오렌지 계열, 관리자 답변은 파란색 계열로 통일
        switch (messageType) {
            case '최초 문의':
                return {
                    label: '원본 문의',
                    bgColor: '#fef9f5',      // 아주 연한 오렌지
                    textColor: '#c2410c',     // 진한 오렌지
                    borderColor: '#fed7aa'    // 오렌지 테두리
                }
            case '최초 답변':
                return {
                    label: '답변',
                    bgColor: '#f0f9ff',      // 연한 파란색
                    textColor: '#0369a1',     // 진한 파란색
                    borderColor: '#bae6fd'    // 파란 테두리
                }
            case '문의 내용':  // USER_FOLLOWUP
                return {
                    label: '추가 문의',
                    bgColor: '#fff7ed',      // 아주 연한 오렌지 (노란빛 제거)
                    textColor: '#c2410c',     // 진한 오렌지 (원본 문의와 동일)
                    borderColor: '#fed7aa'    // 오렌지 테두리
                }
            case '답변 내용':  // ADMIN_FOLLOWUP
                return {
                    label: '추가 답변',
                    bgColor: '#f0f9ff',      // 연한 파란색 (최초 답변과 동일)
                    textColor: '#0369a1',     // 진한 파란색
                    borderColor: '#bae6fd'    // 파란 테두리
                }
            // 혹시 enum 값 자체가 올 경우를 대비한 fallback
            case 'QUESTION':
                return {
                    label: '원본 문의',
                    bgColor: '#fef9f5',
                    textColor: '#c2410c',
                    borderColor: '#fed7aa'
                }
            case 'ANSWER':
                return {
                    label: '답변',
                    bgColor: '#f0f9ff',
                    textColor: '#0369a1',
                    borderColor: '#bae6fd'
                }
            case 'USER_FOLLOWUP':
                return {
                    label: '추가 문의',
                    bgColor: '#fff7ed',
                    textColor: '#c2410c',
                    borderColor: '#fed7aa'
                }
            case 'ADMIN_FOLLOWUP':
                return {
                    label: '추가 답변',
                    bgColor: '#f0f9ff',
                    textColor: '#0369a1',
                    borderColor: '#bae6fd'
                }
            default:
                console.warn('🚨 알 수 없는 메시지 타입:', messageType);
                return {
                    label: messageType || '메시지',
                    bgColor: '#f9fafb',
                    textColor: '#6b7280',
                    borderColor: '#e5e7eb'
                }
        }
    }

    // 답글 파일 처리 (수정)
    const handleReplyFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        // 현재 파일 개수 체크
        if (replyFiles.length >= 3) {
            alert('파일은 최대 3개까지 첨부 가능합니다.')
            return
        }

        // 남은 슬롯만큼만 추가
        const remainingSlots = 3 - replyFiles.length
        const filesToAdd: File[] = []

        for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
            const file = files[i]

            if (!fileUtils.validateFileSize(file, 5)) {
                alert(`파일 크기는 5MB 이하여야 합니다: ${file.name}`)
                continue
            }

            if (!fileUtils.validateFileType(file)) {
                alert(`지원하지 않는 파일 형식입니다: ${file.name}`)
                continue
            }

            filesToAdd.push(file)
        }

        // 기존 파일에 추가
        setReplyFiles([...replyFiles, ...filesToAdd])
    }

    // 개별 파일 삭제 함수 추가
    const handleRemoveReplyFile = (index: number) => {
        setReplyFiles(replyFiles.filter((_, i) => i !== index))
    }

    // 답글 제출
    const handleSubmitReply = async () => {
        const actualInquiryId = inquiry.inquiryId || inquiry.id;  // ✅ 둘 다 확인

        console.log('🔍 handleSubmitReply - actualInquiryId:', actualInquiryId);
        console.log('🔍 handleSubmitReply - replyContent:', replyContent);

        if (!replyContent.trim()) {
            alert('답글 내용을 입력해주세요.')
            return
        }

        if (!actualInquiryId) {
            alert('문의 ID가 없습니다. 페이지를 새로고침해주세요.')
            return
        }

        try {
            const followupData = {
                inquiryId: actualInquiryId,
                content: replyContent.trim(),
                imageFiles: replyFiles
            };

            console.log('🔍 답글 등록 데이터:', followupData);

            const result = await createFollowup(followupData)

            if (result) {
                setReplyContent('')
                setReplyFiles([])
                setShowReplyForm(false)
                resetFormState()
                // 페이지 새로고침으로 최신 데이터 반영
                window.location.reload()
            }
        } catch (error) {
            console.error('답글 등록 실패:', error)
            alert('답글 등록에 실패했습니다. 다시 시도해주세요.')
        }
    }

    // 문의 종료
    const handleCloseInquiry = async () => {
        const actualInquiryId = inquiry.inquiryId || inquiry.id;  // ✅ 둘 다 확인

        try {
            const result = await closeInquiry(actualInquiryId)

            if (result) {
                setShowCloseDialog(false)
                // 페이지 새로고침으로 최신 데이터 반영
                window.location.reload()
            }
        } catch (error) {
            console.error('문의 종료 실패:', error)
        }
    }

    // 파일 다운로드
    const handleDownloadFile = async (attachment: InquiryAttachmentDTO) => {
        const actualInquiryId = inquiry.inquiryId || inquiry.id;  // ✅ 둘 다 확인

        try {
            await downloadFile(
                actualInquiryId,
                attachment.fileId,
                attachment.originalFileName
            )
        } catch (error) {
            console.error('파일 다운로드 실패:', error)
            alert('파일 다운로드에 실패했습니다.')
        }
    }

    // 첨부파일 렌더링 컴포넌트
    const renderAttachments = (attachments: InquiryAttachmentDTO[]) => {
        if (!attachments || !Array.isArray(attachments) || attachments.length === 0) return null

        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: "#6b7280", mb: 1, display: "block" }}>
                    첨부파일:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {attachments.map((attachment) => (
                        <Button
                            key={attachment.fileId}
                            variant="outlined"
                            size="small"
                            startIcon={isDownloading(attachment.fileId) ?
                                <CircularProgress size={16} /> :
                                <DownloadIcon />
                            }
                            onClick={() => handleDownloadFile(attachment)}
                            disabled={isDownloading(attachment.fileId)}
                            sx={{
                                borderColor: "#e8dbce",
                                color: "#f38b24",
                                "&:hover": { borderColor: "#f38b24" }
                            }}
                        >
                            {attachment.originalFileName}
                        </Button>
                    ))}
                </Box>
            </Box>
        )
    }

    const statusDisplay = getStatusDisplay(inquiry.inquiryStatus || inquiry.status)  // ✅ 백업 필드 추가

    // 상태 비교를 문자열 기반으로 수정 (백업 필드 포함)
    const currentStatus = inquiry.inquiryStatus || inquiry.status;
    const canReply = currentStatus !== '종료' &&
        currentStatus !== '강제 종료' &&
        currentStatus !== 'CLOSED' &&
        currentStatus !== 'FORCE_CLOSED' &&
        currentStatus !== 'completed'  // ✅ 실제 응답의 상태값 추가

    const canClose = currentStatus !== '종료' &&
        currentStatus !== '강제 종료' &&
        currentStatus !== 'CLOSED' &&
        currentStatus !== 'FORCE_CLOSED' &&
        currentStatus !== 'completed'  // ✅ 실제 응답의 상태값 추가

    return (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
            {/* 헤더 */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ color: "#1c140d", mb: 1 }}>
                        {inquiry.title}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                        <Chip
                            label={statusDisplay.label}
                            color={statusDisplay.color}
                            size="small"
                        />
                        <Typography variant="body2" sx={{ color: "#9c7349" }}>
                            작성일: {formatDate(inquiry.createdAt)}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                    {canClose && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setShowCloseDialog(true)}
                            sx={{
                                borderColor: "#e8dbce",
                                color: "#9c7349",
                                "&:hover": { borderColor: "#d1c5b8" }
                            }}
                        >
                            문의 종료
                        </Button>
                    )}
                    <Typography variant="body2" sx={{ color: "#9c7349" }}>
                        총 {inquiry.messages ? inquiry.messages.length : 0}개 답글
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ borderColor: "#e8dbce" }} />

            {/* 에러 메시지 */}
            {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {formError}
                </Alert>
            )}

            {/* 메시지 스레드 */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* 원본 문의 - 더 눈에 띄게 수정 */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        bgcolor: "#fef9f5",  // 아주 연한 오렌지
                        border: "2px solid",  // 전체 테두리 2px
                        borderColor: "primary.main",  // 테마 오렌지 색상
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(232, 152, 48, 0.15)",  // 오렌지 그림자
                    }}
                >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                                label="원본 문의"
                                size="small"
                                sx={{
                                    bgcolor: "primary.main",
                                    color: "white",
                                    fontSize: "0.75rem",
                                    height: 24,
                                    fontWeight: 600
                                }}
                            />
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                                고객
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                {formatDate(inquiry.createdAt)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                {formatTime(inquiry.createdAt)}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.primary", whiteSpace: "pre-line", mb: 1, lineHeight: 1.6 }}>
                        {inquiry.content}
                    </Typography>

                    {/* 원본 문의의 첨부파일 */}
                    {renderAttachments(inquiry.attachments)}
                </Paper>

                {/* 답글들 - null 체크 추가 */}
                {inquiry.messages && inquiry.messages.length > 0 && inquiry.messages.map((message: any) => {  // ✅ 타입 명시
                    const messageDisplay = getMessageTypeDisplay(message.messageType)
                    const isAdminMessage = message.authorType === 'ADMIN'

                    return (
                        <Paper
                            key={message.messageId}
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: messageDisplay.bgColor,
                                border: "1px solid",
                                borderColor: messageDisplay.borderColor,
                                borderRadius: 1,
                                ml: isAdminMessage ? 2 : 0,
                                mr: isAdminMessage ? 0 : 2,
                                position: "relative",
                                "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: 3,
                                    bgcolor: isAdminMessage ? "#0369a1" : "primary.main",
                                    borderRadius: "3px 0 0 3px"
                                }
                            }}
                        >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                    <Chip
                                        label={messageDisplay.label}
                                        size="small"
                                        sx={{
                                            bgcolor: isAdminMessage ? "#0369a1" : "primary.main",  // 관리자: 파란색, 고객: 오렌지
                                            color: "white",
                                            fontSize: "0.75rem",
                                            height: 24,
                                            fontWeight: 600
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ color: messageDisplay.textColor, fontWeight: 500 }}>
                                        {message.authorType === 'ADMIN' ? '관리자' : '고객'}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: "right" }}>
                                    <Typography variant="caption" sx={{ color: "#9c7349", display: "block" }}>
                                        {formatDate(message.createdAt)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "#9c7349", display: "block" }}>
                                        {formatTime(message.createdAt)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ color: messageDisplay.textColor, whiteSpace: "pre-line", mb: 1 }}>
                                {message.content}
                            </Typography>

                            {/* 각 메시지별 첨부파일 표시 */}
                            {renderAttachments(message.attachments)}
                        </Paper>
                    )
                })}

                {/* 답글이 없는 경우 메시지 표시 */}
                {(!inquiry.messages || inquiry.messages.length === 0) && (
                    <Box sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="body2" sx={{ color: "#9c7349" }}>
                            답글이 없습니다.
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* 답글 작성 버튼 */}
            {canReply && !showReplyForm && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<ReplyIcon />}
                        onClick={() => setShowReplyForm(true)}
                        sx={{
                            bgcolor: "#f38b24",
                            "&:hover": { bgcolor: "#e07b1a" }
                        }}
                    >
                        답글 작성
                    </Button>
                </Box>
            )}

            {/* 답글 작성 폼 */}
            {showReplyForm && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        border: "2px solid #f38b24",
                        borderRadius: 2,
                        bgcolor: "#fefbf8"
                    }}
                >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6" sx={{ color: "#1c140d" }}>
                            답글 작성
                        </Typography>
                        <IconButton
                            onClick={() => {
                                setShowReplyForm(false)
                                setReplyContent('')
                                setReplyFiles([])
                                resetFormState()
                            }}
                            sx={{ color: "#9c7349" }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="추가 문의사항을 입력해주세요..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        sx={{
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                    borderColor: "#e8dbce",
                                },
                                "&:hover fieldset": {
                                    borderColor: "#f38b24",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "#f38b24",
                                }
                            }
                        }}
                    />

                    {/* 파일 첨부 */}
                    <Box sx={{ mb: 2 }}>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<AttachFileIcon />}
                            disabled={replyFiles.length >= 3}
                            sx={{
                                borderColor: "#e8dbce",
                                color: replyFiles.length >= 3 ? "#ccc" : "#9c7349",
                                "&:hover": {
                                    borderColor: replyFiles.length >= 3 ? "#e8dbce" : "#f38b24",
                                    color: replyFiles.length >= 3 ? "#ccc" : "#f38b24"
                                }
                            }}
                        >
                            파일 첨부 ({replyFiles.length}/3)
                            <input
                                type="file"
                                hidden
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleReplyFileChange}
                            />
                        </Button>

                        {replyFiles.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                                {replyFiles.map((file, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            mb: 0.5
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: "#6b7280", flex: 1 }}>
                                            • {file.name} ({fileUtils.formatFileSize(file.size)})
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveReplyFile(index)}
                                            sx={{ color: "#ef4444" }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setShowReplyForm(false)
                                setReplyContent('')
                                setReplyFiles([])
                                resetFormState()
                            }}
                            disabled={formLoading}
                            sx={{
                                borderColor: "#e8dbce",
                                color: "#9c7349",
                                "&:hover": { borderColor: "#d1c5b8" }
                            }}
                        >
                            취소
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={formLoading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                            onClick={handleSubmitReply}
                            disabled={formLoading || !replyContent.trim()}
                            sx={{
                                bgcolor: "#f38b24",
                                "&:hover": { bgcolor: "#e07b1a" }
                            }}
                        >
                            {formLoading ? '등록 중...' : '답글 등록'}
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* 문의 종료 확인 다이얼로그 */}
            <Dialog
                open={showCloseDialog}
                onClose={() => setShowCloseDialog(false)}
            >
                <DialogTitle>문의 종료</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        이 문의를 종료하시겠습니까? 종료된 문의는 더 이상 답글을 작성할 수 없습니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setShowCloseDialog(false)}
                        sx={{ color: "#9c7349" }}
                    >
                        취소
                    </Button>
                    <Button
                        onClick={handleCloseInquiry}
                        disabled={formLoading}
                        sx={{ color: "#f38b24" }}
                    >
                        {formLoading ? '처리 중...' : '종료'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default InquiryDetail