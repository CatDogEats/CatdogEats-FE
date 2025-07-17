// src/pages/Account/Account.tsx
"use client";

import { useState } from "react";
import { Box, Container, Grid, Card, CardContent } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import OrdersView from "@/components/Account/OrdersView";
import ShippingDetailView from "@/components/Account/ShippingDetailView";
import OrderDetail from "@/components/Account/OrderDetail";
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
import { buyerOrderApi } from "@/service/api/buyerOrderApi";
import UpdatedSidebar from "@/components/Account/Sidebar";
import AccountWithdrawalView from "@/components/Account/accountWithdrawalView";
import WithdrawalConfirmationModal from "@/components/Account/withdrawalConfirmationModal";
import WithdrawalSuccessView from "@/components/Account/withdrawalSuccessView";
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

  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [, setIsWithdrawalComplete] = useState(false);

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

  const handleMenuChange = (menuId: string) => {
    setActiveMenu(menuId);
    setDetailView(null);
  };

  const handleOrderAction = async (action: string, order: Order) => {
    setSelectedOrder(order);
    switch (action) {
      case "view_detail":
      case "detail":
        setDetailView("detail");
        break;
      case "view_shipping":
      case "shipping":
        setDetailView("shipping");
        break;
      case "write_review":
      case "review":
        setDetailView("review");
        break;
      case "request_return":
      case "return":
        setDetailView("return");
        break;
      case "delete":
        try {
          await buyerOrderApi.deleteBuyerOrder({
            orderNumber: order.orderNumber,
          });
          // 주문 목록 새로고침 로직 추가 가능
        } catch (error: any) {
          alert(error.message);
        }
        break;
      case "refresh":
        // 새로고침 로직 (필요시 추가)
        break;
    }
  };

  const handleWithdrawalRequest = () => {
    setWithdrawalModalOpen(true);
  };

  const handleWithdrawalConfirm = () => {
    setWithdrawalModalOpen(false);
    setIsWithdrawalComplete(true);
    setActiveMenu("withdrawal-success");
    window.location.href = "/withdraw";
  };

  const handleWithdrawalCancel = () => {
    setWithdrawalModalOpen(false);
  };

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

  const renderContent = () => {
    if (activeMenu === "withdrawal-success") {
      return <WithdrawalSuccessView />;
    }
    if (activeMenu === "withdrawal") {
      return (
        <AccountWithdrawalView onWithdrawalRequest={handleWithdrawalRequest} />
      );
    }
    if (detailView === "shipping" && selectedOrder) {
      return (
        <ShippingDetailView
          setDetailView={setDetailView}
          selectedOrder={selectedOrder}
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

    switch (activeMenu) {
      case "orders":
        return (
          <OrdersView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            mockOrders={mockOrders}
            handleOrderAction={handleOrderAction}
          />
        );
      case "reviews":
        return (
          <ReviewsView mockOrders={[]} handleOrderAction={handleOrderAction} />
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
            <Grid size={{ xs: 12, md: 3 }}>
              <UpdatedSidebar
                activeMenu={activeMenu}
                onMenuChange={handleMenuChange}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 9 }}>
              <Card>
                <CardContent sx={{ p: 4 }}>{renderContent()}</CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

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

        <WithdrawalConfirmationModal
          open={withdrawalModalOpen}
          onClose={handleWithdrawalCancel}
          onConfirm={handleWithdrawalConfirm}
        />
      </Box>
    </ThemeProvider>
  );
}
