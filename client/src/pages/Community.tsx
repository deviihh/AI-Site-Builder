import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../lib/api";
import PublishedCard from "../components/PublishedCard";
import type { CommunityProject } from "../types";

const Community = () => {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/community");
        setProjects(data.projects);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-signal" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-8 border-b border-line pb-4">
        <h1 className="font-display text-5xl font-bold leading-none text-chalk">
          Published sites
        </h1>
        <p className="mt-2 text-chalk-dim">Websites other people built and chose to share. Click one to open it full screen.</p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-20 text-center text-chalk-dim">
          Nothing is published yet. Open one of your projects and click Publish.
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {projects.map((project) => (
            <PublishedCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;