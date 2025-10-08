import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SocialUser } from '../models/social-user';
import { GoogleAuthService } from './google-auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocialAuthService {

  constructor(private googleAuthService: GoogleAuthService) { }

  initializeSocialAuth(): Observable<void> {
    return this.googleAuthService.initializeAuth();
  }

  signInWithGoogle(): Observable<SocialUser> {
    return this.googleAuthService.signIn();
  }

  signOut(): Observable<void> {
    return this.googleAuthService.signOut();
  }

  getCurrentSocialUser(): SocialUser | null {
    return this.googleAuthService.getCurrentUser();
  }
}