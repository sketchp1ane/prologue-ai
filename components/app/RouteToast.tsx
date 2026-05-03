"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

type RouteToastProps = {
  error?: string | null;
  success?: string | null;
};

export function RouteToast({ error, success }: RouteToastProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = error ?? success;

    if (!message) {
      return;
    }

    if (error) {
      toast.error(message, { id: `route-error-${message}` });
    } else {
      toast.success(message, { id: `route-success-${message}` });
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("error");
    nextParams.delete("success");

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [error, pathname, router, searchParams, success]);

  return null;
}
