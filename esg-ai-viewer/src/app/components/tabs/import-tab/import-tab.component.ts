import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridApi, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';

// Register AG Grid Community Module
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-import-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridModule],
  templateUrl: './import-tab.component.html',
  styleUrls: ['./import-tab.component.scss']
})
export class ImportTabComponent {
  showTokenInput = true;
  bearerToken = '';
  companies: any[] = [];
  isinInput = '';
  columnDefs = [
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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    console.log('ImportTabComponent constructed');
  }

  onPopulate() {
    console.log('Populate button clicked');
    this.showTokenInput = true;
  }

  fetchCompanies() {
    console.log('Fetch Companies called');
    if (!this.bearerToken) {
      console.warn('No bearer token provided');
      return;
    }
    const url = '/esgscores/companies/companies';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.bearerToken}`,
      'Content-Type': 'application/json'
    });
    this.http.get<any[]>(url, { headers }).subscribe({
      next: (data) => {
        console.log('Fetched companies:', data);
        if (Array.isArray(data) && data.length > 0) {
          console.log('First company:', data[0]);
        }
        this.companies = data;
        console.log('Companies assigned:', this.companies);
        this.showTokenInput = false;
        this.noData = Array.isArray(data) && data.length === 0;
        this.fetchError = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Fetch companies error:', err);
        alert('Failed to fetch companies');
        this.fetchError = 'Failed to fetch companies.';
        this.noData = false;
      }
    });
  }

  onGridReady(params: any) {
    console.log('Grid ready event:', params);
    this.gridApi = params.api;
    this.gridApi.addEventListener('selectionChanged', () => {
      this.cdr.detectChanges();
    });
  }

  onIsinInput() {
    console.log('ISIN input event:', this.isinInput);
    if (!this.gridApi) {
      console.warn('Grid API not ready');
      return;
    }
    const isins = this.isinInput.split(',').map(i => i.trim().toUpperCase()).filter(i => i);
    this.gridApi.deselectAll();
    if (isins.length) {
      this.gridApi.forEachNode((node) => {
        if (isins.includes((node.data.isin || '').toUpperCase())) {
          node.setSelected(true);
        }
      });
    }
  }

  onImport() {
    console.log('Import button clicked');
    // To be implemented in next prompt
    alert('Import functionality to be implemented.');
  }

  get selectedCount(): number {
    if (!this.gridApi) return 0;
    return this.gridApi.getSelectedNodes().length;
  }
} 