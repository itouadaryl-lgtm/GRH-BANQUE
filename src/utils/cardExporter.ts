/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Parses and translates oklch and oklab color definition strings in CSS rules
 * into compatible standard hsl/hsla representation supported by html2canvas.
 */
function replaceOklchAndOklab(cssText: string): string {
  if (!cssText || typeof cssText !== "string") return cssText;
  
  const oklchRegex = /oklch\(\s*([^,\s/)]+)[,\s/]+([^,\s/)]+)[,\s/]+([^,\s/)]+)(?:\s*[,\s/]+\s*([^,\s/)]+))?\s*\)/gi;
  const oklabRegex = /oklab\(\s*([^,\s/)]+)[,\s/]+([^,\s/)]+)[,\s/]+([^,\s/)]+)(?:\s*[,\s/]+\s*([^,\s/)]+))?\s*\)/gi;

  let cleaned = cssText;

  cleaned = cleaned.replace(oklchRegex, (match, lStr, cStr, hStr, aStr) => {
    try {
      let l = parseFloat(lStr);
      let c = parseFloat(cStr);
      let h = parseFloat(hStr);
      
      if (lStr.includes('%')) l = parseFloat(lStr) / 100;
      if (cStr.includes('%')) c = parseFloat(cStr) / 100;
      
      if (isNaN(l)) l = 0;
      if (isNaN(c)) c = 0;
      if (isNaN(h)) h = 0;
      
      const sPercent = Math.min(100, Math.max(0, Math.round(c * 250)));
      const lPercent = Math.min(100, Math.max(0, Math.round(l * 100)));
      
      if (aStr) {
        return `hsla(${Math.round(h)}, ${sPercent}%, ${lPercent}%, ${aStr})`;
      } else {
        return `hsl(${Math.round(h)}, ${sPercent}%, ${lPercent}%)`;
      }
    } catch (_) {
      return "rgb(15, 23, 42)";
    }
  });

  cleaned = cleaned.replace(oklabRegex, (match, lStr, aStr, bStr, alphaStr) => {
    try {
      let l = parseFloat(lStr);
      let a = parseFloat(aStr);
      let b = parseFloat(bStr);
      
      if (lStr.includes('%')) l = parseFloat(lStr) / 100;
      
      if (isNaN(l)) l = 0;
      if (isNaN(a)) a = 0;
      if (isNaN(b)) b = 0;
      
      const c = Math.sqrt(a * a + b * b);
      let h = Math.atan2(b, a) * (180 / Math.PI);
      if (h < 0) h += 360;
      
      const hVal = isNaN(h) ? 0 : Math.round(h);
      const sPercent = Math.min(100, Math.max(0, Math.round(c * 250)));
      const lPercent = Math.min(100, Math.max(0, Math.round(l * 100)));
      
      if (alphaStr) {
        return `hsla(${hVal}, ${sPercent}%, ${lPercent}%, ${alphaStr})`;
      } else {
        return `hsl(${hVal}, ${sPercent}%, ${lPercent}%)`;
      }
    } catch (_) {
      return "rgb(15, 23, 42)";
    }
  });

  return cleaned;
}

/**
 * A highly sophisticated style-override runner that intercepts 'oklch()' and 'oklab()' color styles.
 * It dynamically overrides window.getComputedStyle, cleans all active document <style> elements 
 * and linked stylesheets during the snapshot phase to convert modern css v4 colors into compatible HSL/RGB values that html2canvas supports.
 */
