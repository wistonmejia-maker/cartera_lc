
import { spawn } from 'child_process';
import path from 'path';

export interface ETLResult {
    unit_number: string;
    owner_name: string;
    financials: {
        prev_balance: number;
        current_fee: number;
        interest: number;
        adjustments: number;
        total_debt: number;
    };
    analysis: {
        overdue_amount: number;
        months_overdue: number;
        risk_status: string;
        action_class: string;
    };
}

export class ExcelParser {
    async parse(filePath: string): Promise<ETLResult[]> {
        return new Promise((resolve, reject) => {
            // Assuming api root is the cwd when running locally
            const pythonScript = path.resolve(process.cwd(), 'src/python/etl_engine.py');
            console.log(`Executing python script at: ${pythonScript}`);
            const pythonProcess = spawn('python', [pythonScript, filePath]);

            let dataString = '';
            let errorString = '';

            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python process exited with code ${code}: ${errorString}`));
                    return;
                }

                try {
                    const results = JSON.parse(dataString);
                    if (results.error) {
                        reject(new Error(results.error));
                    } else {
                        resolve(results);
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse Python output: ${dataString}`));
                }
            });
        });
    }
}
