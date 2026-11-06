// =====================================================================
//  YOUR CONTENT LIVES HERE. Edit this file to update the whole site.
// =====================================================================
//  category: "3d" | "game" | "environment"
//  cover:    main image (also used for the hover preview)
//  video:    .mp4 path or a YouTube / Vimeo link (optional)
//  gallery:  extra images or .mp4 files shown in the case study
//  facts:    short label/value pairs shown in the case study

export const SITE = {
  name: "AADI SETHI",
  role: "3D Artist · Game Designer · Environment & Set Design",
  email: "hello@yourname.com", // ← put your real email here
  links: [
    ["Instagram", "https://instagram.com/yourhandle"], // ← your links
    ["ArtStation", ""],
    ["itch.io", ""],
  ],
  about:
    "I build worlds and then make them move. Neon cities for a game, a thousand blades turning into cherry blossoms, a beach where a guy in bunny slippers is having a bad day. I start in greybox, end in the final frame, and care most about the moment a space starts to feel alive.",
  tools: ["Blender", "Unity 6", "Maya", "Photoshop", "After Effects", "Python (Blender scripting)", "EEVEE / Cycles"],
};

// Scenes for the "hover to render" hero. `clay` is an optional real
// blockout / untextured render. Without one, a viewport look is generated.
export const HERO_SCENES = [
  { final: "assets/krl-street.jpg", title: "Kinetic Redline", sub: "Neon Avenue · Unity 6" },
  { final: "assets/street-final.jpg", clay: "assets/street-blockout.jpg", title: "Mountain Street", sub: "Blockout → final · Blender" },
  { final: "assets/lam-cam1.jpg", title: "Lampoon", sub: "CAM_01 Establish · Blender" },
  { final: "assets/gaming-room.jpg", title: "Gaming Room", sub: "Isometric set · Blender" },
  { final: "assets/sbz-petals.jpg", title: "Senbonzakura", sub: "Frame 0420 / 0624 · EEVEE" },
];

