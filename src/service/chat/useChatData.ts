import { useState, useEffect, useCallback } from 'react'
import type { CustomerInquiry, CustomerMessage } from '@/types/customer'
import { chatApiService, type ChatRoomListResponse } from '@/service/chat/chatApi'
import { websocketService, type WebSocketMessage } from '@/service/chat/websocketService'

export const useChatData = () => {
    const [customerInquiries, setCustomerInquiries] = useState<CustomerInquiry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hasNext, setHasNext] = useState(false)
    const [nextCursor, setNextCursor] = useState<string | undefined>()
    const [wsConnected, setWsConnected] = useState(false)

    // 채팅방 목록 조회
    const fetchChatRooms = useCallback(async (cursor?: string, reset = false) => {
        try {
            setLoading(true)
            setError(null)

            const response: ChatRoomListResponse = await chatApiService.getChatRooms(cursor, 20)
            console.log("fetchChatRooms response:", response)
            console.log("response.data 첫 번째 객체:", response.data[0])

            const mappedData: CustomerInquiry[] = response.data.map((room, index) => {
                console.log(`Room ${index}:`, room)
                console.log(`Room keys:`, Object.keys(room))

                // API 응답 구조에 따라 올바른 필드명 사용
                // 가능한 필드명들을 체크해서 매핑
                const roomData = {
                    id: room.id,
                    name: room.name,
                    lastMessage: room.lastMessage,
                    lastMessageAt: room.lastMessageAt,
                    unreadCount: room.unreadCount || 0,
                    messages: [], // 초기에는 빈 배열로 시작
                }

                console.log(`Mapped room ${index}:`, roomData)
                return roomData
            })

            setCustomerInquiries(prev =>
                reset ? mappedData : [...prev, ...mappedData]
            )
            setHasNext(response.hasNext)
            setNextCursor(response.nextCursor)
        } catch (err) {
            console.error('채팅방 목록 조회 실패:', err)
            setError('채팅방 목록을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }, [])

    // 특정 고객의 메시지 업데이트
    const updateCustomerMessages = useCallback((customerId: string, messages: CustomerMessage[]) => {
        console.log('updateCustomerMessages 호출:', customerId, messages)
        setCustomerInquiries(prev =>
            prev.map(inquiry => {
                if (inquiry.id === customerId) {
                    return {
                        ...inquiry,
                        messages: messages
                    }
                }
                return inquiry
            })
        )
    }, [])

    // WebSocket 연결
    const connectWebSocket = useCallback(async () => {
        try {
            console.log('WebSocket 연결 시도...')
            await websocketService.connect()
            setWsConnected(true)
            console.log('WebSocket 연결 성공')
        } catch (error) {
            console.error('WebSocket 연결 실패:', error)
            setWsConnected(false)
        }
    }, [])

    // 메시지 수신 핸들러
    const handleNewMessage = useCallback((message: WebSocketMessage) => {
        console.log('새 메시지 수신:', message)
        setCustomerInquiries(prev =>
            prev.map(inquiry => {
                if (inquiry.id === message.roomId) {
                    const newMessage = {
                        id: message.roomId + '_' + message.sentAt + '_' + Date.now(),
                        text: message.message,
                        sender: message.isMe ? 'admin' : 'customer' as 'admin' | 'customer',
                        sentAt: message.sentAt
                    }

                    return {
                        ...inquiry,
                        lastMessage: message.message,
                        lastMessageAt: message.sentAt,
                        unreadCount: message.isMe ? inquiry.unreadCount : inquiry.unreadCount + 1,
                        messages: [
                            ...(inquiry.messages || []),
                            newMessage
                        ]
                    }
                }
                return inquiry
            })
        )
    }, [])

    // 채팅방 구독
    const subscribeToRoom = useCallback((roomId: string) => {
        console.log('채팅방 구독:', roomId)
        websocketService.subscribeToRoom(roomId, handleNewMessage)
        websocketService.enterChatRoom(roomId)
    }, [handleNewMessage])

    // 채팅방 구독 해제
    const unsubscribeFromRoom = useCallback((roomId: string) => {
        console.log('채팅방 구독 해제:', roomId)
        websocketService.unsubscribeFromRoom(roomId)
    }, [])

    // 메시지 전송
    const sendMessage = useCallback(async (roomId: string, message: string) => {
        try {
            if (!wsConnected) {
                throw new Error('WebSocket이 연결되지 않았습니다.')
            }

            console.log('웹소켓으로 메시지 전송:', roomId, message)
            websocketService.sendMessage(roomId, message)

            // 즉시 UI 업데이트 (낙관적 업데이트)
            const newMessage = {
                id: Date.now().toString(),
                text: message,
                sender: 'admin' as const,
                sentAt: new Date().toISOString()
            }

            setCustomerInquiries(prev =>
                prev.map(inquiry => {
                    if (inquiry.id === roomId) {
                        return {
                            ...inquiry,
                            lastMessage: message,
                            lastMessageAt: new Date().toISOString(),
                            messages: [
                                ...(inquiry.messages || []),
                                newMessage
                            ]
                        }
                    }
                    return inquiry
                })
            )
        } catch (error) {
            console.error('메시지 전송 실패:', error)
            throw error
        }
    }, [wsConnected])

    // 읽음 처리
    const markAsRead = useCallback((roomId: string) => {
        console.log('읽음 처리:', roomId)
        if (wsConnected) {
            websocketService.markAsRead(roomId)

            // 읽지 않은 메시지 수 초기화
            setCustomerInquiries(prev =>
                prev.map(inquiry => {
                    if (inquiry.id === roomId) {
                        return { ...inquiry, unreadCount: 0 }
                    }
                    return inquiry
                })
            )
        }
    }, [wsConnected])

    // 채팅방 삭제
    const deleteChatRoom = useCallback(async (customerId: string) => {
        console.log('채팅방 삭제:', customerId)
        setCustomerInquiries(prev => prev.filter(c => c.id !== customerId))
        unsubscribeFromRoom(customerId)
        await chatApiService.deleteChatRoom(customerId)
    }, [unsubscribeFromRoom])

    // 더 많은 채팅방 로드
    const loadMoreChatRooms = useCallback(async () => {
        if (hasNext && nextCursor && !loading) {
            await fetchChatRooms(nextCursor, false)
        }
    }, [hasNext, nextCursor, loading, fetchChatRooms])

    // 초기 데이터 로드 및 WebSocket 연결
    useEffect(() => {
        const initialize = async () => {
            console.log('채팅 데이터 초기화 시작')
            await fetchChatRooms(undefined, true)
            await connectWebSocket()
        }

        initialize()

        // 클린업
        return () => {
            console.log('useChatData 클린업')
            websocketService.disconnect()
            setWsConnected(false)
        }
    }, [fetchChatRooms, connectWebSocket])

    return {
        customerInquiries,
        loading,
        error,
        hasNext,
        wsConnected,
        sendMessage,
        markAsRead,
        deleteChatRoom,
        subscribeToRoom,
        unsubscribeFromRoom,
        loadMoreChatRooms,
        updateCustomerMessages, // 새로 추가된 함수
        refetch: () => fetchChatRooms(undefined, true)
    }
}