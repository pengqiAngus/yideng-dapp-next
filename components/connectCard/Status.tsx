"use client";
import type { Web3ReactHooks } from "@web3-react/core";
import { AlertCircle, Loader2, CheckCircle2, XCircle } from "lucide-react";

export function Status({
  isActivating,
  isActive,
  error,
}: {
  isActivating: ReturnType<Web3ReactHooks["useIsActivating"]>;
  isActive: ReturnType<Web3ReactHooks["useIsActive"]>;
  error?: Error;
}) {
  return (
    <div className="flex items-center gap-2">
      {error ? (
        <div className="flex items-center text-red-500">
          <AlertCircle size={16} className="mr-1" />
          <span className="text-sm">
            {error.name ?? "Error"}
            {error.message ? `: ${error.message}` : null}
          </span>
        </div>
      ) : isActivating ? (
        <div className="flex items-center text-yellow-500">
          <Loader2 size={16} className="mr-1 animate-spin" />
          <span className="text-sm">连接中</span>
        </div>
      ) : isActive ? (
        <div className="flex items-center text-green-500">
          <CheckCircle2 size={16} className="mr-1" />
          <span className="text-sm">已连接</span>
        </div>
      ) : (
        <div className="flex items-center text-gray-400">
          <XCircle size={16} className="mr-1" />
          <span className="text-sm">未连接</span>
        </div>
      )}
    </div>
  );
}
