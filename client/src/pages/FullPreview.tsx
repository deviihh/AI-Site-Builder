import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import type { Version } from "../types";

const POLL_MS = 4000;

const FullPreview = ({ mode }: { mode: "private" | "public" }) => {
  const { projectId, versionId } = useParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      try {
        if (mode === "public") {
          const { data } = await api.get(`/api/community/${projectId}`);
          if (cancelled) return;
          setCode(data.code);
          setGenerating(false);
        } else {
          const { data } = await api.get(`/api/projects/${projectId}`);
          if (cancelled) return;

          const version = versionId
            ? data.project.versions.find((v: Version) => v.id === versionId)
            : null;
          const nextCode = version ? version.code : data.project.currentCode || "";
          setCode(nextCode);

          // Only keep polling for the live/current preview, not a specific past version.
          const stillWorking = !versionId && !nextCode && data.isGenerating;
          setGenerating(stillWorking);
          if (stillWorking) {
            timer = setTimeout(load, POLL_MS);
          }
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mode, projectId, versionId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-signal" />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-chalk-dim">
        <Loader className="h-8 w-8 animate-spin text-signal" />
        <p>Your website is still being generated…</p>
      </div>
    );
  }

  if (error || !code) {
    return (
      <div className="flex h-screen items-center justify-center px-6 text-center text-chalk-dim">
        {error || "There is nothing to show here."}
      </div>
    );
  }

  return (
    <>
      <iframe
        title="Website"
        srcDoc={code}
        sandbox="allow-scripts allow-popups"
        className="h-screen w-full border-0 bg-white"
      />
      <Link
        to="/"
        className="fixed bottom-4 right-4 border border-line bg-bp-deep px-3 py-1.5 text-xs text-chalk hover:border-signal"
      >
        Made with AI Site Builder
      </Link>
    </>
  );
};

export default FullPreview;