import { supabase, Category, MenuItem, MenuItemSize, Deal } from '../supabase';

export class MenuService {
  // Fetch all categories
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Fetch menu items with category and sizes
  static async getMenuItems(categoryId?: string): Promise<MenuItem[]> {
    try {
      let query = supabase
        .from('menu_items')
        .select(`
          *,
          category:categories(*),
          sizes:menu_item_sizes(*)
        `)
        .eq('is_available', true)
        .order('sort_order', { ascending: true });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  }

  // Fetch popular menu items
  static async getPopularItems(): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:categories(*),
          sizes:menu_item_sizes(*)
        `)
        .eq('is_available', true)
        .eq('is_popular', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching popular items:', error);
      return [];
    }
  }

  // Fetch deals
  static async getDeals(): Promise<Deal[]> {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
  }

  // Search menu items
  static async searchMenuItems(searchTerm: string): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:categories(*),
          sizes:menu_item_sizes(*)
        `)
        .eq('is_available', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching menu items:', error);
      return [];
    }
  }

  // Get menu item by ID
  static async getMenuItemById(id: string): Promise<MenuItem | null> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:categories(*),
          sizes:menu_item_sizes(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching menu item:', error);
      return null;
    }
  }
}
