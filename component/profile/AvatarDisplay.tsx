import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface AvatarDisplayProps {
  avatarUrl: string;
  size?: number;
  style?: any;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarUrl,
  size = 100,
  style,
}) => {
  const [loading, setLoading] = useState(true);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            width: ${size}px;
            height: ${size}px;
          }
          img {
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
          }
        </style>
      </head>
      <body>
        <img src="${avatarUrl}" alt="Avatar" />
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}
      <WebView
        source={{ html: htmlContent }}
        style={[styles.webview, { width: size, height: size }]}
        onLoadEnd={() => setLoading(false)}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    overflow: "hidden",
    position: "relative",
  },
  webview: {
    backgroundColor: "transparent",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 50,
    zIndex: 1,
  },
});
