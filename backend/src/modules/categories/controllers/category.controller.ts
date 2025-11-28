import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

const categoryService = new CategoryService();

export class CategoryController {

  async create(req: Request, res: Response) {
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;
      if (!shopSlug) return res.status(400).json({ error: 'Falta header x-tenant-id' });
      
      const category = await categoryService.createCategory(shopSlug, req.body);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const shopSlug = req.headers['x-tenant-id'] as string;
      if (!shopSlug) return res.status(400).json({ error: 'Falta header x-tenant-id' });

      const categories = await categoryService.getCategories(shopSlug);
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
        const shopSlug = req.headers['x-tenant-id'] as string;
        const { id } = req.params;
        if (!shopSlug) return res.status(400).json({ error: 'Falta header x-tenant-id' });

        const category = await categoryService.updateCategory(shopSlug, id, req.body);
        if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
        
        res.json(category);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
        const shopSlug = req.headers['x-tenant-id'] as string;
        const { id } = req.params;
        if (!shopSlug) return res.status(400).json({ error: 'Falta header x-tenant-id' });

        await categoryService.deleteCategory(shopSlug, id);
        res.json({ message: 'Categoría eliminada' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }
}