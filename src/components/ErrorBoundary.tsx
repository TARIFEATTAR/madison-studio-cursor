import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground text-center max-w-md">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <Button onClick={this.handleReset}>Try Again</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
