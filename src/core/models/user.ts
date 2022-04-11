import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { joiPassword } from 'joi-password';
import * as joi from 'joi';

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

    @ApiProperty({ description: 'Username' })
    @Column({ default: null })
    username: string;

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

    @ApiProperty({ description: 'Facebook id' })
    @Column({ default: null, unique: true })
    facebookId: string;

    @ApiProperty({ description: 'Create date' })
    @Column({ default: new Date().toISOString().slice(0, 19).replace('T', ' ') })
    createDate: Date;

    @ApiProperty({ description: 'Update date' })
    @Column({ default: new Date().toISOString().slice(0, 19).replace('T', ' ') })
    updateDate: Date;

    @ApiProperty({ description: 'Status' })
    @Column({ default: UserStatus.ACTIVE })
    status: UserStatus;

    @ApiProperty({ description: 'Status' })
    @Column({ default: UserRole.USER })
    role: UserRole;
}

export const userValidateSchema = {
    name: joi.string().min(5).max(40).trim().lowercase().required(),
    username: joi.string().max(32).min(5).lowercase().alphanum().required(),
    password: joiPassword.string().min(8).max(32).trim().alphanum().required(),
};
