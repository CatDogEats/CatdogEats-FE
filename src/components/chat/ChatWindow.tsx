"use client"

import type React from "react"
import { useState } from "react"
import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip
} from "@mui/material"
import { ArrowBack, Send, Close, WifiOff } from "@mui/icons-material"
import type { CustomerInquiry } from "@/types/customer.ts"
import dayjs from "dayjs"
import "dayjs/locale/ko"
import weekday from "dayjs/plugin/weekday"
import localeData from "dayjs/plugin/localeData"

interface ChatWindowProps {
    selectedCustomer: CustomerInquiry
    onBackToList: () => void
    onDeleteChatRoom: (customerId: string) => void
    onSendMessage: (message: string) => Promise<void>
    wsConnected: boolean
    isMobile: boolean
}
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.locale("ko")

const ChatWindow: React.FC<ChatWindowProps> = ({
                                                   selectedCustomer,
                                                   onBackToList,
                                                   onDeleteChatRoom,
                                                   onSendMessage,
                                                   wsConnected,
                                                   isMobile
                                               }) => {

    const [newMessage, setNewMessage] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [sending, setSending] = useState(false)

    const handleSendMessage = async () => {
        if (!newMessage.trim() || sending || !wsConnected) return

        setSending(true)
        try {
            await onSendMessage(newMessage.trim())
            setNewMessage("")
        } catch (error) {
            console.error("메시지 전송 실패:", error)
            // TODO: 에러 토스트 표시
        } finally {
            setSending(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleLeaveChatRoom = () => {
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        onDeleteChatRoom(selectedCustomer.id)
        setDeleteDialogOpen(false)
        onBackToList()
    }

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false)
    }

    const groupedMessages = selectedCustomer.messages.reduce((acc, message) => {
        const dateKey = dayjs(message.sentAt).format("YYYY년 M월 D일 dddd")
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(message)
        return acc
    }, {} as Record<string, typeof selectedCustomer.messages>)

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%", borderLeft: "1px solid #e0e0e0" }}>
                {/* 채팅 헤더 */}
                <Paper elevation={1} sx={{ p: 2, borderRadius: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {/* 모바일에서는 뒤로가기 아이콘, 데스크톱에서는 닫기 아이콘 */}
                        <IconButton onClick={onBackToList}>
                            {isMobile ? <ArrowBack /> : <Close />}
                        </IconButton>

                        <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="h6">{selectedCustomer.name}</Typography>
                            </Box>
                        </Box>

                        {/* WebSocket 연결 상태 표시 */}
                        {!wsConnected && (
                            <Chip
                                icon={<WifiOff />}
                                label="연결 끊김"
                                size="small"
                                color="error"
                                variant="outlined"
                            />
                        )}

                        <Button
                            variant="text"
                            onClick={handleLeaveChatRoom}
                            sx={{
                                color: "#d32f2f",
                                "&:hover": {
                                    backgroundColor: "#ffebee"
                                }
                            }}
                        >
                            채팅방 나가기
                        </Button>
                    </Box>
                </Paper>

                {/* 메시지 영역 */}
                <Box sx={{ flexGrow: 1, p: 2, overflowY: "auto" }}>
                    {Object.entries(groupedMessages).map(([date, messages]) => (
                        <Box key={date}>
                            {/* 날짜 구분선 */}
                            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        backgroundColor: "#e0e0e0",
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 1,
                                        fontSize: "0.75rem",
                                        fontWeight: 500,
                                        color: "#555",
                                    }}
                                >
                                    {date}
                                </Typography>
                            </Box>

                            {/* 해당 날짜의 메시지들 */}
                            {messages.map((message) => (
                                <Box
                                    key={message.id}
                                    sx={{
                                        display: "flex",
                                        justifyContent: message.sender === "admin" ? "flex-end" : "flex-start",
                                        alignItems: "flex-end",
                                        mb: 2,
                                        gap: 0.5, // 말풍선과 시간 사이 간격
                                    }}
                                >
                                    {/* 내 메시지일 때 시간을 말풍선 왼쪽에 표시 */}
                                    {message.sender === "admin" && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "text.secondary",
                                                opacity: 0.7,
                                                fontSize: "0.75rem",
                                                userSelect: "none",
                                                whiteSpace: "nowrap",
                                                alignSelf: "flex-end",
                                                mb: 0.2, // 말풍선 하단과 맞추기 위한 미세 조정
                                            }}
                                        >
                                            {dayjs(message.sentAt).format("A h:mm")}
                                        </Typography>
                                    )}

                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 1.5,
                                            maxWidth: "70%",
                                            backgroundColor: message.sender === "admin" ? "primary.main" : "#f5f5f5",
                                            color: message.sender === "admin" ? "white" : "inherit",
                                            borderRadius: 2,
                                            borderBottomRightRadius: message.sender === "admin" ? 4 : 16,
                                            borderBottomLeftRadius: message.sender === "admin" ? 16 : 4,
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {message.text}
                                        </Typography>
                                    </Paper>

                                    {/* 상대방 메시지일 때 시간을 말풍선 오른쪽에 표시 */}
                                    {message.sender !== "admin" && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "text.secondary",
                                                opacity: 0.7,
                                                fontSize: "0.75rem",
                                                userSelect: "none",
                                                whiteSpace: "nowrap",
                                                alignSelf: "flex-end",
                                                mb: 0.2, // 말풍선 하단과 맞추기 위한 미세 조정
                                            }}
                                        >
                                            {dayjs(message.sentAt).format("A h:mm")}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Box>

                {/* 메시지 입력창 */}
                <Paper elevation={2} sx={{ p: 2, borderRadius: 0 }}>
                    {!wsConnected && (
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WifiOff fontSize="small" />
                                연결이 끊어져 메시지를 전송할 수 없습니다.
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                        <TextField
                            multiline
                            maxRows={3}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="메시지를 입력하세요..."
                            variant="outlined"
                            size="small"
                            disabled={!wsConnected || sending}
                            sx={{ flexGrow: 1 }}
                        />
                        <IconButton
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || !wsConnected || sending}
                            color="primary"
                        >
                            <Send />
                        </IconButton>
                    </Box>
                </Paper>
            </Box>

            {/* 채팅방 나가기 확인 다이얼로그 */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                aria-labelledby="delete-dialog-title"
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle id="delete-dialog-title" sx={{ textAlign: "center", pt: 3 }}>
                    채팅방을 나가시겠습니까?
                </DialogTitle>
                <DialogContent sx={{ textAlign: "center", pb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {selectedCustomer.name}님과의 채팅 내역이 삭제됩니다.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", gap: 1, pb: 3 }}>
                    <Button
                        onClick={handleCancelDelete}
                        variant="outlined"
                        sx={{ minWidth: 80 }}
                    >
                        아니오
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        sx={{ minWidth: 80 }}
                    >
                        예
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ChatWindow