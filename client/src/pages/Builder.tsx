import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Bot,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Laptop,
  Loader,
  RotateCcw,
  Send,
  Smartphone,
  Tablet,
  User as UserIcon,
} from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Message, ProjectDetail, Version } from "../types";

type Device = "phone" | "tablet" | "desktop";

const WIDTHS: Record<Device, string> = {
  phone: "412px",
  tablet: "768px",
  desktop: "100%",
};

const DEVICES = [
  { id: "phone", Icon: Smartphone },
  { id: "tablet", Icon: Tablet },
  { id: "desktop", Icon: Laptop },
] as const;

const STEPS = [
  "Analyzing your request",
  "Designing the layout",
  "Writing the code",
  "Polishing the details",
];

type TimelineItem =
  | { kind: "message"; time: number; message: Message }
  | { kind: "version"; time: number; version: Version };

const GeneratingView = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-chalk">
      <Loader className="h-10 w-10 animate-spin text-signal" />
      <p className="font-display text-3xl font-semibold">{STEPS[step]}...</p>
      <p className="text-sm text-chalk-dim">This usually takes 1 to 3 minutes</p>
    </div>
  );
};

const Builder = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");

  const wasGenerating = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchProject = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/projects/${projectId}`);
      setProject(data.project);
      setIsGenerating(data.isGenerating);
      // When the AI finishes (or fails and refunds), update the credits shown in the app.
      if (wasGenerating.current && !data.isGenerating) {
        refreshUser();
      }
      wasGenerating.current = data.isGenerating;
    } catch (error) {
      toast.error(getErrorMessage(error));
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        navigate("/projects");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate, refreshUser]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // While the AI is working, ask the server again every 4 seconds (polling).
  useEffect(() => {
    if (!isGenerating) return;
    const id = setInterval(fetchProject, 4000);
    return () => clearInterval(id);
  }, [isGenerating, fetchProject]);

  // Merge chat messages and code versions into one list, oldest first.
  const timeline: TimelineItem[] = project
    ? [
        ...project.conversation.map(
          (message): TimelineItem => ({
            kind: "message",
            time: new Date(message.timestamp).getTime(),
            message,
          })
        ),
        ...project.versions.map(
          (version): TimelineItem => ({
            kind: "version",
            time: new Date(version.timestamp).getTime(),
            version,
          })
        ),
      ].sort((a, b) => a.time - b.time)
    : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [timeline.length, isGenerating]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || isGenerating || sending) return;

    setSending(true);
    try {
      await api.post(`/api/projects/${projectId}/revisions`, { message });
      setInput("");
      await refreshUser();
      await fetchProject();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!window.confirm("Roll back to this version?")) return;
    try {
      const { data } = await api.post(`/api/projects/${projectId}/rollback/${versionId}`);
      toast.success(data.message);
      fetchProject();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handlePublish = async () => {
    try {
      const { data } = await api.post(`/api/projects/${projectId}/publish`);
      toast.success(data.message);
      setProject((prev) => (prev ? { ...prev, isPublished: data.isPublished } : prev));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDownload = () => {
    if (!project?.currentCode) return;
    const blob = new Blob([project.currentCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "index.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-signal" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center text-chalk-dim">
        This project could not be loaded.
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col text-chalk">
      {/* Top bar */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-bp-deep px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/projects"
            title="Back to My Projects"
            className="border border-line p-1.5 text-chalk-dim hover:text-chalk"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="max-w-[260px] truncate text-sm font-medium">{project.name}</p>
            <p className="text-xs text-chalk-dim">
              {project.isPublished ? "Published" : "Private draft"}
            </p>
          </div>
        </div>

        <div className="flex items-center border border-line">
          {DEVICES.map(({ id, Icon }) => (
            <button
              key={id}
              onClick={() => setDevice(id)}
              title={id}
              className={`p-1.5 ${device === id ? "bg-signal text-bp-deep" : "text-chalk-dim hover:text-chalk"}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="border border-line px-3 py-1.5 text-sm text-chalk-dim">
            <span className="font-semibold text-signal">{user?.credits ?? 0}</span> credits
          </span>
          {project.currentCode && (
            <>
              <Link to={`/preview/${project.id}`} target="_blank" className="btn-line">
                <ExternalLink className="h-4 w-4" />
                Preview
              </Link>
              <button onClick={handleDownload} className="btn-line">
                <Download className="h-4 w-4" />
                Download
              </button>
              <button onClick={handlePublish} className="btn-signal">
                {project.isPublished ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                {project.isPublished ? "Unpublish" : "Publish"}
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Chat sidebar */}
        <aside className="flex h-[45vh] w-full shrink-0 flex-col border-b border-line bg-bp-deep md:h-auto md:w-96 md:border-b-0 md:border-r">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {timeline.map((item) => {
              if (item.kind === "message") {
                const { message } = item;
                const isUser = message.role === "user";
                const isError = message.role === "error";
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="mt-1 border border-line p-1.5 text-chalk-dim">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-xs px-3 py-2 text-sm ${
                        isUser
                          ? "bg-signal text-bp-deep"
                          : isError
                            ? "border border-alert/40 bg-alert/10 text-alert"
                            : "border border-line bg-bp text-chalk"
                      }`}
                    >
                      {message.content}
                    </div>
                    {isUser && (
                      <div className="mt-1 border border-line p-1.5 text-chalk-dim">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              }

              const { version } = item;
              const isCurrent = version.id === project.currentVersionIndex;
              return (
                <div key={version.id} className="border border-line bg-bp p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-chalk">Code updated</span>
                    <span className="text-chalk-dim">
                      {new Date(version.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {version.description && (
                    <p className="mt-1 line-clamp-2 text-chalk-dim">{version.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    {isCurrent ? (
                      <span className="border border-mint/40 px-2 py-0.5 text-mint">
                        Current version
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRollback(version.id)}
                        className="flex items-center gap-1 border border-line px-2 py-1 text-chalk hover:bg-chalk/5"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Roll back to this version
                      </button>
                    )}
                    <Link
                      to={`/preview/${project.id}/${version.id}`}
                      target="_blank"
                      title="Preview this version"
                      className="p-1 text-chalk-dim hover:text-chalk"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-chalk-dim">
                <Loader className="h-4 w-4 animate-spin text-signal" />
                The AI is working on it...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-line p-3">
            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isGenerating || sending}
                placeholder="Describe a change (5 credits)"
                className="field resize-none text-sm"
              />
              <button
                type="submit"
                disabled={isGenerating || sending || !input.trim()}
                title="Send"
                className="bg-signal p-3 text-bp-deep hover:bg-signal-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
          </form>
        </aside>

        {/* Live preview */}
        <main className="relative min-h-[40vh] flex-1">
          <div className="absolute inset-0 overflow-auto p-4">
            {project.currentCode ? (
              <div className="relative mx-auto h-full transition-all" style={{ width: WIDTHS[device] }}>
                <iframe
                  title="Website preview"
                  srcDoc={project.currentCode}
                  sandbox="allow-scripts allow-popups"
                  className="h-full w-full border border-line bg-white"
                />
                {isGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bp-deep/80 text-chalk">
                    <Loader className="h-8 w-8 animate-spin text-signal" />
                    <p>Updating your website...</p>
                  </div>
                )}
              </div>
            ) : isGenerating ? (
              <GeneratingView />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-chalk-dim">
                This website could not be generated and your credits were refunded. Go back and try again.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Builder;