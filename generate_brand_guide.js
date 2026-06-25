const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak, Header, Footer, TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');
const path = require('path');

// Colors
const NAVY = "0F172A";
const ROYAL_BLUE = "2563EB";
const GOLD = "D4AF37";
const INDIGO = "6366F1";
const LIGHT_BLUE_BG = "EFF6FF";
const LIGHT_PURPLE_BG = "FAF5FF";
const CARD_BG = "F8FAFC";
const BORDER_COLOR = "E2E8F0";
const DARK_GRAY = "334155";
const MID_GRAY = "64748B";
const LIGHT_GRAY_BG = "F1F5F9";

// Thin border for tables
const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.before ?? 0, after: opts.after ?? 120 },
    alignment: opts.align ?? AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        bold: opts.bold ?? false,
        italics: opts.italic ?? false,
        size: opts.size ?? 22,
        color: opts.color ?? DARK_GRAY,
        font: "Arial",
      })
    ]
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, size: 36, color: NAVY, font: "Arial" })]
  });
}

function heading2(text, color = NAVY) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 80 },
    children: [new TextRun({ text, bold: true, size: 28, color, font: "Arial" })]
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, bold: true, size: 24, color: NAVY, font: "Arial" })]
  });
}

function subLabel(text) {
  return new Paragraph({
    spacing: { before: 0, after: 60 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 16, color: ROYAL_BLUE, font: "Arial" })]
  });
}

function divider(color = BORDER_COLOR) {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color, space: 1 } },
    children: []
  });
}

function bulletItem(text, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, color: DARK_GRAY, font: "Arial" })]
  });
}

function sectionBreak() {
  return new Paragraph({
    spacing: { before: 480, after: 0 },
    children: [new TextRun({ text: "" })]
  });
}

function blockQuote(text, attribution) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [160, 9200],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 160, type: WidthType.DXA },
            shading: { fill: ROYAL_BLUE, type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: "" })] })]
          }),
          new TableCell({
            borders: noBorders,
            width: { size: 9200, type: WidthType.DXA },
            shading: { fill: LIGHT_BLUE_BG, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 240, right: 240 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 60 },
                children: [new TextRun({ text, italics: true, size: 24, color: NAVY, font: "Arial", bold: true })]
              }),
              attribution ? new Paragraph({
                children: [new TextRun({ text: `— ${attribution}`, size: 18, color: MID_GRAY, font: "Arial" })]
              }) : new Paragraph({ children: [] })
            ]
          })
        ]
      })
    ]
  });
}

function infoRow(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        borders: cellBorders,
        width: { size: 2880, type: WidthType.DXA },
        shading: { fill: LIGHT_GRAY_BG, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: NAVY, font: "Arial" })] })]
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 6480, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 20, color: DARK_GRAY, font: "Arial" })] })]
      })
    ]
  });
}

