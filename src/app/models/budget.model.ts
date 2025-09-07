export interface BudgetCategory {
  id: string;
  name: string;
  changeName?: boolean; // Trạng thái có đang đổi tên hay không
  type: 'income' | 'expense';  // Loại danh mục (thu nhập hoặc chi phí)
  values: { [month: string]: number };  // Dữ liệu theo từng tháng
  children?: BudgetCategory[];
  expanded: boolean;
}
