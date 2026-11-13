import { closeDatabase } from '@credit/database/client';
import { afterAll } from 'vitest';
import { requireTestEnvironment } from './environment';

requireTestEnvironment();
afterAll(closeDatabase);
