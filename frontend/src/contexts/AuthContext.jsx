import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { authAPI } from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem("token")
            if (token) {
                const response = await authAPI.getProfile()
                if (response.data.success) {
                    setUser(response.data.data.user)
                    setIsAuthenticated(true)
                } else {
                    localStorage.removeItem("token")
                    setUser(null)
                    setIsAuthenticated(false)
                }
            } else {
                setUser(null)
                setIsAuthenticated(false)
            }
        } catch (error) {
            console.error("Auth check error:", error)
            localStorage.removeItem("token")
            setUser(null)
            setIsAuthenticated(false)
        } finally {
            setLoading(false)
        }
    }

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials)
            if (response.data.success) {
                const { token, user } = response.data.data
                localStorage.setItem("token", token)
                setUser(user)
                setIsAuthenticated(true)
                return true
            }
            return false
        } catch (error) {
            if (error.response?.data?.requiresVerification) {
                navigate("/verify-otp", { 
                    state: { email: credentials.email }
                })
            }
            throw error
        }
    }

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData)
            if (response.data.success) {
                navigate("/verify-otp", { 
                    state: { 
                        email: userData.email,
                        isRegistration: true
                    }
                })
                return true
            }
            return false
        } catch (error) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error("Registration failed. Please try again.")
            }
            throw error
        }
    }

    const verifyRegistrationOTP = async (email, otp) => {
        try {
            const response = await authAPI.verifyRegistrationOTP({ email, otp })
            if (response.data.success) {
                const { token, user } = response.data.data
                localStorage.setItem("token", token)
                setUser(user)
                setIsAuthenticated(true)
                return true
            }
            return false
        } catch (error) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error("OTP verification failed. Please try again.")
            }
            throw error
        }
    }

    const logout = () => {
        localStorage.removeItem("token")
        setUser(null)
        setIsAuthenticated(false)
    }

    const updateUser = (userData) => {
        setUser(userData)
    }

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        checkAuth,
        verifyRegistrationOTP
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext 