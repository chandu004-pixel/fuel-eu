import { Request, Response } from 'express';
import { BankingService } from '../../../core/domain/BankingService';

export class BankingController {
    constructor(private bankingService: BankingService) { }

    bankSurplus = async (req: Request, res: Response) => {
        try {
            const { shipId, year, amount } = req.body;
            const entry = await this.bankingService.bankSurplus(shipId, year, amount);
            res.json(entry);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    applyBanked = async (req: Request, res: Response) => {
        try {
            const { shipId, year, amount } = req.body;
            await this.bankingService.applyBanked(shipId, year, amount);
            res.json({ message: 'Banked surplus applied successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getTotalBanked = async (req: Request, res: Response) => {
        try {
            const { shipId } = req.params;
            const total = await this.bankingService.getTotalBanked(shipId);
            res.json({ shipId, totalBanked: total });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get banked total' });
        }
    };

    getBankingRecords = async (req: Request, res: Response) => {
        try {
            const { shipId, year } = req.query;

            if (!shipId) {
                return res.status(400).json({ error: 'shipId query parameter is required' });
            }

            const records = await this.bankingService.getBankingRecords(
                shipId as string,
                year ? parseInt(year as string) : undefined
            );
            res.json(records);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get banking records' });
        }
    };
}
