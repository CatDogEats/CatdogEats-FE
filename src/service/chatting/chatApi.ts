// services/chatApi.ts
import { apiClient } from '@/service/auth/AuthAPI'
import type { CustomerInquiry } from '@/types/customer'

export interface ChatRoomListResponse {
    data: CustomerInquiry[]
    hasNext: boolean
    nextCursor?: string
}

export interface ChatMessageResponse {
    data: ChatMessage[]
    hasNext: boolean
    nextCursor?: string
}

export interface ChatMessage {
    roomId: string
    behaviorType: string
    senderId: string
    message: string
    isRead: boolean
    sentAt: string
    isMe: boolean
}

export interface CreateChatRoomResponse {
    id: string
    createdAt: string
    updatedAt: string
}

class ChatApiService {
    // 채팅방 목록 조회
    async getChatRooms(cursor?: string, size: number = 20): Promise<ChatRoomListResponse> {
        try {
            const params = new URLSearchParams()
            if (cursor) params.append('cursor', cursor)
            params.append('size', size.toString())

            console.log('채팅방 목록 요청:', `/v1/users/chat/rooms?${params.toString()}`)
            const response = await apiClient.get(`/v1/users/chat/rooms?${params.toString()}`)

            console.log('채팅방 목록 응답 전체:', response)
            console.log('채팅방 목록 응답 data:', response.data)

            return {
                data: response.data.data?.content || response.data.content || response.data || [],
                hasNext: response.data.data?.hasNext || response.data.hasNext || false,
                nextCursor: response.data.data?.nextCursor || response.data.nextCursor
            }
        } catch (error:any) {
            console.error('채팅방 목록 조회 실패:', error)
            console.error('에러 응답:', error.response?.data)
            throw error
        }
    }

    // 특정 채팅방의 메시지 목록 조회
    async getChatMessages(roomId: string, cursor?: string, size: number = 20): Promise<ChatMessageResponse> {
        try {
            const params = new URLSearchParams()
            if (cursor) params.append('cursor', cursor)
            params.append('size', size.toString())

            const url = `/v1/users/chat/rooms/${roomId}?${params.toString()}`
            const response = await apiClient.get(url)

            // 여기서 정확한 메시지 배열 추출
            const messageData = response.data.data?.contents || []

            return {
                data: messageData,
                hasNext: response.data.data?.hasNext || false,
                nextCursor: response.data.data?.nextCursor
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                return {
                    data: [],
                    hasNext: false,
                    nextCursor: undefined
                }
            }
            throw error
        }
    }

    // 채팅방 생성
    async createChatRoom(vendorName: string): Promise<CreateChatRoomResponse> {
        try {
            console.log('채팅방 생성 요청:', { vendorName })
            const response = await apiClient.post('/v1/users/chat/rooms', {
                vendorName
            })

            console.log('채팅방 생성 응답:', response.data)
            return response.data.data || response.data
        } catch (error:any) {
            console.error('채팅방 생성 실패:', error)
            console.error('에러 응답:', error.response?.data)
            throw error
        }
    }
}

export const chatApiService = new ChatApiService()