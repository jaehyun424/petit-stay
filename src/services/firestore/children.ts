// ============================================
// Petit Stay - Children Firestore Service
// ============================================

import {
    collection, doc, getDocs, setDoc, updateDoc, deleteDoc,
    query, where,
    db, COLLECTIONS, convertTimestamps,
} from './helpers';
import type { Child } from '../../types';

export const childrenService = {
    async getParentChildren(parentId: string): Promise<Child[]> {
        const q = query(
            collection(db, COLLECTIONS.children),
            where('parentId', '==', parentId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...convertTimestamps(doc.data()),
        })) as Child[];
    },

    async addChild(child: Omit<Child, 'id'>): Promise<string> {
        const childRef = doc(collection(db, COLLECTIONS.children));
        await setDoc(childRef, child);
        return childRef.id;
    },

    async updateChild(childId: string, data: Partial<Child>): Promise<void> {
        await updateDoc(doc(db, COLLECTIONS.children, childId), data);
    },

    async deleteChild(childId: string): Promise<void> {
        await deleteDoc(doc(db, COLLECTIONS.children, childId));
    },
};
