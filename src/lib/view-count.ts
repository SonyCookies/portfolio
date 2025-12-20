import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, increment } from "firebase/firestore";

const VIEW_COUNT_DOC_PATH = "portfolio/stats";

export interface ViewCountData {
  totalViews: number;
  lastUpdated: string;
}

const DEFAULT_VIEW_COUNT: ViewCountData = {
  totalViews: 0,
  lastUpdated: new Date().toISOString(),
};

/**
 * Get the current view count from Firestore
 */
export async function getViewCount(): Promise<number> {
  if (!db) {
    console.warn("[view-count] Firestore not initialized, returning 0");
    return 0;
  }

  try {
    console.log("[view-count] Fetching view count from Firestore path:", VIEW_COUNT_DOC_PATH);
    const docRef = doc(db, VIEW_COUNT_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const viewCount = data.totalViews || 0;
      console.log("[view-count] Current view count:", viewCount);
      return viewCount;
    } else {
      console.warn("[view-count] Document does not exist, creating with default");
      await setDoc(docRef, DEFAULT_VIEW_COUNT);
      return 0;
    }
  } catch (error) {
    console.error("[view-count] Error fetching view count:", error);
    return 0;
  }
}
