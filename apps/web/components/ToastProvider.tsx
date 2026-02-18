"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 3000,
                style: {
                    background: "#292524",
                    color: "#F5F5F4",
                    borderRadius: "12px",
                    padding: "12px 16px",
                },
            }}
        />
    );
}
