import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { User } from '../../core/models';
import { config } from '../../core/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly userService: UserService) {
        super({
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_SECRET,
            callbackURL: `${config.SERVER_URL}/auth/google/callback`,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
        try {
            let user = await this.userService.findUser('googleId', profile.id);
            if (!user) {
                user = new User();
                user.googleId = profile.id;
                user.name = profile.displayName;
                user.email = profile._json.email;
                user = await this.userService.saveUser(user);
            }
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }
}
