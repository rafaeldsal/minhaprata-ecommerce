import { Component, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserSettings } from '../../../../core/models';
import { UserDataService } from 'src/app/core/services/data/user-data.service';

@Component({
  selector: 'app-settings-notifications',
  templateUrl: './settings-notifications.component.html',
  styleUrls: ['./settings-notifications.component.scss']
})
export class SettingsNotificationsComponent implements OnInit {
  @Input() settings: UserSettings | null = null;

  notificationsForm: FormGroup;
  isLoading = signal(false);
  lastSaved = signal<Date | null>(null);

  // Agrupamentos para organização visual
  notificationCategories = [
    {
      id: 'orders',
      title: '📦 Pedidos e Entregas',
      description: 'Notificações sobre seus pedidos e status de entrega'
    },
    {
      id: 'promotions',
      title: '🎯 Promoções e Ofertas',
      description: 'Ofertas personalizadas e oportunidades especiais'
    },
    {
      id: 'account',
      title: '🔐 Segurança da Conta',
      description: 'Alertas importantes sobre sua conta e segurança'
    },
    {
      id: 'products',
      title: '❤️ Produtos e Listas',
      description: 'Notificações sobre produtos que você acompanha'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private userDataService: UserDataService
  ) {
    this.notificationsForm = this.createForm();
  }

  ngOnInit(): void {
    this.populateForm();

    // Salvar automaticamente quando o formulário muda
    this.notificationsForm.valueChanges.subscribe(() => {
      this.debouncedSave();
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // 📦 Pedidos e Entregas
      email: this.fb.group({
        orderConfirmation: [true],
        orderShipped: [true],
        outForDelivery: [true],
        deliveryUpdate: [true],
        orderDelivered: [true]
      }),
      push: this.fb.group({
        orderShipped: [true],
        outForDelivery: [true],
        deliveryUpdate: [true]
      }),
      sms: this.fb.group({
        orderDelivered: [false],
        deliveryProblem: [true]
      }),

      // 🎯 Promoções e Ofertas
      promotions: this.fb.group({
        email: this.fb.group({
          weeklyOffers: [true],
          flashSales: [true],
          priceDrops: [true],
          seasonalPromotions: [true],
          abandonedCart: [true]
        }),
        push: this.fb.group({
          flashSales: [false],
          priceDrops: [true],
          abandonedCart: [true]
        })
      }),

      // 🔐 Segurança da Conta
      security: this.fb.group({
        email: this.fb.group({
          loginAlerts: [true],
          passwordChanges: [true],
          paymentUpdates: [true],
          suspiciousActivity: [true]
        }),
        sms: this.fb.group({
          loginAlerts: [false],
          suspiciousActivity: [true]
        })
      }),

      // ❤️ Produtos e Listas
      products: this.fb.group({
        email: this.fb.group({
          backInStock: [true],
          wishlistReminders: [false],
          productReviews: [true],
          newArrivals: [false]
        }),
        push: this.fb.group({
          backInStock: [true],
          wishlistReminders: [false]
        })
      })
    });
  }

  private populateForm(): void {
    if (this.settings?.notifications) {
      this.notificationsForm.patchValue(this.settings.notifications, { emitEvent: false });
    }
  }

  private debounceTimer: any;
  private debouncedSave(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.saveChanges();
    }, 1000);
  }

  async saveChanges(): Promise<void> {
    if (this.notificationsForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      try {
        await this.userDataService.updateNotificationSettings(this.notificationsForm.value).toPromise();
        this.lastSaved.set(new Date());
      } catch (error) {
        console.error('Erro ao salvar configurações de notificação:', error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  resetToDefaults(): void {
    if (confirm('Restaurar todas as configurações de notificação para os padrões?')) {
      this.notificationsForm.patchValue({
        email: {
          orderConfirmation: true,
          orderShipped: true,
          outForDelivery: true,
          deliveryUpdate: true,
          orderDelivered: true
        },
        push: {
          orderShipped: true,
          outForDelivery: true,
          deliveryUpdate: true
        },
        sms: {
          orderDelivered: false,
          deliveryProblem: true
        },
        promotions: {
          email: {
            weeklyOffers: true,
            flashSales: true,
            priceDrops: true,
            seasonalPromotions: true,
            abandonedCart: true
          },
          push: {
            flashSales: false,
            priceDrops: true,
            abandonedCart: true
          }
        },
        security: {
          email: {
            loginAlerts: true,
            passwordChanges: true,
            paymentUpdates: true,
            suspiciousActivity: true
          },
          sms: {
            loginAlerts: false,
            suspiciousActivity: true
          }
        },
        products: {
          email: {
            backInStock: true,
            wishlistReminders: false,
            productReviews: true,
            newArrivals: false
          },
          push: {
            backInStock: true,
            wishlistReminders: false
          }
        }
      });
    }
  }

  // Métodos para controle de grupos
  toggleCategory(categoryId: string, enabled: boolean): void {
    const categoryGroup = this.notificationsForm.get(categoryId);
    if (categoryGroup) {
      this.setAllControlsInGroup(categoryGroup, enabled);
    }
  }

  private setAllControlsInGroup(group: any, enabled: boolean): void {
    Object.keys(group.controls).forEach(key => {
      const control = group.get(key);
      if (control instanceof FormGroup) {
        this.setAllControlsInGroup(control, enabled);
      } else {
        control.setValue(enabled);
      }
    });
  }

  toggleCategoryByEvent(categoryId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.toggleCategory(categoryId, target.checked);
  }

  // Verificar se alguma notificação está ativa na categoria
  isCategoryEnabled(categoryId: string): boolean {
    const categoryGroup = this.notificationsForm.get(categoryId);
    if (!categoryGroup) return false;

    return this.hasEnabledControls(categoryGroup);
  }

  private hasEnabledControls(group: any): boolean {
    return Object.keys(group.controls).some(key => {
      const control = group.get(key);
      if (control instanceof FormGroup) {
        return this.hasEnabledControls(control);
      } else {
        return control.value === true;
      }
    });
  }
}