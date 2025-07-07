# Nederlandse Emissiezones App 🌍🚗

Een interactieve web applicatie voor het visualiseren van Nederlandse emissiezones (Nul-emissie Zones en Lage-emissie Zones). Deze moderne React/Next.js app toont alle ZE en LEZ zones in Nederland met gedetailleerde informatie over voertuigbeperkingen, geldigheidsperiodes en vrijstellingen.

![Nederlandse Emissiezones](https://img.shields.io/badge/Status-Active-green)
![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-06B6D4)

## 🚀 Features

### Interactieve Kaart
- **Leaflet Map** met alle Nederlandse emissiezones
- **Polygon visualisatie** van zone boundaries
- **Zoom en pan** functionaliteit
- **Responsive design** voor alle apparaten

### Zone Management
- **42+ emissiezones** uit heel Nederland
- **ZE Zones** (Nul-emissie Zones) en **LEZ Zones** (Lage-emissie Zones)
- **Real-time filtering** en zoekfunctionaliteit
- **Gedetailleerde zone informatie**

### Data Processing
- **XML parsing** van officiële Nederlandse emissiedata
- **Coordinate validation** voor Nederlandse geografische grenzen
- **Multi-polygon support** voor complexe zones
- **Automated status detection** (actief/binnenkort/inactief)

## 🏙️ Ondersteunde Steden

De app bevat emissiezones voor o.a.:
- **Amsterdam** (ZE + LEZ)
- **Rotterdam** (ZE + LEZ Maasvlakte)
- **Den Haag** (ZE + LEZ + ZE Kust)
- **Utrecht** (ZE + LEZ)
- **Amersfoort** (ZE 2025 + ZE 2027)
- **Arnhem** (ZE + Milieuzone)
- **Groningen** (ZE)
- **Tilburg** (ZE + LEZ)
- **Nijmegen** (ZE)
- **Haarlem** (ZE + LEZ)
- **Maastricht** (ZES + Milieuzone)
- En 30+ andere steden...

## 🛠️ Technische Stack

### Frontend
- **Next.js 14.2.30** - React framework met App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Leaflet** - Interactive mapping
- **Lucide React** - Beautiful icons

### Dependencies
```json
{
  "next": "14.2.30",
  "react": "^18",
  "react-leaflet": "^4.2.1",
  "leaflet": "^1.9.4",
  "tailwindcss": "^3.4.1",
  "typescript": "^5"
}
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm of yarn
- Git

### Installation

1. **Clone de repository**
```bash
git clone https://github.com/jordenvanderhoogt/nederland-emissiezones-app.git
cd nederland-emissiezones-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

### Build voor productie
```bash
npm run build
npm start
```

## 📂 Project Structuur

```
ZE zones app/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/
│   ├── EmissionZoneMap.tsx  # Interactive Leaflet map
│   ├── Header.tsx           # Navigation header
│   └── ZoneList.tsx         # Searchable zone sidebar
├── lib/
│   └── data-processor.ts    # XML parsing & data processing
├── public/
│   └── data/
│       └── emission-zones.xml # Nederlandse emissiedata
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🗺️ Data Specificaties

### XML Data Bron
- **Officiële Nederlandse emissiedata** in gestandaardiseerd XML formaat
- **42 emissiezones** met polygon coordinaten
- **GML MultiPolygon** support voor complexe boundaries
- **Namespace-aware parsing** met fallback strategies

### Coordinate System
- **WGS84** (EPSG:4326) coordinate system
- **Nederlandse grenzen**: lat 50.5-53.7, lng 3.2-7.3
- **Automated validation** van coordinate ranges
- **Lat/lng format detection** met automatic conversion

### Zone Types
- **ZE (Nul-emissie Zone)**: Alleen elektrische/waterstof voertuigen
- **LEZ (Lage-emissie Zone)**: Beperkte toegang op basis van emissieklasse
- **Status detection**: Actief, Binnenkort, Inactief

## 🎨 UI/UX Design

### Design System
- **Nederlandse kleuren**: Blauw (#5B9BD5), Groen (#7CB342)
- **Accessible contrast ratios** (WCAG AA compliant)
- **Mobile-first responsive design**
- **Modern glassmorphism effects**

### User Experience
- **Intuitive navigation** met zoek en filter
- **Fast loading** met lazy-loaded map component
- **Error handling** met user-friendly messages
- **Accessibility** features (screen reader support)

## 🔧 Development

### Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Environment Setup
- **Next.js 14** met App Router
- **TypeScript strict mode**
- **Tailwind CSS** met custom theme
- **React Leaflet** met SSR disabled

### Debugging
Uitgebreide console logging voor ontwikkelaars:
- 📄 XML content parsing
- 🏙️ Zone discovery 
- 📍 Coordinate validation
- 🗺️ Polygon processing
- ✅ Success confirmations

## 🌐 SEO Optimalisatie

### Meta Tags
- **Nederlandse titel**: "Nederlandse Emissiezones | ZE & LEZ Zones Kaart"
- **SEO-beschrijving**: Uitgebreide Nederlandse keywords
- **OpenGraph** tags voor social media
- **Schema.org** markup voor zoekmachines

### Performance
- **Next.js optimizations** (Image, Font, Script)
- **Lazy loading** voor map component
- **Code splitting** per route
- **Optimized bundle size**

### Toegankelijkheid
- **WCAG 2.1 AA** compliance
- **Semantic HTML** markup
- **Screen reader** ondersteuning
- **Keyboard navigation**

## 🤝 Contributing

Bijdragen zijn welkom! Volg deze stappen:

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/nieuwe-functie`)
3. Commit je wijzigingen (`git commit -m 'Voeg nieuwe functie toe'`)
4. Push naar de branch (`git push origin feature/nieuwe-functie`)
5. Open een Pull Request

### Development Guidelines
- **TypeScript** types voor alle nieuwe functies
- **Responsive design** voor alle componenten
- **Nederlandse interface** teksten
- **Console logging** voor debugging

## 📄 License

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 📞 Contact

**Jord van der Hoogt**
- Email: [jord@cenex.nl](mailto:jord@cenex.nl)
- GitHub: [@jordenvanderhoogt](https://github.com/jordenvanderhoogt)
- LinkedIn: [/in/jordvanderhoogt](https://linkedin.com/in/jordvanderhoogt)

---

## 🙏 Acknowledgments

- **Nederlandse overheid** voor het beschikbaar stellen van emissiedata
- **Leaflet** community voor de excellent mapping library
- **Next.js team** voor het geweldige React framework
- **Tailwind CSS** voor het utility-first CSS framework

---

⭐ **Star dit project als het je heeft geholpen bij het navigeren door Nederlandse emissiezones!** 