import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CompanyOverviewDialog } from '../../../dialogs/company-overview/company-overview.dialog';
import { CityOverviewDialog } from '../../../dialogs/city-overview/city-overview.dialog';
import { ConstructionDialog } from '../../../dialogs/construction/construction.dialog';
import { InventoryDialog } from '../../../dialogs/inventory/inventory.dialog';
import { FleetOverviewDialog } from '../../../dialogs/fleet-overview/fleet-overview.dialog';
import { PlayerOverviewDialog } from '../../../dialogs/player-overview/player-overview.dialog';
import { CompanyDetailDialog } from '../../../dialogs/company-detail/company-detail.dialog';
import { FleetDetailDialog } from '../../../dialogs/fleet-detail/fleet-detail.dialog';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../../services/dialog.service';
import { MatIconModule } from '@angular/material/icon';
import { MapControlsComponent } from './map-controls.component';

@Component({
  selector: 'app-bottom-hud',
  standalone:true,
  imports: [    CommonModule,
    MatDialogModule,
MatIconModule,MapControlsComponent],
  templateUrl: './bottom-hud.component.html',
  styleUrls: ['./bottom-hud.component.scss']
})
export class BottomHudComponent {
    private companies:any[] = [
        { name: "Ironwood Trade Co.", industry: "Metals", value: 500000 },
        { name: "Silverwind Exports", industry: "Textiles", value: 320000 }
    ]

    public CompanyOverviewDialog = CompanyOverviewDialog;
    public CityOverviewDialog = CityOverviewDialog;
    public ConstructionDialog = ConstructionDialog;
    public InventoryDialog = InventoryDialog;
    public PlayerOverviewDialog = PlayerOverviewDialog;
    public CompanyDetailDialog = CompanyDetailDialog;
    public FleetOverviewDialog = FleetOverviewDialog;
    public FleetDetailDialog = FleetDetailDialog;

  constructor(private dialogService: DialogService  
  ) {}

    openCompanyOverviewDialog() {
        this.dialogService.openMedievalDialog(CompanyOverviewDialog, {
            companies: this.companies
        })
    }

  openDialog(dialogComponent: any): void {
    this.dialogService.openMedievalDialog(dialogComponent, {
      width: '600px'
    });
  }
}
