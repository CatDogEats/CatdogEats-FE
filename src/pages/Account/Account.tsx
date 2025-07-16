"use client";

import { useState } from "react";
import { Box, Container, Grid, Card, CardContent } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import OrdersView from "@/components/Account/OrdersView";
import ShippingDetailView from "@/components/Account/ShippingDetailView";
import OrderDetail from "@/components/Account/OrderDetail";
// 기존 컴포넌트들
import ReviewsView from "@/components/Account/ReviewsView";
import ReturnInquiryView from "@/components/Account/ReturnInquiryView";
import AddressesView from "@/components/Account/AddressesView";
import PetsView from "@/components/Account/PetsView";
import CouponsView from "@/components/Account/CouponsView";
import ReturnRequestView from "@/components/Account/ReturnRequestView";
import ReviewWriteView from "@/components/Account/ReviewWriteView";
import CancelDetailView from "@/components/Account/CancelDetailView";
import AddressDialog from "@/components/Account/AddressDialog";
import PetDialog from "@/components/Account/PetDialog";

// 새로운 회원 탈퇴 관련 컴포넌트들
import UpdatedSidebar from "@/components/Account/Sidebar";
import AccountWithdrawalView from "@/components/Account/accountWithdrawalView";
import WithdrawalConfirmationModal from "@/components/Account/withdrawalConfirmationModal";
import WithdrawalSuccessView from "@/components/Account/withdrawalSuccessView";

// 타입 및 데이터
import type { Address, Pet, Order } from "components/Account";
import { mockOrders } from "@/data/mock-data";
import { theme } from "@/theme";

