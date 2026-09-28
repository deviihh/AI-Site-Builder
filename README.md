# AI Site Builder

Describe a website in plain words and get a finished, responsive page. Preview it on phone, tablet and desktop, ask for changes in a chat, roll back to any earlier version, download the HTML, or publish it to a public gallery.

**Live demo:** _add your link here after deployment_

## Features

- Email and password sign-up and login (JWT, bcrypt-hashed passwords)
- Credit system: 20 free credits, 5 per new site or revision, automatic refund when generation fails
- AI generation in two steps: prompt enhancement, then full-page HTML generation
- Chat-based revisions, each saved as a version, with rollback to any version
- Live preview in a sandboxed iframe with phone, tablet and desktop widths
- Publish and unpublish to a public community gallery (viewable without login)
- Download any generated page as an HTML file

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Neon) with Prisma ORM |
| AI | OpenRouter free models, called through the OpenAI SDK |
| Images | Unsplash Search API |

## How generation works

1. The client sends a prompt. The API deducts 5 credits and creates the project in one database transaction, then replies immediately with the project id.
2. A background job enhances the prompt, then asks a model for a single-file HTML page.
3. The output is validated. A common mistake (a `<style>` block closed with `</script>`) is repaired, and malformed pages are rejected. On a timeout or bad output the job retries up to 3 times, using the next model in a configured list.
4. The model writes `data-img-query` placeholders instead of image URLs. The server resolves each one with an Unsplash search and falls back to a placeholder image.
5. The result is saved as a new version. If every attempt fails, the credits are refunded.
6. While the project is generating, the frontend polls its status every few seconds.

## Engineering notes

- **Atomic credits:** a conditional update (`credits >= cost`) runs in the same transaction as project creation, so a user cannot spend credits they do not have.
- **Ownership checks:** every project query filters by both project id and user id.
- **Untrusted output:** generated pages run in an iframe with `sandbox="allow-scripts allow-popups"` and without `allow-same-origin`, so page code cannot read the app's login token.
- **Unreliable dependency:** free models are slow and inconsistent, so calls have timeouts, model fallback, output validation and refunds.
- **Busy state:** derived from the latest conversation message, with no extra column. Jobs older than 12 minutes are treated as dead.

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | no | Create an account |
| POST | `/api/auth/login` | no | Log in, returns a JWT |
| GET | `/api/auth/me` | yes | Current user and credits |
| POST | `/api/projects` | yes | Create a project from a prompt |
| GET | `/api/projects` | yes | List my projects |
| GET | `/api/projects/:id` | yes | Project with chat and versions |
| DELETE | `/api/projects/:id` | yes | Delete a project |
| POST | `/api/projects/:id/revisions` | yes | Request a change |
| POST | `/api/projects/:id/rollback/:versionId` | yes | Restore a version |
| POST | `/api/projects/:id/publish` | yes | Toggle publish |
| GET | `/api/community` | no | Published projects |
| GET | `/api/community/:id` | no | One published page |

## Run locally

You need Node.js 20 or newer, a PostgreSQL database (Neon works), an OpenRouter API key and an Unsplash access key.

```bash
git clone https://github.com/deviihh/AI-Site-Builder.git
cd AI-Site-Builder/server
npm install
# copy .env.example to .env and fill in the values
npx prisma migrate deploy
npm run dev
```

In a second terminal:

```bash
cd AI-Site-Builder/client
npm install
# copy .env.example to .env
npm run dev
```

Open http://localhost:5173.

## Known limitations

- Free AI models are slow and sometimes fail. Retries and refunds handle it, but a generation can take minutes.
- Background jobs run inside the server process. A restart during generation loses that job and its credits are not refunded. A job queue with stale-job cleanup would fix this.
- The busy check reduces duplicate jobs but is not a hard lock, so two simultaneous requests could both start.
- Generated sites are static HTML. Their forms and buttons do not send data anywhere.
- The JWT is stored in localStorage, there is no login rate limiting, and there are no automated tests.
- The free Unsplash tier is rate-limited, so a placeholder image is used when a search fails.
- On free hosting, the first request after idle time can take about a minute.