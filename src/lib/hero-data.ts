import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface HeroData {
  name: string;
  location: string;
  jobTitle: string;
  email: string;
  resumeUrl: string;
  bannerImage: string;
  profilePhoto: string;
}

const DEFAULT_HERO_DATA: HeroData = {
  name: "Sonny Sarcia",
  location: "Pinamalayan, Oriental Mindoro",
  jobTitle: "Full Stack Developer",
  email: "sonnypsarcia@gmail.com",
  resumeUrl: "/files/Sarcia_Resume.pdf",
  bannerImage: "/LoongDrakeBG.png",
  profilePhoto: "/SONNY_PHOTO.png",
};

const HERO_DOC_PATH = "portfolio/hero";

/**
 * Fetch hero data from Firestore
 */
export async function getHeroData(): Promise<HeroData> {
  if (!db) {
    console.warn("Firestore not initialized, returning default data");
    return DEFAULT_HERO_DATA;
  }

  try {
    const docRef = doc(db, HERO_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as HeroData;
    } else {
      // Document doesn't exist, create it with default data
      await setDoc(docRef, DEFAULT_HERO_DATA);
      return DEFAULT_HERO_DATA;
    }
  } catch (error) {
    console.error("Error fetching hero data:", error);
    return DEFAULT_HERO_DATA;
  }
}

/**
 * Save hero data to Firestore
 */
export async function saveHeroData(data: HeroData): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    const docRef = doc(db, HERO_DOC_PATH);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Error saving hero data:", error);
    throw error;
  }
}


