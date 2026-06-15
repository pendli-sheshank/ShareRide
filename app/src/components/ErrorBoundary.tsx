import { Component, ErrorInfo, ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { colors, spacing } from "../constants/theme";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// On iOS 26 + the New Architecture, an uncaught JS error reported through
// RCTExceptionsManager can itself throw inside the TurboModule bridge,
// crashing the process with a SIGABRT and no JS stack trace. Catching render
// errors here keeps the app alive and shows the real error instead.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("Unhandled render error:", error, errorInfo.componentStack);
  }

  render() {
    const { error, errorInfo } = this.state;
    if (error) {
      return (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: spacing.lg,
            backgroundColor: colors.background,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.error, textAlign: "center", marginBottom: spacing.sm }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.md }}>
            {error.message}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textLight }}>
            {error.stack}
            {errorInfo?.componentStack}
          </Text>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}
