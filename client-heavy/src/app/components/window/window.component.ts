import { CdkPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { ApplicationRef, Component, ComponentFactoryResolver, Injector, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit {

  @ViewChild(CdkPortal) portal: CdkPortal;

  // STEP 2: save a reference to the window so we can close it
  private externalWindow: Window | null = null;

  // STEP 3: Inject all the required dependencies for a PortalHost
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef,
    private injector: Injector) {}


  ngOnInit() {
    // STEP 4: create an external window
    this.externalWindow = window.open('', '', 'width=600,height=400,left=200,top=200');

    // STEP 5: create a PortalHost with the body of the new window document    
    const host = new DomPortalOutlet(
      this.externalWindow!.document.body,
      this.componentFactoryResolver,
      this.applicationRef,
      this.injector
    );

    // STEP 6: Attach the portal
    host.attach(this.portal);
  }

  ngOnDestroy() {
    // STEP 7: close the window when this component destroyed
    this.externalWindow!.close()
  }

}
