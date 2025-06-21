"use client"

import { useAuth } from "../contexts/AuthContext"
import HostDashboard from "./dashboards/HostDashboard"
import GuestDashboard from "./dashboards/GuestDashboard"
import AdminDashboard from "./dashboards/AdminDashboard"

const Dashboard = () => {
    const { user } = useAuth()

    if (!user) {
        return null
    }

    switch (user.role) {
        case "host":
            return <HostDashboard />
        case "guest":
            return <GuestDashboard />
        case "admin":
            return <AdminDashboard />
        default:
            return <GuestDashboard />
    }
}

export default Dashboard
