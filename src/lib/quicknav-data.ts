import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface Achievement {
  id: string;
  title: string;
  year: string;
  subtitle: string;
  detail: string;
  certificateImage?: string;
  hasCertificate?: boolean;
}

export interface Photo {
  id: string;
  title: string;
  imageUrl: string;
  caption: string;
}

export interface QuickNavData {
  autobiography: string;
  achievements: Achievement[];
  photos: Photo[];
  contactEmail: string;
}

const DEFAULT_QUICKNAV_DATA: QuickNavData = {
  autobiography: `My story is fundamentally rooted in Pinamalayan, Oriental Mindoro. I am Sonny Sarcia, and the rhythm of my life was initially the rhythm of the soil, belonging to a family that has tilled the land as farmers for generations. This agrarian heritage instilled a foundational respect for perseverance and the long wait for harvest.

But my earliest education in life came from a different kind of labor—the dedication of my mother. As she worked to pursue her own studies, she served as a kasambahay (household helper) at the home of a close family friend we call "Tito." I spent much of my childhood there. Witnessing her tireless work ethic in that environment was not a mark of hardship, but a blueprint for relentless commitment. It taught me that achieving your dreams requires sacrifice, and that hard work is the most reliable path forward. This environment became a second home that instilled in me the value of effort and deep-seated gratitude.

My academic life began brightly at the Juan Morente Senior Memorial Pilot School. I was part of a uniquely bonded group of fast learners from Grade 1 to Grade 6. We were an inseparable academic unit, where the strength of the group was the strength of the individual. Our shared success created a comfortable reliance, forging deep bonds that persist even today.

The real challenge, the turning point of my life, arrived with high school. The familiar block section dissolved, and I was suddenly separated from my academic safety net. It was a moment of profound internal discomfort. For the first time, I could not lean on familiar shoulders or copy an answer; I had to sink or swim entirely on my own merit.

This initial fear quickly gave way to a powerful realization. The separation became an intense eye-opener that revealed my own capability. I affirmed that the fast learner was me, not just the group. This newfound self-reliance fueled a transformation: I became the top-performing student consistently from Grade 7 through Grade 10. The choice to pursue the STEM (Science, Technology, Engineering, and Mathematics) strand in Senior High was a strategic alignment of my innate curiosity with the fields of math and science, laying the groundwork for a technical future.

My intellectual fascination was vast, spanning the abstract logic of a Mathematician, the structured analysis of a Statistician, and the practical construction of Electrical, Mechanical, and Agricultural Engineering. Yet, despite this broad appeal, circumstances and a pragmatic assessment of opportunity led me to choose Information Technology (IT) at Mindoro State University.

I saw IT not as a compromise, but as the ultimate versatile tool. It is the language that underlies modern statistics, the framework that controls engineering systems, and the platform that enables scalable solutions.

My initial entry into the university mirrored my high school transition—I was an outsider, one of only two students from the Second District in my section, forced to thrive alone. But the solitary focus that defined my academic rigor also attracted like minds. I began to form powerful connections with academic-centric classmates, finding friends who could meet me at my level of intensity, share intellectual burdens, and offer emotional support when the weight of expectation grew heavy. My consistent status as a Dean's Lister, now culminating in the potential distinction of Magna Cum Laude, is not just an academic record; it is the ultimate vindication of the self-reliance I forged in high school.

The curriculum demanded the endless creation of systems after systems, lines of code, and complex projects. Though initially tiring, this relentless output ignited the true passion within me. I realized that my interest wasn't in coding for its own sake, but in the power of technology to create immediate, scalable solutions to tangible problems. This burning desire to innovate is now the engine driving my professional life.

My focus remains absolute. I approach my career with the same seriousness I apply to my studies, driven by the goal to establish a firm, successful foundation in the IT world.

Now, on the verge of graduation, my attention is shifting from the classroom to the marketplace. My final project is not a thesis, but a nascent venture. I have carefully scouted and approached talented peers—individuals with exceptional potential—to join me in building a startup.

This entrepreneurial endeavor is the direct result of my entire journey. Every line of code, every disciplined choice, and every hour of study is fueled by a single, unwavering mission: to return something meaningful to my parents whose lives of toil created the platform for my success, and to honor the faith of everyone who has believed in the farm boy from Pinamalayan. My success will be their legacy, realized through the power of technology.`,
  achievements: [
    {
      id: "HackforGov",
      title: "HackforGov",
      year: "2024",
      subtitle: "MIMAROPA HackforGov 2024 Capture-The-Flag Competition",
      detail: `Rank 5 Regional Winner – Capture the Flag
September 5, 2024 • Aziza Paradise Hotel, Puerto Princesa City, Palawan

Competed in the MIMAROPA regional hackathon focused on cybersecurity challenges and Capture-The-Flag competitions with the theme "Today's Generation, Tomorrow's Champion: Shaping the Future of Cybersecurity through Shared Responsibility."`,
      certificateImage: "/cert1.jpg",
      hasCertificate: true,
    },
    {
      id: "ISITE",
      title: "ISITE",
      year: "2024",
      subtitle: "IT Competition & Exhibition",
      detail: `Top 13 National Finalist – C Programming Contest
2024

Competed in the national IT showcase event, achieving Top 13 in the C Programming Contest, demonstrating advanced programming skills and problem-solving abilities in competitive programming.`,
      hasCertificate: false,
    },
  ],
  photos: [],
  contactEmail: "sonnypsarcia@gmail.com",
};

const QUICKNAV_DOC_PATH = "portfolio/quicknav";

/**
 * Fetch QuickNav data from Firestore
 */
export async function getQuickNavData(): Promise<QuickNavData> {
  if (!db) {
    console.warn("[quicknav-data] Firestore not initialized, returning default data");
    console.warn("[quicknav-data] Check if Firebase env vars are set:", {
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      isClient: typeof window !== 'undefined',
    });
    return DEFAULT_QUICKNAV_DATA;
  }

  try {
    console.log("[quicknav-data] Fetching from Firestore path:", QUICKNAV_DOC_PATH);
    const docRef = doc(db, QUICKNAV_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("[quicknav-data] Document exists, raw data:", {
        hasAutobiography: !!data.autobiography,
        autobiographyLength: data.autobiography?.length || 0,
        photosCount: data.photos?.length || 0,
        achievementsCount: data.achievements?.length || 0,
      });
      // Ensure all arrays are defined (for backward compatibility)
      const normalizedData: QuickNavData = {
        autobiography: data.autobiography || DEFAULT_QUICKNAV_DATA.autobiography,
        achievements: data.achievements || [],
        photos: (data.photos || []).map((photo: Partial<Photo> & Record<string, unknown>) => ({
          ...photo,
          id: photo.id || "",
          title: photo.title || "", // Ensure title field exists for backward compatibility
          imageUrl: photo.imageUrl || "",
          caption: photo.caption || "",
        }) as Photo),
        contactEmail: data.contactEmail || DEFAULT_QUICKNAV_DATA.contactEmail,
      };
      console.log("[quicknav-data] Normalized data:", {
        autobiography: normalizedData.autobiography?.substring(0, 100) + "...",
        photosCount: normalizedData.photos.length,
        achievementsCount: normalizedData.achievements.length,
      });
      return normalizedData;
    } else {
      console.warn("[quicknav-data] Document does not exist, creating with default data");
      // Document doesn't exist, create it with default data
      await setDoc(docRef, DEFAULT_QUICKNAV_DATA);
      return DEFAULT_QUICKNAV_DATA;
    }
  } catch (error) {
    console.error("[quicknav-data] Error fetching QuickNav data:", error);
    console.error("[quicknav-data] Error details:", error instanceof Error ? error.message : String(error));
    return DEFAULT_QUICKNAV_DATA;
  }
}

/**
 * Save QuickNav data to Firestore
 */
export async function saveQuickNavData(data: QuickNavData): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  try {
    // Ensure all arrays are defined and properly structured
    const dataToSave: QuickNavData = {
      autobiography: data.autobiography || "",
      achievements: data.achievements || [],
      photos: data.photos || [],
      contactEmail: data.contactEmail || "",
    };
    
    console.log("Saving QuickNav data to Firestore:", dataToSave); // Debug log
    
    const docRef = doc(db, QUICKNAV_DOC_PATH);
    await setDoc(docRef, dataToSave, { merge: true });
    
    console.log("QuickNav data saved successfully"); // Debug log
  } catch (error) {
    console.error("Error saving QuickNav data:", error);
    throw error;
  }
}
