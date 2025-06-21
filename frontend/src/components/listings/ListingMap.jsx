"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const ListingMap = ({ listings, center, zoom = 10, onMarkerClick }) => {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markersRef = useRef([])

    useEffect(() => {
        if (!mapRef.current) return

        // Initialize map
        mapInstanceRef.current = L.map(mapRef.current).setView(
            center || [40.7128, -74.006], // Default to NYC
            zoom,
        )

        // Add tile layer (OpenStreetMap - free)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current)

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (!mapInstanceRef.current || !listings || !Array.isArray(listings)) return

        // Clear existing markers
        markersRef.current.forEach((marker) => {
            mapInstanceRef.current.removeLayer(marker)
        })
        markersRef.current = []

        // Add markers for listings
        listings.forEach((listing) => {
            // Handle different coordinate formats
            let lat, lng

            if (listing.location) {
                // Try to get coordinates from different possible structures
                if (listing.location.lat && listing.location.lng) {
                    lat = listing.location.lat
                    lng = listing.location.lng
                } else if (listing.location.coordinates) {
                    // Handle both old format {lat, lng} and new GeoJSON format
                    if (listing.location.coordinates.lat && listing.location.coordinates.lng) {
                        lat = listing.location.coordinates.lat
                        lng = listing.location.coordinates.lng
                    } else if (Array.isArray(listing.location.coordinates.coordinates)) {
                        // GeoJSON format [longitude, latitude]
                        lng = listing.location.coordinates.coordinates[0]
                        lat = listing.location.coordinates.coordinates[1]
                    }
                }
            }

            // Only create marker if we have valid coordinates
            if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                try {
                    const marker = L.marker([lat, lng])
                        .addTo(mapInstanceRef.current)
                        .bindPopup(`
              <div class="p-2">
                <h3 class="font-semibold text-sm mb-1">${listing.title || "Untitled"}</h3>
                <p class="text-xs text-gray-600 mb-2">${listing.location?.city || ""}, ${listing.location?.state || ""}</p>
                <p class="font-bold text-sm">$${listing.price || 0}/night</p>
              </div>
            `)

                    if (onMarkerClick) {
                        marker.on("click", () => onMarkerClick(listing))
                    }

                    markersRef.current.push(marker)
                } catch (error) {
                    console.warn("Error creating marker for listing:", listing._id, error)
                }
            } else {
                console.warn("Invalid coordinates for listing:", listing._id, { lat, lng })
            }
        })

        // Fit map to show all markers
        if (markersRef.current.length > 1) {
            try {
                const group = new L.featureGroup(markersRef.current)
                mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
            } catch (error) {
                console.warn("Error fitting bounds:", error)
            }
        }
    }, [listings, onMarkerClick])

    useEffect(() => {
        if (mapInstanceRef.current && center && Array.isArray(center) && center.length === 2) {
            const [lat, lng] = center
            if (!isNaN(lat) && !isNaN(lng)) {
                mapInstanceRef.current.setView(center, zoom)
            }
        }
    }, [center, zoom])

    return <div ref={mapRef} className="leaflet-container rounded-lg border" style={{ height: "400px", width: "100%" }} />
}

export default ListingMap
