import { PoolRepository } from '../../../core/ports/repositories';
import { Pool, PoolMember } from '../../../core/domain/entities';
import { PoolModel } from './models/PoolModel';

export class MongoPoolRepository implements PoolRepository {
    async create(pool: Pool): Promise<Pool> {
        await PoolModel.create({
            id: pool.id,
            year: pool.year,
            members: [], // Initialize empty array
            createdAt: pool.createdAt
        });
        return pool;
    }

    async addMember(member: PoolMember): Promise<void> {
        await PoolModel.updateOne(
            { id: member.poolId },
            {
                $push: {
                    members: {
                        shipId: member.shipId,
                        cbBefore: member.cbBefore,
                        cbAfter: member.cbAfter
                    }
                }
            }
        );
    }

    async findById(id: string): Promise<Pool | null> {
        const doc = await PoolModel.findOne({ id });
        return doc ? this.toDomain(doc) : null;
    }

    async getMembers(poolId: string): Promise<PoolMember[]> {
        const doc = await PoolModel.findOne({ id: poolId });
        if (!doc || !doc.members) return [];

        return doc.members.map((m: any) => ({
            poolId: poolId,
            shipId: m.shipId,
            cbBefore: m.cbBefore,
            cbAfter: m.cbAfter
        }));
    }

    private toDomain(doc: any): Pool {
        return {
            id: doc.id,
            year: doc.year,
            createdAt: doc.createdAt
        };
    }
}
