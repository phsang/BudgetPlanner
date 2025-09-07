export interface BudgetCategory {
  id: string;
  name: string;
  changeName?: boolean; // Trạng thái có đang đổi tên hay không
  type: 'income' | 'expense';  // Loại danh mục (thu nhập hoặc chi phí)
  parentId?: string;  // Nếu là danh mục con, sẽ có parentId
  values: { [month: string]: number };  // Dữ liệu theo từng tháng
  children?: BudgetCategory[];
  expanded: boolean;
}
