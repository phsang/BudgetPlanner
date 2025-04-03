import { Component } from '@angular/core';
import { BudgetTableComponent } from './components/budget-table/budget-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BudgetTableComponent], // ✅ Thêm BudgetTableComponent vào đây
  template: `<app-budget-table></app-budget-table>`,
})
export class AppComponent { }
