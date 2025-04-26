import {
    Component,
    Inject,
    ViewChild,
    ViewContainerRef,
    AfterViewInit,
    Type
  } from '@angular/core';
  import { MAT_DIALOG_DATA } from '@angular/material/dialog';
  
  @Component({
    selector: 'app-medieval-dialog-wrapper',
    templateUrl: './medieval-dialog-wrapper.component.html',
    styleUrls: ['./medieval-dialog-wrapper.component.scss']
  })
  export class MedievalDialogWrapperComponent implements AfterViewInit {
    @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  
    constructor(
      @Inject(MAT_DIALOG_DATA)
      public data: { component: Type<any>, componentData?: any }
    ) {}
  
    ngAfterViewInit() {
        console.log('asdf')
      const componentRef = this.container.createComponent(this.data.component);
  
      if (this.data.componentData) {
        Object.assign(componentRef.instance, this.data.componentData);
      }
    }
  }
  