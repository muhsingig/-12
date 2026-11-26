import { createContext, useContext } from 'react';
export const LampContext = createContext({ kelvin: 2700, setKelvin: () => {}, lightsOff: false, setLightsOff: () => {} });
export const useLamp = () => useContext(LampContext);
