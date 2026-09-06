import app from './app';
import { refreshGoalsFromMlEngine, goalsDataSource } from './state';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  // Best-effort: enrich GOALS with the ML engine's real feasibility numbers before
  // accepting traffic. If the ML engine isn't running yet, we still start up using
  // the baseline estimate computed in ./state.ts and keep retrying in the background
  // so the dashboard "heals" automatically once the ML engine comes online.
  await refreshGoalsFromMlEngine();

  app.listen(PORT, () => {
    console.log(`🚀 WealthAI Backend running on http://localhost:${PORT}`);
    console.log(`   Goals data source: ${goalsDataSource}`);
  });

  setInterval(() => {
    refreshGoalsFromMlEngine().catch(() => {});
  }, 60_000);
}

bootstrap();
