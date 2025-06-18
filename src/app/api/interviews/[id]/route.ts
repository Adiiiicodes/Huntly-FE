import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src/data/interviews.json');

// Helper function to read data
const readData = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { interviews: [] };
  }
};

// GET single interview
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = readData();
  const interview = data.interviews.find((i: any) => i.id === params.id);
  
  if (interview) {
    return NextResponse.json(interview);
  }
  
  return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
} 