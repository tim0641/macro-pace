// Source: Table Ciqual (ANSES) – Chargement depuis un fichier JSON/CSV/XLS/XLSX
// Téléchargez le fichier Ciqual depuis https://ciqual.anses.fr/
// Placez-le dans backend/data/ciqual.json, ciqual.csv, ciqual.xls ou ciqual.xlsx

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

export type CiqualFood = {
  code: string;
  name: string;
  brand?: string | null;
  kcal100g: number;
  protein100g: number;
  carbs100g: number;
  fat100g: number;
};

let CIQUAL_FOODS_CACHE: CiqualFood[] | null = null;

function parseCiqualValue(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  return isNaN(num) ? 0 : num;
}

function loadCiqualFromJson(filePath: string): CiqualFood[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Support différents formats JSON possibles
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        code: String(item.code || item.alim_code || item.id || ''),
        name: String(item.name || item.alim_nom_fr || item.libelle || ''),
        brand: item.brand || item.marque || null,
        kcal100g: parseCiqualValue(item.kcal100g || item['Energie, Règlement UE N° 1169/2011 (kcal/100g)'] || item.energie_kcal_100g),
        protein100g: parseCiqualValue(item.protein100g || item['Protéines (g/100g)'] || item.proteines_100g),
        carbs100g: parseCiqualValue(item.carbs100g || item['Glucides (g/100g)'] || item.glucides_100g),
        fat100g: parseCiqualValue(item.fat100g || item['Lipides (g/100g)'] || item.lipides_100g),
      })).filter((f: CiqualFood) => f.code && f.name);
    }
    
    return [];
  } catch (error) {
    console.error(`Erreur lors du chargement de ${filePath}:`, error);
    return [];
  }
}

function loadCiqualFromCsv(filePath: string): CiqualFood[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return [];
    
    // Détection des colonnes (header)
    const header = lines[0].split(';').map((h) => h.trim().toLowerCase());
    const codeIdx = header.findIndex((h) => h.includes('code') || h.includes('alim_code'));
    const nameIdx = header.findIndex((h) => h.includes('nom') || h.includes('libelle') || h.includes('name'));
    
    // Recherche de la colonne kcal en excluant explicitement kJ
    const kcalIdx = header.findIndex((h) => {
      const hasKcal = h.includes('kcal') || h.includes('kcal/100g');
      const hasEnergie = h.includes('energie');
      const isNotKj = !h.includes('kj') && !h.includes('kj/100g');
      // Priorité aux colonnes avec "kcal", sinon "energie" si pas kJ
      return (hasKcal || (hasEnergie && isNotKj));
    });
    
    const proteinIdx = header.findIndex((h) => h.includes('proteine') || h.includes('protein'));
    const carbsIdx = header.findIndex((h) => h.includes('glucide') || h.includes('carb'));
    const fatIdx = header.findIndex((h) => h.includes('lipide') || h.includes('fat'));
    
    const foods: CiqualFood[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';').map((c) => c.trim());
      if (cols.length < Math.max(codeIdx, nameIdx, kcalIdx, proteinIdx, carbsIdx, fatIdx) + 1) continue;
      
      const code = codeIdx >= 0 ? cols[codeIdx] : '';
      const name = nameIdx >= 0 ? cols[nameIdx] : '';
      if (!code || !name) continue;
      
      foods.push({
        code,
        name,
        brand: null,
        kcal100g: parseCiqualValue(kcalIdx >= 0 ? cols[kcalIdx] : 0),
        protein100g: parseCiqualValue(proteinIdx >= 0 ? cols[proteinIdx] : 0),
        carbs100g: parseCiqualValue(carbsIdx >= 0 ? cols[carbsIdx] : 0),
        fat100g: parseCiqualValue(fatIdx >= 0 ? cols[fatIdx] : 0),
      });
    }
    
    return foods;
  } catch (error) {
    console.error(`Erreur lors du chargement CSV de ${filePath}:`, error);
    return [];
  }
}

