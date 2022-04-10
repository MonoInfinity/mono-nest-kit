import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

// ----- Service
import { UserService } from '../../user/user.service';

// ----- Entity
import { User } from '../../core/models';
import { config } from '../../core';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(private readonly userService: UserService) {
        super({
            clientID: config.FACEBOOK_CLIENT_ID,
            clientSecret: config.FACEBOOK_SECRET,
            callbackURL: `${config.SERVER_URL}/auth/facebook/callback`,
            profileFields: ['id', 'name', 'displayName', 'photos'],
        });
    }
    async validate(accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any, infor?: any) => void) {
        try {
            let user = await this.userService.findUser('facebookId', profile.id);
            if (!user) {
                user = new User();
                user.facebookId = profile.id;
                user.name = profile.displayName;
                user = await this.userService.saveUser(user);
            }
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }
}
