import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface Project {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  href: string;
  repo: string;
  isRecent?: boolean; // Deprecated: kept for backward compatibility, but computed from index
}

/**
 * Helper function to determine if a project is recent based on its index
 * The first 2 projects are automatically considered recent
 */
export function isProjectRecent(projectIndex: number): boolean {
  return projectIndex < 2;
}

export interface ProjectsData {
  projects: Project[];
}

const DEFAULT_PROJECTS_DATA: ProjectsData = {
  projects: [
    {
      id: "proj-1",
      title: "AI-Powered Flood Prediction System",
      desc: "Developed a predictive model for river discharge and climate trends, achieving low error metrics (MAE: 2.64) for local bridge safety.",
      tags: ["LSTM Neural Networks", "Python", "Time-Series Analysis", "APIs"],
      href: "https://github.com/SonyCookies/FLOODPREDICTION",
      repo: "https://github.com/SonyCookies/FLOODPREDICTION",
      isRecent: true,
    },
    {
      id: "proj-2",
      title: "MEGG - AI Defect Detection & Sorting",
      desc: "Engineered a portable system for real-time egg defect classification and automated sorting using Computer Vision and microcontrollers.",
      tags: ["Computer Vision", "Raspberry Pi", "Arduino Mega", "Next.js/FastAPI"],
      href: "https://megg-kiosk.vercel.app/",
      repo: "#",
      isRecent: true,
    },
    {
      id: "proj-3",
      title: "EZVENDO - RFID-Based Wi-Fi Vending System",
      desc: "Next-generation public Wi-Fi vending system replacing coin-operated models with an RFID digital credit system. Features ESP32-based authentication, Orange Pi Zero 3 network gateway, Next.js captive portal, Python Flask API, and Google Firestore integration for secure, cashless transactions.",
      tags: ["ESP32", "RFID", "Orange Pi Zero 3", "Next.js", "Python Flask", "Google Firestore", "Iptables", "IoT"],
      href: "#",
      repo: "#",
      isRecent: false,
    },
  ],
};

const PROJECTS_DOC_PATH = "portfolio/projects";

/**
 * Fetch Projects data from Firestore
 */
export async function getProjectsData(): Promise<ProjectsData> {
  if (!db) {
    console.warn("[projects-data] Firestore not initialized, returning default data");
    return DEFAULT_PROJECTS_DATA;
  }

  try {
    console.log("[projects-data] Fetching from Firestore path:", PROJECTS_DOC_PATH);
    const docRef = doc(db, PROJECTS_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[projects-data] Document exists, raw data:", {
        hasProjects: !!data.projects,
        projectsCount: data.projects?.length || 0,
      });
      // Ensure all fields are defined
      // Note: isRecent is computed from index, but we keep it in the data for backward compatibility
      const normalizedData: ProjectsData = {
        projects: (data.projects || []).map((project: Partial<Project> & Record<string, unknown>, index: number) => ({
          id: project.id || `proj-${Date.now()}`,
          title: project.title || "",
          desc: project.desc || "",
          tags: project.tags || [],
          href: project.href || "#",
          repo: project.repo || "#",
          // isRecent is now computed from index, but we keep it for backward compatibility
          isRecent: index < 2,
        })) as Project[],
      };
      console.log("[projects-data] Normalized data:", normalizedData);
      return normalizedData;
    } else {
      console.warn("[projects-data] Document does not exist, creating with default data");
      // Document doesn't exist, create it with default data
      await setDoc(docRef, DEFAULT_PROJECTS_DATA);
      return DEFAULT_PROJECTS_DATA;
    }
  } catch (error) {
    console.error("[projects-data] Error fetching Projects data:", error);
    console.error("[projects-data] Error details:", error instanceof Error ? error.message : String(error));
    return DEFAULT_PROJECTS_DATA;
  }
}

/**
 * Save Projects data to Firestore
 */
export async function saveProjectsData(data: ProjectsData): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    // Ensure all fields are defined and properly structured
    // isRecent is computed from index (first 2 are recent), but we save it for backward compatibility
    const dataToSave: ProjectsData = {
      projects: (data.projects || []).map((project, index) => ({
        id: project.id || `proj-${Date.now()}`,
        title: project.title || "",
        desc: project.desc || "",
        tags: project.tags || [],
        href: project.href || "#",
        repo: project.repo || "#",
        isRecent: index < 2, // First 2 projects are automatically recent
      })),
    };
    
    console.log("[projects-data] Saving Projects data to Firestore:", dataToSave);
    
    const docRef = doc(db, PROJECTS_DOC_PATH);
    await setDoc(docRef, dataToSave, { merge: true });
    
    console.log("[projects-data] Projects data saved successfully");
  } catch (error) {
    console.error("[projects-data] Error saving Projects data:", error);
    throw error;
  }
}
