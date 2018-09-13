import { Portfolio } from '../models/Portfolio';

export interface PortfolioRepository {

  getByEmail(email: string): Promise<Portfolio[]>;

  getByEmailAndId(email: string, id: number): Promise<Portfolio>;

  save(model: Portfolio): Promise<void>;

}