async function runWithStylePatch<T>(callback: () => Promise<T>): Promise<T> {
  const originalGetComputedStyle = window.getComputedStyle;
  
  // Set up getComputedStyle Proxy interceptor to catch any direct style queries during cloning
  window.getComputedStyle = function(el, pseudo) {
    const style = originalGetComputedStyle(el, pseudo);
    
    return new Proxy(style, {
      get(target, prop) {
        if (prop === 'getPropertyValue') {
          return (val: string) => {
            const originalValue = target.getPropertyValue(val);
            if (originalValue && typeof originalValue === 'string' && (originalValue.includes('oklch') || originalValue.includes('oklab'))) {
              if (val.includes('shadow')) {
                return "none"; // Disable unsupported gradient shadows which cause parsing issues
              }
              return replaceOklchAndOklab(originalValue);
            }
            return originalValue;
          };
        }
        
        const value = (target as any)[prop];
        if (typeof value === 'string' && (value.includes('oklch') || value.includes('oklab'))) {
          const propName = String(prop).toLowerCase();
          if (propName.includes('shadow')) {
            return "none";
          }
          return replaceOklchAndOklab(value);
        }
        
        if (typeof value === 'function') {
          return value.bind(target);
        }
        
        return value;
      }
    }) as any;
  };

  // Find all active linked stylesheets on the page
  const linkTags = Array.from(document.querySelectorAll("link[rel='stylesheet']")) as HTMLLinkElement[];
  const activeStylesToInject: string[] = [];
  const successfullyPatchedLinks: HTMLLinkElement[] = [];

  for (const link of linkTags) {
    try {
      const res = await fetch(link.href);
      if (res.ok) {
        const cssText = await res.text();
        const cleanedText = replaceOklchAndOklab(cssText);
        activeStylesToInject.push(cleanedText);
        successfullyPatchedLinks.push(link);
      }
    } catch (e) {
      console.warn("Failed to fetch/patch link stylesheet:", e);
    }
  }

  // Disable ONLY successfully patched links to make sure html2canvas parses only our oklch-free injected rules
  successfullyPatchedLinks.forEach(link => {
    link.disabled = true;
  });

  const injectedStyleEls: HTMLStyleElement[] = [];
  for (const css of activeStylesToInject) {
    const styleEl = document.createElement("style");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    injectedStyleEls.push(styleEl);
  }

  // Temporarily patch all inline <style> blocks content of active stylesheet variables/definitions
  const styleTags = Array.from(document.querySelectorAll("style"));
  const styleBackups = styleTags.map(tag => ({
    tag,
    originalText: tag.textContent || ""
  }));

  for (const backup of styleBackups) {
    // Skip style blocks that we injected ourselves
    if (injectedStyleEls.includes(backup.tag)) continue;
    if (backup.originalText && (backup.originalText.includes("oklch") || backup.originalText.includes("oklab"))) {
      backup.tag.textContent = replaceOklchAndOklab(backup.originalText);
    }
  }

  try {
    return await callback();
  } catch (error) {
    console.error("Callback failed inside style patch:", error);
    throw error;
  } finally {
    // Restore window getComputedStyle
    window.getComputedStyle = originalGetComputedStyle;
    
    // Re-enable patched stylesheet link elements
    successfullyPatchedLinks.forEach(link => {
      link.disabled = false;
    });

    // Remove our injected clean stylesheets
    injectedStyleEls.forEach(el => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });

    // Restore original <style> tag content
    for (const backup of styleBackups) {
      if (injectedStyleEls.includes(backup.tag)) continue;
      backup.tag.textContent = backup.originalText;
    }
  }
}

/**
 * Triggers a premium system print window for the card badge, hiding extraneous UI.
 */
