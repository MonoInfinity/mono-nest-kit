import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User, UserRole, UserStatus } from '../core/models';
import { UserRepository } from '../core/repositories';
import { constant } from '../core';
@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService, private readonly userRepository: UserRepository) {}

    async createOne(name: string, email: string, password: string) {
        const user = new User();
        user.name = name;
        user.email = email;
        user.password = await this.encryptPassword(password, constant.default.hashingSalt);
        user.isVerified = false;
        user.createAt = new Date().getTime();
        user.updateAt = new Date().getTime();
        user.status = UserStatus.ACTIVE;
        user.role = UserRole.USER;
        return await this.userRepository.save(user);
    }

    // ---------------------------Bcrypt Service---------------------------
    async encryptPassword(password: string, saltOrRounds: number): Promise<string> {
        return await bcrypt.hash(password, saltOrRounds);
    }

    async decryptPassword(enteredPassword: string, passwordInDatabase: string): Promise<boolean> {
        return await bcrypt.compare(enteredPassword, passwordInDatabase);
    }

    // ---------------------------Token Service---------------------------
    async encryptAccessToken(tokenData: Record<any, any>, minutes?: number) {
        try {
            if (minutes) {
                return await this.jwtService.signAsync(tokenData, { expiresIn: minutes * 60 });
            } else {
                return this.jwtService.signAsync(tokenData);
            }
        } catch (err) {
            return null;
        }
    }

    async verifyToken<T>(tokenData: string): Promise<{ data: T; error: any }> {
        try {
            return { data: (await this.jwtService.verifyAsync<any>(tokenData)) as T, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    }

    async createAccessToken(user: User, minutes?: number): Promise<string> {
        const token = this.encryptAccessToken({ id: user.id }, minutes);
        return token;
    }
}
