import axios from 'axios';
import { Greenhouse } from '../types/Greenhouse';

const GreenhouseService = (() => {
    const greenhouseEndpoints = {
        greenhouse: 'http://localhost:3000/greenhouses',
    };

    const getAllGreenhouses = async () => {
        try {
            const result = await axios.get(greenhouseEndpoints.greenhouse);
            console.log(result.data);
            return result.data;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to get all greenhouses.');
        }
    };

    const getGreenhouseById = async (greenhouseId: number) => {
        try {
            const result = await axios.get(`${greenhouseEndpoints.greenhouse}/${greenhouseId}`);
            console.log(result.data);
            return result.data;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to get greenhouse by id: ${greenhouseId}.`);
        }
    };

    const postGreenhouse = async (greenhouse: Greenhouse) => {
        try {
            const result = await axios.post(greenhouseEndpoints.greenhouse, greenhouse);
            console.log(result);
        } catch (error) {
            console.error(error);
            throw new Error('Failed to create greenhouse.');
        }
    };

    const putGreenhouse = async (greenhouse: Greenhouse) => {
        try {
            const result = await axios.put(
                `${greenhouseEndpoints.greenhouse}/${greenhouse._id}`,
                greenhouse,
            );
            return result.data;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to update greenhouse with id: ${greenhouse._id}.`);
        }
    };

    const deleteGreenhouse = async (greenhouse: Greenhouse) => {
        try {
            const result = await axios.delete(
                `${greenhouseEndpoints.greenhouse}/${greenhouse._id}`,
            );
            return result;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to delete greenhouse with id: ${greenhouse._id}.`);
        }
    };

    const deleteAllGreenhouses = async () => {
        try {
            const result = await axios.delete(`${greenhouseEndpoints.greenhouse}`);
            return result;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to delete all greenhouses.');
        }
    };

    return {
        getAllGreenhouses,
        getGreenhouseById,
        postGreenhouse,
        putGreenhouse,
        deleteGreenhouse,
        deleteAllGreenhouses,
    };
})();

export default GreenhouseService;
