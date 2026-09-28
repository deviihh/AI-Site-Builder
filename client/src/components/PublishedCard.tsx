import { Link } from "react-router-dom";
import type { CommunityProject } from "../types";

const PublishedCard = ({ project }: { project: CommunityProject }) => (
  <Link
    to={`/view/${project.id}`}
    target="_blank"
    className="block w-80 max-w-full overflow-hidden rounded-2xl border border-line bg-bp-deep shadow-sm transition-colors hover:border-signal"
  >
    <div className="relative h-48 w-full overflow-hidden bg-white">
      {project.currentCode && (
        <iframe
          title={project.name}
          srcDoc={project.currentCode}
          sandbox="allow-scripts"
          loading="lazy"
          tabIndex={-1}
          className="pointer-events-none absolute left-0 top-0 h-[800px] w-[1280px] origin-top-left border-0"
          style={{ transform: "scale(0.25)" }}
        />
      )}
    </div>
    <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2 text-sm">
      <span className="line-clamp-1 text-chalk">{project.name}</span>
      <span className="shrink-0 text-xs text-chalk-dim">by {project.user.name}</span>
    </div>
  </Link>
);

export default PublishedCard;