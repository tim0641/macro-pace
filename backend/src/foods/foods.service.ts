import { BadGatewayException, Injectable } from '@nestjs/common';
import { SearchFoodsDto } from './dto/search-foods.dto';

type UsdaFoodNutrient = {
  nutrientId?: number;
  nutrientName?: string;
  value?: number;
  unitName?: string;
};

type UsdaSearchFood = {
  fdcId: number;
  description: string;
  brandName?: string;
  dataType?: string;
  score?: number;
  foodNutrients?: UsdaFoodNutrient[];
};

type UsdaSearchResponse = {
  foods: UsdaSearchFood[];
};

export type ExternalFood = {
  source: 'usda';
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
export class FoodsService {
  async search(searchDto: SearchFoodsDto) {
    const { query, limit = 20 } = searchDto;
    const q = query?.trim();

    if (!q) {
      return [];
    }

    const apiKey = process.env.USDA_FDC_API_KEY || 'DEMO_KEY';
    const baseUrl = process.env.USDA_FDC_BASE_URL || 'https://api.nal.usda.gov/fdc/v1';

    const url =
      `${baseUrl}/foods/search` +
      `?api_key=${encodeURIComponent(apiKey)}` +
      `&query=${encodeURIComponent(q)}` +
      `&pageSize=${encodeURIComponent(String(Math.min(limit, 50)))}`;

    const pick = (nutrients: UsdaFoodNutrient[] | undefined, opts: { ids: number[]; names: string[] }) => {
      if (!nutrients) return 0;
      const byId = nutrients.find((n) => n.nutrientId != null && opts.ids.includes(n.nutrientId));
      if (byId?.value != null) return Number(byId.value);

      const byName = nutrients.find((n) => {
        const name = (n.nutrientName ?? '').toLowerCase();
        return opts.names.some((x) => name.includes(x));
      });
      if (byName?.value != null) return Number(byName.value);

      return 0;
    };

    let data: UsdaSearchResponse;
    try {
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        throw new Error(`USDA response ${res.status}`);
      }
      data = (await res.json()) as UsdaSearchResponse;
    } catch (e) {
      throw new BadGatewayException('Impossible de joindre la base USDA FoodData Central');
    }

    const foods: ExternalFood[] = (data.foods ?? []).slice(0, limit).map((f) => {
      const kcal100g = pick(f.foodNutrients, { ids: [1008], names: ['energy'] }); // Energy (kcal)
      const protein100g = pick(f.foodNutrients, { ids: [1003], names: ['protein'] });
      const carbs100g = pick(f.foodNutrients, { ids: [1005], names: ['carbohydrate'] });
      const fat100g = pick(f.foodNutrients, { ids: [1004], names: ['total lipid', 'fat'] });

      return {
        source: 'usda',
        externalId: String(f.fdcId),
        name: f.description,
        brand: f.brandName ?? null,
        kcal100g,
        protein100g,
        carbs100g,
        fat100g,
        score: f.score,
        dataType: f.dataType,
      };
    });

    return foods;
  }
}
