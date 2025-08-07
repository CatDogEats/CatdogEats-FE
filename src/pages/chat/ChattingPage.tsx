import React, { useState, useCallback, useEffect } from "react"
import { Box, useTheme, useMediaQuery, CircularProgress, Alert } from "@mui/material"
import type { CustomerInquiry, CustomerMessage } from "@/types/customer"
import CustomerInquiryList from "@/components/chat/CustomerInquiryList"
import ChatWindow from "@/components/chat/ChatWindow"
import { useChatData } from "@/service/chat/useChatData"
import { chatApiService } from "@/service/chat/chatAPI.ts"

const ChatPage: React.FC = () => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))

    // useChatData 훅에서 상태와 함수들 가져오기
    const {
        customerInquiries,
        loading,
        error,
        wsConnected,
        sendMessage,
        markAsRead,
        deleteChatRoom,
        subscribeToRoom,
        unsubscribeFromRoom,
        refetch,
        updateCustomerMessages // 이 함수가 useChatData에 추가되어야 함
    } = useChatData()

    // 선택된 채팅방 상태만 따로 관리
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerInquiry | null>(null)
    const [loadingMessages, setLoadingMessages] = useState(false)

    // 채팅방 클릭 시 메시지 불러오고 상태 업데이트
    const handleCustomerClick = useCallback(async (customer: CustomerInquiry) => {
        try {
            if (!customer?.id) {
                console.error('고객 ID가 없습니다:', customer)
                return
            }

            console.log('채팅방 클릭:', customer.id, customer.name)
            setLoadingMessages(true)

            // 이전 채팅방 구독 해제
            if (selectedCustomer) {
                unsubscribeFromRoom(selectedCustomer.id)
            }

            // 메시지 불러오기
            const response = await chatApiService.getChatMessages(customer.id)

            console.log('getChatMessages 전체 응답:', response)
            console.log('response.data:', response.data)

            const messages = response.data
            console.log('불러온 메시지 배열:', messages)

            if (messages.length > 0) {
                console.log('첫 번째 메시지 객체:', messages[0])
                console.log('첫 번째 메시지 키들:', Object.keys(messages[0]))
            }

            const formattedMessages: CustomerMessage[] = messages.map((msg, index) => ({
                id: msg.senderId + '_' + msg.sentAt + '_' + index,
                text: msg.message || '',
                sender: msg.isMe ? 'admin' : 'customer',
                sentAt: msg.sentAt,
            }))


            // 선택된 고객 정보에 메시지 추가
            const customerWithMessages = {
                ...customer,
                messages: formattedMessages
            }

            console.log('선택된 고객 설정:', customerWithMessages)
            setSelectedCustomer(customerWithMessages)

            // useChatData의 상태도 업데이트 (옵션)
            if (updateCustomerMessages) {
                updateCustomerMessages(customer.id, formattedMessages)
            }

            // 새 채팅방 구독
            subscribeToRoom(customer.id)

            // 읽음 처리
            markAsRead(customer.id)

        } catch (err) {
            console.error('메시지 불러오기 실패:', err)
            setSelectedCustomer({ ...customer, messages: [] })
        } finally {
            setLoadingMessages(false)
        }
    }, [selectedCustomer, subscribeToRoom, unsubscribeFromRoom, markAsRead, updateCustomerMessages])

    const handleBackToList = useCallback(() => {
        console.log('뒤로가기 클릭')
        if (selectedCustomer) {
            unsubscribeFromRoom(selectedCustomer.id)
        }
        setSelectedCustomer(null)
    }, [selectedCustomer, unsubscribeFromRoom])

    const handleDeleteChatRoom = useCallback(
        async (customerId: string) => {
            try {
                await deleteChatRoom(customerId)
                if (selectedCustomer?.id === customerId) {
                    setSelectedCustomer(null)
                }
            } catch (error) {
                console.error("삭제 실패:", error)
            }
        },
        [selectedCustomer, deleteChatRoom]
    )

    const handleSendMessage = useCallback(async (message: string) => {
        if (!selectedCustomer) {
            console.error('선택된 고객이 없습니다')
            return
        }

        try {
            console.log('메시지 전송:', selectedCustomer.id, message)
            await sendMessage(selectedCustomer.id.toString(), message)

            // 로컬 상태도 업데이트 (낙관적 업데이트)
            const newMessage: CustomerMessage = {
                id: Date.now().toString(),
                text: message,
                sender: 'admin',
                sentAt: new Date().toISOString(),
            }

            setSelectedCustomer(prev => prev ? {
                ...prev,
                messages: [...(prev.messages || []), newMessage]
            } : null)

        } catch (error) {
            console.error('메시지 전송 실패:', error)
            // TODO: 에러 토스트 표시
        }
    }, [selectedCustomer, sendMessage])

    // WebSocket 연결 상태 로깅
    useEffect(() => {
        console.log('WebSocket 연결 상태:', wsConnected)
        if (!wsConnected) {
            console.warn('WebSocket이 연결되지 않았습니다.')
        }
    }, [wsConnected])

    // 디버깅용 로그
    useEffect(() => {
        console.log('현재 고객 목록:', customerInquiries)
        console.log('선택된 고객:', selectedCustomer)
    }, [customerInquiries, selectedCustomer])

    // 로딩 상태
    if (loading && customerInquiries.length === 0) {
        return (
            <Box
                sx={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.palette.background.default,
                }}
            >
                <CircularProgress />
            </Box>
        )
    }

    // 에러 상태
    if (error) {
        return (
            <Box
                sx={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.palette.background.default,
                    p: 2,
                }}
            >
                <Alert
                    severity="error"
                    action={
                        <button onClick={refetch}>재시도</button>
                    }
                >
                    {error}
                </Alert>
            </Box>
        )
    }

    // 모바일에서는 전체 화면 전환, 데스크톱에서는 동적 비율 조정
    if (isMobile) {
        return (
            <Box
                sx={{
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: theme.palette.background.default,
                    position: "relative",
                }}
            >
                {selectedCustomer ? (
                    <Box sx={{ width: "100%", height: "100%", backgroundColor: "#fff" }}>
                        {loadingMessages ? (
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%'
                            }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <ChatWindow
                                selectedCustomer={selectedCustomer}
                                onBackToList={handleBackToList}
                                onDeleteChatRoom={handleDeleteChatRoom}
                                onSendMessage={handleSendMessage}
                                wsConnected={wsConnected}
                                isMobile={isMobile}
                            />
                        )}
                    </Box>
                ) : (
                    <Box sx={{ width: "100%", height: "100%", overflowY: "auto" }}>
                        <CustomerInquiryList
                            customerInquiries={customerInquiries}
                            selectedCustomer={selectedCustomer}
                            onCustomerClick={handleCustomerClick}
                            loading={loading}
                        />
                    </Box>
                )}
            </Box>
        )
    }

    // 데스크톱 레이아웃
    return (
        <Box
            sx={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                backgroundColor: theme.palette.background.default,
                transition: "all 0.3s ease-in-out",
            }}
        >
            <Box
                sx={{
                    flex: selectedCustomer ? "0 0 40%" : "1 1 100%",
                    minWidth: selectedCustomer ? 320 : 280,
                    maxWidth: selectedCustomer ? "40%" : "100%",
                    borderRight: selectedCustomer ? "1px solid #ddd" : "none",
                    overflowY: "auto",
                    transition: "all 0.3s ease-in-out",
                }}
            >
                <CustomerInquiryList
                    customerInquiries={customerInquiries}
                    selectedCustomer={selectedCustomer}
                    onCustomerClick={handleCustomerClick}
                    loading={loading}
                />
            </Box>

            {selectedCustomer && (
                <Box
                    sx={{
                        flex: "1 1 60%",
                        backgroundColor: "#fff",
                        borderLeft: "1px solid #ddd",
                        overflowY: "auto",
                        transition: "all 0.3s ease-in-out",
                        animation: "slideInFromRight 0.3s ease-out",
                        "@keyframes slideInFromRight": {
                            "0%": {
                                opacity: 0,
                                transform: "translateX(20px)",
                            },
                            "100%": {
                                opacity: 1,
                                transform: "translateX(0)",
                            },
                        },
                    }}
                >
                    {loadingMessages ? (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%'
                        }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <ChatWindow
                            selectedCustomer={selectedCustomer}
                            onBackToList={handleBackToList}
                            onDeleteChatRoom={handleDeleteChatRoom}
                            onSendMessage={handleSendMessage}
                            wsConnected={wsConnected}
                            isMobile={isMobile}
                        />
                    )}
                </Box>
            )}
        </Box>
    )
}

export default ChatPage