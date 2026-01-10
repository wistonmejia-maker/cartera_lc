
import { ExcelParser } from './src/services/etl/ExcelParser';
import path from 'path';

async function test() {
    const parser = new ExcelParser();
    const sampleFile = path.resolve('C:\\Users\\ATC\\Documents\\Proyectos ATC\\cartera-lc\\sample-data\\ciudad-jardin\\reportes-cartera\\FACT ENE-26.xls');

    console.log(`Testing parser with file: ${sampleFile}`);

    try {
        const results = await parser.parse(sampleFile);
        console.log('Successfully parsed data!');
        console.log(`Total units found: ${results.length}`);
        console.log('Sample unit:', JSON.stringify(results[0], null, 2));

        if (results.length === 0) {
            console.error("Warning: No units found. Check parser logic.");
        }
    } catch (error) {
        console.error('Error parsing file:', error);
    }
}

test();
