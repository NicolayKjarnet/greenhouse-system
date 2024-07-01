import { createContext, FC, ReactNode, useEffect, useState } from "react";
import { Greenhouse, GreenhouseContextType } from "../types";
import GreenhouseService from "../services/GreenhouseService";

export const GreenhouseContext = createContext<GreenhouseContextType>({
  greenhouseArray: [],
  getAllGreenhouses: () => {},
  getGreenhouseById: () => {}
});

export const GreenhouseProvider: FC<{children: ReactNode}> = ({ children }) => {
  const [greenhouseArray, setGreenhouseArray] = useState<Greenhouse[]>([]);

  useEffect(() => {
    getAllGreenhouses();
  }, []);

  const getAllGreenhouses = async () => {
    try {
      const allGreenhouses = await GreenhouseService.getAllGreenhouses();
      setGreenhouseArray(allGreenhouses || []);
      return allGreenhouses;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  const getGreenhouseById = async (greenhouseId: number) => {
    const greenhouse = await GreenhouseService.getGreenhouseById(greenhouseId);
    console.log(greenhouse);
    return greenhouse;
  };

  return (
    <GreenhouseContext.Provider value={{ greenhouseArray, getAllGreenhouses, getGreenhouseById }}>
      {children}
    </GreenhouseContext.Provider>
  );
};