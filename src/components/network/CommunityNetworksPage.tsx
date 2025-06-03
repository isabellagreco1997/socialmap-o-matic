import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusIcon, MapPinIcon, FilterIcon, ClipboardCopyIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { NetworkDataService } from "@/components/network/NetworkDataService";
import { supabase } from "@/integrations/supabase/client";
import { generateNetworkFromPrompt } from "@/components/network/NetworkGenerator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CommunityNetworksPageProps {
  onNetworkAdded?: (id: string) => void;
}

// Industry color mapping
const INDUSTRY_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  "Technology": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  "Healthcare": { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  "Education": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
  "Finance": { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
  "Nonprofit": { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
  "Entertainment": { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
  "Manufacturing": { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
  "Fashion": { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-200" },
  "Gaming": { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
  "Tourism": { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-200" },
  "Energy": { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
  "Science": { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-200" },
  "History": { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
  "Music": { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
  "Agriculture": { bg: "bg-lime-100", text: "text-lime-800", border: "border-lime-200" },
  "Aerospace": { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-200" },
  "Food": { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
  "Arts": { bg: "bg-fuchsia-100", text: "text-fuchsia-800", border: "border-fuchsia-200" },
  "Consulting": { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-200" },
  "Investment Banking": { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
  "Private Equity": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  "Hedge Funds": { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" },
  "Career": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
  "Celebrity": { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  "Politics": { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-200" },
  "Luxury": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
  "Media": { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
  "Philanthropy": { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  "Sports": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  "Royalty": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" }
};

// Default color for any industry not in the mapping
const DEFAULT_COLOR = { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };

// Sample community networks with example prompts
const COMMUNITY_NETWORKS = [
  {
    id: "startup-network",
    title: "San Francisco Tech Startup Ecosystem & Venture Capital Network",
    description: "Tech startup ecosystem in San Francisco with VCs, accelerators, and key players",
    prompt: "Create a comprehensive network for the tech startup ecosystem in San Francisco. Include major venture capital firms like Sequoia Capital, Andreessen Horowitz, and Y Combinator. Add key accelerators such as 500 Startups and Techstars. Include major tech meetups like SF New Tech and industry conferences such as TechCrunch Disrupt. Connect the entities with appropriate relationships like 'invests in', 'mentors', and 'participates in'.",
    industry: "Technology",
    location: "San Francisco, CA"
  },
  {
    id: "brad-pitt-access",
    title: "Brad Pitt Access Network: Pathways to Meeting the A-List Actor",
    description: "Strategic pathways and connections for potentially meeting or working with Brad Pitt",
    prompt: "Create a network mapping potential pathways to meet Brad Pitt, including his production company Plan B Entertainment, charity initiatives (Make It Right Foundation, Jolie-Pitt Foundation), film projects and sets, industry events he regularly attends (Venice Film Festival, Cannes, Academy Awards), agents and representatives (CAA), brand partnerships (Brioni, De'Longhi), favorite restaurants and hotspots (Chateau Marmont, restaurants in Los Feliz area), mutual connections through co-stars and directors (Quentin Tarantino, George Clooney, Leonardo DiCaprio), and philanthropic causes he supports (sustainability, affordable housing, humanitarian aid). Show relationships between different access points, identifying which paths might be most accessible to different professionals (filmmakers, charity workers, journalists, industry executives). Include the gatekeepers who manage his schedule and appearances, and strategic entry points that could lead to meaningful interactions rather than just passing encounters.",
    industry: "Celebrity",
    location: "Los Angeles, CA"
  },
  {
    id: "hollywood-access",
    title: "Hollywood Celebrity Access & Entertainment Industry Network",
    description: "Network for connecting with A-list celebrities, film executives, and entertainment personalities",
    prompt: "Create a network mapping the Hollywood celebrity ecosystem and access points, including major talent agencies (CAA, WME, UTA), publicists and PR firms, charity galas and fundraising events, film festival VIP circuits, exclusive restaurants and clubs, production companies, celebrity managers, stylists, celebrity-backed ventures, and industry networking events. Show relationships between different tiers of celebrity access, gatekeepers who control access to A-listers, charity boards with celebrity involvement, film/TV production connections, and strategic entry points for meaningful engagement with high-profile entertainment figures. Include typical paths for professionals to build relationships in this ecosystem.",
    industry: "Celebrity",
    location: "Los Angeles, CA"
  },
  {
    id: "investment-banking-nyc",
    title: "New York Investment Banking Career Network",
    description: "Investment banking career opportunities and networking ecosystem in New York",
    prompt: "Create a network mapping the investment banking career ecosystem in New York. Include bulge bracket banks (Goldman Sachs, JP Morgan, Morgan Stanley), elite boutiques (Evercore, Lazard, Centerview Partners), middle market firms (Jefferies, Houlihan Lokey), university recruiting pipelines (target schools like Harvard, Wharton, Columbia), industry networking events (Wall Street Oasis events, Bloomberg conferences), headhunting firms (Glocap, Dynamics Search Partners), and career advancement pathways. Show connections between banks by deal collaboration, talent movement between firms, recruiting relationships with universities, and typical promotion trajectories from analyst to managing director.",
    industry: "Investment Banking",
    location: "New York, NY"
  },
  {
    id: "tech-billionaires",
    title: "Silicon Valley Billionaire & Tech Titan Access Network",
    description: "Pathways to connect with tech industry leaders, founders, and influential investors",
    prompt: "Map the ecosystem surrounding Silicon Valley's tech billionaires and industry titans, including major tech conference speaking circuits, prestigious university lecture series and alumni networks, high-impact philanthropy organizations and foundations, exclusive tech leadership retreats and summits, VC pitch events, tech startup boards and advisory roles, influential tech media outlets and podcasts, and elite social clubs. Show relationships between different avenues for connecting with tech leaders like Elon Musk, Marc Andreessen, Sheryl Sandberg, and Reid Hoffman, indicating which pathways are most accessible to different professionals. Include typical progression of relationships from initial connection to meaningful engagement with these high-profile individuals.",
    industry: "Technology",
    location: "Silicon Valley, CA"
  },
  {
    id: "healthcare-network",
    title: "Boston Medical Research & Healthcare Innovation Network",
    description: "Medical research and innovation network in Boston with hospitals and biotech companies",
    prompt: "Map the healthcare research ecosystem in Boston, including major hospitals like Massachusetts General Hospital, Brigham and Women's Hospital, and Boston Children's Hospital. Include research labs at Harvard Medical School and MIT. Add biotech companies like Moderna, Biogen, and Vertex Pharmaceuticals. Include medical conferences like the Boston MedTech Conference. Create connections showing research collaborations, funding relationships, and technology transfer partnerships.",
    industry: "Healthcare",
    location: "Boston, MA"
  },
  {
    id: "davos-network",
    title: "Davos World Economic Forum & Global Elite Network",
    description: "Network of global business and political elites at WEF and similar high-profile gatherings",
    prompt: "Create a network mapping the global elite ecosystem centered around the World Economic Forum in Davos, including key attendee categories (Fortune 500 CEOs, heads of state, central bank leaders, thought leaders), side events and private receptions, industry-specific pavilions, WEF Young Global Leaders program, exclusive mountain retreats, strategic partners and corporate members, media organizations with special access, and global policy initiatives. Show relationships between official WEF programming and the crucial unofficial networking that happens, the hierarchy of access at Davos (from badge types to invitation-only events), and pathways for different professionals to gain entry into this ecosystem. Include similar elite gatherings like Bilderberg, Aspen Ideas Festival, and Milken Institute Global Conference.",
    industry: "Politics",
    location: "Davos, Switzerland"
  },
  {
    id: "private-equity-london",
    title: "London Private Equity & Alternative Investments Career Network",
    description: "Private equity career landscape in London with firms, recruiters, and networking opportunities",
    prompt: "Map the private equity career landscape in London, including major PE firms (CVC Capital, Apax Partners, KKR London, Blackstone London), investment banks' PE coverage groups, specialized PE recruiters (PER, Blackwood, Kea Consultants), feeder industries (investment banking, consulting, corporate development), industry events (SuperReturn, PEI Forums), and alumni networks from target institutions. Show relationships between hiring pipelines (which banks commonly feed into specific PE firms), typical career paths (pre-MBA associate to post-MBA VP tracks), co-investment relationships between firms, and career exit options (portfolio company operations, hedge funds, family offices).",
    industry: "Private Equity",
    location: "London, UK"
  },
  {
    id: "royal-circles",
    title: "British Royal Family & Aristocratic Social Circles",
    description: "Networks surrounding the British monarchy, aristocracy, and exclusive social events",
    prompt: "Map the social ecosystem surrounding the British Royal Family and aristocracy, including major charitable patronages and foundations, prestigious social season events (Royal Ascot, Henley Regatta, Wimbledon Royal Box), ceremonial military units and affiliations, exclusive private clubs (White's, Boodle's, The Hurlingham Club), historic country house gatherings, elite educational institutions (Eton, St. Andrews University, Gordonstoun), aristocratic family connections, equestrian circles, and arts patronage networks. Show relationships between different tiers of access to royal circles, the role of traditional aristocratic families, pathways through charitable work and philanthropic giving, and the transition points from public events to private gatherings. Include how different professionals (diplomats, business leaders, philanthropists, artists) typically navigate meaningful connections within these circles.",
    industry: "Royalty",
    location: "London, UK"
  },
  {
    id: "deep-sea-exploration",
    title: "Deep Sea Exploration & Oceanographic Research Network",
    description: "Global deep sea exploration entities, research vessels, and underwater technologies",
    prompt: "Create a network of deep sea exploration organizations including Woods Hole Oceanographic Institution, Scripps Institution of Oceanography, and JAMSTEC. Include research vessels (Nautilus, Falkor, JOIDES Resolution), submersibles (Alvin, Limiting Factor, Shinkai 6500), underwater technologies (ROVs, AUVs), hydrothermal vent research sites (Mid-Atlantic Ridge, East Pacific Rise), and deep sea marine protected areas. Show relationships between research institutions, funding agencies, technology deployment, and scientific discoveries in hadal zones, abyssal plains, and deep ocean trenches.",
    industry: "Science",
    location: "Global"
  },
  {
    id: "washington-insiders",
    title: "Washington DC Political Insider & Government Access Network",
    description: "Power networks in Washington DC with pathways to connect with political leaders and policymakers",
    prompt: "Create a network mapping Washington DC's political power ecosystem, including Congressional committee structures, executive branch departments and agencies, influential think tanks (Brookings, CATO, Heritage Foundation), lobbying firms, political fundraising circuits, policy working groups, prestigious social clubs (Cosmos Club, Metropolitan Club), embassy diplomatic receptions, political media outlets, and industry associations with government affairs departments. Show relationships between formal government structures and informal power networks, pathways for accessing elected officials and senior appointees, the role of former staffers and the 'revolving door', and how different types of organizations (corporations, nonprofits, foreign entities) typically build relationships with political decision-makers. Include seasonal events (White House Correspondents' Dinner, Kennedy Center Honors) that facilitate high-level networking.",
    industry: "Politics",
    location: "Washington, DC"
  },
  {
    id: "tech-careers-seattle",
    title: "Seattle Technology Career & Recruitment Network",
    description: "Tech job opportunities and recruitment ecosystem in Seattle with major employers",
    prompt: "Create a network mapping Seattle's technology career ecosystem, including major employers (Amazon, Microsoft, Tableau, Expedia), technical recruiting firms (TEKsystems, Robert Half Technology, Hays), university talent pipelines (University of Washington, Seattle University), coding bootcamps (Code Fellows, Galvanize), tech-specific job platforms (Indeed Prime, Hired.com, StackOverflow Jobs), networking events (Seattle Tech Meetup, Women in Tech Seattle), and industry conferences. Show relationships between companies competing for similar talent pools, common career transitions between firms, technology specialization clusters, and which recruiting channels are preferred by different companies for various roles.",
    industry: "Technology",
    location: "Seattle, WA"
  },
  {
    id: "celebrity-philanthropy",
    title: "Elite Philanthropy & High Net Worth Donor Circles",
    description: "Networks connecting philanthropists, foundation leaders, and celebrity charitable initiatives",
    prompt: "Map the high-profile philanthropy ecosystem, including major foundation leadership networks (Gates Foundation, Ford Foundation, Rockefeller Foundation), elite donor collaboratives (The Giving Pledge, Blue Meridian Partners), venture philanthropy funds, impact investing circles, celebrity-driven foundations and causes, high-profile fundraising galas and benefit events, donor advised fund networks, philanthropy advisory firms, university development boards, museum patron programs, and hospital benefactor circles. Show relationships between public philanthropic events and private donor communities, pathways for meaningful engagement with established philanthropists and foundation leaders, the interconnection between business networks and charitable giving circles, and how different causes attract different donor profiles. Include typical progression from initial charitable involvement to positions of influence in major philanthropic institutions.",
    industry: "Philanthropy",
    location: "Global"
  },
  {
    id: "medieval-trade-routes",
    title: "Medieval Silk Road & Mediterranean Trade Network",
    description: "Historical trade network connecting Europe, Africa, and Asia with key trading cities",
    prompt: "Map the medieval trading network spanning Europe, North Africa, and Asia (900-1400 CE). Include major trading cities (Venice, Constantinople, Alexandria, Baghdad, Samarkand, Chang'an), merchant guilds (Venetian merchants, Genoese traders, Arab merchant houses), commodities (silk, spices, porcelain, glass, amber), trade routes (Silk Road, Mediterranean sea routes, trans-Saharan routes), and cultural exchange centers. Show relationships between trading powers, commodity flows, merchant alliances, and technological/knowledge diffusion across the interconnected Afro-Eurasian world.",
    industry: "History",
    location: "Eurasia"
  },
  {
    id: "sports-celebrities",
    title: "Professional Sports & Athletic Celebrity Network",
    description: "Access points to professional athletes, sports executives, and athletic celebrities",
    prompt: "Create a network mapping the professional sports celebrity ecosystem, including major sports agencies (CAA Sports, Excel Sports, Wasserman), team ownership and front office executives, sports marketing firms, athletic apparel and endorsement relationships, sports media and broadcasting, charity foundations and celebrity golf tournaments, athlete-owned businesses and investment vehicles, sports tech startups with athlete backers, and exclusive athletic clubs and training facilities. Show relationships between different access points to high-profile athletes across major sports leagues (NBA, NFL, MLB, international soccer), the gatekeepers who manage athlete relationships, pathways through business ventures and endorsement opportunities, and ways different professionals (marketers, entrepreneurs, philanthropists) typically build meaningful connections with sports personalities. Include how the off-season versus playing season affects accessibility.",
    industry: "Sports",
    location: "Global"
  },
  {
    id: "hedge-funds-connecticut",
    title: "Connecticut Hedge Fund Alley Career Network",
    description: "Hedge fund career landscape in Connecticut with firms, service providers, and networking channels",
    prompt: "Map the hedge fund career ecosystem in Connecticut's 'Hedge Fund Alley' (Greenwich, Stamford, Westport), including major funds (Bridgewater Associates, AQR Capital, Point72, Tudor Investment Corp), prime brokers (Goldman Sachs, Morgan Stanley, JP Morgan), fund administrators, tech vendors (Bloomberg, FactSet, Enfusion), specialized recruiters (Glocap, Dynamics Search Partners, Long Ridge Partners), and industry networking events. Show relationships between career advancement pathways, talent movement patterns between funds, key service provider relationships, compensation trends across different strategy types (equity long/short, macro, quant), and universities/MBA programs that commonly feed into this ecosystem.",
    industry: "Hedge Funds",
    location: "Greenwich, CT"
  },
  {
    id: "luxury-lifestyle",
    title: "Global Ultra-Luxury Lifestyle & UHNW Social Network",
    description: "Exclusive social circles and experiences of ultra-high-net-worth individuals worldwide",
    prompt: "Map the ultra-luxury lifestyle ecosystem for Ultra-High-Net-Worth Individuals (UHNW), including exclusive members-only clubs (Core Club, Yellowstone Club, Soho House), concierge services and lifestyle management firms, luxury real estate enclaves, private banking relationship managers, invitation-only art collecting circles, luxury brand VIP client programs, elite travel experiences (Aman Resorts, private island rentals), luxury yacht and private aviation communities, exclusive wellness retreats, high-end auction house client relationships, and private dining experiences with celebrity chefs. Show relationships between different luxury sectors, the gatekeepers who facilitate access to exclusive experiences, seasonal gathering points (Monaco Yacht Show, Art Basel, Aspen during holidays), and how different luxury brands and service providers connect with UHNW clients. Include typical pathways for professionals to meaningfully engage with this community through business, philanthropy, and shared interests.",
    industry: "Luxury",
    location: "Global"
  },
  {
    id: "academic-network",
    title: "Academic Research Collaboration & Funding Network",
    description: "University research collaboration network with leading institutions and funding sources",
    prompt: "Create a network for academic research collaborations between top universities (Harvard, MIT, Stanford, UC Berkeley), major research labs (Bell Labs, CERN, Lawrence Berkeley National Laboratory), grant organizations (NSF, NIH, Gates Foundation), and prominent publication venues (Nature, Science, PNAS). Include connections for funding relationships, joint research initiatives, publication pathways, and conference presentations. Show the flow of knowledge and resources in the academic ecosystem.",
    industry: "Education",
    location: "Cambridge, MA"
  },
  {
    id: "media-elite",
    title: "Media Executive & Journalism Elite Network",
    description: "Networks connecting influential media executives, editors, and journalism figures",
    prompt: "Create a network mapping the media elite ecosystem, including major news organization leadership (New York Times, CNN, News Corp, Wall Street Journal), prestigious journalism fellowships and awards (Pulitzer, Nieman, Knight), industry conferences and events (Cannes Lions, Sun Valley Conference), journalism schools and alumni networks, exclusive press clubs and media associations, editorial boards, high-profile media personalities and their production companies, industry-specific awards ceremonies, and influential new media platforms. Show relationships between traditional media power centers and digital disruptors, pathways for access to media decision-makers, the interconnection between media executives and other industries (technology, politics, entertainment), and how different professionals typically build relationships with journalistic influencers. Include the role of publicists, communications executives, and media relations professionals in facilitating connections to this ecosystem.",
    industry: "Media",
    location: "New York, NY"
  },
  {
    id: "tech-careers-silicon-valley",
    title: "Silicon Valley Tech Career & Recruitment Landscape",
    description: "Tech career opportunities in Silicon Valley with FAANG companies, startups, and VCs",
    prompt: "Map the Silicon Valley technology career ecosystem, including FAANG companies (Meta, Apple, Google), major tech employers (Salesforce, Adobe, Oracle, Intel), unicorn startups, VC firms, technical recruiters (Robert Half Technology, Riviera Partners), specialized job platforms (Triplebyte, AngelList), bootcamps (Lambda School, App Academy), university recruiting pipelines (Stanford, Berkeley, San Jose State), and networking events (TechCrunch Disrupt, meetups). Show relationships between companies competing for talent, how talent typically moves between startups and established companies, compensation trends across different roles (SWE, PM, design), and how VC funding impacts hiring waves in specific technology sectors.",
    industry: "Technology",
    location: "Palo Alto, CA"
  },
  {
    id: "mycology-network",
    title: "Global Mycological Research & Mushroom Cultivation Network",
    description: "Interconnected world of fungi research, mushroom cultivation, and mycoremediation projects",
    prompt: "Create a network mapping the world of mycology, including research institutions (Mycological Society of America, International Mycological Association), mushroom cultivation companies (Fungi Perfecti, Mushroom Mountain), mycoremediation projects (Fungi Foundation, CoRenewal), gourmet and medicinal mushroom producers, mycological herbaria and collections (New York Botanical Garden fungarium, Kew fungarium), and citizen science initiatives like Fungal Diversity Survey. Show connections between academic research, commercial applications, conservation efforts, and pioneering individuals like Paul Stamets, Giuliana Furci, and Merlin Sheldrake.",
    industry: "Agriculture",
    location: "Global"
  },
  {
    id: "banking-careers-hongkong",
    title: "Hong Kong Investment Banking & Finance Career Network",
    description: "Finance career opportunities in Hong Kong with global banks, Chinese institutions, and networking channels",
    prompt: "Create a network mapping Hong Kong's financial career ecosystem, including global investment banks (Goldman Sachs, Morgan Stanley, HSBC), Chinese institutions (CICC, BOC International, Haitong), financial regulators (HKMA, SFC), PE/VC firms, hedge funds, specialized recruiters (Michael Page, Morgan McKinley, Selby Jennings), university connections (HKU, HKUST, Chinese University), and networking associations (HKIFA, CFA Society). Show relationships between Western and Chinese financial institutions, career progression paths, key financial district areas (Central vs Quarry Bay), compensation bands across different roles, common exit options, and cross-border career opportunities connecting mainland China, Hong Kong, and international financial hubs.",
    industry: "Investment Banking",
    location: "Hong Kong"
  },
  {
    id: "nonprofit-network",
    title: "Climate Change Nonprofit & Social Impact Organization Network",
    description: "Nonprofit and social impact organizations focused on climate change solutions",
    prompt: "Create a network of nonprofit organizations (Sierra Club, Natural Resources Defense Council, 350.org), foundations (ClimateWorks Foundation, Bloomberg Philanthropies), social enterprises (Patagonia, Tesla's environmental initiatives), and impact investors (Breakthrough Energy Ventures, Generation Investment Management) working on climate change solutions. Include connections showing funding relationships, collaborative initiatives, policy advocacy coalitions, and technology deployment partnerships. Map how these organizations interact to address climate challenges.",
    industry: "Nonprofit",
    location: "Washington, DC"
  },
  {
    id: "consulting-careers-london",
    title: "London Management Consulting Career Network",
    description: "Consulting career landscape in London with major firms, MBA programs, and exit opportunities",
    prompt: "Map the management consulting career ecosystem in London, including strategy firms (McKinsey, BCG, Bain London offices), Big 4 advisory practices, boutique consultancies, MBA feeders (London Business School, INSEAD, Oxford Saïd, Cambridge Judge), recruitment events, industry networking platforms (Consultancy.uk, MCA events), and common exit opportunities into UK industries. Show relationships between consulting firms and their typical client industries in the UK market, promotion timelines, MBA vs. experienced hire tracks, consulting-to-industry transition patterns, and which firms are known for specific practice areas (digital transformation, sustainability, healthcare) in the London market.",
    industry: "Consulting",
    location: "London, UK"
  },
  {
    id: "space-industry",
    title: "New Space Industry & Private Space Exploration Network",
    description: "Private space companies, launch providers, and satellite manufacturers revolutionizing space access",
    prompt: "Map the modern commercial space industry, including major launch providers (SpaceX, Blue Origin, Rocket Lab), satellite manufacturers (Planet Labs, Maxar, OneWeb), space tourism companies (Virgin Galactic, Space Perspective), asteroid mining ventures (AstroForge, TransAstra), space stations (Axiom Space), space agencies (NASA Commercial Crew Program, ESA), and spaceports (Cape Canaveral, Vandenberg, Baikonur). Show relationships between technology suppliers, launch contracts, investment flows, and regulatory frameworks. Highlight how the NewSpace ecosystem is democratizing access to orbit and enabling new space applications.",
    industry: "Aerospace",
    location: "Global"
  },
  {
    id: "entertainment-network",
    title: "Los Angeles Entertainment & Media Production Network",
    description: "Media and entertainment network in Los Angeles with studios, agencies, and production companies",
    prompt: "Map the entertainment industry in Los Angeles, including major studios (Warner Bros, Universal, Disney), production companies (A24, Plan B Entertainment, Blumhouse), talent agencies (CAA, WME, UTA), and film festivals (AFI Fest, LA Film Festival). Include industry associations like the Academy of Motion Picture Arts and Sciences and the Producers Guild. Show connections for production deals, talent representation, distribution partnerships, and industry event participation. Illustrate how projects flow from development through production and distribution.",
    industry: "Entertainment",
    location: "Los Angeles, CA"
  },
  {
    id: "finance-careers-singapore",
    title: "Singapore Financial Services Career Network",
    description: "Finance job opportunities in Singapore spanning banking, asset management, and fintech",
    prompt: "Create a network of Singapore's financial career ecosystem, including global banks (DBS, UOB, OCBC, Citibank Singapore), sovereign wealth funds (GIC, Temasek), asset managers, fintech companies, financial regulators (MAS), specialized recruiters (Michael Page, Robert Walters), university connections (NUS, NTU, SMU, INSEAD Singapore), and industry associations (Singapore FinTech Association, CFA Singapore). Show relationships between different financial sectors, typical career trajectories, compensation trends, networking platforms, key financial districts (Raffles Place, Marina Bay), and how Singapore serves as a career hub connecting Southeast Asian markets with global finance.",
    industry: "Finance",
    location: "Singapore"
  },
  {
    id: "artisanal-food",
    title: "Portland Artisanal Food & Craft Beverage Ecosystem",
    description: "Portland's vibrant craft food scene with microbreweries, specialty coffee, and farm-to-table restaurants",
    prompt: "Create a network of Portland's artisanal food ecosystem, including craft breweries (Breakside, Cascade Brewing, pFriem), specialty coffee roasters (Stumptown, Heart, Coava), distilleries (Clear Creek, New Deal, House Spirits), urban wineries (Division Winemaking, Southeast Wine Collective), farmers markets (PSU, Hollywood), food carts, farm-to-table restaurants, and food incubators (The Redd, KitchenCru). Include local farms, specialty suppliers, and food events (Feast Portland, Portland Beer Week). Show relationships between producers, suppliers, distribution channels, and collaborative product development in this hyper-local food system.",
    industry: "Food",
    location: "Portland, OR"
  },
  {
    id: "tech-seattle",
    title: "Seattle Technology Companies & Startup Ecosystem",
    description: "Technology ecosystem in Seattle featuring major companies and startups",
    prompt: "Create a network mapping Seattle's technology ecosystem including major tech companies (Microsoft, Amazon, Tableau), startups (Remitly, Convoy, Rover), universities (University of Washington), and industry events (Seattle Startup Week, GeekWire Summit). Include venture capital firms like Madrona Venture Group and Pioneer Square Labs. Show connections for funding relationships, talent movement between companies, technological partnerships, and academic collaborations. Highlight how the Seattle tech community interacts and grows.",
    industry: "Technology",
    location: "Seattle, WA"
  },
  {
    id: "traditional-medicine",
    title: "East Asian Traditional Medicine Knowledge Network",
    description: "Traditional medicine systems across East Asia with herbs, techniques, and knowledge preservation",
    prompt: "Map the East Asian traditional medicine systems, including key institutions (Beijing University of Chinese Medicine, Korea Institute of Oriental Medicine, Kitasato University Oriental Medicine Research Center), herbal pharmacopeias, acupuncture lineages and techniques, medical manuscripts and knowledge repositories, herb cultivation regions and suppliers, modern integrative medicine hospitals, and traditional medicine marketplaces (Anguo herb market, Daegu Yangnyeongsi). Show relationships between knowledge transmission lineages, research validation efforts, modernization initiatives, and cross-cultural exchanges between Chinese, Korean, Japanese, and Tibetan traditional medical systems.",
    industry: "Healthcare",
    location: "East Asia"
  },
  {
    id: "automotive-detroit",
    title: "Detroit Automotive Manufacturing & Innovation Network",
    description: "Automotive manufacturing and innovation ecosystem in Detroit",
    prompt: "Map the automotive industry in Detroit, including manufacturers (Ford, GM, Stellantis), suppliers (Lear Corporation, BorgWarner, Magna), research facilities (Michigan Mobility Institute, MCity), and industry associations (Detroit Auto Dealers Association, Auto Alliance). Include connections showing supply chain relationships, R&D partnerships, manufacturing contracts, and industry event participation. Show how traditional automotive companies interact with new mobility startups and technology companies to innovate in electrification, autonomous vehicles, and connected car technologies.",
    industry: "Manufacturing",
    location: "Detroit, MI"
  },
  {
    id: "antiquarian-books",
    title: "Rare Book Collecting & Antiquarian Market Network",
    description: "Global antiquarian book market with dealers, collectors, auction houses, and institutions",
    prompt: "Create a network of the rare book and manuscript world, including major auction houses (Christie's, Sotheby's, Bonhams), antiquarian book fairs (NY Antiquarian Book Fair, London International Antiquarian Book Fair), rare book dealers (Bauman Rare Books, Peter Harrington, Maggs Bros), specialized libraries (Morgan Library, Huntington Library, Beinecke), book collectors' societies, conservation specialists, bibliographic research institutions, and private collectors. Show relationships between acquisition sources, authentication practices, market valuation mechanisms, and collecting specializations across different periods and genres of rare books and manuscripts.",
    industry: "Arts",
    location: "Global"
  },
  {
    id: "fashion-network",
    title: "New York Fashion Industry & Design Network",
    description: "Fashion industry network in New York including designers, retailers, and media",
    prompt: "Create a network for the fashion industry in New York, including design houses (Ralph Lauren, Donna Karan, Marc Jacobs), retailers (Bloomingdale's, Saks Fifth Avenue, Bergdorf Goodman), fashion media (Vogue, Women's Wear Daily, Harper's Bazaar offices), and industry events (New York Fashion Week, Met Gala). Include schools like FIT and Parsons. Show relationships between designers and retailers, media coverage connections, event participation, and educational partnerships. Map out how trends, designs, and products flow through the NYC fashion ecosystem.",
    industry: "Fashion",
    location: "New York, NY"
  },
  {
    id: "art-forgery",
    title: "Art Authentication & Forgery Investigation Network",
    description: "The specialized world of art authentication, forgery detection, and art crime investigation",
    prompt: "Map the network of art authentication and forgery investigation, including technical analysis labs (Art Analysis & Research, Scientific Analysis of Fine Art), authentication committees (Wildenstein Plattner Institute, Pollock-Krasner Authentication Board), art crime units (FBI Art Crime Team, INTERPOL Works of Art unit), forensic art historians, museum conservation departments, provenance researchers, art law specialists, known forgers and their methods, and major forgery cases. Show relationships between technical examination approaches, authentication workflows, legal frameworks for prosecution, and the evolving technologies in both creating and detecting art forgeries.",
    industry: "Arts",
    location: "Global"
  },
  {
    id: "gaming-industry",
    title: "Video Game Development & Publishing Ecosystem",
    description: "Video game development industry with studios, publishers, and platforms",
    prompt: "Map the gaming industry ecosystem, including game developers (Blizzard, Epic Games, Valve), publishers (Electronic Arts, Activision, Take-Two), platforms (Steam, PlayStation, Xbox), esports organizations (Cloud9, Team Liquid, FaZe Clan), and industry events (E3, GDC, PAX). Show connections for publishing deals, platform exclusivity arrangements, competitive tournament circuits, streaming partnerships, and funding relationships. Illustrate how games move from development through publishing and competitive play, and how money flows through the ecosystem.",
    industry: "Gaming",
    location: "San Francisco, CA"
  },
  {
    id: "analog-synthesis",
    title: "Modular Synthesizer & Electronic Music Hardware Network",
    description: "The specialized world of analog synthesizers, modular systems, and boutique hardware manufacturers",
    prompt: "Create a network of the modular synthesizer ecosystem, including Eurorack manufacturers (Make Noise, Mutable Instruments, Intellijel), vintage synth companies (Moog, Sequential, Korg), DIY synth communities, boutique hardware makers, electronic music studios, synth shops and distributors (Perfect Circuit, Control), music tech education platforms (Learning Modular, Synthtopia), and electronic music artists known for innovative sound design. Include connections showing design collaborations, component suppliers, knowledge exchange, and artist endorsements that shape the evolution of electronic instruments and sound creation techniques.",
    industry: "Music",
    location: "Global"
  },
  {
    id: "tourism-hawaii",
    title: "Hawaii Tourism Industry & Hospitality Network",
    description: "Tourism ecosystem in Hawaii with hotels, attractions, and service providers",
    prompt: "Create a network mapping Hawaii's tourism industry, including hotels (Hilton Hawaiian Village, Moana Surfrider, Royal Hawaiian), tour operators (Roberts Hawaii, Blue Hawaiian Helicopters), attractions (Pearl Harbor, Hawaii Volcanoes National Park, Polynesian Cultural Center), and supporting businesses (car rentals, local restaurants, souvenir shops). Include tourism boards (Hawaii Tourism Authority, island visitor bureaus) and transportation services (airlines, cruise lines). Show connections between accommodations and activities, partnership marketing initiatives, and tourist flow patterns across the islands.",
    industry: "Tourism",
    location: "Honolulu, HI"
  },
  {
    id: "energy-houston",
    title: "Houston Oil & Gas Industry Ecosystem",
    description: "Oil and gas industry network based in Houston with key players and suppliers",
    prompt: "Map the energy industry in Houston, including oil and gas companies (ExxonMobil, Chevron, ConocoPhillips offices), service providers (Halliburton, Baker Hughes, Schlumberger), research institutions (University of Houston Energy Research Park, Rice University's Baker Institute), and industry associations (American Petroleum Institute Houston, Society of Petroleum Engineers). Show connections for exploration partnerships, drilling contracts, equipment supply relationships, research collaborations, and regulatory interactions. Illustrate the flow of technology, services, and products through the Houston energy corridor.",
    industry: "Energy",
    location: "Houston, TX"
  }
];

type SortOption = "industry" | "location" | "alphabetical";

export function CommunityNetworksPage({
  onNetworkAdded
}: CommunityNetworksPageProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("industry");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPrompts, setExpandedPrompts] = useState<string[]>([]);

  // Get industry color
  const getIndustryColor = (industry: string) => {
    return INDUSTRY_COLORS[industry] || DEFAULT_COLOR;
  };

  // Toggle prompt expansion
  const togglePromptExpansion = (id: string) => {
    setExpandedPrompts(prevState => 
      prevState.includes(id) 
        ? prevState.filter(promptId => promptId !== id)
        : [...prevState, id]
    );
  };

  // Check if a prompt is expanded
  const isPromptExpanded = (id: string) => expandedPrompts.includes(id);

  // Get truncated prompt text
  const getTruncatedPrompt = (text: string) => {
    const firstSentenceEnd = text.indexOf('. ');
    if (firstSentenceEnd !== -1 && firstSentenceEnd < 100) {
      return text.substring(0, firstSentenceEnd + 1);
    }
    return text.substring(0, 100) + '...';
  };

  // Copy prompt to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Set copied state for this specific item
        setCopiedId(id);
        // Reset after 2 seconds
        setTimeout(() => setCopiedId(null), 2000);
        
        toast({
          title: "Copied to clipboard",
          description: "The prompt has been copied to your clipboard.",
          duration: 2000
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Failed to copy the prompt to clipboard."
        });
      }
    );
  };

  // Get unique industries for filter
  const industries = useMemo(() => {
    const uniqueIndustries = new Set(COMMUNITY_NETWORKS.map(network => network.industry));
    return ["all", ...Array.from(uniqueIndustries)];
  }, []);

  // Sorted and filtered networks
  const sortedNetworks = useMemo(() => {
    let filtered = COMMUNITY_NETWORKS;
    
    // Apply industry filter
    if (industryFilter !== "all") {
      filtered = filtered.filter(network => network.industry === industryFilter);
    }
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === "industry") {
        return a.industry.localeCompare(b.industry);
      } else if (sortBy === "location") {
        return a.location.localeCompare(b.location);
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  }, [sortBy, industryFilter]);

  const handleAddNetwork = async (network: typeof COMMUNITY_NETWORKS[0]) => {
    try {
      setIsAdding(network.id);
      
      // Create the network in the database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please sign in to add community networks"
        });
        return;
      }

      // Create network with the community network title
      const createdNetwork = await NetworkDataService.createNetwork(
        user.id, 
        network.title, 
        true // Mark as AI-generated
      );
      
      if (!createdNetwork || !createdNetwork.id) {
        throw new Error("Failed to create network");
      }

      // Immediately dispatch network-created event to update network list
      window.dispatchEvent(new CustomEvent('network-created', {
        detail: {
          networkId: createdNetwork.id,
          isAI: true,
          source: 'community-networks'
        }
      }));

      toast({
        title: "Adding network",
        description: `Adding "${network.title}" to your networks...`
      });

      // Generate the network using the prompt
      await generateNetworkFromPrompt(
        createdNetwork.id, 
        network.prompt, 
        network.industry
      );

      // Notify parent that network was added
      if (onNetworkAdded) {
        onNetworkAdded(createdNetwork.id);
      }

      toast({
        title: "Network added",
        description: `"${network.title}" was added to your networks`
      });
    } catch (error) {
      console.error("Error adding community network:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add network. Please try again."
      });
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <div className="flex-1 p-6 min-h-0 overflow-auto bg-gray-50 dark:bg-gray-900 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Community Networks</h1>
          <p className="text-muted-foreground text-base mb-8 max-w-2xl mx-auto">
            Example networks you can add to your collection with one click. Each network is generated with AI based on the description.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <div className="flex items-center">
              <div className="mr-2 text-sm text-muted-foreground">Sort by:</div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-32 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="industry">Industry</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <div className="mr-2 text-sm text-muted-foreground">Industry:</div>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry === "all" ? "All Industries" : industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {sortedNetworks.map((network) => {
            const colorScheme = getIndustryColor(network.industry);
            return (
              <div 
                key={network.id} 
                className="p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={cn(
                          "text-xs font-medium py-1 px-2 rounded-md border", 
                          colorScheme.bg, 
                          colorScheme.text,
                          colorScheme.border
                        )}
                      >
                        {network.industry}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPinIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{network.location}</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-shrink-0 whitespace-nowrap border font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        "bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700",
                        "border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700",
                        "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      )}
                      onClick={() => handleAddNetwork(network)}
                      disabled={isAdding === network.id}
                    >
                      {isAdding === network.id ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Network
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{network.title}</h3>
                  
                  <p className="text-sm text-muted-foreground">
                    {network.description}
                  </p>
                  
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Prompt:</div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={cn(
                          "h-6 px-2 text-xs",
                          "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300",
                          "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        )}
                        onClick={() => copyToClipboard(network.prompt, network.id)}
                      >
                        {copiedId === network.id ? (
                          <><CheckIcon className="h-3 w-3 mr-1" /> Copied</>
                        ) : (
                          <><ClipboardCopyIcon className="h-3 w-3 mr-1" /> Copy</>
                        )}
                      </Button>
                    </div>
                    <div className="text-sm bg-gray-50 dark:bg-gray-700/50 p-4 rounded border border-gray-200 dark:border-gray-600">
                      <div className="text-sm">
                        {isPromptExpanded(network.id) 
                          ? network.prompt 
                          : getTruncatedPrompt(network.prompt)
                        }
                        
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-6 px-2 text-xs",
                              "text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300",
                              "hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            )}
                            onClick={() => togglePromptExpansion(network.id)}
                          >
                            {isPromptExpanded(network.id) ? (
                              <><ChevronUpIcon className="h-3 w-3 mr-1" /> See less</>
                            ) : (
                              <><ChevronDownIcon className="h-3 w-3 mr-1" /> See more</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 