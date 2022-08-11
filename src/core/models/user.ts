import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { joiPasswordExtendCore, JoiPasswordExtend } from 'joi-password';
import * as joi from 'joi';

const joiPassword: JoiPasswordExtend = joi.extend(joiPasswordExtendCore);

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}
@Entity()
export class User {
    @ApiProperty({ description: 'Id' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Name' })
    @Column({ default: null })
    name: string;

    @ApiProperty({ description: 'Password' })
    @Column({ default: null })
    password: string;

    @ApiProperty({ description: 'Email' })
    @Column({ default: null })
    email: string;

    @ApiProperty({ description: 'Is verify' })
    @Column({ default: false })
    isVerified: boolean;

    @ApiProperty({ description: 'Google id' })
    @Column({ default: null, unique: true })
    googleId: string;

    @ApiProperty({ description: 'Create date' })
    createAt: number;

    @ApiProperty({ description: 'Create date' })
    updateAt: number;

    @ApiProperty({ description: 'Status' })
    @Column({ default: UserStatus.ACTIVE })
    status: UserStatus;

    @ApiProperty({ description: 'Status' })
    @Column({ default: UserRole.USER })
    role: UserRole;
}

export const userValidateSchema = {
    name: joi.string().min(5).max(40).trim().lowercase().required(),
    email: joi.string().min(5).max(255).email().trim().lowercase().required(),
    username: joi.string().max(32).min(5).lowercase().alphanum().required(),
    password: joiPassword.string().min(8).max(32).noWhiteSpaces().required(),
};
