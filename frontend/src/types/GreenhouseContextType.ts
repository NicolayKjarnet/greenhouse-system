import { Greenhouse } from './Greenhouse';

export type GreenhouseContextType = {
    greenhouseArray: Greenhouse[];
    getAllGreenhouses: () => void;
    getGreenhouseById: (greenhouseId: number) => void;
}