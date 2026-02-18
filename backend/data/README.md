# Données Ciqual

Placez ici votre fichier Ciqual complet pour charger toutes les données nutritionnelles.

## Téléchargement

1. Allez sur https://ciqual.anses.fr/
2. Téléchargez le fichier Excel (.xls ou .xlsx) complet de la table Ciqual
3. Placez-le dans ce dossier sous le nom `ciqual.xls` ou `ciqual.xlsx`

**Note** : Les formats JSON et CSV sont également supportés si vous préférez les convertir.

## Formats supportés

### Excel (`ciqual.xls` ou `ciqual.xlsx`) ⭐ **Recommandé**
Le système détecte automatiquement les colonnes dans la première feuille du fichier Excel. Il cherche les colonnes contenant :
- `code`, `alim_code`, ou `id` → identifiant
- `nom`, `libelle`, `name`, ou `alim_nom_fr` → nom de l'aliment
- `energie`, `kcal`, `Energie, Règlement UE N° 1169/2011 (kcal/100g)`, ou `energie_kcal_100g` → calories
- `proteine`, `protein`, `Protéines (g/100g)`, ou `proteines_100g` → protéines
- `glucide`, `carb`, `Glucides (g/100g)`, ou `glucides_100g` → glucides
- `lipide`, `fat`, `Lipides (g/100g)`, ou `lipides_100g` → lipides

### JSON (`ciqual.json`)
Le fichier doit être un tableau d'objets. Le système détecte automatiquement les colonnes suivantes :
- `code`, `alim_code`, ou `id` → identifiant
- `name`, `alim_nom_fr`, ou `libelle` → nom de l'aliment
- `kcal100g`, `Energie, Règlement UE N° 1169/2011 (kcal/100g)`, ou `energie_kcal_100g` → calories
- `protein100g`, `Protéines (g/100g)`, ou `proteines_100g` → protéines
- `carbs100g`, `Glucides (g/100g)`, ou `glucides_100g` → glucides
- `fat100g`, `Lipides (g/100g)`, ou `lipides_100g` → lipides

### CSV (`ciqual.csv`)
Le fichier doit utiliser le séparateur `;` et contenir des colonnes avec ces noms (insensible à la casse) :
- Colonne contenant `code` ou `alim_code`
- Colonne contenant `nom`, `libelle`, ou `name`
- Colonne contenant `energie` ou `kcal`
- Colonne contenant `proteine` ou `protein`
- Colonne contenant `glucide` ou `carb`
- Colonne contenant `lipide` ou `fat`

## Exemple de structure JSON

```json
[
  {
    "code": "1001",
    "name": "Poulet, blanc, cuit",
    "kcal100g": 165,
    "protein100g": 31,
    "carbs100g": 0,
    "fat100g": 3.6
  }
]
```

## Note

Si aucun fichier n'est trouvé, le système utilisera des données d'exemple limitées.
