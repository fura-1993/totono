import Home, { type HomeAchievement } from "@/pages/Home";
import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export const revalidate = 300;

async function getPublishedAchievements(): Promise<HomeAchievement[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const rows = await db
      .select()
      .from(schema.achievements)
      .where(eq(schema.achievements.isPublished, 1))
      .orderBy(desc(schema.achievements.workDate), schema.achievements.displayOrder, desc(schema.achievements.createdAt))
      .limit(6);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      location: row.location,
      serviceType: row.serviceType,
      workDate: row.workDate,
      duration: row.duration,
      scope: row.scope,
      imageUrl: row.imageUrl,
    }));
  } catch (error) {
    console.error("Failed to load achievements:", error);
    return [];
  }
}

export default async function Page() {
  const achievements = await getPublishedAchievements();
  return <Home achievements={achievements} />;
}
