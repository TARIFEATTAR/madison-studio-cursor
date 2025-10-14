// Mock content data for Maison Lumière luxury fragrance brand
export interface LibraryContent {
  id: string;
  title: string;
  contentType: string;
  collection: string;
  product?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  dipWeek?: number;
  rating?: number;
  wordCount: number;
  archived: boolean;
  status: string;
}

// Content types are now dynamically generated from deliverable formats
// See src/config/libraryContentTypes.ts for the source of truth

export const collections = [
  { id: "signature", name: "Signature Collection", icon: "✨" },
  { id: "seasonal", name: "Seasonal Editions", icon: "📅" },
  { id: "discovery", name: "Discovery Sets", icon: "📦" }
];

export const products = [
  "Noir de Nuit",
  "Lumière Dorée", 
  "Jardin Secret",
  "Terre Sauvage",
  "Aube Nouvelle"
];

export const mockLibraryContent: LibraryContent[] = [
  {
    id: "1",
    title: "Noir de Nuit: The Art of Evening Fragrance",
    contentType: "blog_post",
    collection: "signature",
    product: "Noir de Nuit",
    content: "There's a particular magic that descends as daylight fades—when the world softens, and evening unveils its mysteries.\n\nNoir de Nuit was born from this enchantment. Our master perfumer spent two years perfecting a composition that captures the essence of twilight: black currant and pink pepper create an intriguing opening, while Turkish rose and jasmine sambac unfold like secrets whispered in candlelight.\n\nThe heart is where the fragrance truly reveals its character. Iris adds a powdery elegance, while the florals deepen and darken as evening progresses. These rare ingredients were sourced from heritage suppliers—the rose from family farms in Turkey, the jasmine from traditional growers in India.\n\nAs Noir de Nuit settles into its base, precious oud and sandalwood emerge, wrapped in golden amber. This is a fragrance of depth and mystery, designed for those who understand that true luxury whispers rather than shouts.\n\nNoir de Nuit is part of our Signature Fragrance collection, where each scent tells a story of craftsmanship and rare beauty. Available in 50ml and 100ml editions, presented in our signature black lacquer bottle.",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
    dipWeek: 1,
    rating: 5,
    wordCount: 189,
    archived: false,
    status: "Active"
  },
  {
    id: "2",
    title: "Lumière Dorée: Capturing Golden Hour",
    contentType: "blog_post",
    collection: "signature",
    product: "Lumière Dorée",
    content: "There's a particular quality of light that occurs just before sunset—when everything glows with warmth, when the world seems softer, more forgiving.\n\nLumière Dorée captures this fleeting moment. Neroli and bergamot create a radiant opening, reminiscent of Mediterranean gardens at dusk. Orange blossom unfolds at the heart, creamy and intoxicating, while vanilla and tonka bean wrap everything in golden warmth.\n\nThis fragrance is about celebration and joy. It's the scent of summer evenings, of laughter shared with loved ones, of moments that glow in memory. Lumière Dorée is lighter than our evening fragrances, but no less sophisticated—it simply chooses radiance over mystery.\n\nWear it when you want to feel like sunlight personified.",
    createdAt: new Date("2024-01-11"),
    updatedAt: new Date("2024-01-11"),
    dipWeek: 2,
    rating: 5,
    wordCount: 187,
    archived: false,
    status: "Active"
  },
  {
    id: "3",
    title: "Jardin Secret: The Hidden Garden",
    contentType: "blog_post",
    collection: "signature",
    product: "Jardin Secret",
    content: "Some gardens are meant to be discovered, not displayed. Jardin Secret is our tribute to those intimate outdoor spaces—walled gardens, hidden courtyards, private sanctuaries where nature unfolds in quiet splendor.\n\nGreen fig and violet leaf create a verdant opening, fresh as morning dew on leaves. Jasmine and rose add floral elegance, while cedar and oakmoss ground everything in woody earthiness. This is a green fragrance, but sophisticated—think manicured gardens rather than wild meadows.\n\nJardin Secret speaks to those who appreciate subtlety and refinement. It's not about making an entrance; it's about creating an atmosphere of understated luxury.",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    dipWeek: 2,
    rating: 5,
    wordCount: 156,
    archived: false,
    status: "Active"
  },
  {
    id: "4",
    title: "Aube Nouvelle: New Dawn",
    contentType: "email",
    collection: "signature",
    product: "Aube Nouvelle",
    content: "Subject: Begin Again - Introducing Aube Nouvelle\n\nDear [First Name],\n\nEvery morning is a chance to begin again.\n\nAube Nouvelle (New Dawn) is our ode to fresh starts and new possibilities. Citrus notes sparkle like morning light, while iris adds powdery sophistication. Musk creates a soft, intimate finish—close to the skin, yet unmistakably present.\n\nThis fragrance is about optimism. It's the scent of clean sheets, of coffee brewing, of sunlight streaming through windows. It's minimal but not simplistic, fresh but not fleeting.\n\nWear Aube Nouvelle when you want to feel like yourself, only more so.\n\nDiscover your new beginning.\n\nWith warmth,\nMaison Lumière",
    createdAt: new Date("2024-01-09"),
    updatedAt: new Date("2024-01-09"),
    dipWeek: 1,
    rating: 4,
    wordCount: 142,
    archived: false,
    status: "Active"
  },
  {
    id: "5",
    title: "Terre Sauvage: Wild Earth",
    contentType: "blog_post",
    collection: "signature",
    product: "Terre Sauvage",
    content: "Not all who wander are lost. Some are simply seeking. Terre Sauvage was inspired by those wild places that call to us—ancient forests, windswept coastlines, mountain trails where civilization feels distant.\n\nPine and cypress create a crisp, aromatic opening. Vetiver adds earthy depth, while leather brings a rugged sophistication. This is a fragrance for adventurers and dreamers, for those who feel most alive away from city lights.\n\nTerre Sauvage doesn't try to tame wildness—it celebrates it. Wear it when you want to remember that you're made of the same stuff as mountains and oceans.",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
    dipWeek: 2,
    rating: 5,
    wordCount: 127,
    archived: false,
    status: "Active"
  },
  {
    id: "6",
    title: "Noir de Nuit Instagram Launch",
    contentType: "instagram",
    collection: "signature",
    product: "Noir de Nuit",
    content: "When daylight fades, mystery awakens. 🌙\n\nNoir de Nuit: our most sophisticated creation. Black currant and pink pepper open the evening, while Turkish rose and jasmine sambac whisper secrets in candlelight. Oud and sandalwood emerge at the base—a fragrance of depth and elegance.\n\nFor those who understand that true luxury whispers.\n\n#NoirDeNuit #MaisonLumière #EveningFragrance #LuxuryPerfume #NichePerfumery",
    createdAt: new Date("2024-01-07"),
    updatedAt: new Date("2024-01-07"),
    dipWeek: 1,
    rating: 5,
    wordCount: 52,
    archived: false,
    status: "Active"
  },
  {
    id: "7",
    title: "Meet Our Master Perfumer: Amélie Rousseau",
    contentType: "blog_post",
    collection: "signature",
    content: "Behind every Maison Lumière fragrance is Amélie Rousseau, our Master Perfumer and Creative Director. With over twenty years of experience in Grasse, France—the perfume capital of the world—Amélie brings both classical training and avant-garde creativity to every composition.\n\n\"I don't create fragrances to follow trends,\" Amélie explains. \"I create them to capture moments, emotions, memories. Each scent should tell a story that resonates on a personal level.\"\n\nHer approach is meticulous. For Noir de Nuit, she spent two years perfecting the balance between dark florals and precious woods. For Lumière Dorée, she sourced orange blossom from a single estate in Tunisia, ensuring consistent quality and character.\n\nAmélie's philosophy shapes everything we do at Maison Lumière: beauty through craftsmanship, luxury through authenticity.",
    createdAt: new Date("2024-01-07"),
    updatedAt: new Date("2024-01-07"),
    dipWeek: 3,
    rating: 5,
    wordCount: 185,
    archived: false,
    status: "Active"
  },
  {
    id: "8",
    title: "New Year, New Rituals",
    contentType: "email",
    collection: "signature",
    content: "Subject: Start 2024 with Intention - 20% Off Signature Collection\n\nDear [First Name],\n\nNew year, new rituals.\n\nAs we step into 2024, we're inviting you to discover (or rediscover) the transformative power of intentional fragrance. Each morning, the scent you choose becomes part of how you move through the world.\n\nFor a limited time, enjoy 20% off our entire Signature Collection. Whether you're drawn to the mystery of Noir de Nuit or the radiance of Lumière Dorée, now is the perfect moment to find your signature scent.\n\nUse code NEWYEAR24 at checkout.\n\nHere's to a year of intentional beauty.\n\nWith warmth,\nMaison Lumière",
    createdAt: new Date("2023-12-27"),
    updatedAt: new Date("2023-12-27"),
    dipWeek: 1,
    rating: 4,
    wordCount: 128,
    archived: false,
    status: "Active"
  },
  {
    id: "9",
    title: "The Art of Sustainable Sourcing",
    contentType: "blog_post",
    collection: "signature",
    content: "Luxury and sustainability are not opposites. At Maison Lumière, we believe that true luxury comes from knowing that beauty has been created responsibly.\n\nOur commitment to sustainable sourcing goes beyond checking boxes. We work directly with family farms and heritage suppliers who have tended their crops for generations. Our Turkish rose comes from farms that use traditional cultivation methods. Our sandalwood is ethically harvested from managed forests in Australia.\n\nTransparency isn't just a value for us—it's a practice. Every ingredient can be traced to its origin. Every supplier partnership is built on fair compensation and mutual respect.\n\nWhen you choose Maison Lumière, you're not just choosing a fragrance. You're choosing to support a more beautiful, more sustainable approach to luxury.",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
    dipWeek: 3,
    rating: 4,
    wordCount: 158,
    archived: false,
    status: "Active"
  },
  {
    id: "10",
    title: "Jardin Secret: Email Launch",
    contentType: "email",
    collection: "signature",
    product: "Jardin Secret",
    content: "Subject: Discover Your Hidden Garden\n\nDear [First Name],\n\nSome gardens are meant to be discovered, not displayed. Jardin Secret is our tribute to those intimate outdoor spaces—walled gardens, hidden courtyards, private sanctuaries.\n\nGreen fig and violet leaf. Jasmine and rose. Cedar and oakmoss. This is a green fragrance for those who appreciate subtlety and refinement.\n\nExperience Jardin Secret—now available in 50ml and 100ml editions.\n\nWith warmth,\nMaison Lumière\n\nP.S. Orders over $150 receive complimentary gift wrapping and a discovery set.",
    createdAt: new Date("2023-12-17"),
    updatedAt: new Date("2023-12-17"),
    dipWeek: 1,
    rating: 4,
    wordCount: 129,
    archived: false,
    status: "Active"
  },
  {
    id: "11",
    title: "Holiday Gift Guide 2024",
    contentType: "blog_post",
    collection: "seasonal",
    content: "Finding the perfect gift is an art. This holiday season, we've curated thoughtful options for the fragrance lovers in your life.\n\nFor the romantic: Noir de Nuit in our limited-edition holiday packaging. Black lacquer with gold detailing—pure elegance.\n\nFor the optimist: Lumière Dorée paired with our brass candle. Radiance in two forms.\n\nFor the explorer: Terre Sauvage with a leather travel case. Adventure-ready luxury.\n\nFor the curious: Our Discovery Set featuring 5ml samples of all five signature fragrances. The perfect introduction to Maison Lumière.\n\nAll gifts include complimentary wrapping and a handwritten note. Because how you give matters as much as what you give.",
    createdAt: new Date("2023-11-28"),
    updatedAt: new Date("2023-11-28"),
    dipWeek: 4,
    rating: 5,
    wordCount: 142,
    archived: false,
    status: "Active"
  },
  {
    id: "12",
    title: "Lumière Dorée Social Launch",
    contentType: "instagram",
    collection: "signature",
    product: "Lumière Dorée",
    content: "Golden hour, bottled. ✨\n\nLumière Dorée captures that fleeting moment when everything glows. Neroli and bergamot open with Mediterranean brightness, while orange blossom and vanilla create warmth you can wear.\n\nThis is joy in scent form. This is sunlight personified.\n\n#LumièreDorée #MaisonLumière #GoldenHour #LuxuryFragrance #SummerScent",
    createdAt: new Date("2024-01-06"),
    updatedAt: new Date("2024-01-06"),
    dipWeek: 2,
    rating: 5,
    wordCount: 48,
    archived: false,
    status: "Active"
  },
  {
    id: "13",
    title: "The Story Behind Terre Sauvage",
    contentType: "product_story",
    collection: "signature",
    product: "Terre Sauvage",
    content: "Some fragrances are born in perfume labs. Terre Sauvage was born on a hiking trail in the French Alps.\n\nOur Creative Director, Amélie Rousseau, was on a solo trek when inspiration struck. \"I was surrounded by pine trees and mountain air, and I thought: this is what freedom smells like. Not sweet freedom—raw, honest, elemental freedom.\"\n\nTerre Sauvage took eighteen months to perfect. The challenge was capturing wildness without losing sophistication. Pine and cypress provide that crisp, outdoor opening. Vetiver adds depth and earthiness. Leather brings unexpected refinement—because even adventurers appreciate craftsmanship.\n\nThis fragrance isn't for everyone. It's for those who feel most alive away from city lights, who understand that luxury can be rugged, who know that sometimes the best path is the unmarked one.\n\nTerre Sauvage: For the wild at heart.",
    createdAt: new Date("2024-01-04"),
    updatedAt: new Date("2024-01-04"),
    dipWeek: 2,
    rating: 5,
    wordCount: 178,
    archived: false,
    status: "Active"
  },
  {
    id: "14",
    title: "Understanding Fragrance Notes",
    contentType: "blog_post",
    collection: "discovery",
    content: "Fragrance is a journey, not a destination. Understanding how scents unfold helps you choose fragrances that truly resonate.\n\n**Top Notes** (0-15 minutes): Your first impression. These are the lightest, most volatile ingredients—citrus, herbs, light florals. They grab attention but don't linger.\n\n**Heart Notes** (15 minutes-4 hours): The true character. These middle notes define the fragrance—fuller florals, spices, fruits. This is where you discover whether a scent is truly yours.\n\n**Base Notes** (4+ hours): The foundation. Woods, musks, amber, vanilla. These are the heaviest molecules, the ones that remain on your skin, creating your signature.\n\nAt Maison Lumière, we compose each fragrance as a complete story. Noir de Nuit opens with pepper and currant (intrigue), unfolds into rose and jasmine (revelation), and settles into oud and amber (mystery).\n\nWhen testing fragrances, give them time. What you smell in the bottle is just the beginning.",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
    dipWeek: 3,
    rating: 4,
    wordCount: 189,
    archived: false,
    status: "Active"
  },
  {
    id: "15",
    title: "Aube Nouvelle Product Story",
    contentType: "product_story",
    collection: "signature",
    product: "Aube Nouvelle",
    content: "Minimalism is harder than it looks. Aube Nouvelle (New Dawn) took six months of refinement to achieve its deceptively simple beauty.\n\n\"I wanted to create a fragrance that felt like a fresh start,\" explains Amélie. \"Not in a generic 'clean' way, but in a deeply personal way. The scent of possibility.\"\n\nCitrus notes provide that spark of morning light—bergamot, lemon, grapefruit. But the magic is in the heart: iris and white tea create a powdery, meditative quality. Musk at the base keeps everything close to the skin, intimate.\n\nAube Nouvelle is our most understated fragrance, but perhaps our most sophisticated. It requires confidence to wear something this subtle in a world that often mistakes loudness for luxury.\n\nThis is fragrance as ritual, not armor. Wear it when you want to feel like yourself, only more so.",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
    dipWeek: 1,
    rating: 4,
    wordCount: 167,
    archived: false,
    status: "Active"
  },
  {
    id: "16",
    title: "Year in Review 2023",
    contentType: "email_newsletter",
    collection: "signature",
    content: "Subject: A Year of Beauty and Growth\n\nDear Maison Lumière Community,\n\nAs 2023 draws to a close, we wanted to take a moment to reflect—and to thank you.\n\nThis year, you welcomed two new fragrances into our collection: Jardin Secret and Aube Nouvelle. You supported our commitment to sustainable sourcing. You shared your stories of how our fragrances have become part of your daily rituals.\n\n**Highlights:**\n- Launched 2 new fragrances\n- Partnered with 3 new heritage suppliers\n- Reduced packaging waste by 40%\n- Grew our community to 10,000+ fragrance lovers\n\nThank you for being part of this journey. Here's to another year of intentional beauty.\n\nWith gratitude,\nThe Maison Lumière Team\n\nP.S. Check your inbox on January 1st for a special New Year offer.",
    createdAt: new Date("2023-12-20"),
    updatedAt: new Date("2023-12-20"),
    dipWeek: 1,
    rating: 4,
    wordCount: 156,
    archived: false,
    status: "Active"
  },
  {
    id: "17",
    title: "Behind the Bottle: Design Philosophy",
    contentType: "blog_post",
    collection: "signature",
    content: "Every detail matters. Our bottle design took eighteen months to perfect—because the vessel should honor the fragrance within.\n\n**The Glass:** Heavy, hand-finished glass. We wanted something that feels substantial in your hand, luxurious without being ostentatious.\n\n**The Cap:** Brushed brass with our L monogram. Tactile, satisfying to open, beautiful on a dresser.\n\n**The Label:** Hand-applied, minimal typography. We chose a cream paper that ages beautifully—because patina is a form of luxury too.\n\n**The Box:** Textured paper in our signature cream, lined with brass tissue. Opening a Maison Lumière fragrance should feel like unwrapping a carefully chosen gift.\n\nWe could have used cheaper materials. We could have automated production. But that's not who we are. Beauty is in the details, and details take time.",
    createdAt: new Date("2023-12-15"),
    updatedAt: new Date("2023-12-15"),
    dipWeek: 3,
    rating: 5,
    wordCount: 167,
    archived: false,
    status: "Active"
  },
  {
    id: "18",
    title: "Jardin Secret Instagram Story",
    contentType: "instagram",
    collection: "signature",
    product: "Jardin Secret",
    content: "Some gardens are meant to be discovered, not displayed. 🌿\n\nJardin Secret: green fig, violet leaf, jasmine, rose, cedar, oakmoss. A verdant fragrance for those who appreciate subtlety and refinement.\n\nNot about making an entrance. About creating an atmosphere.\n\n#JardinSecret #MaisonLumière #GreenFragrance #NichePerfume",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    dipWeek: 2,
    rating: 4,
    wordCount: 45,
    archived: false,
    status: "Active"
  },
  {
    id: "19",
    title: "Spring Collection Preview",
    contentType: "email",
    collection: "seasonal",
    content: "Subject: First Look: Spring 2024 Collection\n\nDear [First Name],\n\nSpring brings renewal. This year, we're celebrating with three limited-edition fragrances inspired by the season's gentle awakening.\n\n**Fleur de Pêche:** Peach blossom, white tea, soft musk. Delicate but not fleeting.\n\n**Vert de Printemps:** Grass, lily of the valley, white cedar. Fresh as morning dew.\n\n**Ciel Clair:** Sea salt, driftwood, clean cotton. Coastal minimalism.\n\nEach fragrance available in 50ml editions only. Launching March 20th.\n\nJoin our waitlist for early access and exclusive previews.\n\nWith warmth,\nMaison Lumière",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    dipWeek: 1,
    rating: 4,
    wordCount: 118,
    archived: false,
    status: "Active"
  },
  {
    id: "20",
    title: "How to Layer Fragrances",
    contentType: "blog_post",
    collection: "discovery",
    content: "Fragrance layering is an art—and once you master it, you'll never want to wear just one scent again.\n\n**The Foundation:** Start with a base fragrance that has good lasting power. Noir de Nuit or Terre Sauvage work beautifully as foundations.\n\n**The Accent:** Add a lighter fragrance to create complexity. Try layering Lumière Dorée over Noir de Nuit for mysterious warmth, or Aube Nouvelle over Terre Sauvage for fresh ruggedness.\n\n**The Rule:** Heavier scents (oud, leather, amber) go first. Lighter scents (citrus, florals) go second.\n\n**Our Favorite Combinations:**\n- Noir de Nuit + Lumière Dorée = Dark Gold\n- Terre Sauvage + Aube Nouvelle = Fresh Adventure\n- Jardin Secret + Lumière Dorée = Sunlit Garden\n\nExperiment. Play. Create your signature blend.",
    createdAt: new Date("2023-12-10"),
    updatedAt: new Date("2023-12-10"),
    dipWeek: 3,
    rating: 5,
    wordCount: 174,
    archived: false,
    status: "Active"
  },
  {
    id: "21",
    title: "Customer Spotlight: Sarah's Story",
    contentType: "blog_post",
    collection: "discovery",
    content: "\"I found Maison Lumière during a difficult time in my life. I was going through a divorce, questioning everything, feeling lost.\n\nSomeone gifted me Aube Nouvelle. The name—New Dawn—felt almost too on the nose. But when I wore it, something shifted. It became part of my morning ritual, a small act of self-care that reminded me I could begin again.\n\nNow, two years later, Aube Nouvelle is still my signature. But it means something different now. It's not about starting over—it's about choosing myself, every single day.\n\nFragrance is personal. Sometimes it's just a nice smell. Sometimes it's a lifeline.\"\n\n— Sarah M., Portland\n\nThank you for sharing your story, Sarah. This is why we do what we do.",
    createdAt: new Date("2023-12-05"),
    updatedAt: new Date("2023-12-05"),
    dipWeek: 4,
    rating: 5,
    wordCount: 156,
    archived: false,
    status: "Active"
  },
  {
    id: "22",
    title: "[ARCHIVED] Summer Sale Announcement",
    contentType: "email",
    collection: "seasonal",
    content: "Subject: Summer Sale - 30% Off Discovery Sets\n\nDear [First Name],\n\nSummer is here, and we're celebrating with our biggest sale of the year.\n\nFor one week only, enjoy 30% off all Discovery Sets. It's the perfect opportunity to explore our collection or gift someone an introduction to Maison Lumière.\n\nUse code SUMMER30 at checkout.\n\nSale ends June 30th.\n\nWith warmth,\nMaison Lumière",
    createdAt: new Date("2023-06-23"),
    updatedAt: new Date("2023-06-23"),
    dipWeek: 2,
    rating: 3,
    wordCount: 89,
    archived: true,
    status: "Archived"
  }
];
