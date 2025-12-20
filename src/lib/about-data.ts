import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface AboutData {
  content: string;
}

const DEFAULT_ABOUT_DATA: AboutData = {
  content: "Full-Stack Developer with expertise in Next.js, Python, and FastAPI, specializing in building end-to-end web applications, automation tools, and system integrations. Known for delivering efficient, scalable solutions by combining strong problem-solving skills with a practical, engineering-driven mindset. Experienced in both frontend and backend development, I design systems that optimize processes, improve performance, and support business growth. Also I'm a heavy Clash Royale gamer.",
};

const ABOUT_DOC_PATH = "portfolio/about";

/**
 * Fetch About data from Firestore
 */
export async function getAboutData(): Promise<AboutData> {
  if (!db) {
    console.warn("[about-data] Firestore not initialized, returning default data");
    return DEFAULT_ABOUT_DATA;
  }

  try {
    console.log("[about-data] Fetching from Firestore path:", ABOUT_DOC_PATH);
    const docRef = doc(db, ABOUT_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[about-data] Document exists, raw data:", {
        hasContent: !!data.content,
        contentLength: data.content?.length || 0,
      });
      // Ensure all fields are defined
      const normalizedData: AboutData = {
        content: data.content || DEFAULT_ABOUT_DATA.content,
      };
      console.log("[about-data] Normalized data:", normalizedData);
      return normalizedData;
    } else {
      console.warn("[about-data] Document does not exist, creating with default data");
      // Document doesn't exist, create it with default data
      await setDoc(docRef, DEFAULT_ABOUT_DATA);
      return DEFAULT_ABOUT_DATA;
    }
  } catch (error) {
    console.error("[about-data] Error fetching About data:", error);
    console.error("[about-data] Error details:", error instanceof Error ? error.message : String(error));
    return DEFAULT_ABOUT_DATA;
  }
}

/**
 * Save About data to Firestore
 */
export async function saveAboutData(data: AboutData): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    // Ensure all fields are defined and properly structured
    const dataToSave: AboutData = {
      content: data.content || "",
    };
    
    console.log("[about-data] Saving About data to Firestore:", dataToSave);
    
    const docRef = doc(db, ABOUT_DOC_PATH);
    await setDoc(docRef, dataToSave, { merge: true });
    
    console.log("[about-data] About data saved successfully");
  } catch (error) {
    console.error("[about-data] Error saving About data:", error);
    throw error;
  }
}
