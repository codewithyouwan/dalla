'use client';
import Image from "next/image";
import CustomToaster from "./components/Toast";
import toast from 'react-hot-toast';

export default function Home() {
  return (
    <div>
      <CustomToaster />

      <button
        onClick={() => toast.success("This is a success toast!")}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Show Success
      </button>

      <button
        onClick={() => toast.error("This is an error toast!")}
        className="bg-red-500 text-white px-4 py-2 rounded ml-2"
      >
        Show Error
      </button>
    </div>
  );
}
