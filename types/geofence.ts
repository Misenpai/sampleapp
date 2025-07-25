import { MapShapeType } from "react-native-leaflet-view";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeofenceLocation {
  id: string;
  label: string;
  center: LatLng;
  radius: number;
}

export interface MapShape {
  shapeType: MapShapeType;
  color: string;
  id: string;
  center: LatLng;
  radius: number;
}

export interface MapLayer {
  baseLayerName: string;
  baseLayerIsChecked: boolean;
  baseLayer: boolean;
  url: string;
  attribution: string;
}

export interface MapMarker {
  id: string;
  position: LatLng;
  icon: string;
  size: [number, number];
  anchor: [number, number];
}
