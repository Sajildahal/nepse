import type { Metadata } from "next";
import LogViewer from "./LogViewer";

export const metadata: Metadata = {
  title: "Live NEPSE Logs",
  description: "Live tail of NEPSE fetch and fallback activity",
};

export default function LogPage() {
  return <LogViewer />;
}
