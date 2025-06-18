export interface InterviewSession {
  id: string;
  candidateId: string;
  recruiterId: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  completedAt?: Date;
  transcript?: string;
}

class InterviewDB {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'interviewDB';
  private readonly STORE_NAME = 'interviews';

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('candidateId', 'candidateId', { unique: false });
          store.createIndex('recruiterId', 'recruiterId', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  private getStore(mode: IDBTransactionMode = 'readonly') {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(this.STORE_NAME, mode);
    return transaction.objectStore(this.STORE_NAME);
  }

  async createInterview(candidateId: string, recruiterId: string): Promise<string> {
    await this.init();
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const interview: InterviewSession = {
      id,
      candidateId,
      recruiterId,
      status: 'pending',
      createdAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const request = this.getStore('readwrite').add(interview);
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getInterview(id: string): Promise<InterviewSession | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const request = this.getStore().get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateInterview(
    id: string,
    status: InterviewSession['status'],
    transcript?: string
  ): Promise<void> {
    await this.init();
    const interview = await this.getInterview(id);
    if (!interview) throw new Error('Interview not found');

    const updateData: Partial<InterviewSession> = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    if (transcript) {
      updateData.transcript = transcript;
    }

    return new Promise((resolve, reject) => {
      const request = this.getStore('readwrite').put({
        ...interview,
        ...updateData,
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUserInterviews(
    userId: string,
    role: 'candidate' | 'recruiter'
  ): Promise<InterviewSession[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const index = this.getStore().index(role === 'candidate' ? 'candidateId' : 'recruiterId');
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const interviewDB = new InterviewDB(); 