function loadCiqualFromExcel(filePath: string): CiqualFood[] {
  try {
    // Support .xls (BIFF) et .xlsx
    const workbook = XLSX.readFile(filePath, { type: 'file', cellDates: false, cellNF: false });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      console.error('[Ciqual] Aucune feuille trouvée dans le fichier Excel');
      return [];
    }
    
    // sheet_to_json avec header sur la première ligne (les clés = valeurs de la 1ère ligne)
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' }) as any[];
    
    if (data.length === 0) {
      console.error('[Ciqual] Aucune ligne de données dans la feuille Excel');
      return [];
    }
    
    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    console.log(`[Ciqual] Nombre de lignes: ${data.length}, colonnes détectées (5 premières): ${keys.slice(0, 5).join(', ')}`);
    
    // Log toutes les colonnes contenant "energie" ou "kcal" pour debug
    const energieCols = keys.filter((k) => {
      const kNorm = String(k).trim().toLowerCase();
      return kNorm.includes('energie') || kNorm.includes('kcal') || kNorm.includes('kj');
    });
    if (energieCols.length > 0) {
      console.log(`[Ciqual] Colonnes énergie trouvées: ${energieCols.join(', ')}`);
    }
    
    const findKey = (patterns: string[]): string | null => {
      for (const pattern of patterns) {
        const found = keys.find((k) => {
          const kNorm = String(k).trim().toLowerCase();
          const pNorm = pattern.toLowerCase();
          return kNorm.includes(pNorm) || kNorm.replace(/\s/g, '').includes(pNorm.replace(/\s/g, ''));
        });
        if (found) return found;
      }
      return null;
    };
    
    // Fonction spéciale pour trouver la colonne kcal en excluant explicitement kJ
    const findKcalKey = (): string | null => {
      // Priorité 1: colonnes contenant explicitement "kcal" ou "kcal/100g"
      const kcalPatterns = [
        'kcal/100g',
        'kcal',
        'energie (kcal/100g)',
        'energie, règlement ue n° 1169/2011 (kcal/100g)',
        'règlement ue',
        '1169/2011',
      ];
      
      for (const pattern of kcalPatterns) {
        const found = keys.find((k) => {
          const kNorm = String(k).trim().toLowerCase();
          const pNorm = pattern.toLowerCase();
          // Doit contenir le pattern ET ne pas contenir "kj" ou "kj/100g"
          const matches = kNorm.includes(pNorm) || kNorm.replace(/\s/g, '').includes(pNorm.replace(/\s/g, ''));
          const isNotKj = !kNorm.includes('kj') && !kNorm.includes('kj/100g');
          return matches && isNotKj;
        });
        if (found) return found;
      }
      
      // Priorité 2: colonnes "energie" mais seulement si elles ne contiennent pas "kj"
      const energieFound = keys.find((k) => {
        const kNorm = String(k).trim().toLowerCase();
        return kNorm.includes('energie') && !kNorm.includes('kj') && !kNorm.includes('kj/100g');
      });
      if (energieFound) return energieFound;
      
      return null;
    };
    
    // Noms de colonnes Ciqual (ANES) possibles
    const codeKey = findKey(['alim_code', 'code', 'id']) || keys[0];
    const nameKey = findKey(['alim_nom_fr', 'nom', 'libelle', 'name', 'aliment']) || keys[1];
    const kcalKey = findKcalKey();
    const proteinKey = findKey(['protéines', 'proteines', 'protein', 'protéines (g/100g)']);
    const carbsKey = findKey(['glucides', 'glucide', 'carb', 'glucides (g/100g)']);
    const fatKey = findKey(['lipides', 'lipide', 'fat', 'lipides (g/100g)']);
    
    if (!nameKey || !codeKey) {
      console.error(`[Ciqual] Colonnes code/nom non trouvées. Clés: ${keys.join(', ')}`);
      return [];
    }
    
    const foods: CiqualFood[] = [];
    for (const row of data) {
      const code = String(row[codeKey] ?? '').trim();
      const name = String(row[nameKey] ?? '').trim();
      if (!code || !name) continue;
      // Ignorer la ligne d'en-tête si elle repasse (ex: "alim_code" comme valeur)
      if (name.toLowerCase() === 'alim_nom_fr' || name === 'Nom du produit' || code.toLowerCase() === 'alim_code') continue;
      
      foods.push({
        code,
        name,
        brand: row.marque || row.brand || null,
        kcal100g: parseCiqualValue(kcalKey ? row[kcalKey] : 0),
        protein100g: parseCiqualValue(proteinKey ? row[proteinKey] : 0),
        carbs100g: parseCiqualValue(carbsKey ? row[carbsKey] : 0),
        fat100g: parseCiqualValue(fatKey ? row[fatKey] : 0),
      });
    }
    
    if (kcalKey) {
      const kcalKeyNorm = String(kcalKey).toLowerCase();
      if (kcalKeyNorm.includes('kj')) {
        console.warn(`[Ciqual] ⚠️ ATTENTION: La colonne détectée "${kcalKey}" contient "kJ" au lieu de "kcal" !`);
      } else {
        console.log(`[Ciqual] ✅ Colonne kcal détectée: "${kcalKey}"`);
      }
    } else {
      console.warn(`[Ciqual] ⚠️ Aucune colonne kcal trouvée. Colonnes disponibles: ${keys.join(', ')}`);
    }
    
    console.log(`[Ciqual] ${foods.length} aliments parsés depuis Excel (code: ${codeKey}, nom: ${nameKey}, kcal: ${kcalKey || 'n/a'})`);
    return foods;
  } catch (error) {
    console.error(`Erreur lors du chargement Excel de ${filePath}:`, error);
    return [];
  }
}

