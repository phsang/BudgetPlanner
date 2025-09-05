import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { BudgetCategory } from '../../models/budget.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-budget-table',
  standalone: true,
  templateUrl: './budget-table.component.html',
  styleUrls: ['./budget-table.component.scss'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class BudgetTableComponent implements OnInit, AfterViewInit {
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months_gen = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  categories: { income: BudgetCategory[]; expense: BudgetCategory[] } = { income: [], expense: [] };
  contextMenu = {
    show: false,
    x: 0,
    y: 0,
    category: null as BudgetCategory | null,
    month: '' as string
  };

  constructor(
    private readonly budgetService: BudgetService,
    private readonly el: ElementRef
  ) {
    this.budgetService.categories$.subscribe((categories: BudgetCategory[]) => {
      this.categories = {
        income: categories.filter((c) => c.type === 'income'),
        expense: categories.filter((c) => c.type === 'expense')
      };
    });
  }

  ngOnInit(): void {
    this.addCategory('income');
    this.addCategory('expense');

    this.categories['income'].forEach((category: any) => {
      this.months_gen.forEach((month: string) => {
        category.values[month] = 0;
      });
    });
    this.categories['expense'].forEach((category: any) => {
      this.months_gen.forEach((month: string) => {
        category.values[month] = 0;
      });
    });
  }

  ngAfterViewInit() {
    // focus vào ô đầu tiên khi bảng được tải
    const firstInput = this.el.nativeElement.querySelector('input');
    if (firstInput) {
      firstInput.focus();
    }
  }

  handleKeydown(event: KeyboardEvent, row: number, col: number) {
    const inputs = this.el.nativeElement.querySelectorAll('input');
    const index = Array.from(inputs).findIndex((input) => input === event.target);

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (row === this.categories.income.length - 1) {
          this.addCategory('income'); // Thêm dòng mới nếu đang ở cuối
        }
        this.focusNextCell(inputs, index + this.months.length);
        break;
      case 'Tab':
        event.preventDefault();
        // nếu nhấn 'Tab' ở ô cuối cùng sẽ tự động sinh thêm dòng mới và forcus về ô đầu tiếp theo trên dòng mới
        if ((index % this.months_gen.length) === this.months_gen.length - 1) {
          this.addCategory(inputs[index].getAttribute('data-type'));
        }
        this.focusNextCell(inputs, index + 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.focusNextCell(inputs, index + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.focusNextCell(inputs, index - 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextCell(inputs, index + this.months_gen.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusNextCell(inputs, index - this.months_gen.length);
        break;
    }
  }

  // Chuyển focus đến ô tiếp theo
  private focusNextCell(inputs: NodeListOf<HTMLInputElement>, nextIndex: number) {
    if (nextIndex >= 0 && nextIndex < inputs.length) {
      inputs[nextIndex].focus();
    }
  }

  // Thêm danh mục thu nhập hoặc chi phí mới
  addCategory(type: 'income' | 'expense', parentId?: string) {
    const newCategory: BudgetCategory = {
      id: uuidv4(), // Tạo ID duy nhất bằng UUID
      name: `New ${type}`,
      type,
      values: {
        Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
        Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
      },
      children: [],
      expanded: false
    };

    if (parentId) {
      // Nếu có parentId, thêm vào danh mục con
      const parentCategory = this.categories[type].find(c => c.id === parentId);
      if (parentCategory) {
        if (!parentCategory.children) {
          parentCategory.children = [];
        }
        parentCategory.children.push(newCategory);
      }
    } else {
      // Nếu không có parentId, thêm vào danh mục cha
      this.categories[type].push(newCategory);
    }

    console.log(this.categories);

    this.categories = { ...this.categories }; // Cập nhật UI
  }

  addSubCategory(type: 'income' | 'expense') {
    const parent = this.categories.income[0]; // Tạm thời chọn danh mục cha đầu tiên
    if (!parent) return;
    const newSubCategory: BudgetCategory = {
      id: uuidv4(),
      name: 'New Sub Category',
      values: {},
      children: [],
      expanded: false,
      type: type
    };
    parent.children?.push(newSubCategory);
  }

  deleteCategory(type: 'income' | 'expense', categoryId: string) {
    const filterCategories = (categories: BudgetCategory[]) => {
      return categories.filter(category => category.id !== categoryId);
    };

    this.categories[type] = filterCategories(this.categories[type]);
    this.categories = { ...this.categories }; // Cập nhật UI
  }

  // Tính tổng thu nhập cho một tháng
  calculateTotal(type: 'income' | 'expense', month: string): number {
    let total = 0;
    const categories = this.categories[type];

    categories.forEach(category => {
      if (category.values[month]) {
        total += Number(category.values[month]) || 0;
      }
    });

    return total;
  }

  // Tính tổng lợi nhuận cho một tháng
  calculateProfitLoss(month: string): number {
    let cumulativeProfitLoss = 0;
    const monthIndex = this.months.indexOf(month);

    for (let i = 0; i <= monthIndex; i++) {
      const currentMonth = this.months[i];
      const totalIncome = this.calculateTotal('income', currentMonth) || 0;
      const totalExpense = this.calculateTotal('expense', currentMonth) || 0;
      cumulativeProfitLoss += (totalIncome - totalExpense);
    }

    return cumulativeProfitLoss;
  }

  formatNumberInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    event.target.value = value !== '' ? parseInt(value) : '';
  }

  onRightClick(event: MouseEvent, category: BudgetCategory, month: string) {
    event.preventDefault(); // Ngăn chặn menu mặc định của trình duyệt

    // Lưu thông tin của ô được chọn
    this.contextMenu = {
      show: true,
      x: event.clientX,
      y: event.clientY,
      category,
      month
    };
  }

  applyToAll() {
    if (!this.contextMenu.category || !this.contextMenu.month) return;

    const valueToApply = this.contextMenu.category.values[this.contextMenu.month] || 0;

    // Sao chép giá trị vào tất cả các tháng
    this.months.forEach(month => {
      // Gán giá trị ngay cả khi trước đó chưa có giá trị nào
      this.contextMenu.category!.values[month] = parseInt(valueToApply.toString());
    });

    // Cập nhật lại giao diện (force change detection)
    this.categories = { ...this.categories };

    // Ẩn menu sau khi chọn
    this.contextMenu.show = false;
  }

  deleteSubCategory(parent: BudgetCategory, id: string) {
    parent.children = parent.children?.filter(sub => sub.id !== id) || [];
  }

  toggleExpand(category: BudgetCategory) {
    category.expanded = !category.expanded;
  }

  changeRange(event: any) {
    const value = (event.target as HTMLSelectElement).value;
    let startMonth = 0;
    let endMonth = 0;

    switch (value) {
      case '0': {
        startMonth = 0;
        endMonth = 11;
        break;
      }
      case '1': {
        startMonth = 0;
        endMonth = 5;
        break;
      }
      case '2': {
        startMonth = 6;
        endMonth = 11;
        break;
      }
    }
    this.months_gen = [];

    for (let i = startMonth; i <= endMonth; i++) {
      this.months_gen.push(this.months[i]);
    }
  }

  changeCategoryName(event: any, type: 'income' | 'expense', id: string) {
    const category = this.categories[type].find(c => c.id === id);
    if (category) {
      category.name = event.target.value;
    }
  }

}
