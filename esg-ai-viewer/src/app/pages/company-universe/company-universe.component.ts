import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, MenuItemDef, GridOptions, DefaultMenuItem } from 'ag-grid-community';
import { Router } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { EsgService } from '../../services/esg.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { QuestionTabComponent } from '../../components/tabs/question-tab/question-tab.component';
import { MatIconModule } from '@angular/material/icon';
import { ImportStatusDialogComponent, ImportStatusItem } from '../../components/tabs/import-tab/import-status-dialog.component';
import { UpsertRagStatusDialogComponent, UpsertRagStatusItem } from './upsert-rag-status-dialog.component';

// Register AG Grid Community Module (includes context menu)
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
    {
      field: 'InRAG',
      headerName: 'In RAG',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => {
        return params.value ? '✅' : '';
      }
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
    { field: 'IndustryGroup', headerName: 'Industry Group', sortable: true, filter: true },
  ];

  defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true
  };

  gridOptions: GridOptions = {};

  constructor(private router: Router, private companyService: CompanyService, private esgService: EsgService, private dialog: MatDialog, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    this.rowData = await this.companyService.getFullCompanyUniverse(true);
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

  // Add method to upsert selected companies to RAG
  async upsertSelectedToRag() {
    if (!this.gridApi) return;
    const selectedNodes = this.gridApi.getSelectedNodes();
    const companies = selectedNodes.map((node: any) => node.data);
    if (companies.length === 0) return;
    // Prepare status items
    const statusItems: UpsertRagStatusItem[] = companies.map((c: any) => ({
      isin: c.ISIN,
      name: c.CompanyName,
      status: 'pending'
    }));
    const dialogRef = this.dialog.open(UpsertRagStatusDialogComponent, {
      data: { items: statusItems },
      disableClose: true,
      width: '700px'
    });

    // Listen for retry event
    dialogRef.componentInstance.retry.subscribe(() => {
      // Find failed items
      const failedIndexes = statusItems
        .map((item, idx) => item.status === 'error' ? idx : -1)
        .filter(idx => idx !== -1);
      // Reset their status to pending
      for (const idx of failedIndexes) {
        statusItems[idx].status = 'pending';
        statusItems[idx].error = undefined;
      }
      dialogRef.componentInstance.data.items = [...statusItems];
      // Retry only failed companies sequentially
      const processNextFailed = async (failedIndexes: number[], i: number) => {
        if (i >= failedIndexes.length) return;
        const idx = failedIndexes[i];
        const company = companies[idx];
        try {
          const rawData = await this.esgService.getRawData(company.ISIN).toPromise();
          await this.esgService.upsertRagDocument(company.CompanyName, company.ISIN, rawData).toPromise();
          statusItems[idx].status = 'success';
        } catch (err: any) {
          statusItems[idx].status = 'error';
          statusItems[idx].error = err?.message || 'Failed';
        }
        dialogRef.componentInstance.data.items = [...statusItems];
        await processNextFailed(failedIndexes, i + 1);
      };
      processNextFailed(failedIndexes, 0);
    });

    // Sequential upsert logic
    const processNext = async (i: number) => {
      if (i >= companies.length) return;
      const company = companies[i];
      try {
        const rawData = await this.esgService.getRawData(company.ISIN).toPromise();
        await this.esgService.upsertRagDocument(company.CompanyName, company.ISIN, rawData).toPromise();
        statusItems[i].status = 'success';
      } catch (err: any) {
        statusItems[i].status = 'error';
        statusItems[i].error = err?.message || 'Failed';
      }
      dialogRef.componentInstance.data.items = [...statusItems];
      await processNext(i + 1);
    };
    processNext(0);

    // Allow user to close dialog when all done
    const checkAllDone = setInterval(async () => {
      if (statusItems.every(item => item.status !== 'pending')) {
        dialogRef.disableClose = false;
        clearInterval(checkAllDone);
        // Refresh the grid to get the latest RAG data
        this.rowData = await this.companyService.getFullCompanyUniverse(true);
        this.cdr.detectChanges();
      }
    }, 500);
  }
} 