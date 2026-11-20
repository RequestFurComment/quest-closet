import { useEffect, useState } from "react";
import { useApi } from "@/lib/appState";

export const AuthImage = ({ path, className, alt = "", testId }) => {
  const api = useApi();
  const [src, setSrc] = useState(null);
  useEffect(() => {
    if (!path) return;
    let url;
    api("get", `/files/${path}`, undefined, { responseType: "blob" })
      .then((b) => { url = URL.createObjectURL(b); setSrc(url); })
      .catch(() => setSrc(null));
    return () => url && URL.revokeObjectURL(url);
  }, [path, api]);
  if (!src) return <div className={`${className} animate-pulse bg-stone-800`} data-testid={testId} />;
  return <img src={src} alt={alt} className={className} data-testid={testId} />;
};
