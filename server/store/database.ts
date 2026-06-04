// server/store/database.ts

import { DualStore, type StoreUser } from "./dual-store.js";
import type { StorePayload } from "./collections.js";

export type { StoreUser };
export { DualStore, DualStoreError } from "./dual-store.js";

export class Database {
  private store!: DualStore;
  private ready: Promise<void>;

  agencies: StorePayload["agencies"] = [];
  roles: StorePayload["roles"] = [];
  permissions: StorePayload["permissions"] = [];
  systemParameters: StorePayload["systemParameters"] = [];
  categories: StorePayload["categories"] = [];
  documentTypes: StorePayload["documentTypes"] = [];
  users: StoreUser[] = [];
  folders: Record<string, unknown>[] = [];
  documents: Record<string, unknown>[] = [];
  accessRequests: Record<string, unknown>[] = [];
  activityLogs: Record<string, unknown>[] = [];
  professionalCards: Record<string, unknown>[] = [];
  chatMessages: Record<string, unknown>[] = [];
  leaveRequests: Record<string, unknown>[] = [];
  recruitmentJobs: Record<string, unknown>[] = [];
  recruitmentApplications: Record<string, unknown>[] = [];
  financeTransactions: Record<string, unknown>[] = [];
  userNotifications: Record<string, unknown>[] = [];

  constructor(private readonly injectedStore?: DualStore) {
    this.ready = this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    this.store = this.injectedStore ?? (await DualStore.create());
    this.bindCollections(this.store.getCache());
    await this.store.init();
  }

  async waitReady(): Promise<void> {
    await this.ready;
  }

  get dualStore(): DualStore {
    return this.store;
  }

  private bindCollections(cache: StorePayload): void {
    this.agencies = cache.agencies as Database["agencies"];
    this.roles = cache.roles as Database["roles"];
    this.permissions = cache.permissions;
    this.systemParameters = cache.systemParameters as Database["systemParameters"];
    this.categories = cache.categories as Database["categories"];
    this.documentTypes = cache.documentTypes as Database["documentTypes"];
    this.users = cache.users as StoreUser[];
    this.folders = cache.folders;
    this.documents = cache.documents;
    this.accessRequests = cache.accessRequests;
    this.activityLogs = cache.activityLogs;
    this.professionalCards = cache.professionalCards;
    this.chatMessages = cache.chatMessages;
    this.leaveRequests = cache.leaveRequests;
    this.recruitmentJobs = cache.recruitmentJobs;
    this.recruitmentApplications = cache.recruitmentApplications;
    this.financeTransactions = cache.financeTransactions;
    this.userNotifications = cache.userNotifications;
  }

  toPayload(): StorePayload {
    return this.store.getCache();
  }

  scheduleSave(): void {
    this.store.scheduleSave();
  }

  async saveNow(): Promise<void> {
    await this.store.saveNow();
  }

  async initDualStorage(): Promise<void> {
    await this.waitReady();
  }

  resetDynamicData(currentUserId: string): void {
    this.folders = [];
    this.documents = [];
    this.accessRequests = [];
    this.activityLogs = [];
    this.professionalCards = [];
    this.chatMessages = [
      {
        id: "m-reset-" + Date.now(),
        userId: currentUserId,
        sessionId: "sess-default",
        role: "model",
        message:
          "Bonjour ! Je suis ARHI (Archives RH Intelligent), votre conseiller IA AFG BANK. Toutes les données d'archives ont été réinitialisées à zéro. Comment puis-je vous aider aujourd'hui ?",
        sentAt: new Date().toISOString(),
      },
    ];
    this.leaveRequests = [];
    this.recruitmentJobs = [];
    this.recruitmentApplications = [];
    this.financeTransactions = [];
    this.userNotifications = [];
    this.scheduleSave();
  }

  static async create(): Promise<Database> {
    const store = await DualStore.create();
    const db = new Database(store);
    await db.waitReady();
    return db;
  }
}
