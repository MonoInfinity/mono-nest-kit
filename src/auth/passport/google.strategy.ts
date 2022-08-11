import { AuthService } from './../auth.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from '../../core/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly userService: UserService, private readonly authService: AuthService) {
        super({
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_SECRET,
            callbackURL: `${config.SERVER_URL}/auth/google/callback`,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
        try {
            let user = await this.userService.findOne('googleId', profile.id);
            if (!user) {
                user = await this.authService.createOneWithGoogle(profile.displayName, profile._json.email, profile.id);
            }
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }
}
