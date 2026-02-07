import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../constants/roles.constant';

export const ADMIN_ONLY_KEY = 'admin_only';

export const AdminOnly = () =>
  SetMetadata(ADMIN_ONLY_KEY, UserRole.ADMIN);
