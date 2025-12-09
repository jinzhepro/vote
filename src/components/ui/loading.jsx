"use client";

import { cn } from "@/lib/utils";

export function LoadingSpinner({ className, size = "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingDots({ className, size = "md" }) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      <div
        className={cn(
          "bg-blue-600 rounded-full animate-bounce",
          sizeClasses[size]
        )}
        style={{ animationDelay: "0ms" }}
      />
      <div
        className={cn(
          "bg-blue-600 rounded-full animate-bounce",
          sizeClasses[size]
        )}
        style={{ animationDelay: "150ms" }}
      />
      <div
        className={cn(
          "bg-blue-600 rounded-full animate-bounce",
          sizeClasses[size]
        )}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

export function LoadingPulse({ className, size = "md" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "absolute inset-0 bg-blue-200 rounded-full animate-ping",
          sizeClasses[size]
        )}
      />
      <div
        className={cn(
          "relative bg-blue-600 rounded-full animate-pulse",
          sizeClasses[size]
        )}
      />
    </div>
  );
}

export function LoadingSkeleton({ className, lines = 3 }) {
  // 预定义的宽度数组，避免在渲染时使用Math.random
  const widths = ["60%", "75%", "85%", "70%", "80%", "65%", "90%"];

  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
}

export function LoadingCard({ className, title = "加载中..." }) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black",
        className
      )}
    >
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <LoadingPulse size="lg" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 text-center">
            请稍候，正在获取数据...
          </p>
          <LoadingDots size="sm" />
        </div>
      </div>
    </div>
  );
}

export function LoadingCardGradient({ className, title = "加载中..." }) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black",
        className
      )}
    >
      <div className="loading-gradient-blue rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-float">
            <LoadingSpinner
              size="lg"
              className="text-white border-white border-t-transparent"
            />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-center opacity-90">
            请稍候，正在获取数据...
          </p>
          <LoadingDots size="sm" />
        </div>
      </div>
    </div>
  );
}

export function LoadingPage({ className, title = "加载中..." }) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black",
        className
      )}
    >
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <LoadingSpinner size="xl" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500">正在努力加载，请稍候...</p>
        </div>
        <div className="flex justify-center">
          <LoadingDots size="md" />
        </div>
      </div>
    </div>
  );
}

export function LoadingPageModern({ className, title = "加载中..." }) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black",
        className
      )}
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
        <div className="text-lg font-medium text-gray-900">{title}</div>
      </div>
    </div>
  );
}

export function LoadingButton({ className, children, loading, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4",
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}
