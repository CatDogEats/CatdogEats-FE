export interface ProductData {
    name: string;
    value: number;
    color: string;
}


export interface ProductChartData {
    productId: string;
    productName: string;
    totalSales: number;
    totalQuantity: number; // 판매 개수 추가
    percentage: number;
    color: string;
}