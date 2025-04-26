import { Injectable, Type } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MedievalDialogWrapperComponent } from '../shared/components/medieval-dialog-wrapper/medieval-dialog-wrapper.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) {}

  openMedievalDialog<T>(
    component: Type<T>,
    componentData: Partial<T> = {},
    width: string = '800px'
  ) {
    return this.dialog.open(MedievalDialogWrapperComponent, {
      width,
      data: {
        component,
        componentData
      }
    });
  }
}
