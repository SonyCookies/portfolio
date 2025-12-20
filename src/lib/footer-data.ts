import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface FooterData {
  copyrightName: string;
  techStack: string;
  credits: string;
}

const DEFAULT_FOOTER_DATA: FooterData = {
  copyrightName: "Sonny Sarcia",
  techStack: "Coded from scratch using Next.js and Tailwind CSS.",
  credits: "Layout inspiration from Bryl Lim. Design heavily influenced by Clash Royale.",
};

const FOOTER_DOC_PATH = "portfolio/footer";

/**
 * Fetch Footer data from Firestore
 */
export async function getFooterData(): Promise<FooterData> {
  if (!db) {
    console.warn("[footer-data] Firestore not initialized, returning default data");
    return DEFAULT_FOOTER_DATA;
  }

  try {
    console.log("[footer-data] Fetching from Firestore path:", FOOTER_DOC_PATH);
    const docRef = doc(db, FOOTER_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[footer-data] Document exists, raw data:", data);
      // Ensure all fields are defined
      const normalizedData: FooterData = {
        copyrightName: data.copyrightName || DEFAULT_FOOTER_DATA.copyrightName,
        techStack: data.techStack || DEFAULT_FOOTER_DATA.techStack,
        credits: data.credits || DEFAULT_FOOTER_DATA.credits,
      };
      console.log("[footer-data] Normalized data:", normalizedData);
      return normalizedData;
    } else {
      console.warn("[footer-data] Document does not exist, creating with default data");
      // Document doesn't exist, create it with default data
      await setDoc(docRef, DEFAULT_FOOTER_DATA);
      return DEFAULT_FOOTER_DATA;
    }
  } catch (error) {
    console.error("[footer-data] Error fetching Footer data:", error);
    console.error("[footer-data] Error details:", error instanceof Error ? error.message : String(error));
    return DEFAULT_FOOTER_DATA;
  }
}

/**
 * Save Footer data to Firestore
 */
export async function saveFooterData(data: FooterData): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    // Ensure all fields are defined and properly structured
    const dataToSave: FooterData = {
      copyrightName: data.copyrightName || "",
      techStack: data.techStack || "",
      credits: data.credits || "",
    };
    
    console.log("[footer-data] Saving Footer data to Firestore:", dataToSave);
    
    const docRef = doc(db, FOOTER_DOC_PATH);
    await setDoc(docRef, dataToSave, { merge: true });
    
    console.log("[footer-data] Footer data saved successfully");
  } catch (error) {
    console.error("[footer-data] Error saving Footer data:", error);
    throw error;
  }
}

