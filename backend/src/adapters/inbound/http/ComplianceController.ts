import { Request, Response } from 'express';
import { ComplianceService } from '../../../core/domain/ComplianceService';

export class ComplianceController {
    constructor(private complianceService: ComplianceService) { }

    calculateCB = async (req: Request, res: Response) => {
        try {
            const { shipId, year } = req.params;
            const { actualIntensity, fuelConsumption } = req.body;

            const result = await this.complianceService.calculateCB(
                shipId,
                parseInt(year),
                actualIntensity,
                fuelConsumption
            );

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to calculate CB' });
        }
    };

    getCB = async (req: Request, res: Response) => {
        try {
            const { shipId, year } = req.params;
            const cb = await this.complianceService.getCB(shipId, parseInt(year));
            res.json({ shipId, year: parseInt(year), cb });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get CB' });
        }
    };

    getAllCompliance = async (req: Request, res: Response) => {
        try {
            const { year } = req.query;
            const result = await this.complianceService.getAllCompliance(parseInt(year as string) || new Date().getFullYear());
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get all compliance' });
        }
    };

    getCBForYear = async (req: Request, res: Response) => {
        try {
            const { year, shipId } = req.query;
            const yearNum = parseInt(year as string) || new Date().getFullYear();

            let complianceData;

            if (shipId) {
                const result = await this.complianceService.getComplianceForShip(shipId as string, yearNum);
                if (result) {
                    complianceData = result;
                }
            } else {
                // Fallback: return the first ship's compliance for the year
                const compliances = await this.complianceService.getAllCompliance(yearNum);
                if (compliances.length > 0) {
                    complianceData = compliances[0];
                }
            }

            if (complianceData) {
                res.json({
                    cb_before: complianceData.adjustedCB,
                    applied: 0,
                    cb_after: complianceData.adjustedCB,
                    year: yearNum
                });
            } else {
                res.json({
                    cb_before: 0,
                    applied: 0,
                    cb_after: 0,
                    year: yearNum
                });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to get CB for year' });
        }
    };
}
