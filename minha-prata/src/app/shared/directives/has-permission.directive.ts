import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserPermissions } from '../../core/models/user';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnDestroy {
  private hasView = false;
  private authSubscription: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    this.authSubscription = this.authService.authState$.subscribe(() => {
      this.updateView();
    });
  }

  @Input() set appHasPermission(permission: keyof UserPermissions) {
    this._requiredPermission = permission;
    this.updateView();
  }

  @Input() set appHasAnyPermission(permissions: (keyof UserPermissions)[]) {
    this._requiredAnyPermissions = permissions;
    this.updateView();
  }

  @Input() set appHasAllPermissions(permissions: (keyof UserPermissions)[]) {
    this._requiredAllPermissions = permissions;
    this.updateView();
  }

  private _requiredPermission?: keyof UserPermissions;
  private _requiredAnyPermissions?: (keyof UserPermissions)[];
  private _requiredAllPermissions?: (keyof UserPermissions)[];

  private updateView(): void {
    const hasPermission = this.checkPermissions();

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkPermissions(): boolean {
    if (this._requiredPermission) {
      return this.authService.hasPermission(this._requiredPermission);
    }

    if (this._requiredAnyPermissions) {
      return this.authService.hasAnyPermission(this._requiredAnyPermissions);
    }

    if (this._requiredAllPermissions) {
      return this.authService.hasAllPermissions(this._requiredAllPermissions);
    }

    return false;
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}