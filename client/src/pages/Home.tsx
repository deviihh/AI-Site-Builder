import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader, MessageSquare, Pencil, Rocket } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import PublishedCard from "../components/PublishedCard";
import { SAMPLE_SITE_HTML } from "../lib/sampleSite";
import type { CommunityProject } from "../types";

const EXAMPLES = [
  "A landing page for a coffee shop",
  "A portfolio for a web developer",
  "A page for a fitness app",
];

const STEPS = [
  {
    Icon: MessageSquare,
    title: "Describe it",
    text: "Write what you want in plain words. The AI turns it into a complete, responsive page.",
  },
  {
    Icon: Pencil,
    title: "Refine it",
    text: "Ask for changes in the chat. Every change is saved as a version you can roll back to.",
  },
  {
    Icon: Rocket,
    title: "Publish it",
    text: "Check it on phone, tablet and desktop, download the HTML, or share it with the community.",
  },
];

const HeroMockup = () => (
  <div className="relative hidden w-[540px] xl:block">
    <div className="overflow-hidden rounded-2xl border border-line bg-bp-deep shadow-[0_30px_80px_-30px_rgba(36,29,24,0.45)]">
      <div className="flex items-center gap-2 border-b border-line bg-bp-raise px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-chalk/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-chalk/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-chalk/20" />
        <span className="ml-3 flex-1 rounded-full bg-bp-deep px-3 py-1 text-xs text-chalk-dim">
        MyCart.example
        </span>
      </div>
      <div className="relative h-[338px] w-full overflow-hidden bg-white">
        <iframe
          title="Example website"
          srcDoc={SAMPLE_SITE_HTML}
          sandbox="allow-scripts"
          tabIndex={-1}
          className="pointer-events-none absolute left-0 top-0 h-[800px] w-[1280px] origin-top-left border-0"
          style={{ transform: "scale(0.421875)" }}
        />
      </div>
    </div>
  </div>
);

const Home = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [samples, setSamples] = useState<CommunityProject[]>([]);

  useEffect(() => {
    api
      .get("/api/community")
      .then(({ data }) => setSamples((data.projects as CommunityProject[]).slice(0, 3)))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Sign in to build a website");
      navigate("/login");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Describe the website you want first");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/projects", { prompt });
      await refreshUser();
      toast.success("Building your website");
      navigate(`/projects/${data.projectId}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-14 px-5 pb-10 pt-14 sm:pt-20 xl:grid-cols-[1fr_540px] xl:items-center">
        <div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-chalk sm:text-6xl">
            Describe a website. Get the finished page.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-chalk-dim">
            Write what you want in plain words. The AI builds it, you preview it, ask for changes,
            and publish it when it is ready.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-9 max-w-2xl rounded-2xl border border-line bg-bp-deep p-4 shadow-[0_20px_60px_-25px_rgba(36,29,24,0.3)]"
          >
            <textarea
              rows={3}
              aria-label="Describe your website"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A landing page for a small bakery, with a menu and opening hours"
              className="w-full resize-none bg-transparent p-1 text-lg text-chalk placeholder:text-chalk-dim/70"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <button
                    type="button"
                    key={example}
                    onClick={() => setPrompt(example)}
                    className="rounded-full bg-bp-raise px-3 py-1 text-xs font-medium text-chalk-dim hover:text-chalk"
                  >
                    {example}
                  </button>
                ))}
              </div>
              <button type="submit" disabled={loading} className="btn-signal px-6 py-3">
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Building...
                  </>
                ) : (
                  <>
                    Build website
                    <span className="text-xs font-normal opacity-75">5 credits</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {!user && (
            <p className="mt-4 text-sm text-chalk-dim">
              New accounts start with 20 credits, enough for four websites.
            </p>
          )}
        </div>

        <HeroMockup />
      </section>

      {/* How it works */}
      <section className="mx-auto mt-28 max-w-6xl px-5">
        <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight text-chalk">
          From one sentence to a page you can share
        </h2>
        <div className="mt-10 grid gap-10 border-t border-line pt-10 md:grid-cols-3">
          {STEPS.map(({ Icon, title, text }) => (
            <div key={title}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tint text-signal">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold text-chalk">{title}</h3>
              <p className="mt-2 text-chalk-dim">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Published sites */}
      {samples.length > 0 && (
        <section className="mx-auto mt-28 max-w-6xl px-5">
          <div className="mb-8 flex items-end justify-between border-b border-line pb-4">
            <h2 className="font-display text-4xl font-bold text-chalk">
              Sites people have published
            </h2>
            <Link to="/community" className="text-sm font-medium text-signal hover:underline">
              See all
            </Link>
          </div>
          <div className="flex flex-wrap gap-6">
            {samples.map((project) => (
              <PublishedCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Call to action for visitors */}
      {!user && (
        <section className="mx-auto mt-28 max-w-6xl px-5">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-signal p-10 text-bp-deep sm:flex-row sm:items-center">
            <h2 className="max-w-xl font-display text-3xl font-bold leading-tight">
              Your first website takes about two minutes.
            </h2>
            <Link
              to="/register"
              className="rounded-full bg-bp-deep px-6 py-3 text-sm font-semibold text-signal hover:bg-bp-raise"
            >
              Create a free account
            </Link>
          </div>
        </section>
      )}

      <footer className="mt-24 border-t border-line py-8 text-center text-sm text-chalk-dim">
        Built with React, Express, PostgreSQL and OpenRouter.
      </footer>
    </div>
  );
};

export default Home;