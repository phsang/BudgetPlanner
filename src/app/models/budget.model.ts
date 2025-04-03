export interface BudgetCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';  // Loại danh mục (thu nhập hoặc chi phí)
  parentId?: number;  // Nếu là danh mục con, sẽ có parentId
  values: { [month: string]: number };  // Dữ liệu theo từng tháng
  children?: BudgetCategory[];
  expanded: boolean;
}
