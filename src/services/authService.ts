import { apiClient } from "@/lib/axios";

export type VerifyUserRequest = {
    phone_number: string;
};

export type VerifyUserResponse =
    | {
        otp: string;
        token: { access: string };
        user: true;
    }
    | {
        otp: string;
        user: false;
    };

export async function verifyUser(phone_number: string) {
    const { data } = await apiClient.post<VerifyUserResponse>("/api/verify/", {
        phone_number,
    } satisfies VerifyUserRequest);
    return data;
}

export type LoginRegisterRequest = {
    name: string;
    phone_number: string;
    unique_id?: string;
};

export type LoginRegisterResponse = {
    token: { access: string };
    user_id: string;
    name: string;
    phone_number: string;
    message: string;
};

export async function loginRegister(payload: LoginRegisterRequest) {
    const { data } = await apiClient.post<LoginRegisterResponse>(
        "/api/login-register/",
        payload,
    );
    return data;
}


