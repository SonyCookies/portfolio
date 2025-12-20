import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface TechStackData {
  categories: Record<string, string[]>;
  featured: string[];
}

const DEFAULT_TECHSTACK_DATA: TechStackData = {
  categories: {
    "Full-Stack Frameworks & Runtime": [
      "Next.js",
      "Vue.js",
      "Django",
      "FastAPI",
      "Node.js",
    ],
    "Languages & Core Tools": [
      "JavaScript",
      "TypeScript",
      "Python",
      "SQL",
      "HTML/CSS",
      "Git",
    ],
    "Frontend & UI": [
      "React",
      "Vite",
      "TailwindCSS",
      "Bootstrap",
      "React Native",
      "Flutter",
    ],
    "Backend & Data": [
      "REST APIs",
      "MySQL",
      "NoSQL",
      "MongoDB",
      "Docker",
      "Flask",
    ],
    "AI & Specialized Systems": [
      "TensorFlow",
      "OpenAI GPT",
      "Computer Vision",
      "Microcontrollers (Arduino/Raspberry Pi)",
      "C/C++",
    ],
  },
  featured: [
    "Next.js",
    "TypeScript",
    "Python",
    "React",
    "TailwindCSS",
    "FastAPI",
    "Docker",
    "MySQL",
  ],
};

const TECHSTACK_DOC_PATH = "portfolio/techstack";

/**
 * Fetch TechStack data from Firestore
 */
export async function getTechStackData(): Promise<TechStackData> {
  if (!db) {
    console.warn("[techstack-data] Firestore not initialized, returning default data");
    return DEFAULT_TECHSTACK_DATA;
  }

  try {
    console.log("[techstack-data] Fetching from Firestore path:", TECHSTACK_DOC_PATH);
    const docRef = doc(db, TECHSTACK_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[techstack-data] Document exists, raw data:", {
        hasCategories: !!data.categories,
        categoriesCount: Object.keys(data.categories || {}).length,
        featuredCount: data.featured?.length || 0,
      });
      // Ensure all fields are defined
      const normalizedData: TechStackData = {
        categories: data.categories || DEFAULT_TECHSTACK_DATA.categories,
        featured: data.featured || DEFAULT_TECHSTACK_DATA.featured,
      };
      console.log("[techstack-data] Normalized data:", normalizedData);
      return normalizedData;
    } else {
      console.warn("[techstack-data] Document does not exist, creating with default data");
      // Document doesn't exist, create it with default data
      await setDoc(docRef, DEFAULT_TECHSTACK_DATA);
      return DEFAULT_TECHSTACK_DATA;
    }
  } catch (error) {
    console.error("[techstack-data] Error fetching TechStack data:", error);
    console.error("[techstack-data] Error details:", error instanceof Error ? error.message : String(error));
    return DEFAULT_TECHSTACK_DATA;
  }
}

/**
 * Save TechStack data to Firestore
 */
export async function saveTechStackData(data: TechStackData): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    // Ensure all fields are defined and properly structured
    const dataToSave: TechStackData = {
      categories: data.categories || {},
      featured: data.featured || [],
    };
    
    console.log("[techstack-data] Saving TechStack data to Firestore:", dataToSave);
    
    const docRef = doc(db, TECHSTACK_DOC_PATH);
    await setDoc(docRef, dataToSave, { merge: true });
    
    console.log("[techstack-data] TechStack data saved successfully");
  } catch (error) {
    console.error("[techstack-data] Error saving TechStack data:", error);
    throw error;
  }
}

