import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface Certificate {
  id: string;
  title: string;
  org: string;
  href: string;
  details: string;
  imageUrl?: string; // Optional image URL for the certificate photo
}

export interface CertificationsData {
  certificates: Certificate[];
}

const DEFAULT_CERTIFICATIONS_DATA: CertificationsData = {
  certificates: [
    {
      id: "cert-1",
      title: "Certificate of Training – Java NC3",
      org: "BCRV TECHVOC INC & Tesda",
      href: "#",
      details: "This certificate demonstrates proficiency in Java programming fundamentals, object-oriented programming concepts, and practical application development. The training covered core Java syntax, data structures, exception handling, and GUI development.",
    },
  ],
};

const CERTIFICATIONS_DOC_PATH = "portfolio/certifications";

/**
 * Fetch Certifications data from Firestore
 */
export async function getCertificationsData(): Promise<CertificationsData> {
  if (!db) {
    console.warn("[certifications-data] Firestore not initialized, returning default data");
    return DEFAULT_CERTIFICATIONS_DATA;
  }

  try {
    console.log("[certifications-data] Fetching from Firestore path:", CERTIFICATIONS_DOC_PATH);
    const docRef = doc(db, CERTIFICATIONS_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[certifications-data] Document exists, raw data:", {
        hasCertificates: !!data.certificates,
        certificatesCount: data.certificates?.length || 0,
      });
      // Ensure all fields are defined
      const normalizedData: CertificationsData = {
        certificates: (data.certificates || []).map((cert: Partial<Certificate> & Record<string, unknown>) => ({
          id: cert.id || `cert-${Date.now()}`,
          title: cert.title || "",
          org: cert.org || "",
          href: cert.href || "#",
          details: cert.details || "",
          imageUrl: cert.imageUrl || "",
        })) as Certificate[],
      };
      console.log("[certifications-data] Normalized data:", normalizedData);
      return normalizedData;
    } else {
      console.warn("[certifications-data] Document does not exist, creating with default data");
      // Document doesn't exist, create it with default data
      await setDoc(docRef, DEFAULT_CERTIFICATIONS_DATA);
      return DEFAULT_CERTIFICATIONS_DATA;
    }
  } catch (error) {
    console.error("[certifications-data] Error fetching Certifications data:", error);
    console.error("[certifications-data] Error details:", error instanceof Error ? error.message : String(error));
    return DEFAULT_CERTIFICATIONS_DATA;
  }
}

/**
 * Save Certifications data to Firestore
 */
export async function saveCertificationsData(data: CertificationsData): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    // Ensure all fields are defined and properly structured
    const dataToSave: CertificationsData = {
      certificates: (data.certificates || []).map((cert) => ({
        id: cert.id || `cert-${Date.now()}`,
        title: cert.title || "",
        org: cert.org || "",
        href: cert.href || "#",
        details: cert.details || "",
        imageUrl: cert.imageUrl || "",
      })),
    };
    
    console.log("[certifications-data] Saving Certifications data to Firestore:", dataToSave);
    
    const docRef = doc(db, CERTIFICATIONS_DOC_PATH);
    await setDoc(docRef, dataToSave, { merge: true });
    
    console.log("[certifications-data] Certifications data saved successfully");
  } catch (error) {
    console.error("[certifications-data] Error saving Certifications data:", error);
    throw error;
  }
}
