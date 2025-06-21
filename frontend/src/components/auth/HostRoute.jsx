import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const HostRoute = ({ children }) => {
    const { user } = useAuth()

    if (!user || user.role !== "host") {
        return <Navigate to="/" replace />
    }

    return children
}

export default HostRoute 