export default function MyPage() {
  const [activeMenu, setActiveMenu] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("최근 6개월");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [petDialogOpen, setPetDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [detailView, setDetailView] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnTab, setReturnTab] = useState(0);

  // 회원 탈퇴 관련 상태
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);

  const [, setIsWithdrawalComplete] = useState(false); // 나중에 isWithdrawalComplete 추가해야함

  const [newAddress, setNewAddress] = useState({
    label: "",
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phoneNumber: "",
  });

  const [newPet, setNewPet] = useState({
    name: "",
    breed: "",
    age: "",
    gender: "",
    category: "",
    hasAllergies: false,
    healthCondition: "",
    specialRequests: "",
  });

  // 기존 핸들러 함수들
  const handleMenuChange = (menuId: string) => {
    setActiveMenu(menuId);
    setDetailView(null);
  };

  const handleOrderAction = (action: string, order: Order) => {
    switch (action) {
      case "detail":
        setSelectedOrder(order);
        setDetailView("detail");
        break;
      case "shipping":
        setSelectedOrder(order);
        setDetailView("shipping");
        break;
      case "review":
        setSelectedOrder(order);
        setDetailView("review");
        break;
      case "return":
        setSelectedOrder(order);
        setDetailView("return");
        break;
      case "refresh":
        // Enhanced 컴포넌트에서 목록 새로고침 요청 시 처리
        // 별도 처리 없이 Enhanced 컴포넌트에서 자동 처리됨
        break;
      case "delete":
        // Enhanced 컴포넌트에서 삭제 완료 시 선택된 주문 초기화
        if (detailView) {
          setDetailView(null);
          setSelectedOrder(null);
        }
        break;
      default:
        break;
    }
  };

  // 회원 탈퇴 관련 핸들러
  const handleWithdrawalRequest = () => {
    setWithdrawalModalOpen(true);
  };

  const handleWithdrawalConfirm = () => {
    setWithdrawalModalOpen(false);
    setIsWithdrawalComplete(true);
    setActiveMenu("withdrawal-success"); // 추가
    window.location.href = "/withdraw";
  };

  const handleWithdrawalCancel = () => {
    setWithdrawalModalOpen(false);
  };

  // 기존 핸들러들 (생략 - 원본과 동일)
  const handleAddressSubmit = () => {
    if (editingAddress) {
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddress.id
            ? { ...editingAddress, ...newAddress }
            : addr
        )
      );
    } else {
      const address: Address = {
        id: Date.now().toString(),
        ...newAddress,
      };
      setAddresses([...addresses, address]);
    }
    setAddressDialogOpen(false);
    setEditingAddress(null);
    setNewAddress({
      label: "",
      fullName: "",
      address: "",
      city: "",
      postalCode: "",
      phoneNumber: "",
    });
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setNewAddress({
      label: address.label,
      fullName: address.fullName,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
      phoneNumber: address.phoneNumber,
    });
    setAddressDialogOpen(true);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  // 메인 컨텐츠 렌더링
  const renderContent = () => {
    // 회원 탈퇴 완료 화면 (기존 유지)
    if (activeMenu === "withdrawal-success") {
      return <WithdrawalSuccessView />;
    }

    // 회원 탈퇴 화면 (기존 유지)
    if (activeMenu === "withdrawal") {
      return (
        <AccountWithdrawalView onWithdrawalRequest={handleWithdrawalRequest} />
      );
    }

    // 상세 뷰들 - Enhanced 컴포넌트로 교체
    if (detailView === "shipping" && selectedOrder) {
      return (
        <ShippingDetailView
          setDetailView={setDetailView}
          orderNumber={selectedOrder.orderNumber}
        />
      );
    }

    if (detailView === "return" && selectedOrder) {
      return <ReturnRequestView setDetailView={setDetailView} />;
    }
    if (detailView === "review" && selectedOrder) {
      return <ReviewWriteView setDetailView={setDetailView} />;
    }
    if (detailView === "detail" && selectedOrder) {
      return (
        <OrderDetail
          selectedOrder={selectedOrder}
          setDetailView={setDetailView}
          handleOrderAction={handleOrderAction}
        />
      );
    }
    if (detailView === "cancel-detail") {
      return <CancelDetailView setDetailView={setDetailView} />;
    }

    // 기존 메인 메뉴들
    switch (activeMenu) {
      case "orders":
        return (
          <OrdersView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            mockOrders={mockOrders} // ✅ mockOrders props 복원
            handleOrderAction={handleOrderAction}
          />
        );

      case "reviews":
        return (
          <ReviewsView
            mockOrders={[]} // 기존 컴포넌트이므로 빈 배열 전달
            handleOrderAction={handleOrderAction}
          />
        );

      case "return-inquiry":
        return (
          <ReturnInquiryView
            returnTab={returnTab}
            setReturnTab={setReturnTab}
            setDetailView={setDetailView}
          />
        );

      case "addresses":
        return (
          <AddressesView
            addresses={addresses}
            handleEditAddress={handleEditAddress}
            handleDeleteAddress={handleDeleteAddress}
            setAddressDialogOpen={setAddressDialogOpen}
          />
        );

      case "pets":
        return <PetsView />;

      case "coupons":
        return <CouponsView />;

      default:
        return <div>메뉴를 선택해주세요.</div>;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            {/* 업데이트된 사이드바 */}
            <Grid size={{ xs: 12, md: 3 }}>
              <UpdatedSidebar
                activeMenu={activeMenu}
                onMenuChange={handleMenuChange}
              />
            </Grid>

            {/* 메인 컨텐츠 */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Card>
                <CardContent sx={{ p: 4 }}>{renderContent()}</CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* 기존 다이얼로그들 */}
        <AddressDialog
          open={addressDialogOpen}
          onClose={() => setAddressDialogOpen(false)}
          editingAddress={editingAddress}
          newAddress={newAddress}
          setNewAddress={setNewAddress}
          onSubmit={handleAddressSubmit}
        />

        <PetDialog
          open={petDialogOpen}
          onClose={() => setPetDialogOpen(false)}
          editingPet={editingPet}
          newPet={newPet}
          setNewPet={setNewPet}
          onSuccess={() => {
            // 성공 시 다이얼로그 닫기만 하면 됨 (PetsView에서 자체 새로고침)
            setPetDialogOpen(false);
            setEditingPet(null);
            setNewPet({
              name: "",
              breed: "",
              age: "",
              gender: "",
              category: "",
              hasAllergies: false,
              healthCondition: "",
              specialRequests: "",
            });
          }}
        />

        {/* 회원 탈퇴 확인 모달 */}
        <WithdrawalConfirmationModal
          open={withdrawalModalOpen}
          onClose={handleWithdrawalCancel}
          onConfirm={handleWithdrawalConfirm}
        />
      </Box>
    </ThemeProvider>
  );
}
