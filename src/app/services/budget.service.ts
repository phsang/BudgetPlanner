import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BudgetCategory } from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private categories = new BehaviorSubject<BudgetCategory[]>([]);
  categories$ = this.categories.asObservable();

  constructor() { }

  // Lấy danh sách danh mục ngân sách
  getCategories() {
    return this.categories$.pipe();
  }

  // Thêm danh mục mới
  addCategory(category: BudgetCategory) {
    const updatedCategories = [...this.categories.value, category];
    this.categories.next(updatedCategories);
  }

  // Cập nhật giá trị một ô trong bảng
  updateValue(categoryId: string, month: string, value: number) {
    const updatedCategories = this.categories.value.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, values: { ...cat.values, [month]: value } };
      }
      return cat;
    });
    this.categories.next(updatedCategories);
  }
}
