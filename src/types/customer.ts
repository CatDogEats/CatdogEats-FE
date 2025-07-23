// 타입 정의
export interface CustomerMessage {
    id: string
    text: string
    sender: string
    time: string
}

export interface Message {
    id: string
    message: string
    isMe: boolean
    time: string
    sentAt?: string
}

export interface CustomerInquiry {
    id: string
    name: string
    lastMessage: string
    lastMessageAt: string
    unreadCount: number
    messages: CustomerMessage[]
}

export interface CustomerChat {
    id: string
    name: string
    lastMessage: string
    unreadCount: number
    messages: CustomerMessage[]
}

export interface ProductReview {
    id: number
    customerName: string
    customerAvatar: string
    rating: number
    reviewText: string
    reviewDate: string
    images: string[]
    helpful: number
}

export interface Product {
    id: number
    name: string
    image: string
    averageRating: number
    totalReviews: number
    reviews: ProductReview[]
}

export interface SidebarItem {
    id: number
    label: string
    icon: string
    active?: boolean
}

export interface ReviewStats {
    totalReviews: number
    averageRating: number
    ratingCounts: {
        [key: number]: number
    }
}
