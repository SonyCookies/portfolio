import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  position?: string;
  approved?: boolean;
  createdAt?: number;
}

export interface InviteToken {
  token: string;
  recipientName?: string;
  createdAt: number;
  used: boolean;
}

export interface TestimonialsData {
  testimonials: Testimonial[];
  inviteTokens?: InviteToken[];
}

const DEFAULT_TESTIMONIALS_DATA: TestimonialsData = {
  testimonials: [
    {
      id: "testimonial-1",
      quote: "Sonny's technical expertise is top‑notch, but what really sets him apart is his ability to understand business needs and translate them into scalable solutions.",
      author: "— at",
      position: "Product Leader",
      approved: true,
      createdAt: 1716500000000,
    },
    {
      id: "testimonial-2",
      quote: "Thinks in systems, ships reliably, and elevates team velocity with practical patterns and tooling.",
      author: "— at",
      position: "VP of Engineering",
      approved: true,
      createdAt: 1716500000000,
    },
  ],
  inviteTokens: [],
};

const TESTIMONIALS_DOC_PATH = "portfolio/testimonials";

/**
 * Fetch Testimonials data from Firestore
 */
export async function getTestimonialsData(): Promise<TestimonialsData> {
  if (!db) {
    console.warn("[testimonials-data] Firestore not initialized, returning default data");
    return DEFAULT_TESTIMONIALS_DATA;
  }

  try {
    console.log("[testimonials-data] Fetching from Firestore path:", TESTIMONIALS_DOC_PATH);
    const docRef = doc(db, TESTIMONIALS_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[testimonials-data] Document exists, raw data:", data);
      // Ensure all fields are defined
      const normalizedData: TestimonialsData = {
        testimonials: (data.testimonials || []).map((testimonial: Partial<Testimonial> & Record<string, unknown>) => ({
          id: testimonial.id || `testimonial-${Date.now()}-${Math.random()}`,
          quote: testimonial.quote || "",
          author: testimonial.author || "",
          position: testimonial.position || "",
          approved: testimonial.approved !== false, // default true
          createdAt: testimonial.createdAt || Date.now(),
        })) as Testimonial[],
        inviteTokens: (data.inviteTokens || []).map((t: any) => ({
          token: t.token || "",
          recipientName: t.recipientName || "",
          createdAt: t.createdAt || Date.now(),
          used: !!t.used,
        })) as InviteToken[],
      };
      console.log("[testimonials-data] Normalized data:", normalizedData);
      return normalizedData;
    } else {
      console.warn("[testimonials-data] Document does not exist, creating with default data");
      // Document doesn't exist, create it with default data
      await setDoc(docRef, DEFAULT_TESTIMONIALS_DATA);
      return DEFAULT_TESTIMONIALS_DATA;
    }
  } catch (error) {
    console.error("[testimonials-data] Error fetching Testimonials data:", error);
    console.error("[testimonials-data] Error details:", error instanceof Error ? error.message : String(error));
    return DEFAULT_TESTIMONIALS_DATA;
  }
}

/**
 * Save Testimonials data to Firestore
 */
export async function saveTestimonialsData(data: TestimonialsData): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    // Ensure all fields are defined and properly structured
    const dataToSave: TestimonialsData = {
      testimonials: (data.testimonials || []).map((testimonial) => ({
        id: testimonial.id || `testimonial-${Date.now()}-${Math.random()}`,
        quote: testimonial.quote || "",
        author: testimonial.author || "",
        position: testimonial.position || "",
        approved: testimonial.approved !== false,
        createdAt: testimonial.createdAt || Date.now(),
      })),
      inviteTokens: (data.inviteTokens || []).map((t) => ({
        token: t.token || "",
        recipientName: t.recipientName || "",
        createdAt: t.createdAt || Date.now(),
        used: !!t.used,
      })),
    };
    
    console.log("[testimonials-data] Saving Testimonials data to Firestore:", dataToSave);
    
    const docRef = doc(db, TESTIMONIALS_DOC_PATH);
    await setDoc(docRef, dataToSave, { merge: true });
    
    console.log("[testimonials-data] Testimonials data saved successfully");
  } catch (error) {
    console.error("[testimonials-data] Error saving Testimonials data:", error);
    throw error;
  }
}