function featureRow(icon, name, tag, desc) {
  return new TableRow({
    children: [
      new TableCell({
        borders: cellBorders,
        width: { size: 1200, type: WidthType.DXA },
        shading: { fill: LIGHT_BLUE_BG, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 120, right: 120 },
        verticalAlign: "center",
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: icon, size: 28, font: "Arial" })] })
        ]
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 8160, type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        children: [
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: name, bold: true, size: 22, color: NAVY, font: "Arial" }),
              new TextRun({ text: `  [${tag}]`, size: 18, color: ROYAL_BLUE, font: "Arial" })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 0 },
            children: [new TextRun({ text: desc, size: 20, color: DARK_GRAY, font: "Arial" })]
          })
        ]
      })
    ]
  });
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22, color: DARK_GRAY } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 200, after: 60 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            spacing: { before: 0, after: 80 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ROYAL_BLUE, space: 1 } },
            children: [
              new TextRun({ text: "NyayNow", bold: true, size: 20, color: ROYAL_BLUE, font: "Arial" }),
              new TextRun({ text: "  \u2014  Brand Overview & Feature Guide  \u2014  Confidential", size: 18, color: MID_GRAY, font: "Arial" })
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            spacing: { before: 80, after: 0 },
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR, space: 1 } },
            tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
            children: [
              new TextRun({ text: "© 2026 NyayNow Legal Tech  ·  Made with Precision in India 🇮🇳", size: 16, color: MID_GRAY, font: "Arial" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MID_GRAY, font: "Arial", tab: true })
            ]
          })
        ]
      })
    },
    children: [

      // ===== COVER =====
      new Paragraph({ spacing: { before: 1440, after: 0 }, children: [] }),

      new Paragraph({
        spacing: { before: 0, after: 40 },
        children: [new TextRun({ text: "NYAYNOW", bold: true, size: 72, color: NAVY, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 160 },
        children: [new TextRun({ text: "Brand Overview & Feature Guide", size: 32, color: ROYAL_BLUE, font: "Arial" })]
      }),

      new Paragraph({
        spacing: { before: 0, after: 320 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ROYAL_BLUE, space: 1 } },
        children: []
      }),

      new Paragraph({
        spacing: { before: 320, after: 80 },
        children: [new TextRun({ text: "The operating system for the Indian Justice System.", italics: true, size: 26, color: DARK_GRAY, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 480 },
        children: [new TextRun({ text: "Democratizing legal intelligence through institutional-grade AI.", size: 22, color: MID_GRAY, font: "Arial" })]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 3120, 3120],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: LIGHT_BLUE_BG, type: ShadingType.CLEAR },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "\uD83C\uDF10  nyaynow.in", size: 20, color: NAVY, font: "Arial", bold: true })] })
                ]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: LIGHT_BLUE_BG, type: ShadingType.CLEAR },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "\uD83D\uDCC5  Est. November 2025", size: 20, color: NAVY, font: "Arial", bold: true })] })
                ]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: LIGHT_BLUE_BG, type: ShadingType.CLEAR },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "\uD83D\uDD12  AES-256 Encrypted", size: 20, color: NAVY, font: "Arial", bold: true })] })
                ]
              })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { before: 120, after: 80 }, children: [new TextRun({ text: "\u2714  BCI Guidelines Compliant  \u00B7  DPDP 2023  \u00B7  v2.0 Beta  \u00B7  Made with Precision in India", size: 18, color: MID_GRAY, font: "Arial" })] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // ===== SECTION 1: WHO WE ARE =====
      heading1("1. Who We Are"),
      divider(ROYAL_BLUE),

      blockQuote(
        "NyayNow is building the world's most advanced legal operating system for India. We bridge the gap between complex legal systems and 1.4 billion people who deserve access to justice.",
        "About Page, nyaynow.in"
      ),

      new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

      new Paragraph({
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({ text: "NyayNow", bold: true, size: 22, color: NAVY, font: "Arial" }),
          new TextRun({ text: " is India's first AI-powered legal platform — and we mean ", size: 22, color: DARK_GRAY, font: "Arial" }),
          new TextRun({ text: "actually", italics: true, size: 22, color: DARK_GRAY, font: "Arial" }),
          new TextRun({ text: " built for India. Not a Western chatbot with an Indian flag slapped on top. We're trained on BNS, BNSS, BSA, IPC, CrPC, CPC, and every major Indian state law — from the ground up.", size: 22, color: DARK_GRAY, font: "Arial" })
        ]
      }),

      new Paragraph({
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({ text: "Here's the real problem: India has ", size: 22, color: DARK_GRAY, font: "Arial" }),
          new TextRun({ text: "1 lawyer for every 1,500 citizens", bold: true, size: 22, color: NAVY, font: "Arial" }),
          new TextRun({ text: " and ", size: 22, color: DARK_GRAY, font: "Arial" }),
          new TextRun({ text: "4.5 crore+ cases", bold: true, size: 22, color: NAVY, font: "Arial" }),
          new TextRun({ text: " clogging up the courts. Most people can't afford legal help, don't know their rights, and have zero idea where to start when trouble hits.", size: 22, color: DARK_GRAY, font: "Arial" })
        ]
      }),

      new Paragraph({
        spacing: { before: 0, after: 200 },
        children: [
          new TextRun({ text: "We put an entire legal ecosystem — AI-powered guidance, verified lawyer marketplace, courtroom simulators, emergency SOS, document drafting, and more — into one platform that anyone can use. In their own language. At a price they can actually afford.", size: 22, color: DARK_GRAY, font: "Arial" })
        ]
      }),

      heading2("What NyayNow Does", NAVY),

      new Paragraph({ spacing: { before: 40, after: 120 }, children: [new TextRun({ text: "FOR CITIZENS", bold: true, size: 18, color: ROYAL_BLUE, font: "Arial" })] }),
      bulletItem("Instant AI legal guidance in 12+ Indian languages"),
      bulletItem("Find & hire verified lawyers by specialization"),
      bulletItem("Emergency Legal SOS with panic-button protocols"),
      bulletItem("Track court cases live via eCourts integration"),
      bulletItem("Generate legal agreements & contracts in seconds"),

      new Paragraph({ spacing: { before: 160, after: 120 }, children: [new TextRun({ text: "FOR LAWYERS", bold: true, size: 18, color: INDIGO, font: "Arial" })] }),
      bulletItem("Full practice management (CRM, billing, calendar)"),
      bulletItem("Qualified leads via marketplace"),
      bulletItem("AI tools for research, drafting, case analysis"),
      bulletItem("Verified profile with performance analytics"),
      bulletItem("Video consultation & encrypted messaging"),

      sectionBreak(),

      // ===== SECTION 2: BRAND IDENTITY =====
      heading1("2. Brand Identity"),
      divider(ROYAL_BLUE),

      heading2("Logo & Mark"),
      new Paragraph({
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: "The NyayNow mark is two stylized N letterforms intertwined with the scales of justice — a monogram that communicates both identity and purpose at a glance.", size: 22, color: DARK_GRAY, font: "Arial" })]
      }),

      heading3("Colour Palette"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: "F1F5F9", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Colour", bold: true, size: 20, color: NAVY, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: "F1F5F9", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Hex", bold: true, size: 20, color: NAVY, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: "F1F5F9", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Name", bold: true, size: 20, color: NAVY, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: "F1F5F9", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Role", bold: true, size: 20, color: NAVY, font: "Arial" })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: " ", size: 20, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "#0F172A", size: 20, color: DARK_GRAY, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Navy Blue", size: 20, color: DARK_GRAY, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Primary / backgrounds", size: 20, color: DARK_GRAY, font: "Arial" })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: ROYAL_BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: " ", size: 20, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "#2563EB", size: 20, color: DARK_GRAY, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Royal Blue", size: 20, color: DARK_GRAY, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "CTAs, links, accents", size: 20, color: DARK_GRAY, font: "Arial" })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: "D4AF37", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: " ", size: 20, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "#D4AF37", size: 20, color: DARK_GRAY, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Gold", size: 20, color: DARK_GRAY, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Premium / highlights", size: 20, color: DARK_GRAY, font: "Arial" })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: INDIGO, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: " ", size: 20, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "#6366F1", size: 20, color: DARK_GRAY, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Indigo", size: 20, color: DARK_GRAY, font: "Arial" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "AI features / secondary", size: 20, color: DARK_GRAY, font: "Arial" })] })] })
            ]
          })
        ]
      }),

      heading3("Typography & Assets"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2880, 6480],
        rows: [
          infoRow("Primary Font", "Inter — all UI text, body copy"),
          infoRow("Display Font", "Plus Jakarta Sans — page headings"),
          infoRow("Feature Pages", "Playfair Display — editorial serif"),
          infoRow("Icon Library", "Lucide React — Scale, Gavel, Shield, Brain, Sparkles, Siren, etc. (80+ icons)"),
          infoRow("Logo File", "client/public/logo.png  (310 KB PNG)"),
          infoRow("Favicon", "client/public/favicon.ico"),
          infoRow("Grid Texture", "client/public/grid.svg — hero backgrounds"),
          infoRow("Noise Overlay", "client/public/noise.svg — glassmorphism effect")
        ]
      }),

      sectionBreak(),

      // ===== SECTION 3: VOICE & TONE =====
      new Paragraph({ children: [new PageBreak()] }),
      heading1("3. Voice & Tone"),
      divider(ROYAL_BLUE),

      new Paragraph({
        spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: "Our brand personality is premium, institutional, and unmistakably Indian. Think Apple meets legal tech.", size: 22, color: DARK_GRAY, font: "Arial" })]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2880, 6480],
        rows: [
          infoRow("Primary Tone", "Premium, institutional, tech-forward"),
          infoRow("Typography Style", "UPPERCASE tracking for badges; bold clean headings for impact"),
          infoRow("Power Phrases", '"Institutional-grade AI" \u00B7 "Elite" \u00B7 "Neural" \u00B7 "Flagship" \u00B7 "Democratizing" \u00B7 "Blitz Fast"'),
          infoRow("Recurring Themes", "Trust & security \u00B7 India-first \u00B7 Accessibility \u00B7 Speed"),
          infoRow("Content Pattern", "Short bold heading \u2192 explanatory subtitle \u2192 action CTA"),
          infoRow("We Never Say", '"Just a chatbot" \u00B7 "Basic" \u00B7 "Simple tool" \u2014 we\u2019re a Legal Operating System')
        ]
      }),

      heading2("Signature One-Liners"),
      new Paragraph({
        spacing: { before: 0, after: 120 },
        children: [new TextRun({ text: "These are the actual taglines used across the live platform — the voice of NyayNow.", size: 22, color: MID_GRAY, font: "Arial", italics: true })]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [720, 5760, 2880],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 720, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY_BG, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "#", bold: true, size: 18, color: NAVY, font: "Arial" })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 5760, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY_BG, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Line", bold: true, size: 18, color: NAVY, font: "Arial" })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2880, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY_BG, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Used Where", bold: true, size: 18, color: NAVY, font: "Arial" })] })] })
          ]}),
          ...([
            ["01", "Everything Law. In one place.", "Homepage Bento Grid"],
            ["02", "Instant legal answers in your language.", "Hero Section"],
            ["03", "Connect with verified lawyers.", "Hero Section"],
            ["04", "Democratizing Justice on Internet Scale.", "About Page"],
            ["05", "Built for the Modern Law Era.", "Vision Section"],
            ["06", "Powering India\u2019s Legal Future.", "Pricing Page"],
            ["07", "The Unique Legal SOS Game-Changer.", "SOS Section"],
            ["08", "Breaking the English barrier for 1.4B people.", "NyayVoice"],
            ["09", "Not a Western AI wrapped with an Indian flag \u2014 built from the ground up.", "About Page"],
            ["10", "Built fast. Built in India. Built for justice.", "Timeline"],
            ["11", "Be part of the Legal Revolution.", "About CTA"],
            ["12", "Up and running in minutes, not months.", "Professionals"],
            ["13", "Stay ahead of the curve.", "Newsletter"],
            ["14", "Made with Precision in India.", "Footer"],
            ["15", "Secure. Trusted. Affordable.", "Hero Badge"],
            ["16", "No hidden costs. No complicated tiers.", "Pricing"],
            ["17", "AI guidance, not legal advice.", "Disclaimer"],
            ["18", "Grounded in Real-Time Supreme Court & High Court Data.", "Hero"]
          ].map(([num, line, where]) => new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 720, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: num, size: 18, color: MID_GRAY, font: "Arial" })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 5760, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: `\u201C${line}\u201D`, size: 20, color: NAVY, font: "Arial", italics: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2880, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: where, size: 18, color: MID_GRAY, font: "Arial" })] })] })
          ]})))
        ]
      }),

      sectionBreak(),

      // ===== SECTION 4: FEATURES =====
      new Paragraph({ children: [new PageBreak()] }),
      heading1("4. Features — All 31, Explained"),
      divider(ROYAL_BLUE),

      new Paragraph({
        spacing: { before: 0, after: 240 },
        children: [new TextRun({ text: "Not a spec sheet. Here\u2019s what each feature actually does for real people.", size: 22, color: MID_GRAY, font: "Arial", italics: true })]
      }),

      // CAT 1
      heading2("Category 1 — Elite AI Lab"),
      new Paragraph({ spacing: { before: 0, after: 160 }, children: [new TextRun({ text: '"One Purpose. Comprehensive Legal Intelligence."', italics: true, size: 20, color: MID_GRAY, font: "Arial" })] }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1200, 8160],
        rows: [
          featureRow("\uD83E\uDD16", "NyaySathi — Smart AI Assistant", "Conversational", "Your 24/7 legal buddy. Ask anything — 'Can my landlord evict me?', 'What\u2019s Section 420 BNS?' — and get real answers with statute citations. Trained on Indian law, not generic internet data. Remembers your conversation and scopes complex issues turn-by-turn."),
          featureRow("\u2696\uFE0F", "Judge AI — Case Outcome Predictor", "Predictive", "Upload your case facts and Judge AI crunches them against 20+ years of historical rulings for a Winning Probability Score. Maps precedents, detects judicial bias patterns, calculates success margins."),
          featureRow("\uD83D\uDCD1", "Judge Pro — Document Intelligence", "Enterprise", "Got a 100-page case file? Upload it. Judge Pro uses OCR to extract timelines, spot contradictions, and hand you a strategy dossier. Enterprise-grade analysis in seconds."),
          featureRow("\uD83D\uDD0D", "Semantic Legal Research (PrecedentEngine)", "Search", "Understands the meaning of your argument and finds precedents across Supreme Court & High Court records. Neural semantic search across 5M+ judicial records — not keyword matching."),
          featureRow("\u270D\uFE0F", "Drafting Lab", "Generative", "Need a legal notice, NDA, or complaint? Generates court-ready documents in 30 seconds. Auto-generates notices, scaffolds contracts, and tailors every clause to your situation."),
          featureRow("\uD83D\uDD0E", "Legal Issue Decoder (Analyze)", "Decision Support", "Describe your situation in plain language — 'My employer hasn\u2019t paid me in 3 months' — and get a structured breakdown: Your Rights, Your Risks, What to Do Right Now."),
          featureRow("\uD83C\uDF99\uFE0F", "NyayVoice — Multilingual Voice Assistant", "Voice \u00B7 14+ Languages", "Speak in Hindi, Bengali, Tamil, Telugu, Kannada, Marathi, or more. NyayVoice understands your dialect and gives legal guidance via real-time speech. Breaking the English barrier for 1.4 billion people.")
        ]
      }),

      new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),

      // CAT 2
      heading2("Category 2 — Immersive Courtroom Practice"),
      new Paragraph({ spacing: { before: 0, after: 160 }, children: [new TextRun({ text: '"Practice, prepare, and perfect your courtroom strategy."', italics: true, size: 20, color: MID_GRAY, font: "Arial" })] }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1200, 8160],
        rows: [
          featureRow("\uD83C\uDFDB\uFE0F", "NyayCourt Battle Simulator", "Flagship \u00B7 Simulation", "Three AI agents — Prosecution, Defense, and The Bench — battle out a full courtroom simulation. Watch them cross-examine, object, and deliver a mock judgment based on your actual case facts."),
          featureRow("\u2694\uFE0F", "Courtroom Battle", "AI vs AI", "Two adversarial AI agents attack and defend your case from every angle — testing for vulnerabilities, running cross-examination, generating a mock judgment. Battle-test your defense before the real trial."),
          featureRow("\uD83C\uDF93", "Moot Court VR", "Training", "Built for law students. Practice oral arguments in a high-pressure virtual courtroom with AI sentiment analysis of your speech. Get scored on argument quality, confidence, and persuasion."),
          featureRow("\uD83D\uDE08", "Devil\u2019s Advocate", "Opponent AI", "The most aggressive legal critique AI you\u2019ll ever meet. Intentionally tears apart your argument — finding every weakness, every counter-precedent, every logical flaw — so you can fix them before your opponent does."),
          featureRow("\uD83D\uDCBC", "Career Hub & Micro-Internships", "Career", "Law students complete micro-tasks (research memos, case briefs) for real lawyers, earn points, and build a Verified Skill Ribbon — a portfolio that proves their skills."),
          featureRow("\uD83D\uDCDA", "Education Center & Blog", "Education", "Legal news, explainers, and educational articles. Complex laws simplified into plain language. Think of it as your legal newspaper — one that actually makes sense.")
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // CAT 3
      heading2("Category 3 — Emergency & Compliance"),
      new Paragraph({ spacing: { before: 0, after: 160 }, children: [new TextRun({ text: '"The Unique Legal SOS Game-Changer."', italics: true, size: 20, color: MID_GRAY, font: "Arial" })] }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1200, 8160],
        rows: [
          featureRow("\uD83C\uDD98", "Legal SOS — Emergency Panic Button", "Panic Mode", "Arrested? Police at your door? Hit the SOS button. Step 1: Instant AI triage under 5 seconds. Step 2: Your fundamental rights in your language (14+ dialects). Step 3: AI-drafted FIR ready for police submission. Plus instant advocate connection. Encrypted. Blitz Fast."),
          featureRow("\uD83D\uDCC3", "Agreement Generator", "Templates", "Rent agreements, NDAs, service contracts — pick a template, fill in details, get a legally-binding document tailored to your Indian state with correct stamp duty calculations. Instant PDF export."),
          featureRow("\uD83C\uDFDB\uFE0F", "e-Courts Live Tracker", "Live Data", "Plugs directly into India\u2019s national eCourts database. Track hearing dates, retrieve court orders the moment they\u2019re uploaded, and sync deadlines across multiple courts. No more calling the clerk."),
          featureRow("\u2705", "DigiLocker Verification", "Verified", "Every lawyer on NyayNow is verified through official government databases. DigiLocker-based identity verification (Bar Council ID + biometric) ensures you\u2019re talking to a real licensed advocate."),
          featureRow("\uD83D\uDCDC", "Legal Policy Suite", "Governance", "DPDP 2023 compliant Privacy Policy, Terms of Service, Disclaimer, and Refund Policy. Full transparency that protects both users and the platform.")
        ]
      }),

      new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),

      // CAT 4
      heading2("Category 4 — The Elite Legal Network"),
      new Paragraph({ spacing: { before: 0, after: 160 }, children: [new TextRun({ text: '"Connect with India\u2019s top 1% of legal minds. Verified, vetted, and ready to represent you."', italics: true, size: 20, color: MID_GRAY, font: "Arial" })] }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1200, 8160],
        rows: [
          featureRow("\uD83D\uDC68\u200D\u2696\uFE0F", "Lawyer Marketplace", "Marketplace", "Algolia-powered search to find the right lawyer by specialization, city, language, experience, and budget. Every listing is verified via Bar Council records. Proprietary Elite Index ranking algorithm."),
          featureRow("\uD83D\uDCCD", "Nearby Legal Radar", "Geography", "An interactive map showing courts, lawyers, and police stations around your location. Real-time distance calculation, cluster visualization, and one-tap navigation."),
          featureRow("\uD83D\uDCAC", "Encrypted Messaging", "Communication", "End-to-end encrypted real-time chat via Socket.io. Attorney-client privilege is sacred — your conversations are protected by the same encryption banks use."),
          featureRow("\uD83D\uDCF9", "Video Consultation", "Jitsi", "Jitsi-based secure HD video calls — directly in your browser. No app download, no Zoom link, no hassle. Click and talk to your lawyer face-to-face."),
          featureRow("\uD83C\uDFC6", "Verified Professional Profiles", "Identity", "Detailed performance dossiers for every verified advocate — win rates, case volume, specializations, experience timeline, LinkedIn, and skill-ribbon certifications. A reputation score, not just a directory listing.")
        ]
      }),

      new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),

      // CAT 5
      heading2("Category 5 — Operational Command"),
      new Paragraph({ spacing: { before: 0, after: 160 }, children: [new TextRun({ text: '"Full-stack practice management for modern law firms."', italics: true, size: 20, color: MID_GRAY, font: "Arial" })] }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1200, 8160],
        rows: [
          featureRow("\uD83C\uDF9B\uFE0F", "Client Dashboard (Command Hub)", "User Control", "Your personal litigation cockpit. Track all your cases, lawyer status, payment history, hearing countdowns, upcoming appointments, and documents — all in one dark-mode dashboard."),
          featureRow("\uD83D\uDCBC", "Lawyer Practice Console (LawyerOS)", "Lawyer Control", "Enterprise ERP for advocates. Manage multi-client pipelines, CRM contacts, case research folders, and automated invoice tracking. Full-stack practice management in one screen."),
          featureRow("\uD83D\uDEE1\uFE0F", "Admin Governance Panel", "Admin", "Master oversight dashboard. Platform analytics, user management, verification approvals, lawyer onboarding queues, and dispute moderation. The control tower."),
          featureRow("\uD83D\uDCCA", "Performance Analytics", "Analytics", "Deep-dive data visualizations for lawyers. Track profile traffic, search appearances, lead-to-conversion rates, and client acquisition metrics. Data-driven insights to grow your practice."),
          featureRow("\uD83D\uDCC5", "Calendar & Deadlines", "Scheduling", "Centralized hearing and filing calendar with automated reminders. Court date sync. Never miss a limitation period or response deadline again."),
          featureRow("\uD83D\uDCB3", "Razorpay Payments", "Payments", "Indian payment gateway. Tiered subscriptions (Free / Pro / Firm), secure transaction processing, invoice generation, and refund handling."),
          featureRow("\uD83D\uDCF1", "WhatsApp & SMS Alerts (Twilio)", "Notifications", "Appointment reminders, case updates, and emergency notifications — delivered straight to WhatsApp or phone."),
          featureRow("\u270D\uFE0F", "DocuSign E-Signing", "E-Sign", "Digital signatures on legal agreements. Legally binding, tamper-proof, and integrated directly into the Agreement Generator workflow.")
        ]
      }),

      sectionBreak(),

      // ===== SECTION 5: PRICING =====
      new Paragraph({ children: [new PageBreak()] }),
      heading1("5. Pricing"),
      divider(ROYAL_BLUE),

      new Paragraph({
        spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: "No hidden costs. No complicated tiers. Professional legal intelligence accessible to everyone.", size: 22, color: DARK_GRAY, font: "Arial", italics: true })]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 3120, 3120],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders, width: { size: 3120, type: WidthType.DXA },
                shading: { fill: LIGHT_BLUE_BG, type: ShadingType.CLEAR },
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "Free", bold: true, size: 32, color: NAVY, font: "Arial" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "\u20B90  / forever", size: 28, color: ROYAL_BLUE, font: "Arial", bold: true })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Essential legal help for every Indian citizen, forever.", size: 18, color: MID_GRAY, font: "Arial", italics: true })] })
                ]
              }),
              new TableCell({
                borders: { top: { style: BorderStyle.SINGLE, size: 6, color: ROYAL_BLUE }, bottom: cellBorder, left: { style: BorderStyle.SINGLE, size: 6, color: ROYAL_BLUE }, right: { style: BorderStyle.SINGLE, size: 6, color: ROYAL_BLUE } },
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: "EFF6FF", type: ShadingType.CLEAR },
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [new TextRun({ text: "\u2605 Most Popular", size: 16, color: ROYAL_BLUE, font: "Arial", bold: true })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "Pro", bold: true, size: 32, color: NAVY, font: "Arial" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "\u20B9499  / month", size: 28, color: ROYAL_BLUE, font: "Arial", bold: true })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Unlimited AI capabilities for individuals and professionals.", size: 18, color: MID_GRAY, font: "Arial", italics: true })] })
                ]
              }),
              new TableCell({
                borders: cellBorders, width: { size: 3120, type: WidthType.DXA },
                shading: { fill: CARD_BG, type: ShadingType.CLEAR },
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "Firm", bold: true, size: 32, color: NAVY, font: "Arial" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "\u20B94,999  / month", size: 28, color: ROYAL_BLUE, font: "Arial", bold: true })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Complete legal intelligence and pipeline CRM for firms.", size: 18, color: MID_GRAY, font: "Arial", italics: true })] })
                ]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 160, after: 0 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Annual billing: Save 17% (2 months free)  \u00B7  Secured by Razorpay  \u00B7  Cancel Anytime  \u00B7  DPDP 2023 Compliant", size: 18, color: MID_GRAY, font: "Arial" })]
      }),

      sectionBreak(),

      // ===== SECTION 6: TRUST & COMPLIANCE =====
      heading1("6. Trust & Compliance"),
      divider(ROYAL_BLUE),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1872, 1872, 1872, 1872, 1872],
        rows: [
          new TableRow({
            children: [
              ...([
                ["\uD83D\uDD10", "AES-256 Encrypted"],
                ["\uD83D\uDD12", "128-Bit TLS/SSL"],
                ["\u2705", "BCI Compliant"],
                ["\uD83D\uDEE1\uFE0F", "DPDP 2023"],
                ["\u2696\uFE0F", "AI Guidance Disclaimer"]
              ].map(([icon, label]) => new TableCell({
                borders: cellBorders, width: { size: 1872, type: WidthType.DXA },
                shading: { fill: NAVY, type: ShadingType.CLEAR },
                margins: { top: 160, bottom: 160, left: 120, right: 120 },
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [new TextRun({ text: icon, size: 28, font: "Arial" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: label, size: 18, color: "FFFFFF", font: "Arial", bold: true })] })
                ]
              })))
            ]
          })
        ]
      }),

      sectionBreak(),

      // ===== SECTION 7: PARTNERS =====
      heading1("7. Integrations & Partners"),
      divider(ROYAL_BLUE),

      new Paragraph({
        spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: "Integrated & aligned with trusted Indian legal initiatives.", size: 22, color: DARK_GRAY, font: "Arial" })]
      }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY_BG, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Partner / Integration", bold: true, size: 20, color: NAVY, font: "Arial" })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY_BG, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Role", bold: true, size: 20, color: NAVY, font: "Arial" })] })] })
          ]}),
          ...([
            ["e-Courts India", "Government court database integration"],
            ["Bar Council Gazette", "Lawyer verification"],
            ["NALSA", "National Legal Services Authority alignment"],
            ["NIC", "National Informatics Centre"],
            ["Supreme Court Data", "Judicial records access"],
            ["Ministry of Law & Justice", "Statutory alignment"],
            ["Razorpay", "Indian payment processing"],
            ["Twilio", "WhatsApp & SMS notifications"],
            ["DocuSign", "E-signature integration"],
            ["Jitsi", "Secure video consultation"],
            ["Algolia", "Lawyer search & indexing"],
            ["DigiLocker", "Identity & Bar Council verification"]
          ].map(([name, role]) => new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: name, size: 20, color: DARK_GRAY, font: "Arial", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: role, size: 20, color: DARK_GRAY, font: "Arial" })] })] })
          ]})))
        ]
      }),

      sectionBreak(),

      // ===== SECTION 8: CONTACT =====
      heading1("8. Contact & Social"),
      divider(ROYAL_BLUE),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2880, 6480],
        rows: [
          infoRow("Website", "nyaynow.in"),
          infoRow("Email", "nyaynow.in@gmail.com"),
          infoRow("Twitter / X", "@NyayNow"),
          infoRow("LinkedIn", "NyayNow Legal Tech"),
          infoRow("Instagram", "@NyayNow"),
          infoRow("GitHub", "github.com/dhruvkumar2107/NyayNow")
        ]
      }),

      sectionBreak(),

      // ===== DISCLAIMER =====
      divider(BORDER_COLOR),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({ text: "\u2696\uFE0F  Disclaimer: ", bold: true, size: 18, color: MID_GRAY, font: "Arial" }),
          new TextRun({ text: "NyayNow provides AI-generated legal information grounded in BNS (2024), not professional legal advice. Always verify case details and drafts with a qualified advocate before taking legal action.", size: 18, color: MID_GRAY, font: "Arial", italics: true })
        ]
      })

    ]
  }]
});

// Save document
const outputPath = path.join(__dirname, 'docs', 'NYAYNOW_BRAND_OVERVIEW.docx');
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document saved successfully to ${outputPath}`);
}).catch((err) => {
  console.error("Error generating document:", err);
});
