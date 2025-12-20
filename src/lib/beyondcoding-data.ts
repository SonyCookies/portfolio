import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface BeyondCodingData {
  description: string;
  interests: string[];
}

const DEFAULT_BEYONDCODING_DATA: BeyondCodingData = {
  description: "Off the keyboard, I enjoy competitive strategy games, tinkering with hardware, and learning about design, psychology, and finance. Always exploring systems thinking and how it applies to real life.",
  interests: [
    "Clash Royale",
    "Chess",
    "Fitness",
    "Motorbiking",
    "Connecting with Nature",
  ],
};

const BEYONDCODING_DOC_PATH = "portfolio/beyondcoding";

/**
 * Fetch BeyondCoding data from Firestore
 */
export async function getBeyondCodingData(): Promise<BeyondCodingData> {
  if (!db) {
    console.warn("[beyondcoding-data] Firestore not initialized, returning default data");
    return DEFAULT_BEYONDCODING_DATA;
  }

  try {
    console.log("[beyondcoding-data] Fetching from Firestore path:", BEYONDCODING_DOC_PATH);
    const docRef = doc(db, BEYONDCODING_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[beyondcoding-data] Document exists, raw data:", data);
      // Ensure all fields are defined
      const normalizedData: BeyondCodingData = {
        description: data.description || DEFAULT_BEYONDCODING_DATA.description,
        interests: data.interests || DEFAULT_BEYONDCODING_DATA.interests,
      };
      console.log("[beyondcoding-data] Normalized data:", normalizedData);
      return normalizedData;
    } else {
      console.warn("[beyondcoding-data] Document does not exist, creating with default data");
      // Document doesn't exist, create it with default data
      await setDoc(docRef, DEFAULT_BEYONDCODING_DATA);
      return DEFAULT_BEYONDCODING_DATA;
    }
  } catch (error) {
    console.error("[beyondcoding-data] Error fetching BeyondCoding data:", error);
    console.error("[beyondcoding-data] Error details:", error instanceof Error ? error.message : String(error));
    return DEFAULT_BEYONDCODING_DATA;
  }
}

/**
 * Save BeyondCoding data to Firestore
 */
export async function saveBeyondCodingData(data: BeyondCodingData): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    // Ensure all fields are defined and properly structured
    const dataToSave: BeyondCodingData = {
      description: data.description || "",
      interests: data.interests || [],
    };
    
    console.log("[beyondcoding-data] Saving BeyondCoding data to Firestore:", dataToSave);
    
    const docRef = doc(db, BEYONDCODING_DOC_PATH);
    await setDoc(docRef, dataToSave, { merge: true });
    
    console.log("[beyondcoding-data] BeyondCoding data saved successfully");
  } catch (error) {
    console.error("[beyondcoding-data] Error saving BeyondCoding data:", error);
    throw error;
  }
}
