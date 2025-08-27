import { CountryProcessor } from '../interfaces/CountryProcessor';
import { PeProcessor } from '../processors/PeProcessor';
import { ClProcessor } from '../processors/ClProcessor';

export class CountryProcessorFactory {
  static create(countryISO: string): CountryProcessor {
    switch (countryISO.toUpperCase()) {
      case 'PE':
        return new PeProcessor();
      case 'CL':
        return new ClProcessor();
      default:
        throw new Error(`Unsupported country: ${countryISO}`);
    }
  }
}
