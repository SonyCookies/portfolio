import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface SocialLink {
  label: string;
  href: string;
  icon?: string; // Platform name for icon selection
}

export interface ContactTile {
  title: string;
  desc: string;
  href?: string;
}

export interface NetworkData {
  memberships: string[];
  socialLinks: SocialLink[];
  speaking: string;
  contactTiles: ContactTile[];
}

const DEFAULT_NETWORK_DATA: NetworkData = {
  memberships: [
    "Dedicated IT Developers (DID)",
    "Integrated Society of Information Technology Enthusiasts - ISITE Inc"
  ],
  socialLinks: [
    { 
      label: "LinkedIn", 
      href: "https://www.linkedin.com/in/sonny-sarcia-13900138a/", 
      icon: "linkedin" 
    },
    { 
      label: "GitHub", 
      href: "https://github.com/SonyCookies", 
      icon: "github" 
    },
    { 
      label: "Instagram", 
      href: "https://www.instagram.com/lt_kowalski/", 
      icon: "instagram" 
    },
  ],
  speaking: "Available for speaking at events about software development and emerging technologies.",
  contactTiles: [
    { title: "Email", desc: "sonnypsarcia@gmail.com", href: "#contact" },
    { title: "Let's Talk", desc: "Schedule a Call", href: "#contact" },
    { title: "Community", desc: "Join Discussion", href: "#contact" },
  ],
};

const NETWORK_DOC_PATH = "portfolio/network";

/**
 * Fetch Network data from Firestore
 */
export async function getNetworkData(): Promise<NetworkData> {
  if (!db) {
    console.warn("[network-data] Firestore not initialized, returning default data");
    return DEFAULT_NETWORK_DATA;
  }

  try {
    console.log("[network-data] Fetching from Firestore path:", NETWORK_DOC_PATH);
    const docRef = doc(db, NETWORK_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[network-data] Document exists, raw data:", data);
      // Ensure all fields are defined
      const normalizedData: NetworkData = {
        memberships: data.memberships || DEFAULT_NETWORK_DATA.memberships,
        socialLinks: (data.socialLinks || []).map((link: Partial<SocialLink> & Record<string, unknown>) => ({
          label: link.label || "",
          href: link.href || "",
          icon: link.icon || "",
        })) as SocialLink[],
        speaking: data.speaking || DEFAULT_NETWORK_DATA.speaking,
        contactTiles: (data.contactTiles || []).map((tile: Partial<ContactTile> & Record<string, unknown>) => ({
          title: tile.title || "",
          desc: tile.desc || "",
          href: tile.href || "#contact",
        })) as ContactTile[],
      };
      console.log("[network-data] Normalized data:", normalizedData);
      return normalizedData;
    } else {
      console.warn("[network-data] Document does not exist, creating with default data");
      // Document doesn't exist, create it with default data
      await setDoc(docRef, DEFAULT_NETWORK_DATA);
      return DEFAULT_NETWORK_DATA;
    }
  } catch (error) {
    console.error("[network-data] Error fetching Network data:", error);
    console.error("[network-data] Error details:", error instanceof Error ? error.message : String(error));
    return DEFAULT_NETWORK_DATA;
  }
}

/**
 * Save Network data to Firestore
 */
export async function saveNetworkData(data: NetworkData): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    // Ensure all fields are defined and properly structured
    const dataToSave: NetworkData = {
      memberships: data.memberships || [],
      socialLinks: (data.socialLinks || []).map((link) => ({
        label: link.label || "",
        href: link.href || "",
        icon: link.icon || "",
      })),
      speaking: data.speaking || "",
      contactTiles: (data.contactTiles || []).map((tile) => ({
        title: tile.title || "",
        desc: tile.desc || "",
        href: tile.href || "#contact",
      })),
    };
    
    console.log("[network-data] Saving Network data to Firestore:", dataToSave);
    
    const docRef = doc(db, NETWORK_DOC_PATH);
    await setDoc(docRef, dataToSave, { merge: true });
    
    console.log("[network-data] Network data saved successfully");
  } catch (error) {
    console.error("[network-data] Error saving Network data:", error);
    throw error;
  }
}
