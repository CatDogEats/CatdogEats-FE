import { Client } from '@stomp/stompjs'

export interface ChatMessageDTO {
    roomId: string
    behaviorType: 'TALK'
    message: string
    sentAt: string
    isMe?: boolean
}

export interface ReadReceiptDTO {
    roomId: string
}

export interface WebSocketMessage {
    roomId: string
    message: string
    sentAt: string
    isMe: boolean
}

class WebSocketService {
    private client: Client | null = null
    private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map()
    private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected'

    constructor() {
        this.setupClient()
    }

    private setupClient() {
        this.client = new Client({
            brokerURL: import.meta.env.VITE_WEBSOCKET_URL,
            debug: (str) => {
                console.log('STOMP Debug:', str)
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        })

        this.client.onConnect = (frame) => {
            console.log('✅ WebSocket 연결됨', frame)
            this.connectionStatus = 'connected'

            // 메시지 구독
            this.client?.subscribe('/user/queue/chat', (message) => {
                try {
                    const data: WebSocketMessage = JSON.parse(message.body)
                    const handler = this.messageHandlers.get(data.roomId)
                    if (handler) {
                        handler(data)
                    }
                } catch (error) {
                    console.error('메시지 파싱 에러:', error)
                }
            })
        }

        this.client.onDisconnect = () => {
            console.log('🔌 WebSocket 연결 해제됨')
            this.connectionStatus = 'disconnected'
        }

        this.client.onStompError = (frame) => {
            console.error('❌ STOMP 에러:', frame.headers['message'])
            console.error('상세:', frame.body)
            this.connectionStatus = 'disconnected'
        }

        this.client.onWebSocketClose = () => {
            console.log('WebSocket 연결 종료')
            this.connectionStatus = 'disconnected'
        }

        this.client.onWebSocketError = (error) => {
            console.error('WebSocket 에러:', error)
            this.connectionStatus = 'disconnected'
        }
    }

    // 연결
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.connectionStatus === 'connected') {
                resolve()
                return
            }

            if (this.connectionStatus === 'connecting') {
                // 연결 중이면 잠시 대기 후 재시도
                setTimeout(() => {
                    if (this.connectionStatus === 'connected') {
                        resolve()
                    } else {
                        reject(new Error('연결 타임아웃'))
                    }
                }, 3000)
                return
            }

            this.connectionStatus = 'connecting'

            const originalOnConnect = this.client!.onConnect
            const originalOnStompError = this.client!.onStompError

            this.client!.onConnect = (frame) => {
                originalOnConnect(frame)
                resolve()
            }

            this.client!.onStompError = (frame) => {
                originalOnStompError(frame)
                reject(new Error(`연결 실패: ${frame.headers['message']}`))
            }

            this.client?.activate()
        })
    }

    // 연결 해제
    disconnect() {
        if (this.client?.connected) {
            this.client.deactivate()
        }
        this.connectionStatus = 'disconnected'
        this.messageHandlers.clear()
    }

    // 메시지 전송
    sendMessage(roomId: string, message: string) {
        if (!this.client?.connected) {
            throw new Error('WebSocket이 연결되지 않음')
        }

        const payload: ChatMessageDTO = {
            roomId,
            behaviorType: 'TALK',
            message,
            sentAt: new Date().toISOString()
        }

        this.client.publish({
            destination: '/pub/chat/message',
            body: JSON.stringify(payload)
        })
    }

    // 읽음 처리
    markAsRead(roomId: string) {
        if (!this.client?.connected) {
            return
        }

        const payload: ReadReceiptDTO = { roomId }

        this.client.publish({
            destination: '/pub/chat/read',
            body: JSON.stringify(payload)
        })
    }

    // 채팅방 입장
    enterChatRoom(roomId: string) {
        if (!this.client?.connected) {
            return
        }

        const payload: ReadReceiptDTO = { roomId }

        this.client.publish({
            destination: '/pub/chat/enter',
            body: JSON.stringify(payload)
        })
    }

    // 메시지 핸들러 등록
    subscribeToRoom(roomId: string, handler: (message: WebSocketMessage) => void) {
        this.messageHandlers.set(roomId, handler)
    }

    // 메시지 핸들러 해제
    unsubscribeFromRoom(roomId: string) {
        this.messageHandlers.delete(roomId)
    }

    // 연결 상태 확인
    isConnected(): boolean {
        return this.connectionStatus === 'connected'
    }

    // 연결 상태 가져오기
    getConnectionStatus() {
        return this.connectionStatus
    }
}

export const websocketService = new WebSocketService()