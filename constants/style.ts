import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: colors.gray.dark,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: colors.gray.medium,
  },
});

export const photoGridStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  photoContainer: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  photoNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  photoWrapper: {
    position: "relative",
  },
  photoPreview: {
    width: 100,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  emptySlot: {
    width: 100,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.gray.light,
    borderStyle: "dashed",
  },
  retakeButton: {
    position: "absolute",
    bottom: -25,
    alignSelf: "center",
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  retakeButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
});

export const audioStyles = StyleSheet.create({
  section: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.gray.dark,
    textAlign: "center",
    marginBottom: 15,
  },
  previewContainer: {
    alignItems: "center",
  },
  preview: {
    backgroundColor: "#e8f4fd",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
    minWidth: 200,
  },
  previewText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },
  playButton: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: colors.secondary,
    padding: 8,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  recordButton: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.gray.light,
    borderStyle: "dashed",
  },
  recordButtonText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
});

export const cameraStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: colors.transparent.black50,
    padding: 12,
    borderRadius: 20,
    zIndex: 1,
  },
  counterOverlay: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: colors.transparent.black70,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  counterText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  controlSpacer: {
    width: 32,
  },
  shutterBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnOuter: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: colors.white,
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    backgroundColor: colors.white,
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  controlBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});

export const audioRecorderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  recordingIndicator: {
    alignItems: "center",
    marginBottom: 50,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    marginBottom: 10,
  },
  recordingText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

export const actionButtonStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flex: 1,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});

export const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.black,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    marginTop: 20,
    fontWeight: "600",
  },
  subtext: {
    color: "#888",
    fontSize: 14,
    marginTop: 8,
  },
});

export const permissionStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
    color: colors.gray.dark,
  },
});

export const mapCardStyles = StyleSheet.create({
  container: {
    margin: 20,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mapContainer: {
    height: 200,
    position: "relative",
  },
  expandButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 8,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});

export const expandedMapStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 12,
    borderRadius: 20,
    zIndex: 1000,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    position: "absolute",
    bottom: 20, // <-- moved to bottom
    left: 0,
    right: 0,
    zIndex: 1001,
    paddingHorizontal: 16,
  },
  mapContainer: {
    flex: 1,
  },
});

export const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
});

export const locationStatusStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  inside: {
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb",
    borderWidth: 1,
  },
  outside: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    borderWidth: 1,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
    color: "#495057",
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    color: "#495057",
    flex: 1,
  },
});

export const attendanceContainerStyles = StyleSheet.create({
  container: {
    marginTop: 40,
  },
  contentContainer: {
    paddingBottom: 20,
  },
});

export const dropdownStyles = {
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    zIndex: 1000,
  },
  selector: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 8,
    maxHeight: 300,
    minWidth: 250,
    maxWidth: 350,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  option: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#f8f9ff",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#007AFF",
    fontWeight: "500" as const,
  },
};
