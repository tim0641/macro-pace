import { Injectable, OnModuleInit } from '@nestjs/common';
import { SearchFoodsDto } from './dto/search-foods.dto';
import { getCiqualFoods, CiqualFood } from './ciqual-data';

export type ExternalFood = {
  source: 'ciqual';
  externalId: string;
  name: string;
  brand: string | null;
  kcal100g: number;
  protein100g: number;
  carbs100g: number;
  fat100g: number;
  score?: number;
  dataType?: string;
};

@Injectable()
export class FoodsService implements OnModuleInit {
  private ciqualFoods: CiqualFood[] = [];

  onModuleInit() {
    // Charger les données Ciqual au démarrage du module
    this.ciqualFoods = getCiqualFoods();
  }

  async search(searchDto: SearchFoodsDto) {
    const { query, limit = 20 } = searchDto;
    const q = query?.trim().toLowerCase();

    // Recharger si nécessaire (pour développement)
    if (this.ciqualFoods.length === 0) {
      this.ciqualFoods = getCiqualFoods();
    }

    const score = (food: CiqualFood) => {
      if (!q) return 1;
      const name = food.name.toLowerCase();
      let s = 0;
      if (name.startsWith(q)) s += 100;
      else if (name.includes(q)) s += 60;
      // Bonus léger pour les noms plus courts
      s += Math.max(0, 20 - Math.min(20, name.length / 5));
      return s;
    };

    const filtered = this.ciqualFoods
      .map((f) => ({ food: f, score: score(f) }))
      .filter((x) => x.score > 0 || !q)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map<ExternalFood>(({ food, score }) => ({
        source: 'ciqual',
        externalId: food.code,
        name: food.name,
        brand: food.brand ?? null,
        kcal100g: food.kcal100g,
        protein100g: food.protein100g,
        carbs100g: food.carbs100g,
        fat100g: food.fat100g,
        score,
        dataType: 'ciqual',
      }));

    return filtered;
  }
}
