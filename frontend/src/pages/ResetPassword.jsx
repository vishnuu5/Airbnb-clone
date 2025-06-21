import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { authAPI } from "../services/api"
import { Eye, EyeOff } from "lucide-react"
import LoadingSpinner from "../components/common/LoadingSpinner"

const ResetPassword = () => {
    const [loading, setLoading] = useState(false)
    const [otpSent, setOtpSent] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const email = location.state?.email

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm()

    const password = watch("password")

    useEffect(() => {
        if (email && !otpSent) {
            handleSendOTP()
        }
    }, [email])

    const handleSendOTP = async () => {
        if (!email) {
            toast.error("Email not found. Please request password reset again.")
            navigate("/forgot-password")
            return
        }

        setLoading(true)
        try {
            const response = await authAPI.forgotPassword({ email })
            if (response.success) {
                setOtpSent(true)
                toast.success("OTP sent to your email")
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to send OTP"
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (data) => {
        if (!email) {
            toast.error("Email not found. Please request password reset again.")
            navigate("/forgot-password")
            return
        }

        setLoading(true)
        try {
            const response = await authAPI.resetPassword({
                email,
                otp: data.otp,
                password: data.password
            })
            if (response.success) {
                toast.success("Password reset successful")
                navigate("/login")
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to reset password"
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Email Not Found</h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Please request password reset again
                        </p>
                        <div className="mt-4 text-center">
                            <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                Go to Forgot Password
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Password</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter the OTP sent to {email} and your new password
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="otp" className="sr-only">
                                OTP
                            </label>
                            <input
                                {...register("otp", {
                                    required: "OTP is required",
                                    pattern: {
                                        value: /^[0-9]{6}$/,
                                        message: "OTP must be 6 digits",
                                    },
                                })}
                                type="text"
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Enter OTP"
                            />
                            {errors.otp && (
                                <p className="mt-2 text-sm text-red-600">{errors.otp.message}</p>
                            )}
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">
                                New Password
                            </label>
                            <input
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters",
                                    },
                                })}
                                type={showPassword ? "text" : "password"}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                                placeholder="New Password"
                            />
                            <span
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-gray-700"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </span>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>
                        <div className="relative">
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (value) =>
                                        value === password || "The passwords do not match",
                                })}
                                type={showConfirmPassword ? "text" : "password"}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                                placeholder="Confirm Password"
                            />
                            <span
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-gray-700"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </span>
                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                        
                        <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? "Sending..." : "Resend OTP"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword 