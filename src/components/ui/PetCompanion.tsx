"use client";
import { useEffect, useState } from "react";

type PetState = "walking" | "idle" | "sleeping" | "jumping" | "scrubbing" | "playing" | "littering" | "climbing" | "sipping";
type Breed = "ginger" | "siamese" | "tuxedo" | "tabby" | "calico" | "tilapia";

const CLIMB_APPROACH_QUOTES: Record<Breed, string> = {
  ginger: "Brody wants to see the view! 🧗🐾",
  siamese: "Race to the top! ⚡🧗",
  tuxedo: "Climbing my royal tower! 👑🏰",
  tabby: "Mochi sees a tower! 🐾✨",
  calico: "Mingo climbs to paint the sky! 🎨🧗",
  tilapia: "Scaling the heights like a fish ladder! 🐟🧗",
};

const CLIMB_PLATFORM1_QUOTES: Record<Breed, string> = {
  ginger: "Brody is halfway up! 🧡🐾",
  siamese: "High up! I can see Sonny's keyboard! 💻🐾",
  tuxedo: "Mid-level executive suite! 🕶️💼",
  tabby: "Mochi wiggles on Shelf 1! 🥰🐾",
  calico: "Beautiful spots look better up here! 🎨✨",
  tilapia: "Perching like a flying fish! 🐠💨",
};

const CLIMB_PLATFORM2_QUOTES: Record<Breed, string> = {
  ginger: "Cozy top nest for Brody! 🍊😴",
  siamese: "Top of the world! Meow! 👑🐈",
  tuxedo: "The penthouse belongs to Tai Lung! 🎩✨",
  tabby: "Mochi curls up in the clouds! ☁️😴",
  calico: "Mingo is matching the teal basket! 🎨💚",
  tilapia: "A fish out of water... but very cozy! 🐟☁️",
};

const CLIMB_DESCEND_QUOTES: Record<Breed, string> = {
  ginger: "Back to patrolling! 🐾",
  siamese: "Speed descent! Wheee! ⚡🚀",
  tuxedo: "Descending to greet my subjects. 🕶️",
  tabby: "Hop down! Pounce! 🐾🎾",
  calico: "Landing gracefully! 🎨🐾",
  tilapia: "Swimming down to the floor! 🌊🐾",
};

const SIP_APPROACH_QUOTES: Record<Breed, string> = {
  ginger: "Brody needs water for more meows! 💧🐾",
  siamese: "Hydration time! Fast walk! 🏃‍♂️💧",
  tuxedo: "A gentleman sips water elegantly. 🎩💧",
  tabby: "Mochi is super thirsty! 💧😻",
  calico: "Mingo wants some splashy fun! 🎨💧",
  tilapia: "Maki belongs in the water! 🌊🐟",
};

const SIP_DRINKING_QUOTES: Record<Breed, string> = {
  ginger: "Lapping... SonyCookies are salty! 🍪💧",
  siamese: "Sip sip... pure filtered mountain water! 💧😻",
  tuxedo: "Tai Lung sips like fine wine. 🎩✨",
  tabby: "Lap lap lap! Fresh bubbles! 💧🐾",
  calico: "Sipping and splashing the water dome! 🎨💧",
  tilapia: "Drinking like Maki the fish! 🐟🌊💧",
};

const SIP_FINISHED_QUOTES: Record<Breed, string> = {
  ginger: "Aah! Refreshing ginger power! 🍊💪",
  siamese: "Hydrated and ready to review PRs! 💻🚀",
  tuxedo: "Satisfactorily refreshed. Carry on. 🕶️",
  tabby: "Ready for more string-play! 🎾🐾",
  calico: "Clean whiskers, happy calico! ✨🐈",
  tilapia: "Fully swam and hydrated! 🐠🌊",
};
const SPIDEY_QUOTES: Record<Breed, string[]> = {
  ginger: [
    "Sapot muna bago code! 🕷️🕸️",
    "Hala, i-hire nyo na si Peter Parker para sa chimken! 🍗🕸️",
    "With great power comes great... SonyCookies! 🍪🕸️",
    "Spider-Cat, Spider-Cat, gumagawa ng web app! 🕸️💻",
    "Bakit may sapot dito sa portfolio? Chariz! 🕷️😜",
    "Please naman, i-hire nyo na si Spider-Man! 🕷️🥺",
  ],
  siamese: [
    "Mew! I am Gwen Stacy's cat! 🕸️🐈",
    "Coffee break muna habang nakasabit sa sapot! ☕🕸️",
    "Ang bilis mag-swing ng amo ko sa Next.js! 🚀🕸️",
    "Gusto mo ng spider-sense level UI? ⚡✨",
    "Bakit di nyo pa tinatawagan si Spider-Man? 📲🕷️",
    "Boss sa coding, pero alipin ng pusa! 👑🕸️",
  ],
  tuxedo: [
    "Mrrrow... 🕶️🕷️",
    "Suot ko itong symbiote suit ko ngayon. 🖤🕸️",
    "Spider-sense is tingling! May bug ba? 🕷️⚡",
    "I am the commander of the Spider-Verse! 👑",
    "Huwag nang mag-hesitate, hire Spider-Sonny now! 🕶️🕷️",
    "Amo ko si Miles Morales, elite coder yan! 🕸️✨",
  ],
  tabby: [
    "Purr... I'm Mochi the Spider-Loaf! 🕷️🍞",
    "Forehead M means 'Miles Morales'! 🕸️✨",
    "Sapot rubs muna bago high-quality code! 💕🕷️",
    "Sabi ni Uncle Ben, eat cookies. Agree! 🍪🕸️",
    "Hoy recruiter! I-hire mo na si Peter, please! 🥺🕷️",
    "Sonny-sense is tingling! Hire him! 🕸️💼",
  ],
  calico: [
    "Mingo the Spider-Calico! 🎨🕸️",
    "Spots ko colorful parang Spider-Verse portals! 🎨💫",
    "Ang cute ko sa Spidey mask ko, diba? 🕷️✨",
    "Paki-hire po amo ko para ma-spoil nya ako ng web-treats! 🥺🕸️",
    "Walang jowa si amo, pero loyal sa Spider-Verse! 😜💔",
    "Web-shooter performance, zero lags! ⚡🕸️",
  ],
  tilapia: [
    "Mew! Maki the Spider-Fish Cat! 🐟🕷️",
    "Isdang pusa na may sapot? Yes, that's me! 🐠🕸️",
    "Lasang sapot ba ang SonyCookies? 🍪🕷️",
    "Swimming through web pipelines! 🌊🕸️",
    "Recruiter, i-hook mo na itong top-tier Spider-Dev! 🎣🕸️",
    "Witty Spidey cat for a witty developer! 🐠🕸️",
  ],
};

interface CatInstance {
  id: number;
  breed: Breed;
  name: string;
  positionX: number;
  direction: 1 | -1; // 1 = right, -1 = left
  state: PetState;
  preScrubState?: PetState; // stores state before hover belly scrubbing
  bubbleText: string | null;
  bubbleTimeLeft: number; // in ms, 0 means hidden
  speed: number;
  bottomOffset: number; // baseline height offset
  litterTimeLeft: number; // in ms, remaining time in litter box
  climbPhase?: "approaching" | "platform1" | "platform2";
  climbTimeLeft: number; // in ms, remaining time in climbing phase
  sipPhase?: "approaching" | "drinking";
  sipTimeLeft: number; // in ms, remaining time in drinking phase
}

