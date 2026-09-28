import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Loader, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Project } from "../types";

const statusOf = (p: Project) => {
  if (p.isGenerating) return { label: "Generating", color: "text-signal" };
  if (!p.currentCode) return { label: "Failed", color: "text-alert" };
  if (p.isPublished) return { label: "Published", color: "text-mint" };
  return { label: "Draft", color: "text-chalk-dim" };
};

const MyProjects = () => {
  const { refreshUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/api/projects");
      setProjects(data.projects);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // While any website is being generated, check again every 5 seconds (polling).
  const anyGenerating = projects.some((p) => p.isGenerating);
  useEffect(() => {
    if (!anyGenerating) return;
    const id = setInterval(() => {
      load();
      refreshUser();
    }, 5000);
    return () => clearInterval(id);
  }, [anyGenerating, load, refreshUser]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      const { data } = await api.delete(`/api/projects/${id}`);
      toast.success(data.message);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDownload = (p: Project) => {
    if (!p.currentCode) return;
    const blob = new Blob([p.currentCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "index.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-signal" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-8 flex items-end justify-between border-b border-line pb-4">
        <h1 className="font-display text-5xl font-bold leading-none text-chalk">
          My Projects
        </h1>
        <Link to="/" className="btn-signal">
          New website
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center">
          <p className="text-chalk-dim">No websites yet. Describe one on the home page and it will appear here.</p>
          <Link to="/" className="btn-signal mt-6">
            Build a website
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {projects.map((p) => {
            const status = statusOf(p);
            return (
              <div key={p.id} className="w-80 overflow-hidden rounded-2xl border border-line bg-bp-deep shadow-sm">
                <div className="relative h-48 w-80 overflow-hidden bg-white">
                  {p.currentCode ? (
                    <iframe
                      title={p.name}
                      srcDoc={p.currentCode}
                      sandbox="allow-scripts"
                      loading="lazy"
                      tabIndex={-1}
                      className="pointer-events-none absolute left-0 top-0 h-[800px] w-[1280px] origin-top-left border-0"
                      style={{ transform: "scale(0.25)" }}
                    />
                  ) : p.isGenerating ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 bg-bp-deep text-chalk-dim">
                      <Loader className="h-6 w-6 animate-spin text-signal" />
                      <span className="text-sm">Generating your website...</span>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-bp-deep px-6 text-center text-sm text-chalk-dim">
                      This one could not be generated and your credits were refunded.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-[1fr_auto] border-t border-line">
                  <div className="min-w-0 border-r border-line px-3 py-2">
                    <p className="line-clamp-1 text-sm font-medium text-chalk">{p.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-chalk-dim">{p.initialPrompt}</p>
                  </div>
                  <div className="flex flex-col justify-between px-3 py-2 text-right text-xs">
                    <span className={`font-medium ${status.color}`}>{status.label}</span>
                    <span className="text-chalk-dim">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-line px-3 py-2">
                  <Link
                    to={`/projects/${p.id}`}
                    className="border border-line px-3 py-1 text-xs text-chalk hover:bg-chalk/5"
                  >
                    Open
                  </Link>
                  <div className="flex items-center gap-3">
                    {p.currentCode && (
                      <button
                        onClick={() => handleDownload(p)}
                        title="Download HTML"
                        className="text-chalk-dim hover:text-chalk"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(p.id)}
                      title="Delete"
                      className="text-chalk-dim hover:text-alert"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProjects;