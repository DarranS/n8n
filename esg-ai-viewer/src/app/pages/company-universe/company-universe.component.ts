import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, MenuItemDef } from 'ag-grid-community';
import { Router } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { QuestionTabComponent } from '../../components/tabs/question-tab/question-tab.component';
import { MatIconModule } from '@angular/material/icon';

// Register AG Grid Community Module
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-company-universe',
  standalone: true,
  imports: [CommonModule, AgGridModule, MatTabsModule, MatIconModule],
  templateUrl: './company-universe.component.html',
  styleUrls: ['./company-universe.component.scss']
})
export class CompanyUniverseComponent implements OnInit {
  rowData: any[] = [];
  gridApi: any;
  gridColumnApi: any;
  selectedRowCount = 0;

  columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 40,
      pinned: 'left' as const,
      suppressHeaderMenuButton: true,
      headerName: '',
      field: 'select',
      sortable: true,
      filter: false,
      comparator: (valueA: any, valueB: any, nodeA: any, nodeB: any) => {
        // Sort selected rows to the top
        const selectedA = nodeA.isSelected() ? 1 : 0;
        const selectedB = nodeB.isSelected() ? 1 : 0;
        return selectedB - selectedA; // Descending: selected first
      },
      onCellClicked: (params: any) => {
        // Only toggle selection for body rows, not header
        if (params.node && params.node.rowIndex != null) {
          params.node.setSelected(!params.node.isSelected());
        }
      }
    },
    {
      headerName: '',
      field: 'research',
      width: 40,
      cellRenderer: (params: any) => {
        return `<span style='cursor:pointer;font-size:1.5em;' title='Go to Research'>🔍</span>`;
      },
      onCellClicked: (params: any) => {
        this.goToResearch(params.data);
      },
      pinned: 'left' as const,
      suppressHeaderMenuButton: true,
      sortable: false,
      filter: false
    },
    { field: 'ID', headerName: 'ID', sortable: true, filter: true, maxWidth: 120 },
    { field: 'CompanyName', headerName: 'Company Name', sortable: true, filter: true },
    { field: 'ISIN', headerName: 'ISIN', sortable: true, filter: true },
    { field: 'ESGAdjustedScore', headerName: 'ESG Adjusted Score', sortable: true, filter: true },
    {
      field: 'LGTSustainabilityRating',
      headerName: 'LGT Sustainability Rating',
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const rating = params.value || 0;
        return `<span style='color: #FFD600; font-size: 1.2em;'>${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</span>`;
      }
    },
    { field: 'Region', headerName: 'Region', sortable: true, filter: true },
    { field: 'Country', headerName: 'Country', sortable: true, filter: true },
    { field: 'GICSector', headerName: 'GIC Sector', sortable: true, filter: true },
    { field: 'IndustryGroup', headerName: 'Industry Group', sortable: true, filter: true }
  ];

  defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true
  };

  gridOptions = {
    // Removed getContextMenuItems and sideBar for AG Grid Community v33+
  };

  constructor(private router: Router, private companyService: CompanyService, private dialog: MatDialog, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    this.rowData = await this.companyService.getFullCompanyUniverse();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  onFirstDataRendered(params: any) {
    if (!params.columnApi) return;
    const allColumnIds: string[] = [];
    params.columnApi.getAllColumns().forEach((column: any) => {
      allColumnIds.push(column.getId());
    });
    params.columnApi.autoSizeColumns(allColumnIds, false);
  }

  onSelectionChanged() {
    this.selectedRowCount = this.gridApi ? this.gridApi.getSelectedRows().length : 0;
    this.cdr.detectChanges();
  }

  goToResearch(company: any) {
    // Navigate to research tab and pass company ISIN
    this.router.navigate(['/research'], { queryParams: { isin: company.ISIN } });
  }

  openQuestionDialog() {
    if (!this.gridApi) return;
    const selectedNodes = this.gridApi.getSelectedNodes();
    const companies = selectedNodes.map((node: any) => ({
      CompanyName: node.data.CompanyName,
      ISIN: node.data.ISIN
    }));
    if (companies.length === 0) return;
    this.dialog.open(QuestionTabComponent, {
      data: { companies },
      width: '1100px',
      maxHeight: '80vh',
      disableClose: true
    });
  }
} 