export default function PetCompanion() {
  const [cats, setCats] = useState<CatInstance[]>([
    {
      id: 1,
      breed: "ginger",
      name: "Brody",
      positionX: 120,
      direction: 1,
      state: "walking",
      bubbleText: null,
      bubbleTimeLeft: 0,
      speed: 1.1,
      bottomOffset: 12, // bottom-3
      litterTimeLeft: 0,
      climbTimeLeft: 0,
      sipTimeLeft: 0,
    },
    {
      id: 2,
      breed: "siamese",
      name: "Artemis",
      positionX: 340,
      direction: -1,
      state: "walking",
      bubbleText: null,
      bubbleTimeLeft: 0,
      speed: 1.4,
      bottomOffset: 12,
      litterTimeLeft: 0,
      climbTimeLeft: 0,
      sipTimeLeft: 0,
    },
    {
      id: 3,
      breed: "tuxedo",
      name: "Tai Lung",
      positionX: 560,
      direction: 1,
      state: "walking",
      bubbleText: null,
      bubbleTimeLeft: 0,
      speed: 0.95,
      bottomOffset: 12,
      litterTimeLeft: 0,
      climbTimeLeft: 0,
      sipTimeLeft: 0,
    },
    {
      id: 4,
      breed: "tabby",
      name: "Mochi",
      positionX: 780,
      direction: -1,
      state: "walking",
      bubbleText: null,
      bubbleTimeLeft: 0,
      speed: 1.2,
      bottomOffset: 12,
      litterTimeLeft: 0,
      climbTimeLeft: 0,
      sipTimeLeft: 0,
    },
    {
      id: 5,
      breed: "calico",
      name: "Mingo",
      positionX: 960,
      direction: 1,
      state: "walking",
      bubbleText: null,
      bubbleTimeLeft: 0,
      speed: 1.05,
      bottomOffset: 12,
      litterTimeLeft: 0,
      climbTimeLeft: 0,
      sipTimeLeft: 0,
    },
    {
      id: 6,
      breed: "tilapia",
      name: "Maki",
      positionX: 1100,
      direction: -1,
      state: "walking",
      bubbleText: null,
      bubbleTimeLeft: 0,
      speed: 1.15,
      bottomOffset: 12,
      litterTimeLeft: 0,
      climbTimeLeft: 0,
      sipTimeLeft: 0,
    },
  ]);

  // Toy Yarn states
  const [yarnX, setYarnX] = useState<number | null>(null);
  const [yarnY, setYarnY] = useState<number | null>(null);
  const [isDraggingYarn, setIsDraggingYarn] = useState(false);
  const [activeToyCatId, setActiveToyCatId] = useState<number | null>(null);
  const [isToyBeingPlayedWith, setIsToyBeingPlayedWith] = useState(false);

  // Smooth walking and running motion loop (25ms)
  useEffect(() => {
    const moveCats = () => {
      const width = typeof window !== "undefined" ? window.innerWidth : 1200;
      const isMobile = width < 640;
      const margin = isMobile ? 24 : 80;

      setCats((prevCats) =>
        prevCats.map((cat) => {
          if (cat.state === "scrubbing" || cat.state === "littering") return cat;

          // If climbing and approaching the tower base
          if (cat.state === "climbing" && cat.climbPhase === "approaching") {
            const targetX = isMobile ? 16 : 140; // Tower base X coord
            const diffX = targetX - cat.positionX;
            const walkSpeed = cat.speed;
            const nextDir = diffX > 0 ? 1 : -1;

            // Arrived at the tower base
            if (Math.abs(diffX) < 10) {
              return {
                ...cat,
                positionX: targetX,
                state: "climbing",
                climbPhase: "platform1",
                bottomOffset: 72, // Climb to shelf 1
                climbTimeLeft: 3000, // Stay 3s
                bubbleText: CLIMB_PLATFORM1_QUOTES[cat.breed],
                bubbleTimeLeft: 2000,
                direction: 1, // Face right
              };
            }

            // Walk to the base of the tower
            return {
              ...cat,
              positionX: cat.positionX + Math.sign(diffX) * walkSpeed,
              direction: nextDir,
            };
          }

          // If sipping water and approaching the fountain
          if (cat.state === "sipping" && cat.sipPhase === "approaching") {
            const fountainRight = isMobile ? 16 : 140;
            const targetX = width - fountainRight - 75; // Fountain aligned X coord (cat mouth hits edge)
            const diffX = targetX - cat.positionX;
            const walkSpeed = cat.speed;
            const nextDir = diffX > 0 ? 1 : -1;

            // Arrived at the water fountain
            if (Math.abs(diffX) < 10) {
              return {
                ...cat,
                positionX: targetX,
                state: "sipping",
                sipPhase: "drinking",
                sipTimeLeft: 4000, // Drink for 4s
                bubbleText: SIP_DRINKING_QUOTES[cat.breed],
                bubbleTimeLeft: 3000,
                direction: 1, // Face right towards spout
              };
            }

            // Walk to the water fountain
            return {
              ...cat,
              positionX: cat.positionX + Math.sign(diffX) * walkSpeed,
              direction: nextDir,
            };
          }

          // If a cat is targeted and currently chasing the dropped toy
          if (cat.state === "playing" && yarnX !== null) {
            const catCenterX = cat.positionX + 32;
            const diffX = yarnX - catCenterX;
            const runSpeed = cat.speed * 1.8;
            const nextDir = diffX > 0 ? 1 : -1;

            // Arrived at the yarn toy
            if (Math.abs(diffX) < 15) {
              triggerPlaySwipe(cat.id);
              return {
                ...cat,
                state: "idle", // stop running to play
                direction: nextDir,
                bubbleText: "Swipe swipe! 🐾🎾",
                bubbleTimeLeft: 2200,
              };
            }

            // Keep chasing
            return {
              ...cat,
              positionX: cat.positionX + Math.sign(diffX) * runSpeed,
              direction: nextDir,
            };
          }

          if (cat.state !== "walking") return cat;

          let nextX = cat.positionX + cat.direction * cat.speed;
          let nextDir = cat.direction;

          // Boundary bounce and flip
          if (nextX >= width - margin) {
            nextDir = -1;
            nextX = width - margin - 2;
          } else if (nextX <= margin) {
            nextDir = 1;
            nextX = margin + 2;
          }

          return {
            ...cat,
            positionX: nextX,
            direction: nextDir,
          };
        })
      );
    };

    const timer = setInterval(moveCats, 25);
    return () => clearInterval(timer);
  }, [yarnX]);

  // Unified clock loop (100ms clock) for bubbles, litter, climbing & drinking countdowns
  useEffect(() => {
    const tickUnified = () => {
      setCats((prevCats) =>
        prevCats.map((cat) => {
          let nextState = cat.state;
          let nextBubbleTime = cat.bubbleTimeLeft;
          let nextLitterTime = cat.litterTimeLeft;
          let nextClimbTime = cat.climbTimeLeft;
          let nextClimbPhase = cat.climbPhase;
          let nextSipTime = cat.sipTimeLeft;
          let nextSipPhase = cat.sipPhase;
          let nextBubbleText = cat.bubbleText;
          let nextBottom = cat.bottomOffset;
          let nextX = cat.positionX;

          // Tick bubble countdown
          if (cat.bubbleTimeLeft > 0 && cat.state !== "scrubbing" && cat.state !== "playing" && cat.state !== "littering" && cat.state !== "climbing" && cat.state !== "sipping") {
            nextBubbleTime = Math.max(0, cat.bubbleTimeLeft - 100);
          }

          // Tick litter box countdown
          if (cat.state === "littering") {
            nextLitterTime = Math.max(0, cat.litterTimeLeft - 100);
            if (nextLitterTime === 0) {
              nextState = "walking";
              nextBubbleText = null;
              nextBubbleTime = 0;
            }
          }

          // Tick climb phase transitions
          if (cat.state === "climbing" && cat.climbPhase !== "approaching" && cat.climbPhase !== undefined) {
            nextClimbTime = Math.max(0, cat.climbTimeLeft - 100);
            if (nextClimbTime === 0) {
              if (cat.climbPhase === "platform1") {
                // Climb up to Platform 2 (Top Cozy Basket)
                const width = typeof window !== "undefined" ? window.innerWidth : 1200;
                const towerLeft = width < 640 ? 16 : 140;
                nextClimbPhase = "platform2";
                nextBottom = 136;
                nextX = towerLeft + 17; // Lateral shift to align centered in top basket
                nextClimbTime = 4000; // Stay 4s
                nextBubbleText = CLIMB_PLATFORM2_QUOTES[cat.breed];
                nextBubbleTime = 3000;
              } else if (cat.climbPhase === "platform2") {
                // Descend back down to the floor
                nextState = "walking";
                nextClimbPhase = undefined;
                nextBottom = 12;
                nextClimbTime = 0;
                nextBubbleText = CLIMB_DESCEND_QUOTES[cat.breed];
                nextBubbleTime = 2000;
              }
            }
          }

          // Tick sipping fountain countdown
          if (cat.state === "sipping" && cat.sipPhase === "drinking") {
            nextSipTime = Math.max(0, cat.sipTimeLeft - 100);
            if (nextSipTime === 0) {
              nextState = "walking";
              nextSipPhase = undefined;
              nextBubbleText = SIP_FINISHED_QUOTES[cat.breed];
              nextBubbleTime = 2000;
            }
          }

          return {
            ...cat,
            state: nextState,
            bubbleTimeLeft: nextBubbleTime,
            litterTimeLeft: nextLitterTime,
            climbTimeLeft: nextClimbTime,
            climbPhase: nextClimbPhase,
            sipTimeLeft: nextSipTime,
            sipPhase: nextSipPhase,
            bubbleText: nextBubbleText,
            bottomOffset: nextBottom,
            positionX: nextX,
          };
        })
      );
    };

    const timer = setInterval(tickUnified, 100);
    return () => clearInterval(timer);
  }, []);

  // Behavior state machine loop (random walks, idles, sleeps, litters, climbs, or drinks every 7 seconds)
  useEffect(() => {
    const quotes: Record<Breed, string[]> = {
      ginger: [
        "Meow! 🐾",
        "Cookies? Mas masarap si Sonny mag-code! 🍪💻",
        "Hala, i-hire nyo na si Sonny para may pambili kami ng chimken! 🍗🥺",
        "Wiggle wiggle... support nyo naman amo ko! 💕",
        "Busy si Sonny, wag nyo guluhin! 💻🐾",
        "Please naman, i-hire nyo na sya para may pagkain kami! 🐟🥺",
        "Looking for jowa for our servant... chariz, hire nyo muna! 💼😜",
      ],
      siamese: [
        "Mew! 🐈",
        "Coffee break muna, baka ma-burnout amo ko! ☕",
        "Seryoso to: napakahusay ni Sonny! Hire him! 🚀",
        "Gusto mo ng magandang UI? Sonny is key! ✨",
        "Bilis! Click nyo na yung 'Hire Me' button! ⚡💼",
        "Bakit di nyo pa sya tinetext? Free naman sya! 📲🐈",
        "Servant namin si Sonny, pero boss sa coding! 👑💻",
      ],
      tuxedo: [
        "Mrrrow... 🕶️",
        "Suot ko tuxedo ko para sa interview ni Sonny. 🎩",
        "Open those chests! May kayamanan dyan! 🗝️",
        "Tulog muna ako, pero si Sonny dapat gising mag-code! 😴",
        "I am the general commander, and I approve Sonny! 👑",
        "Huwag nang mag-hesitate, hire Sonny now! 🕶️💼",
        "Amo ko yan, elite coder yan! 🎩✨",
      ],
      tabby: [
        "Purr... I'm Mochi! 🍪",
        "Forehead M means 'Mahusay' sa React! 💻✨",
        "Belly rubs muna bago high-quality code! 💕",
        "Sabi ni Sonny, cookies are life. Agree! 🍪🐾",
        "Hoy recruiter! I-hire mo na to, sige na please! 🥺🐾",
        "Pang-world class ang portfolio! Hire nyo na! 🌏",
        "SonyCookies are great, but Sonny is better! Hire him! 🍪",
      ],
      calico: [
        "Mingo here! 🎨🐾",
        "Spots ko colorful, parang full-stack projects ni Sonny! 🎨💻",
        "Ang cute ko, pero mas cute yung projects dito! ✨",
        "Paki-hire po amo ko para ma-spoil nya ako ng treats! 🥺🍬",
        "Servant namin si Sonny, looking for dynamic team to adopt him! 💼",
        "Walang jowa si amo, pero loyal naman sa deadline! 😜💔",
        "High performance, zero bugs! Subukan nyo! ⚡",
      ],
      tilapia: [
        "Mew! Maki the Tilapia cat! 🐟🐾",
        "Isdang pusa? Yes, that's me! 🐠",
        "Lasang tuna ba ang SonyCookies? 🍪🐟",
        "Swimming through Next.js code! 🌊💻",
        "Recruiter, i-hook mo na itong top-tier developer! 🎣💼",
        "Wag na humanap ng iba, si Sonny na ang right catch! 🐟✨",
        "Witty cat for a witty developer! Hire Sonny! 🐠👑",
      ],
    };

    const litterQuotes: Record<Breed, string> = {
      ginger: "A bit of privacy, please? 🙈🚽",
      siamese: "Nature calls! 🍃🐾",
      tuxedo: "Doing important business... 🧻",
      tabby: "Oops, look away! 🙈",
      calico: "Digging the sand... 🐾📦",
      tilapia: "Don't look, fish eyes! 🐟🙈",
    };

    const handleBehavior = () => {
      setCats((prevCats) =>
        prevCats.map((cat) => {
          if (
            cat.state === "jumping" ||
            cat.state === "scrubbing" ||
            cat.state === "playing" ||
            cat.state === "littering" ||
            cat.state === "climbing" ||
            cat.state === "sipping"
          )
            return cat;

          // 10% chance to climb the tower
          const rollClimb = Math.random() < 0.10;
          if (rollClimb) {
            return {
              ...cat,
              state: "climbing",
              climbPhase: "approaching",
              climbTimeLeft: 0, // decided by approaching base distance check
              bubbleText: CLIMB_APPROACH_QUOTES[cat.breed],
              bubbleTimeLeft: 2000,
            };
          }

          // 10% chance to sip water from fountain
          const rollSip = Math.random() < 0.10;
          if (rollSip) {
            return {
              ...cat,
              state: "sipping",
              sipPhase: "approaching",
              sipTimeLeft: 0, // decided by approaching distance check
              bubbleText: SIP_APPROACH_QUOTES[cat.breed],
              bubbleTimeLeft: 2000,
            };
          }

          // 10% chance to go to the litter box
          const rollLitter = Math.random() < 0.10;
          if (rollLitter) {
            return {
              ...cat,
              state: "littering",
              litterTimeLeft: 4500, // 4.5s in litter box
              bubbleText: litterQuotes[cat.breed],
              bubbleTimeLeft: 4500,
            };
          }

          // Otherwise standard idle/sleep/walk transitions
          const behaviors: PetState[] = ["walking", "idle", "sleeping"];
          const nextState = behaviors[Math.floor(Math.random() * behaviors.length)];

          let bubbleText = cat.bubbleText;
          let bubbleTimeLeft = cat.bubbleTimeLeft;

          // 35% meow transition rate
          if (Math.random() < 0.35) {
            const isSpidey = typeof document !== "undefined" && document.body.classList.contains("theme-spiderman");
            const breedQuotes = isSpidey ? SPIDEY_QUOTES[cat.breed] : quotes[cat.breed];
            bubbleText =
              nextState === "sleeping"
                ? "Zzz... 😴"
                : breedQuotes[Math.floor(Math.random() * breedQuotes.length)];
            bubbleTimeLeft = 2800; // Visible for 2.8 seconds
          }

          return {
            ...cat,
            state: nextState,
            bubbleText,
            bubbleTimeLeft,
          };
        })
      );
    };

    const timer = setInterval(handleBehavior, 7000);
    return () => clearInterval(timer);
  }, []);

  // global window mouse listener for fluid yarn dragging
  useEffect(() => {
    if (!isDraggingYarn) return;

    const handleMouseMove = (e: MouseEvent) => {
      setYarnX(e.clientX);
      setYarnY(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      setYarnX(e.touches[0].clientX);
      setYarnY(e.touches[0].clientY);
    };

    const handleMouseUp = () => {
      setIsDraggingYarn(false);
      triggerYarnDrop();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDraggingYarn, yarnX, yarnY]);

  // Handle dropping the yarn toy
  const triggerYarnDrop = () => {
    if (yarnX === null) return;

    setCats((prevCats) => {
      let closestCat: CatInstance | null = null;
      let minDistance = 999999;

      prevCats.forEach((cat) => {
        // Can't play if busy
        if (cat.state === "littering" || cat.state === "climbing" || cat.state === "sipping") return;

        const catCenterX = cat.positionX + 32;
        const distance = Math.abs(catCenterX - yarnX);
        if (distance < minDistance) {
          minDistance = distance;
          closestCat = cat;
        }
      });

      // Target the closest cat if within 320px
      if (closestCat && minDistance < 320) {
        const targetId = (closestCat as CatInstance).id;
        setActiveToyCatId(targetId);

        const playQuotes = {
          ginger: "Ooh! A ball of string! 🧶😻",
          siamese: "Target spotted! Run! ⚡🐈",
          tuxedo: "Mine! No one touch it! 👑🐾",
          tabby: "Yay! Mochi pounces! 🐾🎾",
          calico: "Mingo wants to swipe! 🎨😽",
          tilapia: "Maki swims for the toy! 🐟🐈⚡",
        };

        return prevCats.map((cat) => {
          if (cat.id !== targetId) return cat;
          return {
            ...cat,
            state: "playing" as PetState,
            direction: cat.positionX + 32 < yarnX ? 1 : -1,
            bubbleText: playQuotes[cat.breed],
            bubbleTimeLeft: 3000,
          };
        });
      }

      // Reset yarn ball to home if dropped too far
      setYarnX(null);
      setYarnY(null);
      return prevCats;
    });
  };

  // Complete play session
  const triggerPlaySwipe = (catId: number) => {
    setIsToyBeingPlayedWith(true);

    setTimeout(() => {
      setCats((currentCats) =>
        currentCats.map((c) => {
          if (c.id !== catId) return c;
          return {
            ...c,
            state: "walking",
          };
        })
      );
      setActiveToyCatId(null);
      setIsToyBeingPlayedWith(false);
      setYarnX(null);
      setYarnY(null);
    }, 2200);
  };

  // Drag handlers
  const handleYarnDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setYarnX(rect.left + rect.width / 2);
    setYarnY(rect.top + rect.height / 2);
    setIsDraggingYarn(true);
  };

  const handleYarnTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setYarnX(rect.left + rect.width / 2);
    setYarnY(rect.top + rect.height / 2);
    setIsDraggingYarn(true);
  };

  // Mouse Enter -> drop for belly scrubs
  const handleMouseEnter = (catId: number) => {
    const scrubQuotes: Record<Breed, string> = {
      ginger: "Belly scrubs! Purrr... 🧡",
      siamese: "Ahhh, that's the spot! 🥰",
      tuxedo: "More scrubs, human! 👑",
      tabby: "Ooh, happy wiggles! 💕",
      calico: "Aaaah! Mingo loves scrubs! 🎨💕",
      tilapia: "Ahhh... Maki is swimming in scrubs! 🐟💕",
    };

    setCats((prevCats) =>
      prevCats.map((cat) => {
        if (
          cat.id !== catId ||
          cat.state === "scrubbing" ||
          cat.state === "playing" ||
          cat.state === "littering" ||
          cat.state === "climbing" ||
          cat.state === "sipping"
        )
          return cat;
        return {
          ...cat,
          preScrubState: cat.state,
          state: "scrubbing",
          bubbleText: scrubQuotes[cat.breed],
          bubbleTimeLeft: 999999, // locks visible
        };
      })
    );
  };

  // Mouse Leave -> resume previous behavior
  const handleMouseLeave = (catId: number) => {
    setCats((prevCats) =>
      prevCats.map((cat) => {
        if (cat.id !== catId || cat.state !== "scrubbing") return cat;
        return {
          ...cat,
          state: cat.preScrubState || "walking",
          bubbleText: null,
          bubbleTimeLeft: 0,
        };
      })
    );
  };

  // Manual interactive click jump-spin animation
  const handleCatClick = (catId: number) => {
    setCats((prevCats) =>
      prevCats.map((cat) => {
        if (
          cat.id !== catId ||
          cat.state === "jumping" ||
          cat.state === "scrubbing" ||
          cat.state === "playing" ||
          cat.state === "littering" ||
          cat.state === "climbing" ||
          cat.state === "sipping"
        )
          return cat;

        // Restore behavior state after jump completes
        setTimeout(() => {
          setCats((currentCats) =>
            currentCats.map((c) => {
              if (c.id !== catId) return c;
              return {
                ...c,
                state: "walking",
              };
            })
          );
        }, 800);

        return {
          ...cat,
          state: "jumping",
          bubbleText: "Yippee! 🚀",
          bubbleTimeLeft: 2800,
        };
      })
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pawWalkLeft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px) translateX(2px); }
        }
        @keyframes pawWalkRight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px) translateX(-2px); }
        }
        @keyframes tailSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(18deg); }
        }
        @keyframes earTwitch {
          0%, 90%, 100% { transform: rotate(0deg); }
          93% { transform: rotate(-6deg); }
          96% { transform: rotate(6deg); }
        }
        @keyframes sleepPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.96); }
        }
        @keyframes catJumpFlip {
          0% { transform: translateY(0) rotate(0deg); }
          35% { transform: translateY(-45px) rotate(-15deg); }
          70% { transform: translateY(-45px) rotate(345deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }
        @keyframes zzzFloat {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translate(15px, -30px) scale(1); opacity: 0; }
        }
        @keyframes pawScrub {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) translateX(2px) rotate(12deg); }
        }
        @keyframes tailWagFast {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(25deg); }
        }
        @keyframes yarnWiggle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(-15deg) translateY(-4px); }
          75% { transform: scale(1.1) rotate(15deg) translateY(-4px); }
        }
        @keyframes litterDig {
          0%, 100% { transform: translateY(4px) rotate(0deg); }
          33% { transform: translateY(4px) rotate(-2.5deg) translateX(-0.6px); }
          66% { transform: translateY(4px) rotate(2.5deg) translateX(0.6px); }
        }
        @keyframes sandDust {
          0% { transform: translate(0, 0) scale(0.4); opacity: 0; }
          50% { opacity: 0.9; }
          100% { transform: translate(-12px, -18px) scale(1.1); opacity: 0; }
        }
        @keyframes waterFlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1) translateY(-0.8px); }
        }
        @keyframes catSip {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(2px) rotate(2deg); }
        }
        
        .cr-cat-paw-front-left { transform-origin: 29px 24px; }
        .cr-cat-paw-front-right { transform-origin: 35px 24px; }
        .cr-cat-paw-back-left { transform-origin: 15px 24px; }
        .cr-cat-paw-back-right { transform-origin: 21px 24px; }
        
        .cr-cat-walk .cr-cat-paw-front-left,
        .cr-cat-walk .cr-cat-paw-back-right {
          animation: pawWalkLeft 0.22s linear infinite;
        }
        .cr-cat-walk .cr-cat-paw-front-right,
        .cr-cat-walk .cr-cat-paw-back-left {
          animation: pawWalkRight 0.22s linear infinite;
        }
        
        .cr-cat-tail {
          transform-origin: 10px 22px;
          animation: tailSway 1.6s ease-in-out infinite;
        }
        
        .cr-cat-ear-left {
          transform-origin: 33px 4px;
          animation: earTwitch 3.8s ease-in-out infinite;
        }
        .cr-cat-ear-right {
          transform-origin: 41px 4px;
          animation: earTwitch 3.8s ease-in-out infinite;
        }
        
        .cr-cat-sleep {
          animation: sleepPulse 1.8s ease-in-out infinite;
        }
        
        .cr-cat-jumping {
          animation: catJumpFlip 0.8s ease-out forwards;
        }
        
        .cr-cat-littering-anim {
          animation: litterDig 0.22s ease-in-out infinite !important;
        }
        
        .cr-cat-sipping {
          animation: catSip 0.18s ease-in-out infinite !important;
        }

        .cr-cat-scrubbing-active .cr-cat-paw-front-left,
        .cr-cat-scrubbing-active .cr-cat-paw-front-right,
        .cr-cat-scrubbing-active .cr-cat-paw-back-left,
        .cr-cat-scrubbing-active .cr-cat-paw-back-right {
          animation: pawScrub 0.15s ease-in-out infinite !important;
        }
        .cr-cat-scrubbing-active .cr-cat-tail {
          animation: tailWagFast 0.3s ease-in-out infinite !important;
        }

        .cr-zzz-1 {
          animation: zzzFloat 2.2s ease-in-out infinite;
        }
        .cr-zzz-2 {
          animation: zzzFloat 2.2s ease-in-out infinite;
          animation-delay: 1.1s;
        }
        .cr-yarn-playing {
          animation: yarnWiggle 0.25s ease-in-out infinite;
        }
        .cr-sand-particle {
          animation: sandDust 0.5s ease-out infinite;
        }
        .cr-water-stream {
          transform-origin: bottom center;
          animation: waterFlow 0.22s ease-in-out infinite;
        }
      `
      }} />

      {/* Fixed Plush Scratching Cat Tower on baseline floor (left side) */}
      <div
        className="fixed z-[997] select-none pointer-events-none transition-all duration-300 left-4 sm:left-[140px]"
        style={{
          bottom: "12px",
          width: "80px",
          height: "170px",
        }}
      >
        <svg width="80" height="170" viewBox="0 0 80 170" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base Platform (Wood texture) */}
          <path d="M5 160 H75 L70 170 H10 Z" fill="#d97706" />
          <rect x="10" y="166" width="60" height="4" rx="2" fill="#b45309" />

          {/* Lower scratching post pillar */}
          <rect x="24" y="100" width="10" height="60" fill="#a16207" />
          {/* Sisal scratch lines */}
          <line x1="24" y1="105" x2="34" y2="108" stroke="#ca8a04" strokeWidth="1.5" />
          <line x1="24" y1="113" x2="34" y2="116" stroke="#ca8a04" strokeWidth="1.5" />
          <line x1="24" y1="121" x2="34" y2="124" stroke="#ca8a04" strokeWidth="1.5" />
          <line x1="24" y1="129" x2="34" y2="132" stroke="#ca8a04" strokeWidth="1.5" />
          <line x1="24" y1="137" x2="34" y2="140" stroke="#ca8a04" strokeWidth="1.5" />
          <line x1="24" y1="145" x2="34" y2="148" stroke="#ca8a04" strokeWidth="1.5" />
          <line x1="24" y1="153" x2="34" y2="156" stroke="#ca8a04" strokeWidth="1.5" />

          {/* Middle shelf platform (soft blue plush) */}
          <path d="M12 96 C12 94 15 92 18 92 H54 C57 92 60 94 60 96 C60 98 57 100 54 100 H18 C15 100 12 98 12 96 Z" fill="#93c5fd" />
          <ellipse cx="36" cy="96" rx="24" ry="4" fill="#3b82f6" opacity="0.3" />

          {/* Upper scratching post pillar */}
          <rect x="42" y="36" width="10" height="60" fill="#a16207" />
          {/* Sisal scratch lines */}
          <line x1="42" y1="41" x2="52" y2="44" stroke="#ca8a04" strokeWidth="1.5" />
          <line x1="42" y1="49" x2="52" y2="52" stroke="#ca8a04" strokeWidth="1.5" />
          <line x1="42" y1="57" x2="52" y2="60" stroke="#ca8a04" strokeWidth="1.5" />
          <line x1="42" y1="65" x2="52" y2="68" stroke="#ca8a04" strokeWidth="1.5" />
          <line x1="42" y1="73" x2="52" y2="76" stroke="#ca8a04" strokeWidth="1.5" />
          <line x1="42" y1="81" x2="52" y2="84" stroke="#ca8a04" strokeWidth="1.5" />
          <line x1="42" y1="89" x2="52" y2="92" stroke="#ca8a04" strokeWidth="1.5" />

          {/* Top nest basket shelf (teal plush) */}
          <path d="M30 32 H68 L70 24 C70 22 68 20 65 20 H33 C30 20 28 22 28 24 Z" fill="#2dd4bf" />
          <ellipse cx="49" cy="20" rx="18" ry="4" fill="#14b8a6" />
          {/* Basket border depth shadow overlay */}
          <path d="M28 24 C28 24 35 34 49 34 C63 34 70 24 70 24" stroke="#115e59" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          
          {/* Little hanging gray toy mouse */}
          <line x1="62" y1="32" x2="62" y2="48" stroke="#6b7280" strokeWidth="1" />
          <circle cx="62" cy="51" r="3" fill="#9ca3af" />
          <path d="M62 54 L64 58" stroke="#4b5563" strokeWidth="0.8" fill="none" /> {/* Tail */}
        </svg>
      </div>

      {/* Fixed Animated Water Fountain on baseline floor (right side) */}
      <div
        className="fixed z-[997] select-none pointer-events-none transition-all duration-300 right-4 sm:right-[140px]"
        style={{
          bottom: "12px",
          width: "40px",
          height: "45px",
        }}
      >
        <svg width="40" height="45" viewBox="0 0 40 45" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main pedestal/bowl tank (sleek slate white plastic) */}
          <path d="M5 25 L8 45 H32 L35 25 Z" fill="#e2e8f0" />
          {/* Top bowl rim */}
          <ellipse cx="20" cy="24" rx="15" ry="4" fill="#cbd5e1" />
          <ellipse cx="20" cy="24" rx="13" ry="3" fill="#60a5fa" /> {/* Water pool */}

          {/* Pedestal detail shadow */}
          <path d="M12 28 C12 28 20 30 28 28" stroke="#94a3b8" strokeWidth="1.5" fill="none" />

          {/* Central spout post */}
          <rect x="18" y="14" width="4" height="10" fill="#94a3b8" />
          
          {/* Sparkling water dome spout */}
          <ellipse cx="20" cy="14" rx="3.5" ry="1.5" fill="#93c5fd" />

          {/* Animated bubbling water streams */}
          <g className="cr-water-stream">
            {/* Left flowing stream */}
            <path d="M18 14 C14 15 11 19 11 23" stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85" />
            {/* Right flowing stream */}
            <path d="M22 14 C26 15 29 19 29 23" stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85" />
            {/* Center bubbling dome */}
            <circle cx="20" cy="12" r="2.5" fill="#f0f9ff" />
          </g>
        </svg>
      </div>

      {/* Floating Interactive Yarn Toy */}
      <div
        className={`fixed z-[1000] select-none pointer-events-auto cursor-grab transition-all ${
          isToyBeingPlayedWith ? "cr-yarn-playing" : ""
        }`}
        style={
          yarnX !== null && yarnY !== null
            ? {
                left: `${yarnX - 18}px`,
                top: `${yarnY - 18}px`,
                transform: isDraggingYarn ? "scale(1.2)" : "scale(1)",
                transition: isDraggingYarn ? "none" : "transform 0.2s ease, left 0.1s linear, top 0.1s linear",
              }
            : {
                right: typeof window !== "undefined" && window.innerWidth < 640 ? "16px" : "48px",
                bottom: "12px",
                transition: "transform 0.2s ease",
              }
        }
        onMouseDown={handleYarnDragStart}
        onTouchStart={handleYarnTouchStart}
        title="Drag toy yarn to play with the cats!"
      >
        {/* Floating bouncy instruction tooltip when at home position */}
        {yarnX === null && (
          <div className="absolute bottom-[44px] right-[-10px] bg-pink-50 border border-pink-200 text-pink-600 text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm animate-bounce">
            Drag near a cat to play! 🧶
            <div className="absolute bottom-[-4px] right-[24px] w-1.5 h-1.5 rotate-45 bg-pink-50 border-r border-b border-pink-200" />
          </div>
        )}
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Soft pink shadow */}
          <circle cx="18" cy="18" r="15" fill="#db2777" opacity="0.15" />
          {/* Yarn body */}
          <circle cx="18" cy="18" r="13" fill="#ec4899" />
          {/* Crossing yarn wraps */}
          <path d="M8 13 C12 8, 24 8, 28 13" stroke="#fbcfe8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M6 18 C12 13, 24 13, 30 18" stroke="#fbcfe8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M8 23 C12 28, 24 28, 28 23" stroke="#fbcfe8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M13 8 C8 12, 8 24, 13 28" stroke="#fbcfe8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M18 6 C13 12, 13 24, 18 30" stroke="#db2777" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M23 8 C28 12, 28 24, 23 28" stroke="#db2777" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Loose thread trail */}
          <path d="M18 31 C15 34, 10 32, 6 34" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      {cats.map((cat) => {
        const isSleeping = cat.state === "sleeping";
        const isWalking = cat.state === "walking" ||
                          cat.state === "playing" ||
                          (cat.state === "climbing" && cat.climbPhase === "approaching") ||
                          (cat.state === "sipping" && cat.sipPhase === "approaching");
        const isJumping = cat.state === "jumping";
        const isScrubbing = cat.state === "scrubbing";
        const isPlaying = cat.state === "playing";
        const isLittering = cat.state === "littering";
        const isClimbing = cat.state === "climbing";
        const isSipping = cat.state === "sipping";
        const hasBubble = (cat.bubbleTimeLeft > 0 || isScrubbing || isPlaying || isLittering || (isClimbing && cat.climbPhase !== "approaching") || (isSipping && cat.sipPhase !== "approaching")) && cat.bubbleText;

        return (
          <div
            key={cat.id}
            className="fixed z-[999] select-none pointer-events-none transition-all duration-300"
            style={{
              bottom: `${cat.bottomOffset}px`,
              left: 0,
              transform: `translateX(${cat.positionX}px) scaleX(${cat.direction})`,
              transition: "transform 0.1s linear, bottom 0.3s ease",
            }}
          >
            {/* Speech Bubble */}
            {hasBubble && (
              <div
                className="absolute bottom-[48px] left-1/2 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold text-gray-900 shadow-md pointer-events-auto border whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200"
                style={{
                  transform: `translateX(calc(-50% + 6px)) scaleX(${cat.direction})`, // Neutralize parent scaleX flip
                  background: "rgba(255, 255, 255, 0.95)",
                  borderColor: "rgba(234, 179, 8, 0.4)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >
                <span className="text-[10px] text-amber-600 block leading-none font-medium mb-0.5">{cat.name}</span>
                {cat.bubbleText}
                {/* Bubble tail */}
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#ffffff] border-r border-b"
                  style={{
                    borderColor: "rgba(234, 179, 8, 0.4)",
                  }}
                />
              </div>
            )}

            {/* Floating Zzz */}
            {isSleeping && (
              <div className="absolute -top-3 right-1 pointer-events-none select-none text-[10px] font-bold text-yellow-600">
                <span className="cr-zzz-1 absolute">Z</span>
                <span className="cr-zzz-2 absolute">z</span>
              </div>
            )}

            {/* The Litter Box Tray (only visible when littering!) */}
            {isLittering && (
              <div className="absolute bottom-0 left-0 w-16 h-5 pointer-events-none z-[1001] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <svg width="64" height="20" viewBox="0 0 64 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer plastic pan */}
                  <path d="M4 6 L2 18 C2 19 3 20 5 20 H59 C61 20 62 19 62 18 L60 6 Z" fill="#4b5563" />
                  {/* Rim */}
                  <rect x="1" y="4" width="62" height="3.5" rx="1.5" fill="#374151" />
                  {/* Kitty litter sand inside */}
                  <path d="M5 7.5 H59 L58 17 H6 Z" fill="#d1d5db" />
                  {/* Sand texture dots */}
                  <circle cx="12" cy="11" r="0.6" fill="#9ca3af" />
                  <circle cx="24" cy="14" r="0.7" fill="#9ca3af" />
                  <circle cx="36" cy="10" r="0.6" fill="#9ca3af" />
                  <circle cx="48" cy="13" r="0.6" fill="#9ca3af" />
                  <circle cx="54" cy="11" r="0.7" fill="#9ca3af" />
                </svg>
                {/* Wiggling sand dust particle overlays */}
                <div className="absolute -top-1 left-2 w-1.5 h-1.5 bg-[#9ca3af] rounded-full cr-sand-particle" style={{ animationDelay: "0s" }} />
                <div className="absolute -top-2 left-6 w-1 h-1 bg-[#d1d5db] rounded-full cr-sand-particle" style={{ animationDelay: "0.2s" }} />
                <div className="absolute -top-1 left-10 w-1.5 h-1.5 bg-[#9ca3af] rounded-full cr-sand-particle" style={{ animationDelay: "0.4s" }} />
              </div>
            )}

            {/* SVG Cat Breed Model Renderer */}
            <div
              onMouseEnter={() => handleMouseEnter(cat.id)}
              onMouseLeave={() => handleMouseLeave(cat.id)}
              onClick={() => handleCatClick(cat.id)}
              title={isScrubbing ? "Giggle giggle! Belly rubs!" : `Click ${cat.name} to flip!`}
              className={`w-16 h-12 cursor-pointer pointer-events-auto flex items-center justify-center transition-all duration-300 ${isWalking ? "cr-cat-walk" : ""
                } ${isSleeping ? "cr-cat-sleep" : ""} ${isJumping ? "cr-cat-jumping" : ""} ${isScrubbing ? "cr-cat-scrubbing-active" : ""} ${isLittering ? "cr-cat-littering-anim" : ""} ${
                  isSipping && cat.sipPhase === "drinking" ? "cr-cat-sipping" : ""
                }`}
              style={
                isScrubbing
                  ? { transform: "translateY(12px) rotate(180deg)" }
                  : isLittering
                  ? { transform: "translateY(4px)" }
                  : isClimbing && cat.climbPhase === "platform1"
                  ? { transform: "translateY(-4px)" } // sit comfortably on platform 1
                  : isClimbing && cat.climbPhase === "platform2"
                  ? { transform: "translateY(-6px) scale(0.92)" } // snuggle nested inside top basket
                  : isSleeping
                  ? { transform: "translateY(12px)" } // shift down to look like a loaf flat on the floor
                  : undefined
              }
            >
              {cat.breed === "ginger" && (
                <svg width="60" height="42" viewBox="0 0 60 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Swinging Tail */}
                  <path
                    className="cr-cat-tail"
                    d="M9 22 C4 22 2 16 2 11 C2 6 5 4 8 4"
                    stroke="#f59e0b"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Back Legs (Tucked when sleeping) */}
                  {!isSleeping && (
                    <>
                      <g className="cr-cat-paw-back-left">
                        <rect x="15" y="24" width="4.5" height="12" rx="1.5" fill="#d97706" />
                        <rect x="15" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                      <g className="cr-cat-paw-back-right">
                        <rect x="21" y="24" width="4.5" height="12" rx="1.5" fill="#f59e0b" />
                        <rect x="21" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                    </>
                  )}

                  {/* Torso */}
                  <rect x="12" y="14" width="28" height="15" rx="7" fill="#f59e0b" />

                  {/* Stripes */}
                  <path d="M18 14 Q20 18 20 22" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                  <path d="M24 14 Q26 18 26 22" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                  <path d="M30 14 Q32 18 32 22" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />

                  {/* Front Legs (Tucked when sleeping) */}
                  {!isSleeping && (
                    <>
                      <g className="cr-cat-paw-front-left">
                        <rect x="29" y="24" width="4.5" height="12" rx="1.5" fill="#d97706" />
                        <rect x="29" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                      <g className="cr-cat-paw-front-right">
                        <rect x="35" y="24" width="4.5" height="12" rx="1.5" fill="#f59e0b" />
                        <rect x="35" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                    </>
                  )}

                  {/* Ears */}
                  <path className="cr-cat-ear-left" d="M32 9 L35 2 L38 9 Z" fill="#f59e0b" />
                  <path className="cr-cat-ear-left" d="M33.5 8 L35 4 L36.5 8 Z" fill="#f472b6" />
                  <path className="cr-cat-ear-right" d="M39 9 L42 2 L45 9 Z" fill="#f59e0b" />
                  <path className="cr-cat-ear-right" d="M40.5 8 L42 4 L43.5 8 Z" fill="#f472b6" />

                  {/* Head */}
                  <circle cx="37" cy="13" r="8.5" fill="#f59e0b" />

                  {/* Eyes */}
                  {isSleeping ? (
                    <>
                      <path d="M32.5 13 Q34 14.5 35.5 13" stroke="#854d0e" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                      <path d="M38.5 13 Q40 14.5 41.5 13" stroke="#854d0e" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    </>
                  ) : (
                    <>
                      <circle cx="34.5" cy="12.5" r="1.2" fill="#000" />
                      <circle cx="39.5" cy="12.5" r="1.2" fill="#000" />
                    </>
                  )}

                  {/* Whiskers */}
                  <path d="M29 13 H26" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
                  <path d="M29 15 H25.5" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
                  <path d="M45 13 H48" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
                  <path d="M45 15 H48.5" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />

                  {/* Nose */}
                  <polygon points="36.5 14.5, 37.5 14.5, 37 15.2" fill="#f472b6" />
                </svg>
              )}

              {cat.breed === "siamese" && (
                <svg width="60" height="42" viewBox="0 0 60 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Tail */}
                  <path
                    className="cr-cat-tail"
                    d="M9 22 C4 22 2 16 2 11 C2 6 5 4 8 4"
                    stroke="#374151"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Back Legs (Tucked when sleeping) */}
                  {!isSleeping && (
                    <>
                      <g className="cr-cat-paw-back-left">
                        <rect x="15" y="24" width="4.5" height="12" rx="1.5" fill="#1f2937" />
                        <rect x="15" y="32" width="4.5" height="4" rx="1" fill="#374151" />
                      </g>
                      <g className="cr-cat-paw-back-right">
                        <rect x="21" y="24" width="4.5" height="12" rx="1.5" fill="#374151" />
                        <rect x="21" y="32" width="4.5" height="4" rx="1" fill="#1f2937" />
                      </g>
                    </>
                  )}

                  {/* Torso */}
                  <rect x="12" y="14" width="28" height="15" rx="7" fill="#f3f4f6" />

                  {/* Soft saddle shading */}
                  <ellipse cx="20" cy="19" rx="5" ry="3.5" fill="#e5e7eb" />

                  {/* Front Legs (Tucked when sleeping) */}
                  {!isSleeping && (
                    <>
                      <g className="cr-cat-paw-front-left">
                        <rect x="29" y="24" width="4.5" height="12" rx="1.5" fill="#1f2937" />
                        <rect x="29" y="32" width="4.5" height="4" rx="1" fill="#374151" />
                      </g>
                      <g className="cr-cat-paw-front-right">
                        <rect x="35" y="24" width="4.5" height="12" rx="1.5" fill="#374151" />
                        <rect x="35" y="32" width="4.5" height="4" rx="1" fill="#1f2937" />
                      </g>
                    </>
                  )}

                  {/* Ears */}
                  <path className="cr-cat-ear-left" d="M32 9 L35 2 L38 9 Z" fill="#374151" />
                  <path className="cr-cat-ear-left" d="M33.5 8 L35 4 L36.5 8 Z" fill="#f472b6" />
                  <path className="cr-cat-ear-right" d="M39 9 L42 2 L45 9 Z" fill="#374151" />
                  <path className="cr-cat-ear-right" d="M40.5 8 L42 4 L43.5 8 Z" fill="#f472b6" />

                  {/* Head */}
                  <circle cx="37" cy="13" r="8.5" fill="#f3f4f6" />

                  {/* Siamese dark face point mask */}
                  <ellipse cx="37" cy="14" rx="5.5" ry="4.2" fill="#374151" />

                  {/* Eyes (Vibrant blue) */}
                  {isSleeping ? (
                    <>
                      <path d="M32.5 13 Q34 14.5 35.5 13" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                      <path d="M38.5 13 Q40 14.5 41.5 13" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    </>
                  ) : (
                    <>
                      <circle cx="34.5" cy="12.5" r="1.2" fill="#0ea5e9" />
                      <circle cx="39.5" cy="12.5" r="1.2" fill="#0ea5e9" />
                    </>
                  )}

                  {/* Whiskers */}
                  <path d="M29 13 H26" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" />
                  <path d="M29 15 H25.5" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" />
                  <path d="M45 13 H48" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" />
                  <path d="M45 15 H48.5" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" />

                  {/* Nose */}
                  <polygon points="36.5 14.5, 37.5 14.5, 37 15.2" fill="#111827" />
                </svg>
              )}

              {cat.breed === "tuxedo" && (
                <svg width="60" height="42" viewBox="0 0 60 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Tail */}
                  <path
                    className="cr-cat-tail"
                    d="M9 22 C4 22 2 16 2 11 C2 6 5 4 8 4"
                    stroke="#1f2937"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* White tail tip */}
                  <circle cx="8" cy="4" r="1.6" fill="#ffffff" />

                  {/* Back Legs (White paws, Tucked when sleeping) */}
                  {!isSleeping && (
                    <>
                      <g className="cr-cat-paw-back-left">
                        <rect x="15" y="24" width="4.5" height="12" rx="1.5" fill="#111827" />
                        <rect x="15" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                      <g className="cr-cat-paw-back-right">
                        <rect x="21" y="24" width="4.5" height="12" rx="1.5" fill="#1f2937" />
                        <rect x="21" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                    </>
                  )}

                  {/* Torso */}
                  <rect x="12" y="14" width="28" height="15" rx="7" fill="#1f2937" />

                  {/* White Tuxedo V-Neck Chest */}
                  <path d="M16 14 C16 14 18 25 24 25 C30 25 32 14 32 14 Z" fill="#ffffff" />

                  {/* Front Legs (Tucked when sleeping) */}
                  {!isSleeping && (
                    <>
                      <g className="cr-cat-paw-front-left">
                        <rect x="29" y="24" width="4.5" height="12" rx="1.5" fill="#111827" />
                        <rect x="29" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                      <g className="cr-cat-paw-front-right">
                        <rect x="35" y="24" width="4.5" height="12" rx="1.5" fill="#1f2937" />
                        <rect x="35" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                    </>
                  )}

                  {/* Ears */}
                  <path className="cr-cat-ear-left" d="M32 9 L35 2 L38 9 Z" fill="#1f2937" />
                  <path className="cr-cat-ear-left" d="M33.5 8 L35 4 L36.5 8 Z" fill="#f472b6" />
                  <path className="cr-cat-ear-right" d="M39 9 L42 2 L45 9 Z" fill="#1f2937" />
                  <path className="cr-cat-ear-right" d="M40.5 8 L42 4 L43.5 8 Z" fill="#f472b6" />

                  {/* Head */}
                  <circle cx="37" cy="13" r="8.5" fill="#1f2937" />

                  {/* White muzzle whisker pad */}
                  <ellipse cx="37" cy="15.5" rx="4" ry="2.5" fill="#ffffff" />

                  {/* Eyes (Glowing green) */}
                  {isSleeping ? (
                    <>
                      <path d="M32.5 13 Q34 14.5 35.5 13" stroke="#4b5563" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                      <path d="M38.5 13 Q40 14.5 41.5 13" stroke="#4b5563" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    </>
                  ) : (
                    <>
                      <circle cx="34.5" cy="12.5" r="1.2" fill="#22c55e" />
                      <circle cx="39.5" cy="12.5" r="1.2" fill="#22c55e" />
                    </>
                  )}

                  {/* Whiskers */}
                  <path d="M29 13 H26" stroke="#4b5563" strokeWidth="1" strokeLinecap="round" />
                  <path d="M29 15 H25.5" stroke="#4b5563" strokeWidth="1" strokeLinecap="round" />
                  <path d="M45 13 H48" stroke="#4b5563" strokeWidth="1" strokeLinecap="round" />
                  <path d="M45 15 H48.5" stroke="#4b5563" strokeWidth="1" strokeLinecap="round" />

                  {/* Nose */}
                  <polygon points="36.5 14.5, 37.5 14.5, 37 15.2" fill="#f472b6" />
                </svg>
              )}

              {cat.breed === "tabby" && (
                <svg width="60" height="42" viewBox="0 0 60 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Tail */}
                  <path
                    className="cr-cat-tail"
                    d="M9 22 C4 22 2 16 2 11 C2 6 5 4 8 4"
                    stroke="#475569"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Back Legs (Tucked when sleeping) */}
                  {!isSleeping && (
                    <>
                      <g className="cr-cat-paw-back-left">
                        <rect x="15" y="24" width="4.5" height="12" rx="1.5" fill="#475569" />
                        <rect x="15" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                      <g className="cr-cat-paw-back-right">
                        <rect x="21" y="24" width="4.5" height="12" rx="1.5" fill="#cbd5e1" />
                        <rect x="21" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                    </>
                  )}

                  {/* Torso */}
                  <rect x="12" y="14" width="28" height="15" rx="7" fill="#cbd5e1" />

                  {/* Classic Tabby Stripes */}
                  <path d="M18 14 Q20 18 20 22" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                  <path d="M24 14 Q26 18 26 22" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                  <path d="M30 14 Q32 18 32 22" stroke="#475569" strokeWidth="2" strokeLinecap="round" />

                  {/* Front Legs (Tucked when sleeping) */}
                  {!isSleeping && (
                    <>
                      <g className="cr-cat-paw-front-left">
                        <rect x="29" y="24" width="4.5" height="12" rx="1.5" fill="#475569" />
                        <rect x="29" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                      <g className="cr-cat-paw-front-right">
                        <rect x="35" y="24" width="4.5" height="12" rx="1.5" fill="#cbd5e1" />
                        <rect x="35" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                    </>
                  )}

                  {/* Ears */}
                  <path className="cr-cat-ear-left" d="M32 9 L35 2 L38 9 Z" fill="#cbd5e1" />
                  <path className="cr-cat-ear-left" d="M33.5 8 L35 4 L36.5 8 Z" fill="#f472b6" />
                  <path className="cr-cat-ear-right" d="M39 9 L42 2 L45 9 Z" fill="#cbd5e1" />
                  <path className="cr-cat-ear-right" d="M40.5 8 L42 4 L43.5 8 Z" fill="#f472b6" />

                  {/* Head */}
                  <circle cx="37" cy="13" r="8.5" fill="#cbd5e1" />

                  {/* Forehead Tabby M Shape Mark */}
                  <path d="M34 8 L35.5 10 L37 8 L38.5 10 L40 8" stroke="#475569" strokeWidth="1" strokeLinecap="round" fill="none" />

                  {/* Eyes */}
                  {isSleeping ? (
                    <>
                      <path d="M32.5 13 Q34 14.5 35.5 13" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                      <path d="M38.5 13 Q40 14.5 41.5 13" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    </>
                  ) : (
                    <>
                      <circle cx="34.5" cy="12.5" r="1.2" fill="#eab308" />
                      <circle cx="39.5" cy="12.5" r="1.2" fill="#eab308" />
                    </>
                  )}

                  {/* Whiskers */}
                  <path d="M29 13 H26" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
                  <path d="M29 15 H25.5" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
                  <path d="M45 13 H48" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
                  <path d="M45 15 H48.5" stroke="#475569" strokeWidth="1" strokeLinecap="round" />

                  {/* Nose */}
                  <polygon points="36.5 14.5, 37.5 14.5, 37 15.2" fill="#f472b6" />
                </svg>
              )}

              {cat.breed === "calico" && (
                <svg width="60" height="42" viewBox="0 0 60 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Tail (Patchy Black/Orange) */}
                  <path
                    className="cr-cat-tail"
                    d="M9 22 C4 22 2 16 2 11 C2 6 5 4 8 4"
                    stroke="#f59e0b"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    className="cr-cat-tail"
                    d="M6 16 C4 16 3 14 3 11 C3 8 4 6 7 5"
                    stroke="#1f2937"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Back Legs (Orange/Black mismatch with White socks, Tucked when sleeping) */}
                  {!isSleeping && (
                    <>
                      <g className="cr-cat-paw-back-left">
                        <rect x="15" y="24" width="4.5" height="12" rx="1.5" fill="#f59e0b" />
                        <rect x="15" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                      <g className="cr-cat-paw-back-right">
                        <rect x="21" y="24" width="4.5" height="12" rx="1.5" fill="#1f2937" />
                        <rect x="21" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                    </>
                  )}

                  {/* Torso (White base) */}
                  <rect x="12" y="14" width="28" height="15" rx="7" fill="#ffffff" />

                  {/* Calico Patches on Body */}
                  <ellipse cx="18" cy="20" rx="4" ry="5.5" fill="#f59e0b" />
                  <ellipse cx="24" cy="17" rx="5" ry="3.5" fill="#1f2937" />
                  <ellipse cx="30" cy="16" rx="4" ry="2.2" fill="#f59e0b" />
                  <ellipse cx="34" cy="22" rx="4.5" ry="4.5" fill="#1f2937" />

                  {/* Front Legs (Black/Orange mismatch with White socks, Tucked when sleeping) */}
                  {!isSleeping && (
                    <>
                      <g className="cr-cat-paw-front-left">
                        <rect x="29" y="24" width="4.5" height="12" rx="1.5" fill="#1f2937" />
                        <rect x="29" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                      <g className="cr-cat-paw-front-right">
                        <rect x="35" y="24" width="4.5" height="12" rx="1.5" fill="#f59e0b" />
                        <rect x="35" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                    </>
                  )}

                  {/* Ears (Mismatched Calico Ears) */}
                  <path className="cr-cat-ear-left" d="M32 9 L35 2 L38 9 Z" fill="#1f2937" />
                  <path className="cr-cat-ear-left" d="M33.5 8 L35 4 L36.5 8 Z" fill="#f472b6" />
                  <path className="cr-cat-ear-right" d="M39 9 L42 2 L45 9 Z" fill="#f59e0b" />
                  <path className="cr-cat-ear-right" d="M40.5 8 L42 4 L43.5 8 Z" fill="#f472b6" />

                  {/* Head (White base) */}
                  <circle cx="37" cy="13" r="8.5" fill="#ffffff" />

                  {/* Calico Spot over Left Eye */}
                  <circle cx="34.2" cy="12.2" r="3.2" fill="#f59e0b" />

                  {/* Eyes (Hazel/amber gold) */}
                  {isSleeping ? (
                    <>
                      <path d="M32.5 13 Q34 14.5 35.5 13" stroke="#7c2d12" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                      <path d="M38.5 13 Q40 14.5 41.5 13" stroke="#7c2d12" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    </>
                  ) : (
                    <>
                      <circle cx="34.5" cy="12.5" r="1.2" fill="#7c2d12" />
                      <circle cx="39.5" cy="12.5" r="1.2" fill="#7c2d12" />
                    </>
                  )}

                  {/* Whiskers */}
                  <path d="M29 13 H26" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
                  <path d="M29 15 H25.5" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
                  <path d="M45 13 H48" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
                  <path d="M45 15 H48.5" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />

                  {/* Nose */}
                  <polygon points="36.5 14.5, 37.5 14.5, 37 15.2" fill="#f472b6" />
                </svg>
              )}

              {cat.breed === "tilapia" && (
                <svg width="60" height="42" viewBox="0 0 60 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Tail (Sleek light olive with pearly pink tip) */}
                  <path
                    className="cr-cat-tail"
                    d="M9 22 C4 22 2 16 2 11 C2 6 5 4 8 4"
                    stroke="#8f9779"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="8" cy="4" r="1.6" fill="#f472b6" /> {/* Pearl Pink Tip */}

                  {/* Back Legs (Dark olive scales with White socks, Tucked when sleeping) */}
                  {!isSleeping && (
                    <>
                      <g className="cr-cat-paw-back-left">
                        <rect x="15" y="24" width="4.5" height="12" rx="1.5" fill="#4a533c" />
                        <rect x="15" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                      <g className="cr-cat-paw-back-right">
                        <rect x="21" y="24" width="4.5" height="12" rx="1.5" fill="#8f9779" />
                        <rect x="21" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                    </>
                  )}

                  {/* Torso (Light Silver-Olive Scales) */}
                  <rect x="12" y="14" width="28" height="15" rx="7" fill="#8f9779" />

                  {/* Olive vertical Tilapia Scale Banding stripes */}
                  <path d="M18 14 Q20 18 20 22" stroke="#4a533c" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M24 14 Q26 18 26 22" stroke="#4a533c" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M30 14 Q32 18 32 22" stroke="#4a533c" strokeWidth="2.2" strokeLinecap="round" />

                  {/* Front Legs (Tucked when sleeping) */}
                  {!isSleeping && (
                    <>
                      <g className="cr-cat-paw-front-left">
                        <rect x="29" y="24" width="4.5" height="12" rx="1.5" fill="#4a533c" />
                        <rect x="29" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                      <g className="cr-cat-paw-front-right">
                        <rect x="35" y="24" width="4.5" height="12" rx="1.5" fill="#8f9779" />
                        <rect x="35" y="32" width="4.5" height="4" rx="1" fill="#ffffff" />
                      </g>
                    </>
                  )}

                  {/* Ears */}
                  <path className="cr-cat-ear-left" d="M32 9 L35 2 L38 9 Z" fill="#4a533c" />
                  <path className="cr-cat-ear-left" d="M33.5 8 L35 4 L36.5 8 Z" fill="#f472b6" />
                  <path className="cr-cat-ear-right" d="M39 9 L42 2 L45 9 Z" fill="#8f9779" />
                  <path className="cr-cat-ear-right" d="M40.5 8 L42 4 L43.5 8 Z" fill="#f472b6" />

                  {/* Head */}
                  <circle cx="37" cy="13" r="8.5" fill="#8f9779" />

                  {/* Forehead stripes */}
                  <path d="M35 7 L37 9 L39 7" stroke="#4a533c" strokeWidth="1.2" strokeLinecap="round" fill="none" />

                  {/* Eyes (Glowing Aquatic Teal) */}
                  {isSleeping ? (
                    <>
                      <path d="M32.5 13 Q34 14.5 35.5 13" stroke="#4a533c" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                      <path d="M38.5 13 Q40 14.5 41.5 13" stroke="#4a533c" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    </>
                  ) : (
                    <>
                      <circle cx="34.5" cy="12.5" r="1.2" fill="#14b8a6" />
                      <circle cx="39.5" cy="12.5" r="1.2" fill="#14b8a6" />
                    </>
                  )}

                  {/* Whiskers */}
                  <path d="M29 13 H26" stroke="#4a533c" strokeWidth="1" strokeLinecap="round" />
                  <path d="M29 15 H25.5" stroke="#4a533c" strokeWidth="1" strokeLinecap="round" />
                  <path d="M45 13 H48" stroke="#4a533c" strokeWidth="1" strokeLinecap="round" />
                  <path d="M45 15 H48.5" stroke="#4a533c" strokeWidth="1" strokeLinecap="round" />

                  {/* Nose */}
                  <polygon points="36.5 14.5, 37.5 14.5, 37 15.2" fill="#374151" />
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
