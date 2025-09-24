import React from "react";

type LoaderProps = { message: string};

export default function Loader({ message }: LoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-300">{message}</p>
        </div>
    </div>
  );
}
