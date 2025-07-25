import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import {
    RoleSelector,
    RoleSelectionContainer,
    RoleSelectionActions
} from '@/components/Auth';
import { UserRole } from '@/components/Auth/types';
import { ROLE_INFO } from '@/components/Auth/constants';
import { authApi } from '@/service/auth/AuthAPI.ts';
import {useAuthStore} from '@/service/auth/AuthStore'


const RoleSelectionPage = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
    };

    const handleContinue = async () => {
        if (!selectedRole) return;

        setIsLoading(true);

        setIsLoading(false);
        console.log(`역할 선택 완료: ${selectedRole}`);

        const redirectPath = ROLE_INFO[selectedRole].redirectPath;
        const { setRole } = useAuthStore.getState()
        setRole(selectedRole)


        await authApi.selectRole(selectedRole)
        navigate(redirectPath);
    };

    return (
        <RoleSelectionContainer>
            <Box sx={{ mb: 4 }}>
                <RoleSelector
                    selectedRole={selectedRole}
                    onRoleSelect={handleRoleSelect}
                />
            </Box>

            <RoleSelectionActions
                selectedRole={selectedRole}
                isLoading={isLoading}
                onContinue={handleContinue}
            />
        </RoleSelectionContainer>
    );
};

export default RoleSelectionPage;