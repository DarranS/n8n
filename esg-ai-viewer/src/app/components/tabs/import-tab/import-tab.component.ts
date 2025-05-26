import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridApi, ModuleRegistry, AllCommunityModule, ColDef, ValueGetterParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ImportStatusDialogComponent, ImportStatusItem } from './import-status-dialog.component';

// Register AG Grid Community Module
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-import-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridModule, MatDialogModule],
  templateUrl: './import-tab.component.html',
  styleUrls: ['./import-tab.component.scss']
})
export class ImportTabComponent {
  showTokenInput = true;
  bearerToken = '';
  companies: any[] = [];
  isinInput = '';
  columnDefs: ColDef[] = [
    { headerName: 'Selected', field: 'selected', filter: true, floatingFilter: true, valueGetter: (params: ValueGetterParams) => params.node && params.node.isSelected() ? 'Yes' : 'No' },
    { headerName: 'Id', field: 'objectId', checkboxSelection: true, filter: true, floatingFilter: true },
    { headerName: 'Company Name', field: 'objectName', filter: true, floatingFilter: true },
    { headerName: 'ISIN', field: 'isin', filter: true, floatingFilter: true },
    { headerName: 'ESG Adjusted Score', field: 'esgAdjustedScore', filter: true, floatingFilter: true },
    { headerName: 'Country', field: 'country', filter: true, floatingFilter: true },
    { headerName: 'GICS Sector', field: 'gicsSector', filter: true, floatingFilter: true },
    { headerName: 'LGT Sustainability Rating', field: 'lgtSustainabilityRating', filter: true, floatingFilter: true }
  ];
  private gridApi!: GridApi;
  fetchError: string | null = null;
  noData: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private dialog: MatDialog) {
    console.log('ImportTabComponent constructed');
  }

  onPopulate() {
    console.log('Populate button clicked');
    this.showTokenInput = true;
  }

  fetchCompanies() {
    console.log('Initiating company data fetch');
    if (!this.bearerToken) {
      console.warn('No bearer token provided - aborting fetch');
      return;
    }

    const url = '/esgscores/companies/companies';
    console.log('Fetching from URL:', url);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.bearerToken}`,
      'Content-Type': 'application/json'
    });

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (data) => {
        console.log('Data fetch successful:', {
          totalRecords: data?.length || 0,
          dataType: typeof data,
          isArray: Array.isArray(data)
        });

        if (Array.isArray(data) && data.length > 0) {
          console.log('Data sample:', {
            first: data[0],
            last: data[data.length - 1],
            fields: Object.keys(data[0])
          });
        }

        this.companies = data;
        console.log('Companies assigned to component:', {
          length: this.companies?.length || 0,
          gridApi: !!this.gridApi
        });

        if (this.gridApi) {
          this.gridApi.setGridOption('rowData', this.companies);
          console.log('Grid data updated:', {
            displayedRows: this.gridApi.getDisplayedRowCount(),
            totalData: this.companies.length
          });
        } else {
          console.warn('Grid API not available when setting data');
        }

        this.showTokenInput = false;
        this.noData = Array.isArray(data) && data.length === 0;
        this.fetchError = null;
        this.cdr.detectChanges();
        
        console.log('Component state after update:', {
          showTokenInput: this.showTokenInput,
          noData: this.noData,
          error: this.fetchError
        });
      },
      error: (err) => {
        console.error('Fetch companies error:', {
          status: err.status,
          message: err.message,
          error: err
        });
        this.fetchError = `Failed to fetch companies: ${err.message}`;
        this.noData = false;
      }
    });
  }

  onGridReady(params: any) {
    console.log('Grid ready event triggered');
    this.gridApi = params.api;
    
    // Log grid API initialization
    if (this.gridApi) {
      console.log('Grid API successfully initialized');
    } else {
      console.warn('Grid API initialization failed');
    }

    // Log current data state
    console.log('Current companies data length:', this.companies?.length || 0);
    if (this.companies?.length > 0) {
      console.log('Sample company data:', {
        first: this.companies[0],
        last: this.companies[this.companies.length - 1]
      });
    }

    this.gridApi.addEventListener('selectionChanged', () => {
      const selectedNodes = this.gridApi.getSelectedNodes();
      console.log('Selection changed - Selected nodes:', selectedNodes.length);
      this.cdr.detectChanges();
      this.gridApi.refreshCells({ force: true, columns: ['selected'] });
    });

    // Set up data change listener
    this.gridApi.addEventListener('modelUpdated', (event: any) => {
      console.log('Row data changed:', {
        rowCount: this.gridApi.getDisplayedRowCount(),
        dataSize: this.companies?.length
      });
    });
  }

  onIsinInput() {
    console.log('ISIN/ID input event:', this.isinInput);
    if (!this.gridApi) {
      console.warn('Grid API not ready');
      return;
    }
    const values = this.isinInput.split(',').map(i => i.trim().toUpperCase()).filter(i => i);
    this.gridApi.deselectAll();
    if (values.length) {
      this.gridApi.forEachNode((node) => {
        const isin = (node.data.isin || '').toUpperCase();
        const id = (node.data.objectId || '').toString().toUpperCase();
        if (values.includes(isin) || values.includes(id)) {
          node.setSelected(true);
        }
      });
    }
  }

  async onImport() {
    const selectedNodes = this.gridApi.getSelectedNodes();
    const items: ImportStatusItem[] = selectedNodes.map(node => ({
      isin: node.data.isin,
      name: node.data.objectName,
      status: 'pending'
    }));

    // Check for items with null/empty ISINs
    const itemsWithNoIsin = items.filter(item => !item.isin || item.isin.trim() === '');
    if (itemsWithNoIsin.length > 0) {
      const names = itemsWithNoIsin.map(item => `${item.name || 'Unknown Company'}`).join('\n');
      const proceed = window.confirm(
        `The following selected companies do not have ISINs and cannot be imported:\n\n${names}\n\nDo you want to proceed excluding these items? (Cancel to return to the grid)`
      );
      if (!proceed) {
        return;
      }
    }
    const filteredItems = items.filter(item => item.isin && item.isin.trim() !== '');
    if (filteredItems.length === 0) {
      alert('No valid companies with ISINs selected for import.');
      return;
    }
    const dialogRef = this.dialog.open(ImportStatusDialogComponent, {
      data: { items: filteredItems },
      disableClose: true,
      width: '700px'
    });

    // Helper to download JSON
    function downloadJson(data: any, filename: string) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }

    // Concurrency control
    const concurrency = 10;
    let inFlight = 0;
    let idx = 0;
    const runNext = () => {
      while (inFlight < concurrency && idx < filteredItems.length) {
        const i = idx++;
        inFlight++;
        const item = filteredItems[i];
        const url = `/esgscores/companies/${selectedNodes.find(node => node.data.isin === item.isin)?.data.objectId}`;
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        });
        this.http.get(url, { headers }).subscribe({
          next: (data) => {
            item.status = 'success';
            downloadJson(data, `${item.isin}.json`);
            dialogRef.componentInstance.data.items = [...filteredItems];
            this.cdr.detectChanges();
          },
          error: (err) => {
            item.status = 'error';
            item.error = err?.message || 'Failed';
            dialogRef.componentInstance.data.items = [...filteredItems];
            this.cdr.detectChanges();
          },
          complete: () => {
            inFlight--;
            runNext();
          }
        });
      }
    };
    runNext();

    // Allow user to close dialog when all done
    const checkAllDone = setInterval(() => {
      if (filteredItems.every(item => item.status !== 'pending')) {
        dialogRef.disableClose = false;
        clearInterval(checkAllDone);
      }
    }, 500);
  }

  get selectedCount(): number {
    if (!this.gridApi) return 0;
    return this.gridApi.getSelectedNodes().length;
  }

  selectAll() {
    if (this.gridApi) {
      this.gridApi.selectAll();
    }
  }

  clearSelection() {
    if (this.gridApi) {
      this.gridApi.deselectAll();
    }
  }
} 