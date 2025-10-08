export interface SocialUser {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
  provider: 'google';
  idToken?: string;
  accessToken?: string;
}