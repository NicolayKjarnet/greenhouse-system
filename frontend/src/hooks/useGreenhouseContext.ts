import { GreenhouseContext } from '../contexts/GreenhouseContext';
import { useContext } from 'react';

export const useGreenhouseContext = () => {
    const context = useContext(GreenhouseContext);
    return context;
};
