import { ApiRouteRepository } from '../adapters/infrastructure/ApiRouteRepository';
import { ApiComplianceRepository } from '../adapters/infrastructure/ApiComplianceRepository';
import { ApiPoolRepository } from '../adapters/infrastructure/ApiPoolRepository';

export const routeRepository = new ApiRouteRepository();
export const complianceRepository = new ApiComplianceRepository();
export const poolRepository = new ApiPoolRepository();
