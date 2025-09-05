import React from "react";

const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
};

export default SuspenseWrapper;