/** Répertoire data: priorité au cwd (backend/) puis __dirname (dist/foods) */
function getDataDir(): string {
  const fromCwd = path.join(process.cwd(), 'data');
  const fromDirname = path.join(__dirname, '../../data');
  if (fs.existsSync(fromCwd)) return fromCwd;
  return fromDirname;
}

export function loadCiqualData(): CiqualFood[] {
  if (CIQUAL_FOODS_CACHE !== null) {
    return CIQUAL_FOODS_CACHE;
  }
  
  const dataDir = getDataDir();
  const jsonPath = path.join(dataDir, 'ciqual.json');
  const csvPath = path.join(dataDir, 'ciqual.csv');
  const xlsPath = path.join(dataDir, 'ciqual.xls');
  const xlsxPath = path.join(dataDir, 'ciqual.xlsx');
  
  // Log pour debug
  console.log(`[Ciqual] Répertoire data: ${dataDir} (existe: ${fs.existsSync(dataDir)})`);
  console.log(`[Ciqual] ciqual.xls existe: ${fs.existsSync(xlsPath)}, ciqual.xlsx: ${fs.existsSync(xlsxPath)}, ciqual.json: ${fs.existsSync(jsonPath)}`);
  
  let foods: CiqualFood[] = [];
  
  if (fs.existsSync(jsonPath)) {
    console.log(`📦 Chargement Ciqual depuis ${jsonPath}`);
    foods = loadCiqualFromJson(jsonPath);
  } else if (fs.existsSync(xlsxPath)) {
    console.log(`📦 Chargement Ciqual depuis ${xlsxPath}`);
    foods = loadCiqualFromExcel(xlsxPath);
  } else if (fs.existsSync(xlsPath)) {
    console.log(`📦 Chargement Ciqual depuis ${xlsPath}`);
    foods = loadCiqualFromExcel(xlsPath);
  } else if (fs.existsSync(csvPath)) {
    console.log(`📦 Chargement Ciqual depuis ${csvPath}`);
    foods = loadCiqualFromCsv(csvPath);
  } else {
    console.warn(`⚠️  Aucun fichier Ciqual trouvé dans ${dataDir}. Utilisation des données d'exemple.`);
    // Fallback sur des exemples
    foods = [
      {
        code: '1001',
        name: 'Poulet, blanc, cuit',
        brand: null,
        kcal100g: 165,
        protein100g: 31,
        carbs100g: 0,
        fat100g: 3.6,
      },
      {
        code: '1002',
        name: 'Riz blanc, cuit',
        brand: null,
        kcal100g: 130,
        protein100g: 2.7,
        carbs100g: 28,
        fat100g: 0.3,
      },
    ];
  }
  
  CIQUAL_FOODS_CACHE = foods;
  console.log(`✅ ${foods.length} aliments Ciqual chargés`);
  return foods;
}

export function getCiqualFoods(): CiqualFood[] {
  return loadCiqualData();
}