export const PROJECTS = [
  {
    id: "kinetic-redline",
    title: "Kinetic Redline",
    category: "game",
    year: "2026",
    tools: ["Unity 6", "Blender", "Photoshop"],
    cover: "assets/krl-street.jpg",
    summary: "A neon cyberpunk action game for Android.",
    description:
      "My own game, built in Unity 6 for Android. I designed the gameplay and built the world: a modular neon city split into districts (Neon Avenue, Tower Canyon, the Docks, the Undercity), a cyborg arm and sword with a full attack set, obstacles, and the branding and UI. The Ronin-0 key art sets the mood for the whole project.",
    facts: [["Platform", "Android (APK)"], ["Engine", "Unity 6"], ["Role", "Design · Art · Build"]],
    gallery: [
      "assets/krl-logo.png",
      "assets/krl-ronin.jpg",
      "assets/krl-aerial.jpg",
      "assets/krl-arm2.jpg",
      "assets/krl-arm1.jpg",
      "assets/krl-arm3.jpg",
      "assets/krl-undercity.jpg",
    ],
  },
  {
    id: "senbonzakura",
    title: "Senbonzakura",
    category: "3d",
    year: "2026",
    tools: ["Blender EEVEE", "After Effects"],
    cover: "assets/sbz-petals.jpg",
    video: "assets/sbz-blade.mp4",
    summary: "A thousand blades scatter into cherry blossoms.",
    description:
      "A 26-second Bankai sequence inspired by Bleach: moonlit water, a backlit katana, and blades that break apart into a storm of sakura petals. Rendered in 4K at 24 fps, then handed over for VFX with 4K beauty frames, transparent element passes, depth and cryptomatte passes, 36 tracked locators, and cameras exported as FBX and an After Effects script.",
    facts: [["Length", "624 frames · 26 s"], ["Format", "3840×2160 · 24 fps"], ["Renderer", "EEVEE"]],
    gallery: ["assets/sbz-katana.mp4", "assets/sbz-blades.jpg", "assets/sbz-0080.jpg", "assets/sbz-0165.jpg", "assets/sbz-0590.jpg", "assets/sbz-v2-0560.jpg"],
  },
  {
    id: "lampoon",
    title: "Lampoon",
    category: "3d",
    year: "2026",
    tools: ["Blender"],
    cover: "assets/lam-cam1.jpg",
    video: "assets/lam-bird-gag.mp4",
    summary: "The opening of a comedy short on a stylised beach.",
    description:
      "The beach opening for an animated comedy short. I built the stylised set, designed and rigged the lead character (bunny slippers included), made a set of facial expressions, blocked out four camera setups, and animated the bird gag.",
    facts: [["Shots", "4 camera setups"], ["Character", "Rig + 4 expressions"], ["Style", "Toon / stylised"]],
    gallery: ["assets/lam-cam2.jpg", "assets/lam-cam3.jpg", "assets/lam-cam4.jpg", "assets/lam-char.jpg", "assets/lam-side.jpg", "assets/lam-smug.jpg", "assets/lam-shocked.jpg", "assets/lam-confused.jpg", "assets/lam-gag.jpg"],
  },
  {
    id: "krl-city-kit",
    title: "Redline City Kit",
    category: "environment",
    year: "2026",
    tools: ["Blender", "Unity 6"],
    cover: "assets/krl-aerial.jpg",
    summary: "A modular neon city, built to be snapped together in-engine.",
    description:
      "The environment kit behind Kinetic Redline: 13 modular district pieces (Neon Avenue, Overpass, Tower Canyon, Billboard Plaza, Docks Yard, Undercity Market, four district gates and more). Each piece stays at roughly 4–14k triangles and shares five materials, so the whole city stays light enough for a phone.",
    facts: [["Pieces", "13 modules"], ["Budget", "≈4k–14k tris each"], ["Target", "Mobile"]],
    gallery: ["assets/krl-street1.jpg", "assets/krl-street3.jpg", "assets/krl-undercity.jpg", "assets/krl-docks.jpg", "assets/krl-gate.jpg"],
  },
  {
    id: "delivery-robot",
    title: "Delivery Robot",
    category: "3d",
    year: "2026",
    tools: ["Blender", "Python", "Maya"],
    cover: "assets/bot-hero.jpg",
    summary: "A friendly hard-surface robot with a screen for a face.",
    description:
      "A sidewalk delivery robot with an expressive LED face. I built it procedurally with Python scripts in Blender, rendered it as studio product shots with an exploded view and close-ups, then exported it and tested it in Maya.",
    facts: [["Type", "Hard-surface"], ["Pipeline", "Blender → FBX → Maya"], ["Built with", "Python scripts"]],
    gallery: ["assets/bot-exploded.jpg", "assets/bot-open.jpg", "assets/bot-front.jpg", "assets/bot-side.jpg", "assets/bot-screen.jpg", "assets/bot-wheel.jpg", "assets/bot-maya.jpg"],
  },
  {
    id: "mountain-street",
    title: "Mountain Street",
    category: "environment",
    year: "2026",
    tools: ["Blender"],
    cover: "assets/street-final.jpg",
    summary: "An anime-style street, from greybox to final.",
    description:
      "A row of shopfronts under a hand-drawn mountain backdrop, made in an anime background style. The case study shows the greybox blockout used to lock the composition before the buildings were detailed.",
    facts: [["Style", "Anime background"], ["Stages", "Blockout → final"]],
    gallery: ["assets/street-blockout.jpg"],
  },
  {
    id: "gaming-room",
    title: "Gaming Room",
    category: "environment",
    year: "2026",
    tools: ["Blender"],
    cover: "assets/gaming-room.jpg",
    summary: "A late-night setup lit by red LED strips.",
    description: "An isometric room set: a dual-monitor desk, an open-frame PC, and a gaming chair, lit almost entirely by red accent strips.",
    facts: [["Type", "Isometric set"], ["Lighting", "Practical LEDs"]],
    gallery: [],
  },
  {
    id: "village-room",
    title: "Village Storeroom",
    category: "environment",
    year: "2026",
    tools: ["Blender"],
    cover: "assets/village-room.jpg",
    summary: "A lived-in storeroom, shown as a clay render.",
    description:
      "An isometric set of a village storeroom: charpai cots, clay pots, a CRT on a wooden table, scattered books and cracked plaster. It's shown as a clay render to focus on layout and set dressing.",
    facts: [["Stage", "Clay / untextured"], ["Focus", "Set dressing"]],
    gallery: [],
  },
];
