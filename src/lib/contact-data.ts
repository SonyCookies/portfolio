import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface ContactData {
  email: string;
  phone: string;
  socialLinks: SocialLink[];
}

const DEFAULT_CONTACT_DATA: ContactData = {
  email: "sonnypsarcia@gmail.com",
  phone: "+639266301717",
  socialLinks: [
    {
      platform: "LinkedIn",
      url: "https://www.linkedin.com/in/sonny-sarcia-13900138a/",
      label: "LinkedIn",
    },
    {
      platform: "GitHub",
      url: "https://github.com/SonyCookies",
      label: "GitHub",
    },
    {
      platform: "Facebook",
      url: "https://www.facebook.com/ynnos.aicras/",
      label: "Facebook",
    },
    {
      platform: "Instagram",
      url: "https://www.instagram.com/lt_kowalski/",
      label: "Instagram",
    },
  ],
};

const CONTACT_DOC_PATH = "portfolio/contact";

/**
 * Fetch Contact data from Firestore
 */
export async function getContactData(): Promise<ContactData> {
  if (!db) {
    console.warn("[contact-data] Firestore not initialized, returning default data");
    return DEFAULT_CONTACT_DATA;
  }

  try {
    console.log("[contact-data] Fetching from Firestore path:", CONTACT_DOC_PATH);
    const docRef = doc(db, CONTACT_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[contact-data] Document exists, raw data:", {
        hasEmail: !!data.email,
        hasPhone: !!data.phone,
        socialLinksCount: data.socialLinks?.length || 0,
      });
      // Ensure all fields are defined
      const normalizedData: ContactData = {
        email: data.email || DEFAULT_CONTACT_DATA.email,
        phone: data.phone || DEFAULT_CONTACT_DATA.phone,
        socialLinks: data.socialLinks || DEFAULT_CONTACT_DATA.socialLinks,
      };
      console.log("[contact-data] Normalized data:", normalizedData);
      return normalizedData;
    } else {
      console.warn("[contact-data] Document does not exist, creating with default data");
      // Document doesn't exist, create it with default data
      await setDoc(docRef, DEFAULT_CONTACT_DATA);
      return DEFAULT_CONTACT_DATA;
    }
  } catch (error) {
    console.error("[contact-data] Error fetching Contact data:", error);
    console.error("[contact-data] Error details:", error instanceof Error ? error.message : String(error));
    return DEFAULT_CONTACT_DATA;
  }
}

/**
 * Save Contact data to Firestore
 */
export async function saveContactData(data: ContactData): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    // Ensure all fields are defined and properly structured
    const dataToSave: ContactData = {
      email: data.email || "",
      phone: data.phone || "",
      socialLinks: data.socialLinks || [],
    };
    
    console.log("[contact-data] Saving Contact data to Firestore:", dataToSave);
    
    const docRef = doc(db, CONTACT_DOC_PATH);
    await setDoc(docRef, dataToSave, { merge: true });
    
    console.log("[contact-data] Contact data saved successfully");
  } catch (error) {
    console.error("[contact-data] Error saving Contact data:", error);
    throw error;
  }
}