export function printCardElement() {
  const isSandboxed = window.self !== window.top;
  
  if (isSandboxed) {
    alert("Info d'Accès de l'Applet :\nL'application s'exécute actuellement dans un iframe d'aperçu sécurisé. Le navigateur bloque le dialogue d'impression automatique.\n\nCONSEIL PREMIUM : Veuillez cliquer sur 'Télécharger PDF HD' pour exporter immédiatement la carte d'accréditation en haute fidélité, ou ouvrez l'application dans un nouvel onglet pour utiliser la fonction d'impression.");
  }

  const frontEl = document.getElementById("gab-card-front");
  const backEl = document.getElementById("gab-card-back");
  
  if (!frontEl || !backEl) {
    console.error("Card front/back elements not found in DOM");
    return;
  }

  // Use a temporary print iframe to avoid styling conflicts has been successfully evaluated
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.zIndex = "-999";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`
    <html>
      <head>
        <title>Carte d'Accréditation Bancaire - AFG Bank Gabon</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          body {
            background-color: #ffffff !important;
            color: #1e293b !important;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 90vh;
            margin: 0;
            padding: 20px;
          }
          .title-text {
            font-size: 14px;
            font-weight: 800;
            color: #0052CC;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 25px;
            text-align: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
            width: 100%;
            max-width: 450px;
          }
          .cards-container {
            display: flex;
            flex-direction: column;
            gap: 30px;
            align-items: center;
          }
          .card-box {
            width: 85.6mm;
            height: 53.98mm;
            border-radius: 4.5mm;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            border: 1px solid #cbd5e1;
            transform-origin: top center;
            page-break-inside: avoid;
            background: #ffffff;
          }
          .card-box.dark {
            background: #0f172a;
          }
          .guidelines {
            font-size: 9px;
            color: #94a3b8;
            margin-top: 6px;
            font-style: italic;
            text-align: center;
          }
          .print-meta {
            margin-top: 40px;
            font-size: 8px;
            font-family: monospace;
            color: #64748b;
            text-align: center;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="title-text">AFG BANK GABON - CARTE PROFESSIONNELLE</div>
        <div class="cards-container">
          <div>
            <div class="card-box">${frontEl.outerHTML}</div>
            <div class="guidelines">▲ Recto (Vues d'agence nationale)</div>
          </div>
          <div>
            <div class="card-box dark">${backEl.outerHTML}</div>
            <div class="guidelines">▲ Verso (Hologrammes & code-barres de conformité)</div>
          </div>
        </div>
        <div class="print-meta">
          Accréditation Émise le ${new Date().toLocaleDateString("fr-FR")} - Soumise aux contrôles de conformité COBAC
        </div>
        <script>
          window.addEventListener('load', () => {
            setTimeout(() => {
              window.focus();
              try {
                window.print();
              } catch(e) {
                console.error("Iframe print blocked under sandbox policy", e);
              }
              setTimeout(() => {
                window.parent.document.body.removeChild(window.frameElement);
              }, 1000);
            }, 1000);
          });
        </script>
      </body>
    </html>
  `);
  doc.close();
}

/**
 * Downloads the card in high-definition premium PDF format
 */
export async function downloadCardAsPDF(employeeName: string): Promise<boolean> {
  const frontEl = document.getElementById("gab-card-front");
  const backEl = document.getElementById("gab-card-back");

  if (!frontEl || !backEl) {
    console.error("Elements for canvas snap not found in document");
    return false;
  }

  try {
    const options = {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
    };

    // Snapshot front and back with the system oklch computed-style convertor patch applied
    const { imgDataFront, imgDataBack } = await runWithStylePatch(async () => {
      const canvasFront = await html2canvas(frontEl, options);
      const canvasBack = await html2canvas(backEl, options);
      return {
        imgDataFront: canvasFront.toDataURL("image/png", 1.0),
        imgDataBack: canvasBack.toDataURL("image/png", 1.0)
      };
    });

    // standard A4 size is 210 x 297 mm
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const safeName = employeeName.toUpperCase().replace(/[^a-zA-Z0-9]/g, "_");

    // Header Info in Premium Corporate Grid
    doc.setDrawColor(0, 82, 204);
    doc.setLineWidth(1);
    doc.line(15, 20, 195, 20);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 82, 204);
    doc.text("AFG BANK GABON", 15, 15);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`EXPO DU ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`, 145, 15);

    // Coordinates for standard ISO credit card size: 85.6mm x 53.98mm
    const cardWidth = 85.6;
    const cardHeight = 53.98;

    // Centered horizontally: (210 - 85.6) / 2 = 62.2 mm
    const xPos = 62.2;

    // Title Block
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`CARTE PROFESSIONNELLE DE MULTI-RÉSEAU - ${employeeName.toUpperCase()}`, 15, 28);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Impression certifiée conforme aux normes d'habilitation et d'encodage COBAC / CEMAC.", 15, 33);

    // Front stacked top
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(0, 82, 204);
    doc.text("FACE AVANT (RECTO) : POLYCARBONATE SÉCURISÉ", xPos, 45);
    doc.addImage(imgDataFront, "PNG", xPos, 48, cardWidth, cardHeight, "", "FAST");

    // Separator line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(30, 115, 180, 115);

    // Back stacked bottom
    doc.text("FACE ARRIÈRE (VERSO) : ZONE DE LECTURE AUTOMATIQUE & ENCRYPTAGES", xPos, 125);
    doc.addImage(imgDataBack, "PNG", xPos, 128, cardWidth, cardHeight, "", "FAST");

    // Secure Footnote
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 200, 195, 200);

    doc.setFont("Courier", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("FILIGRANE DE SÉCURITÉ GABON - CERTIFICAT ÉMIS PAR LA DIRECTION DES SYSTÈMES D'INFORMATION", 15, 206);
    doc.text("Toutes altérations ou mauvaises utilisations de cette carte d'habilitation annuleront les accès GED d'office.", 15, 210);

    doc.save(`Carte_Professionnelle_${safeName}.pdf`);
    return true;
  } catch (error: any) {
    console.error("Error generating premium high definition PDF:", error);
    throw new Error(error?.message || "Erreur de génération PDF due au traitement d'image.");
  }
}

