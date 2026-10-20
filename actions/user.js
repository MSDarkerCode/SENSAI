"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("User not found");

  try {
    const existingInsight = await db.industryInsight.findUnique({
      where: {
        industry: data.industry,
      },
    });

    let generatedInsightData = null;

    if (!existingInsight) {
      const insights = await generateAIInsights(data.industry);

      const demandLevelMap = {
        high: "HIGH",
        medium: "MEDIUM",
        low: "LOW",
      };

      const marketOutlookMap = {
        positive: "POSITIVE",
        neutral: "NEUTRAL",
        negative: "NEGATIVE",
      };

      const demandLevel = demandLevelMap[insights.demandLevel?.toLowerCase()];

      const marketOutlook =
        marketOutlookMap[insights.marketOutlook?.toLowerCase()];

      if (!demandLevel || !marketOutlook) {
        throw new Error("Gemini returned an invalid enum value.");
      }

      generatedInsightData = {
        ...insights,
        demandLevel,
        marketOutlook,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
    }

    const result = await db.$transaction(
      async (tx) => {
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        if (!industryInsight && generatedInsightData) {
          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...generatedInsightData,
            },
          });
        }

        if (!industryInsight) {
          throw new Error("Industry insights could not be created.");
        }

        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000,
      },
    );

    revalidatePath("/");
    return { success: true, ...result };
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile: " + error.message);
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error.message);
    throw new Error("Failed to check onboarding status");
  }
}
