import { GEOFENCE_LOCATIONS } from "@/constants/geofenceLocation";
import { LatLng, MapLayer, MapMarker, MapShape } from "@/types/geofence";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { MapShapeType } from "react-native-leaflet-view";

interface UseGeofenceProps {
  selectedGeofenceId?: string | null;
}

export function useGeofence(selectedGeofenceId?: string | null) {
  const [html, setHtml] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [initialPos, setInitialPos] = useState<LatLng | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Filter geofence locations based on selected ID
  const filteredGeofenceLocations = useMemo(() => {
    if (!selectedGeofenceId) {
      return GEOFENCE_LOCATIONS; // Show all when no filter is applied
    }
    return GEOFENCE_LOCATIONS.filter(
      (location) => location.id === selectedGeofenceId
    );
  }, [selectedGeofenceId]);

  const haversine = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371e3; // metres
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const φ1 = toRad(lat1);
      const φ2 = toRad(lat2);
      const Δφ = toRad(lat2 - lat1);
      const Δλ = toRad(lon2 - lon1);
      const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  const checkGeofences = useCallback(
    (position: LatLng) => {
      // Always check against all geofences for location detection, not just filtered ones
      for (const geofence of GEOFENCE_LOCATIONS) {
        const distance = haversine(
          position.lat,
          position.lng,
          geofence.center.lat,
          geofence.center.lng
        );

        if (distance <= geofence.radius) {
          return geofence.label;
        }
      }
      return null;
    },
    [haversine]
  );

  // Map shapes based on filtered locations
  const mapShapes = useMemo(
    (): MapShape[] =>
      filteredGeofenceLocations.map((geofence, index) => ({
        shapeType: MapShapeType.CIRCLE,
        color: index === 0 ? "#00f" : "#f00",
        id: geofence.id,
        center: geofence.center,
        radius: geofence.radius,
      })),
    [filteredGeofenceLocations]
  );

  const mapLayers = useMemo(
    (): MapLayer[] => [
      {
        baseLayerName: "OpenStreetMap",
        baseLayerIsChecked: true,
        baseLayer: true,
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      },
    ],
    []
  );

  // Static label markers based on filtered locations
  const staticLabelMarkers = useMemo(
    (): MapMarker[] =>
      filteredGeofenceLocations.map((g, idx) => {
        const offsetLat = g.center.lat + (idx === 0 ? 0.00015 : 0.00015);
        const offsetLng = g.center.lng + (idx === 0 ? -0.0 : -0.0);

        return {
          id: g.id + "_label",
          position: { lat: offsetLat, lng: offsetLng },
          icon: `
            <div style="
              position: relative;
              background: #fff;
              border: 2px solid #333;
              border-radius: 8px;
              padding: 6px 10px;
              font-size: 12px;
              font-weight: bold;
              color: #333;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              min-width: 80px;
              text-align: center;
            ">
              ${g.label}
              <div style="
                position: absolute;
                left: 50%;
                bottom: -8px;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 8px solid #333;
              "></div>
            </div>
          `,
          size: [100, 35],
          anchor: [50, 35],
        };
      }),
    [filteredGeofenceLocations]
  );

  const mapMarkers = useMemo((): MapMarker[] => {
    const markers = [...staticLabelMarkers];

    if (userPos) {
      markers.push({
        id: "myPosition",
        position: userPos,
        icon: `
          <div style="
            position: relative;
            width: 10px;
            height: 10px;
            background: #ff0000;
            border: 3px solid #fff;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          ">
          </div>
        `,
        size: [26, 26],
        anchor: [13, 13],
      });
    }

    return markers;
  }, [userPos, staticLabelMarkers]);


  const mapCenter = useMemo((): LatLng | null => {
    if (filteredGeofenceLocations.length === 0) {
      return initialPos; 
    }

    if (filteredGeofenceLocations.length === 1) {
      return filteredGeofenceLocations[0].center; 
    }
    const totalLat = filteredGeofenceLocations.reduce(
      (sum, loc) => sum + loc.center.lat,
      0
    );
    const totalLng = filteredGeofenceLocations.reduce(
      (sum, loc) => sum + loc.center.lng,
      0
    );

    return {
      lat: totalLat / filteredGeofenceLocations.length,
      lng: totalLng / filteredGeofenceLocations.length,
    };
  }, [filteredGeofenceLocations, initialPos]);

  useEffect(() => {
    const initializeHtml = async () => {
      try {
        const asset = Asset.fromModule(require("../assets/leaflet.html"));
        await asset.downloadAsync();
        const htmlContent = await FileSystem.readAsStringAsync(asset.localUri!);
        setHtml(htmlContent);
      } catch (e) {
        Alert.alert("HTML Load Error", (e as Error).message);
      }
    };

    initializeHtml();
  }, []);

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;
    let isComponentMounted = true;

    const initializeLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location permission is required.");
          return;
        }

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const initialPosition = { lat: coords.latitude, lng: coords.longitude };

        if (isComponentMounted) {
          setUserPos(initialPosition);
          setInitialPos(initialPosition);
          setCurrentLocation(checkGeofences(initialPosition));
          setIsInitialized(true);
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 3000,
            distanceInterval: 2,
          },
          ({ coords }) => {
            if (!isComponentMounted) return;

            const newPos: LatLng = {
              lat: coords.latitude,
              lng: coords.longitude,
            };

            setUserPos(newPos);
            setCurrentLocation(checkGeofences(newPos));
          }
        );
      } catch (e) {
        if (isComponentMounted) {
          Alert.alert("Location Error", (e as Error).message);
        }
      }
    };

    initializeLocation();

    return () => {
      isComponentMounted = false;
      subscription?.remove();
    };
  }, [checkGeofences]);

  return {
    html,
    userPos,
    initialPos,
    currentLocation,
    isInitialized,
    mapShapes,
    mapLayers,
    mapMarkers,
    mapCenter: mapCenter || initialPos, // Use calculated center or fallback to initial position
    filteredGeofenceLocations,
  };
}