/**
 * Downloads the card front & back as high resolution individual images or merged single canvas image
 */
export async function downloadCardAsMergedPNG(employeeName: string): Promise<boolean> {
  const frontEl = document.getElementById("gab-card-front");
  const backEl = document.getElementById("gab-card-back");

  if (!frontEl || !backEl) {
    console.error("Elements for canvas snap not found in document");
    return false;
  }

  try {
    const options = {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
    };

    const { canvasFront, canvasBack } = await runWithStylePatch(async () => {
      const cFront = await html2canvas(frontEl, options);
      const cBack = await html2canvas(backEl, options);
      return { canvasFront: cFront, canvasBack: cBack };
    });

    // Merge onto one gorgeous visual board with gap
    const mergedCanvas = document.createElement("canvas");
    const gap = 40;
    
    // Total dimensions
    mergedCanvas.width = canvasFront.width + gap * 2;
    mergedCanvas.height = canvasFront.height + canvasBack.height + gap * 3;

    const ctx = mergedCanvas.getContext("2d");
    if (!ctx) return false;

    // Fill white backdrop
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, mergedCanvas.width, mergedCanvas.height);

    // Add visual title
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText("AFG BANK GABON", gap, gap + 15);
    
    ctx.font = "italic 18px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Accréditation d'Habilitation Professionnelle", gap, gap + 45);

    // Draw Front
    ctx.drawImage(canvasFront, gap, gap * 2 + 30);
    // Draw caption
    ctx.font = "16px monospace";
    ctx.fillStyle = "#0052CC";
    ctx.fillText("▲ RECTO (FACE AVANT)", gap, gap * 2 + 20);

    // Draw Back
    const backY = gap * 2 + 50 + canvasFront.height;
    ctx.drawImage(canvasBack, gap, backY + 30);
    ctx.font = "16px monospace";
    ctx.fillStyle = "#10b981";
    ctx.fillText("▲ VERSO (CHIP & ZONE DE LECTURE)", gap, backY + 20);

    // Footer signature
    ctx.font = "14px monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`ID standard: ${employeeName.toUpperCase()}`, gap, mergedCanvas.height - gap);

    // Trigger download
    const dataUrl = mergedCanvas.toDataURL("image/png", 1.0);
    const downloadLink = document.createElement("a");
    const safeName = employeeName.toUpperCase().replace(/[^a-zA-Z0-9]/g, "_");
    
    downloadLink.href = dataUrl;
    downloadLink.download = `Carte_Polycarbonate_${safeName}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    return true;
  } catch (error: any) {
    console.error("Error exporting to PNG board:", error);
    throw new Error(error?.message || "Erreur d'exportation PNG due au traitement d'image.");
  }
}
