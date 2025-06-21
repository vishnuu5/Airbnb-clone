import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { authAPI } from "../services/api"
import LoadingSpinner from "../components/common/LoadingSpinner"

const VerifyOTP = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const email = location.state?.email

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const onSubmit = async (data) => {
        if (!email) {
            toast.error("Email not found. Please register again.")
            navigate("/register")
            return
        }

        setLoading(true)
        try {
            const response = await authAPI.verifyRegistrationOTP({ ...data, email })
            if (response.data.success) {
                toast.success("Email verified successfully")
                // Store the token and user data
                localStorage.setItem("token", response.data.data.token)
                navigate("/login")
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Verification failed"
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        if (!email) {
            toast.error("Email not found. Please register again.")
            navigate("/register")
            return
        }

        setLoading(true)
        try {
            const response = await authAPI.resendOTP({ email })
            if (response.success) {
                toast.success("OTP resent successfully")
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to resend OTP"
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">Email Not Found</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Please register again to receive a new verification code.
                        </p>
                        <button
                            onClick={() => navigate("/register")}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Go to Register
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please enter the 6-digit code sent to {email}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="otp" className="sr-only">
                                OTP Code
                            </label>
                            <input
                                id="otp"
                                type="text"
                                maxLength={6}
                                {...register("otp", {
                                    required: "OTP is required",
                                    pattern: {
                                        value: /^[0-9]{6}$/,
                                        message: "OTP must be 6 digits",
                                    },
                                })}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Enter 6-digit code"
                            />
                            {errors.otp && (
                                <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={loading}
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            Resend OTP
                        </button>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Verifying...
                                </div>
                            ) : (
                                "Verify Email"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default VerifyOTP 