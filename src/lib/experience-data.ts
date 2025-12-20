import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface ExperienceItem {
  id: string;
  role: string;
  org: string;
  start: string;
  end?: string;
  awards?: string[];
}

export interface ExperienceData {
  items: ExperienceItem[];
}

const DEFAULT_EXPERIENCE_DATA: ExperienceData = {
  items: [
    { 
      id: "exp-1",
      role: "Software Developer Freelancer", 
      org: "Private Individuals", 
      start: "2024", 
      end: "Present" 
    },
    {
      id: "exp-2",
      role: "BS Information Technology",
      org: "Mindoro State University",
      start: "2022",
      end: "2026",
      awards: [
        "Consistent Dean's Lister",
        "Running for Magna Cum Laude",
      ],
    },
    { 
      id: "exp-3",
      role: "Wrote my first line of code", 
      org: "Hello World", 
      start: "2018" 
    },
  ],
};

const EXPERIENCE_DOC_PATH = "portfolio/experience";

/**
 * Fetch Experience data from Firestore
 */
export async function getExperienceData(): Promise<ExperienceData> {
  if (!db) {
    console.warn("[experience-data] Firestore not initialized, returning default data");
    return DEFAULT_EXPERIENCE_DATA;
  }

  try {
    console.log("[experience-data] Fetching from Firestore path:", EXPERIENCE_DOC_PATH);
    const docRef = doc(db, EXPERIENCE_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[experience-data] Document exists, raw data:", {
        itemsCount: data.items?.length || 0,
      });
      // Ensure all fields are defined
      const normalizedData: ExperienceData = {
        items: data.items || DEFAULT_EXPERIENCE_DATA.items,
      };
      console.log("[experience-data] Normalized data:", normalizedData);
      return normalizedData;
    } else {
      console.warn("[experience-data] Document does not exist, creating with default data");
      // Document doesn't exist, create it with default data
      await setDoc(docRef, DEFAULT_EXPERIENCE_DATA);
      return DEFAULT_EXPERIENCE_DATA;
    }
  } catch (error) {
    console.error("[experience-data] Error fetching Experience data:", error);
    console.error("[experience-data] Error details:", error instanceof Error ? error.message : String(error));
    return DEFAULT_EXPERIENCE_DATA;
  }
}

/**
 * Save Experience data to Firestore
 */
export async function saveExperienceData(data: ExperienceData): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    // Ensure all fields are defined and properly structured
    const dataToSave: ExperienceData = {
      items: data.items || [],
    };
    
    console.log("[experience-data] Saving Experience data to Firestore:", dataToSave);
    
    const docRef = doc(db, EXPERIENCE_DOC_PATH);
    await setDoc(docRef, dataToSave, { merge: true });
    
    console.log("[experience-data] Experience data saved successfully");
  } catch (error) {
    console.error("[experience-data] Error saving Experience data:", error);
    throw error;
  }
}
